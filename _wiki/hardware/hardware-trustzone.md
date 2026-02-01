---
layout  : wiki
title   : Demystifying Passkeys; CTAP MakeCredential and GetAssertion
summary : Passkey, FIDO, TrustZone, Trusted Execution Environment
date    : 2026-01-18 11:54:32 +0900
updated : 2026-01-18 12:15:24 +0900
tag     : hardware arm mobile tee fido passkey
toc     : true
comment : true
public  : true
parent  : [[/hardware]]
latex   : true
---
* TOC
{:toc}

## TrustZone

하드웨어는 신뢰할 수 있는 당사자의 키(private key)로 서명되지 않은 모든 소프트웨어가 특권 기능에 액세스하지 못하도록 설계된다.

모바일, IoT, 차량(IVI/TCU), 금융 단말, DRM 환경까지—현대 컴퓨팅 환경은 항상 네트워크에 연결되어 있고, 그만큼 공격 표면이 넓다. 단순히 OS 레벨의 보안(권한, 샌드박스)만으로는 루팅·커널 취약점·메모리 덤프와 같은 공격을 완전히 막기 어렵다.

TrustZone 은 하드웨어 기반 격리 메커니즘("하나의 장치에 분리된 두 개의 환경을 제공하여 보안이 필요한 정보를 격리된 환경에서 안전하게 보호하는 기술")이고, ***[TEE](https://en.wikipedia.org/wiki/Trusted_execution_environment)*** 는 그 위에서 동작하는 보안 실행 환경이다.

![](/resource/wiki/hardware-trustzone/trustzone.png)

TrustZone 은 ARM 에서 개발한 ARMv6 이상의 CPU 에서 추가된 보안 확장 집합을 의미한다. CPU, 주소 공간, 메모리를 하드웨어 단위로 분리하여 기밀성과 
무결성을 제공할 수 있는 보안 및 비 보안으로 격리된 환경을 제공하는 것이 핵심이다.

## Trusted Execution Environment, Rich Execution Environment

신뢰할 수 있는 실행 환경(Trusted Execution Environment, TEE)은
메인 프로세서(CPU) 내부에서 일반 운영체제(REE)와 분리된, 안전하고 독립된 보안 영역이다.
***민감한 데이터(암호키, 생체 정보 등)를 암호화하여 처리***하며, 권한 없는 코드나 애플리케이션은 이 영역의 데이터를 읽거나 변조할 수 없어 높은 보안성을 제공한다.
주로, 스마트폰, IoT 기기, 차량 내 시스템 보안 등에서 주로 사용된다.

Android OS 는 TEE 내부의 메모리를 들여다보거나 데이터를 읽을 수 있는 권한 자체가 없다. 
REE(Rich Execution Environment) 는 Android OS, 카카오톡, 게임, 브라우저 등이 실행되는 일반 영역이다.

## FIDO

***[FIDO(Fast IDentity Online)](https://www.ibm.com/kr-ko/think/topics/fido)*** 는 생체인식 및 기기 기반 인증 기술을 활용해 비밀번호 없이 안전하고 간편한 로그인을 제공하는 국제 표준 기술이다. 사용자 기기 내에서 인증이 완료되어 보안성이 높으며, 지문, 얼굴, 패스키(Passkeys) 등을 활용해 금융, 웹 서비스 등에서 사용된다.
FIDO 는 비밀번호를 대체하기 위해, 하드웨어 격리 환경(TEE) 안에서 사용자의 인증 비밀을 생성·보관·사용하도록 설계된 인증 표준이다.

FIDO 기술은 ***[공개키 기반 암호 (Public Key Cryptography)](https://klarciel.net/wiki/security/security-signed-certificates/)*** 를 활용하여, 인증을 수행한다.

FIDO 는 처음부터 다음을 전제로 한다.
- OS는 언젠가 침해될 수 있다
- 앱은 신뢰할 수 없다
- 네트워크는 항상 공격 대상이다

이러한 조건에서 절대 유출되면 안되는 것이 ***사용자 인증 비밀(credentials)인 private key*** 이다.
이 비밀을 보호하기 위해서는 메모리 덤프가 불가능해야 하며, 커널 권한으로도 접근이 불가해야 하고, 루팅 상태에서도 보호가능 해야 한다.
그래서 FIDO 는 하드웨어 격리 환경을 요구한다.

### Passkey

패스 키(Passkey)는 비밀번호를 입력하는 대신 스마트폰의 지문, 얼굴 인식, PIN 코드 등 기기 자체 인증을 통해 웹사이트나 앱에 로그인하는 최신 보안 표준(FIDO)이다.
서버에 비밀번호를 저장하지 않으므로 안전하다. iCloud 키체인(Apple)이나 Google 계정(Google) 등을 통해 사용 중인 기기 간에 안전하게 동기화되어, 한 번 설정하면 다른 기기에서도 사용할 수 있다.
웹사이트나 앱 로그인 화면에서 패스키를 등록하면, 이후 로그인 시 화면 잠금 해제와 동일한 방식으로 안전하게 인증된다.

Passkey 는 생성 시 서비스별로 고유한 Credential 이 사용자 기기에 의하여 생성되며 재사용되지 않는다.

Passkey 는 사용자의 기기에 안전하게 저장되며, Passkey 가 등록된 서비스(Relying Party, RP)는 Passkey Credential 중 공개키(Public Key)만 저장한다. 따라서, 서비스에 대한 해킹 시 사용자의 Credential 에 대한 유출 위협에서 자유롭다. 또한, Passkey Provider 에 의해서 Passkey 의 Backup 및 Sync 가 지원이 되는 경우도, 
종단간 암호화 및 접근제어 등을 통해 Passkey Provider 는 사용자의 Passkey Credential 을 읽을 수 없다. 
오직 Passkey 의 소유자(사용자)만이 해당 Passkey 에 접근, 이용할 수 있다.

### CaBLE

우리가 구글 메일에 로그인할 때 passkey 인증을 통해 로그인을 하는 경우를 살펴보자. 이때 Passkey 가 있는 디바이스(e.g Mobile)가 멀리 있으면 로그인을 할 수 없다.
그리고 가까이 있으면 로그인을 할 수 있는데 이때 사용되는 것이 ***CaBLE(Cloud-assisted Bluetooth Low Energy)*** 이다.

CaBLE 는 **로그인을 시도하는 장치(Client)와 패스키를 가진 장치(Authenticator)를 Bluetooth LE + 클라우드 중계로 안전하게 연결하는 FIDO 인증 전송 방식**이다.

__구성 요소__:
- 노트북: 로그인하려는 장치 (패스키 없음)
- 휴대폰: 패스키를 보관한 장치 (TEE / Secure Enclave)
- 클라우드: 두 장치를 “서로 찾게 해주는 중계자”

CaBLE은 크게 ***두 가지 채널(“신원 매칭과 중계는 클라우드, 물리적 근접성 증명은 BLE”)*** 을 조합하여 크로스 디바이스 인증의 한계를 극복했다.

- __데이터 채널 (Cloud/WebSocket)__:
  - FIDO 인증에 필요한 주요 데이터(챌린지, 서명값 등)를 중계한다.
  - Google, Apple 등이 운영하는 Cloud Relay / Rendezvous 서비스를 사용하며, 해당 서버는 메시지를 해석하지 않는다.
  - BLE 대역폭에 의존하지 않기 때문에 빠르고 안정적인 데이터 전송이 가능하다.
- __보안 채널 (BLE - Proximity Check)__:
  - 대용량 데이터를 전달하기 위한 채널이 아니라, 두 장치가 실제로 근접해 있는지를 증명하기 위한 보조 채널이다.
  - 스마트폰이 특정 신호(Advertisements)를 송출하고, PC가 이를 감지(Scan)한다.
  - 페어링 과정 없이 동작하며, 연결형 통신이 아닌 비연결형 특성을 주로 활용한다.

### CTAP

***[CTAP(Client to Authenticator Protocol)](https://fidoalliance.org/specs/fido-v2.2-rd-20230321/fido-client-to-authenticator-protocol-v2.2-rd-20230321.html)*** 은 Client 가 Authenticator 에게
“이 RP를 위해 키를 만들고, 이 Challenge에 서명해라” 라고 명령하는 표준 프로토콜이다.

즉, Client (브라우저 및 OS)와 Security Keys 간에 Passkey Command/Response 교환을 위한 Protocol에 대한 정의이다.

### Sequence Diagram

__Passkey Registration Flow__:

![](/resource/wiki/hardware-trustzone/passkey_registration_flow.png)

CTAP MakeCredential(Passkey 생성 명령) 은 "이 Relying Party 를 위해 사용할 새로운 공개키/개인키 쌍을 만들어라" 라고 요청하는 명령이다.

__Passkey Authentication Flow__:

![](/resource/wiki/hardware-trustzone/passkey_login_flow.png)

CTAP GetAssertion(서명 요청) 은 "이 Relying Party 가 보낸 Challenge 에, 네가 가진 Private Key로 서명해서 증명해라" 라고 요청하는 인증(로그인) 명령이다.

__Email Login with Passkey Flow__:

![](/resource/wiki/hardware-trustzone/fido_email_flow.png)

1. 계정 설정에서 인증 방법으로 '패스키'를 선택한다.
2. 패스키를 생성할 장치를 선택한다. 대부분의 시스템은 기본적으로 현재 사용 중인 장치에 암호 키를 생성하지만, 사용자가 본인이 가지고 있는 다른 장치를 선택할 수도 있다.
3. 선택된 장치에서 사용자에게 생체인식 또는 PIN을 통해 인증하도록 요청한다.
4. 사용자의 장치에 암호화 키 쌍이 생성된다. 공개 키는 이메일 업체로 전송되고 비공개 키는 장치에 저장된다.
5. 이제 다음에 사용자가 로그인하면 이메일 업체가 사용자의 장치로 본인 확인 요청을 보낸다.
6. 사용자는 생체 인식이나 PIN 입력으로 본인임을 인증하여 도전 과제에 응답한다.
7. 그러면 장치는 서명된 도전 과제를 이메일 업체로 돌려 보내고, 이메일 업체는 공개 키를 사용하여 이를 확인한다.
8. 사용자에게 이메일 계정에 대한 액세스 권한이 부여된다.

## Links

- [TrustZone 을 사용하여 최소의 하드웨어 복잡성과 비용으로 IoT 장치를 보호하는 방법](https://www.digikey.kr/ko/articles/how-to-use-trustzone-to-secure-iot-devices)
- [패스키: 인증 기술의 미래, 비밀번호 없는 세상으로의 발걸음](https://devocean.sk.com/blog/techBoardDetail.do?ID=167067&boardType=techBlog)
- [Passkey High Level Message Flow](https://docs.passkey-sktelecom.com/api/1.21/message-flow.html)
- [Passkey SK Telecome](https://docs.passkey-sktelecom.com/api/1.21/message-flow.html)
- [Passkey ClientSide(Android, iOS) 연동](https://docs.passkey-sktelecom.com/api/1.21/client-integration.html#android-api)
- [Fido Design Guidelines](https://www.passkeycentral.org/design-guidelines/)