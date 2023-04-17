---
layout  : wiki
title   : Jakarta and RFC7807 with Spring Boot 3.0+ 
summary : 
date    : 2023-04-15 09:28:32 +0900
updated : 2023-04-15 12:15:24 +0900
tag     : spring
toc     : true
comment : true
public  : true
parent  : [[/spring]]
latex   : true
---
* TOC
{:toc}

## Jakarta

The Eclipse Foundation is set to become the new steward of enterprise Java, taking over from Oracle, which no longer wants to manage Java EE. - [Oracle Chooses Eclipse Foundation as New Home for Java EE](https://www.infoq.com/news/2017/09/JavaEEtoEclipse/)

이때, 이클립스 재단으로 이관되면서(Java EE 에 대한 상표권은 오라클이 보유) 공식 명칭이 __Jakarta EE__ 로 변경되었다. 이러한 이유 때문에 패키지명도 `javax.*` 에서 `Jakarata.*` 로 변경되었다.

[Spring Boot 3.0 has migrated from Java EE to Jakarta EE APIs](https://github.com/spring-projects/spring-boot/wiki/Spring-Boot-3.0-Release-Notes) for all dependencies. Spring Boot 3.0 이상으로 Upgrade 하려면 `javax.*` 패키지명을 `Jakarta.*` 으로 변경해야 한다. 

The core goal of Jakarta EE is __'Enterprise Java Technology for Cloud Native Environment'__, which aims to reflect the latest technology trends such as microservices and containers.

## RFC7807

A common requirement for REST services is to include details in the body of error responses. The Spring Framework supports the "Problem Details for HTTP APIs" specification, [RFC 7807](https://www.rfc-editor.org/rfc/rfc7807.html).

__RFC 7807 is the standard specification for these API error response.__

- [Webflux - Error Responses](https://docs.spring.io/spring-framework/docs/6.0.0-RC1/reference/html/web-reactive.html#webflux-ann-rest-exceptions)
  - New ResponseEntityExceptionHandler to customize WebFlux exceptions and render RFC 7807 error responses.
- [WebMVC - Error Responses](https://docs.spring.io/spring-framework/docs/6.0.0-RC1/reference/html/web.html#mvc-ann-rest-exceptions)

__Problem details:__
- When serialized as a JSON document, that format is identified with the __"application/problem+json"__ media type.
- For example, an HTTP response carrying JSON problem details:
```
HTTP/1.1 403 Forbidden
   Content-Type: application/problem+json
   Content-Language: en

   {
    "type": "https://example.com/probs/out-of-credit",
    "title": "You do not have enough credit.",
    "detail": "Your current balance is 30, but that costs 50.",
    "instance": "/account/12345/msgs/abc",
    "balance": 30,
    "accounts": ["/account/12345",
                 "/account/67890"]
   }
```

Spring Boot 3+ 를 사용 중이라면 ProblemDetail 을 활용하여 HTTP API - Error Response 표준을 적용해볼 수 있을 것 같다.

For more information, see the [RFC 7807](https://www.rfc-editor.org/rfc/rfc7807.html) documentation.

## Links

- [Spring Boot 3 and Spring Framework 6.0 – What’s New](https://www.baeldung.com/spring-boot-3-spring-6-new)
- [Oracle - Transition from Java EE to Jakarta EE](https://blogs.oracle.com/javamagazine/post/transition-from-java-ee-to-jakarta-ee)
