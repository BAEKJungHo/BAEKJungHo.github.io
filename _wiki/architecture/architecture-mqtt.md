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
리소스 제약이 있는 네트워크를 통해 제한된 대역폭으로 데이터를 전송하고 수신해야 한다. MQTT는 디바이스에서 클라우드로, 클라우드에서 디바이스로의 메시징을 지원한다.

MQTT 는 __IoT 데이터 전송 표준__ 이 되었다.

__Characteristics__:
- 가장 작은 MQTT 제어 메시지는 데이터 2바이트만큼 작다. MQTT 메시지 헤더도 작기 때문에 네트워크 대역폭을 최적화할 수 있.
- MQTT 구현에는 최소량의 코드가 필요하며 작업 시 아주 작은 전력만 소비된다.
- [최대 1회(0), 최소 1회(1) 및 정확히 1회(2)라는 3가지 서비스 품질 수준(QoS)](https://www.emqx.com/en/blog/introduction-to-mqtt-qos)을 정의하여 신뢰성을 보장한다.
- OAuth, TLS1.3 등을 사용하여 디바이스와 사용자를 인증할 수 있다.
- MQTT 5.0 부터는 [Shared Subscription](https://www.emqx.com/en/blog/introduction-to-mqtt5-protocol-shared-subscription) 을 지원하여 QoS 1 메시지인 경우 서버는 구독자가 다시 연결된 후에도 계속해서 게시를 완료할 수 있으며, 구독자의 연결이 끊어지면 즉시 다른 구독자에게 메시지 게시를 시도할 수 있다.

__[EMQX](https://github.com/emqx/emqx)__(MQTT Platform for IOT) 를 사용하여 Cloud Application 환경에서 MQTT 를 구축할 수 있다. __[AWS IoT Core](https://aws.amazon.com/ko/iot-core/)__ 를 사용할 수 도 있다.

## Links

- [Amazon What is MQTT](https://aws.amazon.com/ko/what-is/mqtt/)
- [MQTT Essential Guide](https://www.emqx.com/en/mqtt-guide)
- [MQTT Publish-Subscribe Pattern](https://www.emqx.com/en/blog/mqtt-5-introduction-to-publish-subscribe-model)
