---
layout  : wiki
title   : Trustworthy Conversations in the Digital Worlds
summary : Certificate Authority, Public Key Infrastructure, Asymmetric Cryptography
date    : 2024-08-25 12:57:32 +0900
updated : 2024-08-25 13:21:24 +0900
tag     : auth ca mobility crypto pki
toc     : true
comment : true
public  : true
parent  : [[/auth]]
latex   : true
---
* TOC
{:toc}

## Trustworthy Conversations in the Digital Worlds

클라이언트와 서버간의 정보를 교환하는데 있어서, 클라이언트는 내가 보내는 정보가 ___안전___ 하게 ___인증된___ 서버로 전달되길 원할 것이다.
예를 들어 amazon 에서 물품을 구매하려고 한다. 이때 나의 브라우저가 올바른 amazon 서버에 연결되었는지 인증해야 하며, 내가 amazon 으로 보내는 모든 정보(민감 정보 등)는 암호화가 되어야 한다.

안전하게 통신하기 위해서는 데이터가 ___암호화(encryption)___ 되어야 하며, 통신하는 상대가 ___인증(authentication)___ 되어야 한다.

인증된 서버인지 알기 위해서는 ___인증서(certificates)___ 가 필요하며 ___[디지털 인증서(Digital Certificates, Public key certificates)](https://en.wikipedia.org/wiki/Public_key_certificate)___ 라고 부른다.
디지털 인증서는 ___[인증 기관(CA, Certificate Authority)](https://en.wikipedia.org/wiki/Certificate_authority)___ 에 의해 발급된다. 인증서에는 공캐키와 공개키의 정보, 인증서 소유자 신원에 대한 정보, 인증서를 검증한 발급자에 대한 정보, CA 의 ___[Digital Signature](https://en.wikipedia.org/wiki/Digital_signature)___ (데이터의 무결성을 보장) 를 담고 있다.
여기에 담겨있는 공개키(public key)로 데이터를 암호화하여 전달한다.

Certificate authorities are what make the whole PKI system trustworthy.

인증서 형식의 표준이 되는 것이 ___[X.509](https://en.wikipedia.org/wiki/X.509)___ 이다. X.509 certificates bind an identity to a public key using a digital signature.
X.509 디지털 인증서의 유형중 하나에 ___[SSL/TLS 웹사이트 보안 인증서(HTTPS 인증서)](https://en.wikipedia.org/wiki/Public_key_certificate)___ 가 있다.

__Certificate filename extensions__:

| Extensions | Description                                                                                                                                                           |
| ---------- |-----------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| .pem       | Privacy-enhanced Electronic Mail 이라고 하며, 암호화 키, 인증서, 기타 데이터를 저장하기 위한 Base64 로 인코딩된 파일 형식을 의미한다. `-----BEGIN CERTIFICATE----- and -----END CERTIFICATE-----` 형식의 파일이다. |
 | .cer, .crt | .cer 은 주로 Windows 운영 체제에서 사용된다. .crt 는 로 Unix/Linux 기반 시스템에서 사용된다. 둘 다 바이너리 DER 형식이나 Base64로 인코딩된 PEM 형식 모두 가능하다. |

Website Security certificate is a digital stamp of approval from Certificate Authority.

즉, <mark><em><strong>디지털 세계에서 데이터를 보호하고 자신을 인증하는 데 사용하는 암호화 기술, 정책 및 절차의 조합</strong></em></mark> 을 ___[PKI(Public Key Infrastructure)](https://en.wikipedia.org/wiki/Public_key_infrastructure)___ 라고 한다.
PKI 체계에서 인증서 발급자는 CA 이다.

PKI 이름에서 유추할 수 있듯이, 공개키 암호화 방식을 사용한다. 공개키를 사용한 암호화 방식을 ___[Asymmetric Cryptography](https://baekjungho.github.io/wiki/crypto/crypto-asymmetric-cryptography/)___ 이라고 한다.
이와 반대되는 것이 ___[대칭 키 암호화(Symmetric Key Encryption)](https://en.wikipedia.org/wiki/Symmetric-key_algorithm)___ 인데, 동일한 키를 암호화와 복호화에 사용하는 암호화 방식이며 비대칭 암호화보다 보안 수준이 낮다.

![](/resource/wiki/auth-certificate-authority/asymmetric-encryption.png)

공개키는 개인키 소유자와 안전하게 통신하기 위해서 개인 및 조직에 제공될 수 있으며, 안전하게 보관되어야 한다. 공개 키로 암호화된 메시지는 개인키로만 해독하고 읽을 수 있다.

__[How to PKI Works](https://www.thesslstore.com/blog/how-pki-works/)__:

![](/resource/wiki/auth-certificate-authority/pki-works.png)

### V2X

V2V, V2X 통신에서 개방형 커뮤니케이션 채널은 악의적인 행위자에게 차량 시스템에 침투할 수 있는 기회를 제공한다. 해커는 전송되는 데이터를 가로채고 조작하여 중요한 안전 기능을 손상시키고 원격으로 차량을 제어할 수도 있다.
따라서 Connected Vehicles 에서 Digital Certificates 의 역할은 더 중요해지고 있다.

___[ZERO TRUST](https://en.wikipedia.org/wiki/Zero_trust_security_model)___ "절대 신뢰하지 말고 항상 확인하라"는 접근 방식을 채택하여 디지털 인증서 와 암호화 키를 통한 인증을 요구해야 한다.

차량은 이동하므로 차량이 항상 이터넷에 연결되긴 힘들기 때문에 차량이 ___[인증 기관(CA, Certificate Authority)](https://en.wikipedia.org/wiki/Certificate_authority)___ 과의 통신과 관련된 잠재적인 문제에 노출될 수 있다.
PKI 를 통해 자동차 제조업체와 OEM 은 ___[V2X](https://baekjungho.github.io/wiki/mobility/mobility-v2x/)___ 통신에서 인증과 암호화를 모두 달성할 수 있다.

V2X PKI 는 개인에 의한 추적을 피하기 위해 자주 변경해야 하는 ITS(Intelligent Transportation System) Stations 에 대한 인증서 발급을 위해 CA 를 활용한다. 그러나 다음과 같은 V2X PKI 의 확장성 및 관레 대한 질문이 발생한다.

- 누가 CA 를 운영해야 하는가?
- ITS 스테이션은 어떠헥 안전하게 관리되고, 어떻게 등록되며 누가 운영하는가?
- 여러 CA 또는 심지어 다른 종류의 CA 를 특정 기관에서 운영해야 하는가? 심지어 이를 운영하도록 허용해야 하는가?
- ITS 스테이션은 PKI 에 어떻게 연결하는가?
- CA 에서 데이터를 수집하고 보호할 때 사용자 개인 정보가 어떻게 유지되는가?

PKI 의 보안, 특히 개인키의 보안 저장과 관련된 보안은 HSM(Hardware Security Modules) 또는 TPM(Trusted Platform Modules) 을 통해 해결해야 한다.
또한 중간자 공격을 막기 위해 인증서 고정(certificate pinning)을 사용해 암호화된 세션의 특정 노드에 대한 인증서를 고정해야 한다.
PKI 는 "순방향 비밀성" 을 통합해야 키가 손상되는 경우 해커가 과거 데이터 전송을 읽을 수 없다. 마지막으로 모든 작업에 대해 단일 키 접근 방식 대신 서로 다른 키를 사용해야 한다.

__Best Practices__:
- 개인정보보호를 위한 인증서의 익명화로 VIN 과 같은 항목이 키에 포함되지 않도록 한다.
- 차량 추적 및 사생활 침해를 방지하기 위해 키 수명이 짧아야 한다.
- 중복 인증서를 사용해야하고 5분동안 유효하며 30초 중복돼야 한다. 동일 인증서를 두 번 사용하지 않는다.
- 모든 차량에 적시에 CRL(Certificate Revocation List) 을 실시간으로 배포해 가짜 행위자를 제거할 수 있어야 한다.

BSM(Basic Safety Messages)의 지속적인 브로드캐스팅을 통한 V2V(Vehicle to Vehicle, 차량 대 차량) 통신은 모든 도로 충돌의 최대 75% 를 예방할 수 있다고 한다.
따라서 차량에 V2V 통신 장비 설치를 의무화 해야 한다.

## Links

- [Securing the Automotive Industry: The Role of Digital Certificates in Connected Vehicles](https://www.globalsign.com/en/blog/Securing-connected-cars-with-digital-certificates)
- [What is PKI? The Ultimate Guide to Public Key Infrastructure](https://venafi.com/machine-identity-basics/what-is-pki-and-how-does-it-work/)
- [Asymmetric Encryption: What It Is & Why Your Security Depends on It](https://www.thesslstore.com/blog/asymmetric-encryption-what-it-is-why-your-security-depends-on-it/)
- [Your Guide to How PKI Works & Secures Your Organization](https://www.thesslstore.com/blog/how-pki-works/)

## References

- Hacking Connected Cars: Tactics, Techniques, and Procedures / Alissa Knight