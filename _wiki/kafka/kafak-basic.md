---
layout  : wiki
title   : Kafka - Pretending to know a little
summary : Kafka 조금 아는 척 하기
date    : 2022-09-29 20:54:32 +0900
updated : 2022-09-29 21:15:24 +0900
tag     : kafka
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
- 특정 토픽의 파티션이 3개일 경우 각 파티션은 서로 다른 데이터를 보관함. 그래서 파티션 수준에서만 순서를 보장함

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

## Producer

프로듀서는 토픽에 메시지를 전송하는 역할을 담당한다.

- __Config__

```kotlin
@Configuration
class KafkaProducerConfig {

    companion object {
        val BOOT_STRAP_SERVERS = listOf("localhost:9092")
    }

    @Bean
    fun kafkaTemplate() = KafkaTemplate(producerFactory())

    @Bean
    fun producerFactory(): ProducerFactory<String, OrderPublisher.RegisteredMessage> =
        DefaultKafkaProducerFactory(producerFactoryConfig())

    private fun producerFactoryConfig() =
        mapOf(
            ProducerConfig.BOOTSTRAP_SERVERS_CONFIG to BOOT_STRAP_SERVERS,
            ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG to StringSerializer::class,
            ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG to JsonSerializer::class
        )
}
```

- KafkaProducer or KafkaTemplate 는 send 메서드를 제공함

```kotlin
val producer = KafkaProducer(prop)
producer.send(ProducerRecord("topicName", "key", "value"))
producer.close()
```

- __기본 흐름__

![](/resource/wiki/kafka-basic/producer.png)

![](/resource/wiki/kafka-basic/producer2.png)

- __처리량 관련 주요 속성__
  - batch.size: 배치 크기, 배치가 다 차면 바로 전송
  - linger.ms: 전송 대기 시간(기본값 0)
    - 대기 시간이 없으면 배치가 덜 차도 바로 브로커로 전송
    - 대기 시간을 주면 그 시간 만큼 배치에 메시지 추가가 가능해서 한 번의 전송 요청에 더 많은 데이터 처리 가능

### 전송 결과

- __전송 결과 확인 X__
  - 이 경우은 실패에 대한 별도 처리가 필요 없는 메시지 전송에 사용한다.
- __전송 결과 확인 O: Future 사용__
  - 단점은 배치 효과가 떨어진다.(처리량 저하) 따라서 처리량이 낮아도 되는 경우에만 사용하는 것이 좋다.
  - ```java
    Future<RecordMetadata> future = producer.send(ProducerRecord<>("topic", "value"));
    try {
        RecordMetadata meta = future.get() // Blocking
    } catch (ExecutionException e) { // ... }
    ``` 
- __전송 결과 확인: Callback 사용__
  - 처리량 저하가 없다.
  - ```kotlin
     val future = kafkaTemplate.send(message)
     future.addCallback(object: ListenableFutureCallback<SendResult<String, OrderPublisher.RegisteredMessage>> {
         override fun onSuccess(result: SendResult<String, OrderPublisher.RegisteredMessage>?) {
             log.info("Sent message = [ ${result?.producerRecord?.value().toString()} with offset ${result?.recordMetadata?.offset()}") 
         }

         override fun onFailure(ex: Throwable) {
             log.error("Unable to send message due to: ${ex.message}")
         }
     })
    ```

### 전송 보장과 ack

- __ack = 0__
  - 서버 응답을 기다리지 않음
  - 전송을 보장하지 않음
  - 처리량은 높지만, 전송이 되었는지 확인이 필요한 경우에는 사용 하면 안됨
- __ack = 1__
  - 파티션의 리더에 저장되면 응답 받음
  - 리더 장애 시 메시지 유실 가능
- __ack = all(또는 -1)__
  - 모든 리플리카에 저장되면 응답 받음
  - 엄격하게 전송을 보장해야하는 경우 사용
  - 브로커 min.insync.replicas 설정에 따라 달라짐
- __min.insync.replicas(브로커 옵션)__
  - 프로듀서 ack 옵션이 all 일 때 저장에 성공했다고 응답할 수 있는 동기화된 리플리카 최소 개수
  - Ex. 리플리카 개수 3, ack = all, min.insync.replicas = 2
    - 리더에 저장하고 팔로워 두 개중 한 개에 저장하면 성공 응답
  - Ex. 리플리카 개수 3, ack = all, min.insync.replicas = 1
    - 리더에 저장되면 성공 응답
    - ack = 1 과 동일(리더 장애 시 메시지 유실 가능)
  - Ex. 리플리카 개수 3, ack = all, min.insync.replicas = 3
    - 리더와 팔로워 2개에 저장되면 성공 응답
    - 팔로워 중 한 개라도 장애가 나면 리플리카 부족으로 저장에 실패

