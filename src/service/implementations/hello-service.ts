import { config } from "dotenv";
import { RedisClient } from "redis";
import { CommunicationProtocol } from "../../common/types";
import { BaseService } from "../base-service";
import redis from "redis";
import express from "express";
import logger from "../../common/logger";
import bodyParser from "body-parser";

// Load environment variables from .env file.
config();

export async function bootstrap() {
  // Setup http server
  const app = express();
  app.use((req, res, next) => {
    logger.info(`[hello-service] received a request '${req.url}'`);
    next();
  });
  app.use(bodyParser.json({}));
  app.use(bodyParser.urlencoded({ extended: true }));
  const httpPort = Number(process.env.HELLO_SERVICE_HTTP_PORT);

  app.use((req, res) => {
    const { url, method, query, params, headers, body, path } = req;

    res.status(200).json({
      message: "Hello from hello-service",
      requestDetails: {
        url,
        path,
        method,
        query,
        params,
        headers,
        body,
      },
    });
  });

  app.listen(httpPort, () => {
    logger.info(`[hello-service] Listening on port ${httpPort}...`);
  });

  // Setup service
  const redisClient: RedisClient = redis.createClient({
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
  });

  const service = new BaseService(
    {
      name: "hello-service",
      protocol: CommunicationProtocol.HTTP,
      host: "localhost",
      port: String(httpPort),
    },
    redisClient
  );

  service.bootup();
}

bootstrap();
