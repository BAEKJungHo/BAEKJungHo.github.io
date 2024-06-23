---
layout  : wiki
title   : HealthCheck
summary : 
date    : 2024-06-20 20:28:32 +0900
updated : 2024-06-20 21:15:24 +0900
tag     : spring healthcheck kubernetes
toc     : true
comment : true
public  : true
parent  : [[/spring]]
latex   : true
---
* TOC
{:toc}

## HealthCheck

Spring 과 K8S 를 사용하는 환경에서 애플리케이션이 사용 가능한지 __상태 확인__ 을 위해서 Liveness, Readiness 개념을 적용하면서 Health Check Endpoint 를 Helm 에 설정하곤 한다.

애플리케이션의 RELIABLE 을 위해서, Application Error, DB Connection Error or Configuration Error 등 다양한 에러를 Detect 하고 애플리케이션을 Recover 할 수 있어야 한다.

문제가 발생했을때 가장 접근하기 쉬운 해결책은 __Restart__ 이다. 

### Health Check Diagnosis Mechanism

K8S 에서 __Probes__ 는 Pod 내에서 실행되는 애플리케이션이 정상 작동 하는지 __건강(health) 상태를 진단__ 하는 매커니즘이다.
쉽게 말하면, __Health Check Diagnosis Mechanism__ 이라 할 수 있다.

Liveness Probe 는 컨테이너가 정상적으로 실행되고 있는지 확인한다. 만약 Liveness Probe 가 Fail 하면, K8S 는 컨테이너가 비정상 상태임을 간주하고, restart 를 한다.
아래 helm 의 [deployment](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/) 에서 Health Check Path 를 설정할 수 있다.

```
livenessProbe:
  httpGet:
    path: /healthz
    port: http
readinessProbe:
  httpGet:
    path: /healthz
    port: http
```

Readiness Probe 는 백엔드 서버가 트래픽을 처리할 준비가 되었는지를 확인한다. 만약 Readiness Probe 가 Fail 하면 서비스의 엔드포인트 목록에서 해당 컨테이너의 IP 주소를 제거하여 트래픽을 다른 정상 컨테이너로 보낸다.

대기 시간이 짧아야 하는 애플리케이션의 경우(e.g 계정 서비스, 인증 서비스 등)에 초기 오버헤드를 줄이기 위해
[JVM Warm up](https://baekjungho.github.io/wiki/java/java-jvm-warmup/) 과정과 통합할 수 있다.

### Spring Boot Actuator

[Spring Boot Actuator](https://www.baeldung.com/spring-boot-actuators) 를 설정하면 헬스체크 엔드포인트가 기본적으로 /actuator/health 로 설정된다.
Health Check 의 응답으로 반환되는 [정보](https://docs.spring.io/spring-boot/docs/3.0.5/reference/html/actuator.html#actuator.endpoints.health)에는 민감정보가 포함될 수 있으므로 public 하게 노출시켜서는 안된다.
(헬스 체크에서 detail 옵션을 키면, 상세하게 나온다.)

[Toss - Spring Boot Actuator 의 헬스체크 살펴보기](https://toss.tech/article/how-to-work-health-check-in-spring-boot-actuator) 에서 설명해준 사례를 정리하면 다음과 같다.

애플리케이션은 서비스 DB 와 로그 적재용 DB 가 존재하며, 2개의 Pod 로 운영되고 있다. 만약 로그 DB 를 작업해야 해서 순단이 발생하는 경우에 DataSourceHealthIndicator 에 의해 서비스 DB의 상태를 체크했을 때는 UP 이 반환되며, DataSourceHealthIndicator 에 의해 로그 DB의 상태를 체크했을 때는 DOWN 이 반환된다.
아무런 순서 설정을 하지 않았다면 SimpleStatusAggregator 에 의해 DOWN(503) 이 반환되어, 로드밸런서에 의해서 모든 Pod 에 트래픽이 가지 않게 된다.
즉, 서비스 DB 가 정상이더라도 서비스 불능 상태에 빠질 수 있게 된다.

이에 대한 해결책은 다음과 같다.
- Spring Boot Actuator 가 아닌 커스텀 헬스 체크 API 를 구현 
- [HealthIndicator](https://www.baeldung.com/spring-boot-health-indicators) 중에 헬스 체크에 영향을 끼치지 않길 희망하는 것들은 비활성화 (e.g management.health.db.enabled: false)

### Custom Health Check API

Load Balancer 가 각 인스턴스를 활성화시키는 Health Check API 는 해당 인스턴스의 애플리케이션이 완전히 초기화가 완료된 뒤에 true 를 반환하게 해야한다. 그렇지 않으면 요청이 너무 일찍들어와서 일찍 들어온 요청들은 모두 오류가 발생하게 된다.

```kotlin
@RestController
class HealthCheckEntry {
    
    @GetMapping("/healthz")
    fun healthCheck() {
        /*
            Spring 의 필수 bean 들이 모두 초기화 되고, DB Connection Pool 등도 맺어진 상태에서 수행될 수 있게 할 수 있다.
            환경, 서비스 이름, buildVersion 등의 정보를 반환할 수 있다.
         */
    }
}
```

Health Check API 는 Log 를 비활성화 시키는 것이 좋다. (그렇지 않으면 health check log 로 인해 디버깅이 어려움)

## Links

- [Spring Boot Graceful Shutdown Docs](https://docs.spring.io/spring-boot/docs/2.3.0.RELEASE/reference/html/spring-boot-features.html#boot-features-graceful-shutdown)
- [Kubernetes Health Checks: Liveness vs. Readiness vs. Startup Probe](https://www.youtube.com/watch?v=fqfieWP1jY4)
- [Configure Liveness, Readiness and Startup Probes](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/)
