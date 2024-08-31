---
layout  : wiki
title   : JWT
summary : 
date    : 2022-06-01 22:57:32 +0900
updated : 2022-06-01 23:21:24 +0900
tag     : auth jwt
toc     : true
comment : true
public  : true
parent  : [[/auth]]
latex   : true
---
* TOC
{:toc}

## JWT

___[JWT(JSON Web Token)](https://datatracker.ietf.org/doc/html/rfc7519)___ 는 클라이언트와 서버, 서버와 서버 사이 통신시 권한 인가(Authorization) 및 인증(Authentication)을 위해 사용되는 JSON 형식의 웹 토큰이다.

> Abstract
>
> JSON Web Token (JWT) is a compact, URL-safe means of representing
claims to be transferred between two parties.  The claims in a JWT
are encoded as a JSON object that is used as the payload of a JSON
Web Signature (JWS) structure or as the plaintext of a JSON Web
Encryption (JWE) structure, enabling the claims to be digitally
signed or integrity protected with a Message Authentication Code
(MAC) and/or encrypted.

__Background__:

___[JWT](https://brunch.co.kr/@jinyoungchoi95/1)___ 가 나오기 전에는, 세션 기반 인증 방식을 주로 사용했다. 인증을 위한 정보를 서버에 저장하고 인증할 때마다 DB 와 통신을 해야하기 때문에, 성능에 대한 부담이 존재했다.
JWT 는 인증 저장 방식을 서버가 아닌 클라이언트에게 위임하여 처리하도록 설계되었기 때문에, 세션 기반 인증 방식보다 빠른 응답 속도를 자랑한다.

### Structures

__Structures__:

```
HEADER.PAYLOAD.SIGNATURE
```

헤더(Header), 페이로드(Payload), 서명(Signature) 세 부분을 점(.)으로 구분하는 구조다.

__Header__:

헤더(Header)는 JWT 를 어떻게 검증(Verify)하는가에 대한 내용을 담고 있다.

다음 JOSE(Javascript Object Signing and Encryption) Header 는 인코딩된 개체가 JWT 를 의미하며, JWT 는 ___[HMAC SHA-256](https://baekjungho.github.io/wiki/auth/auth-hmac/)___ 을 사용하여 MAC 에 연결된 JWS 이다.

```json
{
  "typ":"JWT",
  "alg":"HS256"
}
```

- __alg__
  - 서명 암호화 알고리즘
  - Ex. HMAC SHA256, RSA ... 
- __typ__
  - 토큰 유형

__Payload__:

JWT 에 담길 내용이다. 페이로드(Payload)에 있는 속성들을 클레임 셋(Claim Set)이라 부른다. 클레임 셋은 클라이언트와 서버 간 주고 받기로 한 값들이 들어있다.

```json
{
  "sub": "identifier-uuid-format",
  "aud": "xxx-service-code",
  "nbf": 1724811404,
  "scope": [
    "openid",
    "email",
    "profile"
  ],
  "iss": "https://account.domain.com",
  "exp": 1724897804,
  "iat": 1724811404,
  "jti": "X8v8924aq8d28c1x9v1o367g892d69528"
}
```

페이로드는 Registered claims, Public claims, Private claims 로 나뉜다.

![](/resource/wiki/auth-jwt/claims.png)

- __Registered claims__
  - iss(issuer): 토큰 발행자
  - exp(expiration time): 토큰 만료 시간
  - sub(subject): 사용자에 대한 식별 값
  - iat(issued At): 토큰 발행 시간
  - jti(JWT ID): JWT 토큰 식별자; issuer 가 여러명일 때 구분하기 위함
  - aud(audience): 토큰 대상자
  - nbf(not before): 토큰 활성 날짜
- __Public claims__
  - 사용자가 정의할 수 있는 클레임 공개용 정보 전달을 위해 사용
- __Private claims__
  - 해당하는 당사들 간에 정보를 공유하기 위해 만들어진 사용자 지정 클레임
  - 외부에 공개되도 상관 없으며, 해당 유저를 특정할 수 있는 정보를 담음

Registered claims 에 있는 항목 모두를 포함할 필요는 없다. ___sub___ 는 필요하다.

__Signature__:

점(.)을 구분자로 해서 헤더와 페이로드를 합친 문자열을 서명한 값이다. 서명은 헤더의 alg 에 정의된 알고리즘과 비밀 키를 이용해 생성하고 Base64 URL-Safe 로 인코딩한다.

```idle
HMACSHA256(
  base64UrlEncode(header) + "." + base64UrlEncode(payload),
  secret-key
)
```

페이로드를 헤더와 같이 비밀키로 해시하여 생성했을때의 장점은 페이로드가 조작되어도 헤더와 같이 서명되어있기 때문에 보안이 좋다는 것이다.
헤더와 페이로드는 단순히 인코딩된 값이라 제 3자가 복호화 및 조작이 가능하다. 하지만 Signature 는 서버에서 관리하는 비밀키(secret key)가 유출되지 않는 이상 복호화할 수 없다. 따라서 Signature 는 토큰의 위변조 여부를 확인하는데 사용된다.

## Base64 URL-Safe

Base64 는 이진(8bit) 데이터를 문자 코드에 영향을 받지 않는 공통 ASCII 영역의 문자들로 바꾸는 인코딩 방식을 의미한다. Base64 를 사용하는 이유는 바이너리 데이터를 텍스트 기반 규격으로 다룰 수 있기 때문이다.
Base64 로 인코딩 하면 UTF-8 과 호환 가능한 문자열을 얻을 수 있다. 
Base64 로 인코딩한 데이터는 크기가 약 30% 정도 증가한다.

Base64 URL-Safe 인코딩은 기본 Base64 인코딩에서 '+'(plus)는 '-'(minus)로, '/'(slash)는 '_'(underscore)로 대체된 인코딩 방법이다. 즉, URL 주소에서 사용할 수 없는 문자들을 치환해서 사용하는 것이다.

따라서, JWT 는 설계 의도대로 URL, Cookie, Header 등 어디에서도 사용될 수 있다.

## JWS, JWE, JWA

JWT 는 추상 클래스(Abstract Class)이며, JWS 와 JWE 는 구체 클래스(Concrete Class)라 할 수 있다. 
JWK(JSON Web Key)는 JSON 형식으로 암호화 키를 표현한 것이며, JWA(JSON Web Algorithm)은 JWS, JWE, JWK 에 사용하는 알고리즘에 대한 명세를 의미한다.

### JWS

일반적으로 사용하는 대부분의 JWT 가 ___[JWS](https://datatracker.ietf.org/doc/html/rfc7515)___ 에 해당된다. JWT 의 구조(Header.Payload.Signature) 는 JWS 의 직렬화 방법중 하나인 ___[Compact Serialization](https://datatracker.ietf.org/doc/html/rfc7515#section-3.1)___ 형식으로 직렬화 한 것이다.

___즉, JWT 는 JWS Compact Serialization 으로 직렬화한 문자열을 의미한다.___

```idle
In the JWS Compact Serialization, a JWS is represented as the
   concatenation:

      BASE64URL(UTF8(JWS Protected Header)) || '.' ||
      BASE64URL(JWS Payload) || '.' ||
      BASE64URL(JWS Signature)
```

### JWE

___[NHN Cloud Toast Meetup](https://meetup.toast.com/posts/239)___ 글에서, ___[JWE](https://datatracker.ietf.org/doc/html/rfc7516)___ 는 이름에서 알 수 있듯이 데이터를 암호화하는 것인데, 우리는 일반적으로 통신 시 구간 암호화가 필요하면 TLS(Transport Layer Security)를 사용하고 있기 때문이라고 한다.

__JWE Compact Serialization__:

```idle
In the JWE Compact Serialization, a JWE is represented as the
  concatenation:

      BASE64URL(UTF8(JWE Protected Header)) || '.' ||
      BASE64URL(JWE Encrypted Key) || '.' ||
      BASE64URL(JWE Initialization Vector) || '.' ||
      BASE64URL(JWE Ciphertext) || '.' ||
      BASE64URL(JWE Authentication Tag)
```

## AuthN/Z Service

인증 서비스의 경우에는 최대한 빠른 응답을 내줘야 하는데, http 프로토콜을 사용한다면 병목 지점이 될 수 있어, gRPC 를 활용하여 마이크로서비스간 통신의 복잡도를 낮추고 커뮤니케이션 비용을 줄이는 것이 좋다.

인증 서비스를 구축한다고 했을때 핵심 포인트는 `빠른 응답 속도`와 `보안` 이라고 생각한다.

## Links

- [RFC 8725. JSON Web Token Best Current Practices](https://datatracker.ietf.org/doc/html/rfc8725)
- [Javascript Object Signing and Encryption(JOSE)](https://jose.readthedocs.io/en/latest/)
- [Draft Jones Json Web Token](https://openid.net/specs/draft-jones-json-web-token-07.html)
- [Token Best Practices](https://auth0.com/docs/secure/tokens/token-best-practices)