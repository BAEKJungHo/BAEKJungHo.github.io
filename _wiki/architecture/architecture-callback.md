---
layout  : wiki
title   : CALLBACK
summary : 
date    : 2024-11-04 11:02:32 +0900
updated : 2024-11-04 12:12:24 +0900
tag     : architecture designpattern
toc     : true
comment : true
public  : true
parent  : [[/architecture]]
latex   : true
---
* TOC
{:toc}

## CALLBACK

Callback Function 의 필요성은 ___[Strategy Design Pattern](https://klarciel.net/wiki/designpattern/designpattern-strategy/)___ 을 통해서 쉽게 알 수 있다.

__Template Callback Pattern Pseudo Code__:

```kotlin
fun dispatch(callback: (String) -> Unit) {
    // Context: 변하지 않는 부분
    val context = "Context"
    // Strategy: 변하는 부분
    callback(context)
}
```

위 코드를 통해서 배울 수 있는 부분은 다음과 같다.

1. callback 함수를 호출하는 것은 callback 함수를 파라미터로 받는 다른 함수,모듈,스레드이다.
2. callback 함수는 람다식으로 전달이 가능하다.
3. callback 함수는 ___[Deferred Execution](https://klarciel.net/wiki/reactive/reactive-defer/)___ 된다.

여기까지가 Callback 함수가 필요성과 동기식 Callback Function 의 사용 방법이다. 높은 동시성(high-concurrency)을 요구하는 소프트웨어의 경우에는 
___[Async Callback](https://klarciel.net/wiki/architecture/architecture-async-nonblocking/)___ 방식을 사용해야 한다. 
예를 들어, 서비스 서버가 플랫폼으로의 호출 결과를 반드시 알아야 하는 경우 '알림(notification) 방식' 을 이용하면 된다. 즉, Callback API 를 제공해주고 플랫폼에 해당 API 를 등록하면, 플랫폼은 서비스 서버로 부터 요청을 받고
결과를 비동기로 Callback API 로 전달한다.

높은 동시성외에도 비동기가 필요한 경우는 '디스크의 파일 읽고 쓰기, 네트워크 데이터 송수신' 등 시간이 많이 걸리는 I/O 작업을 하는 경우, 해당 작업을 백그라운드 형태로 진행한다.

만약, 전체 시스템을 ___Fully-Async Architecture___ 로 구성하려면, 클라이언트에게 응답을 전송하기 위해 ___Event Streaming Platform or Cloud Databases___ 가 필요하다.




