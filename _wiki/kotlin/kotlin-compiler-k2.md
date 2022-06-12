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

# Kotlin Compiler

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

프론트엔드의 목표는 초기 일반 텍스트에 구조와 의미를 더하는 것이다. 이 정보를 사용하면 백엔드에서 결과 대상 코드를 생성하기 훨씬 쉬워진다.

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

문법이 올바르면 파서는 트리를 빌드하게 된다. 즉, 파서는 소스코드를 입력으로 취하고 구문 트리(syntax tree)를 출력으로 생성한다. 구문 트리를 PSI(Program Structure Interface)라고도 한다.

파서는 문법에 따라 소스 코드의 구조를 이해하는 것일뿐 각 노드에 무엇이 저장되는지 구별하지는 않는다. 그저 pet, cat, meow, println 을 문자열로 저장했고 별다른 의미는 없다.

### Semantic analyzer

> 의미 분석기(Semantic analyzer)는 구문 트리(syntax tree)를 입력으로 취하여 여기에 의미 정보를 추가한다.
> 
- semantic info
- call resolution
- type inference
- reporting errors

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

- __Reporting errors__
  - Reports errors on unresolved or wrong calls

파서는 오타가 생기거나 괄호가 누락되면 파서가 확인하여 오류를 보고한다. 의미 분석기는 의미를 확인하고 기존 함수가 올바르게 호출되는지 확인하여, 잘못된 호출일 경우 오류를 보고한다.

```kotlin
fun play(pet: Pet) {
    if (pet is Cat) {
        pet.meow(1) // Error: Too many arguments by Semantic analyzer
    } else {
        pet.woof() // Error: Unresolved reference by Semantic analyzer
    }
}
```

의미 분석기는 함수 호출시 너무 많은 매개 변수 전달, 혹은 함수를 찾을 수 없는 경우 등 잘못된 함수 호출과 관련된 오류를 보고한다.

의미 분석기는 구문 트리의 모든 노드에 대한 추가 정보가 포함된 맵 테이블(BindingContext)에 이 정보를 저장한다.

| key  | value  |
|------|--------|
|pet|function argument of type example.pets.Pet|
|Cat|type example.pets.Cat|
|pet|function argument cast to type example.pets.Cat|
|meow|member function of class example.pets.Cats|
|println|top-level function defined in kotlin.io|
|'"*"'|string literal; of type kotlin.String|

## Backend

> Kotlin JVM Backend 는 프론트엔드에서 처리한 syntax tree + semantic info 를 입력으로 취하고 JVM Bytecode 를 출력으로 생성한다.

![](/resource/wiki/kotlin-compiler-k2/kotlin-backend.png)

```idle
L0
  ALOAD 0
  LDC "pet"
  INVOKESTATIC kotlin/jvm/internal/
    Intrinsics.checkNotNullParameter

L1
  ALOAD 0
  INSTANCEOF example/pets/Cat
  IFEQ L2
L3
  ALOAD 0
  CHECKCAST example/pets/Cat
  INVOKEVIRTUAL example/pets/Cat.meow ()V
L4
  GOTO L5
L2
  LDC "*"
  ASTORE 1
L6
  ICONST_0
  ISTROE 2
L7
  GETSTATIC java/lang/System.out: Ljava/io/PrintStream;
  ALOAD 1
  INVOKEVIRTUAL java/io/PrintStream.println (Ljava/lang/Object;)V
L5
  RETURN
```

## Compilation to multiple targets

Kotlin 코드는 다양한 대상으로 컴파일 될 수 있는데 어떻게 작동하는 것일까?

- __Old Kotlin compiler vs new Kotlin compiler__
  - Old JVM backend vs new JVM IR backend
  - Old JS backend vs new JS IR backend
  - Native backend

### Old Kotlin Compiler

컴파일러는 프론트엔드와 백엔드 두 부분으로 구성이 되어있다.

![](/resource/wiki/kotlin-compiler-k2/old-compiler.png)

Kotlin 컴파일러는 해당 대상 플랫폼에 대한 구문 트리와 의미 정보를 변환하는 세가지 백엔드가 존재한다.

- From the beginning, the JVM and JS backends generated the target code directly from syntax tree and semantic info
- Why? It allowed fast evolution of the language at early stages

중간 코드 제러레이터 및 옵티마이저(intermediate code generator and optimizer)는 컴파일러를 구현하기 위한 필수사항은 아니다.(optional) 

이전 Kotlin Compiler 1.0, 1.1 or 1.3 버전의 경우에는 중간 코드 제너레이터를 
사용하지 않았다.

Javascript 는 JVM 바이트코드보다 Kotlin 자체에 더 가깝다. 그래서 둘 모두 중간 표현을 만들지 않고 구문 트리와 의미 정보에서 직접 대상 코드를 생성했다. 그 이유는 이런식으로 개발하는 것이 더 쉬웠고 초기 단계에서 Kotlin 언어의 빠른 개발이 가능했기 때문이다.

그리고 나중에 Native backend 가 등장했다. 그리고 나서 모든 백엔드가 코드 표현의 일부 로직, 단순화 및 변환을 공유할 수 있다는 것이 분명해 졌다. Native backend 를 시작으로 Kotlin 팀은 중간 표현인 IR 을 도입하기로 결정했다.

![](/resource/wiki/kotlin-compiler-k2/kotlin-ir.png)

