---
layout  : wiki
title   : SIGNED CERTIFICATES
summary : 
date    : 2025-06-04 15:54:32 +0900
updated : 2025-06-04 20:15:24 +0900
tag     : security sdv network tesla crypto
toc     : true
comment : true
public  : true
parent  : [[/security]]
latex   : true
favorite: true
---
* TOC
{:toc}

## SIGNED CERTIFICATES

현실 세계에서 ___서명(署名, signature)___ 이란 계약서나 문서 하단에 직접 자신의 이름을 쓰는 행위를 의미한다.
서명은 위조가 어렵도록 본인만의 고유한 필체를 사용하거나 지장을 사용한다. 이는 본인이 확인했음을 증명하며, 책임을 진다는 의미가 있다.

![](/resource/wiki/security-signed-certificates/digital-signature-page.png)

___[Digital Signature](https://klarciel.net/wiki/auth/auth-certificate-authority/)___ 는 금융 거래 등 보안이 중요한 시스템에서 메시지의 ___진위 여부(Authenticity)___ 와 ___유효성(Integrity)___ 을 검증하는 데 사용된다.

![](/resource/wiki/security-signed-certificates/digital-signature.png)

위와 그림이 전자 서명에서 사용되는 방식이다. 개인키(private key)를 비공개로 아주 잘 보관해야 한다. 공개키(public key)는 서명된 메시지(signed message)의 진위 여부를 검증하는데 사용된다.
위 그림과 같은 암호화 방식을 ___[Public-key cryptography(asymmetric cryptography)](https://en.wikipedia.org/wiki/Public-key_cryptography)___ 라고 하는데, ___[Symmetric-key algorithm](https://en.wikipedia.org/wiki/Symmetric-key_algorithm)___ 에 비해서 속도가 느리다.
또한 재생 공격을 방지할 수 없다는 단점이 있다.

![](/resource/wiki/security-signed-certificates/replay-attacks.png)

### Secure Channel

TESLA Vehicle 에 Door Lock/Unlock 과 같은 원격 제어 명령(remote control command)를 보낼때, replay attack 이 일어난다면 인명 피해가 일어날 수도 있을 것이다.

__Remote Control Command Requirements__:
- 명령이 차량에 도달하기까지 누가 보냈는지 확인되어야 하고
- 명령이 도중에 변조되지 않아야 하며
- 제3자가 내용을 절대 볼 수 없어야 하고
- 같은 명령을 복사해 재전송해도 무효가 되어야 한다

원격 차량 제어 명령을 안전하게 처리하기 위해서는 양쪽(차량과 서버)이 믿고 안전하게 통신할 수 있도록 ___"인증 + 무결성 + 기밀성 + 리플레이 방지"___ 까지 종합적으로 갖춘 통신로를 만드는 것이 필요한데,
이를 ___Security Channel___ 을 형성한다고 표현한다.

> <mark><em><strong>Tesla uses signed certificates for everything</strong></em></mark>
![](/resource/wiki/security-signed-certificates/signed-command.png)

__Process of forming a secure channel__:
1. [Generating a server TLS key and certificate](https://github.com/teslamotors/vehicle-command)
2. 서버는 위에서 생성한 개인키에서 공유키를 파생시키고 해당 공유키를 테슬라로 넘겨서 테슬라로 부터 공유키를 전달받아서 `privateKey.Exchange(vehicleInfo.publicKey)` 를 통해서 공유 비밀(shared secret)을 생성한다. 서버의 개인키와 Tesla 의 공개키를 사용해 shared secret 을 계산하고, Tesla 도 자신의 개인키와 서버의 공개키로 동일한 공유 비밀을 계산한다.
   즉, 양쪽만 알고 있는 대칭 키(세션 키) 확보한다. 공유 비밀을 생성할 때 사용되는 Key Exchange 알고리즘은 ___[ECDH(Elliptic Curve Diffie-Hellman)](https://en.wikipedia.org/wiki/Elliptic-curve_Diffie%E2%80%93Hellman)___ 이다.
3. 공유 비밀을 SHA-1 으로 해시하고, 특정 길이만큼 잘라서 해당 값을 세션 키로 사용한다.
4. 그리고 세션 키로 HMAC 을 생성해서 HMAC 태그값을 sub_sigData 필드에 삽입하여 RoutableMessage 라는 protobuf 를 base64 로 인코딩하여 TESLA Fleet API 의 ___[signed_command](https://developer.tesla.com/docs/fleet-api/endpoints/vehicle-endpoints#signed-command)___ API 를 호출한다.

__[Universal Message by TESLA](https://github.com/teslamotors/vehicle-command/blob/main/pkg/protocol/protobuf/universal_message.proto)__:

```go
message RoutableMessage {
    reserved 1 to 5;
    reserved 16 to 40;
    reserved 11;
    Destination to_destination = 6;
    Destination from_destination = 7;

    oneof payload {
        bytes protobuf_message_as_bytes = 10;
        SessionInfoRequest session_info_request = 14;
        bytes session_info = 15;
    }

    oneof sub_sigData {
        Signatures.SignatureData signature_data = 13;
    }

    MessageStatus signedMessageStatus = 12;
    bytes request_uuid           = 50;
    bytes uuid                   = 51;
    uint32 flags = 52;
}
```

이러한 테슬라의 통신 매커니즘은 단순한 "Digital Signature" 를 넘어서, 양방향 인증 + 세션 키를 통한 메시지 무결성 검증 + 메시지 리플레이 방지를 통합한 보안 채널을 형성한다. 세션마다 키를 바꾸면 리플레이 공격 방지가 가능하다.
즉, 해커가 "문 열기" 패킷을 녹음했다가 다시 틀어도, 세션 키나 카운터(HMAC 태그)가 바뀌어 거절 당한다.

간단히 말하면, 공개키 기반 서명은 ‘누가 보냈는가’를 검증하는 용도이고, ___[공유 비밀(shared secrets)](https://en.wikipedia.org/wiki/Shared_secret)___ + ___[HMAC](https://klarciel.net/wiki/auth/auth-hmac/)___ 은 ‘메시지가 조작되지 않았고, 재사용되지 않았는가’를 확인하기 위한 세션 보안이다.

일반적인 Digital Signature 는 RSA 기반이며, RSA 기반 전통 서명은 무겁고 느려서 차량에는 부담이 된다. ECDH 는 공개키 기반이지만 빠르고 가볍기 때문에 공유 비밀(세션 키 - 기밀성 & 일회성 키)을 생성할 때 쓰인다.
그리고 HMAC 을 이용하여 공유 비밀 기반 인증 및 무결성 보장한다.

- ECDH 는 "우리 둘만 아는 비밀" 을 만들고,
- HMAC 은 그 비밀을 활용해 "내가 보낸 메시지임" 을 증명한다.

***명령의 무결성 & 권한 검증을 위한 테슬라의 아키텍처***를 간략하게 요약하면 다음과 같다.

1. **ECDH(Key Exchange)**: Cloud의 PrivateKey 와 Vehicle 의 PublicKey 를 조합해 Shared Secret 을 만든다. (이건 수학적으로 Cloud 와 Vehicle 둘만 만들 수 있다).
2. **HMAC(Signing)**: 이 Shared Secret 으로 "창문 열어"라는 메시지에 서명(Tagging)을 한다.
3. **Validation**: 차량은 자신이 만든 Shared Secret 으로 HMAC 을 검증합니다. 맞으면 수행한다.

### Certificate Chains Explained

브라우저가 SSL 인증서를 어떻게 검증하고 신뢰하는지를 살펴보자. 먼저 인증서 체인은 아래와 같은 형태로 이루어져 있다.

__Certificate chain__:

![](/resource/wiki/security-signed-certificates/chain-of-certificates.png)

```
Root CA → Intermediate CA → TLS Server Certificate
```

먼저, ___[인증서 서명 요청(CSR, certificate signing request)](https://en.wikipedia.org/wiki/Certificate_signing_request)___ 을 진행해야 한다.
CSR 은 인증서 요청자(예: example.com)가 본인의 공개키 + 정보(도메인명, 조직명 등)를 묶어서 생성하는 파일이다.
동시에 로컬에서 개인키도 생성되며, 공개키는 CSR 에 포함되고 개인키는 절대 유출되어선 안 된다.

```
// example
openssl req -new -newkey rsa:2048 -nodes -keyout example.key -out example.csr
```

그 다음, CSR 을 인증기관(CA)에 제출하여 인증서를 발급해야 한다.
CA 는 제출된 CSR 을 검토하고, 해당 도메인이 진짜 요청자의 것인지 확인한다. (e.g DNS 확인, 이메일 인증 등)
문제가 없다면, CA 의 개인키로 요청자의 공개키에 서명해서 ___[X.509](https://en.wikipedia.org/wiki/X.509)___ 인증서를 발급한다.

__결과물: SSL 인증서 (example.crt)__:

```
요청자의 공개키
요청자의 도메인 정보
유효기간
CA의 디지털 서명
```

이제 사용자가 브라우저(`https://example.com`) 에 접속하면 서버는
SSL 핸드셰이크 과정에서 example.com 의 인증서를 브라우저에게 보낸다.
이때 보통 Intermediate 인증서 체인도 함께 보낸다. (e.g `fullchain.pem`)

브라우저는 인증서를 보고 아래를 차례대로 검증한다.

- __인증서 체인을 따라 신뢰 경로를 구성__
  - 브라우저는 서버가 보낸 인증서를 보고, 누가 서명했는지 확인
  - 그 서명자는 Intermediate CA → 또 그 서명자는 Root CA
  - ServerCert -> Intermediate CA -> Root CA
  - 최종적으로 루트 인증서가 브라우저에 내장된 신뢰 목록(root store) 에 있으면 OK!
- __디지털 서명을 수학적으로 검증__
  - 각 인증서의 서명은, 발급자의 공개키로 검증 가능
  - 루트의 서명은 내장된 루트 공개키로 검증
  - Intermediate 의 서명은 루트로부터 받은 것이므로 그 공개키로 검증 가능
  - 마지막으로 서버 인증서도 Intermediate 공개키로 검증합
- __추가 보안 검사__
  - 인증서 유효기간 확인
  - 도메인 이름 일치 여부 (CN or SAN)
  - 폐기 여부 (CRL, OCSP 등)

Let's Encrypt 의 경우 Root CA → Intermediate CA → Your Domain Cert 형태로 발급하며,
브라우저는 Intermediate → Root 체인을 따라가면서 검증하고, 최종적으로 루트가 신뢰되는지 확인하여 HTTPS 를 성공시킨다.

Intermediate CA 가 필요한 이유는 Root CA 의 개인키는 매우 중요하기 때문에 이를 분리해 오프라인에서만 관리하고, 직접 인증서 발급은 Intermediate 에게 맡긴다.
Intermediate CA 가 해킹당하더라도 Root CA는 안전하며, 해당 Intermediate 만 폐기(revoke)하면 피해를 차단할 수 있다.
또한 다양한 정책을 가진 Intermediate CA 들이 존재 가능(e.g. EV 인증, Wildcard 인증 등 목적별로 분리)하며,
Intermediate CA 는 더 자주 갱신 가능하고, 만료되더라도 루트를 변경할 필요 없기 떄문에 유지보수에도 용이하다. 즉, Intermediate CA 는 루트 키를 안전하게 보호하고, 운영 유연성을 확보하기 위한 보안 아키텍처의 핵심이다.

___[Self-signed certificate](https://en.wikipedia.org/wiki/Self-signed_certificate)___ 는 자기 자신이 서명한 인증서이다. 즉, 외부에서 검증할 수 있는 신뢰 체인(Trusted CA Chain)이 존재하지 않기 때문에 개발이나 테스트 환경에서만 사용해야 한다.
브라우저는 내장된 "신뢰 가능한 루트 목록"만 신뢰한다. Self-signed 는 Root 저장소에 없기 때문에
브라우저는 해당 인증서를 검증 불가로 간주한다. 또한 누구나 self-signed 인증서를 생성할 수 있으므로, 이를 허용하면 중간자 공격(Man-in-the-middle) 가능성이 높아진다.

![](/resource/wiki/security-signed-certificates/self-certificate.png)

### TLS Certificate Provisioning and Management

실제로 서버에서 사용할 TLS Server Certificate 는 신뢰할 수 있는 인증서 체인(fullchain)과 함께 구성해야 하며, 이 인증서는 공인 인증기관(CA) 으로부터 발급받아야 한다. 아래는 프로덕션 환경을 위한 전체 가이드이다.

__1. TLS 서버 인증서 생성 (CSR 생성 + CA 서명)__

- STEP1 - 개인키(private key)와 CSR 생성
  - tls-key.pem: 서버가 보관할 개인키
  - tls.csr: 인증기관(CA)에 제출할 인증서 서명 요청(CSR)
  - /CN=your.domain.com: 서버의 도메인 이름
```
openssl req -new -newkey rsa:2048 -nodes -keyout tls-key.pem -out tls.csr \
-subj "/CN=your.domain.com"
```

- STEP2 - CSR 을 인증기관(CA)에 제출
  - 신뢰할 수 있는 CA (예: Let's Encrypt, DigiCert, Sectigo 등)에 tls.csr 제출
  - 인증기관은 tls-cert.pem, intermediate.pem, root.pem 등을 반환

__2. fullchain.pem 생성__

아래 인증서를 하나로 연결한 fullchain.pem 을 생성

```
[서버 인증서] + [Intermediate CA] (+ [Root CA, optional])

cat tls-cert.pem intermediate.pem > fullchain.pem
```

__3. TLS 구성__

```go
tlsConfig := &tls.Config{
    Certificates: []tls.Certificate{
        tls.LoadX509KeyPair("config/fullchain.pem", "config/tls-key.pem"),
    },
}
```

대부분의 서버 (Nginx, Apache, TVC 포함)는 TLS 인증서로 fullchain.pem 과 tls-key.pem 을 함께 사용한다.
tls-key.pem 은 반드시 권한 제한(600)하고, KMS 또는 AWS Secrets Manager 등으로 보관하는 것도 고려해야 한다.

__Files__:
- tls-key.pem: 서버의 개인키. 절대 노출 금지
- tls-cert.pem:	서버 도메인에 발급된 인증서
- intermediate.pem: 발급한 CA의 체인 인증서
- fullchain.pem: tls-cert.pem + intermediate.pem 조합
- tls.csr: 인증서 요청용 파일 (CA 제출 후 폐기 가능)

__[TESLA Fleet Telemetry](https://github.com/teslamotors/fleet-telemetry)__:

![](/resource/wiki/security-signed-certificates/check_server_cert.png)
