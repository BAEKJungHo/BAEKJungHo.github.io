---
layout  : wiki
title   : Preventing log loss with non-blocking mode
summary : 
date    : 2023-09-18 20:54:32 +0900
updated : 2023-09-18 21:15:24 +0900
tag     : logging aws architecture
toc     : true
comment : true
public  : true
parent  : [[/logging]]
latex   : true
---
* TOC
{:toc}

## Preventing log loss with non-blocking mode

### Blocking mode

Blocking mode 의 문제점은 stdout, stderr 쓰기가 호출되면 애플리케이션 코드가 차단(blocking) 되어 애플리케이션이 작동하지 않고 상태 검사 실패 및 작업 종료로 이어질 수 있다는 것이다.

### Non-blocking mode

![](/resource/wiki/logging-nonblocking-pipeline/nonblocking-pipeline.png)

__로그를 Amazon CloudWatch 로 보낼 수 없는 경우에, in-memory 버퍼에 저장된다. 버퍼가 가득 차면 로그가 손실된다. 컨테이너 코드에서 stdout 또는 stderr 에 쓰는 호출은 차단되지 않고 즉시 반환된다.__

AWSLogs Driver 를 사용하는 경우 추천하는 max-buffer-size 는 아래와 같다.

```json
"logConfiguration": {
    "logDriver": "awslogs",
    "options": {
        "mode": "non-blocking",
        "max-buffer-size": "25m",
    }
}
```

max-buffer-size 에 영향을 미치는 주요 변수는 애플리케이션이 데이터를 출력하는 빈도와 로그 처리량이라고 한다.

로그 손실(lost-logs)이 일어났을때 손실된 로그를 알 수 있는 방법은 없다고 한다. 

AWSLogs 로깅 드라이버를 사용하면 non-blocking 모드 버퍼로 인해 손실된 로그를 확인할 수 없습니다. 손실이 발생할 때 Docker Daemon 에서 내보내는 로그 문이나 메트릭이 없습니다.

## Logback AsyncAppender

Logback 에서도 AsyncAppender 를 사용하여 로그를 비동기로 처리할 수 있다.

RollingFileAppender 를 사용하면서 AsyncAppender 로 한 번 더 감쌀 수 있다.

```xml
<appender name="FILE" class="ch.qos.logback.core.rolling.RollingFileAppender">
    <file>./logs/server.log</file>
    <rollingPolicy class="ch.qos.logback.core.rolling.TimeBasedRollingPolicy">
        <fileNamePattern>./logs/back/server.%d{yyyyMMdd}-%i</fileNamePattern>
        <timeBasedFileNamingAndTriggeringPolicy class="ch.qos.logback.core.rolling.SizeAndTimeBasedFNATP">
            <maxFileSize>10MB</maxFileSize>
        </timeBasedFileNamingAndTriggeringPolicy>
        <maxHistory>1</maxHistory>
    </rollingPolicy>
    <encoder class="net.logstash.logback.encoder.LogstashEncoder"/>
</appender>

<appender name="ASYNC_DATADOG_STDOUT" class="ch.qos.logback.classic.AsyncAppender">
    <appender-ref ref="DATADOG_STDOUT" />
</appender>
```

아래와 같이 옵션을 설정할 수도 있다.

```xml
<appender name="async" class="ch.qos.logback.classic.AsyncAppender">
    <appender-ref ref="FILE" />
    <discardingThreshold>0</discardingThreshold>        
    <queueSize>256</queueSize>
    <neverBlock>false</neverBlock>
    <includeCallerData>false</includeCallerData>
</appender>
```

__[Set up SLF4J with logback's AsyncAppender](https://sorenpoulsen.com/set-up-slf4j-with-logbacks-asyncappender)__:

- AsyncAppender 는 Java 의 BlockingQueue 를 사용한다. 이벤트를 큐에 넣고 워커 스레드가 로그 이벤트를 큐에서 가져와서 다음 어펜더에 전달한다.
- Logback by default discards log events except those at WARN and ERROR level when the queue has 20% or less capacity remaining. 즉, 기본적으로 INFO, DEBUG 등의 로그가 유실될 수 있다. 
- 성능관점에서는 좋지만 로그가 유실되지 않아야 하면 __DiscardingTreshold 를 0 으로 설정__ 하여 로그 이벤트 삭제를 방지할 수 있다.
- "__includeCallerData__" determines if data that's expensive to extract, such as the caller's classname, is included in the log event passed to the next appender. If possible only reference "cheap" data. The sample configuration explicitly sets includeCallerData to false and this is also the default.

## References

- [Preventing log loss with non-blocking mode in the AWSLogs container log driver](https://aws.amazon.com/ko/blogs/containers/preventing-log-loss-with-non-blocking-mode-in-the-awslogs-container-log-driver/)




