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

***[VPN(Virtual Private Network)](https://en.wikipedia.org/wiki/Virtual_private_network)*** 은 공용 인터넷 위에 '가상의 전용 네트워크 터널'을 만들어 마치 같은 사설망에 있는 것처럼 통신하게 해주는 기술이다.

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
표준 이더넷의 MTU(Maximum Transmission Unit)는 1500 바이트이다. 1570 바이트짜리 터널링 패킷은 지나갈 수 없다. 따라서 패킷을 강제로 두 개로 쪼개는
단편화(Fragmentation)을 처리하거나, 내부 패킷의 크기(MSS)를 줄여서 터널 헤더를 붙여도 1500 바이트를 넘지 않도록 조정해야 한다.

## VPN Protocol Comparison

VPN 을 구현하는 프로토콜은 여러 가지가 있다. 대표적인 세 가지 프로토콜인 ***IPsec***, ***OpenVPN***, ***WireGuard*** 의 아키텍처와 성능, 적합한 사용 시나리오를 비교해보자.

| 항목 | IPsec | OpenVPN | WireGuard |
|------|-------|---------|-----------|
| **Layer** | L3 (Network Layer) | L3/L4 (User Space) | L3 (Kernel Module) |
| **코드 규모** | ~400,000 lines (XFRM + ESP + IKE 등 전체 생태계) | ~70,000-100,000 lines | ~4,000 lines |
| **암호화 협상** | IKEv1/IKEv2 (다수 cipher suite 협상) | TLS/OpenSSL (다수 cipher 지원) | 고정 cipher suite (협상 없음) |
| **전송 프로토콜** | ESP(IP Protocol 50) / UDP 4500 | UDP 1194 또는 TCP 443 | UDP 51820 |
| **상태 관리** | SA(Security Association) 기반 | TLS session 기반 | Cryptokey Routing Table |
| **NAT Traversal** | NAT-T (UDP encapsulation) | 기본 지원 (UDP/TCP) | 기본 지원 (UDP) |
| **성능** | 중간 (커널이지만 복잡한 처리) | 낮음 (User Space + OpenSSL) | 높음 (커널 + 간결한 코드 경로) |
| **모바일 로밍** | MOBIKE 확장 필요 | 재연결 필요 | 내장 (Cryptokey Routing) |
| **감사 용이성** | 매우 어려움 (방대한 코드) | 어려움 | 용이함 (4,000줄) |

### IPsec

***[IPsec(Internet Protocol Security)](https://en.wikipedia.org/wiki/IPsec)*** 은 IETF 가 표준화한 L3 레벨 보안 프로토콜 모음이다. 두 가지 주요 프로토콜로 구성된다.

- ***AH(Authentication Header)***: 패킷의 무결성과 인증을 제공하지만 암호화는 하지 않는다.
- ***ESP(Encapsulating Security Payload)***: 암호화 + 무결성 + 인증을 모두 제공한다. 실무에서는 거의 항상 ESP 를 사용한다.

IPsec 은 두 가지 동작 모드를 가진다.

__Transport Mode__:
- IP 헤더는 그대로 두고, IP 페이로드(TCP/UDP 세그먼트)만 암호화한다.
- Host-to-Host 통신에 사용된다.

```
[Original IP Header][ESP Header][TCP/UDP + Data (encrypted)][ESP Trailer][ESP Auth]
```

__Tunnel Mode__:
- 원본 IP 패킷 전체를 암호화하고, 새로운 IP 헤더를 씌운다.
- Gateway-to-Gateway(Site-to-Site) VPN 에 주로 사용된다.

```
[New IP Header][ESP Header][Original IP Header + TCP/UDP + Data (encrypted)][ESP Trailer][ESP Auth]
```

IPsec 의 가장 큰 특징은 ***IKE(Internet Key Exchange)*** 프로토콜을 사용한 키 교환이다. IKEv2(RFC 7296)에서는 IKE_SA_INIT 과 IKE_AUTH 두 가지 교환(Exchange)으로 진행된다. (IKEv1 에서는 이를 Phase 1, Phase 2 라 불렀다.)

```
Initiator                              Responder
    |                                      |
    |--- IKE_SA_INIT (DH + nonce) -------->|  IKE SA 수립
    |<-- IKE_SA_INIT (DH + nonce) ---------|  (암호화된 채널 생성)
    |                                      |
    |--- IKE_AUTH (ID + Cert + SA) ------->|  Child SA 수립
    |<-- IKE_AUTH (ID + Cert + SA) --------|  (IPsec 터널 파라미터 협상)
    |                                      |
    |========= IPsec Tunnel ===============|
```

- ***IKE_SA_INIT***: Diffie-Hellman 키 교환으로 안전한 채널을 만든다. 이 채널은 이후 협상을 암호화하는 데 사용된다.
- ***IKE_AUTH***: IKE_SA_INIT 에서 만든 암호화 채널 위에서 실제 IPsec 터널의 암호 알고리즘, 키, 수명 등을 협상하고 첫 번째 Child SA 를 수립한다.

IPsec 의 장점은 표준화된 프로토콜이라 벤더 간 상호 운용성이 높다는 것이다. 단점은 복잡한 설정, 방대한 코드베이스로 인한 보안 감사의 어려움, 그리고 NAT 환경에서의 번거로운 처리(NAT-T)가 있다.

### OpenVPN

***[OpenVPN](https://en.wikipedia.org/wiki/OpenVPN)*** 은 User Space 에서 동작하는 SSL/TLS 기반 VPN 이다. tun/tap 디바이스를 사용하여 커널과 통신한다.

```
Application
    ↓
tun0 (Virtual Interface)
    ↓ (read from /dev/net/tun)
OpenVPN Process (User Space)
    ↓ Encrypt (OpenSSL)
    ↓ Encapsulate in UDP/TCP
UDP/TCP Socket
    ↓
Kernel Network Stack
    ↓
Physical NIC (eth0/wlan0)
```

OpenVPN 의 핵심 특징은 다음과 같다.

- **User Space 동작**: 커널 모듈이 아니라 일반 프로세스로 동작한다. 안정적이지만, User Space ↔ Kernel Space 간 컨텍스트 스위칭이 패킷마다 두 번(tun read + socket write) 발생하여 성능 오버헤드가 크다.
- **TLS 기반 인증**: X.509 인증서를 사용한 상호 인증(mTLS)을 기본 지원한다. OpenSSL 라이브러리에 의존하므로, OpenSSL 의 취약점이 곧 OpenVPN 의 취약점이 된다(e.g. Heartbleed).
- **TCP 지원**: TCP 443 포트로 터널링이 가능하여 방화벽 우회에 유리하다. 단, TCP over TCP 문제(***TCP Meltdown***)가 발생할 수 있다. 외부 TCP 의 재전송과 내부 TCP 의 재전송이 동시에 발동하면 성능이 급격히 저하된다.

### WireGuard

***[WireGuard](https://en.wikipedia.org/wiki/WireGuard)*** 는 Jason A. Donenfeld 가 설계한 차세대 VPN 프로토콜이다. 2020년 Linux 5.6 커널에 정식 편입되었다.

WireGuard 의 설계 철학은 ***"간결함이 곧 보안이다"*** 에 있다. 약 4,000 줄의 코드로 구현되어 있어 전체 코드에 대한 보안 감사가 현실적으로 가능하다.

#### Cryptokey Routing

WireGuard 의 가장 핵심적인 개념은 ***Cryptokey Routing*** 이다. 이것은 전통적인 라우팅 테이블과 암호화 키를 하나로 통합한 구조이다.

기존 VPN 에서는 "라우팅 → 패킷 선택 → 암호화" 가 별도의 단계로 동작한다. WireGuard 에서는 라우팅 테이블 자체가 공개키와 결합되어 있다.

```ini
Interface: wg0
  Private Key: <server private key>
  Listen Port: 51820

Peer: <peer A public key>
  Allowed IPs: 10.0.0.2/32, 192.168.1.0/24
  Endpoint: 203.0.113.1:51820

Peer: <peer B public key>
  Allowed IPs: 10.0.0.3/32, 10.10.0.0/16
  Endpoint: 198.51.100.5:51820
```

__Outbound (송신)__:
1. 애플리케이션이 10.0.0.2 로 패킷을 보낸다.
2. wg0 인터페이스가 패킷을 가로챈다.
3. Allowed IPs 테이블을 조회한다: 10.0.0.2/32 → Peer A
4. Peer A 와의 핸드셰이크에서 유도된 대칭 세션 키로 암호화한다.
5. Peer A 의 최신 Endpoint(203.0.113.1:51820)로 UDP 패킷을 전송한다.

__Inbound (수신)__:
1. UDP 패킷이 51820 포트에 도착한다.
2. 복호화를 시도한다. 성공하면 어떤 Peer 의 키인지 식별된다.
3. 복호화된 내부 패킷의 Source IP 가 해당 Peer 의 Allowed IPs 범위에 포함되는지 검증한다.
4. 검증 성공 시 패킷을 수용하고, 해당 Peer 의 Endpoint 를 패킷의 Source IP:Port 로 갱신한다.

4번 단계가 바로 ***Roaming*** 을 가능하게 하는 핵심이다. 별도의 핸드셰이크 없이, 유효한 암호화 패킷이 새로운 IP 에서 오면 자동으로 Endpoint 를 갱신한다.

```
[Peer A Endpoint Update - Roaming]

Before:  Peer A → Endpoint: 203.0.113.1:51820 (LTE)
         ↓ (handover)
After:   Peer A → Endpoint: 198.51.100.99:43210 (WiFi)

Trigger: 유효한 암호화 패킷이 새 주소에서 도착
```

<mark><em><strong>Cryptokey Routing 은 "누가 보냈는가(인증)"와 "어디로 보낼 것인가(라우팅)"를 하나의 테이블에서 해결하여, VPN 의 복잡도를 근본적으로 줄인다.</strong></em></mark>

#### WireGuard Packet Format

WireGuard 의 데이터 패킷 구조는 매우 단순하다.

```
[Ethernet Header (14B)]
  [IP Header (20B)]
    [UDP Header (8B)]
      [WireGuard Header (16B)]
        [Encrypted Inner Packet]
          [Original IP Header]
          [TCP/UDP Header]
          [Application Data]
        [Poly1305 Auth Tag (16B)]
```

WireGuard 의 프로토콜 고유 오버헤드는 헤더 16 바이트 + 인증 태그 16 바이트 = 총 32 바이트이다. IPsec ESP(헤더 8 + IV 8 + Trailer ~5 + ICV 16 = ~37 바이트)보다 간결하다.

| 필드 | 크기 | 설명 |
|------|------|------|
| Type | 1 byte | 메시지 유형 (1=Initiation, 2=Response, 3=Cookie, 4=Data) |
| Reserved | 3 bytes | 예약 필드 |
| Receiver Index | 4 bytes | 수신 측 Peer 식별자 |
| Counter | 8 bytes | Nonce (재전송 공격 방지) |

## Encryption and Key Exchange

VPN 의 보안은 암호화(Encryption)와 키 교환(Key Exchange) 메커니즘에 의해 결정된다. 프로토콜마다 사용하는 암호학적 기반이 다르다.

### IKE for IPsec

IPsec 은 ***[IKE(Internet Key Exchange)](https://en.wikipedia.org/wiki/Internet_Key_Exchange)*** 프로토콜을 사용하여 Security Association(SA)을 수립한다. IKEv2(RFC 7296)가 현재 표준이다.

IKE 의 핵심은 ***[Diffie-Hellman Key Exchange](https://en.wikipedia.org/wiki/Diffie%E2%80%93Hellman_key_exchange)*** 이다.

```
Alice                                   Bob
  |                                      |
  |  g^a mod p  -----------------------> |   Alice: 비밀값 a 선택, g^a mod p 전송
  |                                      |
  | <-----------------------  g^b mod p  |   Bob: 비밀값 b 선택, g^b mod p 전송
  |                                      |
  |  Shared Secret = (g^b)^a mod p       |   양쪽 모두 동일한 공유 비밀 계산
  |                = (g^a)^b mod p       |   = g^(ab) mod p
```

IKEv2 의 Cipher Suite 협상 과정은 다음과 같다.

1. Initiator 가 자신이 지원하는 암호 알고리즘 목록을 제안한다. (SA Proposal)
2. Responder 가 그 중 하나를 선택하여 응답한다.
3. 협상 대상:
   - 암호화 알고리즘 (AES-256-GCM, ChaCha20-Poly1305 등)
   - 무결성 알고리즘 (HMAC-SHA-256, HMAC-SHA-384 등)
   - PRF (Pseudo-Random Function)
   - DH Group (MODP-2048, ECP-256 등)

이 협상 메커니즘은 유연하지만, 동시에 공격 표면(attack surface)이 넓어진다. 약한 cipher 가 하나라도 포함되어 있으면 ***Downgrade Attack*** 의 위험이 존재한다.

### Noise Protocol Framework for WireGuard

WireGuard 는 ***[Noise Protocol Framework](http://www.noiseprotocol.org/)*** 의 ***Noise_IKpsk2*** 핸드셰이크 패턴을 사용한다. Noise 는 Trevor Perrin 이 설계한 암호화 핸드셰이크 프레임워크이다. 패턴 이름에서 "IK"는 Initiator 의 정적 키가 사전 공유(Known)됨을 의미하고, "psk2"는 두 번째 메시지에서 ***Pre-Shared Key(PSK)*** 를 혼합한다는 뜻이다. 이 PSK 는 선택적이며, 양자 컴퓨팅에 대비한 추가 보안 계층(Post-Quantum Resistance)을 제공한다.

WireGuard 가 사용하는 암호 프리미티브는 고정되어 있다.

| 기능 | 알고리즘 |
|------|----------|
| 대칭 암호화 | ChaCha20 |
| 메시지 인증 | Poly1305 |
| 키 교환 | Curve25519 (ECDH) |
| 해시 | BLAKE2s |
| 키 유도 | HKDF |

***협상이 없다*** 는 점이 IPsec/OpenVPN 과의 근본적인 차이이다. 알고리즘이 고정되어 있으므로 Downgrade Attack 이 원천적으로 불가능하다. 향후 특정 알고리즘에 취약점이 발견되면, 프로토콜 버전 자체를 올리는 방식으로 대응한다.

WireGuard 의 1-RTT 핸드셰이크 과정은 다음과 같다.

```
Initiator (i)                                  Responder (r)
  |                                              |
  |  Msg 1: Initiation                           |
  |  [ephemeral_i, static_i(encrypted),          |
  |   timestamp(encrypted)]                      |
  |  ─────────────────────────────────────────>   |
  |                                              |
  |  Msg 2: Response                             |
  |  [ephemeral_r, empty(encrypted)]             |
  |  <─────────────────────────────────────────   |
  |                                              |
  |  ========= Data Transport ================   |
  |  (ChaCha20-Poly1305 AEAD)                    |
```

이 핸드셰이크에서는 총 네 번의 Diffie-Hellman 연산이 수행된다.

1. `es`: DH(ephemeral_i, static_r) - Initiator 의 임시 키 ↔ Responder 의 정적 키
2. `ss`: DH(static_i, static_r) - 양측 정적 키
3. `ee`: DH(ephemeral_i, ephemeral_r) - 양측 임시 키
4. `se`: DH(static_i, ephemeral_r) - Initiator 의 정적 키 ↔ Responder 의 임시 키

이 네 가지 DH 결과를 HKDF 로 체이닝하여 최종 세션 키를 유도한다. ***Perfect Forward Secrecy(PFS)*** 가 보장되는 이유는 모든 세션에서 새로운 ephemeral key 를 생성하기 때문이다. 과거 세션의 정적 키가 유출되더라도, 이미 삭제된 임시 키 없이는 과거 트래픽을 복호화할 수 없다.

### Timer-based Key Rotation

WireGuard 는 보안 강화를 위해 시간 기반 키 갱신을 수행한다.

- 세션 키 생성 후 120초(`REKEY_AFTER_TIME`)가 경과하고, 데이터 전송이 발생하는 시점에 새로운 핸드셰이크를 시도하여 세션 키를 갱신한다. 트래픽이 없으면 갱신이 발생하지 않는다.
- 키 갱신은 데이터 전송과 독립적으로 백그라운드에서 수행된다.
- 세션 키 생성 후 180초(`REJECT_AFTER_TIME`)가 경과하면 해당 키로는 더 이상 패킷을 송수신하지 않는다. 이후 `REJECT_AFTER_TIME * 3` = 540초가 지나면 모든 ephemeral key 가 메모리에서 제거된다.

이 메커니즘은 ***"키가 탈취되더라도 최대 2-3분 이내의 데이터만 위험하다"*** 는 보안 속성을 제공한다.

## Split Tunneling

***[Split Tunneling](https://en.wikipedia.org/wiki/Split_tunneling)*** 은 VPN 트래픽과 일반 인터넷 트래픽을 분리하여 라우팅하는 기술이다.

### Full Tunnel vs Split Tunnel

__Full Tunnel__:
- 모든 트래픽이 VPN 터널을 통과한다.
- 라우팅: `0.0.0.0/0 → tun0` (default route 가 VPN 인터페이스)
- 장점: 모든 트래픽이 암호화되므로 보안성이 높다.
- 단점: VPN 서버에 부하 집중, YouTube/Netflix 같은 일반 트래픽까지 VPN 을 경유하여 대역폭 낭비와 지연 증가가 발생한다.

__Split Tunnel__:
- 특정 목적지만 VPN 터널을 사용하고, 나머지는 물리 인터페이스로 직접 나간다.
- 라우팅 예시:

```
# VPN 대역만 터널로
10.0.0.0/8     → tun0 (VPN)
172.16.0.0/12  → tun0 (VPN)

# 나머지는 직접 인터넷으로
0.0.0.0/0      → eth0 (Direct Internet)
```

### Routing Table Configuration

Split Tunneling 의 실체는 ***라우팅 테이블 조작*** 이다. VPN 클라이언트가 연결 시 OS 의 라우팅 테이블에 규칙을 추가한다.

```bash
# Full Tunnel: 모든 트래픽을 VPN 으로
ip route add 0.0.0.0/0 dev wg0

# Split Tunnel: 사내망만 VPN 으로
ip route add 10.0.0.0/8 dev wg0
ip route add 172.16.0.0/12 dev wg0

# 라우팅 테이블 확인
ip route show
```

WireGuard 에서는 Peer 의 `AllowedIPs` 설정이 곧 Split Tunneling 설정이다.

```ini
# Full Tunnel
[Peer]
AllowedIPs = 0.0.0.0/0, ::/0

# Split Tunnel (사내망만)
[Peer]
AllowedIPs = 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16
```

### Corporate Use Cases

기업 환경에서의 Split Tunneling 결정은 ***보안 정책과 사용자 경험의 트레이드오프*** 이다.

| 시나리오 | 권장 방식 | 이유 |
|----------|-----------|------|
| 금융권/군사 | Full Tunnel | 데이터 유출 방지, DLP(Data Loss Prevention) 정책 |
| 일반 기업 | Split Tunnel | 사내 리소스만 보호, VPN 서버 부하 절감 |
| 원격 개발자 | Split Tunnel | Git, CI/CD 는 VPN, 웹 브라우징은 직접 |
| 차량 텔레매틱스 | Split Tunnel | 제어 명령만 VPN, OTA 대용량 다운로드는 CDN 직접 |

Split Tunneling 사용 시 ***DNS Leak*** 에 주의해야 한다. VPN 터널을 타지 않는 트래픽의 DNS 쿼리가 ISP 의 DNS 서버를 통해 노출될 수 있다. 이를 방지하기 위해 VPN 연결 시 DNS 서버도 함께 변경하거나, DNS 트래픽만 별도로 터널링하는 설정이 필요하다.

## Network Handover: VPN as an Abstraction Layer that Survives Physical Disruptions

차량과 클라우드간 통신을 하는 과정을 생각해보자.

첫 번째 문제로 차량은 LTE 망을 통하면서 IP 가 계속 바뀌며, 클라우드 서버는 차량의 IP 를 알 수 없으므로 먼저 접속할 수 없다.
물리적인 IP 가 변경이 되는 문제를 해결하기 위해서는 IP 가 고정되어야 한다.
따라서, 차량에서 VPN 을 사용하여 OS Level 의 가상 인터페이스(tun0)가 생성되어  ***고정된 가상 IP (Virtual IP, e.g 10.8.0.5)*** 를 할당 받게 된다.

***VPN provides a stable virtual IP that masks physical IP changes in mobile networks.***

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
  - 복호화 및 서명 검증을 수행한다. "어? 이 패킷, 철수(User A)의 키로 서명됐네?"
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
  - ```c
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

VPN 을 사용하면 세션 식별이 IP 변경에 의존하지 않기 때문에, 기지국 핸드오버로 물리 IP가 바뀌어도 TCP 세션과 상위 애플리케이션 연결이 유지된다.
VPN은 물리 IP 변경으로 인한 즉시 TCP 세션 붕괴를 방지한다. 단, 네트워크 단절 시간이 TCP 재전송 타임아웃을 초과하면 세션은 종료될 수 있다.

### Sequence Diagram

![](/resource/wiki/network-vpn/vpn-flow.png)

### UDP

VPN 터널 자체는 TCP 가 아닌 UDP 로 맺는 것이 표준이다. UDP 는 연결 상태를 유지하지 않고 보내면 끝이다.
따라서 다음과 같은 효과를 낼 수 있다.

- 기지국이 바뀌는 1~2초 동안 물리적 연결이 끊기면, UDP 패킷은 그냥 유실(Drop)된다.
- 네트워크가 복구되어 다시 패킷을 보내면, 커널 레벨에서 TCP Syn/Ack 같은 재연결 과정 없이 바로 전송이 재개된다.
- 즉, **"터널은 끊어진 적이 없고, 잠시 패킷이 안 왔을 뿐"** 이라고 VPN 프로세스는 판단한다.

이러한 VPN 메커니즘 덕분에 상위 앱은 네트워크 변경을 감지하지 못한다.

## Performance Considerations

VPN 은 보안과 추상화를 제공하지만, 그 대가로 성능 오버헤드가 발생한다. 프로덕션 환경에서 VPN 을 운용할 때 고려해야 할 핵심 성능 요소들을 살펴보자.

### MTU and MSS Adjustment

VPN 터널링은 원본 패킷에 추가 헤더를 씌우므로, ***MTU(Maximum Transmission Unit)*** 를 적절히 조정하지 않으면 성능이 크게 저하된다.

각 VPN 프로토콜별 오버헤드는 다음과 같다.

| 프로토콜 | 오버헤드 (bytes) | 유효 MTU (1500 기준) | 유효 MSS (TCP) |
|----------|------------------|---------------------|----------------|
| IPsec (ESP, Tunnel, AES-GCM) | ~57 (New IP 20 + ESP 8 + IV 8 + Pad ~5 + ICV 16) | ~1443 | ~1403 |
| OpenVPN (UDP) | ~69 (IP 20 + UDP 8 + OpenVPN 41) | ~1431 | ~1391 |
| WireGuard | ~60 (IP 20 + UDP 8 + WG 32) | ~1440 | ~1400 |
| IPsec + NAT-T | ~65 (UDP encap 8 추가) | ~1435 | ~1395 |

MTU 가 제대로 설정되지 않으면, 두 가지 문제가 발생한다.

__Fragmentation (단편화)__:
- 터널 헤더를 추가한 패킷이 물리 MTU(1500)를 초과하면, IP 계층에서 패킷을 쪼갠다.
- 단편화된 패킷 중 하나라도 유실되면 전체 원본 패킷이 재전송되어야 한다.
- 단편화/재조립 과정 자체가 CPU 오버헤드를 유발한다.

__PMTUD Black Hole__:
- ***[Path MTU Discovery(PMTUD)](https://en.wikipedia.org/wiki/Path_MTU_Discovery)*** 는 DF(Don't Fragment) 비트를 설정하고 ICMP "Packet Too Big" 메시지를 기대하는 메커니즘이다.
- 그러나 많은 방화벽이 ICMP 를 차단하여, 발신자가 MTU 를 줄여야 한다는 사실을 알 수 없게 된다. 이를 ***PMTUD Black Hole*** 이라 한다.
- 결과적으로 패킷이 조용히 드랍되고, TCP 연결이 성립하지만 데이터 전송이 멈추는 현상(TCP Stall)이 발생한다.

따라서 VPN 인터페이스의 MTU 를 미리 낮추어 설정하는 것이 권장된다.

```bash
# WireGuard 인터페이스 MTU 설정
ip link set dev wg0 mtu 1420

# MSS Clamping (iptables)
# TCP SYN 패킷의 MSS 옵션을 강제로 조정
iptables -t mangle -A FORWARD -p tcp --tcp-flags SYN,RST SYN \
  -j TCPMSS --clamp-mss-to-pmtu
```

***MSS Clamping*** 은 TCP SYN 패킷이 VPN 인터페이스를 통과할 때, MSS 값을 VPN MTU 에 맞게 자동으로 낮추는 기법이다. 이 방법은 PMTUD Black Hole 문제를 우회할 수 있어, VPN 환경에서 가장 안정적인 해결책으로 널리 사용된다.

### Latency

VPN 은 다음과 같은 요인으로 추가 지연을 발생시킨다.

| 지연 요인 | IPsec | OpenVPN | WireGuard |
|-----------|-------|---------|-----------|
| 핸드셰이크 | 2 RTT (IKEv2) | 2+ RTT (TLS) | 1 RTT (Noise IK) |
| 패킷 처리 | 커널 (빠름) | User Space (느림) | 커널 (가장 빠름) |
| 암호화 | HW 가속 (AES-NI) 가능 | HW 가속 가능 | SW 최적화 (ChaCha20) |
| 컨텍스트 스위칭 | 없음 (커널) | 2회/패킷 | 없음 (커널) |

OpenVPN 은 모든 패킷이 User Space 의 OpenVPN 프로세스를 거쳐야 하므로, 패킷당 두 번의 컨텍스트 스위칭(Kernel → User → Kernel)이 발생한다. 이것이 OpenVPN 의 성능이 WireGuard 보다 낮은 근본적인 이유이다.

WireGuard 는 커널 모듈로 동작하여 패킷이 커널 내부에서 직접 처리된다. 또한 ChaCha20-Poly1305 는 SIMD 명령어를 활용한 소프트웨어 최적화가 뛰어나, AES-NI 하드웨어 가속이 없는 ARM 기반 디바이스(모바일, IoT, 차량 ECU)에서 특히 유리하다.

### Throughput Optimization

VPN 처리량을 최적화하기 위한 주요 기법들이다.

__Multi-Queue (RSS/XPS)__:
- 멀티코어 환경에서 NIC 의 수신 큐를 여러 CPU 코어에 분산한다.
- WireGuard 는 Linux 커널의 NAPI 와 연계하여 멀티코어 병렬 처리를 지원한다.

__GSO/GRO (Generic Segmentation/Receive Offload)__:
- 여러 패킷을 하나의 큰 버퍼로 모아서 처리한 뒤, NIC 직전에 분할한다.
- 암호화 연산을 큰 청크 단위로 수행하여 함수 호출 오버헤드를 줄인다.
- WireGuard 는 Linux 커널의 GSO 를 활용한다.

__CPU Affinity__:

```bash
# VPN 처리를 특정 CPU 코어에 고정
taskset -c 2,3 openvpn --config /etc/openvpn/client.conf

# WireGuard 의 경우 커널 softirq 를 처리하는 코어 최적화
# smp_affinity 는 16진수 비트마스크: 0xc = CPU 2,3 (bit 2,3)
echo c > /proc/irq/<IRQ_NUMBER>/smp_affinity
```

실무에서의 대략적인 처리량 비교(동일 하드웨어, 1Gbps NIC 기준)는 다음과 같다.

| 프로토콜 | 처리량 (approx.) | CPU 사용률 |
|----------|------------------|-----------|
| No VPN | ~940 Mbps | 기준 |
| WireGuard | ~800-900 Mbps | 낮음 |
| IPsec (AES-NI) | ~700-850 Mbps | 중간 |
| OpenVPN (UDP) | ~200-400 Mbps | 높음 |

## Links

- [RFC 7296 - Internet Key Exchange Protocol Version 2 (IKEv2)](https://datatracker.ietf.org/doc/html/rfc7296)
- [WireGuard: Next Generation Kernel Network Tunnel](https://www.wireguard.com/papers/wireguard.pdf)
- [Noise Protocol Framework](http://www.noiseprotocol.org/)
- [RFC 4301 - Security Architecture for the Internet Protocol (IPsec)](https://datatracker.ietf.org/doc/html/rfc4301)
- [NAT](https://klarciel.net/wiki/network/network-nat/)

## References

- 성공과 실패를 결정하는 1% 의 네트워크 원리 / Tsutomu Tone 저 / 성안당
