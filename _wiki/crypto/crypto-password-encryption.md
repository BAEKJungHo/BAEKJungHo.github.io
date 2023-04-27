---
layout  : wiki
title   : How to avoid Rainbow table attacks in Password encryption
summary : 
date    : 2023-04-25 15:05:32 +0900
updated : 2023-04-25 15:15:24 +0900
tag     : crypto
toc     : true
comment : true
public  : true
parent  : [[/crypto]]
latex   : true
---
* TOC
{:toc}

## Rainbow Table Attacks And Salts

솔트(Salt)는 암호학에서 사용되는 용어로, 비밀번호와 같은 입력값을 해싱하여 생성된 해시 값을 보호하기 위해 추가되는 임의의 데이터이다. 일반적으로 비밀번호는 고정된 길이의 데이터이며, 해시 함수에 입력하면 항상 같은 해시값이 생성된다. 
이러한 해시값은 레인보우 테이블(Rainbow Table) 공격과 같은 공격 기법에 취약하다. 레인보우 테이블 공격은 미리 계산된 해시값을 사용하여 암호를 해독하는 공격 기법으로, 비밀번호에 대한 모든 가능한 해시값을 사전에 생성해 둔 테이블을 사용한다.
솔트는 이러한 공격 기법을 방지하기 위해 사용된다. 솔트는 입력값에 무작위로 추가되어 입력값이 변경되면 생성되는 해시값도 달라지도록 합니다. 따라서 같은 비밀번호를 입력하더라도 솔트 값이 다르면 다른 해시값이 생성되므로, 레인보우 테이블 공격을 방지할 수 있다. 
__솔트(Salt, Private key)는 일반적으로 해시 값(e.g 암호화된 패스워드)과 함께 저장되며, 이를 사용하여 비밀번호를 검증할 때에도 함께 사용된다.__ 비밀번호 검증 시 입력된 비밀번호에 저장된 솔트 값을 추가하여 해싱한 후, 저장된 해시값과 비교합니다. 이렇게 함으로써 보다 안전한 방식으로 비밀번호를 보호할 수 있다.

Member Table 에 __encoded password__ 와 __saltKey__ 를 관리한다.

## Password Encryption with PBEKeySpec

[PBEKeySpec](https://docs.oracle.com/javase/8/docs/api/javax/crypto/spec/PBEKeySpec.html) is a class in Java used for generating a key from a password using a __Password-Based Key Derivation Function__(PBKDF).

__Constructor:__

```
PBEKeySpec(char[] password, byte[] salt, int iterationCount, int keyLength)
```

The iteration count is the number of times that the password is hashed during the derivation of the symmetric key. The higher number, the more difficult it is to validate a password guess and then derive the correct key.

```kotlin
import java.security.SecureRandom
import java.util.*
import javax.crypto.SecretKeyFactory
import javax.crypto.spec.PBEKeySpec

/**
 * @param password User/Member Passwords
 * @param saltKey Managed at Database (e.g Member Table)
 */
fun encryptPassword(password: String, saltKey: String): String {
    val spec = PBEKeySpec(password.toCharArray(), saltKey.toByteArray(), 10000, 512)
    val factory = SecretKeyFactory.getInstance("PBKDF2WithHmacSHA512")
    val secretKey = factory.generateSecret(spec)
    val hash = secretKey.encoded
    return Base64.getEncoder().encodeToString(hash)
}
```

[PKCS #5: Password-Based Cryptography Specification Version 2.0](https://www.rfc-editor.org/rfc/rfc2898)

## Why encode one more time with Base64

해시값을 Base64로 인코딩하는 이유는, 일반적으로 해시 함수는 이진 데이터를 출력하기 때문에, 이진 데이터를 다루기 불편한 텍스트 기반의 환경에서는 이진 데이터를 표현하기 적합한 텍스트 형식으로 변환하기 위함이다.
텍스트로 변환된 문자열은 이렇게 변환된 문자열은 텍스트 기반의 프로토콜에서 전송이 가능하고, 문자열로 다루기 쉽기 때문에, 이진 데이터를 다루기 어려운 상황에서 자주 사용된다.

예를 들어, 암호화된 비밀번호를 데이터베이스에 저장할 때, 일반적으로는 해시 함수를 사용하여 암호화된 비밀번호를 생성하고, 이를 이진 형식으로 저장한다. 하지만 이진 형식의 암호화된 비밀번호는 데이터베이스에서 검색하기 어렵고, 다루기도 어렵기 때문에, __검색과 다루기에 용이한 Base64 문자열로 인코딩하여 저장할 수 있다__.

또한, 인코딩된 Base64 문자열은 텍스트 형태로 출력되기 때문에, 디버깅이나 로깅과 같이 민감한 정보를 다룰 때에도 이진 데이터보다 안전하게 사용될 수 있다.