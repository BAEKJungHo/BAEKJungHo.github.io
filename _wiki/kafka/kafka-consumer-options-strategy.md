---
layout  : wiki
title   : Consumer Options Optimization Strategy
summary : 
date    : 2024-03-12 20:54:32 +0900
updated : 2024-03-12 21:15:24 +0900
tag     : kafka eventdriven
toc     : true
comment : true
public  : true
parent  : [[/kafka]]
latex   : true
---
* TOC
{:toc}

## Consumer knowledge

__[실무 관점에서의 Apache Kafka 활용](https://medium.com/@greg.shiny82/%EC%8B%A4%EB%AC%B4-%EA%B4%80%EC%A0%90%EC%97%90%EC%84%9C%EC%9D%98-apache-kafka-%ED%99%9C%EC%9A%A9-023d468f9182)__:

- __Consumed Offset (Current Offset)__
  - poll() 로 consumed 하고 난 후의 offset
  - This indicates the point at which a consumer has read messages. It helps identify the position for the next message the consumer should read. This offset is automatically updated each time the consumer receives a poll() call. Each consumer manages its own offset.
- __Committed Offset__
  - Offset commit 을 하고 난 후의 offset
  - This is the offset updated through an Offset Commit, where the consumer informs Kafka that it has processed messages up to a certain point. It also serves as the starting point for the consumer to read messages again if its process fails and restarts. Kafka manages this offset within an internal topic called __consumer_offsets__.

### Rebalancing

__[카프카 컨슈머 그룹 리밸런싱 (Kafka Consumer Group Rebalancing](https://techblog.gccompany.co.kr/%EC%B9%B4%ED%94%84%EC%B9%B4-%EC%BB%A8%EC%8A%88%EB%A8%B8-%EA%B7%B8%EB%A3%B9-%EB%A6%AC%EB%B0%B8%EB%9F%B0%EC%8B%B1-kafka-consumer-group-rebalancing-5d3e3b916c9e)__:

리밸런싱이란 컨슈머에 문제가 생겨서 메시지를 처리할 수 없을때, 컨슈머 그룹내 다른 컨슈머에게 파티션 소유권을 이전하는 것을 의미한다.

1. 컨슈머가 생성/삭제되는 경우(e.g 애플리케이션 배포의 경우에 기존 컨슈머가 삭제되고, 새로운 컨슈머가 추가되므로 리밸런싱이 최소 2번 일어난다.)
2. max.poll.records 설정의 개수만큼 메세지를 처리한 뒤 Poll 요청을 보내게 된다. 만약, 메세지들의 처리 시간이 늦어져서 max.poll.interval.ms 설정 시간을 넘기게 된다면 컨슈머에 문제가 있다고 판단하여 리밸런싱이 일어난다.
3. 컨슈머가 일정 시간 동안 하트비트를 보내지 못하면, 세션이 종료되고 컨슈머 그룹에서 제외되면서 리밸런싱이 일어난다.

## Consumer Options Optimization Strategy

### ZERO PAYLOAD

__[ZERO PAYLOAD](https://baekjungho.github.io/wiki/architecture/architecture-zero-payload/)__ 를 사용하고 있으며 데이터의 최종 일관성만 보장하면 되는 경우에 사용할 수 있는 전략

![](/resource/wiki/kafka-consumer-options-strategy/zero-payload.png)

__[offset management](https://docs.confluent.io/platform/current/clients/consumer.html#offset-management)__:
- auto-offset-reset
  - latest: 카프카에서 초기 오프셋이 없거나, 현재 오프셋이 더 이상 존재하지 않은 경우 최근 offset 을 기준
- enable-auto-commit: true(“at least once” delivery, rebalancing 시 메시지 중복 처리 될 수 있음)
  - [Rebalancing](https://medium.com/@greg.shiny82/%EC%8B%A4%EB%AC%B4-%EA%B4%80%EC%A0%90%EC%97%90%EC%84%9C%EC%9D%98-apache-kafka-%ED%99%9C%EC%9A%A9-023d468f9182)
- max-poll-records: N (단일 poll 에 가져올 메시지 수)

ZERO PAYLOAD 를 사용하고 있는 경우, at least once 전략을 사용해도 괜찮다. event 를 받아서 API 를 호출하여 데이터의 최종 상태만 동기화 해주면 되기 때문이다.

여기서 추가로 고민해야할 부분은 아래와 같다. (서비스 성격, 내부 구현등에 따라 달라진다.)

- __Not consumed Events__
  - 특정 이유로 인해 메시지가 쌓여있는 경우
- __Failed Events__
  - Consumer 에서 데이터 최종 상태 동기화를 진행 중인 과정에서 Exceptions 등으로 인해, 동기화에 실패한 경우

## Links

- [APACHE KAFKA QUICKSTART](https://kafka.apache.org/quickstart)
- [Consumer Configs](https://kafka.apache.org/documentation/#consumerconfigs)
- [Kafka Consumer Options - Goodgid](https://goodgid.github.io/Kafka-Consumer-Option/)
- [Kafka 운영자가 말하는 Kafka Consumer Group](https://www.popit.kr/kafka-consumer-group/)
- [Kafka Processing Guarantees](https://docs.confluent.io/platform/7.6/streams/concepts.html#streams-concepts-processing-guarantees)

## References

- [Kafka Consumer Docs](https://docs.confluent.io/platform/current/clients/consumer.html)