---
layout  : wiki
title   : Publish/Subscribe Architecture
summary : Message-Oriented Middleware System and Message Broker
date    : 2023-11-18 15:02:32 +0900
updated : 2023-11-18 15:12:24 +0900
tag     : architecture eventdriven designpattern qos
toc     : true
comment : true
public  : true
parent  : [[/architecture]]
latex   : true
---
* TOC
{:toc}

## Publish/Subscribe Architecture

pubsub pattern 은 [message-oriented middleware system](https://en.wikipedia.org/wiki/Message-oriented_middleware) 의 한 부분이다.
message-oriented middleware(mom) 란 분산 시스템(distirbuted system) 간의 메시지 전송 및 수신을 지원 하는 소프트웨어 또는 하드웨어 인프라이다.

__[pubsub pattern](https://en.wikipedia.org/wiki/Publish%E2%80%93subscribe_pattern)__ 은 전통적인(traditional) client-server (request-response) model 과 다르게 직접적(directly)으로 통신할 필요가 없다.

![](/resource/wiki/architecture-pub-sub/pub-sub-communication.png)

직접적으로 통신하지 않아도 된다는 의미는 아래와 같은 특징을 갖는다.

- 1:1 통신이 아니다.
- 하나의 publisher 가 발행한 topic 을 여러 subscriber 가 구독할 수 있다. 따라서, 구독자의 존재를 알 필요가 없다.

이러한 특징을 __decoupling__ 이라고 한다. 서로 상호 작용하는 컴포넌트간의 느슨한 결합을 해야하는 이유 중 하나는 __[scalability](https://en.wikipedia.org/wiki/Scalability)__ 이다.

- __Space decoupling__: Publisher and subscriber do not need to know each other (for example, no exchange of IP address and port).
- __Time decoupling__: Publisher and subscriber do not need to run at the same time.
- __Synchronization decoupling__: Operations on both components do not need to be interrupted during publishing or receiving.

대부분의 pubsub pattern 은 decoupling 을 위해서 __[broker-based model](https://en.wikipedia.org/wiki/Message_broker)__ 을 채택한다. 이는 Message Broker 로 잘 알려져 있다.
pubsub 시스템에서 publisher 는 중간 메시지 브로커나 이벤트 버스 에 메시지를 게시 하고 구독자는 해당 브로커에 구독을 등록하여 브로커가 필터링을 수행하도록 한다.

![](/resource/wiki/architecture-pub-sub/Message_Broker.png)

Message Broker 를 사용했을 때의 장점은 메시지 유효성 검사, 변환 및 라우팅, 작업 부하 대기열이나 여러 수신자에 대한 메시지 대기열을 관리 하여 안정적인 저장소, 보장된 메시지 전달 및 트랜잭션 관리를 제공할 수 있다.

게시자와 구독자 간의 직접 통신 필요성을 제거함으로써 게시/구독 아키텍처는 IP 주소 및 포트 교환을 제거한다.

### Message Delivery, QoS

pubsub pattern 을 구현하는 프로토콜을 사용 시, 메시지 전달을 보장하기 위해 다음과 같은 3가지 서비스 품질 수준(QoS) 을 정의한다.

아래는 [MQTT](https://baekjungho.github.io/wiki/architecture/architecture-mqtt/) 의 [QoS](https://www.emqx.com/en/blog/introduction-to-mqtt-qos) 이다.

__QoS 0, at most once__
- ![](/resource/wiki/architecture-pub-sub/qos0.png)
- TCP 연결의 안정성이 좋으면 성공적인 전달을 보장할 수 있지만, 연결이 닫히거나 메시지가 손실되면 메시지가 전달되지 않을 수 있다.

__QoS 1, at least once__
- ![](/resource/wiki/architecture-pub-sub/qos1.png)
- 메시지가 한 번 이상 전달될 수 있지만, 중복 전달이 발생할 수 있다.
- Publisher 가 PUBACK 패킷을 수신하지 못하는 경우는 두 가지가 있다.
  - PUBLISH 패킷이 수신자에게 도달하지 못한 경우 
    - UBLISH 패킷을 재전송하지만 수신자는 메시지를 한 번만 수신하므로 중복된 메시지가 생성되지 않는다.
  - PUBLISH 패킷이 수신자에게 도달했지만 수신자의 PUBACK 패킷이 아직 발신자에 의해 수신되지 않은 경우
    - 이 경우에는 발신자가 PUBLISH 패킷을 재전송하고 수신자는 이를 다시 수신하므로 __중복된 메시지가 생성__ 된다.

__QoS 2, exactly once__
- ![](/resource/wiki/architecture-pub-sub/qos2.png)
- 중복된 메시지를 수신하지 않도록 PUBREL 및 PUBCOMP 패킷이 추가되었다.
  - QoS 2에서는 송신자가 수신자로부터 PUBREC 패킷을 수신하기 전에 PUBLISH 패킷을 재전송하는 것이 허용된다. 발신자가 PUBREC을 수신하고 PUBREL 패킷을 전송하면 패킷 ID 해제 프로세스에 들어간다. 발신자는 수신자로부터 PUBCOMP 패킷을 수신할 때까지 PUBLISH 패킷을 재전송하거나 현재 패킷 ID로 새 메시지를 보낼 수 없다.
  - 따라서, 수신자(subscriber)는 PUBREL 패킷을 경계로 사용할 수 있으며 그 전에 도착하는 모든 PUBLISH 패킷을 중복으로 간주하고 그 뒤에 도착하는 모든 PUBLISH 패킷을 새로운 것으로 간주할 수 있다.

## Links

- [Observer Pattern](https://baekjungho.github.io/wiki/designpattern/designpattern-observer/)
- [MQTT Publish/Subscribe Architecture (Pub/Sub) – MQTT Essentials: Part 2](https://www.hivemq.com/blog/mqtt-essentials-part2-publish-subscribe/)
- [Observer vs Pub-Sub pattern - HackerNoon](https://hackernoon.com/observer-vs-pub-sub-pattern-50d3b27f838c)
- [Publisher Subscriber Pattern - Microsoft](https://learn.microsoft.com/ko-kr/azure/architecture/patterns/publisher-subscriber)