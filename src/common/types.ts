import { Application } from "express";

export enum CommunicationProtocol {
  HTTP = "http",
  REDIS_QUEUE = "redis_queue",
}

export type ServiceMetadata =
  | {
      name: string;
      protocol: CommunicationProtocol.HTTP;
      host: string;
      port: string;
    }
  | {
      name: string;
      protocol: CommunicationProtocol.REDIS_QUEUE;
    };

export type ServiceConfig =
  | (ServiceMetadata & {
      protocol: CommunicationProtocol.HTTP;
      configApp: (app: Application) => Promise<void> | void;
    })
  | (ServiceMetadata & { protocol: CommunicationProtocol.REDIS_QUEUE });
