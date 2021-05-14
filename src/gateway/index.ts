import { config } from "dotenv";
import express from "express";
import logger from "../common/logger";
import { Gateway } from "./gateway";
import redis, { RedisClient } from "redis";
import bodyParser from "body-parser";

// Load environment variables from ".env"
config();

async function bootstrap() {
  logger.info("Creating redis client...");

  const redisClient: RedisClient = redis.createClient({
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
  });
  const gateway = new Gateway(redisClient);
  const app = express();
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());
  const httpPort = process.env.HTTP_PORT;

  // Direct all requests to gateway
  app.use((req, res) => {
    gateway.handleRequest(req, res);
  });

  app.listen(httpPort, () => {
    logger.info(`Application listening on port ${httpPort}...`);
  });
}

bootstrap();
