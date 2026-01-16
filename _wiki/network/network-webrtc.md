---
layout  : wiki
title   : WebRTC; Web Real-Time Communication
summary : NAT Traversal and Real-Time Communication
date    : 2025-12-15 15:54:32 +0900
updated : 2025-12-15 20:15:24 +0900
tag     : network sdv sdp udp nat webrtc dtls
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

WebRTC는 복잡해 보이지만, 본질적으로는 ***"경로 탐색(ICE) + 보안(DTLS) + 실시간 미디어(SRTP)"의 조합*** 이다.

## WebRTC가 해결해야 할 문제들

WebRTC를 이해하려면 먼저 P2P 통신이 왜 어려운지 알아야 한다.

### 문제 1: 서로를 어떻게 찾을까?

두 브라우저가 서로 직접 연결하려면 상대방의 IP 주소와 포트를 알아야 한다. 하지만 브라우저는 시작할 때 상대방에 대해 아무것도 모른다. 이를 위해 ***Signaling*** 과정이 필요하다.

### 문제 2: NAT/방화벽을 어떻게 통과할까?

대부분의 사용자는 공유기(NAT) 뒤에 있어서 직접 연결이 불가능하다. 예를 들어:
- 사용자 A: 192.168.0.10 (내부 IP)
- 사용자 B: 192.168.1.5 (내부 IP)

이 두 내부 IP로는 서로 통신할 수 없다. 공인 IP와 포트를 알아내고(STUN), 그것도 안 되면 중계 서버(TURN)를 써야 한다.

### 문제 3: 안전하게 통신하려면?

인터넷을 통해 음성/영상을 주고받을 때 도청당하지 않으려면 암호화가 필수다. 하지만 UDP는 기본적으로 암호화를 제공하지 않는다. 이를 위해 ***DTLS/SRTP*** 가 필요하다.

## 필수 배경 지식: UDP와 NAT

WebRTC는 주로 UDP를 사용한다. 왜 TCP가 아니라 UDP일까?

### UDP: 빠르지만 불안정한 전송

