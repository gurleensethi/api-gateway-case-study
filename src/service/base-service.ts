import { RedisClient } from "redis";
import logger from "../common/logger";
import { Application } from "express";
import { CommunicationProtocol, ServiceConfig } from "../common/types";
import express from "express";

export class BaseService {
  private heartbeatInterval: number | undefined;
  private isServiceRunning: boolean = false;
  private redisServiceMetadata: string[] = [];
  private expressApp?: Application;

  constructor(private config: ServiceConfig, private redisClient: RedisClient) {
    this.generateServiceMetadataForRedis();
    this.init();
  }

  private generateServiceMetadataForRedis() {
    this.redisServiceMetadata = Object.keys(this.config).reduce<string[]>(
      (prev: string[], curr: string) => {
        let key = curr as keyof ServiceConfig;
        const value = this.config[key];

        if (
          typeof value === "string" ||
          typeof value === "boolean" ||
          typeof value === "number" ||
          typeof value === "bigint" ||
          typeof value === "symbol"
        ) {
          return [...prev, key, value];
        }

        return prev;
      },
      []
    );
  }

  private async init() {
    switch (this.config.protocol) {
      case CommunicationProtocol.HTTP: {
        const { port, configApp, name } = this.config;

        this.expressApp = express();
        await this.config.configApp(this.expressApp);
        this.expressApp.listen(Number(this.config.port), () => {
          logger.info(`[${name}] is listening via 'http' on port ${port}...`);
        });
        break;
      }
      case CommunicationProtocol.REDIS_QUEUE: {
      }
    }
  }

  /**
   * Heartbeat is implemented using redis's
   * key expiration feature, the service updates
   * the key data on an interval, and puts an
   * expiry for the key.
   */
  private async heartbeat() {
    this.redisClient.hset(
      `service:${this.config.name}`,
      ...this.redisServiceMetadata,
      () => {
        this.redisClient.expire(`service:${this.config.name}`, 12);
      }
    );
  }

  public bootup() {
    if (!this.isServiceRunning) {
      logger.info(`[${this.config.name}] starting service...`);
      this.heartbeatInterval = setInterval(() => {
        this.heartbeat();
      }, 10000) as any;

      // Trigger Initially
      this.heartbeat();

      this.isServiceRunning = true;
    }
  }

  public shutdown() {
    if (this.isServiceRunning) {
      this.isServiceRunning = false;
      clearInterval(this.heartbeatInterval);
    }
  }
}
