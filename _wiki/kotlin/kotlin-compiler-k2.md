---
layout  : wiki
title   : The Road to the New Kotlin Compiler K2
summary : 
date    : 2022-06-05 21:54:32 +0900
updated : 2022-06-05 22:15:24 +0900
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

파서는 문법에 따라 소스 코드의 구조를 이해하는 것일뿐 각 노드에 무엇이 저장되는지 구별하지는 않는다. 그저 pet, cat, meow, println 을 문자열로 저장했고 별다른 의미는 없다.

### Semantic analyzer

> 의미 분석기(Semantic analyzer)는 구문 트리(syntax tree)를 입력으로 취하여 여기에 의미 정보를 추가한다.

- __Semantic info__
  - Resolved names for functions, variables, types, etc.
  - 의미 정보란 코드에 사용된 모든 함수, 변수, 타입에 대한 모든 세부 정보를 의미한다.
  - '이 함수의 출처는 무엇인가?' 또는 '이 두 문자열이 동일한 변수를 참조하는가?', '이 타입은 무엇인가?'과 같은 질문에 대한 답을 제공한다.

```kotlin
fun play(pet: Pet) {
    if (pet is Cat) {
        pet.meow()
    } else {
        println("*")
    }
}

// Call resolution

interface Pet
class Cat: Pet {
  fun meow() {
    println("meow")
  }
}
```

pet.meow() 는 fun meow() 를 찾는다. 이는 호출된 함수를 찾기만 하면 되는 것처럼 간단해 보이지만 실제로는 매우 복잡한 과정으로 의미 분석기 단계에서 대부분의 시간을 차지하는 알고리즘의 핵심이다.

주어진 컨텍스트에서 사용할 수 있는 meow() 함수는 다양할 수 있다. 멤버, 확장 함수, 함수 타입의 프로퍼티 등으로 정의될 수 있다.

- __Call resolution__
  - There might be several 'meow' functions available in the given context
  - Which exact function is called here?
  - 의미 분석기 단계에서 대부분의 시간을 차지하는 알고리즘의 핵심이다.
  - 의미 분석기 단계에서는 주어진 이름을 가진 모든 함수를 찾아야 한다.

의미 분석기의 또 다른 중요한 역할은 타입 인수를 추론(Type inference)하는 것이다.

- __Type inference__
  - Inferring type arguments for generic functions

```kotlin
val list1: List<Int> = listOf(1, 2, 3)
val list2: List<String> = listOf("one", "two", "three")

// Type inference
fun <T> listOf(vararg elements: T): List<T>
```

여러 위치에서 사용되는 하나의 제네릭 함수는 제네릭 타입 매개변수 값을 취할 수 있으며 의미 분석기의 역할은 각 사용 위치의 타입 인수를 추론하는 것이다.

## Backend

![](/resource/wiki/kotlin-compiler-k2/kotlin-backend.png)

## Links

- [The Road to the New Kotlin Compiler K2](https://www.youtube.com/watch?v=iTdJJq_LyoY)
- [Kotlin Grammar](https://kotlinlang.org/docs/reference/grammar.html)
