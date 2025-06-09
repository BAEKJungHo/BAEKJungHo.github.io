---
layout  : wiki
title   : Message Inversion
summary : 
date    : 2024-11-30 11:54:32 +0900
updated : 2024-11-30 12:15:24 +0900
tag     : kafka
toc     : true
comment : true
public  : true
parent  : [[/kafka]]
latex   : true
---
* TOC
{:toc}

## Message Inversion

___Message Inversion___ 은 생산된 이벤트의 순서와 소비된 이벤트의 순서가 일치하지 않는 현상을 말한다.
즉, A → B 순서로 발생한 메시지가 B → A 순서로 소비되는 상황을 의미한다.

__발생 가능 시나리오__:
- Multi Partition
  - Kafka 의 토픽은 파티션 단위로 데이터를 분산한다. 파티션 간에는 메시지 순서 보장이 되지 않기 때문에, 다음과 같은 경우 역전이 발생할 수 있다.
  - e.g Event A는 파티션 1, Event B는 파티션 2, 소비자는 병렬적으로 읽기 때문에 B 가 A 보다 먼저 처리될 수 있음
- Network Latency
  - 생산자가 여러 개의 메시지를 발행할 때, 메시지 전송 시간이 네트워크 상태에 따라 달라지면 브로커에 도달하는 순서가 바뀔 수 있다.
  - e.g A 가 먼저 발행됐지만 네트워크 지연으로 B 가 먼저 Kafka 브로커에 도달
- Timestamp Mismatch
  - Kafka 는 각 메시지에 타임스탬프를 붙이지만, 서버 간 시간 동기화(NTP) 가 잘 안 되어 있거나, 로컬 타임스탬프를 수동 설정할 경우 발생 시점이 실제 순서와 다르게 기록될 수 있다.
  - e.g 로그 수집 시스템에서 서로 다른 노드에서 수집된 이벤트가 잘못된 타임스탬프를 갖고 들어옴

__해결 방법__:
- Partition Key
  - 파티션 단위로는 순서가 보장되므로, 동일 흐름(스트림)의 메시지는 같은 파티션에 보내야 함
  - e.g 주문 ID, 사용자 ID, 세션 ID 등을 파티션 키로 사용
- Consumer 처리 시 순서 보장 고려
  - 파티션당 단일 스레드로 메시지 처리
  - 메시지 처리 순서를 DB 등에 저장하거나, 이전 상태 기준으로 정렬/보정 로직 추가
- 타임스탬프 기준 정렬 (Post-processing)
  - 수신 시간 기준이 아닌, 도메인 발생 시점(timestamp) 기준으로 정렬
  - Kafka 메시지에 eventOccurredAt 필드 포함 후, 소비 측에서 시간순 정렬
- 순서 민감한 처리는 Kafka 로 하지 않기
  - 극도로 순서 민감한 업무(예: 금융 거래 처리)는 Kafka 보다는 동기 API + 트랜잭션 처리 구조가 적합
  - Kafka 는 Eventually Consistent + Partition 단위 순서 보장 기반임을 항상 고려

## Links

- [우리 팀은 카프카를 어떻게 사용하고 있을까](https://techblog.woowahan.com/17386/)