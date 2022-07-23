---
layout  : wiki
title   : TCP Performance
summary : 
date    : 2022-07-08 15:54:32 +0900
updated : 2022-07-08 20:15:24 +0900
tag     : network
toc     : true
comment : true
public  : true
parent  : [[/network]]
latex   : true
---
* TOC
{:toc}

## TCP slow start

![](/resource/wiki/network-tcp-performance/congestion.png)

- TCP 3 way handshake 는 왕복시간 한 번만큼의 latency 를 발생
- TCP Slow start 는 connection 이 새로 만들어질 때 항상 발생
- TCP Flow control 과 Congestion control 은 모든 Connection 의 처리량을 조절
- TCP 처리량은 현재 cwnd(Congestion Window) size 에 의해 결정됨 

## Flow control

> 흐름 제어(Flow Control)는 송신자가 수신자에게 처리하지 못할 만큼의 많은 데이터를 전송하는 것을 미리 방지하는 매커니즘이다. 수신자가 데이터를 받지 못하는 경우는 보통 수신자가 다른 데이터를 처리하고 있거나, 밀려 있는 데이터가 많아서 버퍼 공간을 충분히 지정해주지 않는 경우다. 이러한 문제를 해결하기 위해 양쪽의 TCP Connection 이, 각자 자신의 `receive window(rwnd)` 를 통지하여 수신데이터를 저장할 버퍼 공간의 크기를 서로에게 알려준다. 이 버퍼 공간은 데이터 처리를 기다리는 응용 계층 프로토콜에 스택을 꽉 채울때까지 데이터가 임시적으로 저장되는 공간이다. 따라서 전송 호스트는 한 번에 window size 필으에 명시된 데이터 양 만큼 보낼 수 있다.

## Congestion Control

> 혼잡 붕괴(Congestion collapse)란 Speed mismatch 거나 여러 port 에서 입력된 트래픽이 하나의 port 로 집중되는 등의 상황에 발생한다. 전자의 경우 buffering 은 output port buffer(output queue)에서 발생하며, 후자의 경우엔 input/output queue 모두 발생할 수 있다. 후자의 경우 port 별 경쟁 상황이 발생하는데 queue 의 크기가 작으면 buffer overflow 에 의해 packet drop 이 발생하여 TCP 송신자가 DUP_ACK 를 연속 3회 수신하게 된다. 반면, queue 의 크기가 크면 queue 에서 대기하는 buffering delay 가 증가하여 TCP retransmission timeout 이 발생한다. 그리고 이 두 경우에 TCP Congestion 을 감지하고 혼잡 제어 동작을 수행한다.

TCP Congestion Control 에는 대표적으로 slow start, congestion avoidance, fast retransmit, fast recovery 등 이 있다.

![](/resource/wiki/network-tcp-performance/congestion2.png)

### slow start

> 클라이언트와 서버간의 허용량을 가늠하는 유일한 방법은 실제로 데이터를 교환하면서 허용량을 측정한는 것 뿐이다. 이것이 slow start 가 하는 일이다.

### congestion avoidance

> 혼잡 회피에서 암묵적으로 판단하기에 패킷 손실이 일어났다는 것은 네트워크 혼잡이 일어났다는 신호다. 이동 경로의 어딘가에서 정체가 일어난 라우터가 패킷을 누락시켰을 것이다. 그래서 네트워크에 부담을 덜어주고 더 이상 패킷 손실을 막기 위해 윈도 사이즈를 조정해야 하는 것이다.

패킷 손실이 일어났다는 건 네트워크 혼잡이 일어났다는 신호로 보고, window size 조정이 발생한다.

## HTTP 1.1 - keep-alive

![](/resource/wiki/network-tcp-performance/keepalive.png)

매번 요청할 때 마다 TCP 3 way handshake 와 slow start 가 발생하면 통신이 비효율적이다. 그래서 HTTP 1.1 에서는 keep-alive 라는 지속 커넥션을 사용하여 TCP Connection 비용을 줄일 수 있다.

1. timeout 시간이 지나면 확인 패킷을 보낸다.
2. 응답을 받으면 다시 카운트
3. 응답을 받지 못한 경우 인터벌 타임 이후 다시 요청을 보낸다. 요청을 보내도 응답이 없다면 소켓을 닫는다.

즉, 웹 애플리케이션에서 설정된 기간 까지 최대한 연결을 유지한다.

![](/resource/wiki/network-tcp-performance/keepalive2.png)

- __단점__
  - 각 요청들의 요청과 응답 순서가 같아야 해서 동기적으로 주고받을 수 밖에 없다.
  - FIFO 방식으로 보낸다.

이런 단점을 개선한 것이 HTTP 1.1 - Pipelining 이다.

## HTTP 1.1 - Pipelining

![](/resource/wiki/network-tcp-performance/pipelining.png)

- 한 번에 요청을 서버에서 받도록 변경
- 서버쪽으로 Queue 를 넘겨 FIFO 로 처리

하지만 여전히 순서를 보장해야 한다는 문제가 있다. 가령, 첫 번째 요청을 서버에서 처리하지 못했다면? (HoL Blocking)

이런 단점을 개선한 것이 HTTP 1.1 - Multiple Connections 이다.

## HTTP 1.1 - Multiple Connections

![](/resource/wiki/network-tcp-performance/multiconnections.png)

TCP Connection 을 여러개 생성하여 벼열 연결하면 대역폭을 많이 차지해 Latency 가 증가할 수 있다.

![](/resource/wiki/network-tcp-performance/multiconnections2.png)

## HTTP2

![](/resource/wiki/network-tcp-performance/http2.png)

![](/resource/wiki/network-tcp-performance/http2-1.png)

- Stream 은 여러 message 들로 구성
- message 는 header/data 등의 frame 으로 구성
- Stream 에 식별자를 붙임
- 요청 응답 순서에 상관없이 전달 받더라도 서버 응답이 비동기 방식으로 처리 됨

__하나의 TCP 연결을 통해 다수의 클라이언트 요청 처리가 가능해짐__

하지만 TCP 기반의 HTTP 이다.

TCP 로 연결을 맺으며, TCP Header 안쪽에 HTTP Header 가 있다. 따라서 HTTP 는 TCP 의 영향을 받는다.

![](/resource/wiki/network-tcp-performance/tcpseq.png)

TCP 는 Sequence Number 가 존재하기 때문에 순서 보장이 필요하다. 따라서 이거에 대한 대응으로 `QUIC` 이라는게 존재한다.

![](/resource/wiki/network-tcp-performance/http.png)

![](/resource/wiki/network-tcp-performance/quic.png)

## Links

- [Network Layered Architectures](https://baekjungho.github.io/wiki/network/network-layeredarchitectures/)
- [tcp error recovery](https://www.brainbackdoor.com/network/tcp-error-recovery)
- [tcp performance](https://www.brainbackdoor.com/network/tcp-performance)
- [NextStep 인프라 공방](https://edu.nextstep.camp/)