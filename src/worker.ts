import { Job, Worker } from "bullmq";
import { agentQueue } from "./queue.js";
import { prisma } from "./lib/prisma.js";
import { buildAgentPrompt } from "./lib/agents/prompts/index.js";
import { runAgent } from "./lib/agents/agentHandler.js";
import type { ResolvedPipelineStep } from "./lib/agents/types.js";

const redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
  throw new Error("REDIS_URL missing");
}

type RunStepPayload = {
  taskId: string;
  taskResultId: string;
  stepIndex: number;
  pipeline: ResolvedPipelineStep[];
};

const worker = new Worker(
  "AgentJobs",
  async (job: Job<RunStepPayload>) => {
    const { taskId, taskResultId, stepIndex, pipeline } = job.data;

    // 🔒 Lock
    const lock = await prisma.taskResult.updateMany({
      where: {
        id: taskResultId,
        status: "pending",
      },
      data: {
        status: "processing",
      },
    });

    if (lock.count === 0) return;

    
    let input: any = null;

    if (stepIndex === 0) {
      const task = await prisma.task.findUnique({ where: { id: taskId } });
      input = task?.payload;
    } else {
      const prev = await prisma.taskResult.findFirst({
        where: { taskId, order: stepIndex }, 
      });
      input = prev?.output ?? prev?.contentId;
    }

    const stepSpec = pipeline[stepIndex];
    if (!stepSpec) {
      throw new Error("Invalid pipeline step");
    }

    const promptForGemini = buildAgentPrompt({
      stepType: stepSpec.type,
      agentId: stepSpec.agentId,
      input,
      options: stepSpec.options,
    });

    try {
      const agentOutput = await runAgent(
        stepSpec.agentId,
        promptForGemini,
        stepSpec.options
      );

      const content = await prisma.content.create({
        data: {
          body: agentOutput.text,
          source: "agent",
          metadata: {
            type: stepSpec.type,
            agentId: stepSpec.agentId,
            model: agentOutput.model,
            usage: agentOutput.usage ?? null,
          },
        },
      });

      await prisma.taskResult.update({
        where: { id: taskResultId },
        data: {
          status: "completed",
          output: { text: agentOutput.text },
          model: agentOutput.model,
          promptTokens: agentOutput.usage?.promptTokens ?? null,
          completionTokens: agentOutput.usage?.completionTokens ?? null,
          totalTokens: agentOutput.usage?.totalTokens ?? null,
          contentId: content.id,
        },
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error";

      await prisma.taskResult.update({
        where: { id: taskResultId },
        data: {
          status: "failed",
          errorMessage,
        },
      });

      await prisma.task.update({
        where: { id: taskId },
        data: { status: "failed" },
      });

      throw err;
    }

    // 🔁 Next Step
    const nextIndex = stepIndex + 1;

    if (pipeline[nextIndex]) {
      const nextTR = await prisma.taskResult.findFirst({
        where: { taskId, order: nextIndex + 1 },
      });

      const nextTaskResult =
        nextTR ??
        (await prisma.taskResult.create({
          data: {
            taskId,
            agentId: pipeline[nextIndex].agentId,
            type: pipeline[nextIndex].type,
            status: "pending",
            order: nextIndex + 1,
          },
        }));

      await agentQueue.add("run-step", {
        taskId,
        taskResultId: nextTaskResult.id,
        stepIndex: nextIndex,
        pipeline,
      });

      await worker.resume();
    } else {
      await prisma.task.update({
        where: { id: taskId },
        data: { status: "completed" },
      });

      const usageAgg = await prisma.taskResult.aggregate({
        where: { taskId },
        _sum: { totalTokens: true },
      });

      const totalTokensUsed = usageAgg._sum.totalTokens ?? 0;

      const task = await prisma.task.findUnique({ where: { id: taskId } });

      if (!task?.billed && totalTokensUsed > 0) {
        await prisma.task.update({
          where: { id: taskId },
          data: {
            billed: true,
            user: {
              update: {
                credits: {
                  decrement: totalTokensUsed,
                },
              },
            },
          },
        });
      }
    }
  },
  {
    connection: { url: redisUrl },

    concurrency: 1, // avoid multiple polling loops

    limiter: {
      max: 5,
      duration: 1000,
    },

    autorun: false, 
  }
);

await worker.run();

worker.on("drained", async () => {
  console.log("[worker] queue empty → pausing");
  await worker.pause();
});

worker.on("completed", (job) => {
  console.log(`[worker] job ${job.id} completed`);
});

worker.on("failed", (job, err) => {
  console.error(`[worker] job ${job?.id} failed:`, err);
});

console.log("[worker] started");
