---
layout  : wiki
title   : HMAC
summary : Hash Message Authentication Code
date    : 2022-05-29 22:57:32 +0900
updated : 2022-05-29 23:21:24 +0900
tag     : auth hash crypto
toc     : true
comment : true
public  : true
parent  : [[/auth]]
latex   : true
---
* TOC
{:toc}

## HMAC

> HMAC 은 해시 메시지 인증코드(keyed-hash message authentication code)의 준말로써 RFC2104 표준 암호화 프로토콜이다.
> 
> RFC2104  로 발표된 MAC 기술의 일종으로, 원본 메시지가 변하면 그 해시값도 변하는 해싱(Hashing)의 특징을 활용하여 메시지의 변조 여부를 확인(인증) 하여 무결성과 기밀성을 제공하는 기술이다.
> 
> SHA-2, SHA-3 등의 암호화 해시 함수는 HMAC 연산을 위해 사용할 수 있으며, 주로 HMAC-SHA256 을 사용한다.
> 
> HMAC 의 암호화 등급은 그 기반이 되는 해시 함수의 암호화 등급, 해시 출력의 크기, 키의 크기와 품질에 따라 달라진다.
>
> HMAC 은 메시지를 암호화하지 않는다. 그 대신, 메시지의 암호화 여부에 관계 없이 메시지는 HMAC 해시와 함께 송신되어야 한다. 
> 
> __기밀 키(secret-key)를 가진 쌍방은 스스로가 다시 메시지를 해싱하게 되며 진본인 경우 수신 후 연산되는 해시가 일치하게 된다.__
> 
> 즉, HMAC 은 해시 암호 키를 송신자와 수신자가 미리 나눠가지고 이를 사용한다는 것이며, 송수신 자만 공유하고 있는 키와 원본 메시지를 혼합하여 해시값을 만들고 이를 비교하는 방식이다.

![](/resource/wiki/auth-hmac/hmac.png)

## OpenAPI

네이버, 쿠팡 등 다양한 대기업의 OpenAPI 에서 HMAC 을 사용한다.

| Header  | Description  |
|----------------|-----------|
| x-ncp-apigw-timestamp | 1970년 1월 1일 00:00:00 협정 세계시(UTC)부터의 경과 시간을 밀리초(Millisecond)로 표현, API Gateway 서버와 시간 차가 5분 이상 나는 경우 유효하지 않은 요청으로 간주    |
| x-ncp-iam-access-key | 네이버 클라우드 플랫폼 포털 또는 Sub Account에서 발급받은 Access Key ID      |
| x-ncp-apigw-signature-v2 | 위 예제의 Body를 Access Key ID와 맵핑되는 Secret Key로 암호화한 서명, HMAC 암호화 알고리즘은 HmacSHA256 사용  |

## Links

- [RFC2104](https://www.rfc-editor.org/rfc/rfc2104.txt)
- [FIPS PUB 198-1, The Keyed-Hash Message Authentication Code (HMAC)](https://csrc.nist.gov/csrc/media/publications/fips/198/1/final/documents/fips-198-1_final.pdf)
- [Naver Cloud Platform](https://api.ncloud-docs.com/docs/busines-application-workplace-emp-v2)
- [Coupang HMAC Signature 생성 + API 요청 예제](https://developers.coupangcorp.com/hc/ko/articles/360033461914-HMAC-Signature-%EC%83%9D%EC%84%B1)
- [Online HMAC Generator / Tester Tool](https://codebeautify.org/hmac-generator)
- [Hash-based message authentication codes (HMAC)](https://cryptography.io/en/latest/hazmat/primitives/mac/hmac/)