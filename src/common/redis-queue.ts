import { RedisClient } from "redis";
import * as uuid from "uuid";

export class RedisQueue {
  constructor(private redisClient: RedisClient) {}

  public async sendMessageSync(
    serviceName: string,
    data: object
  ): Promise<any> {
    return new Promise((res, rej) => {
      const key = uuid.v4();
      const queueName = `${serviceName}_queue`;
      const responseQueueName = `${serviceName}_queue_${key}`;

      this.redisClient.lpush(
        queueName,
        JSON.stringify({ key, payload: data }),
        () => {
          this.redisClient.blpop(responseQueueName, 5, (err, data) => {
            if (err || !data) {
              return rej(err);
            }
            res(JSON.parse(data[1]));
          });

          this.redisClient.del(responseQueueName);
        }
      );
    });
  }

  public async sendMessageWithKeyAsync(
    serviceName: string,
    key: string,
    data: object
  ) {
    this.redisClient.lpush(`${serviceName}_queue_${key}`, JSON.stringify(data));
  }

  public listen(
    serviceName: string,
    callback: (data: { key: string; payload: any }) => Promise<void>
  ) {
    const listenForData = () => {
      this.redisClient.blpop(`${serviceName}_queue`, 0, async (err, data) => {
        await callback(JSON.parse(data[1]));
        listenForData();
      });
    };

    listenForData();
  }
}
