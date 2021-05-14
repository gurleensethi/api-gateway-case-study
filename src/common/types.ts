export enum CommunicationProtocol {
  HTTP = "http",
}

export type ServiceMetadata = {
  name: string;
  protocol: CommunicationProtocol.HTTP;
};
