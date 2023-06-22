---
layout  : wiki
title   : Mockk, SpringMockk, Mokito-Kotlin
summary : 
date    : 2023-06-12 15:54:32 +0900
updated : 2023-06-12 20:15:24 +0900
tag     : kotlin spring
toc     : true
comment : true
public  : true
parent  : [[/kotlin]]
latex   : true
---
* TOC
{:toc}

## Mockk

[Mockk](https://mockk.io/) is mocking library for Kotlin.

## SpringMockk

Mockk supports spring. Use springmockk. - [Spring Boot Kotlin tutorial](https://spring.io/guides/tutorials/spring-boot-kotlin/).

Kotlin Coroutines 와 Spring WebFlux 를 사용하여 API 테스트 코드를 작성하는 경우 [springmockk](https://github.com/Ninja-Squad/springmockk) 만 있으면 된다.
Springmockk 는 Mockito 를 대체하므로 아래와 같이 mockito-core 를 exclude 해야 한다.

```
testImplementation("org.springframework.boot:spring-boot-starter-test") {
    exclude(module = "mockito-core")
}
```

## Mockito Kotlin

[Mockito-kotlin(https://github.com/mockito/mockito-kotlin) is Mockito 를 Kotlin 에서 사용할 수 있도록 해준 라이브러리.