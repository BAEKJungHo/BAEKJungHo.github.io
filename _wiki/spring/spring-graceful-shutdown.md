---
layout  : wiki
title   : Graceful shutdown
summary : 
date    : 2022-08-04 20:28:32 +0900
updated : 2022-08-04 21:15:24 +0900
tag     : spring
toc     : true
comment : true
public  : true
parent  : [[/spring]]
latex   : true
---
* TOC
{:toc}

## graceful shutdown

> graceful shutdown 은 서버 다운 시, 정상적인 종료 처리를 지원하는 기능이다.

기존에 떠있던 인스턴스를 바로 kill 하게 되면 현재 실행중인 프로세스가 온전히 처리되지 않았기 때문에 데이터 정합성 등의 크리티컬한 이슈가 발생하게 된다. 이를 방지하기 위해 서버 다운 시, 정상적인 종료 처리가 필요하고 Spring boot 2.3.0 이상 버전부터는 `graceful shutdown` 기능을 자체적으로 지원하고 있다. Spring boot 2.3.0 이전 버전에서는 ContextClosedEvent 를 확장하여 자체적으로 구현해야 한다.

### 설정

```yml
server:
  shutdown: graceful

spring:
  lifecycle:
    timeout-per-shutdown-phase: 20s
```

### timeout 

- __동기식 HTTP API 를 호출할 때 클라이언트에서 설정해야 하는 timeout 값__
  - connection timeout: 클라이언트가 서버에 연결을 맺을 때 연결 과정에서의 timeout 값
  - read timeout: 연결 이후 서버에 요청한 데이터를 수신하는 과정에서의 timeout 값
- __동기식 HTTP API 의 구현체를 설정하고 사용할 때 timeout 설정이 누락되면 경우에 따라서 대형 장애가 발생할 수도 있다__
  - 서버가 다운된 상태에서 클라이언트 -> 서버로 API 가 호출되면, 클라이언트에서는 서버의 연결 또는 응답을 받기 위해 무한 대기 상태에 빠질 수 있다.
  - 클라이언트에서 서버 호출 시 timeout 설정이 누락된 경우(Ex. RestTemplate 사용 시 timeout 설정을 안한 경우)에 클라이언트로의 요청이 지속적으로 유입되면, 해당 클라이언트의 thread pool 이 모두 고갈되는 현상(`thread hang`)이 발생한다.
- __API 호출 과정에서 클라이언트의 timeout 설정을 서버의 요청 처리 시간보다 짧게 설정하면 의도치 않은 이슈가 발생할 수 있다.__
  - 따라서, 클라이언트 측의 timeout 설정 값을 서버 측의 요청 처리 시간을 고려하여 약간 길게 잡아야 한다.

## Links

- [spring boot graceful shutdown](https://www.amitph.com/spring-boot-graceful-shutdown/)
- [https://spring.io/blog/2020/05/15/spring-boot-2-3-0-available-now](https://spring.io/blog/2020/05/15/spring-boot-2-3-0-available-now)
- [A Study of Graceful Shutdown for Spring Boot Applications](https://www.springcloud.io/post/2022-02/spring-boot-graceful-shutdown/#gsc.tab=0)
- [graceful-shutdown-spring-boot](https://github.com/gesellix/graceful-shutdown-spring-boot)
