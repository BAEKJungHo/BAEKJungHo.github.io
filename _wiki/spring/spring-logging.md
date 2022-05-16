---
layout  : wiki
title   : Slf4j, Logback
summary : 
date    : 2022-04-20 19:28:32 +0900
updated : 2022-04-20 21:15:24 +0900
tag     : spring
toc     : true
comment : true
public  : true
parent  : [[/spring]]
latex   : true
---
* TOC
{:toc}

# Logging

## Dependency

- Spring Boot Starters 는 모두 spring-boot-starter-logging 에 의존한다.
- Spring Boot 는 Logging Facade 인 `SLF4J` 를 기본으로 지원한다. 따라서, Logback 과 같은 Logging Framework 를 손쉽게 바꿀 수 있다.

## SLF4J 

> Simple Logging Facade for Java

![](/resource/wiki/spring-logging/slf4jfacade.png)

초기의 스프링은 JCL(Jakarta Commons Logging) 을 사용해서 로깅을 구현했다. 요즘은 스프링 부트에서 기본으로 지원하고 있는 Logback 을 주로 사용한다. Log4j는 가장 오래된 프레임워크이며 Apache 의 Java 기반 Logging Framework 다. xml, properties 파일로 로깅 환경을 구성하고, 콘솔 및 파일 출력의 형태로 로깅을 할 수 있게 도와준다. Logback 은 log4j 이후에 출시된 Java 기반 Logging Framework 이다.

![](/resource/wiki/spring-logging/slf4j.png)

### SLF4J vs JCL

JCL(Jakarta Commons Logging) 에서는 클래스 로더 문제나 메모리 누수 문제가 발생하곤 했다. SLF4J 는 클래스 로더를 사용하지 않고, 컴파일 시점에 구현체를 선택하도록 변경되었다. 즉, commons-logging 라이브러리는 런타임 바인딩에 의존하지만, SLF4J 는 컴파일 타임 바인딩을 사용한다.

### SLF4J vs Log4j

- SLF4J 는 Log4j 보다 필터링 정책, 기능, 로그 레벨 변경 등에 대해 서버를 재시작할 필요 없이 자동 리로딩을 지원한다.

### ServiceLoader

> A simple service-provider loading facility

컴파일 타임 바인딩이 가능한 이유는 ServiceLoader 라는 매커니즘을 사용한다. ServiceLoader 는 iterator 메소드 를 통해 Service Provider 를 찾고 인스턴스화 하는 데 사용할 수 있다.

