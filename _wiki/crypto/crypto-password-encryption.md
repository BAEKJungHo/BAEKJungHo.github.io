---
layout  : wiki
title   : Password Encryption
summary : How to avoid Rainbow table attacks in Password encryption
date    : 2024-08-13 15:05:32 +0900
updated : 2024-08-13 18:15:24 +0900
tag     : crypto owasp security argon
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
___솔트(Salt, Private key)는 일반적으로 해시 값(e.g 암호화된 패스워드)과 함께 저장되며, 이를 사용하여 비밀번호를 검증할 때에도 함께 사용된다.___ 비밀번호 검증 시 입력된 비밀번호에 저장된 솔트 값을 추가하여 해싱한 후, 저장된 해시값과 비교한다. 이렇게 함으로써 보다 안전한 방식으로 비밀번호를 보호할 수 있다.
saltKey 는 암호화된 패스워드와 별개의 컬럼으로 관리할 수도 있고, 암호화된 패스워드에 saltKey 를 포함시킬 수도 있다. 자세한 내용은 아래 Argon2 파트에서 다룬다.

## Security Issues

![](/resource/wiki/crypto-password-encryption/kakaopay-1.png)

Kakaopay 의 위와 같은 이슈로 인해 다시 한번 보안에 대해 신경쓰게된 계기가 되었다. ___[X](https://x.com/simnalamburt/status/1824014092455104833?s=46&t=uYvEBsZQWNLb4Yt6QM2TcQ)___ 도 읽어보면 좋다.

## Algorithms

패스워드 저장에 적합한 해시 알고리즘들은 다음과 같다.

- ___[Bcrypt](https://en.wikipedia.org/wiki/Bcrypt)___: 현재 가장 널리 사용되는 알고리즘 중 하나로, 솔트(salt)가 내장되어 있어 레인보우 테이블 공격에 강하다.
- ___[Argon2](https://en.wikipedia.org/wiki/Argon2)___: 비교적 최근에 개발된 알고리즘으로, 메모리 하드 함수를 사용하여 높은 보안성을 제공한다.
- ___[PBKDF2(Password-Based Key Derivation Function 2)](https://en.wikipedia.org/wiki/PBKDF2)___: 반복 횟수를 조절할 수 있어 시간이 지나도 보안 강도를 유지할 수 있다.
- ___[Scrypt](https://en.wikipedia.org/wiki/Scrypt)___: 메모리 사용량과 CPU 시간을 동시에 요구하여 병렬 공격에 강하다.

OWASP 에서 제공하는 ___[Password Storage Cheatsheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)___ 에서도 Argon2Id 를 사용하도록 권고하고 있다. SHA-512 에 비해 ___[Memory-hardness](https://en.wikipedia.org/wiki/Memory-hard_function)___, Varients 를 가지고 있어 적합하다.
OWASP 권고사항이므로 보안감사에서도 큰 문제가 없을 것으로 예상된다.

![](/resource/wiki/crypto-password-encryption/recommend.png)

### Password-Based Key Derivation Function

___[PBEKeySpec](https://docs.oracle.com/javase/8/docs/api/javax/crypto/spec/PBEKeySpec.html)___ is a class in Java used for generating a key from a password using a __Password-Based Key Derivation Function__(PBKDF).

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
 * @param password Member Passwords
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

___[PKCS #5: Password-Based Cryptography Specification Version 2.0](https://www.rfc-editor.org/rfc/rfc2898)___

### Argon2

___[Hashing With Argon2 in Java](https://www.baeldung.com/java-argon2-hashing)___ 에 예제가 잘 나와있다. 여기 나와있는 예제는 Argon2 를 사용할때의 최소 설정사항을 충족시킨 예제이다.

__Dependency__:

```gradle
api("org.bouncycastle:bcpkix-jdk18on:1.78.1")
```

#### BouncyCastle

```kotlin
object Crypto {
    /**
     * Encryption by Argon2
     *   - Minimum configuration of 19 MiB of memory, an iteration count of 2, and 1 degree of parallelism
     *   - https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html
     */
    fun encode(password: String, salt: ByteArray): String {
        val builder = Argon2Parameters.Builder(Argon2Parameters.ARGON2_id)
            .withVersion(Argon2Parameters.ARGON2_VERSION_13)
            .withIterations(2)
            .withMemoryAsKB(66536)
            .withParallelism(1)
            .withSalt(salt)

        val generate = Argon2BytesGenerator()
        generate.init(builder.build())
        val result = ByteArray(32)
        generate.generateBytes(password.toByteArray(StandardCharsets.UTF_8), result, 0, result.size)
        return result
    }

    fun isMatchedPassword(password: String, encodedPassword: String, saltKey: ByteArray): Boolean {
        return encode(password, saltKey) == encodedPassword
    }

    fun generateSalt16Byte(): ByteArray {
        val secureRandom = SecureRandom()
        val salt = ByteArray(16)
        secureRandom.nextBytes(salt)
        return salt
    }

    // 해시 결과를 Base64 문자열로 변환
    fun encodeToString(bytes: ByteArray): String {
        return Base64.getEncoder().encodeToString(bytes)
    }
}
```

salt 값은 Entity 에 저장할때 Base64 로 Encode 하여 String 으로 저장해도되고, PostgreSQL 의 경우 BYTEA 타입으로 저장해도 된다.
암호화된 패스워드 결과값이 ByteArray 인 경우 String 으로 저장하고 싶으면 Base64 로 Encode 해야 한다.

해시값을 Base64 로 인코딩하는 이유는, 일반적으로 해시 함수는 이진 데이터를 출력하기 때문에, 이진 데이터를 다루기 불편한 텍스트 기반의 환경에서는 이진 데이터를 표현하기 적합한 텍스트 형식으로 변환하기 위함이다.
텍스트로 변환된 문자열은 이렇게 변환된 문자열은 텍스트 기반의 프로토콜에서 전송이 가능하고, 문자열로 다루기 쉽기 때문에, 이진 데이터를 다루기 어려운 상황에서 자주 사용된다.

예를 들어, 암호화된 비밀번호를 데이터베이스에 저장할 때, 일반적으로는 해시 함수를 사용하여 암호화된 비밀번호를 생성하고, 이를 이진 형식으로 저장한다. 하지만 이진 형식의 암호화된 비밀번호는 데이터베이스에서 검색하기 어렵고, 다루기도 어렵기 때문에, __검색과 다루기에 용이한 Base64 문자열로 인코딩하여 저장할 수 있다__.

또한, 인코딩된 Base64 문자열은 텍스트 형태로 출력되기 때문에, 디버깅이나 로깅과 같이 민감한 정보를 다룰 때에도 이진 데이터보다 안전하게 사용될 수 있다.

#### SpringSecurityCrypto

___[Spring Security Crypto Module](https://docs.spring.io/spring-security/reference/features/integrations/cryptography.html)___ 을 사용하면 saltKey 를 관리하기 위해 별도 컬럼을 두지 않아도 된다.

__Examples by SpringSecurityCrypto__:

```kotlin
object Crypto {
    private val encoder = Argon2PasswordEncoder(16, 32, 1, 60000, 2)
    
    fun encode(rawPassword: String): String = encoder.encode(rawPassword)
    
    fun isMatched(rawPassword: String, encodedPassword: String): Boolean
        = encoder.matches(rawPassword, encodedPassword)
}
```

___[Argon2PasswordEncoder](https://github.com/spring-projects/spring-security/blob/main/crypto/src/main/java/org/springframework/security/crypto/argon2/Argon2PasswordEncoder.java)___ 의 encode 메서드를 살펴보면 내부적으로 saltKey 를 생성한다.
그리고 Hash 된 결과는 아래와 같은 포맷을 따른다. _[Argon2Online](https://argon2.online/)_ 에서 암호화된 포맷을 확인할 수 있다.

__[Argon2 Encoding Spec](https://github.com/P-H-C/phc-winner-argon2/blob/master/src/encoding.c#L244)__:

``` 
// $argon2<T>[$v=<num>]$m=<num>,t=<num>,p=<num>$<bin>$<bin>
$argon2id$v=19$m=66536,t=2,p=1$FDaAfU/YTwS+rFMkGGKE5A$E4s3qxmfDyaDFDi+d6j4L/bVjLZv+wMFqjmqat+YdXI
```

Argon2PasswordEncoder 에서 제공하는 matches 메서드를 확인하면 암호화된 결과에서 saltKey 를 복호화하여 검증한다.
즉, 암호화된 결과를 단순 Base64 로 인코딩된 문자열로 저장하는 것이 아니라 아래 처럼 새로운 포맷을 하나의 문자열로 만들어 관리하면, saltKey 를 별도 컬럼으로 관리할 필요가 없어진다.

```
$알고리즘$각종스펙(메모리, 이터레이션, 병렬성 등)$Hash 된 Byte 배열을 Base64로 인코딩한 패스워드$Base64로 인코딩된 saltKey 
```

## Links

- [Comparative Analysis of Password Hashing Algorithms: Argon2, bcrypt, scrypt, and PBKDF2](https://guptadeepak.com/comparative-analysis-of-password-hashing-algorithms-argon2-bcrypt-scrypt-and-pbkdf2/)
- [Spring Security Password Storage](https://docs.spring.io/spring-security/reference/features/authentication/password-storage.html#authentication-password-storage-bcrypt)