---
layout  : wiki
title   : Fire and Forget
summary : Redis Pub/Sub
date    : 2024-12-11 15:28:32 +0900
updated : 2024-12-11 18:15:24 +0900
tag     : designpattern redis
toc     : true
comment : true
public  : true
parent  : [[/designpattern]]
latex   : true
---
* TOC
{:toc}

## Fire and Forget

Fire and Forget 패턴은 Async Programming 에서 사용된다. 어떤 작업을 실행하고 그 결과에 대한 응답을 기다리지 않고 바로 다음 코드를 실행하는 것을 의미한다.
이 패턴은 주로 성능 향상이나 비동기 작업을 수행할 때 사용되며, 작업의 완료나 결과에 대한 처리가 필요하지 않을 때 유용하게 사용된다.
예를 들면 로깅, 이벤트 발행, 통계 데이터 수집과 같이 작업의 성공 또는 실패에 대한 관심이 없는 경우에 활용될 수 있다.
Fire and Forget 은 결과 확인이나 오류 처리를 고려하지 않고 작업을 진행하므로, 신뢰성이 필요한 경우에는 사용하지 않아야 한다.

일반적으로 간단한 알림(notification) 서비스에는 적합한 패턴이다.

Redis Pub/Sub 은 데이터가 채널에 전파된 후 삭제되는 일회성의 특징을 가지며, 메시지가 잘 전달됐는지 등의 정보는 보장하지 않는다.