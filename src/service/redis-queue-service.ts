import { RedisClient } from "redis";
import { RedisQueue } from "../common/redis-queue";
import { RedisQueueServiceConfig } from "../common/types";
import { BaseServiceTemplate } from "./base-service-template";

export class RedisQueueService extends BaseServiceTemplate<RedisQueueServiceConfig> {
  public initService(
    config: RedisQueueServiceConfig,
    redisClient: RedisClient
  ): void | Promise<void> {
    const resdisQueue = new RedisQueue(redisClient.duplicate());

    resdisQueue.listen(config.name, async ({ key, payload }) => {
      const response = await config.onMessageReceived(payload);
      resdisQueue.sendMessageWithKeyAsync(config.name, key, response);
    });
  }
}
