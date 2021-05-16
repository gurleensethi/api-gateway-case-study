import { Request, Response } from "express";
import { RedisClient } from "redis";
import { promisify } from "util";
import { CommunicationProtocol, ServiceMetadata } from "../common/types";
import { request } from "http";
import logger from "../common/logger";
import { RedisQueue } from "../common/redis-queue";

export class Gateway {
  private redisQueue: RedisQueue;

  constructor(private redisClient: RedisClient) {
    this.redisQueue = new RedisQueue(redisClient);
  }

  private async sendToService(
    req: Request,
    res: Response,
    serviceMetadata: ServiceMetadata
  ) {
    logger.info(`Request received for service: '${serviceMetadata.name}'`);

    const path = req.url.replace(`/${serviceMetadata.name}`, "");

    switch (serviceMetadata.protocol) {
      case CommunicationProtocol.HTTP: {
        logger.info(
          `[gateway] sending request to ${serviceMetadata.name} via ${serviceMetadata.protocol}...`
        );

        delete req.headers["content-length"];

        const httpRequest = request(
          {
            path,
            method: req.method,
            host: serviceMetadata.host,
            port: serviceMetadata.port,
            protocol: "http:",
            headers: req.headers,
          },
          (httpResponse) => {
            httpResponse.pipe(res);
          }
        );

        httpRequest.write(Buffer.from(JSON.stringify(req.body)));
        httpRequest.end();
      }
      case CommunicationProtocol.REDIS_QUEUE: {
        this.redisQueue
          .sendMessageSync(serviceMetadata.name, {
            event: path,
            payload: req.body,
          })
          .then((data) => {
            res.json(data);
          })
          .catch(() => {
            res.status(400).json({ error: "Some error occurred!" });
          });
      }
    }
  }

  async handleRequest(req: Request, res: Response) {
    const { path } = req;

    if (!path.startsWith("/api") || path.indexOf("/", 4) === -1) {
      return res.status(400).json({
        msg: "Invalid request. Format: /api/<service-name>/<something>",
      });
    }

    // Extract service name and path being accessed
    const urlSplits = path.split("/");
    const serviceName = urlSplits[2];

    const asyncHGETALL = promisify(this.redisClient.hgetall).bind(
      this.redisClient
    );

    // Check if service exists in the global cache.
    const serviceMetadata: ServiceMetadata | undefined = (await asyncHGETALL(
      `service:${serviceName}`
    )) as ServiceMetadata;

    if (!serviceMetadata) {
      return res
        .status(400)
        .json({ msg: `No service found with name ${serviceName}!` });
    }

    this.sendToService(req, res, serviceMetadata);
  }
}
