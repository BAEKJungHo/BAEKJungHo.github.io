---
layout  : wiki
title   : Coroutines with WebFlux
summary : 
date    : 2023-06-14 15:54:32 +0900
updated : 2023-06-14 20:15:24 +0900
tag     : kotlin webflux
toc     : true
comment : true
public  : true
parent  : [[/kotlin]]
latex   : true
---
* TOC
{:toc}

## Coroutines with WebFlux

> [Spring Coroutines Docs](https://docs.spring.io/spring-framework/reference/languages/kotlin/coroutines.html) - Kotlin Coroutines are Kotlin lightweight threads allowing to write non-blocking code in an imperative way. On language side, suspending functions provides an abstraction for asynchronous operations while on library side kotlinx.coroutines provides functions like __async { }__ and types like __Flow__.

Kotlin Coroutines 와 WebFlux 를 사용하는 경우 위 공식 문서 읽는 것을 추천한다. __How Reactive translates to Coroutines?__ 에 대한 내용도 있다.