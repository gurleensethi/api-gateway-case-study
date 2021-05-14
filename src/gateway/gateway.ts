import { Request, Response } from "express";
import { RedisClient } from "redis";
import { promisify } from "util";
import { ServiceMetadata } from "../common/types";

export class Gateway {
  constructor(private redisClient: RedisClient) {}

  async handleRequest(req: Request, res: Response) {
    const { url } = req;

    if (!url.startsWith("/api") || url.indexOf("/", 4) === -1) {
      return res.status(400).json({
        msg: "Invalid request. Format: /api/<service-name>/<something>",
      });
    }

    // Extract service name and path being accessed
    const urlSplits = url.split("/");
    const serviceName = urlSplits[2];
    const accessPath = urlSplits.slice(3).join("/");

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

    res.json({ service: serviceName, path: accessPath });
  }
}
