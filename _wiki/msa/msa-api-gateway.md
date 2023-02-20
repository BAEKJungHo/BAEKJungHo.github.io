---
layout  : wiki
title   : Gateway in Microservices
summary : 
date    : 2023-01-28 15:54:32 +0900
updated : 2023-01-28 20:15:24 +0900
tag     : msa
toc     : true
comment : true
public  : true
parent  : [[/msa]]
latex   : true
---
* TOC
{:toc}

## Gateway

In Microservice Architecture (MSA), a gateway is a single entry point for all incoming requests to the microservices. It acts as a reverse proxy, routing requests from clients to the appropriate microservice based on the request URL. The gateway may also perform __additional tasks such as authentication, rate limiting, logging, and caching__. The use of a gateway can provide several benefits, including reducing the load on individual microservices, improving security, and providing a unified interface for clients.

API Gateway 는 Facade 패턴과 같이 뒤에 있는 복잡한 서비스를 심플한 인터페이스로 제공하는 Edge Server 로 모든 API 의 Endpoint 를 받아서 내부의 마이크로서비스로 라우팅해주는 역할을 한다.

## Responsibility of Gateway

- Authentication
- Monitoring
- Logging
- Flow Control
- Message Change
- Orchestration

### Authentication

서버간 API 통신의 경우에는 __Api Key__ 를 사용할 수 있다.

API keys can be used for API __communication between servers in a microservice application__ that uses an API gateway. An API key is a unique identifier that is used to track and control access to the API. When a client wants to access the API, it needs to provide the API key, which the API gateway will use to verify the identity of the client and determine if it has permission to access the API.

Here's an example:

- The client generates an API key and sends a request to access the API.
- The API gateway receives the request and checks if the API key is valid.
- If the API key is valid, the API gateway routes the request to the appropriate microservice.
- The microservice processes the request and sends a response back to the API gateway.
- The API gateway returns the response to the client.
- In this example, the API key is used as a means of authentication and authorization for accessing the API. By requiring clients to provide an API key, the API gateway can control access to the API and ensure that only authorized clients can access it.

다수의 클라이언트와 서버간 API 통신의 경우에는 __JWT 와 같은 Token based Authentication__ 를 사용할 수 있다.

### Logging

- [Distributed Tracing](https://baekjungho.github.io/wiki/msa/msa-distributed-tracing/)

### Metering & Charging

API 의 호출량을 모니터링 해서 호출 Amount 기반으로 API 호출 횟수를 통제하거나 또는 유료 API 의 경우에는 과금을 하는 등의 정책에 필요하다.

- [Youtube Data API - Quota usage](https://developers.google.com/youtube/v3/getting-started?hl=ko#quota)

Metering and charging in an API gateway refers to the process of tracking and billing for the usage of an API. This is commonly used in a business context where API providers want to monetize their API and charge their clients for the usage of the API.

Here are some common examples of metering and charging in an API gateway:

- __Usage tracking__: The API gateway tracks the number of API requests made by each client, the amount of data transferred, and the amount of time spent processing requests. This information can be used to generate usage reports and bill clients for their API usage.
- __Billing models__: API providers can choose from different billing models, such as pay-per-request, pay-per-usage, or a monthly subscription model. The API gateway can be configured to implement the selected billing model and generate invoices for clients based on their API usage.
- __Quotas__: The API gateway can enforce usage quotas for each client, limiting the number of API requests that can be made in a given time period. This helps API providers control the cost of their API and avoid overcharging their clients.
- __Usage analysis__: The API gateway can provide usage analysis and reporting tools to help API providers understand the usage patterns of their API and identify opportunities for optimization and cost savings.

Metering and charging in an API gateway is an important aspect of API management and helps API providers to monetize their API and generate revenue from their API offerings.

### Flow Control 

Flow Control 은 클라이언트로부터 들어온 메시지 흐름을 바꾸는 것을 의미한다.  클라이언트의 Locale 에 따라서 미국, 독일, 한국 등의 서비스로 라우팅 하는 로직을 구현할 수 있다.

Flow control in an API gateway refers to the process of managing and regulating the flow of incoming requests to the API. This includes tasks such as rate limiting, request prioritization, and traffic management. The goal of flow control is to ensure that the API is performing optimally and to prevent overloading of the underlying microservices.

Here are some common examples of flow control in an API gateway:

- __Rate limiting__: The API gateway can be configured to limit the number of requests that a client can make in a given time period. This helps to prevent overloading of the microservices and protect against denial-of-service (DoS) attacks.
- __Request prioritization__: The API gateway can prioritize requests based on various criteria such as the importance of the request, the client's subscription level, or the time-sensitivity of the request.
- __Traffic management__: The API gateway can distribute incoming requests to different microservices based on the load on each microservice. This helps to balance the workload and improve the overall performance of the API.
- __Request filtering__: The API gateway can be configured to filter incoming requests based on specific criteria, such as the request method, the client's IP address, or the request payload. This helps to protect the underlying microservices from malicious or invalid requests.

Overall, flow control in an API gateway is an important aspect of API management and helps to ensure the stability and performance of the API.

## Spring Cloud Netflix

- [Spring Cloud Netflix - Documentation](https://cloud.spring.io/spring-cloud-netflix/reference/html/)
- [Netflix zuul](https://github.com/Netflix/zuul/wiki)

## Links

- [Microservice Architecture](http://microservices.io/patterns/microservices.html)
- [How To Implement Spring Cloud Gateway In Microservices](https://javatechonline.com/how-to-implement-spring-cloud-gateway-in-microservices/)
- [Netfilx Architecture](https://netflixtechblog.com/optimizing-the-netflix-api-5c9ac715cf19)
- [InfoQ Architecture](http://www.infoq.com/articles/microservices-intro)
- [Micro Services: Java, the Unix Way - ThoughtWorks](https://www.infoq.com/presentations/Micro-Services/)
- [MSA 아키텍쳐 구현을 위한 API 게이트웨이의 이해](https://bcho.tistory.com/1005)
- [API 게이트 웨이 & Google Cloud Endpoints](https://bcho.tistory.com/1365)
- [Dzone Microservice Architecture](http://java.dzone.com/articles/microservice-architecture)
- [Node.js 로 Microservice 만들기](https://plainoldobjects.com/presentations/nodejs-the-good-parts-a-skeptics-view/)
- [오늘의집 API Gateway](https://www.bucketplace.com/post/2021-12-30-msa-phase-1-api-gateway/)
- [마이크로서비스 구축을 위한 API Gateway 패턴 사용하기](https://nginxstore.com/blog/api-gateway/%EB%A7%88%EC%9D%B4%ED%81%AC%EB%A1%9C%EC%84%9C%EB%B9%84%EC%8A%A4-%EA%B5%AC%EC%B6%95%EC%9D%84-%EC%9C%84%ED%95%9C-api-gateway-%ED%8C%A8%ED%84%B4-%EC%82%AC%EC%9A%A9%ED%95%98%EA%B8%B0/)
- [배민 API GATEWAY – spring cloud zuul 적용기](https://techblog.woowahan.com/2523/)

## References

- 마이크로서비스 인 액션 / 모건 브루스, 파울로 페레이라 저 / 위키북스