***[UDP(User Datagram Protocol)](https://en.wikipedia.org/wiki/User_Datagram_Protocol)*** 는 TCP와 달리 다음 특징을 가진다:

- **순서 보장 없음**: 패킷이 보낸 순서대로 도착하지 않을 수 있음
- **전송 보장 없음**: 패킷이 유실되어도 재전송하지 않음
- **연결 상태 없음**: 연결 수립/종료 과정이 없음
- **빠른 전송**: 핸드셰이크와 재전송 오버헤드가 없어 지연 시간이 짧음

![](/resource/wiki/network-webrtc/udp-header.png)

***실시간 미디어(음성/영상)는 약간의 패킷 손실보다 빠른 전송이 중요하다.*** 화상 통화에서 1초 전의 데이터를 재전송받는 것보다, 약간 화질이 떨어지더라도 실시간으로 받는 게 낫다.

UDP는 ***"Unreliable(신뢰할 수 없는)"*** 또는 ***"Null Protocol Service"*** 라고도 불린다. IP 계층이 제공하는 최소한의 서비스(발신지/수신지 주소 기반 전달)에 포트 번호만 추가한 것이기 때문이다.

```
정리:
- UDP는 상태를 유지하지 않으며(stateless)
- UDP가 하는 일은 IP 위 계층에서 애플리케이션 포트를 내장하여
  '애플리케이션 다중 처리(multiplexing)'에 이용하는 것뿐
```

### NAT: 내부망과 외부망의 장벽

***[NAT(Network Address Translator)](https://klarciel.net/wiki/network/network-nat/)*** 는 IPv4 주소 부족과 보안 문제를 해결하기 위해 만들어졌다. 공유기가 대표적인 NAT 장비다.

NAT의 문제는 ***외부에서 내부로 들어오는 연결을 기본적으로 차단*** 한다는 것이다.

NAT의 철학은 다음과 같다.
- **"내부에서 먼저 요청(Outbound)을 보내면, 그 응답(Inbound)만 허용한다"**

**Unsolicited Inbound Traffic Drop**:
- 상황: Peer A(외부)가 Peer B(NAT 뒤 내부)에게 패킷을 보내려 하는 경우
- NAT의 동작: Peer B가 먼저 Peer A에게 패킷을 보낸 적이 없다면, NAT는 Peer A의 패킷을 **"요청하지 않은 외부 트래픽"** 으로 간주하여 **폐기(Drop)** 한다.

**Symmetric NAT 문제**:
- Happy Case: 내부(192.168.0.5:5000)가 Google STUN 서버로 갈 때 211.x.x.x:45000을 할당했다면, 내부가 Peer A에게 갈 때도 똑같이 211.x.x.x:45000을 사용한다.
- Symmetric NAT 문제: 목적지(Destination)가 달라지면 외부 매핑 포트도 무작위로 바뀐다. STUN 서버에게는 Port 45000으로 보였지만, Peer A에게 보낼 때는 Port 51234로 바뀐다. 이것이 NAT Traversal 실패의 주원인이다.

### UDP + NAT = 연결 유지 문제

UDP는 연결 종료 시퀀스가 없어서 NAT는 "이 연결이 끝났는지"를 알 수 없다. 그래서 일정 시간(보통 30-60초) 동안 트래픽이 없으면 NAT 테이블에서 해당 항목을 자동으로 삭제한다.

**해결책**: ***Bidirectional keepalive packet*** 을 주기적으로 보내 NAT 테이블을 갱신한다.

## WebRTC 연결 수립 과정: 4단계

WebRTC는 다음 4단계를 거쳐 연결을 수립한다:

```
Phase 1: Signaling    → "서로를 어떻게 찾을까?"
Phase 2: Connectivity → "어떤 경로로 연결할까?"
Phase 3: Security     → "어떻게 안전하게 통신할까?"
Phase 4: Media        → "실제 미디어를 전송하자"
```

### Phase 1: Signaling - 서로를 어떻게 찾을까?

#### Signaling Server

두 피어가 통신하려면 먼저 상대방의 정보를 교환해야 한다. 하지만 아직 직접 연결이 안 되므로, ***중간 서버(Signaling Server)*** 를 통해 정보를 교환한다.

![](/resource/wiki/network-webrtc/signalling-flow.png)

WebRTC 에이전트를 생성했을 때, 상대 피어에 대해 아는 것은 없다. 시그널링은 통화를 가능하게 만드는 초기 부트스트랩 단계다. 이 값들을 교환한 뒤에는 WebRTC 에이전트끼리 직접 통신할 수 있다.

Signaling Server는 주로 WebSocket을 사용하지만 필수는 아니다. HTTP Long Polling이나 다른 방법도 가능하다.

#### SDP: Session Description Protocol

교환할 정보의 형식이 ***[SDP(Session Description Protocol)](https://datatracker.ietf.org/doc/html/rfc8866)*** 다. SDP는 다음 정보를 담고 있다:

- 미디어 종류 (오디오/비디오)
- 코덱 정보 (Opus, VP8 등)
- ICE 후보 정보 (연결 가능한 IP:Port)
- 보안 정보 (DTLS fingerprint)

**WebRTC 주요 SDP 속성:**

| 속성 | 설명 |
| :--- | :--- |
| **group:BUNDLE** | 여러 미디어를 하나의 네트워크 연결로 다루는 방식 |
| **fingerprint:sha-256** | DTLS 인증서의 해시값 (상대방 검증용) |
| **setup** | DTLS 역할 (active/passive/actpass) |
| **mid** | Media ID (각 미디어 스트림 식별자) |
| **ice-ufrag** | ICE 인증용 사용자 식별자 |
| **ice-pwd** | ICE 인증용 비밀번호 |
| **rtpmap** | RTP Payload Type과 코덱 매핑 |
| **candidate** | ICE 후보군 (통신 가능한 IP:Port) |
| **ssrc** | RTP 스트림 고유 식별자 |

**WebRTC 클라이언트가 생성한 SDP 예시:**

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
a=rtpmap:111 opus/48000/2
a=candidate:foundation 1 udp 2130706431 192.168.1.1 53165 typ host
a=candidate:foundation 1 udp 1694498815 1.2.3.4 57336 typ srflx

m=video 9 UDP/TLS/RTP/SAVPF 96
c=IN IP4 0.0.0.0
a=setup:active
a=mid:1
a=rtpmap:96 VP8/90000
```

이 SDP로부터 알 수 있는 것:
- 오디오(Opus)와 비디오(VP8) 두 개의 미디어 섹션
- 둘 다 sendrecv (양방향 송수신 가능)
- ICE 후보와 인증 정보 포함
- DTLS fingerprint로 안전한 통화 설정 가능

### Phase 2: Connectivity - 어떤 경로로 연결할까?

SDP를 교환했지만 아직 실제로 패킷을 주고받을 수 없다. NAT 때문이다. 이제 ***실제로 연결 가능한 경로*** 를 찾아야 한다.

#### ICE: Interactive Connectivity Establishment

***[ICE(Interactive Connectivity Establishment)](https://datatracker.ietf.org/doc/html/rfc5245)*** 는 NAT/방화벽 환경에서 실제로 UDP 패킷이 왕복 가능한 네트워크 경로를 찾는 프로토콜이다.

![](/resource/wiki/network-webrtc/ice.png)

ICE의 전략은 간단하다: **"직접 패킷을 보내서 되는지 안 되는지 시험한다"**

각 Peer는 다음 후보들을 수집한다:

| 타입 | 의미 |
| ----- | --------------------- |
| Host | 로컬 IP (192.168.x.x 등) |
| Srflx | STUN으로 얻은 공인 IP |
| Relay | TURN 서버 주소 |

#### STUN: 나의 공인 IP를 알아내기

***[STUN(Session Traversal Utilities for NAT)](https://datatracker.ietf.org/doc/html/rfc5389)*** 은 호스트가 자신의 공용 IP와 포트를 알아내는 프로토콜이다.

![](/resource/wiki/network-webrtc/stun.png)

**STUN 동작 원리:**

1. **[Internal]** 클라이언트(192.168.1.5:5000)가 STUN 서버(8.8.8.8:3478)로 패킷 전송
2. **[NAT]** NAT가 패킷을 가로채서 헤더를 변조하고 매핑 테이블에 기록

```
Protocol | Internal Addr        | External Addr      | Destination
UDP      | 192.168.1.5:5000    | 211.45.10.2:45000  | 8.8.8.8:3478
```

3. **[NAT Masquerading]** 패킷의 Source를 211.45.10.2:45000으로 바꿔서 전송
4. **[Response]** STUN 서버가 "당신의 주소는 211.45.10.2:45000입니다"라고 응답
5. **[NAT Lookup]** NAT가 테이블을 보고 내부(192.168.1.5:5000)로 전달

**STUN이 해결하는 것:**
- 애플리케이션이 자신의 공용 IP와 포트를 알게 됨
- 상대에게 줄 수 있는 유효한 주소 확보
- NAT 테이블에 라우팅 값이 입력되어 인바운드 패킷 수신 가능
- Keep-alive ping으로 NAT 테이블 갱신

#### TURN: 모든 것이 실패했을 때

***[TURN(Traversal Using Relays around NAT)](https://datatracker.ietf.org/doc/html/rfc5766)*** 은 직접 연결이 불가능할 때 사용하는 중계 서버다.

![](/resource/wiki/network-webrtc/turn.png)

**TURN 동작 방식:**
1. 양쪽 클라이언트 모두 TURN 서버에 할당 요청 및 권한 협상
2. 양쪽 피어가 TURN 서버에게 데이터를 보냄
3. TURN 서버가 다른 피어에게 중계

TURN을 사용하면 더 이상 P2P가 아니게 된다. 따라서 비용이 많이 들고 지연이 증가한다.

#### ICE Connectivity Check

ICE는 수집한 모든 후보 조합을 시험한다:

```
Candidate A:
- 192.168.0.10:53421 (Host)
- 13.124.xxx.xxx:62001 (Srflx)
- turn.example.com:3478 (Relay)
```

**시험 순서 (우선순위):**
1. Host ↔ Host (가장 빠름)
2. Srflx ↔ Srflx (STUN)
3. Host ↔ Srflx
4. Relay ↔ Anything (TURN, 최후 수단)

```
A (Srflx)  --->  B (Srflx)   ❌ (NAT 차단)
A (Relay)  --->  B (Relay)   ✅
```

**성공한 Candidate Pair가 선택되면 이후 이 경로로 통신한다.**

### Phase 3: Security - 어떻게 안전하게 통신할까?

연결 경로를 찾았지만 아직 암호화되지 않았다. 인터넷에 음성/영상을 암호화 없이 보낼 수는 없다.

#### DTLS: UDP를 위한 TLS

***[DTLS(Datagram Transport Layer Security)](https://ko.wikipedia.org/wiki/%EB%8D%B0%EC%9D%B4%ED%84%B0%EA%B7%B8%EB%9E%A8_%EC%A0%84%EC%86%A1_%EA%B3%84%EC%B8%B5_%EB%B3%B4%EC%95%88)*** 는 한마디로 ***"UDP 위에서 동작하도록 개조된 TLS"*** 다.

**왜 TLS를 그대로 쓸 수 없나?**

TLS는 하위 계층(TCP)이 다음을 보장한다고 믿는다:
- **Reliability**: 패킷은 절대 유실되지 않는다
- **Ordering**: 패킷은 보낸 순서대로 도착한다

하지만 UDP는 둘 다 보장하지 않는다. 따라서 DTLS는:
- TLS의 보안성은 유지하면서
- 자체적인 재전송 및 순서 제어 기능을 탑재

**DTLS 동작 시점:**

```
ICE 성공 (경로 확보)
→ DTLS Handshake (암호화 터널 수립)
→ SRTP Key 생성 (미디어 암호화 키)
```

**DTLS의 역할:**
- 미디어(SRTP)와 데이터(SCTP) 보호
- DataChannel(파일 전송, 채팅)은 SCTP 패킷이 DTLS 안에 캡슐화되어 전송

### Phase 4: Media - 실제 미디어를 전송하자

이제 안전한 경로가 확보되었다. 실제 음성/영상을 보낼 차례다.

#### SRTP: Secure RTP

***SRTP*** 는 실제 음성, 영상 데이터를 암호화해서 전송한다. RTP 패킷을 암호화하고 무결성을 보호한다.

**SRTP Key는 DTLS Handshake 결과로 생성된다.**

## 전체 플로우 요약

WebRTC 연결 수립의 전체 과정을 정리하면:

```
1. [Signaling] SDP 교환 via Signaling Server
   - "내가 할 수 있는 것: Opus 오디오, VP8 비디오"
   - "내가 시도할 수 있는 주소: 192.168.1.5, 211.45.10.2:45000"

2. [ICE] 실제 연결 가능한 경로 찾기
   - STUN: "내 공인 주소는 211.45.10.2:45000이구나"
   - ICE Connectivity Check: Host → Srflx → Relay 순서로 시험
   - 성공: "Srflx ↔ Srflx 경로로 연결됨"

3. [DTLS] 암호화 터널 수립
   - TLS Handshake (UDP 버전)
   - 상대방 인증서 검증 (SDP의 fingerprint와 비교)
   - SRTP Key 생성

4. [SRTP] 미디어 전송 시작
   - 암호화된 음성/영상 패킷 전송
   - DataChannel은 DTLS 안의 SCTP로 전송
```

**각 단계의 핵심 질문:**
- ICE → "이 길로 패킷이 실제로 가나?"
- DTLS → "이 길이 안전한가?"
- SRTP → "그럼 이제 암호화해서 미디어 보내자"

## Links

- [호기심 많은 이를 위한 WebRTC](https://webrtcforthecurious.com/ko/docs/01-what-why-and-how/)
- [ICE의 이해](https://brunch.co.kr/@linecard/156)

## References

- HIGH PERFORMANCE BROWSER NETWORKING / O'REILLY / Ilya Grigorik