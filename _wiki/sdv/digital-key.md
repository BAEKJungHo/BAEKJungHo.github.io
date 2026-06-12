---
layout  : wiki
title   : DIGITAL KEY
summary : 
date    : 2026-06-10 10:54:32 +0900
updated : 2026-06-10 11:15:24 +0900
tag     : sdv mobility digitalkey crypto
toc     : true
comment : true
public  : true
parent  : [[/sdv]]
latex   : true
favorite: true
---
* TOC
{:toc}

# DIGITAL KEY

***[Digital Key](https://en.wikipedia.org/wiki/List_of_digital_keys_in_mobile_wallets)*** 란 ***차량 접근 인증에 사용되는 디지털 자격증명(Digital credentials used to authenticate access to the vehicle)*** 이다.

Digital Key 는 NFC 또는 UWB 로 동작하며 다양한 Digital Wallet(Mobile Wallet, e.g Google Wallet, Samsung Wallet, Apple Wallet)과 호환되며 스마트 기기에 저장된다.

예를 들어 스마트 기기에 Digital Key 가 저장되어있다면, 차량에 접근하면 버튼을 누르지 않아도 자동으로 문이 열리고 시동이 걸린다.
디지털 키의 핵심 기능이며, 이러한 기능을 <mark><em><strong>Passive Entry & Passive Start (PEPS)</strong></em></mark> 라고 부른다.

이어서 CCC 스펙을 이해하기 위한 다른 정의들도 살펴보자.

## DEFINITIONS

- Vehicle: A vehicle implementing the Digital Key service
- Endpoint: Digital Key object in the applet
- Instance CA: Device OEM-controlled SE Root services
- Key Slot: Data field in the Digital Key structure to be referenced by the vehicle
- Slot identifier: Value stored in private mailbox to reference a key slot of a Digital Key
- Owner Pairing: Pairing of an owner device with a vehicle
- Shared Key: Digital Key shared with a friend device. It is used interchangeably with friend Digital Key

## ARCHITECTURE

CCC Digital Key 의 아키텍처에서 Actor 간 통신 링크가 표기되어있다. 각 Link 의 의미는 다음과 같다.

| 유형 | 정의 | 의미 |
|------|------|------|
| **Standardized** | CCC 스펙에서 프로토콜과 메시지 형식이 **완전히 정의**됨 | 서로 다른 OEM 간 상호운용성(Interoperability) 보장. 모든 구현체가 동일한 프로토콜을 따라야 함 |
| **Proprietary** | 스펙 범위 밖. 각 OEM이 자체적으로 프로토콜을 정의 | 스펙에서 고수준 기능만 기술. 구현 방식은 OEM 재량. 점선(dashed line)으로 표시 |
| **Common Proprietary** | 범용 메시징 채널(WhatsApp, SMS, iMessage 등)을 사용 | 특정 OEM에 종속되지 않는 일반적 통신 채널. 프로토콜 자체는 비표준이지만 누구나 접근 가능 |

표준 링크의 정보는 비표준 링크를 통해 전달될 수 있다.

### Digital Key Release 2 Architecture

![](/resource/wiki/digital-key/dk2-architecture.png)

차량은 NFC Readers 를 장착하고 있으며, 이는 디바이스와 통신하여 오너 페어링, 차량 잠금/잠금해제 및 엔진 시동을 수행한다.

Owner/Friend 디바이스는 Vehicle OEM Server 에서 정의한 인터페이스/프로토콜을 통해서 직접 통신할 수 있다.

Device OEM Server(스마트폰 제조사 서버)가 디지털키 애플릿(Secure Element 내부 디지털키 모듈, Wallet 내 secure applet 등을 의미)의 생명주기를 관리한다.
디바이스는 잃어버리거나 분실 당할 위험이 있기 때문에 Device OEM Server 는 suspend(폰 분실시 키 비활성화), restore(활성화), wipe(디지털키 영구 제거) 과 같은 기능을 제공할 수 있다.

Vehicle OEM Server 는 사용자 계정 관리, 차량 소유자 검증, 본인 인증 등을 담당한다.

Key Tracking Server(KTS) 는 차량에 발급된 모든 디지털키를 추적 관리하는 서버이다. 키 발급 및 관리, 조회에 대한 감사를 위한 목적이기도 하다. 

Device OEM Server 끼리는 직접 연결되지 않는다. 즉, 삼성 서버와 애플 서버가 직접 통신하지 않는다.
Owner Device 는 Digital Key 를 Friend Device 와 공유(via (2), (6), (7), (8))할 수 있다.
Friend Device 는 공유 받은 키를 재공유할 수 없다.

**Device Functional Elements**:

![](/resource/wiki/digital-key/dkey2-device-functional-elements.png)

### Actors

#### Vehicle

- Owner/Friend Device가 디지털 키 서비스에 적합한지 **오너 페어링 허용 또는 오너 디바이스가 공유한 Friend Key 수락 전에** 판단
- Key Tracking 이 필요한 경우, 오너 페어링 정보(오너 공개키, 디바이스 정보 등)를 KTS 에 제공하거나 KTS 가 수신했는지 검증
- 디바이스의 **진위성(authenticity)** 검증
- 유효한 디지털 키를 보유한 디바이스에 차량 접근 권한 부여. 차량이 요구하는 경우 **이모빌라이저 토큰(immobilizer token)** 으로 엔진 시동 허가
- 필요 시 오너 및 Friend 디지털 키 삭제를 위한 사용자 인터페이스 제공
- **보안 처리 및 저장 환경** 제공

#### Vehicle NFC Readers

- 오너 디바이스와 **오너 페어링 및 디지털 키 트랜잭션**(잠금/해제, 엔진 시동 등) 수행
- Friend 디바이스와 **디지털 키 트랜잭션** 수행

#### Vehicle OEM Server

- 오너의 차량과 연결된 **오너 계정 호스팅**
- **디지털 키 서비스 구독** 관리
- 공유된 디지털 키 구조에 서명. **비즈니스 정책 검증 및 키 추적** 보장
- 차량이 온라인일 때, 공유된 Friend 디지털 키가 **첫 Friend 트랜잭션**에서 차량에 수락되도록 필요한 증명(attestation) 제공
- 디바이스에서 삭제된 디지털 키를 **차량에서 종료**
- 오프라인으로 수행된 디지털 키 종료에 대해 **오너 디바이스와 동기화**
- 차량과의 **보안 채널** 관리
- **페어링 비밀번호** 생성 후 오너 디바이스와 차량에 제공
- **차량 공개키 서명**
- Device OEM에 **필요한 인증서** 제공
- 오너 페어링 및 Friend 공유를 위해 Vehicle OEM 및 (선택적으로) Device OEM 공개키를 **차량에 제공**

#### Key Tracking Server

KTS 는 Vehicle OEM 이 관리하며, Vehicle OEM Server 와 **데이터 분리(data separation)** 를 유지해야 한다. 이는 프라이버시 보호를 위한 것이다.

**책임:**
- 추적된 디지털 키를 차량-디바이스에 매핑할 수 있도록 **관련 데이터 기록**

**핵심 속성:**
- 법률 또는 보험 목적, 또는 오너 디바이스 변경 시 Friend Key 정보 전송을 위해서만 **데이터 조회 접근** 허용
- **Vehicle OEM Server 와의 데이터 분리** — 추적 데이터의 프라이버시 요건 충족

#### Devices

**공통 책임:**
- 디지털 키 애플릿을 실행하는 **보안 처리 및 저장 환경**(SE 또는 동등물) 포함
- **오너 디바이스와 Friend 디바이스** 역할 모두 수행 가능
- 잠금/해제 및 엔진 시동을 위한 **비접촉 트랜잭션** 지원
- **설정 가능한 사용자 인증**(예: 패스코드) 지원
- 오너 페어링 또는 Friend 디지털 키 수락 전 **서비스 적격성** 확인

**Owner Device:**
- **주요 기능 구현**: 트랜잭션, 오너 페어링, 디지털 키 공유(전송자), 디지털 키 종료
- 오너 페어링 및 디지털 키 공유에 필요한 **인증서 저장**
- 공유 키 종료 시 차량(Vehicle OEM Server 경유)과 Friend 디바이스(Device OEM Server 및 Vehicle OEM Server 경유)에 **종료 요청** 전송

**Friend Device:**
- **주요 기능 구현**: 트랜잭션, 디지털 키 공유(수신자), 키 종료
- 디지털 키 공유에 필요한 **인증서 저장**
- Vehicle OEM Server에 **종료 증명(attestation)** 전송

#### Device OEM Server

- 디지털 키 애플릿의 **디지털 키 인스턴스 로드 및 설치** (필요 시)
- 디바이스에 **필요한 인증서 제공 및 업데이트**
- 분실 또는 도난 디바이스에서 디지털 키 기능 **일시 비활성화** 허용 (온라인 시)
- 분실 또는 도난 디바이스에서 디지털 키 **초기화(wipe)** 허용 (온라인 시)

### Digital Key Release 3 Architecture

**Architecture**:

![](/resource/wiki/digital-key/dk3-architecture.png)

R2와 달리 R3 에는 차량과 디바이스에는 NFC Module 외에 BLE/UWB Module 이 추가되었다.
BLE Module 은 Passive Entry 를 위해 BLE 통신을 지원하며, 원격 잠금/해제(RKE) 가 가능하다.
UWB Module 은 물리적 거리 측정을 통한 보안 강화 목적으로, Secure Ranging 으로 차량-디바이스 간 정확한 거리 측정을 담당한다.

**Device Functional Elements**:

![](/resource/wiki/digital-key/dkey3-device-functional-elements.png)

### Actors

#### Vehicle Bluetooth LE Module

BLE 기반 무선 통신 인터페이스이며, Passive Entry 및 원격 기능을 지원한다.

- 오너 디바이스와 **오너 페어링 및 디지털 키 트랜잭션**(잠금/해제, 엔진 시동, RKE 등) 수행
- Friend 디바이스와 **첫 Friend 트랜잭션 및 디지털 키 트랜잭션** 수행
- Owner/Friend 디바이스와 **UWB를 통한 보안 레인징 설정(setup)** 통신
- Owner/Friend 디바이스와 **원격(Remote) 트랜잭션** 수행 — 디바이스가 온디맨드 기능(잠금/해제 등) 발동
- Owner/Friend 디바이스에 **상태 변경 정보 알림(Notification)** 전송
- Owner/Friend 디바이스와 **3rd Party Vehicle OEM 애플리케이션 데이터** 전송

#### Vehicle UWB Module

UWB 기반 보안 거리 측정 및 Passive Entry/Start 기능을 지원한다.

- Owner/Friend 디바이스와 **보안 레인징(secure ranging)** 수행 — 디바이스와 차량 간 거리를 안전하게 측정하여 **Passive Entry 및 Passive Engine Start** 기능 지원

#### Devices

**Owner Device**:
- R2 기능외에 새롭게 추가된 것은 Common Proprietary Link 를 통한 키 공유 제공

**Friend Device**:
- R2 기능외에 새롭게 추가된 것은 Common Proprietary Link 를 통한 키 공유 수락

#### Relay Server

서로 다른 OEM 간 키 공유를 위한 표준화된 통신 채널이다.

- 서로 다른 (또는 동일한) OEM의 두 디바이스 간 키 공유를 지원하는 **표준화된 통신 채널** 제공
- 키 공유 프로세스 중 디바이스에 정보를 전달하기 위한 **푸시 알림 및 폴링 메커니즘** 구현
- 어떤 엔티티든 구현 가능하며, CCC 승인 Relay Server 제공자 목록에 포함되어야 함

### Relationships

#### Telematics Link

Telematics Link(1) 는 차량 제조사(OEM)가 관리하는 독자적(proprietary)이며, 신뢰할 수 있고(trusted), 기밀성이 보장되는(confidentiality-preserving) 통신 채널이다. 주요 기능은 다음과 같다.

- 차량에 Owner Pairing Verifier(오너 페어링 검증 정보) 및 추가 페어링 정보를 전달한다.
- 차량 공개키(Vehicle Public Key)에 대한 서명을 차량 OEM 의 인증기관(CA)으로 부터 획득한다.
  - 이 의미는 "이 차량이 진짜 OEM이 생산한 차량임을 암호학적으로 증명할 수 있도록 인증서를 발급받는다" 는 것을 의미한다.
  - 예를 들면 OEM CA 가 `Sign(Vehicle Public Key)` 를 수행한다. 실제로는 Certificate 를 만들때 VIN, Vehicle Public Key 등을 같이 넣어서 CA Private Key 로 서명한다. 이러한 방식으로 진행하게 되면 OEM Root CA -> Vehicle Certificate -> Vehicle Public Key 구조가 된다.
  - 이러한 방식으로 서명이 필요한 이유는 공격자가 가짜 차량 공개키를 만들어서 보낼 수도 있기 때문에 OEM이 인정한 진짜 차량을 구분하기 위해서는 PKI 에서 Public Key + OEM CA Signature 가 필요한 것이다.
- 차량 내 특정 디지털키를 삭제하기 위해 디지털키 종료(Termination) 정보를 차량으로 전달한다.
- 차량에서 디지털키가 삭제되었읆을 차량 OEM 서버에 통보하여, 해당 디지털키를 친구(Friend) 디바이스에서도 제거하도록 한다. 
  - 이러한 매커니즘은 ***Acknowledgement*** 라고 볼 수 있을 것 같다.
  - e.g 오너가 공유 취소 -> 차량에서 키 삭제 -> OEM 서버 통보 -> Friend 휴대폰에서도 키 삭제

정리하면 Telematics Link 채널을 통해서 차량에 새로운 Owner Key 를 등록, 차량 공개키 인증, 디지털키 삭제,
공유키 회수, 발급된 키 추적(KTS 등록)이 가능하다.

### Vehicle OEM Server to KTS

Vehicle OEM Server to KTS(5) 는 차량 OEM 서버가 KTS 에 다음과 같은 키 추적(Key Tracking) 정보를 제공한다.

- Owner 디바이스 및 Friend 디바이스의 공개키
- 디지털키를 호스팅하고 있는 Instance CA 식별자(Instance CA Identifier)
  - 여기서 호스팅은 해당 디지털키를 저장·관리하는 Secure Element 또는 Wallet 환경을 의미한다.

즉, KTS 는 "이 공개키가 어느 Device OEM의 신뢰 체인(Instance CA)에 속해 있는지" 를 함께 관리한다.
따라서, 차량 OEM 서버가 KTS에 "어떤 디바이스가 이 차량의 디지털키를 가지고 있는지"와 "그 디바이스가 어느 인증 체인(Instance CA)에 속하는지"를 등록하여, 디지털키의 발급·공유·회수·삭제를 추적 관리한다.

## STRUCTURE

**Digital Key Structure**:

![](/resource/wiki/digital-key/digitalkey-structure.png)

디지털키 구조는 Applet Instance 에 저장되며, public/private key pair 를 포함한다. 또한 private mailbox, confidential mailbox 등으로 구성된다.

Owner Digital Key 는 ***Digital Key Structure*** 로만 구성된다. 반면 Friend Digital Key 는 ***자격증명(Attestation)*** 이 포함된다.

**Vehicle Identifier**:
- VIN 과 별도로 존재하는 디지털키 시스템 전용 차량 식별자이며, 차량이 NFC/BLE/UWB 통신 시 이를 전송하면 스마트폰이 해당 차량에 맞는 디지털키를 선택하여 인증을 수행하는데 사용된다.

**Endpoint Identifier**:
- Endpoint 는 디지털키를 실제로 보유하는 디바이스(스마트폰, 스마트워치 등)를 의미한다. 각 디바이스는 하나의 Endpoint 이다.
- 이 식별자는 디지털키 인증서(Digital Key Certificate)의 Subject 필드에 반영되며, 해당 인증서는 "Digital Key Endpoint Certificate" 라고 부른다.

**Digital Key Identifier(KeyID)**:
- Digital Key Identifier 는 KeyID 라고도 하며 차량 OEM 서버 시스템 내에서 특정 디지털키를 식별하기 위해 사용된다.
- 디지털키 식별자는 각 차량 OEM 내에서 유일해야한다.
- X.509 인증서 정의에 따라 이를 "Subject Key Identifier" 라고 부르기도 한다.
- 이 값은 디바이스 공개키(Device Public Key)에 대해 계산된 SHA-1 해시값이다.
  - **디지털키 생태계의 모든 인증서는 인터넷 표준인 X.509를 사용하고, ECC P-256 공개키를 사용하며, 운영 환경과 테스트 환경을 인증서 수준에서 명확히 구분해야 한다.**
  - 즉, 디지털키 시스템은 HTTPS/TLS에서 수십 년간 검증된 PKI(X.509) 구조를 차량과 스마트폰 인증에 그대로 적용한 것이다.

**Slot Identifier**:
- 차량이 부여하는 차량 내부 키 저장 위치 식별자이다.
- Slot Identifier(슬롯 식별자)는 차량이 오너 디바이스에 제공하는 값으로, 차량 내부에서 사용중인 키를 식별하기 위해 사용된다.
- 이 값은 NFC/BLE/UWB 등의 비접촉(Contactless) 통신 과정에서 전송된다.
- 키를 공유할 때는 오너 디바이스 또는 차량 OEM 서버가 친구 디바이스에게 Slot Identifier 를 제공하며, 친구용 디지털키 생성 및 필요 시 관련 Immobilizer Token 식별에 사용된다.
  - 예를 들면 차량 내부가 아래 처럼 관리될 수 있다.
    - Slot 1 → Owner Key
    - Slot 2 → Wife Key
    - Slot 3 → Friend Key
    - Slot 4 → Empty

**Instance CA Identifier**:
- 해당 디지털키를 서명한 Instance CA 를 식별하기 위한 값이다.

**Key Options**:
- 디지털키가 사용할 수 있는 인증 방식(Fast, Standard, Wired 등)을 정의하며, 문 열기·시동과 같은 접근 권한(Access Rights) 과는 별개의 개념이다.

**Authorized Public Keys**:
- Authorized Public Keys 는 차량이 제공하는 공개키 이며 키 공유시 Friend Public Key 를 검증하는 체인의 루트로 사용된다.
- R3 에서는 단 하나의 Authorized Public Keys 만 포함해야 한다.
- 추가 Authorized Public Keys 사용은 향후 버전에서 활용될 수 있다.

## OWNER PAIRING

디지털키 오너 페어링(Owner Pairing)이란 특정 디바이스(e.g 스마트폰)를 해당 차량의 최초 소유자(Owner) 디지털키로 등록하고, 
차량과 스마트폰 사이에 신뢰 관계(Trust Relationship)를 수립하는 과정을 의미한다.

### Phase 0/1: Preparation, Provisioning/Initiate

![](/resource/wiki/digital-key/owner-pairing-phase1.png)

#### Phase0: Preparation, Provisioning

Phase0 은 ***Device Preparation*** 및 ***Vehicle Provisioning*** 단계이다.

Device Preparation 단계에서는 디바이스는 아래 전제조건이 필수이다.
- Digital Key Applet이 SE에 설치 완료
- Vehicle OEM별 Instance CA가 생성 완료
- Digital Key Framework에 Vehicle OEM 파트너 목록 업데이트 완료
- Instance CA Certificate 획득 완료

Vehicle Provisioning 단계에서는 ***password(8자리 숫자 비밀번호), salt, verifier 를 생성하고 이 값을 차량으로 전달***한다.
이 과정은 디지털키 시스템의 아주 중요한 보안 설계 원칙이다.

디지털키 시스템은 오너페어링, Lock/UnLock 과 같은 기능을 완전히 ***오프라인 상태에서도 수행 가능하도록 설계 되었다.*** (규제 또는 비지니스 제약으로 인한 경우에는 온라인 연결을 위한 컴포넌트를 시스템에 추가할 수 있다.)
즉, 지하 주차장, 오지 등 네트워크 연결이 불가능한 환경에서도 페어링이 가능하다는 뜻이다.

핵심 매커니즘은 ***Verifier Provisioning*** 이다.
즉, Vehicle OEM Server 가 verifier(w0, L)와 salt(s)를 차량 출하 전 또는 네트워크 가능 시점에 프로비저닝하여 ***오프라인 페어링을 보장***하게 된다.

추가적으로 Vehicle Provisioning 단계에서 ***PKI 인증서 배포*** 가 추가될 수 있다.

**PKI 인증서 배포 예시**:
- 차량(Vehicle)이 공개키/개인키 쌍 생성
- 차량이 자신의 공개키와 식별 정보를 담아 CSR 생성
- CSR(Certificate Signing Request)을 CA(Certificate Authority)에 전달
- CA가 CSR을 검증
- CA가 공개키에 서명하여 인증서(Certificate) 발급
- 차량은 발급받은 인증서 사용

여기서 CSR은 차량이 자신의 Vehicle Public Key Certificate를 발급받기 위해 제출하는 인증서 서명 요청 데이터라고 이해하면 된다.

#### Phase1: Initiate

Phase1 은 페어링을 개시하는 단계이다. 

**차량 측**:
- 사용자가 차량을 페어링 모드로 설정 (예: 키폽 존재 등 적절한 precondition 충족)
- 또는 오너 디바이스가 성공적으로 페어링될 때까지 Console NFC Reader에서 Framework AID 선택 시도

**디바이스 측**:
- Vehicle OEM 앱을 통해 API로 비밀번호 수신, 사용자 직접 입력, 또는 URL(Section 6.3.7)을 통해 수신
- 비밀번호 입력 대기 중 NFC 인터페이스를 비활성화 -> 디바이스 움직임에 의한 불필요한 폴링/재시작 방지

#### Phase2: First NFC Session

![](/resource/wiki/digital-key/fisrt-nfc-session.png)

SPAKE2+는 차량과 장치 간의 안전한 채널을 설정하는 데 사용되는 대칭 세션 키 쌍을 생성한다.

두 번째 NFC 트랜잭션이 시작되기 전에 장치는 장치 키를 생성한다.

두 번째 NFC 거래에서 차량은 장치에서 키 생성 데이터를 읽고 이를 확인한 후 성공하면 장치 공개 키를 저장한다.

NFC 리셋 절차는 각 거래가 끝날 때마다 수행된다.

**SPAKE2+ Flow**:

![](/resource/wiki/digital-key/spake2+flow.png)

#### Phase3: Second NFC Session

![](/resource/wiki/digital-key/second-session.png)

![](/resource/wiki/digital-key/finalization.png)

#### Error Management

![](/resource/wiki/digital-key/error-management.png)

### Verifier Provisioning for Offline First

> Spec (Section 2.1, line 3386-3389): "The system is designed to work fully offline (i.e., no server connection is needed for a vehicle or a device) for all relevant features at the time of execution, such as the owner pairing or lock/unlock vehicle using the Digital Key. Where regulatory or business constraints require online connections, these can be added to the system."

CCC Digital Key 시스템의 가장 근본적인 설계 원칙은 Offline-First 이다. 
차량과 디바이스가 수행하는 모든 핵심 기능(Owner Pairing, Lock/Unlock, Engine Start)은 서버 연결 없이 동작해야 한다.

이 원칙이 존재하는 이유:
- 물리적 환경: 지하 주차장, 오지, 터널 등 네트워크 연결이 불가능한 환경에서도 차문을 열고 시동을 걸 수 있어야 한다
- 안전(Safety): 네트워크 장애가 차량 접근을 차단해서는 안 된다. 서버 다운 = 차문 잠김은 허용할 수 없는 시나리오이다
- 지연(Latency): 차문 잠금/해제는 밀리초 단위의 반응성이 요구된다. 서버 라운드트립(수백ms~수초)은 UX를 심각하게 저하시킨다

Verifier Provisioning 이 어떻게 Offline Owner Pairing 을 가능하게 하는지 살펴보자.

Owner Pairing 은 비밀번호 기반 인증이다. 즉, 차량과 디바이스는 SPAKE2+ 프로토콜로 상호 인증한다. 이 프로토콜은 비밀번호를 기반으로 동작한다.
따라서 다음과 같은 질문을 할 수 있다.

> "비밀번호는 Vehicle OEM Server 가 생성하는데, Owner Pairing 시점에 서버 없이 어떻게 비밀번호 기반 인증이 가능한가?"

해법은 사전 프로비저닝이다. Vehicle OEM Server 는 Owner Pairing 이 발생하기 전에 다음을 수행한다.

```
[Verifier 생성 과정 - Vehicle OEM Server(Digital Key Server)]

1. pwd 생성: 8자리 숫자 비밀번호 (UTF-8, "0"-"9")
2. salt(s) 생성: 16바이트 랜덤
3. Scrypt 실행:
   z = Scrypt(pwd, s, Nscrypt, r, p, 80)  // 80바이트 출력
   z0 = z[0:40], z1 = z[40:80]
4. Verifier 계산:
   w0 = z0 mod p (NIST P-256 order)
   w1 = z1 mod p
   L  = w1 * G   // EC 스칼라 곱, 65바이트 비압축 포인트
5. 전달:
   - 차량에 전달: {s, w0, L, Scrypt 파라미터}  ← Telematics Link
   - 사용자에 전달: pwd                         ← Vehicle OEM App
6. 즉시 삭제:
   - pwd: 서버 메모리에서 즉시 삭제
   - w1:  L 계산 후 즉시 삭제
```

핵심은 차량은 `w0` 와 `L` 만 보유한다. `pwd` 나 `w1` 은 보유하지 않는다. 디바이스는 `pwd` 만 보유한다. 양측 모두 상대방의 비밀을
직접 보유하지 않으면서 SPAKE2+ 를 통해 상호 인증할 수 있다.

Owner Pairing의 5개 Phase에서 서버 연결이 필요한 시점을 분석하면:

| Phase | 동작 | 서버 필요 여부 | 이유 |
|-------|------|-------------|------|
| **0** | Preparation | **필요** | Verifier 생성 + 차량 프로비저닝, PKI 인증서 배포 |
| **1** | Initiate Pairing | **필요** | pwd를 사용자/디바이스에 전달 |
| **2** | First Session (NFC) | **불필요** | 차량에 이미 Verifier 존재, 디바이스에 이미 pwd 존재 |
| **3** | Second Session (NFC) | **불필요** (NFC 부분) | 차량-디바이스 직접 NFC 통신 |
| **4** | Finalization | 필요 (KTS 등록) | 단, 실패해도 키 자체는 생성 완료 |

**Phase 2,3 가 핵심이다.** SPAKE2+ 인증, 보안 채널 수립, 키 생성 데이터 전송, 인증서 체인 교환 — Owner Pairing 의 가장 중요한 단계가 모두 **서버 없이** 수행된다.

이것이 가능한 이유는 **Phase 0에서 모든 필요한 데이터가 사전 전달되었기 때문**이다:

```
[Phase 0에서 사전 전달되는 데이터]

Vehicle OEM Server --> 차량 (Telematics Link):
  1. Verifier: {s, w0, L, Scrypt 파라미터}     ← SPAKE2+ 인증에 사용
  2. Vehicle Public Key Certificate [K]          ← 디바이스가 차량을 검증
  3. Device OEM CA Certificate [F]               ← 차량이 디바이스를 검증
  4. Vehicle OEM CA Certificate [J]              ← Trust Anchor

Vehicle OEM Server --> 사용자/디바이스 (App/URL):
  5. pwd (8자리)                                 ← SPAKE2+ 인증에 사용

이 5가지가 전달되면, Phase 2는 완전히 오프라인으로 동작한다.
```

## CERTIFICATE

**Variant1 - SE root of trust based on CASD**:

![](/resource/wiki/digital-key/cert-var1.png)

**Variant2 - SE root of trust based on DK applet associated security domain**:

![](/resource/wiki/digital-key/cert-var2.png)

## References

- Digital Key Technical Specification / Car Connectivity Consortium