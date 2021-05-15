import { config } from "dotenv";
import { RedisClient } from "redis";
import { CommunicationProtocol } from "../../common/types";
import { BaseService } from "../base-service";
import redis from "redis";
import logger from "../../common/logger";
import bodyParser from "body-parser";
import { Application } from "express";

// Load environment variables from .env file.
config();

export async function bootstrap() {
  const httpPort = process.env.HELLO_SERVICE_HTTP_PORT;

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
      configApp: setUpExpressApp,
    },
    redisClient
  );

  service.bootup();
}

export function setUpExpressApp(app: Application) {
  app.use((req, _res, next) => {
    logger.info(`[hello-service] received a request '${req.url}'`);
    next();
  });
  app.use(bodyParser.json({}));
  app.use(bodyParser.urlencoded({ extended: true }));

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
}

bootstrap();
