---
layout  : wiki
title   : MQTT
summary : Message Queuing Telemetry Transport
date    : 2023-10-06 15:02:32 +0900
updated : 2023-10-06 15:12:24 +0900
tag     : architecture mqtt
toc     : true
comment : true
public  : true
parent  : [[/architecture]]
latex   : true
---
* TOC
{:toc}

## Message Queuing Telemetry Transport

[MQTT(Message Queuing Telemetry Transport)](https://en.wikipedia.org/wiki/MQTT) 란 머신 대 머신 통신에 사용되는 표준 기반 메시징 프로토콜이다. 사물 인터넷(IoT) 디바이스는 일반적으로
리소스 제약이 있는 네트워크를 통해 제한된 대역폭으로 데이터를 전송하고 수신해야 한다. MQTT 는 디바이스에서 클라우드로, 클라우드에서 디바이스로의 메시징을 지원한다.

MQTT 는 __IoT 데이터 전송 표준__ 이 되었다. MQTT 는 OASIS 조직에서 지원하는 ISO 표준(ISO/IEC PRF 20922)이다. 이는 __작은 코드 공간이 필요하거나 네트워크 대역폭이 중요한 M2M/IoT 컨텍스트의 통신__ 에 적합한 TCP/IP 위에 신뢰할 수 있는 경량 게시/구독 메시징 전송 프로토콜을 제공한다.

### Architecture

MQTT is one such specific messaging protocol that follows the [publish-subscribe architecture](https://www.hivemq.com/blog/mqtt-essentials-part2-publish-subscribe/). MQTT uses a broker-based model where clients connect to a broker, and messages are published to topics. Subscribers can then subscribe to specific topics and receive the published messages.

> __Typical Architecture__:
>
> ![](/resource/wiki/architecture-mqtt/mqtt-base-architecture.png)
>
> 위와 같은 방식은 __브로커 운영 관리와 메시지 유실 방지를 위한 중복된 스토리지 운영 관리__ 가 필요하다.
>
> `저장 후 전달 (store and forward)` 전략이 MQTT 뿐만 아니라 모든 메시지 브로커들의 일반적인 설계 전략이라고 할 수 있다. 브로커가 전달한 메시지를 수신한 수집 애플리케이션은 서비스에 이용하기 편리한 구조로 변환하여 (RDBMS 나 NoSQL 과 같은 데이터베이스에) 저장한다. 시스템을 구축한 후에는 서비스를 안정적으로 운영하기 위해서 두 가지의 스토리지 (MQTT 의 저장소, 애플리케이션의 저장소)를 관리해야만 하며 장애에 대처해야 한다.
>
> 이러한 문제를 해결하기 위해, 센서가 텔레 메트릭 데이터를 MQTT 를 통해 직접 데이터베이스로 전송하는 방식인 [machbase-neo](https://machbase.com/neo/) 가 있다.
>
> __Machbase Architecture__:
>
> ![](/resource/wiki/architecture-mqtt/mqtt-machbase.png)

### Characteristics

- 가장 작은 MQTT 제어 메시지는 데이터 2바이트만큼 작다. MQTT 메시지 헤더도 작기 때문에 네트워크 대역폭을 최적화할 수 있다.
- MQTT 구현에는 최소량의 코드가 필요하며 작업 시 아주 작은 전력만 소비된다.
- [최대 1회(0), 최소 1회(1) 및 정확히 1회(2)라는 3가지 서비스 품질 수준(QoS)](https://www.emqx.com/en/blog/introduction-to-mqtt-qos)을 정의하여 신뢰성을 보장한다.
- OAuth, TLS1.3 등을 사용하여 디바이스와 사용자를 인증할 수 있다.
- MQTT 5.0 부터는 [Shared Subscription](https://www.emqx.com/en/blog/introduction-to-mqtt5-protocol-shared-subscription) 을 지원하여 QoS 1 메시지인 경우 서버는 구독자가 다시 연결된 후에도 계속해서 게시를 완료할 수 있으며, 구독자의 연결이 끊어지면 즉시 다른 구독자에게 메시지 게시를 시도할 수 있다.

__[EMQX](https://github.com/emqx/emqx)__(MQTT Platform for IOT) 를 사용하여 Cloud Application 환경에서 MQTT 를 구축할 수 있다. __[AWS IoT Core](https://aws.amazon.com/ko/iot-core/)__ 를 사용할 수 도 있다.

## Links

- [OASIS MQTT 3.1.1 Docs](https://docs.oasis-open.org/mqtt/mqtt/v3.1.1/os/mqtt-v3.1.1-os.html)
- [Introducing the MQTT Protocol – MQTT Essentials: Part 1](https://www.hivemq.com/blog/mqtt-essentials-part-1-introducing-mqtt/)
- [Amazon What is MQTT](https://aws.amazon.com/ko/what-is/mqtt/)
- [MQTT Essential Guide](https://www.emqx.com/en/mqtt-guide)
- [MQTT Publish-Subscribe Pattern](https://www.emqx.com/en/blog/mqtt-5-introduction-to-publish-subscribe-model)
- [IoT 센서 데이터 플랫폼 구축과 MQTT](https://machbase.com/kr/home/blog/blog10/)