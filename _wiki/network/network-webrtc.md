---
layout  : wiki
title   : WebRTC; Web Real-Time Communication
summary : NAT Traversal and Real-Time Communication
date    : 2025-12-15 15:54:32 +0900
updated : 2025-12-15 20:15:24 +0900
tag     : network sdv sdp udp nat
toc     : true
comment : true
public  : true
parent  : [[/network]]
latex   : true
favorite: true
---
* TOC
{:toc}

## WebRTC

***[WebRTC(Web Real-Time Communication)](https://webrtcforthecurious.com/ko/docs/01-what-why-and-how/)*** 는 두 에이전트(agent, 웹 브라우저나 앱)간 서로 직접 오디오, 비디오, 데이터를 주고받을 수 있게 해주는 오픈소스 기술로, P2P(Peer-to-Peer) 방식으로 실시간 통신을 지원하여 화상 통화, 채팅, 파일 공유 등 다양한 실시간 웹 애플리케이션을 구축하는 데 사용된다.

WebRTC 를 본격적으로 배우기 전에, Media Streaming 은 기본적으로 ***[UDP(User Datagram Protocol)](https://en.wikipedia.org/wiki/User_Datagram_Protocol)*** 를 사용하기 때문에,
UDP 의 특징에 대해서 배울 필요가 있다.

## UDP

UDP(User Datagram Protocol) 는 TCP 와 상당히 다른 특징을 가지고 있다. ***[TCP 는 순서 보장 및 재전송 매커니즘을 통한 데이터 전송 보장을 지원](https://klarciel.net/wiki/network/network-socket-protocol/)*** 한다. 
즉, ***UDP 애플리케이션 대부분은 신뢰성 확보 메커니즘을 사용하지 않는다.*** 따라서, 손실된 데이터의 재전송 매커니즘이 필요 없는, Media Streaming, 실시간 멀티플레이어 게임, VoIP 등에서 UDP 를 사용한다.

***Datagram*** 이란 전송 네트워크 계층에서 보장하는 신뢰 기반의 데이터 교환에 의존하지 않고, ***충분한 양의 정보를 발신지에서 목적지까지 스스로 운반할 수 있는 독립적인 데이터 개체***를 의미한다.

패킷(packet)이 일반적인 데이터 덩어리를 지칭한다면, 데이터그램(datagram)은 데이터를 전송하는 방식이 불안정하고 전송 실패에 대한 알림(notification)도 없는, 즉 신뢰할 수 없는 서비스를 통해 전달되는 패킷을 의미한다.

UDP 에서 U 를 User 대신 ***Unreliable(신뢰할 수 없는)*** 으로 바꿔 해석하기도 한다.
UDP 는 비연결형 프로토콜이며, 종단 간 전용 연결을 설정하지 않는다. 즉, 수신자의 상태를 확인하지 않고 송신자에서 목적지로 정보를 단방향 전송함으로써 이루어진다.

UDP 는 ***Null Protocol Service*** 라고도 한다. 먼저 IP 계층을 이해해야하느데, IP 계층의 주된 임무는 ***발신지와 수신지의 주소를 기반으로 데이터그램을 운반하는 것***이다.
다시 말해 '데이터그램'이라는 명칭을 사용하는 이유는 IP 계층이 메시지를 안전하게 전달하지도 않고, 메시지가 전송에 실패하더라도 이를 통지 하지 않기 때문이다. 즉, 위 계층에게 그대로 ***네트워크의 불확실성***을 드러내는 것이다.
따라서 라우팅 노드가 혼잡하거나 다른 이유에 의해서 IP 패킷이 누락되는 경우 IP 계층보다 위 계층에 있는 프로토콜이 이를 탐지해 누락된 패킷을 복구하고 데이터를 재전송해야만 한다.

![](/resource/wiki/network-webrtc/udp-header.png)

발신지 포트와 체크섬은 optional 이다. 체크섬(checksum)을 생략하면 모든 에러 탐지와 에러 복구가 그 위 계층에서 이뤄진다는 뜻이다. 

정리하면 ***UDP 는 상태를 유지하지 않으며(stateless), UDP 가 하는 일은 IP 위 계층에서 통신 호스트의 발신, 수신 애플리케이션 포트를 내장하여 '애플리케이션 다중 처리(multiplexing)'에 이용하는 것*** 뿐이다.

- 메시지를 무사히 운반할 수 있다는 보장이 없음 (통보(Ack), 재전송, 타임아웃 없음)
- 메시지를 순서대로 운반할 수 없음 (패킷 시퀀스 넘버, 재정렬, HOL Blocking 없음)
- 커넥션 상태 트래킹 없음 (커넥션 성립 혹은 종료 매커니즘 없음)
- 혼잡 제어 (내장된 클라이언트나 네트워크 피드백 매커니즘 없음)
- 멀티캐스트 – 멀티캐스트 작동 모드가 지원되어 단일 데이터그램 패킷이 중복 없이 자동으로 가입자 그룹으로 라우팅될 수 있다.

### Network Address Translator

***[NAT(Network Address Translator)](https://klarciel.net/wiki/network/network-nat/)*** 는 IPv4 자원을 절약하고, 보안을 강화하기 위해서 만들어졌으며
인터넷 인프라에 필수적인 부분으로 자리잡았다.

UDP 에서 NAT 변환 작업을 할 때 가장 큰 문제는 데이터 운반을 위해 라우팅 테이블을 관리해야한다는 사실이다. ***기본적으로 NAT 미들장비는 커넥션 상태에 따라 작동한다.***
UDP 는 커넥션 상태 정보가 없으므로 참조할 수 있는 것이 없다. 반면 TCP 는 커넥션을 맺기 때문에 각 미들 장비는 커넥션 상태를 모니터링해가며 필요한 경우
라우팅 엔트리를 만들거나 없앨 수 있다. UDP 는 이러한 핸드셰이크나 커넥션 종료 절차가 없으므로 커넥션 상태 기계를 모니터링할 필요가 없다.

UDP 는 커넥션 종료 시퀀스가 없어서 피어가 통보 없이 언제든 데이터그램 전송을 멈출 수 있다. 그래서 UDP 라우팅 레코드를 일정 시간이 지나면 자동으로 폐기하는 방법을 사용한다.
결국 UDP 에서 장기 세션을 유지하는 가장 좋은 방법은 ***bidrectional keepalive packet*** 을 도입하여 정기적으로 모든 NAT 기기의 변환 레코드 타이머를 리셋하는 것이다.

실제로 많은 NAT 기기가 TCP, UDP 세션 모두에 비슷한 타임아웃 로직을 적용하고 있다. 결과적으로 TCP 도 ***bidrectional keepalive packet*** 이 필요한 경우가 생기는 것이다.
만약, TCP 커넥션이 아무 이유 없이 끊긴다면 미들 장비의 NAT 타임아웃일 확률이 높다.

#### NAT Traversal

VoIP, 게임, 파일 공유 등 P2P 애플리케이션은 서버와 클라이언트 역할을 모두 수행해야만 양방향 커뮤니케이션이 가능하다. 그리고 이러한 애플리케이션은 인바운드 커넥션을 다뤄야 하기 때문에 NAT 를 사용하는 경우 UDP, NAT 충돌 문제가 있다.

***UDP 기반 P2P 애플리케이션에서 NAT 는 외부에서 들어오는 패킷의 출처를 검증할 수 없기 때문에, 명시적인 사전 outbound 트래픽 없이는 인바운드 통신을 허용하지 않는다.***
즉, ***"내부에서 먼저 요청(Outbound)을 보내면, 그 응답(Inbound)만 허용한다"*** 는 철학을 가지고 있다.

**Unsolicited Inbound Traffic Drop**:
- 상황: Peer A(외부)가 Peer B(NAT 뒤 내부)에게 게임 데이터를 보내려 하는 경우
- NAT 의 동작: Peer B가 먼저 Peer A에게 패킷을 보낸 적이 없다면, NAT 라우터는 Peer A의 패킷을 **"요청하지 않은 외부 트래픽(Unsolicited Traffic)"** 으로 간주하여 즉시 **폐기(Drop)** 한다.

**"Mapping Behavior" Conflict (Symmetric NAT 문제)**:
- Happy Case: 내부(192.168.0.5:5000)가 Google STUN 서버로 갈 때 211.x.x.x:45000을 할당했다면, 내부가 Peer A에게 갈 때도 똑같이 211.x.x.x:45000을 사용한다. 따라서 STUN 서버를 통해 알아낸 내 주소를 Peer A에게 알려주면 통신이 된다.
- Symmetric NAT 문제
  - 목적지(Destination)가 달라지면, 외부 매핑 포트도 무작위로 바꿔버린다.
  - STUN 서버에게는 Port 45000으로 보였지만, Peer A에게 보낼 때는 Port 51234로 바뀐다.
  - 결과: STUN 을 통해 알아낸 주소가 무용지물이 됩니다. 이것이 NAT Traversal 실패의 주원인이다.

### STUN

***[STUN(Session Traversal Utilities for NAT)](https://datatracker.ietf.org/doc/html/rfc5389)*** 은 호스트 애플리케이션이 네트워크상의 NAT 기기를 발견하고 현재의 커넥션에 지정된 공용 IP 와 포트를 알아낼 수 있게하는 프로토콜이다.

![](/resource/wiki/network-webrtc/stun.png)

***[STUN](https://en.wikipedia.org/wiki/STUN)*** 서버는 서버 관점에서 클라이언트의 IP 주소 와 포트 번호를 포함하는 성공 응답을 보낸다. STUN 메시지는 UDP 패킷으로 전송된다. STUN 요청의 재전송을 애플리케이션에서 제어하여 신뢰성을 확보한다. STUN 서버는 응답에 대한 신뢰성 메커니즘을 구현하지 않는다.

__Flow__:
- [Internal] 클라이언트(Private IP)가 STUN 서버로 패킷 전송
- [NAT] 패킷을 가로채서 헤더를 변조하고 매핑 테이블에 기록(Record)
- [External] 변조된 패킷이 인터넷으로 나감
- [Response] STUN 서버가 응답하면, NAT 는 기록된 테이블을 보고 내부로 전달

예제를 보자.

- Client (Internal): 192.168.1.5:5000
- NAT (Public): 211.45.10.2
- STUN Server: 8.8.8.8:3478

클라이언트가 소켓을 열고 STUN 서버로 UDP 패킷을 날린다.
- Src: 192.168.1.5:5000
- Dst: 8.8.8.8:3478

NAT 라우터는 이 패킷을 받고 자신의 NAT Table 을 조회한다. 192.168.1.5:5000에 대한 매핑 정보가 없음을 확인한다. NAT는 이 통신을 위해 자신의 공인 포트 중 하나(예: 45000)를 임의로 할당합니다. 그리고 메모리에 새로운 행(Row)을 쓴다.

```
Protocol Internal Addr (Inside Local), External Addr (Inside Global), Destination (Remote)
UDP      192.168.1.5:5000,             211.45.10.2:45000,             8.8.8.8:3478
```

NAT는 기록을 마친 후, 실제 패킷의 Source Header 를 바꿔치기(Masquerading)하여 인터넷으로 보낸다.

- 변경 전 Src: 192.168.1.5:5000
- 변경 후 Src: 211.45.10.2:45000 (이제 STUN 서버는 이 주소를 보게 된다.)

STUN 서버는 요청 패킷의 Source 인 211.45.10.2:45000으로 응답을 보낸다.

NAT 에 패킷이 도착하면:
- Lookup: 도착한 패킷의 Destination Port(45000)를 보고 테이블을 검색한다.
- Match: 위에서 작성한 테이블과 일치함을 확인한다.
- DNAT: 패킷의 Destination을 192.168.1.5:5000으로 원복시켜 내부로 던져준다.
- Timer Refresh: 해당 테이블 항목의 TTL(Time To Live) 타이머를 초기화합니다. (예: 60초 → 다시 60초로 리셋)

따라서, Outbound Packet 을 보낸 Peer 는 자신의 공인 IP 와 포트를 알게 되어, 추후에 다른 피어와 통신할 때 자신의 IP 와 포트를 전달할 수 있다.

STUN 을 활용하면 다음과 같은 문제가 해결된다.

- 애플리케이션이 자신의 공용 IP 와 포트 값을 얻게 되고, 피어와 통신할 때 이 값을 사용할 수 있다. 즉, 상대에게 줄 수 있는 유효한 주소를 확보 가능하다.
- STUN 서버에게 아웃바운드 바인딩 요청을 보낼 때 NAT 테이블에 라우팅 값이 입력되므로, 인바운드 패킷은 그에 해당하는 공용 IP 와 포트 값을 NAT 테이블에서 찾아 내부 네트워크에 있는 호스트 애플리케이션에 무사히 도착할 수 있다.
- STUN 프로토콜이 keep-alive ping 역할을 해서 NAT 라우팅 값이 만기되는 것을 막는다. 즉, 주기적으로 STUN Binding Request 전송 하여 NAT 테이블을 갱신한다. (NAT mapping refresh)

UDP 가 방화벽이나 다른 네트워크 기기에 의해 아예 막혀 버리는 경우 STUN 이 실패할 수 있다. 따라서 STUN 이 실패할 때 TURN(Traversal Using Relays around NAT) 프로토콜이 대비책으로 사용되곤 한다.

### Signaling Server

STUN 은 "나의 주소"를 나에게 알려줄 뿐, "상대의 주소"를 알려주지는 않는다. 그렇다면 "내가 STUN을 통해 알아낸 나의 공인 IP:Port"를 도대체 어떻게 상대방에게 전달할 수 있을까 ?
이때 사용되는 것이 ***Signaling Server*** 이다.

WebRTC 의 경우 ***[SDP(Session Description Protocol)](https://datatracker.ietf.org/doc/html/rfc8866)*** 라는 프로토콜을 사용하여
두 피어가 통신 가능하도록 만드는 시그널링을 진행한다. 보통 WebSocket 으로 주고받지만, 필수는 아니다.

WebRTC 에이전트를 생성했을 때, 상대 피어에 대해 아는 것은 없습니다. 누구와 연결할지, 무엇을 보낼지 전혀 모릅니다! 시그널링은 통화를 가능하게 만드는 초기 부트스트랩 단계입니다. 이 값들을 교환한 뒤에는 WebRTC 에이전트끼리 직접 통신할 수 있습니다.

#### Session Description Protocol

멀티미디어 화상 회의, VoIP 통화, 스트리밍 비디오 등 세션을 시작할 때 미디어 세부 정보, 전송 주소, 기타 세션 설명 메타데이터를 참가자에게 전달해야 한다.
***[SDP(Session Description Protocol)](https://datatracker.ietf.org/doc/html/rfc8866)*** 는 이런 정보에 대한 표준이다. 순수한 세션 설명 형식이며 전송 ***[protocols](https://klarciel.net/wiki/network/network-socket-protocol/)*** 을 포함하지 않는다.
즉, SDP 는 세션 설명(Session Description)은 0개 이상의 미디어 설명(Media Description)을 포함한다.

WebRTC 의 경우에는 여러 SDP 의 키 중 아래 값들을 주로 사용한다.

```
v - 버전, 항상 0이어야 합니다.
o - 오리진, 재협상 시 유용한 고유 ID를 담습니다.
s - 세션 이름, - 여야 합니다.
t - 타이밍, 0 0 여야 합니다.
m - 미디어 설명(m=<media> <port> <proto> <fmt> ...), 아래에서 자세히 설명합니다.
a - 속성(Attribute), 자유 텍스트 필드. WebRTC에서 가장 흔한 줄입니다.
c - 연결 정보, IN IP4 0.0.0.0이어야 합니다.
```

__WebRTC 주요 SDP 속성 및 설명__:

| 속성 (Attribute) | 설명 (Description) |
| :--- | :--- |
| **group:BUNDLE** | 여러 종류의 미디어 트래픽(Audio, Video, Data 등)을 **하나의 네트워크 연결(Connection)**로 다루는 방식입니다. 리소스 효율성을 위해 권장되는 방식입니다. |
| **fingerprint:sha-256** | DTLS 핸드셰이크에 사용되는 **인증서의 해시값**입니다. 연결 수립 후, 실제 상대방의 인증서와 이 값을 대조하여 예상된 피어(Peer)인지 검증하는 보안 역할을 합니다. |
| **setup** | ICE 연결 후 **DTLS 에이전트의 역할(Client/Server)**을 결정합니다.<br>• `active`: DTLS 클라이언트로 동작<br>• `passive`: DTLS 서버로 동작<br>• `actpass`: 상대방이 역할을 선택하도록 위임 (주로 Offer에서 사용) |
| **mid** | **Media ID**. 세션 설명(SDP) 내에서 각 미디어 스트림(섹션)을 고유하게 식별하기 위한 값입니다. |
| **ice-ufrag** | **ICE User Fragment**. ICE 연결 과정에서 STUN 패킷 등의 트래픽을 인증할 때 사용하는 사용자 식별자입니다. |
| **ice-pwd** | **ICE Password**. `ice-ufrag`와 함께 ICE 트래픽을 인증하는 데 사용되는 비밀번호입니다. |
| **rtpmap** | **RTP Map**. 동적으로 할당되는 **RTP Payload Type 번호와 특정 코덱(이름/클럭 속도)을 매핑**합니다.<br>*(예: `a=rtpmap:96 VP8/90000`)* |
| **fmtp** | **Format Parameter**. 특정 Payload Type에 대한 **추가적인 설정값**을 정의합니다. 비디오 프로파일 레벨이나 인코더 관련 세부 설정을 전달할 때 사용됩니다. |
| **candidate** | **ICE 후보군**. WebRTC 에이전트가 통신에 사용할 수 있는 물리적 주소(IP:Port)와 프로토콜, 유형(Host/Srflx/Relay) 정보를 나타냅니다. |
| **ssrc** | **Synchronization Source**. RTP 패킷 스트림의 고유 식별자입니다. 하나의 미디어 트랙을 정의합니다.<br>• `label`: 개별 스트림의 ID<br>• `mslabel`: 여러 스트림을 그룹화하는 컨테이너 ID |

__WebRTC 클라이언트가 생성한 SDP__:

```
v=0
o=- 3546004397921447048 1596742744 IN IP4 0.0.0.0
s=-
t=0 0
a=fingerprint:sha-256 0F:74:31:25:CB:A2:13:EC:28:6F:6D:2C:61:FF:5D:C2:BC:B9:DB:3D:98:14:8D:1A:BB:EA:33:0C:A4:60:A8:8E
a=group:BUNDLE 0 1
m=audio 9 UDP/TLS/RTP/SAVPF 111
c=IN IP4 0.0.0.0
a=setup:active
a=mid:0
a=ice-ufrag:CsxzEWmoKpJyscFj
a=ice-pwd:mktpbhgREmjEwUFSIJyPINPUhgDqJlSd
a=rtcp-mux
a=rtcp-rsize
a=rtpmap:111 opus/48000/2
a=fmtp:111 minptime=10;useinbandfec=1
a=ssrc:350842737 cname:yvKPspsHcYcwGFTw
a=ssrc:350842737 msid:yvKPspsHcYcwGFTw DfQnKjQQuwceLFdV
a=ssrc:350842737 msid:yvKPspsHcYcwGFTw DfQnKjQQuwceLFdV
a=ssrc:350842737 mslabel:yvKPspsHcYcwGFTw
a=ssrc:350842737 label:DfQnKjQQuwceLFdV
a=msid:yvKPspsHcYcwGFTw DfQnKjQQuwceLFdV
a=sendrecv
a=candidate:foundation 1 udp 2130706431 192.168.1.1 53165 typ host generation 0
a=candidate:foundation 2 udp 2130706431 192.168.1.1 53165 typ host generation 0
a=candidate:foundation 1 udp 1694498815 1.2.3.4 57336 typ srflx raddr 0.0.0.0 rport 57336 generation 0
a=candidate:foundation 2 udp 1694498815 1.2.3.4 57336 typ srflx raddr 0.0.0.0 rport 57336 generation 0
a=end-of-candidates
m=video 9 UDP/TLS/RTP/SAVPF 96
c=IN IP4 0.0.0.0
a=setup:active
a=mid:1
a=ice-ufrag:CsxzEWmoKpJyscFj
a=ice-pwd:mktpbhgREmjEwUFSIJyPINPUhgDqJlSd
a=rtcp-mux
a=rtcp-rsize
a=rtpmap:96 VP8/90000
a=ssrc:2180035812 cname:XHbOTNRFnLtesHwJ
a=ssrc:2180035812 msid:XHbOTNRFnLtesHwJ JgtwEhBWNEiOnhuW
a=ssrc:2180035812 mslabel:XHbOTNRFnLtesHwJ
a=ssrc:2180035812 label:JgtwEhBWNEiOnhuW
a=msid:XHbOTNRFnLtesHwJ JgtwEhBWNEiOnhuW
a=sendrecv
```

이 메시지로부터 알 수 있는 점은 다음과 같다.

- 오디오와 비디오, 두 개의 미디어 섹션이 있음
- 둘 다 sendrecv 트랜시버이며, 두 스트림을 받고, 두 스트림을 보낼 수 있음
- ICE 후보와 인증 세부 정보가 있어 연결을 시도할 수 있음
- 인증서 지문이 있어 안전한 통화를 설정할 수 있음

### TURN

***[TURN(Traversal Using Relays around NAT)](https://datatracker.ietf.org/doc/html/rfc5766)*** 프로토콜은 모든 것이 실패했을 때 UDP 를 버리고 TCP 로 전환하는 기능을 한다.
TURN 프로토콜은 피어 간에 데이터를 왕복 운반하는 공용 중계(public relays)를 이용한다.

![](/resource/wiki/network-webrtc/turn.png)

- 양쪽 클라이언트 모두 같은 TURN 서버에 할당 요청을 보내 커넥션을 시작한 후 권한 협상(permission negotiation)을 수행한다.
- 협상이 완료되면 양쪽 피어가 TURN 서버에게 데이터를 보내고, TURN 서버가 그 데이터를 다른 피어에게 중계해 줌으로써 서로 통신할 수 있게 된다.

즉, TURN 을 활용하게 되면 더이상 P2P 가 아니게 된다.

### ICE

***[ICE(Interactive Connectivity Establishment)](https://datatracker.ietf.org/doc/html/rfc5245)*** 는 네트워크 참여자 간에 가장 효율적인
터널을 찾을 수 있는 프로토콜이다. ICE 를 이용하면 직접 연결이 가능한 곳에는 직접 연결을 수행하고, 직접 연결이 어려운 경우에는 STUN 을 활용하고, 다른 모든 옵션이 실패했을 때는 TURN 을 활용한다.

![](/resource/wiki/network-webrtc/ice.png)

__ICE Candidate Gathering Process__:

이 다이어그램은 애플리케이션이 NAT 를 거쳐 STUN/TURN 서버와 통신하고, 확보된 주소(Candidate)를 **상대방(Peer)** 에게 시그널링하는 전체 과정을 설명한다.

![](/resource/wiki/network-webrtc/ice-candidate.png)

```
sequenceDiagram
    autonumber
    
    box "Internal Network" #e1f5fe
        participant App as 💻 WebRTC App<br/>(Client)
        participant NAT as 🧱 NAT Device<br/>(Router/CGNAT)
    end

    box "Public Internet" #fff3e0
        participant STUN as 🌍 STUN Server
        participant TURN as 🔄 TURN Server
        participant Peer as 👤 Other Party<br/>(via Signaling)
    end

    %% Phase 1: Host Candidates (Local)
    Note over App, Peer: 🏠 Phase 1: Host Candidate (사설 IP 수집)
    
    App->>App: 1. 내 장치의 NIC 스캔<br/>(192.168.x.x, 10.x.x.x)
    App-->>Peer: [Signal] Host Candidate 전송<br/>(즉시 전송: Trickle ICE)
    Note right of App: 같은 공유기 내 연결은<br/>여기서 성공!

    %% Phase 2: Server Reflexive Candidates (STUN)
    Note over App, Peer: 🌏 Phase 2: Srflx Candidate (공인 IP 확인)
    
    App->>NAT: 2. Binding Request (UDP)
    Note right of NAT: 📝 NAT Table 생성<br/>(Internal -> External Port 매핑)
    NAT->>STUN: Forward Request<br/>(Src가 공인 IP로 변경됨)
    
    STUN-->>NAT: 3. Binding Success (XOR-MAPPED-ADDRESS)<br/>Payload에 공인 IP:Port 담음
    NAT-->>App: Forward Response
    
    App-->>Peer: [Signal] Srflx Candidate 전송<br/>(P2P 연결의 핵심 정보)

    %% Phase 3: Relay Candidates (TURN)
    Note over App, Peer: 🔄 Phase 3: Relay Candidate (중계 서버 할당)
    
    App->>NAT: 4. Allocate Request (UDP/TCP)
    NAT->>TURN: Forward Request
    
    TURN->>TURN: 5. Relay Port 할당<br/>(공인 IP:RelayPort 확보)
    TURN-->>NAT: Allocate Success (Relayed Address)
    NAT-->>App: Forward Response
    
    App-->>Peer: [Signal] Relay Candidate 전송<br/>(최후의 수단: 보험)

    Note over App, Peer: ✅ 모든 후보 수집 완료 (End of Gathering)
```

## Links

- [호기심 많은 이를 위한 WebRTC](https://webrtcforthecurious.com/ko/docs/01-what-why-and-how/)
- [ICE 의 이해](https://brunch.co.kr/@linecard/156)

## References

- HIGH PERFORMANCE BROWSER NETWORKING / O'REILLY / Ilya Grigorik
