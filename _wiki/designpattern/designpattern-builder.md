---
layout  : wiki
title   : BUILDER
summary : 
date    : 2025-02-02 11:28:32 +0900
updated : 2025-02-02 12:15:24 +0900
tag     : designpattern
toc     : true
comment : true
public  : true
parent  : [[/designpattern]]
latex   : true
---
* TOC
{:toc}

## BUILDER

Builder is a creational design pattern that lets you construct complex objects step by step.

### Design Principles

__Structure__:

![](/resource/wiki/designpattern-builder/builder.png)

- Separate the construction of a complex object from its representation so that the same construction process can create different representations.

### DataSource Examples

예를 들어 커넥션 설정 하는 경우를 생각해보자. 이 경우, user, password, url, hostName, databaseName, port 등 다양한 속성을
생성자의 파라미터로 받거나 setter 를 제공하여 객체를 생성할 수 있다.

이 경우 다음과 같은 문제가 존재한다.
- 특정 속성이 설정되기 위해서 다른 속성에 의존하는 경우 (즉, 순서에 의존하는 경우)
- 객체지향 프로그래밍에서 캡슐화 특성에 대한 정의에 따르면, 내부 데이터는 접근 권한 제어를 통해 숨겨져야 하며, 외부에서는 클래스에서 제공하는 제한된 인터페이스를 통해서만 내부 데이터에 접근할 수 있어야 한다. 따라서 노출해서는 안 되는 setter 메서드를 노출하는 것은 객체지향 프로그래밍의 캡슐화 특성을 명백하게 위반하고 있는 것이다. 이러한 데이터는 어떤 코드도 마음대로 수정할 수 있으며 결국 절차적 프로그래밍 스타일로 퇴화된다.

```kotlin
data class ConnectionConfig private constructor(
    val user: String,
    val password: String,
    val url: String?,
    val hostName: String?,
    val databaseName: String?,
    val port: Int?
) {
    class Builder {
        private var user: String? = null
        private var password: String? = null
        private var url: String? = null
        private var hostName: String? = null
        private var databaseName: String? = null
        private var port: Int? = null

        fun user(user: String) = apply { this.user = user }
        fun password(password: String) = apply { this.password = password }
        fun url(url: String) = apply { 
            this.url = url 
            this.hostName = null // url이 설정되면 hostName을 비활성화
        }
        fun hostName(hostName: String) = apply { 
            if (this.url != null) {
                throw IllegalStateException("URL이 설정되면 hostName을 설정할 수 없습니다.")
            }
            this.hostName = hostName 
        }
        fun databaseName(databaseName: String) = apply { this.databaseName = databaseName }
        fun port(port: Int) = apply { 
            require(port in 1024..65535) { "포트 번호는 1024~65535 사이여야 합니다." }
            this.port = port 
        }

        fun build(): ConnectionConfig {
            // 필수 필드 검증
            requireNotNull(user) { "user는 필수 값입니다." }
            requireNotNull(password) { "password는 필수 값입니다." }
            require(url != null || hostName != null) { "url 또는 hostName 중 하나는 필수입니다." }
            
            return ConnectionConfig(user!!, password!!, url, hostName, databaseName, port)
        }
    }
}
```

빌더 클래스에서는 필수 항목, 의존성, 제약 조건에 대한 검증을 수행할 수 있다. 이 부분이 빌더 패턴을 사용해야하는 판단을 내릴 때 중요한 근거가 된다.
커넥션을 위한 객체(e.g 캐시를 위한 객체) 등 특정 객체를 구성함에 있어서 객체를 구성할 때 필요한 __매개변수의 유효성 검사__ 를 위해서 빌더 패턴을 사용할 수 있다.
생성자와 Setter 를 사용하는 경우에는 생성자에서는 필수 유효성을 검사할 수 있지만, setter 를 추가 제공해야 한다.

__Client__:

```kotlin
fun main() {
    // URL 을 이용한 커넥션 설정
    val connection1 = ConnectionConfig.Builder()
        .user("admin")
        .password("securePassword")
        .url("jdbc:mysql://example.com:3306/dbname")
        .build()
    
    // HostName 과 Port 를 이용한 커넥션 설정
    val connection2 = ConnectionConfig.Builder()
        .user("admin")
        .password("securePassword")
        .hostName("example.com")
        .databaseName("myDB")
        .port(3306)
        .build()
}
```

___[FACTORY](https://klarciel.net/wiki/designpattern/designpattern-factory/)___ 와의 차이점은, 팩터리는 인터페이스를 상속하는 연관된 비슷한 유형의 객체를 만들때 사용하며
___BUILDER___ 는 동일 유형의 복잡한 객체를 생성할 때 사용한다.

## References

- Gangs of Four Design Patterns
- 设计模式之美 / 王争
