---
layout  : wiki
title   : VPN 
summary : Virtual Private Network
date    : 2025-12-08 15:54:32 +0900
updated : 2025-12-08 20:15:24 +0900
tag     : network sdv vpn tunneling
toc     : true
comment : true
public  : true
parent  : [[/network]]
latex   : true
favorite: true
---
* TOC
{:toc}

## VPN

***[VPN(Virtual Private Network)](https://en.wikipedia.org/wiki/Virtual_private_network)*** 은 공용 인터넷 위에 ‘가상의 전용 네트워크 터널’을 만들어 마치 같은 사설망에 있는 것처럼 통신하게 해주는 기술이다.

VPN 의 진정한 가치는 보안(Security)을 넘어선 <mark><em><strong>'네트워크 추상화(Abstraction)를 통한 연결의 지속성(Persistence)'</strong></em></mark> 에 있다.

회사 VPN 에 접속하는 상황을 살펴보면 다음과 같은 순서로 진행된다.

1. 노트북 → VPN 서버 접속
2. 인증 (ID/Cert)
3. 암호화 키 교환
4. 가상 인터페이스 생성 (tun0)
- ifconfig tun0
- 실제 NIC 아니며, OS 레벨 가상 인터페이스이며, OS는 진짜 LAN 처럼 인식한다.
- 즉, 고정된 가상 IP를 할당받는다. (e.g 10.8.0.2)
5. 라우팅 테이블 변경
6. 이후 패킷은 터널로 이동

VPN 이 갖는 몇가지 특징 및 기술에 대해서 살펴보자.

## Tunneling

터널링은 본질적으로 캡슐화의 한 형태이며, ***"패킷 안에 또 다른 패킷을 넣는 기술"*** 이다.

```
[VPN Header]
  [IP Header]
    [TCP/UDP]
      [Application Data]
```

원래 패킷을 다른 패킷으로 감싸며, 외부에서는 내부 패킷이 보이지 않는다.
이러한 터널링 기술을 통해서 실제로 달성하려는 것은 ***Network Abstraction*** 이다.

- 이기종 프로토콜 연결 (IPv6 over IPv4)
  - 상황: 내 PC는 IPv6를 쓰는데, 지나가는 인터넷망이 아직 IPv4만 지원함
  - 터널링: IPv6 패킷(Passenger)을 IPv4 패킷(Carrier) 안에 넣어서 전송. 라우터들은 겉의 IPv4만 보고 전달하고, 목적지에서 포장을 뜯어 IPv6를 꺼냄
- 보안 없는 망에서의 가상 사설망 (VPN)
  - 상황: 서울 본사와 부산 지사가 인터넷(공용망)을 통해 사설 IP 통신을 해야 함
  - 터널링: 사설 IP 패킷을 암호화한 뒤 공인 IP 패킷에 담는다. 해커가 중간에 패킷을 까봐도 암호화된 데이터(Payload)만 보이고, 내부 IP 구조는 숨겨짐

"패킷 안에 패킷을 넣는다"는 말은 엔지니어에게 ***"헤더가 늘어난다"*** 는 뜻과 같다. 즉, ***오버헤드(Overhead)*** 가 발생한다.
표준 이더넷의 MTU(Maximum Transmission Unit)는 1500 바이트이며. 1570 바이트짜리 터널링 패킷은 지나갈 수 없다. 따라서 패킷을 강제로 두 개로 쪼개는
단편화(Fragmentation)을 처리하거나, 내부 패킷의 크기(MSS)를 줄여서 터널 헤더를 붙여도 1500 바이트를 넘지 않도록 조정해야 한다.

## Network Handover: VPN as an Abstraction Layer that Survives Physical Disruptions

차량과 클라우드간 통신을 하는 과정을 생각해보자. 

첫 번째 문제로 차량은 LTE 망을 통하면서 IP 가 계속 바뀌며, 클라우드 서버는 차량의 IP 를 알 수 없으므로 먼저 접속할 수 없다.
물리적인 IP 가 변경이 되는 문제를 해결하기 위해서는 IP 가 고정되어야 한다.
따라서, 차량에서 VPN 을 사용하여 OS Level 의 가상 인터페이스(tun0)가 생성되어  ***고정된 가상 IP (Virtual IP, e.g 10.8.0.5)*** 를 할당 받게 된다.

<mark><em><strong>VPN provides a stable virtual IP that masks physical IP changes in mobile networks.</strong></em></mark>

두 번째 문제점은 LTE/5G는 기지국 핸드오버 시 순간적으로 끊기며, TCP 세션은 이때 다 끊어진다.
즉, VPN 이 없다면, 네트워크 전환은 곧 **'소켓의 죽음'** 을 의미한다.

TCP/IP 네트워크에서 하나의 연결(Session)은 5-Tuple 로 식별된다.

__Handover Scenario 1__:

```
[Source IP, Source Port, Dest IP, Dest Port, Protocol]
```

- 상황: 차량이 기지국 A(1.1.1.1)에서 기지국 B(2.2.2.2)로 이동
- 변화: Source IP가 1.1.1.1에서 2.2.2.2로 바뀜
- 결과: 5-Tuple 이 변경됨. 서버 입장에서는 2.2.2.2에서 들어온 패킷이 기존 1.1.1.1 세션과 관련이 있는지 알 방법이 없음
- 종료: 보안 및 프로토콜 규약상 서버는 이 패킷을 버리거나 RST(Reset) 패킷을 보내 연결을 강제로 끊음. (e.g WebSocket/gRPC Stream 즉시 종료)

이로 인해 상위 애플리케이션(WebRTC 등)은 Connection Closed 이벤트를 받고, 다시 처음부터 연결(Handshake)을 시도해야 하므로 흐름이 뚝 끊긴다.

다음 시나리오도 살펴보자.

- 상황: LTE(1.1.1.1)에서 WiFi(192.168.0.5)로 전환 
- 커널 동작:
  - OS가 WiFi 연결을 감지하고, 라우팅 테이블의 Default Gateway 를 LTE 인터페이스(rmnet0)에서 WiFi 인터페이스(wlan0)로 변경한다.
  - 애플리케이션이 다음 패킷을 보내려 할 때, 커널은 Source IP를 1.1.1.1이 아닌 192.168.0.5로 바꿔서 내보낸다.
- 결과:
  - TCP 헤더의 5-Tuple이 깨짐: (Src: 1.1.1.1) → (Src: 192.168.0.5)
  - 서버는 "넌 누구냐?" 하고 RST(Reset) 패킷을 전송
  - WebSocket/gRPC Stream 즉시 종료

VPN 을 켜는 순간, 이 과정은 **Encapsulation(캡슐화)** 에 의해 보호받는다.

__Handover Scenario with VPN__:
- 이동: 차량의 IP가 1.1.1.1 -> 2.2.2.2로 바뀜
- 전송: 차량의 VPN 클라이언트는 바뀐 IP(2.2.2.2)를 사용하여 암호화된 패킷을 서버로 보냄. 별도의 "나 IP 바꼈어"라는 핸드쉐이크 패킷을 보낼 필요가 없다. 그냥 데이터 패킷을 보낸다.
- 서버 수신 & 검증:
  - 서버는 2.2.2.2에서 온 패킷을 받는다.
  - 복호화 및 서명 검증을 수행합니다. "어? 이 패킷, 철수(User A)의 키로 서명됐네?"
- Endpoint 갱신 (Roaming):
  - 서버는 즉시 내부 메모리(Peer Table)를 업데이트한다.
  - User A Endpoint: 1.1.1.1:51820 -> 2.2.2.2:45000
  - 응답: 서버는 이제 2.2.2.2로 응답을 보낸다.

__OSI Layer__:
- Layer 3 (Network): 라우팅 테이블의 속임수
  - OS 커널에는 두 개의 세상이 공존하게 된다.
  - Overlay (가상 세상):
    - 인터페이스: tun0
    - IP: 10.8.0.2 (고정)
    - 애플리케이션: "나는 tun0에 빨대 꽂고 10.8.0.2로서 통신한다."
  - Underlay (물리 세상):
    - 인터페이스: rmnet0(LTE) → wlan0(WiFi)
    - IP: 1.1.1.1 → 192.168.0.5 (가변)
    - VPN 클라이언트: "나는 물리적 상황에 맞춰서 패킷을 배달만 한다."
- Layer 4 (Transport): 소켓(Socket)의 불멸성
  - 이 부분이 CS 레벨 설명의 핵심이다.
  - Socket Binding: WebRTC 나 gRPC 앱은 소켓을 생성할 때 tun0 인터페이스의 IP(10.8.0.2)에 바인딩한다.
  - ```protobuf
    // 앱의 소켓 구조체 (Kernel Memory)
    struct sock {
      .sk_saddr = 10.8.0.2;  // Source IP는 고정됨
      .sk_daddr = 10.8.0.1;  // Server IP도 고정됨
    }
    ```
  - Packet Generation: 앱이 데이터를 보내면, 커널은 항상 Src: 10.8.0.2인 패킷을 생성하여 tun0로 보낸다. 물리적 네트워크가 바뀌든 말든, 앱이 만드는 패킷의 헤더는 1비트도 변하지 않는다.

실제 LTE → WiFi 전환 시 0.1초 사이에 일어나는 일들을 뜯어보자.

__The Handover Moment__:
- Step 1: 물리 링크 변경 (Underlay Change)
  - OS의 Network Manager 가 WiFi 연결을 성공시킨다.
  - Routing Table Update: "이제 인터넷으로 가는 패킷은 WiFi(wlan0)로 던져라."
- Step 2: VPN 클라이언트의 감지 및 대응
  - VPN 프로세스(User Space)는 커널의 Netlink 소켓을 통해 **"라우팅 변경 이벤트"** 를 감지한다.
  - "어? 길이 바뀌었네? 이제부터 암호화된 패킷(Outer Packet)의 Source IP를 WiFi IP(192.168.0.5)로 갈아끼워서 보내야겠다."
- Step 3: 패킷의 변신 (Encapsulation Change)
  - 앱은 여전히 똑같은 패킷을 tun0로 던진다. VPN 클라이언트는 이를 받아서 **포장지(Outer Header)** 만 바꾼다.
- Step 4: 서버의 처리 (Cryptokey Routing / Roaming)
  - 서버는 패킷을 받는다. Src IP가 갑자기 바뀌어서 들어온다.
  - 하지만 복호화를 해보니 **"서명(Key)이 일치"**하고 **"Inner IP가 10.8.0.2로 동일"**하다.
  - 서버: "아, User A가 LTE에서 WiFi로 갈아탔구나. 엔드포인트 주소만 업데이트하고 세션은 그대로 유지하자."

<mark><em><strong>VPN 을 사용하면 세션 식별이 IP 변경에 의존하지 않기 때문에, 기지국 핸드오버로 물리 IP가 바뀌어도 TCP 세션과 상위 애플리케이션 연결이 유지된다.</strong></em></mark>

### Sequence Diagram

![](/resource/wiki/network-vpn/vpn-flow.png)

### UDP

VPN 터널 자체는 TCP 가 아닌 UDP 로 맺는 것이 표준이다. UDP 는 연결 상태를 유지하지 않고 보내면 끝이다.
따라서 다음과 같은 효과를 낼 수 있다.

- 기지국이 바뀌는 1~2초 동안 물리적 연결이 끊기면, UDP 패킷은 그냥 유실(Drop)된다.
- 네트워크가 복구되어 다시 패킷을 보내면, 커널 레벨에서 TCP Syn/Ack 같은 재연결 과정 없이 바로 전송이 재개된다.
- 즉, **"터널은 끊어진 적이 없고, 잠시 패킷이 안 왔을 뿐"** 이라고 VPN 프로세스는 판단한다.

이러한 VPN 메커니즘 덕분에 상위 앱은 네트워크 변경을 감지하지 못한다.
