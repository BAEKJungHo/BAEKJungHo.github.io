---
layout  : wiki
title   : Reactive Streams Pub/Sub Model
summary : 
date    : 2023-08-09 15:05:32 +0900
updated : 2023-08-09 15:15:24 +0900
tag     : reactive kafka
toc     : true
comment : true
public  : true
parent  : [[/reactive]]
latex   : true
---
* TOC
{:toc}

## Reactive Streams Pub/Sub Model

__Publisher__:

![](/resource/wiki/reactive-pub-sub/publisher.png)

Publisher 는 발행자인데 subscribe 메서드가 있는것이 의아할 수 있다. Kafka 의 Pub/Sub Model 과 비교해보자.

Kafka 는 Topic 을 관리하고 있는 Publisher 와 Subscriber 의 중간 매개체인 Broker 라는 개념이 존재한다.
따라서 pub/sub 간 느슨한 결합을 띄고있다.

하지만, Reactive Streams 는 개념상으로는 Subscriber 가 구독하는 것은 맞는데 코드 상으로는 Publisher 의 subscribe 메서드를 통해서 Subscriber 를 등록 해줘야 한다.
따라서 pub/sub 간 강한 결합을 띄고있다.