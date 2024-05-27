---
layout  : wiki
title   : HMAC
summary : Hash Message Authentication Code
date    : 2024-05-15 22:57:32 +0900
updated : 2024-05-15 23:21:24 +0900
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

서버가 클라이언트로부터 요청을 받을때, 이 요청이 신뢰할 수 있는지 확인하기 위해서 __HMAC(Hash Message Authentication Code)__ 을 사용한다.

예를들어, 특정 파라미터를 받아서 단순히 검증 여부를 확인하고 아무런 데이터를 응답하지 않는 API 의 경우에는 클라이언트가 신뢰할 수 있는 요청을 보냈는지에 대한 검증 필요성이 낮지만, 만약 특정 페이로드를 받아서 데이터를 저장하거나, 정보를 조회하여 응답해주는 경우에는 __신뢰할 수 있는 요청인지에 대한 검증__ 을 해야 한다.

HMAC 을 사용한 인증 방식은 다음과 같다.

![](/resource/wiki/auth-hmac/hmac.png)

1. 동일한 secretKey 를 서버와 클라이언트가 나눠 갖는다.
2. 클라이언트는 해시 알고리즘(e.g SHA-256)과 SecretKey 를 활용하여 특정 메시지를 해시한다.
3. 클라이언트는 서버로 x-gw-signature 등의 헤더키와 암호화된 메시지를 헤더에 담아서, 데이터와 함께 전송한다.
4. 서버는 클라이언트로 전달받은 해시값과, 클라이언트로 전달 받은 데이터를 해시 알고리즘(e.g SHA-256)과 SecretKey 를 활용하여 특정 메시지를 해시하여 비교한다.
5. 두 값이 같은 경우에 정상 요청으로 간주한다.

JDK APIs 를 이용하여 다음과 같이 구현할 수 있다.

```java
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;

public class HMACUtil {

    public static String initialize(String algorithm, String data, String key)
        throws NoSuchAlgorithmException, InvalidKeyException {
        SecretKeySpec secretKeySpec = new SecretKeySpec(key.getBytes(), algorithm);
        Mac mac = Mac.getInstance(algorithm);
        mac.init(secretKeySpec);
        return bytesToHex(mac.doFinal(data.getBytes()));
    }
    
    public static String bytesToHex(byte[] hash) {
        StringBuilder hexString = new StringBuilder(2 * hash.length);
        for (byte h : hash) {
          String hex = Integer.toHexString(0xff & h);
          if (hex.length() == 1)
            hexString.append('0');
          hexString.append(hex);
        }
        return hexString.toString();
    }
}
```

테스트 코드는 다음과 같다.

```java
@Test
public void hmacTest() throws NoSuchAlgorithmException, InvalidKeyException {
    String hmacSHA256Value = "5b50d80c7dc7ae8bb1b1433cc0b99ecd2ac8397a555c6f75cb8a619ae35a0c35";
    String hmacSHA256Algorithm = "HmacSHA256";
    String data = "hoxy";
    String key = "123456";

    String result = HMACUtil.initialize(hmacSHA256Algorithm, data, key);

    assertEquals(hmacSHA256Value, result);
}
```

### Guarantee of Integrity

- __[TIP 1]__ 어떤 요청이 중간에 해커에게 가로채어져서 변조되었다면, 이 요청은 '무결성'이 보장되지 않았다고 한다. 요청의 전체 메세지에 대한 무결성을 보장하고 싶다면 요청 내용의 전문을 가지고 hash 를 생성하는 것이 좋다.
- __[TIP 2]__ 실제 클라에서 정상적으로 생성된 hash 를 해커가 그대로 재사용하는 것을 막기 위해 hash 를 생성할 때 timestamp 를 포함하는 것이 좋다.

## Links

- [RFC2104](https://www.rfc-editor.org/rfc/rfc2104.txt)
- [Naver Cloud Platform](https://api.ncloud-docs.com/docs/busines-application-workplace-emp-v2)
- [What is HMAC Authentication and why is it useful?](https://www.wolfe.id.au/2012/10/20/what-is-hmac-authentication-and-why-is-it-useful/)
- [Coupang HMAC Signature 생성 + API 요청 예제](https://developers.coupangcorp.com/hc/ko/articles/360033461914-HMAC-Signature-%EC%83%9D%EC%84%B1)
- [Online HMAC Generator / Tester Tool](https://codebeautify.org/hmac-generator)
- [Hash-based message authentication codes (HMAC)](https://cryptography.io/en/latest/hazmat/primitives/mac/hmac/)
- [HMAC 인증이란 ? - REST API 의 보안](https://haneepark.github.io/2018/04/22/hmac-authentication/)
- [Java HMAC - Baeldung](https://www.baeldung.com/java-hmac)