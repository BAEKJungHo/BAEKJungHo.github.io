---
layout  : wiki
title   : Acknowledgement
summary : 
date    : 2023-01-05 20:54:32 +0900
updated : 2023-01-05 21:15:24 +0900
tag     : kafka
toc     : true
comment : true
public  : true
parent  : [[/kafka]]
latex   : true
---
* TOC
{:toc}

## Messaging

The most important part of Messaging is __messages themselves and their reliable delivery and processing__. Acknowledgement 는 메시지의 안정적인 처리를 위해 고안된 매커니즘이다.

## Acknowledgement

Acknowledgement(승인) 는(은) Producer(Publisher) 가 생성한 메시지를 Consumer(Subscriber) 가 받아서 처리를 다 하고 문제가 없을 때 "처리 완료" 를 Notify 하는 매커니즘이다. 쉽게 말하면 `Commit` 비슷한 개념이다.

### org.springframework.cloud.aws.messaging.listener

[Acknowledgment interface](https://javadoc.io/static/org.springframework.cloud/spring-cloud-aws-messaging/2.2.1.RELEASE/org/springframework/cloud/aws/messaging/listener/Acknowledgment.html) that can be injected as parameter into a listener method. __The purpose of this acknowledgment is to provide a way for the listener methods to acknowledge the reception and processing of a message.__ The call to the acknowledge() method triggers some implementation specific clean up tasks like removing a message from the SQS queue. The `acknowledge()` method returns a Future as the acknowledgment can involve some asynchronous request to an AWS API.

### org.springframework.kafka.support

__Handle for acknowledging the processing of a ConsumerRecord.__ Recipients can store the reference in asynchronous scenarios, but the internal state should be assumed transient (i.e. it cannot be serialized and deserialized later).
- __acknowledge()__ 
  - Invoked when the record or batch for which the acknowledgment has been created has been processed.

## Consumer Position

Acknowledgement 는 사실 Consumer 를 위해 만들어진 매커니즘이다.

>  If the broker records a message as consumed immediately every time it is handed out over the network, then if the consumer fails to process the message (say because it crashes or the request times out or whatever) that message will be lost. To solve this problem, many messaging systems add an __acknowledgement__ feature which means that messages are only marked as __sent__ not __consumed__ when they are sent; the broker waits for a specific acknowledgement from the consumer to record the message as consumed. __This strategy fixes the problem of losing messages__, but creates new problems. First of all, if the consumer processes the message but fails before it can send an acknowledgement then the message will be consumed twice. The second problem is around performance, now the broker must keep multiple states about every single message (first to lock it so it is not given out a second time, and then to mark it as permanently consumed so that it can be removed). Tricky problems must be dealt with, like what to do with messages that are sent but never acknowledged.

요약하자면 메시지 충돌, Network 이슈 등으로 인한 메시지 손실을 막기 위해서 메시징 시스템이 메시지가 전송될 때 소비되지 않고 전송 된 것으로만 표기하고, 브로커는 Consumer 가 승인(Acknowledgement)을 해야하만 소비가 되었음을 Marking 한다.

Acknowledgement 매커니즘에도 단점이 있는데, 승인을 보내기 전에 실패하면 메시지가 두 번 소비된다는 점과, 메시지에 대한 상태를 유지해야 하므로 성능적인 이슈가 있다.

Kafka 는 이러한 문제를 와전히 정렬된 파티션 세트로 구분하고, 각 컨슈머 그룹내에서는 하나의 컨슈머만 하나의 파티션을 처리한다. 또한 파티션 내에서는 `오프셋(offset)` 이라는 단일 정수를 사용하여, 메시지를 어디까지 읽었는지 관리한다. CURRENT-OFFSET 은 현재 consumer-group 에서의 offset 을 의미한다.

### Workflow 

Workflow 중 Acknowledgement 부분만 살펴보면 다음과 같다.

- Once the messages are processed, consumer will send an acknowledgement to the Kafka broker.
- Once Kafka receives an acknowledgement, it changes the offset to the new value and updates it in the Zookeeper. Since offsets are maintained in the Zookeeper, the consumer can read next message correctly even during server outrages.

## Links

- [Kafka Design Consumer Position](https://kafka.apache.org/documentation/#design_consumerposition)
- [Apache Kafka - WorkFlow](https://www.tutorialspoint.com/apache_kafka/apache_kafka_workflow.htm)