### 에러 유형

- __전송 과정에서 실패__
  - 전송 타임 아웃(네트워크 오류 등)
  - 리더 다운에 의한 새 리더 선출 진행 중
  - 브로커 설정 메시지 크기 한도 초과
  - 등등
- __전송 전에 실패__
  - 직렬화 실패, 프로듀서 자체 요청 크기 제한 초과
  - 프로듀서 버퍼가 차서 기다린 시간이 최대 대기 시간 초과
  - 등등

### 실패 대응

- __재시도__
  - 재시도 가능한 에러는 재시도 처리
    - Ex. 브로커 응답 타임 아웃, 일시적인 리더 없음 등
- __재시도 위치__
  - 프로듀서는 자체적으로 브로커 전송 과정에서 에러가 발생하면 재시도 가능한 에러에 대해 재전송 시도
    - retries 속성
  - send() 메서드에서 Exception 발생 시 Exception 타입에 따라 send() 재호출
  - 콜백 메서드에서 Exception 받으면 타입에 따라 send() 재호출
- __아주 아주 특별한 이유가 없다면 무한 재시도 X__
- __기록__
  - 추후에 처리를 위해 기록
    - 별도 파일, DB 등을 이용해서 실패한 메시지 기록
    - 추후에 수동(또는 자동) 보정 작업 진행
  - 기록 위치
    - send() 메서드에서 Exception 발생 시
    - send() 메서드에 전달한 콜백에서 Exception 받는 경우
    - send() 메서드가 리턴한 Future 의 get() 메서드에서 Exception 발생 시
- __재시도와 메시지 중복 전송 가능성__
  - 브로커 응답이 늦게 와서 재시도할 경우 중복 발송 가능
  - enable.idempotence 속성을 설정하면 중복 발송 가능을 줄일 수 있다고 함
  - ![](/resource/wiki/kafka-basic/producer3.png)
- __재시도와 순서__
  - max.in.flight.requests.per.connection
    - 블로킹 없이 한 커넥션에서 전송할 수 있는 최대 전송중인 요청 개수
    - 이 값이 1보다 크면 재시도 시점에 따라 메시지 순서가 바뀔 수 있음
      - 전송 순서가 중요하면 이 값을 1로 지정

## Consumer

컨슈머는 토픽 파티션에서 레코드를 조회하는 역할을 담당한다.

- __Config__

```kotlin
@EnableKafka
@Configuration
class KafkaConsumerConfig {

    companion object {
        val BOOT_STRAP_SERVERS = listOf("localhost:9092")
        const val GROUP_ID = "dev.asterisk.delivery.by.order"
    }

    @Bean
    fun deliveryKafkaListenerContainerFactory(): ConcurrentKafkaListenerContainerFactory<String, DeliverySubscriber.DeliveryProcessMessage> {
        val factory: ConcurrentKafkaListenerContainerFactory<String, DeliverySubscriber.DeliveryProcessMessage> =
            ConcurrentKafkaListenerContainerFactory<String, DeliverySubscriber.DeliveryProcessMessage>()
        return factory.apply { consumerFactory = deliveryConsumerFactory() }
    }

    @Bean
    fun deliveryConsumerFactory(): DefaultKafkaConsumerFactory<String, DeliverySubscriber.DeliveryProcessMessage> {
        val deserializer = deliveryJsonDeserializer()
        return DefaultKafkaConsumerFactory(
            deliveryConsumerFactoryConfig(deserializer),
            StringDeserializer(),
            deserializer
        )
    }

    private fun deliveryConsumerFactoryConfig(deserializer: JsonDeserializer<DeliverySubscriber.DeliveryProcessMessage>) =
        mapOf(
            ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG to BOOT_STRAP_SERVERS,
            ConsumerConfig.GROUP_ID_CONFIG to GROUP_ID,
            ConsumerConfig.AUTO_OFFSET_RESET_CONFIG to "latest",
            ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG to StringDeserializer::class,
            ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG to deserializer
        )

    private fun deliveryJsonDeserializer(): JsonDeserializer<DeliverySubscriber.DeliveryProcessMessage> {
        val deserializer: JsonDeserializer<DeliverySubscriber.DeliveryProcessMessage> = JsonDeserializer(
            DeliverySubscriber.DeliveryProcessMessage::class.java
        )
        return deserializer.apply {
            setRemoveTypeHeaders(false)
            addTrustedPackages("*")
            setUseTypeMapperForKey(true)
        }
    }
}
```

- 토픽의 파티션은 그룹 단위로 할당된다.

### commit and offset

![](/resource/wiki/kafka-basic/offset.png)

