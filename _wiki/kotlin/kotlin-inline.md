---
layout  : wiki
title   : Inline functions
summary : 코틀린 인라인 함수
date    : 2022-09-26 15:54:32 +0900
updated : 2022-09-26 20:15:24 +0900
tag     : kotlin
toc     : true
comment : true
public  : true
parent  : [[/kotlin]]
latex   : true
---
* TOC
{:toc}

## Previous

- [Kotlin Lambda](https://baekjungho.github.io/wiki/kotlin/kotlin-lambda/)

## Inline

inline 변경자를 어떤 함수에 붙이면 컴파일러는 그 함수를 호출하는 모든 문장을 함수 본문에 해당하는 바이트코드로 바꿔치기 해준다.

__함수에 Higher-order function 를 파라미터로 받아서 사용하는 경우에는 항상 새로운 무명 클래스(익명 클래스, anonymous class) 객체를 생성하기 때문에 부가 비용이 든다. inline 은 이런 부가 비용을 없애준다.__

### 인라인이 작동하는 방식

inline 함수를 호출하는 코드를, 함수를 호출하는 바이트코드 대신에 inline 함수 본문을 번역한 바이트 코드로 컴파일한다.

- __inline function__

```kotlin
inline fun <T> synchronized(lock: Lock, action: () -> T): T {
    lock.lock()
    try {
        return action()
    }
    
    finally {
        lock.unlock()
    }
}
```

- __인라인 함수를 사용하는 코드__

```kotlin
fun foo(l: Lock) {
    println("Before sync")
    synchronized(1) {
        println("Action")
    }
    println("After sync")
}
```

- __컴파일 버전__

```
fun __foo__(l: Lock) {
   println("Before sync")
   
   // inlineing
   l.lock()
   try {
      println("Action")
   } finally {
      l.unlock()
   } 
   
   println("Aftyer sync")
}
```

synchronized 에 전달된 람다의 본문도 함께 인라이닝 된다.

### 함수를 인라인으로 선언해야 하는 경우

- 람다를 인자로 받는 함수의 경우
  - 하지만 모든 함수를 인라인으로 선언할 수는 없음
  - 인라인 함수를 만들때 코드의 크기에 주의해야함
    - 함수가 큰 경우 함수의 본문에 해당하는 바이트코드를 모든 호출 지점에 복사해 넣고나면 바이트코드가 상당히 커질 수 있다.
    - 대부분의 인라인 함수의 본문은 작게 유지되는게 좋다.

### 자원 관리를 위해 인라인된 람다 사용

자원(resource, 파일, 락, 트랜잭션 등)을 획득하고 작업을 마친 후 자원을 해제하는 자원 관리코드에서 람다를 사용할 수 있다.

자원 관리 패턴을 만들 때 보통 사용하는 방법은 try 블록을 시작하기 직전에 자원을 획득하고, finally 문에서 자원을 해제하는 것이다.

```kotlin
val l: Lock = ...
l.withLock { // 락을 잠근 다음 주어진 동작을 수행
    // 락에 의해 보호되는 자원을 사용한다.
}
```

다음은 코틀린 라이브러리에 있는 withLock 함수 정의다.

```kotlin
// 락을 획득한 후 작업하는 과정을 별도의 함수로 분리
fun <T> Lock.withLock(action: () -> T): T {
    lock()
    try {
        return action()
    } finally {
        unlock()
    }
}
```

- __use 함수를 자원 관리에 활용하기__
  - 자바의 try-with-resource 패턴과 같은 기능을 한다.
  - use 는 closeable resource 에 대한 확장 함수이며 람다를 인자로 받는다. use 는 람다를 호출한 다음에 자원을 닫아준다.
    - 람다가 정상 종료되는 경우는 물론 예외가 발생하더라도 자원을 확실히 닫는다.

```kotlin
fun read(path: String): String {
    // use 함수를 호출하면서 파일에 대한 연산을 실행할 람다를 넘긴다.
    BufferedReader(FileReader(path)).use { br ->
      // nonlocal return: 이 return 문은 람다가 아니라 read 함수를 끝내면서 값을 반환한다.
      return br.readLine() // 자원에서 맨 처음 가져온 한 줄을 람다가 아닌 read 에서 반환한다.
    }
}
```

### non-local return

람다 안에서 return 을 사용하면 람다로부터만 반환되는 게 아니라 그 람다를 호출하는 함수가 실행을 끝내고 반환된다. 자신을 둘러 싸고 있는 블록보다 더 바깥에 있는 다른 블록을 반환하게 만드는 return 문을 __넌로컬(non-local) return__ 이라 부른다.

```kotlin
fun lookForAlice(people: List<Person>) {
  people.forEach{
    if (it.name == "Alice") return // lookForAlice 함수 반환
  }
}
```

이렇게 return 이 바깥쪽 함수를 반환시킬 수 있는 때는 람다를 인자로 받는 함수라 __인라인 함수__ 인 경우 뿐이다. (Ex. foreach)

### label

람다 식에서도 local return 을 사용할 수 있다. 람다 안에서 local return 은 for 루프의 break 와 비슷한 역할을 한다.

- __Case 1__

```kotlin
fun lookForAlice(people: List<Person>) {
    people.forEach label@ {
        if (it.name == "Alice") return@label // break
    }
    println("Find Alice") // 항상 이 줄이 출력된다.
}
```

- __Case 2__
  - return 문 뒤에 람다를 인자로 받는 인라인 함수 이름을 레이블로 사용할 수 있다.

```kotlin
fun lookForAlice(people: List<Person>) {
  people.forEach {
    if (it.name == "Alice") return@forEach // break
  }
  println("Find Alice") // 항상 이 줄이 출력된다.
}
```

### anonymous function

넌로컬 반환문은 장황하고, 람다 안의 여러 위치에 return 식이 들어가야 하는 경우에는 사용하기 불편하다. 코틀린은 코드 블록을 여기저기 전달하기 위한 다른 해법을 제공하는데 바로 __무명 함수__ 이다. 무명 함수 본문의 return 은 그 무명 함수를 반환시키고, 무명 함수 밖의 다른 함수를 반환시키지 못한다.

```kotlin
fun lookForAlice(people: List<Person>) {
  people.forEach(fun (person) {
      // return 은 가장 가까운 함수를 가리키는데 이 위치에서 가장 가까운 함수는 무명 함수이다.
      if (person.name == "Alice") return 
      println("${person.name} is not Alice")
  })
}
```

- __식이 본문인 무명 함수 사용하기__

```kotlin
people.filter(fun (person) = person.age < 30)
```

### 정리

- __return 식은 fun 키워드로 정의된 함수를 반환 시킨다.__
  - non-local return 예제에서는 바깥 함수인 lookForAlice 를 반환하고
  - 무명 함수 예제에서는 무명 함수 자체를 반환한다.
  - 해당 예제 코드들을 자세히보면 반환되는 함수에 fun 키워드가 선언되어있음을 알 수 있다.

### 성능

> 이미 JVM 은 강력하게 inline 을 지원하고 있고, JVM 은 코드 실행 분석을 통해 가장 이익이 되는 방법으로 inline 을 하고 있다. 따라서, 함수의 파라미터에  Higher-Order functions 을 넘겨주는 형태가 아니라면 굳이 inline 을 적용할 필요가 없을 가능성이 높다.

## Links

- [Inline functions](https://kotlinlang.org/docs/inline-functions.html)
- [Kotlin inline class 와 inline functions 을 적절하게 사용하는 방법](https://thdev.tech/kotlin/2020/09/29/kotlin_effective_04/)

## References

- 코틀린 완벽 가이드 / Aleksei Sedunov 저 / 길벗
- Kotlin In Action / Dmitry Jemerov, Svetlana Isakova 공저 / 에이콘
- Effective Kotlin / Marcin Moskala 저 / 인사이트