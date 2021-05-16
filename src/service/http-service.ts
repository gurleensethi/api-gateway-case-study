import express from "express";
import { RedisClient } from "redis";
import logger from "../common/logger";
import { HttpServiceConfig } from "../common/types";
import { BaseServiceTemplate } from "./base-service-template";

export class HttpService extends BaseServiceTemplate<HttpServiceConfig> {
  constructor(config: HttpServiceConfig, redisClient: RedisClient) {
    super(config, redisClient);
  }

  public async initService(config: HttpServiceConfig) {
    const { port, configApp, name } = config;
    const expressApp = express();
    await config.configApp(expressApp);
    expressApp.listen(Number(config.port), () => {
      logger.info(`[${name}] is listening via 'http' on port ${port}...`);
    });
  }
}
