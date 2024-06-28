---
layout  : wiki
title   : RateLimit - 429 Too Many Requests
summary : 
date    : 2024-06-28 15:02:32 +0900
updated : 2024-06-28 15:12:24 +0900
tag     : api
toc     : true
comment : true
public  : true
parent  : [[/api]]
latex   : true
---
* TOC
{:toc}

## Too Many Requests

API 로 요청/명령을 과도하게 하는경우 '__429 Too Many Requests__' 또는 '__Limit Exceeded(한도 초과)__' 와 같은 응답을 받는 경우가 있다. 이 경우는 보통 API 에 RateLimit 이 걸려 있을 것이다.

서비스 애플리케이션 앞단에 Gateway 가 있는경우 보통 Gateway 를 거쳐 요청이 들어오는데, Gateway 에서는 API 별로 __RateLimit__ 을 걸어둘 수 있다.

[RateLimit](https://www.mimul.com/blog/about-rate-limit-algorithm/) 은 아래와 같은 이유로 인해 사용되곤 한다.

- 과도한 트래픽으로부터 서비스를 보호
- Resource 사용에 대한 공정성과 합리성 유도
- 트래픽 비용이 서비스 예산을 넘는 것을 방지
- Rate 에 대해 과금을 부과하는 Business Model 로 활용

RateLimit 은 Rule 에 따라 Gateway 에서 구현할 수도 있고, 서비스 애플리케이션에서 구현할 수도 있다.

차량 제어 서비스를 예로 들어보자. 앱에서 제어 요청을 과도하게 클릭하여 명령을 서버로 보내게 되는 경우, 서버는 Command API 별로 RateLimit 을 걸어둘 수 있다. (e.g VehicleId+CommandType 으로 RateLimit 을 걸 수 있음)

[RFC6585](https://datatracker.ietf.org/doc/html/rfc6585) 문서에 429 Too Many Requests 에 대한 예제가 나와있다.
응답 헤더에 __Retry-After__ 처럼, 다음 요청을 하기 까지 얼마나 기다려야 하는지를 명시할 수 있다.

```
HTTP/1.1 429 Too Many Requests
   Content-Type: text/html
   Retry-After: 3600

   <html>
      <head>
         <title>Too Many Requests</title>
      </head>
      <body>
         <h1>Too Many Requests</h1>
         <p>I only allow 50 requests per hour to this Web site per
            logged in user.  Try again soon.</p>
      </body>
   </html>
```

Responses with the 429 status code MUST NOT be stored by a cache.

그 외 아래와 같은 정보들을 응답 헤더에 포함할 수 있다.

- x-rate-limit-limit: 허용되는 요청 최대 수
- x-rate-limit-remaining: 남은 요청 수
- x-rate-limit-reset: 요청 최댓값이 재설정 될 때 까지의 시간

다양한 기업 사례:

- [Github](https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api?apiVersion=2022-11-28)
- [Twitter](https://developer.x.com/en/docs/twitter-api/rate-limits)
- [Facebook](https://developers.facebook.com/docs/graph-api/overview/rate-limiting/)

### RateLimit with Spring Boot

- [Annotation + AOP - Rate Limiting with Spring Boot](https://www.innoq.com/en/blog/2024/02/rate-limiting-with-spring-boot/)
- [spring-bucket4j](https://www.baeldung.com/spring-bucket4j)

## Open Sources

- [RateLimitJ](https://github.com/mokies/ratelimitj)
- [UberGo RateLimit](https://github.com/uber-go/ratelimit)




