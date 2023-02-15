---
layout  : wiki
title   : Mapped Diagnostic Context
summary : 
date    : 2022-11-25 19:28:32 +0900
updated : 2022-11-25 21:15:24 +0900
tag     : logging spring java
toc     : true
comment : true
public  : true
parent  : [[/spring]]
latex   : true
---
* TOC
{:toc}

## MDC

__The MDC is managed on a per thread basis. Use ThreadLocal.__

```java
package org.slf4j;

public class MDC {
  // Put a context value as identified by key
  // into the current thread's context map.
  public static void put(String key, String val);

  // Get the context identified by the key parameter
  public static String get(String key);

  // Remove the context identified by the key parameter
  public static void remove(String key);

  // Clear all entries in the MDC
  public static void clear();
}
```

### Support

- log4j, logback 만 지원하고 있음

### Stamping each log request

하나의 요청(per thread) 안에서 로그를 100개 찍는다고 했을때, logstash, datadog 같은 곳에서 Grouping 하기 위한 구분값이 필요하다. 보통 그 구분 값을 `TRACE-ID` 라고 한다. 따라서, Log 에 TraceId 가 있으면 분산 시스템에서도 클라이언트를 구분할 수 있다.

- __SimpleMDC__

```java
public class SimpleMDC {
  static public void main(String[] args) throws Exception {
    // You can put values in the MDC at any time. Before anything else
    // we put the first name
    MDC.put("first", "Dorothy");

    
    Logger logger = LoggerFactory.getLogger(SimpleMDC.class);
    // We now put the last name
    MDC.put("last", "Parker");

    // The most beautiful two words in the English language according
    // to Dorothy Parker:
    logger.info("Check enclosed.");
    logger.debug("The most beautiful two words in English.");

    MDC.put("first", "Richard");
    MDC.put("last", "Nixon");
    logger.info("I am not a crook.");
    logger.info("Attributed to the former US president. 17 Nov 1973.");
  }
}
```
```
// output
Dorothy Parker - Check enclosed.
Dorothy Parker - The most beautiful two words in English.
Richard Nixon - I am not a crook.
Richard Nixon - Attributed to the former US president. 17 Nov 1973.
```

## CustomAppender

이러한 MDC 의 특징과 logback 의 Appender 클래스를 구현한 CustomAppender 를 이용하면 모든 로그에 TraceId 와 필요한 정보들을 같이 남길 수 있다. 

```java
@Slf4j
@Component
public class CustomConsoleAppender extends AsyncAppenderBase<ILoggingEvent> implements ApplicationContextAware {

  private final ObjectMapper objectMapper;
    
  public CustomConsoleAppender() {
    objectMapper = new ObjectMapper();
    super.addAppender(new AsyncAppender());
  }

  @Override
  protected void append(ILoggingEvent iLoggingEvent) {
    Map<String, String> messages = new HashMap<>();
    messages.put("httpMethod", "POST");
    messages.put("appVersion", "1");
    // 생략

    MDC.put("trace_id");
    
    String logMessages = objectMapper.writeValueAsString(messages);
    log.info("{}", logMessages);

    MDC.remove("trace_id");
  }
}
```

## What Is a Good Pattern for Contextual Logging ?

- [C.7. What Is a Good Pattern for Contextual Logging? (MDC) - Reactive](https://projectreactor.io/docs/core/release/reference/#faq.mdc)

## Links

- [Slf4j MDC Docs](https://www.slf4j.org/api/org/slf4j/MDC.html)
- [Logback - MDC](https://logback.qos.ch/manual/mdc.html)