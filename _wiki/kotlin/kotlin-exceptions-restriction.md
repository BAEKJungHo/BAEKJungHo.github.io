---
layout  : wiki
title   : Use exceptions to restriction your code
summary : require, check, assert
date    : 2024-01-05 20:54:32 +0900
updated : 2024-01-05 21:15:24 +0900
tag     : kotlin
toc     : true
comment : true
public  : true
parent  : [[/kotlin]]
latex   : true
---
* TOC
{:toc}

## Use exceptions to restriction your code

- require: argument 를 제한할 수 있다.
- check: 상태와 관련된 동작을 제한할 수 있다.
- assert: 어떤 것이 true 인지 확인할 수 있다. assert 블록은 테스트 모드에서만 작동한다.
- return or throw 와 함께 활용하는 Elvis 연산자

```kotlin
// Stack<T> 의 일부
fun pop(num: Int = 1): List<T> {
    require(num <= size) {
        "Cannot remove more elements than current size"
    }
    check(isOpen) { "Cannot pop from closed stack" }
    val ret = collection.take(num)
    collection = collection.drop(num)
    assert(ret.size == num)
    return ret
}
```

require 함수는 입력 유효성 검사 코드이므로 함수의 가장 앞부분에 배치된다. require 함수는 조건을 만족하지 못하면 IllegalArgumentException 을 발생시킨다.
require 함수로 null 인지를 검사했다면 다음 라인부터는 스마트 캐스팅이 적용된다.

```kotlin
fun speak(text: String) {
    check(isInitialized) 
    // ...
}
```

check 함수는 상태가 올바른지 확인할 때 사용되며, 지정된 예측을 만족하지 못할 때 IllegalStateException 을 발생시킨다. require 블록보다 뒤에 배치된다.

assert 는 스스로 구현한 내용을 확인할 때 사용한다. 예를 들어, 함수가 올바르게 구현되었다면, 확실하게 참을 낼 수 있는 코드들이 있다. assert 는 JVM 옵션 중 `-ea` 옵션을 활성화해야 확인할 수 있다.
프로덕션 환경에서는 동작하지 않는 코드이다.

- Assert 계열의 함수는 코드를 자체 점검하며, 더 효율적으로 테스트를 할 수 있게 해준다.
- 특정 상황이 아닌 모든 상황에 대한 테스트를 할 수 있다.
- 실행 시점에 정확하게 어떻게 되는지 확인할 수 있다.
- 실제 코드가 더 빠른 시점에 실패하게 만든다. 따라서 예상하지 못한 동작이 언제 어디서 실행되었는지 쉽게 찾을 수 있다.

## References

- Effective Kotlin / Moskala, Marcin 저 / 프로그래밍인사이트