---
layout  : wiki
title   : Avoid blocking all threads in a network latency
summary : 네트워크 지연 환경에서 모든 스레드 블락킹 피하기
date    : 2023-03-09 15:05:32 +0900
updated : 2023-03-09 15:15:24 +0900
tag     : troubleshooting
toc     : true
comment : true
public  : true
parent  : [[/troubleshooting]]
latex   : true
---
* TOC
{:toc}

## Avoid blocking all threads in a network latency

![](/resource/wiki/troubleshooting-thread-block/request.png)

위와 같은 흐름에서 B 와 C 서버 사이 구간이 해외망이라 Network Latency 가 빈번하게 발생하는 경우에 RequestA 와 RequestB 를 처리하기 위한 스레드가 같은 경우 B-C 구간에서 네트워크 지연이 발생하면 다른 서버의 스레드까지 함께 블락킹 되어 모든 스레드가 행에 걸려 더 이상 요청을 처리할 수 없는 상태가 된다.

이렇게 네트워크 지연으로 인해 모든 스레드가 블락킹되는 것을 막기 위해서, __요청을 처리하는 각 스레드를 분리하여 해결__ 할 수 있다.

하지만 해외망에 의한 통신 구간은 여전히 지연이 빈번하기 때문에, 하나의 API 에서 동기로 처리할 경우 상황에 따라 사용자는 C 서버의 응답을 기다리느라 다른 서비스를 이용할 수 없게 됨. 따라서 이 구간을 비동기로 처리하여 고객 경험은 상승시키고 트랜잭션 시간을 최소화 할 수 있음.

## Links

- [Toss SLASH 22 - 애플 한 주가 고객에게 전달 되기까지](https://www.youtube.com/watch?v=UOWy6zdsD-c&t=243s)