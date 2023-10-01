---
layout  : wiki
title   : Stratified Design
summary : 
date    : 2023-09-29 15:02:32 +0900
updated : 2023-09-29 15:12:24 +0900
tag     : architecture fp
toc     : true
comment : true
public  : true
parent  : [[/architecture]]
latex   : true
---
* TOC
{:toc}

## Stratified Design

계층형 설계(stratified design) 의 핵심은 __변경 가능성에 따라 코드를 나누는 것__ 이다.

[Clean Architecture](https://baekjungho.github.io/wiki/architecture/architecture-clean/) 를 알고 있으면 아래 내용을 이해하는데 도움이 된다.

변경 가능성을 크게 3가지로 구분해보자.

- 자주 바뀌는 것
- 가끔 바뀌는 것
- 자주 바뀌지 않는 것

자주 바뀌지 않는 것에는 __프로그래밍 언어에 대한 기능__ 들을 배치하는게 좋다. 예를 들면 배열, 객체 등.
가끔 바뀌는 것은 __도메인 규칙__ 을 정의해둔다. 자주 바뀌는 것은 Facade 를 생각하면 된다. 즉, __비지니스 규칙__ 을 정의한다.

이러한 계층형 설계의 장점은 테스트, 유지보수, 재사용이 쉽다는 것이다.

## References

- Grokking Simplicity / Eric Normand / Manning