import { Request, Response } from "express";
import { RedisClient } from "redis";
import { promisify } from "util";
import { CommunicationProtocol, ServiceMetadata } from "../common/types";
import { request } from "http";
import logger from "../common/logger";

export class Gateway {
  constructor(private redisClient: RedisClient) {}

  private async sendToService(
    req: Request,
    res: Response,
    serviceMetadata: ServiceMetadata
  ) {
    switch (serviceMetadata.protocol) {
      case CommunicationProtocol.HTTP: {
        logger.info(
          `[gateway] sending request to ${serviceMetadata.name} via ${serviceMetadata.protocol}...`
        );

        delete req.headers["content-length"];

        const httpRequest = request(
          {
            method: req.method,
            host: serviceMetadata.host,
            port: serviceMetadata.port,
            protocol: "http:",
            path: req.url.replace(`/${serviceMetadata.name}`, ""),
            headers: req.headers,
          },
          (httpResponse) => {
            httpResponse.pipe(res);
          }
        );

        httpRequest.write(Buffer.from(JSON.stringify(req.body)));
        httpRequest.end();
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
