---
layout  : wiki
title   : Aspect Oriented Programming (작성중)
summary : 
date    : 2022-03-16 19:45:32 +0900
updated : 2022-03-16 20:15:24 +0900
tag     : spring proxy
toc     : true
comment : true
public  : true
parent  : [[/spring]]
latex   : true
---
* TOC
{:toc}

## Aspect Oriented Programming

__Pre-knowledge for learning Spring AOP:__
- [Proxy Pattern]
- [Decorator Pattern]
- [Dynamic Proxy]
- [Code Generator Library, CGLIB]

AOP 는 [Aspect Oriented Programming with Spring Docs](https://docs.spring.io/spring-framework/docs/current/reference/html/core.html#aop) 읽는게 가장 최고인것 같다. 당장 Aspect 라는 개념을 알고 싶으면 ChatGPT 보다도 Docs 가 짱이다.

__Aspect:__
- A modularization of a concern that cuts across multiple classes. Transaction management is a good example of a crosscutting concern in enterprise Java applications.

위 내용만 봐도 Aspect 가 관심사를 모듈화한 형태라는 것을 알 수 있고, Transaction Management 가 AOP 를 사용한다는 것을 알 수 있다.

## Transaction

- [Steady-Coding Transaction 사용 방법](https://steady-coding.tistory.com/610) 해당 블로그가 정리 되게 잘 되어있음