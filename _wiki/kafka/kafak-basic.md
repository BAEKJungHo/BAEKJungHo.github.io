---
layout  : wiki
title   : Kafka - Pretending to know a little
summary : Kafka 조금 아는 척 하기
date    : 2022-09-29 20:54:32 +0900
updated : 2022-09-29 21:15:24 +0900
tag     : kafka devops infra
toc     : true
comment : true
public  : true
parent  : [[/kafka]]
latex   : true
---
* TOC
{:toc}

## Structures

![](/resource/wiki/kafka-basic/structure.png)

### Topic

![](/resource/wiki/kafka-basic/topic.png)

- 토픽은 메시지를 구분하는 단위: 파일시스템의 폴더와 유사
- 한 개의 토픽은 한 개 이상의 파티션으로 구성
  - 파티션은 메시지를 저장하는 물리적인 파일

### Partition

![](/resource/wiki/kafka-basic/partition.png)

- 파티션은 추가만 가능한(append-only)파일
- 각 메시지 저장 위치를 오프셋(offset) 이라고 함
- 프로듀서가 넣은 메시지는 파티션의 맨 뒤에 추가
- 컨슈머는 오프셋 기준으로 메시지를 순서대로 읽음
- 메시지는 삭제되지 않음(설정에 따라 일정 시간이 지난 뒤 삭제)

#### with Producer

- 프로듀서는 Round-Robin 또는 Key 로 파티션을 선택함
- 같은 키를 갖는 메시지는 같은 파티션에 저장함(같은 키는 순서 유지)

#### with Consumer

![](/resource/wiki/kafka-basic/partition-consumer.png)

- 컨슈머는 컨슈머 그룹에 속함
- 한 개 파티션은 컨슈머 그룹의 한 개 컨슈머만 연결 가능
  - 즉, 컨슈머 그룹에 속한 컨슈머들은 한 파티션을 공유할 수 없음
  - 한 컨슈머 그룹 기준으로 파티션의 메시지는 순서대로 처리

한 개 파티션이 하나의 컨슈머에만 연결될 수 있다는 제한은 컨슈머 그룹 내에서만 제한이 되기 때문에 한 개 파티션을 서로 다른 컨슈머 그룹에서 공유할 수 있다.

예를 들어서, 주문 생성 후 메시지를 Kafka 로 보낸 후 파티션에 있는 메시지를 다른 컨슈머 그룹에 속한 컨슈머들이 메시지를 읽어갈 수있다. Order Create Message 를 Message Server 와 Delivery Server 에서 읽어갈 수 있다는 의미다.

### 성능

- __파티션 파일은 OS 페이지 캐시 사용__
  - 파티션에 대한 파일 I/O 를 메모리에서 처리
  - 서버에서 페이지 캐시를 카프카만 사용해야 성능에 유리
- __Zero Copy__
  - 디스크 버퍼에서 네트워크 버퍼로 직접 데이터 복사
- __컨슈머 추적을 위해 브로커가 하는 일이 비교적 단순__
  - 메시지 필터, 메시지 재전송과 같은 일은 브로커가 하지 않음
    - 프로듀서, 컨슈머가 직접 해야 함
  - 브로커는 컨슈머와 파티션간 매핑 관리
- __배치 처리__
  - 묶어서 보내고 묶어서 받기가 가능
    - 프로듀서: 일정 크기 만큼 메시지를 모아서 전송 가능
    - 컨슈머: 최소 크기 만큼 메시지를 모아서 조회 가능
  - 처리량 증가
- __처리량 확장이 쉬움__
  - 1개 장비의 용량 한계가 오면 브로커를 추가하고, 파티션을 추가하면 됨
  - 컨슈머가 느리면, 컨슈머를 추가하고 파티션을 추가하면 됨

### Replica

- __리플리카: 파티션의 복제본__
  - 복제 수(replication factor) 만큼 파티션의 복제본이 각 프로커에 생김
  - 복제 수가 2이면, 동일한 데이터를 갖고 있는 파티션이 서로 다른 브로커에 2개가 생김
- __리더와 팔로워로 구성__
  - 프로듀서와 컨슈머는 리더를 통해서만 메시지 처리
  - 팔로워는 리더로부터 복제
- __장애 대응__
  - 리더가 속한 브로커 장애 시 다른 팔로워가 리더가 됨

## Links

- [kafka 조금 아는 척하기 1 - Youtube](https://www.youtube.com/watch?v=0Ssx7jJJADI)
- [kafka 조금 아는 척하기 2 - Youtube](https://www.youtube.com/watch?v=geMtm17ofPY&t=192s)
- [kafka 조금 아는 척하기 3 - Youtube](https://www.youtube.com/watch?v=xqrIDHbGjOY)