- __커밋된 오프셋이 없는 경우__
  - 처음 접근이거나 커밋한 오프셋이 없는 경우
  - auto.offset.reset 설정 사용
    - earliest: 맨 처음 오프셋 사용
    - latest: 가장 마지막 오프셋 사용(기본 값)
    - none: 컨슈머 그룹에 대한 이전 커밋이 없으면 Exception 발생

### 조회에 영향을 주는 주요 설정

- __fetch.min.bytes__
  - 조회 시 브로커가 전송할 최소 데이터 크기
  - 기본값 1
  - 이 값이 크면 대기 시간을 늘지만 처리량 증가
- __fetch.max.wait.ms__
  - 데이터가 최소 크기가 될 때까지 기다릴 시간
  - 기본값 500ms(0.5sec)
  - 브로커가 리턴할 때까지 대기하는 시간으로 poll() 의 대기 시간과 다름
- __max.partition.fetch.bytes__
  - 파티션 당 서버가 리턴할 수 있는 최대 크기
  - 기본값: 1048576(1MB)

### 커밋 설정

- __enable.auto.commit__
  - true: 일정 주기로 컨슈머가 읽은 오프셋을 커밋(기본 값)
  - false: 수동으로 커밋 실행
    - consumer.commitSync(), consumer.commitAsync()
- __auto.commit.interval.ms__
  - 자동 커밋 주기
  - 기본값 500ms(0.5sec)
- __poll(), close() 메서드 호출 시 자동 커밋 실행__

### 재처리와 순서

- __동일 메시지 조회 가능성__
  - 일시적 커밋 실패, 리밸런스 등에 의해 발생
- __컨슈머는 멱등성(idempotence)을 고려해야 함__
  - Ex. 아래 메시지를 재처리할 경우
  - 조회수 1증가 -> 좋아요 1증가 -> 조회수 1증가
  - 단순 처리하면 조회수는 2가 아닌 4가될 수 있음
- __데이터 특성에 따라 타임스탬프, 일련 번호 등을 활용__

### session-timeout and heartbeat

- __컨슈머는 하트비트를 전송해서 연결 유지__
  - 브로커는 일정 시간 컨슈머로부터 하트비트가 없으면 컨슈머를 그룹에서 빼고 리밸런스 진행
  - 관련 설정
    - session.timeout.ms: 세션 타임아웃 시간(기본값 10초)
    - heartbeat.interval.ms: 하트비트 전송 주기(기본값 3초)
      - session.timeout.ms 의 1/3 이하 추천
- __max.poll.interval.ms: poll() 메서드의 최대 호출 간격__
  - 이 시간이 지나도록 poll() 하지 않으면 컨슈머를 그룹에서 빼고 리밸런스 진행

### 종료 처리

- __다른 스레드에서 wakeup() 메서드 호출__
  - poll() 메서드가 WakeupException 발생 -> close() 메서드로 종료 처리

### 주의할 점

- __KafkaConsumer 는 스레드에 안전하지 않음__
  - 여러 스레드에서 동시에 사용하지 말 것
  - wakeup() 메서드 예외

### offset handling

- 메시지 처리에 실패했을 때 메시지를 다시 읽어와서 처리할 건지, 실패한 메시지를 다른 곳에 보관해서 후처리로 복구할 건지
- 메시지 처리를 멱등성으로 처리 가능한지
- 메시지를 반드시 순서대로 처리해야 하는지

### QNA

> 최범균님 유튜브 댓글 링크에서 발췌
>
> Q. send로 데이터를 전송할 때 buffer.memory 값을 초과할 경우 약 5초간의 delay 시간이 걸리던데, 혹시 해당 시간이 발생하는 이유와 시간을 줄일 수 있는 방법이 있나요? (delay는 close 또는 flush API를 호출했을 때 동일하게 발생하더라구요) 참고로 설정은 buffer.memory=기본값 (32MB), linger.ms=1000, batch.size=16384를 사용했고,
크기가 500Byte 인 데이터 8만개를 send 하게 될 경우 위의 현상이 발생합니다.
> 
> A. 문서를 보니 서버에 전송하는 속도보다 더 빠르게 쌓이면 프로듀서는 max.block.ms 시간만큼 블로킹을 하네요. 500바이트*8만개는 32M를 넘기니까 buffer.memory 크기를 좀 더 늘리는 게 가장 쉬운 방법일 것 같습니다.

## Links

- [kafka 조금 아는 척하기 1 - Youtube](https://www.youtube.com/watch?v=0Ssx7jJJADI)
- [kafka 조금 아는 척하기 2 - Youtube](https://www.youtube.com/watch?v=geMtm17ofPY&t=192s)
- [kafka 조금 아는 척하기 3 - Youtube](https://www.youtube.com/watch?v=xqrIDHbGjOY)