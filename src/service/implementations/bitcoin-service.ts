import { RedisQueueService } from "../redis-queue-service";
import redis, { RedisClient } from "redis";
import { CommunicationProtocol } from "../../common/types";
import { request } from "https";
import logger from "../../common/logger";

function getBitcoinData(): Promise<any> {
  return new Promise((response, reject) => {
    request("https://api.coingecko.com/api/v3/coins/bitcoin", (res) => {
      let data = "";

      res.on("data", (chunk) => {
        data += chunk.toString();
      });

      res.on("end", () => {
        response(JSON.parse(data));
      });
    }).end();
  });
}

function bootstrap() {
  const redisClient: RedisClient = redis.createClient({
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
  });

  const service = new RedisQueueService(
    {
      name: "bitcoin-service",
      protocol: CommunicationProtocol.REDIS_QUEUE,
      onMessageReceived: async (msg) => {
        logger.info(
          `[bitcoin-service] received event ${
            msg.event
          } with payload ${JSON.stringify(msg.payload)}`
        );

        switch (msg.event) {
          case "/api":
          case "/api/": {
            return await getBitcoinData().then((data) => {
              return { priceInUSD: data.market_data.current_price.usd };
            });
          }
          default: {
            return { msg: `Operation is not supported.` };
          }
        }
      },
    },
    redisClient
  );

  service.bootup();
}

bootstrap();
