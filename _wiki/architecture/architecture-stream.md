---
layout  : wiki
title   : STREAM
summary : 
date    : 2025-05-27 08:02:32 +0900
updated : 2025-05-27 08:12:24 +0900
tag     : architecture stream
toc     : true
comment : true
public  : true
parent  : [[/architecture]]
latex   : true
---
* TOC
{:toc}

## STREAM

A ___[stream](https://en.wikipedia.org/wiki/Stream_(computing))___ represents data that is progressively produced over time. Unlike traditional batch processing where you work with finite datasets, streams deal with continuous, unbounded data flows that never truly "complete."

All streams across different domains share the fundamental essence of <mark><em><strong>"continuous data flow with real-time processing"!</strong></em></mark> Streams transform how we think about data: from "having data" to <mark><em><strong>"flowing data"</strong></em></mark> - enabling real-time, scalable, and resilient systems.

Users generate data yesterday, today, and will continue generating data as long as the service exists. This fundamental characteristic means that ___stream processing___ is essentially about handling infinite data processing scenarios.

Stream processing can operate in two main modes:
- **Time-windowed processing**: Processing data at fixed intervals (e.g., aggregating ad click events every minute)
- **Event-driven processing**: Processing data immediately as events occur, without fixed time boundaries

> All streams across different domains share the fundamental essence of ___"continuous data flow with real-time processing"!___ Streams transform how we think about data: from "having data" to ___"flowing data"___ - enabling real-time, scalable, and resilient systems.

All data processing systems operate with two distinct time concepts:
- **Event Time**: When the event actually occurred in the real world
- **Processing Time**: When the event was observed and processed by the system

> Data teams often require precise timestamps for when clients and servers send and receive events to maintain data integrity and enable accurate analysis.

## Event Organization and Messaging Systems in Stream Processing

When building systems like ad click event aggregation, you often work with log files distributed across multiple servers. The typical processing pipeline involves:

__File-Based Stream Processing__:
- Input Source: Log files scattered across distributed servers
- File Format: Input consists of files (sequence of bytes) from various sources
- Parsing Stage: The first step typically involves analyzing files and converting them into a sequence of records
- Record Processing: Each record becomes a unit of processing in the stream

In stream processing terminology, these records are commonly referred to as ___[EVENT](https://klarciel.net/wiki/architecture/architecture-event/)___.

__Stream systems organize related events using__:
- Topics: Logical groupings of similar events
- Subjects: Alternative term for topics in some systems
- Streams: The actual data flow channels

To notify consumers about new events, stream systems rely on ___Messaging Systems___ that implement various delivery patterns.

### Key Design Questions for Pub/Sub Systems

When designing ___[Publish/Subscribe System](https://klarciel.net/wiki/architecture/architecture-pub-sub/)___, two critical questions help determine the appropriate architecture:

#### Handling Producer-Consumer Speed Mismatch

What happens when producers send messages faster than consumers can process them?

- __Option A: Drop Messages__
   - enable to data loss (message throwing)
   - Suitable for non-critical, high-volume scenarios
- __Option B: Buffer in Queue (Backpressure/Flow Control)__
   - Strategy used by Unix Pipes and TCP
   - Maintains a small, fixed-size buffer
   - Blocks sender when buffer is full until receiver consumes data
- __Option C: Block Producer__
  - Prevents the producer from sending additional messages
  - Avoids message loss but can create system bottlenecks

__Critical Buffer Management Considerations__:
- When messages are buffered in queues, it's essential to understand the implications of growing queue sizes:
  - Memory Management:
    - What happens when queue size exceeds available memory?
    - Does the system crash or gracefully handle the overflow?
  - Disk Persistence:
    - Does the system write messages to disk when memory is exhausted?
    - If disk storage is used, how does disk I/O impact messaging system performance?
  - Performance Impact:
    - How does increasing queue size affect overall system throughput?
    - What are the latency implications of different buffering strategies?

#### Fault Tolerance and Message Durability

What happens when nodes fail or go offline temporarily? Will messages be lost?

__Message Loss Tolerance Assessment__:
- Acceptable Loss: Can the system afford to lose some messages?
- Zero Loss Requirement: If message loss is unacceptable, persistence mechanisms are mandatory

__System-Specific Trade-offs__:
- Different systems have varying tolerance levels based on business requirements
- Financial systems typically require zero message loss
- Analytics systems might tolerate some data loss for better performance
- Real-time gaming systems might prioritize low latency over perfect delivery

__Persistence Strategies__:
- In-memory only: Fast but vulnerable to data loss
- Write-ahead logging: Balances performance and durability
- Replicated storage: Provides high availability and fault tolerance
- Hybrid approaches: Combine multiple strategies based on message criticality

## Stream Applications Across Domains

Whether it's database change streams, network packet flows, multimedia streaming, IoT sensor data, or financial market feeds - they all embody the same fundamental concept: ___processing continuous sequences of data elements as they arrive, enabling real-time insights and immediate responses___. This essence transcends specific technologies and domains, making stream processing a universal paradigm in modern computing systems.

Streams are fundamental to many modern systems:
- **Real-time Analytics**: Processing user behavior data as it happens
- **IoT Data Processing**: Handling sensor data from connected devices
- **Financial Trading**: Processing market data and executing trades
- **Social Media**: Managing user interactions and content feeds
- **Network Protocols**: [Stream in HTTP2](https://klarciel.net/wiki/network/network-binary-based-protocol/)

## Java Stream

Java Stream 은 기본 스트림의 핵심 철학을 차용했지만, 유한한 컬렉션 처리에 특화된 API 이다.

```java
// 📊 기본 스트림 (무한, 시간 기반)
// - 광고 클릭 이벤트가 계속 발생
// - 데이터가 시간에 따라 끊임없이 생성
// - "완료"라는 개념이 없음

실시간 광고 클릭 스트림:
2024-01-15 10:00:01 → Click Event 1
2024-01-15 10:00:02 → Click Event 2  
2024-01-15 10:00:03 → Click Event 3
... (무한히 계속) ...

// ☕ Java Stream (유한, 컬렉션 기반)
// - 이미 존재하는 데이터 컬렉션 처리
// - 명확한 시작과 끝이 있음
// - 한 번 소비되면 재사용 불가

List<ClickEvent> events = Arrays.asList(
    new ClickEvent("ad1", "user1"),
    new ClickEvent("ad2", "user2"),
    new ClickEvent("ad3", "user1")
); // 고정된 크기

events.stream()
    .filter(event -> "user1".equals(event.getUserId()))
    .count(); // 처리 완료, 스트림 소비됨
```

### Continuous Processing vs Batch Processing

__Continuous Processing__:

```java
// 📊 기본 스트림: 연속적 처리 (Continuous Processing)
public class RealTimeAdClickProcessor {
    
    // 무한 스트림 처리 - 이벤트가 올 때마다 즉시 처리
    @EventListener
    public void processClickEvent(ClickEvent event) {
        // 실시간으로 계속 처리
        updateClickCount(event.getAdId());
        updateUserProfile(event.getUserId());
        
        // 윈도우 기반 집계 (예: 1분마다)
        if (isWindowComplete()) {
            aggregateLastMinuteClicks();
        }
    }
    
    // 시간 윈도우 기반 처리
    @Scheduled(fixedRate = 60000) // 매 1분
    public void processTimeWindow() {
        // 지난 1분간의 이벤트 집계
        long clicksInLastMinute = getClicksInTimeWindow(
            Instant.now().minus(1, ChronoUnit.MINUTES),
            Instant.now()
        );
        
        publishMetrics(clicksInLastMinute);
    }
}
```

__Batch Processing__:

```java
// ☕ Java Stream: 배치 처리 (Batch Processing)
public class BatchAdClickProcessor {
    
    public void processDailyClicks() {
        // 하루치 데이터를 한 번에 처리
        List<ClickEvent> dailyEvents = getDailyClickEvents();
        
        // 한 번의 파이프라인으로 모든 처리 완료
        Map<String, Long> adClickCounts = dailyEvents.stream()
            .collect(Collectors.groupingBy(
                ClickEvent::getAdId,
                Collectors.counting()
            ));
        
        // 처리 완료 - 스트림 소비됨
        saveResults(adClickCounts);
    }
}
```

### Pipelining

```java
// 🔄 기본 스트림의 파이프라인 개념을 Java Stream이 차용

// 기본 스트림 처리 파이프라인:
// Raw Log → Parse → Filter → Transform → Aggregate → Output

// Java Stream의 동일한 개념:
clickEvents.stream()
    .filter(event -> event.getTimestamp().isAfter(yesterday))  // Filter
    .map(event -> new ProcessedEvent(event))                   // Transform  
    .collect(Collectors.groupingBy(                            // Aggregate
        ProcessedEvent::getAdId,
        Collectors.counting()
    ));

// 실제 스트림 처리 시스템 (Apache Kafka Streams)
KStream<String, ClickEvent> clickStream = builder.stream("click-events");

clickStream
    .filter((key, event) -> event.isValid())                  // Filter
    .mapValues(event -> enrichEvent(event))                   // Transform
    .groupByKey()                                              // Group
    .windowedBy(TimeWindows.of(Duration.ofMinutes(1)))        // Window
    .count()                                                   // Aggregate
    .toStream()
    .to("click-counts");                                       // Output
```

### Lazy Evaluation

```java
// 🔄 기본 스트림: 이벤트 기반 지연 처리
public class StreamProcessor {
    
    // 이벤트가 실제로 도착할 때까지 대기
    public void setupEventProcessor() {
        kafkaConsumer.subscribe(Arrays.asList("click-events"));
        
        while (true) {
            ConsumerRecords<String, ClickEvent> records = kafkaConsumer.poll(Duration.ofMillis(100));
            
            // 실제 데이터가 있을 때만 처리 시작
            for (ConsumerRecord<String, ClickEvent> record : records) {
                processEvent(record.value()); // 지연 평가
            }
        }
    }
}

// ☕ Java Stream: 터미널 연산까지 지연
public class JavaStreamExample {
    
    public void demonstrateLazyEvaluation() {
        List<ClickEvent> events = getClickEvents();
        
        Stream<ProcessedEvent> processedStream = events.stream()
            .peek(e -> System.out.println("Processing: " + e)) // 아직 실행 안됨
            .filter(event -> event.isValid())                  // 아직 실행 안됨
            .map(event -> new ProcessedEvent(event));          // 아직 실행 안됨
        
        // 터미널 연산이 호출될 때 비로소 실행
        long count = processedStream.count(); // 이때 모든 중간 연산 실행
    }
}
```

### Functional Chaining

```java
// 🔄 기본 스트림: 데이터 변환 파이프라인
public class AdClickPipeline {
    
    // 원시 로그 → 구조화된 이벤트 → 집계 결과
    public void processLogFile(String logFilePath) {
        try (Stream<String> lines = Files.lines(Paths.get(logFilePath))) {
            
            Map<String, Long> results = lines
                .map(this::parseLogLine)           // String → ClickEvent
                .filter(Objects::nonNull)          // 유효한 이벤트만
                .filter(this::isValidTimeRange)    // 시간 범위 필터
                .map(this::enrichWithUserData)     // 사용자 데이터 보강
                .collect(Collectors.groupingBy(    // 광고별 집계
                    ClickEvent::getAdId,
                    Collectors.counting()
                ));
            
            publishResults(results);
        }
    }
    
    private ClickEvent parseLogLine(String line) {
        // 로그 파싱 로직
        String[] parts = line.split(",");
        return new ClickEvent(parts[0], parts[1], Instant.parse(parts[2]));
    }
}

// ☕ Java Stream: 동일한 변환 체인 개념
public class JavaStreamTransformation {
    
    public void processClickEvents(List<ClickEvent> events) {
        Map<String, Double> avgClicksByHour = events.stream()
            .filter(event -> event.getTimestamp().isAfter(yesterday))
            .map(event -> new HourlyEvent(event))
            .collect(Collectors.groupingBy(
                HourlyEvent::getHour,
                Collectors.averagingLong(HourlyEvent::getClickCount)
            ));
    }
}
```

## Reactive Streams

__[Reactive Streams](https://www.reactive-streams.org/)__:

![](/resource/wiki/architecture-stream/reactive-streams.png)

- __[Reactive Manifesto](https://reactivemanifesto.org/)__

### Infinity Stream vs Traditional Stream

```java
// 📊 무한 스트림의 기본 특성
public class InfiniteStreamCharacteristics {
    
    // 1. 끝없는 데이터 생성
    public void demonstrateInfiniteNature() {
        // 사용자 클릭은 서비스가 살아있는 한 계속 발생
        while (serviceIsRunning) {
            ClickEvent event = waitForNextClick(); // 무한 대기
            processEvent(event);
        }
    }
    
    // 2. 시간 기반 윈도우
    public void timeBasedProcessing() {
        // 데이터를 시간 단위로 분할 처리
        processWindow(
            Instant.now().minus(Duration.ofMinutes(5)), // 5분 전부터
            Instant.now()                               // 지금까지
        );
    }
    
    // 3. 백프레셔 (Backpressure) 필요
    public void handleBackpressure() {
        // 생산자가 소비자보다 빠를 때 압력 조절
        if (eventQueue.size() > MAX_QUEUE_SIZE) {
            // 생산 속도 조절 또는 이벤트 드롭
            throttleProducer();
        }
    }
}
```

__전통적인 스트림 처리의 한계__:

```java
// 전통적인 방식의 문제점
public class TraditionalStreamProcessing {
    
    // 문제 1: 블로킹 I/O
    public void blockingApproach() {
        while (true) {
            String data = inputStream.readLine(); // 블로킹!
            
            // 데이터가 올 때까지 스레드가 대기
            // 많은 스레드 필요 → 메모리 부족
            processData(data);
        }
    }
    
    // 문제 2: 백프레셔 처리 어려움
    public void backpressureIssue() {
        BlockingQueue<Event> queue = new ArrayBlockingQueue<>(1000);
        
        // 생산자
        new Thread(() -> {
            while (true) {
                Event event = generateEvent();
                try {
                    queue.put(event); // 큐가 가득 차면 블로킹
                } catch (InterruptedException e) {
                    // 예외 처리
                }
            }
        }).start();
        
        // 소비자가 느리면 전체 시스템 블로킹
    }
    
    // 문제 3: 에러 전파 어려움
    public void errorHandling() {
        try {
            processInfiniteStream();
        } catch (Exception e) {
            // 하나의 에러가 전체 스트림을 중단시킴
            // 복구 로직 복잡
        }
    }
}
```

### Implementation Reactive Streams Spec

```java
// 🔄 Reactor의 기본 구성 요소
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

public class ReactorBasics {
    
    // Mono: 0-1개 요소를 비동기로 처리
    public Mono<String> singleValue() {
        return Mono.just("Hello Reactor")
            .map(String::toUpperCase)
            .delayElement(Duration.ofSeconds(1)); // 비동기 지연
    }
    
    // Flux: 0-N개 요소를 비동기로 처리 (무한 스트림 가능)
    public Flux<Integer> infiniteStream() {
        return Flux.interval(Duration.ofSeconds(1)) // 1초마다 숫자 생성
            .map(i -> i.intValue())
            .take(Duration.ofMinutes(5)); // 5분간만 실행
    }
    
    // 백프레셔 자동 처리
    public Flux<String> backpressureHandling() {
        return Flux.range(1, 1000000) // 100만개 요소
            .map(i -> "Item " + i)
            .onBackpressureBuffer(1000) // 버퍼 크기 제한
            .publishOn(Schedulers.parallel()); // 병렬 처리
    }
}
```

__무한 스트림 처리 예제__:

```java
// 📊 실시간 광고 클릭 스트림 처리
@Service
public class AdClickStreamProcessor {
    
    private final Sinks.Many<ClickEvent> clickSink = Sinks.many().multicast().onBackpressureBuffer();
    
    // 무한 클릭 이벤트 스트림 생성
    public Flux<ClickEvent> createClickStream() {
        return clickSink.asFlux()
            .doOnSubscribe(subscription -> 
                log.info("새로운 구독자가 클릭 스트림에 연결됨"))
            .doOnCancel(() -> 
                log.info("구독자가 클릭 스트림에서 연결 해제됨"));
    }
    
    // 실시간 클릭 집계 (1분 윈도우)
    public Flux<ClickAggregation> realTimeAggregation() {
        return createClickStream()
            .window(Duration.ofMinutes(1)) // 1분 윈도우
            .flatMap(window -> 
                window.groupBy(ClickEvent::getAdId)
                    .flatMap(group -> 
                        group.count()
                            .map(count -> new ClickAggregation(
                                group.key(), 
                                count, 
                                Instant.now()
                            ))
                    )
            )
            .doOnNext(aggregation -> 
                log.info("광고 {} 클릭 수: {}", 
                    aggregation.getAdId(), aggregation.getCount()));
    }
    
    // 이상 패턴 감지
    public Flux<AlertEvent> anomalyDetection() {
        return realTimeAggregation()
            .buffer(Duration.ofMinutes(5), Duration.ofMinutes(1)) // 5분 슬라이딩 윈도우
            .map(this::detectAnomalies)
            .filter(Optional::isPresent)
            .map(Optional::get);
    }
    
    private Optional<AlertEvent> detectAnomalies(List<ClickAggregation> aggregations) {
        double avgClicks = aggregations.stream()
            .mapToLong(ClickAggregation::getCount)
            .average()
            .orElse(0.0);
            
        long maxClicks = aggregations.stream()
            .mapToLong(ClickAggregation::getCount)
            .max()
            .orElse(0L);
            
        // 평균의 3배 이상이면 이상 패턴
        if (maxClicks > avgClicks * 3) {
            return Optional.of(new AlertEvent(
                "클릭 급증 감지", 
                maxClicks, 
                avgClicks
            ));
        }
        
        return Optional.empty();
    }
    
    // 외부에서 클릭 이벤트 주입
    public void emitClickEvent(ClickEvent event) {
        clickSink.tryEmitNext(event);
    }
}
```

__백프레셔 처리 전략__:

```java
// 🔄 다양한 백프레셔 전략
@Component
public class BackpressureStrategies {
    
    // 전략 1: 버퍼링
    public Flux<ProcessedEvent> bufferingStrategy(Flux<RawEvent> source) {
        return source
            .onBackpressureBuffer(
                10000, // 버퍼 크기
                event -> log.warn("이벤트 드롭됨: {}", event), // 드롭 콜백
                BufferOverflowStrategy.DROP_OLDEST // 오래된 것부터 드롭
            )
            .map(this::processEvent)
            .publishOn(Schedulers.parallel());
    }
    
    // 전략 2: 샘플링
    public Flux<ProcessedEvent> samplingStrategy(Flux<RawEvent> source) {
        return source
            .sample(Duration.ofSeconds(1)) // 1초마다 최신 값만 샘플링
            .map(this::processEvent);
    }
    
    // 전략 3: 배치 처리
    public Flux<List<ProcessedEvent>> batchingStrategy(Flux<RawEvent> source) {
        return source
            .buffer(Duration.ofSeconds(5)) // 5초마다 배치 처리
            .filter(batch -> !batch.isEmpty())
            .map(batch -> batch.stream()
                .map(this::processEvent)
                .collect(Collectors.toList()));
    }
    
    // 전략 4: 동적 조절
    public Flux<ProcessedEvent> adaptiveStrategy(Flux<RawEvent> source) {
        return source
            .onBackpressureBuffer()
            .publishOn(Schedulers.parallel())
            .map(event -> {
                // 처리 시간 측정
                long startTime = System.currentTimeMillis();
                ProcessedEvent result = processEvent(event);
                long processingTime = System.currentTimeMillis() - startTime;
                
                // 처리 시간이 길면 경고
                if (processingTime > 1000) {
                    log.warn("처리 시간 지연: {}ms", processingTime);
                }
                
                return result;
            });
    }
    
    private ProcessedEvent processEvent(RawEvent event) {
        // 실제 이벤트 처리 로직
        return new ProcessedEvent(event.getId(), event.getData().toUpperCase());
    }
}
```

__Websocket__:

```java
// 🌐 WebSocket + Reactor 실시간 통신
@Controller
public class RealtimeWebSocketController {
    
    private final SystemMonitoringService monitoringService;
    
    @MessageMapping("metrics.subscribe")
    public Flux<MetricEvent> subscribeToMetrics() {
        return monitoringService.combinedMetricsStream()
            .doOnSubscribe(subscription -> 
                log.info("클라이언트가 메트릭 스트림 구독 시작"))
            .doOnCancel(() -> 
                log.info("클라이언트가 메트릭 스트림 구독 취소"))
            .doOnError(error -> 
                log.error("메트릭 스트림 에러", error));
    }
    
    @MessageMapping("alerts.subscribe")
    public Flux<AlertEvent> subscribeToAlerts() {
        return monitoringService.alertStream()
            .doOnNext(alert -> 
                log.info("알림 전송: {}", alert.getMessage()));
    }
    
    // 특정 메트릭만 구독
    @MessageMapping("metrics.subscribe.{metricName}")
    public Flux<MetricEvent> subscribeToSpecificMetric(@DestinationVariable String metricName) {
        return monitoringService.combinedMetricsStream()
            .filter(metric -> metricName.equals(metric.getName()))
            .take(Duration.ofMinutes(30)); // 30분 후 자동 구독 해제
    }
}
```

__Error Handling & Recovery__:

```java
// 🛡️ 에러 처리 및 복구
@Service
public class ResilientStreamProcessor {
    
    // 에러 복구 전략
    public Flux<ProcessedEvent> resilientProcessing(Flux<RawEvent> source) {
        return source
            .map(this::processEvent)
            .onErrorContinue((error, event) -> {
                // 개별 이벤트 에러는 로그만 남기고 계속 진행
                log.error("이벤트 처리 실패: {}", event, error);
                meterRegistry.counter("event.processing.error").increment();
            })
            .retry(3) // 전체 스트림 에러 시 3번 재시도
            .onErrorResume(error -> {
                // 최종 실패 시 대체 스트림 제공
                log.error("스트림 처리 최종 실패, 대체 스트림으로 전환", error);
                return createFallbackStream();
            });
    }
    
    // 서킷 브레이커 패턴
    public Flux<ProcessedEvent> circuitBreakerProcessing(Flux<RawEvent> source) {
        CircuitBreaker circuitBreaker = CircuitBreaker.ofDefaults("eventProcessor");
        
        return source
            .map(event -> circuitBreaker.executeSupplier(() -> processEvent(event)))
            .onErrorMap(CallNotPermittedException.class, 
                ex -> new ServiceUnavailableException("서비스 일시 중단"))
            .retryWhen(Retry.backoff(3, Duration.ofSeconds(1))
                .filter(throwable -> !(throwable instanceof ServiceUnavailableException)));
    }
    
    // 타임아웃 처리
    public Flux<ProcessedEvent> timeoutProcessing(Flux<RawEvent> source) {
        return source
            .flatMap(event -> 
                processEventAsync(event)
                    .timeout(Duration.ofSeconds(5)) // 5초 타임아웃
                    .onErrorReturn(TimeoutException.class, 
                        new ProcessedEvent(event.getId(), "TIMEOUT"))
            );
    }
    
    private Mono<ProcessedEvent> processEventAsync(RawEvent event) {
        return Mono.fromCallable(() -> processEvent(event))
            .subscribeOn(Schedulers.boundedElastic());
    }
    
    private Flux<ProcessedEvent> createFallbackStream() {
        return Flux.interval(Duration.ofSeconds(10))
            .map(i -> new ProcessedEvent("fallback-" + i, "FALLBACK_DATA"));
    }
}
```

### Data streaming to NDJSON Format

Flux 를 아래 처럼 사용하면 NDJSON 형식으로 데이터가 스트리밍 된다. NDJSON 은 다음과 같이 new line 으로 row 를 쪼개는 형식이다.

```
{"json":"object"}\n
{"json":"object"}\n
```

__Flux__:

```java
@GetMapping(path="/coupons-stream", produces=APPLICATION_NDJSON)
public Flux<CouponDto> getCouponStream(CouponSearchParams params) {  
    return couponSearchService.findFlux(params)
        .map(CouponDto::from);
}
```

- [streaming API 를 사용한 네이버페이의 대형 XLSX 파일 다운로드 구현](https://d2.naver.com/helloworld/9423440)

## HTTP2

### Pipelining Processing

```java
// 🔄 HTTP/2의 파이프라인 개념
public class HTTP2Pipeline {
    
    // 전통적인 스트림 파이프라인
    public void traditionalStreamPipeline() {
        // Input → Filter → Transform → Output
        inputStream
            .filter(data -> data.isValid())
            .map(data -> transform(data))
            .forEach(result -> output(result));
    }
    
    // HTTP/2의 유사한 파이프라인
    public void http2Pipeline() {
        // Request → Frame → Multiplex → Response
        
        // 1. 요청을 프레임으로 분할
        List<Frame> frames = splitIntoFrames(httpRequest);
        
        // 2. 스트림 ID로 멀티플렉싱
        frames.forEach(frame -> {
            frame.setStreamId(streamId);
            connection.sendFrame(frame); // 연속적 전송
        });
        
        // 3. 응답 프레임들을 스트림별로 재조립
        connection.onFrameReceived(frame -> {
            if (frame.getStreamId() == streamId) {
                assembleResponse(frame); // 스트림 재구성
            }
        });
    }
}
```

### Flow Control

```java
// 🔄 HTTP/2의 플로우 컨트롤 = 스트림의 백프레셔
public class HTTP2FlowControl {
    
    private int connectionWindowSize = 65535;  // 연결 레벨 윈도우
    private int streamWindowSize = 65535;      // 스트림 레벨 윈도우
    
    // 스트림 백프레셔 구현
    public void sendData(int streamId, byte[] data) {
        int dataSize = data.length;
        
        // 1. 연결 레벨 플로우 컨트롤 확인
        if (connectionWindowSize < dataSize) {
            // 백프레셔 발생 - 전송 대기
            waitForWindowUpdate();
        }
        
        // 2. 스트림 레벨 플로우 컨트롤 확인  
        if (streamWindowSize < dataSize) {
            // 스트림별 백프레셔 - 해당 스트림만 대기
            waitForStreamWindowUpdate(streamId);
        }
        
        // 3. 데이터 전송 및 윈도우 크기 감소
        sendDataFrame(streamId, data);
        connectionWindowSize -= dataSize;
        streamWindowSize -= dataSize;
    }
    
    // 윈도우 업데이트 수신 (백프레셔 해제)
    public void onWindowUpdate(int streamId, int increment) {
        if (streamId == 0) {
            // 연결 레벨 윈도우 업데이트
            connectionWindowSize += increment;
        } else {
            // 특정 스트림 윈도우 업데이트
            updateStreamWindow(streamId, increment);
        }
        
        // 대기 중인 데이터 전송 재개
        resumePendingTransmissions();
    }
}
```

### Multiplexing; Stream Interleaving

```java
// 🔄 HTTP/2의 멀티플렉싱 = 스트림의 인터리빙
public class HTTP2Multiplexing {
    
    // 여러 스트림이 하나의 연결을 공유
    public void demonstrateMultiplexing() {
        
        // 동시에 여러 스트림 처리
        Map<Integer, StreamState> activeStreams = new ConcurrentHashMap<>();
        
        // 스트림 1: 큰 파일 다운로드
        activeStreams.put(1, new StreamState(StreamType.FILE_DOWNLOAD));
        
        // 스트림 3: API 요청
        activeStreams.put(3, new StreamState(StreamType.API_REQUEST));
        
        // 스트림 5: 실시간 데이터
        activeStreams.put(5, new StreamState(StreamType.REALTIME_DATA));
        
        // 프레임 단위로 인터리빙 전송
        while (hasActiveStreams()) {
            for (Integer streamId : activeStreams.keySet()) {
                
                // 각 스트림에서 프레임 생성
                Frame frame = generateNextFrame(streamId);
                
                if (frame != null) {
                    // 스트림들이 번갈아가며 프레임 전송
                    sendFrame(frame);
                    
                    // 스트림 본질: 연속적이지만 인터리빙됨
                    logStreamProgress(streamId, frame);
                }
            }
        }
    }
    
    // 실제 스트림 처리와 유사한 패턴
    public void streamLikeProcessing() {
        
        // 각 HTTP/2 스트림을 Reactive Stream처럼 처리
        Flux.fromIterable(activeStreams.keySet())
            .flatMap(streamId -> 
                processStreamFrames(streamId)
                    .takeUntil(frame -> frame.isEndStream())
            )
            .subscribe(frame -> handleFrame(frame));
    }
    
    private Flux<Frame> processStreamFrames(int streamId) {
        return Flux.create(sink -> {
            // 스트림에서 프레임을 연속적으로 생성
            while (!isStreamClosed(streamId)) {
                Frame frame = readNextFrame(streamId);
                if (frame != null) {
                    sink.next(frame);
                }
                
                if (frame != null && frame.isEndStream()) {
                    sink.complete();
                    break;
                }
            }
        });
    }
}
```

### Server Push

```java
// 🔄 Server Push = 서버 주도적 스트림 생성
public class HTTP2ServerPush {
    
    // 전통적인 스트림: 생산자가 데이터를 푸시
    public void traditionalProducerPush() {
        
        // 생산자가 소비자에게 데이터를 푸시
        Flux<Event> eventStream = Flux.create(sink -> {
            eventProducer.onEvent(event -> {
                sink.next(event); // 생산자 주도적 푸시
            });
        });
        
        eventStream.subscribe(event -> handleEvent(event));
    }
    
    // HTTP/2 Server Push: 서버가 클라이언트에게 리소스 푸시
    public void http2ServerPush(HTTP2Connection connection, HTTP2Stream mainStream) {
        
        // 메인 요청 처리
        mainStream.onHeaders(headers -> {
            if ("/index.html".equals(headers.getPath())) {
                
                // 서버가 필요할 것 같은 리소스들을 미리 푸시
                pushResource(connection, "/css/style.css");
                pushResource(connection, "/js/app.js");
                pushResource(connection, "/images/logo.png");
                
                // 메인 응답 전송
                sendMainResponse(mainStream);
            }
        });
    }
    
    private void pushResource(HTTP2Connection connection, String path) {
        // 새로운 스트림 생성 (서버 주도)
        HTTP2Stream pushStream = connection.createPushStream();
        
        // PUSH_PROMISE 프레임 전송
        PushPromiseFrame promise = new PushPromiseFrame();
        promise.setPromisedStreamId(pushStream.getId());
        promise.setHeaders(createHeaders("GET", path));
        connection.sendFrame(promise);
        
        // 실제 리소스 데이터 스트리밍
        byte[] resourceData = loadResource(path);
        pushStream.sendHeaders(createResponseHeaders());
        pushStream.sendData(resourceData);
        pushStream.sendEndStream();
    }
}
```

### Implementation

__Client__:

```java
// 🌐 HTTP/2 클라이언트에서 스트림 활용
@Service
public class HTTP2StreamClient {
    
    private final HTTP2Connection connection;
    
    // 스트림 기반 파일 업로드
    public Mono<UploadResponse> uploadFileStream(String filePath) {
        return Mono.create(sink -> {
            
            HTTP2Stream stream = connection.createStream();
            
            // 헤더 전송
            Headers headers = new Headers()
                .method("POST")
                .path("/upload")
                .contentType("application/octet-stream");
            stream.sendHeaders(headers);
            
            // 파일을 청크 단위로 스트리밍
            try (FileInputStream fileStream = new FileInputStream(filePath)) {
                byte[] buffer = new byte[8192];
                int bytesRead;
                
                while ((bytesRead = fileStream.read(buffer)) != -1) {
                    // 스트림의 본질: 연속적 데이터 전송
                    byte[] chunk = Arrays.copyOf(buffer, bytesRead);
                    stream.sendData(chunk);
                    
                    // 백프레셔 확인
                    if (stream.getWindowSize() < 8192) {
                        stream.waitForWindowUpdate();
                    }
                }
                
                stream.sendEndStream();
                
            } catch (IOException e) {
                stream.sendRstStream(ErrorCode.INTERNAL_ERROR);
                sink.error(e);
            }
            
            // 응답 수신
            stream.onComplete(response -> {
                sink.success(new UploadResponse(response));
            });
        });
    }
    
    // 병렬 스트림 처리
    public Flux<ApiResponse> parallelApiCalls(List<ApiRequest> requests) {
        return Flux.fromIterable(requests)
            .flatMap(request -> {
                // 각 요청마다 새로운 스트림 생성
                HTTP2Stream stream = connection.createStream();
                
                return Mono.create(sink -> {
                    // 요청 전송
                    stream.sendHeaders(createHeaders(request));
                    stream.sendData(serialize(request));
                    stream.sendEndStream();
                    
                    // 응답 수신
                    stream.onComplete(response -> {
                        sink.success(deserialize(response));
                    });
                    
                    stream.onError(error -> {
                        sink.error(new ApiException(error));
                    });
                });
            }, 10); // 최대 10개 동시 스트림
    }
    
    // 실시간 데이터 스트리밍
    public Flux<ServerSentEvent> subscribeToEvents() {
        return Flux.create(sink -> {
            
            HTTP2Stream stream = connection.createStream();
            
            // SSE 구독 요청
            Headers headers = new Headers()
                .method("GET")
                .path("/events")
                .accept("text/event-stream");
            stream.sendHeaders(headers);
            stream.sendEndStream();
            
            // 서버로부터 연속적인 이벤트 수신
            stream.onData(data -> {
                ServerSentEvent event = parseSSE(data);
                sink.next(event); // 스트림의 본질: 연속적 데이터 흐름
            });
            
            stream.onComplete(response -> {
                sink.complete();
            });
            
            stream.onError(error -> {
                sink.error(error);
            });
        });
    }
}
```

__Server__:

```java
// 🖥️ HTTP/2 서버에서 스트림 처리
@RestController
public class HTTP2StreamController {
    
    // 스트리밍 응답
    @GetMapping(value = "/stream-data", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<ServerSentEvent> streamData() {
        
        return Flux.interval(Duration.ofSeconds(1))
            .map(sequence -> {
                // 스트림의 본질: 시간에 따른 연속적 데이터 생성
                String data = generateRealtimeData();
                
                return ServerSentEvent.builder()
                    .id(String.valueOf(sequence))
                    .event("data-update")
                    .data(data)
                    .build();
            })
            .take(Duration.ofMinutes(5)) // 5분간 스트리밍
            .doOnSubscribe(subscription -> 
                log.info("클라이언트가 스트림 구독 시작"))
            .doOnCancel(() -> 
                log.info("클라이언트가 스트림 구독 취소"));
    }
    
    // 파일 스트리밍 다운로드
    @GetMapping("/download/{fileId}")
    public ResponseEntity<StreamingResponseBody> downloadFile(@PathVariable String fileId) {
        
        StreamingResponseBody stream = outputStream -> {
            try (FileInputStream fileStream = new FileInputStream(getFilePath(fileId))) {
                
                byte[] buffer = new byte[8192];
                int bytesRead;
                
                // 스트림의 본질: 청크 단위 연속 전송
                while ((bytesRead = fileStream.read(buffer)) != -1) {
                    outputStream.write(buffer, 0, bytesRead);
                    outputStream.flush();
                    
                    // HTTP/2의 플로우 컨트롤이 자동으로 백프레셔 처리
                }
            }
        };
        
        return ResponseEntity.ok()
            .contentType(MediaType.APPLICATION_OCTET_STREAM)
            .body(stream);
    }
}
```

## Database Stream Processing

```java
// 📊 실시간 데이터베이스 스트림 분석
@Service
public class DatabaseStreamAnalytics {
    
    // 실시간 사용자 활동 분석
    public void analyzeUserActivity() {
        
        // 사용자 로그인 이벤트 스트림
        KStream<String, LoginEvent> loginStream = builder
            .stream("user.login.events");
            
        // 실시간 집계: 분당 로그인 수
        KTable<Windowed<String>, Long> loginCounts = loginStream
            .groupByKey()
            .windowedBy(TimeWindows.of(Duration.ofMinutes(1)))
            .count();
            
        // 이상 패턴 감지
        loginCounts.toStream()
            .filter((window, count) -> count > 1000) // 분당 1000회 초과
            .foreach((window, count) -> 
                alertService.sendAlert("높은 로그인 활동 감지: " + count));
    }
    
    // 실시간 주문 처리 스트림
    public void processOrderStream() {
        
        KStream<String, OrderEvent> orderStream = builder
            .stream("orders.events");
            
        // 주문 상태별 분기 처리
        KStream<String, OrderEvent>[] branches = orderStream
            .branch(
                (key, order) -> "CREATED".equals(order.getStatus()),
                (key, order) -> "PAID".equals(order.getStatus()),
                (key, order) -> "SHIPPED".equals(order.getStatus()),
                (key, order) -> "DELIVERED".equals(order.getStatus())
            );
            
        // 각 상태별 처리
        branches[0].foreach((key, order) -> processNewOrder(order));
        branches[1].foreach((key, order) -> processPayment(order));
        branches[2].foreach((key, order) -> updateShipping(order));
        branches[3].foreach((key, order) -> completeOrder(order));
    }
}
```

## File I/O Stream

```java
// 📁 파일 시스템에서의 스트림 처리
public class FileSystemStreams {
    
    // 대용량 파일 스트리밍 처리
    public void processLargeFile(String filePath) throws IOException {
        
        // 파일을 스트림으로 읽어 메모리 효율적 처리
        try (Stream<String> lines = Files.lines(Paths.get(filePath))) {
            
            lines.parallel() // 병렬 처리
                .filter(line -> !line.trim().isEmpty())
                .map(this::parseLine)
                .filter(Objects::nonNull)
                .forEach(this::processRecord);
        }
    }
    
    // 실시간 파일 변경 감지 스트림
    public Flux<FileChangeEvent> watchFileChanges(String directoryPath) {
        
        return Flux.create(sink -> {
            try {
                WatchService watchService = FileSystems.getDefault().newWatchService();
                Path path = Paths.get(directoryPath);
                
                path.register(watchService, 
                    StandardWatchEventKinds.ENTRY_CREATE,
                    StandardWatchEventKinds.ENTRY_MODIFY,
                    StandardWatchEventKinds.ENTRY_DELETE);
                
                // 무한 스트림: 파일 변경사항 감지
                while (!Thread.currentThread().isInterrupted()) {
                    WatchKey key = watchService.take();
                    
                    for (WatchEvent<?> event : key.pollEvents()) {
                        FileChangeEvent changeEvent = new FileChangeEvent(
                            event.kind().name(),
                            event.context().toString(),
                            Instant.now()
                        );
                        
                        sink.next(changeEvent);
                    }
                    
                    key.reset();
                }
                
            } catch (Exception e) {
                sink.error(e);
            }
        });
    }
    
    // 로그 파일 실시간 테일링
    public Flux<String> tailLogFile(String logFilePath) {
        
        return Flux.create(sink -> {
            try (RandomAccessFile file = new RandomAccessFile(logFilePath, "r")) {
                
                // 파일 끝으로 이동
                file.seek(file.length());
                
                while (!Thread.currentThread().isInterrupted()) {
                    String line = file.readLine();
                    
                    if (line != null) {
                        sink.next(line); // 새로운 로그 라인 스트리밍
                    } else {
                        // 새로운 내용이 없으면 잠시 대기
                        Thread.sleep(100);
                    }
                }
                
            } catch (Exception e) {
                sink.error(e);
            }
        });
    }
}
```

## Websocket Realtime Stream

```java
// 🌐 WebSocket 실시간 스트림
@Component
public class WebSocketStreamHandler extends TextWebSocketHandler {
    
    private final Sinks.Many<WebSocketMessage> messageSink = 
        Sinks.many().multicast().onBackpressureBuffer();
    
    // WebSocket 메시지 스트림
    public Flux<WebSocketMessage> getMessageStream() {
        return messageSink.asFlux();
    }
    
    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        log.info("WebSocket 연결 설정: {}", session.getId());
        
        // 실시간 데이터 스트림을 클라이언트에게 전송
        getRealtimeDataStream()
            .subscribe(data -> {
                try {
                    session.sendMessage(new TextMessage(data));
                } catch (IOException e) {
                    log.error("메시지 전송 실패", e);
                }
            });
    }
    
    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) {
        // 수신된 메시지를 스트림에 발행
        WebSocketMessage wsMessage = new WebSocketMessage(
            session.getId(), 
            message.getPayload(), 
            Instant.now()
        );
        
        messageSink.tryEmitNext(wsMessage);
    }
    
    private Flux<String> getRealtimeDataStream() {
        return Flux.interval(Duration.ofSeconds(1))
            .map(tick -> generateRealtimeData())
            .share();
    }
}
```

## Distributed Event Streaming Platform

```java
// 📨 Kafka Streams 처리
@Service
public class KafkaStreamProcessor {
    
    // 실시간 이벤트 스트림 처리
    public void processEventStream() {
        
        Properties props = new Properties();
        props.put(StreamsConfig.APPLICATION_ID_CONFIG, "event-processor");
        props.put(StreamsConfig.BOOTSTRAP_SERVERS_CONFIG, "localhost:9092");
        
        StreamsBuilder builder = new StreamsBuilder();
        
        // 사용자 이벤트 스트림
        KStream<String, UserEvent> userEvents = builder.stream("user-events");
        
        // 실시간 사용자 세션 추적
        KTable<String, UserSession> userSessions = userEvents
            .groupByKey()
            .aggregate(
                UserSession::new,
                (key, event, session) -> session.addEvent(event),
                Materialized.with(Serdes.String(), userSessionSerde())
            );
        
        // 이상 행동 패턴 감지
        userEvents
            .filter((key, event) -> isAnomalousEvent(event))
            .to("anomaly-alerts");
        
        // 실시간 추천 시스템
        userEvents
            .filter((key, event) -> "PRODUCT_VIEW".equals(event.getType()))
            .groupByKey()
            .windowedBy(TimeWindows.of(Duration.ofMinutes(30)))
            .aggregate(
                ProductViewAggregation::new,
                (key, event, agg) -> agg.addView(event),
                Materialized.with(Serdes.String(), productViewSerde())
            )
            .toStream()
            .map((window, agg) -> generateRecommendations(agg))
            .to("user-recommendations");
        
        KafkaStreams streams = new KafkaStreams(builder.build(), props);
        streams.start();
    }
}
```

## Multi-Media Stream

```java
// 🎥 멀티미디어 스트리밍
@RestController
public class MediaStreamController {
    
    // 비디오 스트리밍
    @GetMapping("/video/{videoId}")
    public ResponseEntity<StreamingResponseBody> streamVideo(
            @PathVariable String videoId,
            @RequestHeader(value = "Range", required = false) String rangeHeader) {
        
        File videoFile = getVideoFile(videoId);
        long fileSize = videoFile.length();
        
        // HTTP Range 요청 처리 (비디오 시킹)
        long start = 0;
        long end = fileSize - 1;
        
        if (rangeHeader != null) {
            String[] ranges = rangeHeader.replace("bytes=", "").split("-");
            start = Long.parseLong(ranges[0]);
            if (ranges.length > 1 && !ranges[1].isEmpty()) {
                end = Long.parseLong(ranges[1]);
            }
        }
        
        long contentLength = end - start + 1;
        final long finalStart = start;
        final long finalEnd = end;
        
        StreamingResponseBody stream = outputStream -> {
            try (RandomAccessFile file = new RandomAccessFile(videoFile, "r")) {
                
                file.seek(finalStart);
                byte[] buffer = new byte[8192];
                long bytesToRead = finalEnd - finalStart + 1;
                
                while (bytesToRead > 0) {
                    int bytesRead = file.read(buffer, 0, 
                        (int) Math.min(buffer.length, bytesToRead));
                    
                    if (bytesRead == -1) break;
                    
                    outputStream.write(buffer, 0, bytesRead);
                    bytesToRead -= bytesRead;
                }
            }
        };
        
        return ResponseEntity.status(HttpStatus.PARTIAL_CONTENT)
            .header("Content-Type", "video/mp4")
            .header("Accept-Ranges", "bytes")
            .header("Content-Length", String.valueOf(contentLength))
            .header("Content-Range", String.format("bytes %d-%d/%d", 
                finalStart, finalEnd, fileSize))
            .body(stream);
    }
    
    // 실시간 오디오 스트리밍
    @GetMapping(value = "/audio/live", produces = "audio/mpeg")
    public Flux<DataBuffer> streamLiveAudio() {
        
        return Flux.create(sink -> {
            
            // 마이크로부터 실시간 오디오 캡처
            AudioFormat format = new AudioFormat(44100, 16, 2, true, false);
            DataLine.Info info = new DataLine.Info(TargetDataLine.class, format);
            
            try {
                TargetDataLine microphone = (TargetDataLine) AudioSystem.getLine(info);
                microphone.open(format);
                microphone.start();
                
                byte[] buffer = new byte[4096];
                
                while (!Thread.currentThread().isInterrupted()) {
                    int bytesRead = microphone.read(buffer, 0, buffer.length);
                    
                    if (bytesRead > 0) {
                        DataBuffer dataBuffer = new DefaultDataBufferFactory()
                            .wrap(Arrays.copyOf(buffer, bytesRead));
                        sink.next(dataBuffer);
                    }
                }
                
                microphone.close();
                
            } catch (Exception e) {
                sink.error(e);
            }
        });
    }
}
```

## Log Stream

```java
// 📋 로그 스트림 처리
@Service
public class LogStreamProcessor {
    
    // ELK 스택과 연동한 로그 스트림
    public void processLogStream() {
        
        // Logstash로부터 로그 스트림 수신
        Flux<LogEntry> logStream = createLogStream();
        
        // 실시간 로그 분석
        logStream
            .window(Duration.ofMinutes(1)) // 1분 윈도우
            .flatMap(window -> 
                window.groupBy(LogEntry::getLevel)
                    .flatMap(levelGroup -> 
                        levelGroup.count()
                            .map(count -> new LogLevelCount(
                                levelGroup.key(), count, Instant.now()))
                    )
            )
            .subscribe(count -> updateLogMetrics(count));
        
        // 에러 로그 실시간 알림
        logStream
            .filter(log -> "ERROR".equals(log.getLevel()))
            .buffer(Duration.ofSeconds(30)) // 30초 배치
            .filter(errors -> errors.size() > 10) // 30초에 10개 이상 에러
            .subscribe(errors -> sendErrorAlert(errors));
        
        // 보안 이벤트 감지
        logStream
            .filter(this::isSecurityEvent)
            .groupBy(LogEntry::getSourceIp)
            .flatMap(ipGroup -> 
                ipGroup.window(Duration.ofMinutes(5))
                    .flatMap(window -> window.count())
                    .filter(count -> count > 100) // 5분에 100회 이상
                    .map(count -> new SecurityAlert(ipGroup.key(), count))
            )
            .subscribe(alert -> handleSecurityAlert(alert));
    }
    
    private Flux<LogEntry> createLogStream() {
        return Flux.create(sink -> {
            
            // Kafka에서 로그 스트림 구독
            KafkaConsumer<String, String> consumer = createKafkaConsumer();
            consumer.subscribe(Arrays.asList("application-logs"));
            
            while (!Thread.currentThread().isInterrupted()) {
                ConsumerRecords<String, String> records = consumer.poll(Duration.ofMillis(100));
                
                for (ConsumerRecord<String, String> record : records) {
                    LogEntry logEntry = parseLogEntry(record.value());
                    sink.next(logEntry);
                }
            }
        });
    }
}
```

## IoT Data Stream

```java
// 🌡️ IoT 센서 데이터 스트림
@Service
public class IoTDataStreamProcessor {
    
    // 온도 센서 데이터 스트림
    public Flux<TemperatureReading> processTemperatureStream() {
        
        return Flux.interval(Duration.ofSeconds(5))
            .map(tick -> readTemperatureSensor())
            .filter(reading -> reading.isValid())
            .share();
    }
    
    // 실시간 환경 모니터링
    public void setupEnvironmentMonitoring() {
        
        Flux<TemperatureReading> tempStream = processTemperatureStream();
        Flux<HumidityReading> humidityStream = processHumidityStream();
        Flux<AirQualityReading> airQualityStream = processAirQualityStream();
        
        // 센서 데이터 통합
        Flux<EnvironmentData> combinedStream = Flux.combineLatest(
            tempStream,
            humidityStream,
            airQualityStream,
            EnvironmentData::new
        );
        
        // 이상 환경 감지
        combinedStream
            .filter(this::isAbnormalEnvironment)
            .subscribe(data -> triggerEnvironmentAlert(data));
        
        // 시간별 환경 데이터 집계
        combinedStream
            .window(Duration.ofHours(1))
            .flatMap(window -> 
                window.reduce(new EnvironmentAggregation(),
                    (agg, data) -> agg.add(data))
            )
            .subscribe(hourlyData -> saveHourlyData(hourlyData));
    }
    
    // 스마트 빌딩 에너지 관리
    public void processEnergyStream() {
        
        Flux<EnergyReading> energyStream = createEnergyStream();
        
        // 실시간 에너지 사용량 모니터링
        energyStream
            .window(Duration.ofMinutes(15)) // 15분 윈도우
            .flatMap(window -> 
                window.reduce(0.0, (sum, reading) -> sum + reading.getConsumption())
            )
            .subscribe(consumption -> {
                if (consumption > ENERGY_THRESHOLD) {
                    optimizeEnergyUsage();
                }
            });
        
        // 예측적 유지보수
        energyStream
            .buffer(Duration.ofDays(1)) // 일일 데이터
            .map(this::analyzeEnergyPattern)
            .filter(analysis -> analysis.requiresMaintenance())
            .subscribe(analysis -> scheduleMaintenanceAlert(analysis));
    }
}
```

## Finance Stream

```java
// 💰 금융 거래 실시간 스트림
@Service
public class FinancialStreamProcessor {
    
    // 실시간 주식 가격 스트림
    public Flux<StockPrice> createStockPriceStream(String symbol) {
        
        return Flux.create(sink -> {
            
            // WebSocket으로 실시간 주식 데이터 수신
            WebSocketClient client = new StandardWebSocketClient();
            
            client.doHandshake(new WebSocketHandler() {
                @Override
                public void afterConnectionEstablished(WebSocketSession session) {
                    // 주식 심볼 구독
                    session.sendMessage(new TextMessage(
                        "{\"action\":\"subscribe\",\"symbols\":\"" + symbol + "\"}"
                    ));
                }
                
                @Override
                protected void handleTextMessage(WebSocketSession session, TextMessage message) {
                    StockPrice price = parseStockPrice(message.getPayload());
                    sink.next(price);
                }
            }, "wss://api.stockexchange.com/stream");
        });
    }
    
    // 실시간 거래 분석
    public void setupTradingAnalysis() {
        
        Flux<StockPrice> priceStream = createStockPriceStream("AAPL");
        
        // 이동평균 계산
        priceStream
            .window(Duration.ofMinutes(5)) // 5분 윈도우
            .flatMap(window -> 
                window.reduce(new MovingAverage(), 
                    (avg, price) -> avg.add(price.getPrice()))
            )
            .subscribe(movingAvg -> updateTradingIndicators(movingAvg));
        
        // 급격한 가격 변동 감지
        priceStream
            .buffer(2, 1) // 슬라이딩 윈도우
            .filter(prices -> {
                if (prices.size() < 2) return false;
                double change = Math.abs(prices.get(1).getPrice() - prices.get(0).getPrice());
                return change > VOLATILITY_THRESHOLD;
            })
            .subscribe(prices -> triggerVolatilityAlert(prices));
        
        // 실시간 포트폴리오 평가
        priceStream
            .map(price -> calculatePortfolioValue(price))
            .distinctUntilChanged()
            .subscribe(value -> updatePortfolioValue(value));
    }
    
    // 사기 거래 탐지
    public void setupFraudDetection() {
        
        Flux<Transaction> transactionStream = createTransactionStream();
        
        // 실시간 사기 패턴 분석
        transactionStream
            .groupBy(Transaction::getUserId)
            .flatMap(userTransactions -> 
                userTransactions
                    .window(Duration.ofMinutes(10)) // 10분 윈도우
                    .flatMap(window -> 
                        window.collectList()
                            .map(this::analyzeFraudPattern)
                            .filter(FraudAnalysis::isSuspicious)
                    )
            )
            .subscribe(suspiciousActivity -> blockSuspiciousTransaction(suspiciousActivity));
    }
}
```

## References

- Designing Data-Intensive Application / Martin Kleppmann
- System Design Interview Volume 2 / Alex Xu, Sahn Lam
- Streaming Systems / Tyler Akidau
