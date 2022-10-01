---
layout  : wiki
title   : Lambdas and inline 
summary : Lambda, Inline Class, Inline Functions
date    : 2022-09-25 15:54:32 +0900
updated : 2022-09-25 20:15:24 +0900
tag     : kotlin
toc     : true
comment : true
public  : true
parent  : [[/kotlin]]
latex   : true
---
* TOC
{:toc}

## Lambda

람다는 값처럼 여기저기 전달할 수 있는 동작의 모음이다.

- __Grammar__
  - { 파라미터 -> 본문 }
    - Ex. { x: Int, y: Int -> x + y }
- __Bad__
  - ```kotlin
     val sum = { x: Int, y: Int -> x + y }
     println(sum(1, 2))
    ```
    - 위와 같은 구문은 읽기 어렵고 쓸모가 없다.
- __Good_
  - ```kotlin
    run { println(42) }
    ``` 
  - 코드의 일부분을 블록으로 둘러싸 실행할 필요가 있다면 run 을 사용한다.
  - 실행 시점에 코틀린 람다 호출에는 아무 부가 비용이 들지 않는다.

### 컴파일러의 파라미터 타입 추론

- __AS-IS__
  - ```kotlin
    product.maxBy { p: Product -> p.stock }
    ```
- __TO-BE__
  - ```kotlin
    // Compiler Type inference
    product.maxBy { p -> p.stock }
    ```


## Links

- [High-order functions and lambdas](https://kotlinlang.org/docs/lambdas.html)
- [Inline functions](https://kotlinlang.org/docs/inline-functions.html)
- [Kotlin inline class 와 inline functions 을 적절하게 사용하는 방법](https://thdev.tech/kotlin/2020/09/29/kotlin_effective_04/)

## 참고 문헌

- 코틀린 완벽 가이드 / Aleksei Sedunov 저 / 길벗
- Kotlin In Action / Dmitry Jemerov, Svetlana Isakova 공저 / 에이콘
- Effective Kotlin / Marcin Moskala 저 / 인사이트