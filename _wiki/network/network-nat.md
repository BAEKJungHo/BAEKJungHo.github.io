---
layout  : wiki
title   : NAT
summary : Network Address Translation
date    : 2025-12-05 15:54:32 +0900
updated : 2025-12-05 20:15:24 +0900
tag     : network nat sdv
toc     : true
comment : true
public  : true
parent  : [[/network]]
latex   : true
favorite: true
---
* TOC
{:toc}

## NAT

네트워킹에서 빼놓을 수 없는 ***[NAT(Network Address Translation)](https://ko.wikipedia.org/wiki/%EB%84%A4%ED%8A%B8%EC%9B%8C%ED%81%AC_%EC%A3%BC%EC%86%8C_%EB%B3%80%ED%99%98)*** 에 대해서 살펴보자.

ISP 제공 업체(SK, KT 등)에서 제공해주는 인터넷 회선은 기본적으로 한 대의 기기만 직접적으로 연결할 수 있다.
“공유기(Router)”는 하나의 인터넷 회선을 연결하여, 이를 내부 네트워크로 나누고, 각 기기에 인터넷을 사용할 수 있는 사설 IP를 “무선 랜카드 or 유선 랜카드(Network Interface Card)” 에 자동으로 할당해준다. 이 덕분에, 여러 기기가 하나의 “인터넷 회선”을 통해 인터넷에 접속할 수 있는 환경이 만들어진다.

> Private IP 범위
> - 10.0.0.0 ~ 10.255.255.255
> - 172.16.0.0 ~ 172.31.255.255
> - 192.168.0.0 ~ 192.168.255.255

우리의 ***Peer(Mac, iPhone 등)*** 들은 공유기 등을 통해서 IP 를 할당받는데 이때 IP 는 사설(private) IP 이며, 이러한 peer 를 구분하기 위해서 ***[Port Forwarding](https://klarciel.net/wiki/network/network-port-forwarding/)*** 이 필요하다.
그리고 이러한 사설 IP 가 인터넷 통신을 하기 위해서는 공인(public) IP 로 변환이 되어야 한다. 이러한 네트워크 주소 변환 매커니즘(NAT)을 사용하는 이유는
이는 IPv4 ***자원을 절약하고, 보안을 강화***하기 위해서이다. NAT 를 사용하면 외부에서 내부 디바이스로 임의 접근이 기본적으로 차단된다.

![](/resource/wiki/network-nat/nat1.png)

![](/resource/wiki/network-nat/nat2.png)

*<small><a href="https://devopscube.com/what-is-nat-how-does-nat-work/">What is NAT? How Does NAT Work?</a></small>*

AWS 에서 NAT 인스턴스를 사용하면 프라이빗 서브넷의 리소스가 Virtual Private Cloud(VPC) 외부의 대상과 통신할 수 있다.

![](/resource/wiki/network-nat/nat3.png)

NAT 인스턴스는 인터넷에 액세스할 수 있어야 하므로, 퍼블릭 서브넷(인터넷 게이트웨이로 가는 경로가 있는 라우팅 테이블이 있는 서브넷)에 있어야 하며, NAT 인스턴스에는 퍼블릭 IP 주소 또는 탄력적 IP 주소가 있어야 한다.

### NAT Traversal

NAT 는 ***IP 부족 해결 및 보안***을 위한 기술이기 때문에 기본적으로 외부에서 내부로 들어오는 패킷은 기본적으로 차단한다.
따라서 WebRTC/P2P 상황에서 Peer 들은 서로의 사설 IP 를 모르고 공인 IP 만 안다고 해결되지 않는다.

```
[Client A] ---?---> [Client B]
   (NAT)              (NAT)
```

이러한 문제를 해결하기 위해서 NAT Traversal 이 필요하다. 핵심 아이디어는 ***내부에서 패킷이 나가면 NAT 가 길을 열어주는 것***이다.
즉, ***"내부에서 먼저 말을 걸어야(Outbound Traffic), 외부의 응답(Inbound Traffic)을 허용한다"*** 는 메커니즘이 이다.

1. 내부 → 외부 패킷 전송(Outbound)
2. NAT 가 포트 매핑 생성(Nat Table)
- The "Hole": 내부에서 패킷이 나갈 때 생성된 이 매핑 테이블의 항목이 바로 외부에서 들어올 수 있는 '구멍(Hole)'이 된다.
3. 외부에서 해당 포트로 응답 가능

***Outbound Packet 이 NAT Table 을 생성하는 Trigger*** 이다.

```
Protocol	Internal Addr (Inside)	External Addr (Outside)	Destination (Remote)
UDP	        192.168.1.5:5000	    211.45.10.2:**45000**	8.8.8.8:3478
```

NAT Table 에 정보가 남아있는 동안(TTL) 외부에서 공유기의 특정 IP:Port 로 패킷을 보내면 공유기는 테이블을 참조하여 목적지로 토스해준다.

### NAT Table & Timeout

NAT Table 은 TTL 이 존재한다. 그리고 이 내용 자체가 상당히 중요하다.

즉, TTL 만료 시 다음과 같은 실무 장애가 발생할 수 있다.

- “왜 갑자기 연결이 끊겼지?”
- “왜 일정 시간 지나면 다시 못 붙지?”

따라서 양방향 스트리밍에서는 ping/pong, keepalive 등을 사용하여 NAT 테이블을 지속적으로 유지해주는 것이 중요하다.

### CGNAT

CGNAT(Carrier Grade NAT)는 ISP(통신사) 레벨에서 수행되는 NAT이다.
일반 가정의 공유기가 NAT를 수행하듯, 통신사 네트워크가 대규모 NAT를 수행한다.

CGNAT의 등장 배경은 명확하다.

- IPv4 주소 고갈
- 모바일 디바이스 폭증
- 보안 및 네트워크 관리 필요성

IPv4 주소는 약 43억 개에 불과하며,
스마트폰·차량·IoT가 폭발적으로 증가하면서
단말마다 공인 IP를 할당하는 방식은 이미 불가능해졌다.

이러한 해결책이 바로 통신사 단위 NAT, 즉 CGNAT 이다.

특징으로는 단말은 공인 IP를 전혀 모르며,  통신사 내부에서도 여러 단계 NAT가 존재한다.
외부에서 단말로 직접 접근하는 경로 자체가 없다.

CGNAT 은 아래 주소 대역을 사용한다.

```
// ISP 내부 전용 NAT 주소
100.64.0.0 ~ 100.127.255.255
```

사설 IP처럼 보이지만 일반 Private IP(10/172/192)와는 다르다.

## NAT Sequence Diagrams

### Outbound Traffic - NAT Table 생성

내부 클라이언트가 외부 서버로 요청을 보낼 때 NAT Table 이 생성되는 과정:

![](/resource/wiki/network-nat/nat-flow1.png)

### Inbound Traffic - NAT Traversal

외부 서버의 응답이 NAT Table을 통해 내부 클라이언트로 전달되는 과정:

![](/resource/wiki/network-nat/nat-flow2.png)

위 다이어그램은 다음을 보여준다:

- **Outbound**: 내부에서 외부로 패킷이 나갈 때 NAT Table 엔트리가 생성되는 과정
- **Inbound**: NAT Table을 참조하여 외부 응답이 내부로 전달되는 과정
- **TTL 관리**: NAT Table의 TTL이 만료되면 Inbound 패킷이 차단되므로 keepalive가 필요함



