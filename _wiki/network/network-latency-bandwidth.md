---
layout  : wiki
title   : Latency, Bandwidth
summary : 
date    : 2026-01-13 15:54:32 +0900
updated : 2026-01-13 20:15:24 +0900
tag     : network
toc     : true
comment : true
public  : true
parent  : [[/network]]
latex   : true
---
* TOC
{:toc}

## Latency, Bandwidth

빠른 사용자 경험(user experience)을 위해서는 속도가 중요하다. 빠른 속도를 내기 위해서는 여러가지 요소와 근본적인 제약사항에 대해 이해해야 한다.
비유적으로 먼저 설명하자면 대역폭은 수도관의 굵기(지름)이며, 레이턴시는 물이 수도관 끝에서 끝까지 이동하는 속도이다. 엔지니어링 관점에서 레이턴시를 더 세분화 하면 아래와 같이 분해할 수 있다.

***[레이턴시(latency)](https://klarciel.net/wiki/network/network-latency/)*** 는 ***[패킷(packet)](https://klarciel.net/wiki/network/network-socket-protocol/)*** 이 출발지에서 목적지까지 이동하는데 걸리는 시간을 의미한다.
레이턴시는 금융권에서 사용하는 거래 알고리즘의 중요한 기준이 된다. 0.001 초 차이로 수백만 달러의 돈이 왔다갔다 하기 때문이다.

***[대역폭(bandwidth)](https://en.wikipedia.org/wiki/Bandwidth_(computing))*** 은 논리적인 혹은 물리적인 통신 경로의 최대 처리량을 의미한다.
다시 말하면, **단위 시간당 전송할 수 있는 최대 데이터 양(보통 bps - bits per second)** 을 의미한다.

> 처리량(Throughput)과의 차이: 대역폭은 이론적인 최대치이고, 처리량은 실제 전송되는 양이다. 
> - 패킷 손실, 재전송, 프로토콜 오버헤드 등으로 인해 실제 처리량은 대역폭보다 항상 낮다.

```
Latency = Propagation + Transmission + Processing + Queuing
```

- **전파 지연(Propagation Delay)**: 데이터(전기 신호나 빛)가 매체를 통과하는 물리적인 시간이다.
  - 결정 요인: 거리와 매체의 속도. (서울에서 뉴욕까지의 물리적 한계)
  - 개선 방법: 서버를 유저 가까이 배치(CDN, Edge Computing)하는 것 외엔 방법이 없다. 
- **전송 지연(Transmission Delay)**: 데이터 패킷 전체를 링크(회선)에 밀어 넣는 데 걸리는 시간이다.
  - 대역폭이 클수록 이 시간이 줄어든다.
- **처리 지연(Processing Delay)**: 라우터나 스위치가 패킷 헤더를 읽고 어디로 보낼지 결정하는 시간이다.
- **큐잉 지연(Queuing Delay)**: 네트워크 장비의 버퍼(Queue)에서 처리를 기다리는 시간이다. 트래픽이 몰리면(혼잡) 이 시간이 기하급수적으로 늘어난다.

대역폭은 늘린다고 해서 데이터가 더 "빨리" 도착하는 것(레이턴시 감소)이 아니다. 단지 "많은" 데이터를 같은 시간에 보낼 수 있게 되어 **전송 지연(Transmission Delay)** 만 줄어들 뿐이다.

### BDP: Bandwidth-Delay Product

BDP 는 어떤 순간에 네트워크 파이프라인 안에 꽉 채울 수 있는(전송 중인) 데이터의 양을 의미한다. 공식은 다음과 같다.

```
BDP = Bandwidth x RTT(Round Trip Time)
```

- TCP 튜닝: 고속 네트워크에서 레이턴시가 높은 경우(예: 한국-미국 간 대용량 전송), TCP Window Size가 BDP보다 작으면 대역폭을 100% 활용하지 못한다. 즉, 회선은 10Gbps인데 실제 속도는 100Mbps밖에 안 나오는 상황이 발생한다.

### TTFB: Time To First Byte

TTFB 는 사용자가 요청(Request)을 보낸 시점부터, 서버로부터 응답의 **가장 첫 번째 바이트(First Byte)** 가 사용자 기기에 도달하는 순간까지의 시간을 의미한다.
이것은 **사용자 체감 속도(Perceived Performance)** 의 시작점이기 이다. TTFB 가 길면, 화면에는 아무것도 뜨지 않고 하얀 화면(Blank Screen)만 보인다.

TTFB 가 늦다는 것은 다음과 같은 문제가 원인일 수 있다.

1. 네트워크 레이턴시(Network Latency): 요청이 서버로 가는 시간 + 첫 응답이 오는 시간. (물리적 거리 문제)
2. DNS & Handshake: 서버 IP 를 찾고(DNS), 보안 연결을 맺는(TLS/SSL) 초기 비용
3. 서버 처리 시간(Server Processing Time): 서버가 요청을 받고 DB 를 조회하고, 응답을 주기 까지 준비 시간

TTF B가 500ms 인데 Ping 이 20ms 라면? 480ms는 순수하게 백엔드 애플리케이션이나 DB 가 느린 것이다.

### RTT: Round Trip Time

RTT 는 패킷이 갔다가 돌아오는 왕복 시간을 의미한다. 

### Tail Latency

Tail Latency 는 평균이 아니라 하위 1% 혹은 5%의 불운한 사용자가 겪는 느린 속도를 의미한다.

### Cold Start

Cold Start 는 (서버리스/클라우드 환경) 서버가 잠들어 있다가 요청이 와서 깨어나는 데 걸리는 시간을 의미하며 TTFB 를 급격히 높이는 원인이다.

## References

- HIGH PERFORMANCE BROWSER NETWORKING / O'REILLY / Ilya Grigorik