> A service is a well-known set of interfaces and (usually abstract) classes. A service provider is a specific implementation of a service. The classes in a provider typically implement the interfaces and subclass the classes defined in the service itself. Service providers can be installed in an implementation of the Java platform in the form of extensions, that is, jar files placed into any of the usual extension directories. Providers can also be made available by adding them to the application's class path or by some other platform-specific means.
> 
> For the purpose of loading, a service is represented by a single type, that is, a single interface or abstract class. (A concrete class can be used, but this is not recommended.) A provider of a given service contains one or more concrete classes that extend this service type with data and code specific to the provider. The provider class is typically not the entire provider itself but rather a proxy which contains enough information to decide whether the provider is able to satisfy a particular request together with code that can create the actual provider on demand. The details of provider classes tend to be highly service-specific; no single class or interface could possibly unify them, so no such type is defined here. The only requirement enforced by this facility is that provider classes must have a zero-argument constructor so that they can be instantiated during loading.
>
> [by Docs](https://docs.oracle.com/javase/9/docs/api/java/util/ServiceLoader.html)

### Mapped Diagnostic Context

MDC(Mapped Diagnostic Context) 는 스레드별로 로깅을 관리할 수 있게 해주는 로깅 프레임워크이다. Logback 과 Log4j 는 모두 MDC 를 지원한다. MDC 구현은 일반적으로 ThreadLocal 을 사용하여 컨텍스트 정보를 저장한다.

따라서, WAS 처럼 ThreadPool 과 함께 사용할 때에는 주의해야 한다. 이에 대한 내용은 [Concurrency](https://baekjungho.github.io/wiki/spring/spring-concurrency/)에서 자세하게 확인할 수 있다.

### SLF4J 를 선택해야 하는 이유

![](/resource/wiki/spring-logging/slf4jbridge.png)

- __사용하기 쉽다__
  - `private val log = LoggerFactory.getLogger(javaClass)`
- __모든 주요 로깅 프레임워크를 지원한다.__
- __매개변수화된 로그 메시지를 효과적으로 처리한다.__
  - `logger.info("client {} requested to {} the following list: {}", clientId, operationName, list);` 
  - 객체를 직렬화하여 출력할 수도 있다.
    - `logger.info("{}", myObject);`
- __문서화가 잘 되어있고, 널리 사용되고 있다.__
- __MDC(Mapped Diagnostic Context) Mechanisms 를 지원한다.__
- __브리지를 사용하여 레거시 종속성 로그를 SLF4J 로 구동할 수 있다.__
  - jcl-over-slf4j.jar: 이 jar 를 프로젝트에 추가하면 JCL 에 대한 모든 호출이 리디렉션된다.
  - log4j-over-slf4j.jar: 이 jar 를 클래스 경로에 추가한 후 Log4j 에 대한 모든 호출은 SLF4J 를 가리킨다.
  - jul-to-slf4j.jar : 이 라이브러리는 JUL 의 LogRecord 객체를 해당하는 SLF4J로 변환한다. 이 메커니즘을 사용하면 로깅 성능이 심각하게 저하될 수 있다.
- __API 에서 마커 사용을 허용한다.__
  - Log4j는 Marker 인터페이스를 제공하지만 SLF4J 정의와 호환되지 않습니다. 결과적으로 Logback만이 SLF4J Markers 를 지원한다.
  - ```java
    import org.slf4j.Marker;
    import org.slf4j.MarkerFactory;
    
    public class SimpleController {
    
        Logger logger = LoggerFactory.getLogger(SimpleController.class);
        // ...
        public String clientMarkerRequest() throws InterruptedException {
            logger.info("client has made a request");
            Marker myMarker = MarkerFactory.getMarker("MYMARKER");
            logger.info(myMarker, "Starting request");
            Thread.sleep(5000);
            logger.debug(myMarker, "Finished request");
            return "finished";
        }
    }
    ```
    - 마커를 사용할 때 활용할 수 있는 또 다른 기능 은 표시된 이벤트가 발생할 때 이메일을 트리거 할 수 있다.
- __국제화를 지원한다.__
- __SLF4J 규약을 확장하거나 자신의 로거를 SLF4J 와 호환되도록 만들 수있다.__
  - ILoggerFactory 엔터티를 직접 사용하여 SLF4J 규칙을 재정의하거나 확장할 수 있다.
  - [How do I make my logging framework SLF4J compatible?](https://www.slf4j.org/faq.html#slf4j_compatible)

## Logback

현재 Logback 은 logback-core, logback-classic 및 logback-access 의 세 가지 모듈로 나뉜다.

- __logback-classic__
  - core 를 확장
  - 클래식 모듈은 크게 개선된 log4j 버전에 해당
  - SLF4J API 를 구현 하므로 JDK 1.4에 도입된 log4j 또는 java.util.logging(JUL)과 같은 기타 로깅 시스템과 logback 간에 쉽게 전환할 수 있음
- __logback-access__
  - 서블릿 컨테이너와 통합되어 HTTP 액세스 로그 기능을 제공
  - [HTTP-access logs with logback-access, Jetty and Tomcat](https://logback.qos.ch/access.html)

### [LoggingEvent Sending Sequence Diagram](https://logback.qos.ch/manual/underTheHood.html)

![](/resource/wiki/spring-logging/logbackdiagram.png)

### Performance

- __로깅이 비활성화 상태인 경우__
  - Level.OFF 로 설정하여 로깅을 비활성화 상태로 변경할 수 있다.
  - 일반적으로는 `Method Invocation + Integer Comparision` 으로 결정된다.
  - 하지만 매개변수 생성에 대한 `숨겨진 비용(hidden cost)`이 발생할 수 있다.
    - `x.debug("Entry number: " + i + "is " + entry[i]);`
    - 매개변수 생성 비용은, 매개변수 크기에 따라 비용이 상당히 높을 수도 있다.
  - 하지만 아래와 같이 SLF4J 의 `parameterized logging` 방식을 사용하면 비용이 발생하지 않는다.
    - `x.debug("Entry number: {} is {}", i, entry[i]);`
    - Moreover, the component that formats messages is highly optimized.
- __로깅이 활성화된 경우__
  - In logback, there is no need to walk the logger hierarchy. A logger knows its effective level (that is, its level, once level inheritance has been taken into consideration) when it is created. Should the level of a parent logger be changed, then all child loggers are contacted to take notice of the change. Thus, before accepting or denying a request based on the effective level, the logger can make a quasi-instantaneous decision, without needing to consult its ancestors. 
- __실제 로깅__
  - 실제 로깅의 일반적인 비용은 로컬 시스템의 파일에 로깅할 때 약 9-12 마이크로초이다. 원격 서버의 데이터베이스에 로깅할 때 최대 몇 밀리초까지 걸린다. Logback 의 가장 중요한 설계 목표 중 하나는 `실행 속도`였으며 `안정성` 다음으로 요구되는 사항이었다. 일부 로그백 구성 요소는 성능 향상을 위해 여러 번 다시 작성되었다.

### Log Levels

로깅 레벨은 다음과 같은 규칙을 따른다.

> A log request of level p issued to a logger having an effective level q, is enabled if p >= q

![](/resource/wiki/spring-logging/loglevel.png)

- Error: 예상하지 못한 심각한 문제가 발생하는 경우, 즉시 조취를 취해야 할 수준의 레벨
- Warn: 로직 상 유효성 확인, 예상 가능한 문제로 인한 예외 처리, 당장 서비스 운영에는 영향이 없지만 주의해야 할 부분
- Info: 운영에 참고할만한 사항, 중요한 비즈니스 프로세스가 완료됨
- Debug: 개발 단계에서 사용하며, SQL 로깅을 할 수 있음
- Trace: 모든 레벨에 대한 로깅이 추적되므로 개발 단계에서 사용함

__Debug 와 Trace 레벨은 많은 양의 로그가 쌓이므로 자칫 운영 단계에서 해당 레벨의 로깅을 할 경우 용량 감당이 안 될 수 있다. 따라서, 일반적으로는 Debug, Trace 레벨의 로깅은 개발 단계에서만 사용하고 배포 단계에서는 사용하지 않는 것이 좋다.__

```java 
// This request is enabled, because WARN >= INFO
logger.warn("Low fuel level.");

// This request is disabled, because DEBUG < INFO. 
logger.debug("Starting search for nearest gas station.");

// The logger instance barlogger, named "com.foo.Bar", 
// will inherit its level from the logger named 
// "com.foo" Thus, the following request is enabled 
// because INFO >= INFO. 
barlogger.info("Located nearest gas station.");

// This request is disabled, because DEBUG < INFO. 
barlogger.debug("Exiting gas station search");
```

스프링에서 별다른 설정 없이 로그를 찍는다면 아래와 같은 형식으로 콘솔에 로그가 찍힐 것이다.

```idle
[2021-08-07 18:19:09:17317][http-nio-8080-exec-1] INFO  LogService - Info
[2021-08-07 18:19:09:17317][http-nio-8080-exec-1] WARN  LogService - Warn
[2021-08-07 18:19:09:17317][http-nio-8080-exec-1] ERROR LogService - Error
```

### Logback With Spring Boot

## Links

- [Slf4j Docs](https://www.slf4j.org/docs.html)
- [Frequently Asked Questions about SLF4J](https://www.slf4j.org/faq.html)
- [Logging Java](https://stackify.com/logging-java/)
- [Logback Tutorial](https://tecoble.techcourse.co.kr/post/2021-08-07-logback-tutorial/)
- [Java Logging Best Practices](https://coralogix.com/blog/java-logging-best-practices-for-success-with-your-java-application/)
- [Mapped Diagnostic Context](https://www.baeldung.com/mdc-in-log4j-2-logback)
- [Spring Boot Logging Best Practices Guide](https://coralogix.com/blog/spring-boot-logging-best-practices-guide/)
- [Logback Manual](https://logback.qos.ch/manual/)
- [Logback Mapped Diagnostic Context](https://logback.qos.ch/manual/mdc.html)
- [Logback Filters](https://logback.qos.ch/manual/filters.html)