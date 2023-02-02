---
layout  : wiki
title   : Distributed Tracing
summary : 
date    : 2023-01-18 15:54:32 +0900
updated : 2023-01-18 20:15:24 +0900
tag     : msa logging
toc     : true
comment : true
public  : true
parent  : [[/msa]]
latex   : true
---
* TOC
{:toc}

## Distributed Tracing

> Distributed tracing is a technique used to track the flow of a request or a transaction as it travels across multiple microservices or systems in a distributed architecture. The goal of distributed tracing is to provide a holistic view of how a request is handled and how different components of a system interact with each other, which can be useful for identifying performance bottlenecks, debugging issues, and improving overall system observability. Distributed tracing is typically implemented using a combination of instrumentation, correlation IDs, and a central trace storage and querying system.

__분산 추적(distributed tracing)__ 은 MSA 환경에서 __수 많은 마이크로서비스들 간의 트랜잭션 로그를 추적, 모니터링 하는 것__ 을 의미한다.

## OpenTracing

Java 진영의 ORM 에서는 JPA 라는 표준 명세가 있고 표준을 구현하는 각 Framework 들이 존재한다.

OpenTracing 은 Cloud Native Computing Foundation 에서 구현한 [비공식 분산 추적 표준](https://opentracing.io/docs/overview/what-is-tracing/) 이다. 이를 구현한 Jaeger, Elastic APM, Zipkin 등의 여러가지 Tracer 들이 존재한다.

- [OpenTracing Specification](https://github.com/opentracing/specification/blob/master/specification.md)

```kotlin
import io.opentracing.Span
import io.opentracing.Tracer
import io.opentracing.util.GlobalTracer
import io.undertow.Undertow
import io.undertow.server.HttpHandler
import io.undertow.server.HttpServerExchange

fun main() {
    // Initialize the tracer
    val tracer: Tracer = ...
    GlobalTracer.register(tracer)

    // Create the server
    val server = Undertow.builder()
        .addHttpListener(8080, "localhost")
        .setHandler(object: HttpHandler {
            override fun handleRequest(exchange: HttpServerExchange) {
                // Start a new span for the request
                val span: Span = tracer.buildSpan("handle-request").start()

                try {
                    // Do some work here...
                    exchange.responseSender.send("Hello, World!")
                } finally {
                    // Finish the span
                    span.finish()
                }
            }
        })
        .build()
    server.start()
}
```

This is a simple example, but in a real-world application, you would likely want to extract more information from the request and add __tags and logs to the span to provide more context__ and make it easier to understand the trace. Also, you __should be careful about the performance issue__ when adding tracing to your code.

### Span

> In distributed tracing, a span is a unit of work that is tracked as it propagates through a distributed system. A span typically includes information such as the start and end times of the work, the operation name, and any associated metadata. Spans can be nested to form a trace, which allows for the visualization and analysis of the flow of a request as it traverses different services and components in a distributed system.

Span 은 분산 추적에서 가장 기본이 되는 __논리 단위(작업 단위)__ 를 의미한다. Span Id 는 분산 시스템에서 per-request 안에 존재하는 각각의 작업에 부여된 __작업 Id__ 를 의미한다.

일반적으로 작업의 시작 시간과 종료 시간, 작업 이름 및 관련 메타데이터와 같은 정보가 포함된다. 스팬은 추적을 형성하기 위해 중첩될 수 있으며, 이를 통해 분산 시스템에서 서로 다른 서비스와 구성 요소를 통과할 때 요청 흐름을 시각화하고 분석할 수 있다.

For example, the following is an example Trace made up of 8 Spans:
```
Causal relationships between Spans in a single Trace


        [Span A]  ←←←(the root span)
            |
     +------+------+
     |             |
 [Span B]      [Span C] ←←←(Span C is a `ChildOf` Span A)
     |             |
 [Span D]      +---+-------+
               |           |
           [Span E]    [Span F] >>> [Span G] >>> [Span H]
                                       ↑
                                       ↑
                                       ↑
                         (Span G `FollowsFrom` Span F)
```

Sometimes it's easier to visualize Traces with a time axis as in the diagram below:
```
Temporal relationships between Spans in a single Trace


––|–––––––|–––––––|–––––––|–––––––|–––––––|–––––––|–––––––|–> time

 [Span A···················································]
   [Span B··············································]
      [Span D··········································]
    [Span C········································]
         [Span E·······]        [Span F··] [Span G··] [Span H··]
```

위 처럼 시간의 흐름 형태로 구성하는 것이 모니터링에 더 도움이 된다. 아래는 Datadog 에서 제공하는 화면이다.

![](/resource/wiki/msa-distributed-tracing/datadog-apm.png)

Span 에는 다음과 같은 정보들을 가지고 있다.
- 작업 이름
- 작업 시작시간, 종료시간
- key, value 형태의 Tags, Logs
- Span Contexts

### SpanContext

> In distributed tracing, a span context is a data structure that holds information about a span and its place in a trace. The context is propagated along with the request as it flows through the system, allowing each service and component to add information to the context, such as metadata or timing data.
>
> The span context typically includes a trace ID and a span ID, which are used to uniquely identify the span and trace, respectively. It may also include other information such as baggage items, which are key-value pairs that can be used to propagate information between spans, or flags that indicate whether the span should be sampled for tracing.
>
> The span context is usually propagated in the headers of the request or response, but it can also be passed in other ways such as through a message queue or in-memory data structure.

Span Contexts 는 로그 추적을 더 수월하게 하기 위해 Span 에 남기는 __부가 정보(additional information)__ 들을 가지고 있는 Context 라고 생각하면 된다.


```kotlin
// Create a new tracer
val tracer = Configuration.fromEnv().tracer

// Start a new span and set its operation name
val span = tracer.buildSpan("my-operation").start()

// Add some baggage to the span context
span.setBaggageItem("user-id", "12345")

// Propagate the span context in the request headers
val headers = tracer.inject(span.context(), Format.Builtin.HTTP_HEADERS, object : TextMap {
    override fun put(key: String, value: String) {
        // Add the headers to the request
        // ...
    }

    override fun iterator(): MutableIterator<MutableMap.MutableEntry<String, String>> {
        throw UnsupportedOperationException("Not implemented")
    }
})

// Use the request to call a service
// ...

// Extract the span context from the response headers
val extractedContext = tracer.extract(Format.Builtin.HTTP_HEADERS, object : TextMap {
    override fun put(key: String, value: String) {
        throw UnsupportedOperationException("Not implemented")
    }

    override fun iterator(): MutableIterator<MutableMap.MutableEntry<String, String>> {
        // Get the headers from the response
        // ...
    }
})

// Start a new span as a child of the extracted span
val childSpan = tracer.buildSpan("child-operation").asChildOf(extractedContext).start()

// ...

// Close the span
span.finish()
```

### Trace

Span Id 는 분산 시스템에서 per-request 안에 존재하는 각각의 작업에 부여된 __작업 Id__ 를 의미하는 반면에, Trace Id 는 하나의 요청이 시작되고 처리되기까지의 모든 과정을 포함하는 Id 이다.

```
<------------------------- Same Trace Id ------------------------->

––|–––––––|–––––––|–––––––|–––––––|–––––––|–––––––|–––––––|–> time

 [Span A···················································]
   [Span B··············································]
      [Span D··········································]
    [Span C········································]
         [Span E·······]        [Span F··] [Span G··] [Span H··]
```

## LogContext

- [LogContext with MDC](https://baekjungho.github.io/wiki/spring/spring-mdc/)

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
    MDC.put("span_id");
    MDC.put("trace_id");
    
    // Span Contexts
    Map<String, String> messages = new HashMap<>();
    messages.put("httpMethod", "POST");
    messages.put("appVersion", "1");
    String logMessages = objectMapper.writeValueAsString(messages);
    log.info("{}", logMessages);
    
    MDC.remove("span_id");
    MDC.remove("trace_id");
  }
}
```

## Different Characteristics in Contexts

> Span context and Log context are both ways to propagate contextual information through a system, but they serve different purposes and have different characteristics.
>
> - Span context is used in distributed tracing to track the flow of a request as it propagates through a distributed system. It includes information such as the trace and span IDs, which are used to uniquely identify the trace and the current span, respectively. It also includes other information such as baggage items and flags that can be used to propagate metadata or control the sampling of traces. Span context is typically propagated in the headers of a request or response, but can also be passed in other ways such as through a message queue or in-memory data structure.
>
> - Log context, on the other hand, is used to propagate additional information that can be used to enrich log entries. It typically includes information such as the user ID, request ID, or other information that can be used to correlate log entries with a specific request or user. Log context is usually propagated through thread-local variables or MDC (Mapped Diagnostic Context) and it is used to enrich log statements with additional information.
>
> In summary, span context is used for distributed tracing and log context is used for logging. Both are used to propagate contextual information through a system, but they serve different purposes and have different characteristics.

## Links

- [OpenTracing, 분산추적(Distributed Tracing) 과 Span context](https://ksr930.tistory.com/112)
- [Distributed Tracing Key Concepts](https://docs.wavefront.com/trace_data_details.html)
- [Understand Distributed Tracing](https://docs.lightstep.com/docs/understand-distributed-tracing)
- [MSA 아키텍쳐 구현을 위한 API 게이트웨이의 이해 #2 - API 게이트웨이 기반의 디자인 패턴](https://bcho.tistory.com/1006)

## References

- 마이크로서비스 인 액션 / 모건 브루스, 파울로 페레이라 저 / 위키북스