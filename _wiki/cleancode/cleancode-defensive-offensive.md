---
layout  : wiki
title   : Defensive/Offensive Programming
summary : 
date    : 2023-01-13 16:01:32 +0900
updated : 2023-01-13 16:05:24 +0900
tag     : cleancode
toc     : true
comment : true
public  : true
parent  : [[/cleancode]]
latex   : true
---
* TOC
{:toc}

## Defensive/Offensive Programming

모든 가능성을 올바른 방식으로 처리하는 것을 __Defensive Programming__ 이라고 한다.
하지만 모든 상황을 안전하게 처리하기 힘들 수도 있다. 이때 __Offensive Programming__ 방법을 사용한다.
Kotlin 의 require, check 등을 활용하여 문제가 발생했을때 개발자에게 알려주는 방식이다.