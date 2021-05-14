import { config } from "dotenv";
import express from "express";
import logger from "../common/logger";
import { Gateway } from "./gateway";
import redis, { RedisClient } from "redis";

// Load environment variables from ".env"
config();

async function bootstrap() {
  logger.info("Creating redis client...");

  const redisClient: RedisClient = redis.createClient({
    host: "localhost",
    port: 6379,
  });
  const gateway = new Gateway(redisClient);
  const app = express();
  const httpPort = process.env.HTTP_PORT;

  // Direct all requests to gateway
  app.use((req, res) => {
    gateway.handleRequest(req, res);
  });

  app.listen(httpPort, () => {
    logger.info(`Application listening on port ${httpPort}...`);
  });
}

bootstrap().then(() => {
  import("../service/implementations/hello-service");
});
