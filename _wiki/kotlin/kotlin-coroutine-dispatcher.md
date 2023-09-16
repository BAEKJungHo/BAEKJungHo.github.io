---
layout  : wiki
title   : CoroutineDispatcher
summary : 
date    : 2023-09-14 20:54:32 +0900
updated : 2023-09-14 21:15:24 +0900
tag     : kotlin coroutine
toc     : true
comment : true
public  : true
parent  : [[/kotlin]]
latex   : true
---
* TOC
{:toc}

## CoroutineDispatcher

CoroutineDispatcher 는 코루틴이 실행되는 스레드를 결정한다.

- __Dispatchers.Default__
  - CPU 가 많은 작업을 수행하기에 적합
  - 아무 설정이 없다면 기본적으로 사용되는 Dispatcher 임
- __Dispatchers.IO__
  - 네트워크나 디스크 I/O 작업에 적합
- __Dispatchers.Main__
  - UI 작업에 적합
- __Java ExecutorService 를 Dispatcher 로 변환__
  - asCoroutineDispatcher() 확장 함수를 사용해 변환 가능