이제 Native backend 가 IR(intermediate representation) 을 기반으로 중간 코드를 생성하고 대상 코드를 생성하는 단계를 분리하여 고전적인 [Dragon](https://en.wikipedia.org/wiki/Compilers:_Principles,_Techniques,_and_Tools) 의 접근 방식을 따르는 것을 알 수 있다.

이렇게 만든 이유는 이 IR Generator 가 나중에 다른 백엔드 간에 재사용될 수 있기 때문이다.

### New Kotlin Compiler

새로운 IR 백엔드는 모두 중간 표현을 사용하고 이를 빌드하고 처리하는 로직을 공유한다.

![](/resource/wiki/kotlin-compiler-k2/new-compiler.png)

> Goals of new JVM and JS backends
> 
> - Share logic between different backends
> - Simplify the process of supporting new language features
> - Performance improvements - not a goal

새로운 IR 백엔드를 도입하는 주된 목적은 서로 다른 백엔드간에 로직을 공유하는 것이다. 중간 표현과 공유 코드를 사용하면 새로운 기능을 지원하기가 훨씬 쉽다.

성능 향상은 새로운 백엔드의 목표가 아니다.

### Intermediate Representation

> IR 은 언어의 복잡성을 줄이는 데 도움을 준다.

- Transformed tree: doesn't directly correspond to the initial code
- Contains all the semantic information
  - 이 정보는 서로 다른 플랫폼 용으로 대상 코드를 생성하기 위해 모든 백엔드에서 공유되고 사용된다.
- Used by all new backends to generate target code

IR 에는 지역 또는내부 클래스가 없으며 이는 특수 이름을 가진 독립형 클래스로 대체되었다. IR 은 기계 코드와는 거리가 멀다. 백엔드는 결과 출력을 생성하기 위해 여전히 많은 작업을 수행해야 한다. 그러나 IR 은 언어의 복잡성을 줄이는 데 도움을 준다.

IR 은 Kotlin 소스 코드와 대상 코드 사이의 중간 형식으로, 이 둘 사이의 변환 프로세스를 단순화 한다.

### New backends

- Allow pluggability (via compiler plugins)

새로운 백엔드가 컴파일러 플러그인을 통해 연결성을 지원한다. JetPack Compose 는 JVM IR 백엔드만 사용 가능하다.

# K2 Compiler

![](/resource/wiki/kotlin-compiler-k2/k2-compiler.png)

| Backend/Frontend | - |
|------|--------|
|New JVM IR backend|Stable in 1.5|
|New JS IR backend|Stable in 1.6.x|
|New frontend|In active development Preview in 1.6.y|

## New Frontend

> Goals of new frontend
>
> - More traditional compiler approach
> - Single main data structure to hold semantics
> - Better performance (both for compiler and IDE)

새로운 프론트엔드는 FIR(frontend intermediate representation)이라는 다른 데이터 구조가 존재한다.

- __Old Frontend__
  - Separately, a syntax tree(PSI, Program Structure Interface) & a table with semantic info (BindingContext)
- __New Frontend__
  - FIR = Frontend Intermediate Representation = a tree with semantic info
  - ![](/resource/wiki/kotlin-compiler-k2/new-frontend.png)
  - 트리는 별도의 데이터 구조를 사용하지 않고 노드의 모든 의미 정보를 포함한다.

__즉, 이전 프런트엔드는 두 개의 데이터 구조를 생성하고(syntax tree + semantic info) 새 프런트엔드는 하나의 데이터 구조(syntax tree with semantic info)를 생성한다. 이렇게 하나의 데이터 구조를 갖도록 변경됨에 따라 성능 향상이 일어난다.__

IDE Kotlin 플러그인은 Kotlin 컴파일러의 프런트엔드 부분을 재사용한다. IDE 는 훌륭한 경험을 제공하기 위해 코드의 함수, 변수, 클래스 이름에 대한 모든 해결된 정보를 알아야 한다.

### FIR

- Designed and optimized for call resolution
- "Desugars" some language constructs

프런트엔드 IR 은 호출 해결(call resolution) 해결을 위해 설계 및 최적화 되었으며, 백엔드 IR 은 코드 생성을 위해 프런트엔드 IR 을 사용하여 빌드된다.

프런트엔드 IR 은 여러 가지 추가 기능을 수행한다. 예를 들어 복잡한 언어 구문을 일부 단순화하고 더 간단한 구문으로 대체한다. 이것을 일컬어 언어 구문을 `Desugars` 한다고 말한다.

### Desugaring

> Desugaring
> 
> - operators (+, +=, in, .., etc) are desugared into explicit calls
> - destructuring declarations are "unwrapped"
> - for using 'iterator' convention is replaced with while
> - implicit receivers are replaced with explicit receivers
> - method declarations are generated for data classes
> - etc.

- Kotlin source code

```kotlin
val (first, second) = pair
```

- Syntactic sugar for:

```kotlin
val first = pair.component1()
val second = pair.component2()
```

![](/resource/wiki/kotlin-compiler-k2/fir.png)

구조 분해 선언을 사용할 때, 프런트엔드 IR 은 이를 다시 'desugaring' 하고 상세한 형태에 대한 표현을 포함한다.

__새 프런트엔드는 이러한 언어의 기능 변환과 단순화를 담당한다.__ 이 트리는 변환 가능하기 때문에 새 프런트엔드 IR 로 그렇게 할 수 있다.

### New frontend: API for compiler plugins

- K2 compiler will provide pulbic API for compiler plugins (probably, not from scratch)


## Links

- [The Road to the New Kotlin Compiler K2](https://www.youtube.com/watch?v=iTdJJq_LyoY)
- [Kotlin 1.7.0 Release](https://github.com/JetBrains/kotlin/releases/tag/v1.7.0)
- [Kotlin Grammar](https://kotlinlang.org/docs/reference/grammar.html)
