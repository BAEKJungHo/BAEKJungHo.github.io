---
layout  : wiki
title   : Logging in WebFlux with Kotlin
summary : 
date    : 2023-05-17 20:54:32 +0900
updated : 2023-05-17 21:15:24 +0900
tag     : logging webflux kotlin
toc     : true
comment : true
public  : true
parent  : [[/logging]]
latex   : true
---
* TOC
{:toc}

## Logging in WebFlux with Kotlin

Guide - [Log Request/Response Body in Spring WebFlux with Kotlin](https://www.baeldung.com/kotlin/spring-webflux-log-request-response-body)

Spring WebFlux doesn’t provide any out-of-the-box logging utility to log the body of incoming calls. Therefore, we have to create our custom WebFilter to add a log decoration to the requests and responses. __As soon as we read the request or response body for logging, the input stream is consumed, so the controller or client doesn’t receive the body__.

Hence, the solution is to cache the request and response in the decorator or copy the InputStream to a new stream and pass it to the logger. However, we should be careful with this duplication that could increase memory usage, especially with incoming calls with a heavy payload.

### WebFilter

```kotlin
@Component
class LoggingFilter: WebFilter {

    private val log = LoggerFactory.getLogger(javaClass)

    override fun filter(exchange: ServerWebExchange, chain: WebFilterChain): Mono<Void> =
        chain.filter(LoggingWebExchange(log, exchange))
}

class LoggingWebExchange(log: Logger, delegate: ServerWebExchange) : ServerWebExchangeDecorator(delegate) {
    // Encapsulate the logic of logging by Decorators
    private val requestDecorator: LoggingRequestDecorator = LoggingRequestDecorator(log, delegate.request)
    private val responseDecorator: LoggingResponseDecorator = LoggingResponseDecorator(log, delegate.response)

    override fun getRequest(): ServerHttpRequest {
        return requestDecorator
    }

    override fun getResponse(): ServerHttpResponse {
        return responseDecorator
    }
}
```

### Decorators

__Request Decorator:__

```kotlin
class LoggingRequestDecorator internal constructor(log: Logger, delegate: ServerHttpRequest): ServerHttpRequestDecorator(delegate) {

    private val body: Flux<DataBuffer>?

    override fun getBody(): Flux<DataBuffer> {
        return body!!
    }

    init {
        if (log.isInfoEnabled) {
            val path = delegate.uri.path
            val query = delegate.uri.query
            val method = Optional.ofNullable(delegate.method).orElse(HttpMethod.GET).name()
            val headers = delegate.headers.asString()
            log.info(
                "{} {}\n {}", method, path + (if (StringUtils.hasText(query)) "?$query" else ""), headers
            )
            body = super.getBody().doOnNext { buffer: DataBuffer ->
                val bodyStream = ByteArrayOutputStream()
                Channels.newChannel(bodyStream).write(buffer.asByteBuffer().asReadOnlyBuffer())
                log.info("{}: {}", ">>> Request", String(bodyStream.toByteArray()))
            }
        } else {
            body = super.getBody()
        }
    }
}
```

__Response Decorator:__

```kotlin
class LoggingResponseDecorator internal constructor(val log: Logger, delegate: ServerHttpResponse): ServerHttpResponseDecorator(delegate) {

    override fun writeWith(body: Publisher<out DataBuffer>): Mono<Void> {
        return super.writeWith(
            Flux.from(body)
                .doOnNext { buffer: DataBuffer ->
                    if (log.isInfoEnabled) {
                        val bodyStream = ByteArrayOutputStream()
                        Channels.newChannel(bodyStream).write(buffer.asByteBuffer().asReadOnlyBuffer())
                        log.info("{}: {} - {} : {}", "<<< Response", String(bodyStream.toByteArray()),
                            "header", delegate.headers.asString())
                    }
                })
    }
}
```

I used isInfoEnabled because production environment will use info level as the default.

### LogStashEncoder

[LogStashEncoder](https://github.com/logfellow/logstash-logback-encoder) is Logback JSON encoder and appenders.

```kotlin
implementation("net.logstash.logback:logstash-logback-encoder:7.3")
```

### Logback Configurations with XML

__Logback Appender:__

```xml
<?xml version="1.0" encoding="UTF-8"?>

<included>
    <property name="LOG_PATH" value="./logs"/>

    <!-- Application Logging with FILE -->
    <appender name="APPLICATION" class="ch.qos.logback.core.rolling.RollingFileAppender">
        <file>${LOG_PATH}/app.log</file>
        <rollingPolicy class="ch.qos.logback.core.rolling.TimeBasedRollingPolicy">
            <!-- Daily rollover -->
            <fileNamePattern>${LOG_PATH}/backup/app-%d{yyyy-MM-dd}.%i.log.zip</fileNamePattern>
            <maxHistory>7</maxHistory>
            <timeBasedFileNamingAndTriggeringPolicy class="ch.qos.logback.core.rolling.SizeAndTimeBasedFNATP">
                <maxFileSize>100MB</maxFileSize>
            </timeBasedFileNamingAndTriggeringPolicy>
        </rollingPolicy>
        <encoder class="net.logstash.logback.encoder.LogstashEncoder"/>
    </appender>

    <appender name="ASYNC_APPLICATION_LOGGING" class="ch.qos.logback.classic.AsyncAppender">
        <appender-ref ref="APPLICATION" />
    </appender>

    <!-- STDOUT/STDERR Logging -->
    <appender name="ASYNC_STDOUT" class="ch.qos.logback.core.ConsoleAppender">
        <encoder class="net.logstash.logback.encoder.LogstashEncoder"/>
    </appender>
</included>
```

__Logback Spring:__

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration scan="true" scanPeriod="20 seconds">
    <include resource="./logging/logback-appender.xml"/>
    
    <root level="INFO">
        <appender-ref ref="ASYNC_APPLICATION_LOGGING" />
        <appender-ref ref="ASYNC_STDOUT" />
    </root>
</configuration>
```

### Yml

__application-logging.yml__

```yml
logging:
  config: classpath:./logging/logback-spring.xml
```

__application.yml__

```yml
spring:
  profiles:
    include:
      - "logging"
```

### Outputs

__Request:__

```
{"@timestamp":"2023-05-21T13:44:16.125337+09:00","@version":"1","message":">>> Request: {\n    \"jobName\": \"1234\"\n}","logger_name":"team.backend.common.logging.LoggingFilter","thread_name":"reactor-http-nio-3","level":"DEBUG","level_value":10000}
```

__Response:__

```
{"@timestamp":"2023-05-21T13:44:16.272728+09:00","@version":"1","message":"<<< Response: {\"id\":1,\"jobName\":\"Backend Developer\"} - header :  transfer-encoding: [chunked]\n Content-Type: [application/json]\n Content-Length: [38]","logger_name":"team.backend.common.logging.LoggingFilter","thread_name":"vert.x-eventloop-thread-1","level":"DEBUG","level_value":10000}
```