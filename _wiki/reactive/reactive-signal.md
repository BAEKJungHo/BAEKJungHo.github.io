---
layout  : wiki
title   : Signal
summary : 
date    : 2023-08-01 15:05:32 +0900
updated : 2023-08-01 15:15:24 +0900
tag     : reactive
toc     : true
comment : true
public  : true
parent  : [[/reactive]]
latex   : true
---
* TOC
{:toc}

## Signal

Reactive Streams 에서 Signal 은 Publisher 와 Subscriber 간에 주고받는 상호작용을 의미한다.

Subscriber 인터페이스에 있는 onSubscribe, onNext, onComplete, onError 그리고 Subscription 에 있는 request, cancel 메서드를
Signal 이라고 표현한다.

onSubscribe, onNext, onComplete, onError 메서드들을 실제 호출해서 사용하는 주체는 Publisher 이기 때문에
Publisher 가 Subscriber 에게 보내는 Signal 이라고 볼 수 있다.

request, cancel 메서드들을 실제로 사용하는 주체는 Subscriber 이기 때문에 Subscriber 가 Publisher 에게 보내는 Signal 이라고 볼 수 있다.

## References

- 스프링으로 시작하는 리액티브 프로그래밍 / 황정식 저 / 비제이퍼블릭
