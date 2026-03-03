import {Queue} from "bullmq";
import dotenv from "dotenv"
dotenv.config()

const redisuri = process.env.REDIS_URL;

if(!redisuri) {
    throw new Error("REDIS_URL is not defined in environment variables");
}


export const agentQueue = new Queue("AgentJobs",{
    connection: {
    url: redisuri,
  },
    defaultJobOptions:{
        attempts:3,
        backoff:{
            type:"exponential",
            delay:5000
        },
        removeOnComplete:100,
        removeOnFail:1000,
    }
})

