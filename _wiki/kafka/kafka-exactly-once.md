---
layout  : wiki
title   : Exactly-once processing strategy in an Event-Driven Architectures
summary : Producer Delivery, Message Delivery Guarantees
date    : 2025-06-09 11:54:32 +0900
updated : 2025-06-09 12:15:24 +0900
tag     : kafka architecture eventdriven
toc     : true
comment : true
public  : true
parent  : [[/kafka]]
latex   : true
---
* TOC
{:toc}

## Exactly-once processing strategy in an Event-Driven Architectures

__[Producer Delivery](https://docs.confluent.io/kafka/design/delivery-semantics.html)__:

Kafka 는 Kafka Streams 에서 정확히 한 번 전달을 지원하고, Kafka 토픽 간에 데이터를 전송하고 처리할 때 트랜잭션 생산자와 소비자를 사용하여 정확히 한 번 전달을 제공한다.

![](/resource/wiki/kafka-exactly-once/producer-delivery.png)

NATS Core 의 경우에는 lowest latency 가 핵심 철학 중 하나 이므로, At most once 를 지원한다.

![](/resource/wiki/kafka-exactly-once/nats.png)

Kafka, SQS, SNS, Pub/Sub 등 대부분의 메시징 시스템은 기본적으로 at-least-once 처리를 보장하며,
Exactly-once 는 소비자(Consumer)의 책임으로 구현해야 한다.

### When does message duplication occur?

- Consumer 예외 발생:	메시지 처리 중 예외가 나면 offset commit 이 안 되고 같은 메시지를 다시 consume
- 네트워크 타임아웃: 메시지 처리가 완료되었지만 응답 실패로 재시도
- Kafka 리밸런싱: Consumer Group 리밸런싱 중 같은 메시지가 다른 consumer 에게 전달
- 수동 ack 처리 누락: ack 전에 예외 발생 시 중복 처리

### Exactly Once Strategy

Exactly Once 전략은 중복은 피할 수 없지만, “중복된 것처럼 보이지 않게” 만드는 것이 핵심이다.

#### Idempotent Consumer

> 같은 메시지가 여러 번 와도 처리 결과가 한 번 처리된 것과 동일해야 한다.

가장 간단하게 Redis 기반 deduplication or DB 기반 idempotency 로 구현할 수 있다.

```kotlin
fun handle(event: PromotionEvent) {
    val key = "dedup:${event.messageId}"
    if (redis.hasKey(key)) return

    promotionService.apply(event)
    redis.set(key, true, Duration.ofDays(7))
}
```

### Outbox Pattern

> 도메인 이벤트를 처리한 후 메시지를 Kafka 로 바로 전송하지 않고, 먼저 DB에 저장한다.

```kotlin
@Transactional
fun createOrder(cmd: CreateOrderCommand) {
    val order = orderRepository.save(cmd.toEntity())
    val event = OutboxEvent("order.created", order.id)
    outboxRepository.save(event)
}
```

- Kafka 발행은 별도 스케줄러 or Polling consumer 가 처리하며, 실패해도 DB에 기록된 이벤트를 재시도 가능
- 이 방식은 DB 변경과 이벤트 저장을 같은 트랜잭션 안에서 처리할 수 있어 안정적

#### Outbox + Debezium (CDC)

앞서 설명한 Outbox Pattern의 확장이다. Kafka 로의 발행을 직접 구현하지 않고, Debezium 등 CDC 도구를 활용해 DB 변경 → Kafka 자동 발행 흐름을 구성한다.

__장점__:
- DB 트랜잭션과 Kafka 발행의 완전한 원자성 보장
- 소비자는 중복 메시지 방지만 신경 쓰면 됨

#### Kafka Transactional Producer

Kafka 는 transactional.id와 enable.idempotence=true 설정을 통해 Producer 단의 exactly-once 전송을 지원한다.

Kafka 외부 시스템(예: DB)에 함께 쓰는 작업은 트랜잭션 보장이 어렵기 때문에 Kafka-to-Kafka 사용 시에만 완전한 EOS 를 기대할 수 있다.

#### DB Transaction + Offset Commit

Spring Kafka 등에서는 DB 와 Kafka 소비를 함께 사용할 때 다음 순서로 보장해야 한다.

- 메시지 consume
- DB 작업 수행 (e.g. JPA 저장)
- DB 커밋 완료
- Kafka offset commit

Spring 에서는 @KafkaListener + @Transactional 설정으로 쉽게 적용할 수 있다.

```kotlin
@KafkaListener(topics = ["event.order"])
@Transactional
fun onOrderEvent(event: OrderEvent) {
    orderService.process(event)
    // 커밋은 DB 트랜잭션 종료 후 자동으로 됨
}
```