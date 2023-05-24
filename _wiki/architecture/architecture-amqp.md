---
layout  : wiki
title   : Advanced Message Queuing Protocol
summary : 
date    : 2023-05-19 15:02:32 +0900
updated : 2023-05-19 15:12:24 +0900
tag     : architecture cloudnative
toc     : true
comment : true
public  : true
parent  : [[/architecture]]
latex   : true
---
* TOC
{:toc}

## Advanced Message Queuing Protocol

AMPQ(Advanced Message Queuing Protocol)는 단일 수신자 메시징 패턴 구현에 자주 사용된다.
메시지가 제대로 전송되었는지 확인(acknowledge)도 가능하다.

Producer 가 메시지를 큐에 전달하면 브로커는 이에 대한 확인을 보내고 브로커가 메시지를 Consumer 에게 전달하면 
Consumer 는 자동 or 애플리케이션 코드로 메시지에 대한 확인을 보낼 수 있다. 브로커는 메시지 확인을 받은 경우에 해당 메시지를 큐에서 제거한다.

> 카프카는 메시지나 이벤트를 __분산 커밋 로그__ 로 관리한다. 서비스 로직에 아주 무거운 비지니스 로직들이 구현되어있는 클라우드 네이티브 애플리케이션의 비동기 통신 패턴을 구현하기 적합하다.
> 
> 카프카는 이벤트를 전달한 뒤에 이벤트를 삭제하지 않기 때문에 __이벤트 재생(replay)__ 이 가능하다.
> 각 이벤트는 __순번(seq)__ 을 가지고 있어서 메시지 소비자 측은 이 번호를 통해 메시지 스트림에서 일부만 선택해서 재상할 수도 있다.
> 
> 카프카는 AMQP 나 STOMP, MQTT 같은 프로토콜을 지원하지 않고, 이벤트 큐 시멘틱을 제공하지도 않는다. 그럼에도 훌륭한 성능과 이벤트 전달을 보장 한다는 특성 때문에 널리 사용된다.

## References

- Design Patterns for Cloud Native Applications / Kasun Indrasiri, Sriskandarajah Suhothayan Author / O'REILLY

