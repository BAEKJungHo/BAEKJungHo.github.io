---
layout  : wiki
title   : Timeline Cutting
summary : 
date    : 2023-09-30 15:02:32 +0900
updated : 2023-09-30 15:12:24 +0900
tag     : fp
toc     : true
comment : true
public  : true
parent  : [[/functional]]
latex   : true
---
* TOC
{:toc}

## Timeline Cutting

Timeline Diagram 은 시간에 따라 어떤 Action 들이 일어나는지를 Diagram 으로 표현한 것이다.
분산 시스템을 이해하는데 도움이 되는 기술이다.

A - Z 까지의 Action 이 존재한다고 가정하다. A - Z 의 Action 들 중 일부는 __올바른 순서__ 가 보장되어야 한다.

분산 시스템인 Q1, Q2, Q3 가 A - C 까지의 작업을 동시에 할당받아서 처리한다고 가정하자. 어떤 것이 먼저 끝날지는 모른다. 이때 D 는 B 작업 이후에 실행되어야 한다고 가정하자.
A 가 먼저 끝나서 Q1 이 D 를 채간 경우에는 시스템에 문제가 생길 수 있다.

이때 사용하는 기술이 __Timeline Cutting__ 이다. Timeline Diagram 에 점선(cut) 을 긋는다. 점선은 모든 작업이 끝날 때 까지 진행하지 말라는 의미이다.

![](/resource/wiki/functional-timeline-cutting/timeline-cutting.png)

이때 실행 순서를 보장하는 방법은 [High-order Operation](https://baekjungho.github.io/wiki/kotlin/kotlin-first-citizen/#higher-order-functions) 을 사용한다.
__다른 함수를 매개변수로 받아들이거나__ 함수를 반환 값으로 사용하는 함수를 고차 함수라고 한다. Java 와 Kotlin 에서 다른 함수를 매개변수로 받는 방법중 하나는 Lambda 가 있다.
Lambda 를 사용하는 주된 이유는 [Deferred Execution](https://baekjungho.github.io/wiki/reactive/reactive-defer/) 이다.

## References

- Grokking Simplicity / Eric Normand / Manning