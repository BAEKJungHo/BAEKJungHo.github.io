---
layout  : wiki
title   : Readability
summary : Reducing CognitiveLoad
date    : 2024-01-14 16:01:32 +0900
updated : 2024-01-14 16:05:24 +0900
tag     : cleancode kotlin
toc     : true
comment : true
public  : true
parent  : [[/cleancode]]
latex   : true
---
* TOC
{:toc}

## Readability

코틀린은 간결성을 목표로 설계된 언어가 아니다. __가독성(readability)__ 을 좋게 하는 데 목표를 두고 설계된 언어이다.
간결성은 가독성을 목료로 두고, 자주 쓰이는 반복적인 코드를 짧게 쓸 수 있게 했기 때문에 발생하는 부가적인 효과일 뿐이다.

```kotlin
// Case A
if (person != null && person.isAdult) {
    view.showPerson(person)
} else {
    view.showError()
}

// Case B
person?.takeIf { it.isAdult }
    ?.let(view::showPerson)
    ?: view.showError()
```

두 코드 중 A 가 더 좋은 코드이다. Line 수가 적다고 더 좋은 코드도 아니다. B 의 경우 숙련된 코틀린 개발자라면 이해하는데 어렵진 않지만,
코틀린을 쓰다가 다른 언어를 한동안 쓰고 다시 보려면 이해하는데 어렵다. 숙련된 개발자를 위한 코드만이 좋은 코드는 아니다.

__인지 부하(cognitive load)__ 를 줄여야한다. 가독성은 __'뇌가 프로그램의 작동 방식을 이해하는 과정을 더 짧게 만드는 것이다.'__
뇌는 기본적으로 짧은 코드를 빠르게 읽을 수 있겠지만, 익숙한 코드는 더 빠르게 읽을 수 있다.

### Don't Go To Extremes

극단적이면 안된다. 아래 처럼 let 을 사용 하는 것은 좋은 케이스에 속한다.

```kotlin
class Person(val name: String)
var person: Person? = null

fun printName() {
    person?.let {
        print(it.name)
    }
}
```

let 을 많이 사용 하는 경우
- 연산을 아규먼트 처리 후로 이동시킬 때
- 데코레이터를 사용해서 객체를 랩할 때

```kotlin
students
    .filter { it.result >= 50 }
    .joinToString(separator = "\n") {
        "${it.name} ${it.surname}, ${it.result}"
    }
    .let(::print)

var obj = FileInputStream("/file.gz")
    .let(::BufferedInputStream)
    .let(::ZipInputStream)
    .let(::ObjectInputStream)
    .readObject() as SomeObject
```

위 코드는 디버그하기 어렵고 코틀린 개발자가 아니라면 이해하기 어렵다. 하지만 이 비용은 지불할 만한 가치가 있다.
물론 어떤 것이 비용을 지불할 만한 코드인지 아닌지는 항상 논란이 있을 수 있다. 균형을 맞추는 것이 중요하다.

## References

- Effective Kotlin / Marcin Moskala 저 / 인사이트