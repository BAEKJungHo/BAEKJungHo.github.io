---
layout  : wiki
title   : Netty PrematureCloseException
summary : 
date    : 2023-06-25 15:05:32 +0900
updated : 2023-06-25 15:15:24 +0900
tag     : troubleshooting webflux network
toc     : true
comment : true
public  : true
parent  : [[/troubleshooting]]
latex   : true
---
* TOC
{:toc}

## PrematureCloseException

Calling REST Services(server to server 통신) 에서 Reactor Netty 의 WebClient 를 사용 중이었고, [Bean 으로 등록해서 사용](https://docs.spring.io/spring-boot/docs/2.1.0.RELEASE/reference/html/boot-features-webclient.html#boot-features-webclient) 중이었다.

__Cause__:

![](/resource/wiki/troubleshooting-webclientrequestexception/webclientrequestexception.png)

Target Server 가 응답하기 전에 Connection 이 Close 되어서 발생한 이슈이다. 

__Trouble Shooting:__

네트워크 통신에서는 __idle timeout__ 이라는 값이 존재한다. TCP 기반의 프로토콜에서 주로 사용되는데, "일정 시간 동안 통신이 없을 때 연결을 종료하는 시간 제한" 옵션이라 보면 된다.

매번 요청할 때마다 TCP 3 way handshake 과정을 거친다면 latency 때문에 통신이 비효율적이고 성능에 문제가 있을 것이다.

> DB Connection, Network Connection 등 커넥션을 처음 수립하는 과정은 많은 비용(cost)이 발생한다.

![](/resource/wiki/network-tcp-performance/keepalive.png)

그래서 HTTP 1.1 에서는 __keep-alive__ 라는 지속 커넥션을 사용하여 TCP Connection 비용을 줄일 수 있다.

1. timeout 시간이 지나면 확인 패킷을 보낸다.
2. 응답을 받으면 다시 카운트
3. 응답을 받지 못한 경우 인터벌 타임 이후 다시 요청을 보낸다. 요청을 보내도 응답이 없다면 소켓을 닫는다.

이 개념을 가지고 문제가 발생할 수 있는 상황을 묘사하면 다음과 같다.

KeepAliveTimeout 이 5초이고, WebClient 에서 설정한 idleTimeout 이 무한 대기라고 할때, 
서로 요청을 주고 받다가 요청을 하는 서버쪽에서 5초 정도 시간이 흐른 뒤에 __SYN(request)__ 을 보내게 되면 Target Server 쪽에서
보내는 __FIN(close)__ 과 서로 엇갈려서 위와 같은 이슈가 발생할 수 있다.

이러한 문제는 WebClient 를 사용할 때 idleTimeout 값을 별도로 설정해주지 않았다면 빈번하게 발생할 수 있는 문제이며, 
이에 대한 해결방법도 공식문서에 나와있다.

[How can I debug "Connection prematurely closed BEFORE response?"](https://projectreactor.io/docs/netty/snapshot/reference/index.html#faq.connection-closed)
이 문서를 읽다보면 [Timeout Configuration](https://projectreactor.io/docs/netty/snapshot/reference/index.html#timeout-configuration) 부분을 참고하여 문제를 해결할 수 있다.

__Timeout Configuration__:

![](/resource/wiki/troubleshooting-webclientrequestexception/timeout-configuration.png)

아래와 같이 ConnectionProvider 를 구성하여 HttpClient 를 생성할때 create() 메서드의 인자로 넘기면 된다.

```java
ConnectionProvider provider = ConnectionProvider.builder("custom-provider")
        .maxIdleTime(Duration.ofSeconds(3)) // idle 상태의 최대 수명 시간
        .maxLifeTime(Duration.ofSeconds(58)) // Connection Pool 에서의 최대 수명 시간
        .pendingAcquireTimeout(Duration.ofSeconds(45)) // Connection Pool 에서 사용할 수 있는 Connection 이 없을때 (모두 사용중일때) Connection 을 얻기 위해 대기하는 시간. Default 45sec.
        .pendingAcquireMaxCount(-1) // Connection 을 얻기 위해 대기하는 최대 수
        .lifo() // 가장 최근의 Connection 을 사용
        .build();
```

여기서 주의깊게 볼 것은 __lifo()__ 옵션이다. reactor.netty.resources.ConnectionProvider 를 살펴보면 default value 값들을 살펴볼 수 있다.

![](/resource/wiki/troubleshooting-webclientrequestexception/fifo.png)

기본전략이 FIFO 임을 알 수 있다. FIFO 전략은 idle 커넥션이 있는 경우, The next acquire operation will get the __Least Recently Used____ connection (LRU, i.e. the connection that was released first among the current idle connections) 이다.

LIFO 전략은 idle 커넥션이 있는 경우, the next acquire operation will get the __Most Recently Used connection__ (MRU, i.e. the connection that was released last among the current idle connections) 이다.

More Articles. [How to Avoid Common Mistakes When Using Reactor Netty](https://speakerdeck.com/violetagg/how-to-avoid-common-mistakes-when-using-reactor-netty?slide=91)




