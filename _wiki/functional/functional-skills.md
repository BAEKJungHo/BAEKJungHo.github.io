---
layout  : wiki
title   : Skills of Functional Programming
summary : 
date    : 2023-09-28 15:02:32 +0900
updated : 2023-09-28 15:12:24 +0900
tag     : fp
toc     : true
comment : true
public  : true
parent  : [[/functional]]
latex   : true
---
* TOC
{:toc}

## Skills of Functional Programming

함수형 프로그래밍에서 코드는 아래와 같이 세 조각으로 구분할 수 있다.

- Action
- Calculate
- Data

```kotlin
fun call() {
    sendEmail(to, from, payload) // Action
    val numbers = listOf(1, 2, 3) // Data
    sum(numbers) // Calculate
    save(user) // Action
    getCurrentTime() // Action
}
```

Action 는 호출 시점과 횟수가 중요하다. 반면 Calculate 와 Data 는 부르는 시점이나 횟수가 중요하지 않다. 따라서, __부르는 시점과 횟수에 의존하는 지__ 를 기준으로 코드를 구분할 수 있다.

계산(calculate)은 같은 입력값이 주어지면 항상 같은 결괏값을 리턴한다. 따라서 테스트하기가 쉽다. Data 는 이벤트에 대해 기록한 사실이다. 실행하지 않아도 데이터 자체로 의미를 가진다.
세 가지 개념 중 가장 다루기 쉬운 것은 Data 이다.

## References

- Grokking Simplicity / Eric Normand / Manning