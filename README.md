# api-gateway-case-study

An implementation of the concept of `API Gateway` in `Node.js`.

**⚠️ Note: Not to be used in production! This is just [me](https://github.com/gurleensethi) messing around with code.**

## Recommended reading on API Gateway

- [What does an API Gateway do?](https://www.redhat.com/en/topics/api/what-does-an-api-gateway-do)

- [Pattern: API Gateway](https://microservices.io/patterns/apigateway.html)

- [Nginx - API Gateway](https://www.nginx.com/learn/api-gateway/)

## Stack

- `Node.js` with `Typescript`
- `Redis`

## Gateway Features

There is no hard and fast rule for the features that an API Gateway should support.

- [`Routing`](#routing): The gateway routes api calls to the target service.

- [`Heartbeat`](#heartbeat): Services have a hearbeat mechanism to denote if they are still available.

- `Dynamic Service Registration`: Services can register themselves dynamically without the need of restarting gateway server itself.

## Routing

One benefit of an API Gateway is that the internal services can communicate with each other using any protocol, regarless of the protocol used by client to connect to the Gateway. The gateway can map the incoming request data to the protocol used by the service internally.

![gateway_communication_protocol](https://raw.githubusercontent.com/gurleensethi/api-gateway-case-study/main/images/gateway_communication_protocol.png)

Protocols used for routing (from gateway to service) in this case study:

- **http**

## Heartbeat

Hearbeat is the mechanism used by a system to constantly keep denoting at an interval that it is running and ready for use. If a heartbeat from a system is not detected then it is considered to be down.

I have implemented the heart beat using Redis's key expiration feature.

In this implementation, Services are responsible for mainting liveness on their own by constantly updating the expiration of service metadata in redis.

Services run the following redis commands at a fixed `interval`.

```redis
hset service:<service_name> name <service_name> protocol <service_protocol> [other metadata fields ...]

expire service:<service_name> <interval>
```

By doing this, if a service crashes its metadata will expire and be no longer available in redis, thus denoting that the service is not available anymore.

### Usage by Gateway

Whenever gateway receives a request (for example `/api/service-name/some-path`), it extracts the service name from the url path and checks if corresponding entry exists in redis, if the entry is not found, the service is considered not available.
