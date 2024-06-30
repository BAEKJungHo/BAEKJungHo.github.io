---
layout  : wiki
title   : Components of Code in Functional Programming
summary : Action, Calculate, Data
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

## Action, Calculate, Data

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

계산(calculate)은 같은 입력값이 주어지면 항상 같은 결괏값을 리턴한다. 따라서 __테스트가 쉽다__. 
테스트 하기 쉽다는 것이 정말 큰 장점이다. 따라서 함수형 프로그래밍에서는 액션에서 계산을 추출하려하거나, 액션 사용을 줄이려고 하는 것이 좋다. 

```kotlin
// Calculate Function
fun rank(subscriber: Subscriber): String {
    if (subscriber.recCount >= 0) {
        return "Best"
    } else {
        return "Good"
    }
}
```

Data 는 __모든 이벤트에 대해 기록한 사실__ 이다. 실행하지 않아도 데이터 자체로 의미를 가진다. 세 가지 개념 중 가장 다루기 쉬운 것은 Data 이다.

__Benefits of Data__:
- Serialization
- [Identity](https://baekjungho.github.io/wiki/kotlin/kotlin-equality/#identity) 비교
- 자유로운 해석 (event 를 생각하면 됨)

함수형 프로그래밍에서 가장 중요한 것 중 하나가 __데이터를 언제나 쉽게 해석할 수 있도록 표현__ 하는 것이다.

Action 은 부수 효과, 부수 효과가 있는 함수, 순수하지 않은 함수라고 한다. Calculate 는 순수 함수, 수학 함수라고 부른다.

- Action 안에는 계산과 데이터 또 다른 Action 이 있을 수 있다.
- Calculate 는 더 작은 계산과 데이터로 나누고 연결할 수 있다.
- Data 는 데이터만 조합할 수 있다.

### Action Propagation

액션(action)은 호출 시점과 횟수에 의존한다. 액션을 의존하는 함수또한 액션이다. 따라서 액션은 코드 전체로 전파된다.

```kotlin
fun call() { // action
    action() // action
}

fun main() { // action
    call() // action
}
```

생성자 호출 또한 액션이 될 수 있다. LocalDateTime 은 초기화할 때마다 값이 다르기 때문이다. 또한 속성이 mutable 하다면 읽는 시점에 따라 값이 다를 수 있기 때문에 액션이다.

## References

- Grokking Simplicity / Eric Normand / Manning