---
layout  : wiki
title   : The Road to the New Kotlin Compiler K2
summary : 
date    : 2022-06-04 21:54:32 +0900
updated : 2022-06-04 22:15:24 +0900
tag     : kotlin
toc     : true
comment : true
public  : true
parent  : [[/kotlin]]
latex   : true
---
* TOC
{:toc}

## Kotlin Compiler

Kotlin Compiler 는 source code 를 JVM, JS, Native 라는 세가지의 대상 플랫폼에 사용할 수 있도록 각각의 machine code 로 컴파일 한다.

![](/resource/wiki/kotlin-compiler-k2/kotlin-compiler.png)

## Blackbox

> Compiler 의 Blackbox 는 Frontend 와 Backend 로 나뉜다.

![](/resource/wiki/kotlin-compiler-k2/kotlin-frontend-backend.png)

- __Frontend__
  - builds syntax tree and semantic info
- __Backend__
  - generates target / machine code

## Frontend

![](/resource/wiki/kotlin-compiler-k2/kotlin-frontend.png)

### Parser

> 파서는 소스 코드인 Kotlin file group 을 입력으로 취한다.
> 
> - Makes sure that the structure is correct
> - Responsible for finding typos and reporting corresponding errors

```kotlin
if (pet is Cat) {
    pet.meow()
} else {
    println("*")
}
```

컴파일러는 위 코드 조각을 다음과 같이 처리한다.

```
ifExpression
  : 'if' '(' expression ')'
    controlStructureBody
      'else'
    controlStructureBody
    
controlStructureBody
  :block
  | statement
  
block
  : '{' statements '}'
```

> 컴파일러가 코드를 이해할 수 있도록 문법을 정확하게 따라야, 올바르게 컴파일이 된다.

위 코드는 문법 구조가 정의된 방식이다. 파서(Parser)는 이 규칙 세트를 기반으로 입력을 분석한다. __파서의 목표중 하나는 프로그램 구조를 검사하고 올바른지 확인하는 것이다.__

![](/resource/wiki/kotlin-compiler-k2/kotlin-tree.png)

문법이 올바르면 파서는 트리를 빌드하게 된다. 즉, 파서는 소스코드를 입력으로 취하고 구문 트리(syntax tree)를 출력으로 생성한다.

## Backend

![](/resource/wiki/kotlin-compiler-k2/kotlin-backend.png)

## Links

- [The Road to the New Kotlin Compiler K2](https://www.youtube.com/watch?v=iTdJJq_LyoY)
- [Kotlin Grammar](https://kotlinlang.org/docs/reference/grammar.html)
