import { RedisClient } from "redis";
import logger from "../common/logger";
import { ServiceMetadata } from "../common/types";

export class BaseService {
  private heartbeatInterval: number | undefined;
  private isServiceRunning: boolean = false;

  constructor(
    private config: ServiceMetadata,
    private redisClient: RedisClient
  ) {}

  /**
   * Heartbeat is implemented using redis's
   * key expiration feature, the service updates
   * the key data on an interval, and puts an
   * expiry for the key.
   */
  private async heartbeat() {
    this.redisClient.hset(
      `service:${this.config.name}`,
      "name",
      this.config.name,
      "protocol",
      this.config.protocol,
      "host",
      this.config.host,
      "port",
      this.config.port,
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
    }
  }

  public shutdown() {
    if (this.isServiceRunning) {
      clearInterval(this.heartbeatInterval);
    }
  }
}
