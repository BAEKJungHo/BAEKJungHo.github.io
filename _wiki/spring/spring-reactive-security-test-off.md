---
layout  : wiki
title   : How to disable Spring Security Auto Configuration in Spring Webflux
summary : 
date    : 2023-09-02 09:28:32 +0900
updated : 2023-09-02 12:15:24 +0900
tag     : spring reactive
toc     : true
comment : true
public  : true
parent  : [[/spring]]
latex   : true
---
* TOC
{:toc}

## ReactiveSecurityAutoConfiguration

Spring Security Dependency 가 있는 경우 테스트를 수행하게 되면 인증된 사용자 Mocking Data 를 담아서 보내야 한다. 그렇지 않으면 401 UnAuthorized Error 가 발생한다.
Spring Security Dependency 를 제거하거나 __[ReactiveSecurityAutoConfiguration](https://docs.spring.io/spring-boot/docs/current/api/org/springframework/boot/autoconfigure/security/reactive/ReactiveSecurityAutoConfiguration.html)__ 를 Exclude 하여 401 UnAuthorized Error 를 피할 수 있다.

```kotlin
@WebFluxTest(
    controllers = [AuthController::class],
    excludeAutoConfiguration = [ReactiveSecurityAutoConfiguration::class]
)
class AuthControllerTest: AbstractControllerTest() { 
    // ...
}
```