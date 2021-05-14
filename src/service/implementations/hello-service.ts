import { config } from "dotenv";
import { RedisClient } from "redis";
import { CommunicationProtocol } from "../../common/types";
import { BaseService } from "../base-service";
import redis from "redis";

// Load environment variables from .env file.
config();

export async function bootstrap() {
  const redisClient: RedisClient = redis.createClient({
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
  });

  const service = new BaseService(
    { name: "hello-service", protocol: CommunicationProtocol.HTTP },
    redisClient
  );

  service.bootup();
}

bootstrap();
