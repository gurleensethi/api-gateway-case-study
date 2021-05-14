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

- `Routing`: The gateway routes api calls to the target service.

- `Heartbeat`: Services have a hearbeat mechanism to denote if they are still available.

- `Dynamic Service Registration`: Services can register themselves dynamicall without the need of restarting gateway server itself.
