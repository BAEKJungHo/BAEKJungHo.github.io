---
layout  : wiki
title   : Functions
summary : Currying, Partial Application
date    : 2024-06-30 12:57:32 +0900
updated : 2024-06-30 13:21:24 +0900
tag     : ddd fp
toc     : true
comment : true
public  : true
parent  : [[/ddd]]
latex   : true
---
* TOC
{:toc}

## Functions

Functions that __input__ or __output__ functions or take functions as parameters are called _[high-order functions](https://baekjungho.github.io/wiki/kotlin/kotlin-first-citizen/)_, often abbreviated to _HOFs_.

### Backgrounds

__Three characteristics of Functional Programming__:

- Higher Order Functions
- Pure Functions
- Immutable Data

__[Components of Code in Functional Programming](https://baekjungho.github.io/wiki/functional/functional-skills/)__
- Action
- Calculate
- Data

### Differences From Object Oriented Programming

For example, say that we have a large program that is assembled from smaller pieces.

- In oop approach, these pieces would be __class and objects__.
- In fp approach, these pieces would be __functions__.

Or say that we need to parameterize some aspect of the program, or we want to reduce coupling between components.

- In oop approach, we would use __interfaces and dependency injection__.
- In fp approach, we would __parameterize with functions__.

Or let's say that we want to follow the "Don't repeat yourself" principle and reuse code between many components.

- In oop approach, we might use __inheritance or technique like the Decorator Pattern__.
- In fp approach, we __put all the reusable code into functions and glue them together using components__.

Go 에서는 Method 와 Function 을 사용할 수 있는데, [Difference Between Method And Function](https://baekjungho.github.io/wiki/go/go-method-function/) 를 읽어보면 좋다.

### Currying

Any multi-parameter function can be converted into a series of one-parameter functions. This method is called _[currying](https://en.wikipedia.org/wiki/Currying)_.

![](/resource/wiki/ddd-functions/currying.png)

__Examples__:

```kotlin
// 두 개의 인자를 받는 일반적인 함수
fun add(x: Int, y: Int): Int {
    return x + y
}

// Currying - 커링을 적용한 함수
fun curriedAdd(x: Int): (Int) -> Int {
    return { y: Int -> x + y }
}

// 사용 예제
fun main() {
    // 일반 함수 사용
    val result1 = add(2, 3)
    println("add(2, 3) = $result1")  // Output: add(2, 3) = 5

    // 커링이 적용된 함수 사용
    val addTwo = curriedAdd(2)
    val result2 = addTwo(3)
    println("curriedAdd(2)(3) = $result2")  // Output: curriedAdd(2)(3) = 5

    // 한 줄로도 사용할 수 있음
    val result3 = curriedAdd(2)(3)
    println("curriedAdd(2)(3) = $result3")  // Output: curriedAdd(2)(3) = 5
}
```

### Partial Application

_[Partial Application](https://en.wikipedia.org/wiki/Partial_application)_ says "if you fix the first arguments of the function, you get a function of the remaining arguments".

For example, the 'sayGreeting' function below has __two parameters__:

```
// sayGreeting: string -> string -> unit
let sayGreeting greeting name =
  printfn "%s %s" greeting name
```

But we can pass in just one parameter to create some new functions with the greeting baked in:

```
// sayHello: string -> unit
let sayHello = sayGreeting "Hello"

// sayGoodbye: string -> unit
let sayGoodbye = sayGreeting "Goodbye"
```

These functions __now have one remaining parameter__, the name. If we supply that, we get the final ouput:

```
sayHello "Alex"
// output: "Hello Alex"

sayGoodbye: "Alex
// output: "Goodbye Alex"
```

This approach of "__baking in__" parameters is called __partial application__ and is a very important functional pattern.

### Asking Questions

함수형 프로그래밍을 사용하는 경우 "How do I implement the Strategy Pattern ?" 보다 __"How can I parameterize behavior ?"__ 와 같은 질문을 던지는 것이 좋다.

## Links

- [Domain Modelling Made Functional. Part 3](https://bespoyasov.me/blog/domain-modelling-made-functional-3/)

## References

- Domain Modeling Made Functional / Scott Wlaschin / The Pragmatic Programmers