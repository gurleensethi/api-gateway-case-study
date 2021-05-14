export enum CommunicationProtocol {
  HTTP = "http",
}

export type ServiceMetadata = {
  name: string;
  protocol: CommunicationProtocol.HTTP;
  host: string;
  port: string;
};
