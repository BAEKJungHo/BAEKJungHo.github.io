---
layout  : wiki
title   : KSP
summary : Kotlin Symbol Processing and Compiler Plugins
date    : 2022-09-20 20:54:32 +0900
updated : 2022-09-20 21:15:24 +0900
tag     : kotlin ksp sam
toc     : true
comment : true
public  : true
parent  : [[/kotlin]]
latex   : true
---
* TOC
{:toc}

## Compiler plugin

### All-open

- __Related Articles__
  - [All-open Compiler Plugin](https://kotlinlang.org/docs/all-open-plugin.html)
  - [All-open 이 필요한 이유](https://baekjungho.github.io/wiki/buildtool/gradle-standard/#buildgradle)

### No-arg

- __Related Articles__
  - [No-arg compiler Plugin](https://kotlinlang.org/docs/no-arg-plugin.html)

### SAM with receiver

- __Related Articles__
    - [Functional (SAM) interfaces](https://kotlinlang.org/docs/fun-interfaces.html) 
    - [SAM conversions](https://kotlinlang.org/docs/java-interop.html#sam-conversions)
    - [SAM-with-receiver compiler plugin](https://kotlinlang.org/docs/sam-with-receiver-plugin.html#sam-conversions)

#### SAM

SAM(Single Abstract Method)은 단일 추상함수라고 부르며, `Functional Interface` 라고도 부른다.
SAM Interface 를 인자로 받는 Java 함수를 호출 할 경우, SAM Interface 객체 대신 람다를 넘길 수 있다.
Kotlin 에서도 SAM Interface 를 인자로 취하는 자바 메소드를 호출할 때 람다를 넘길 수 있도록 해준다는 뜻으로, Java 와 호환성을 지원한다는 의미이다.

```kotlin
fun interface KRunnable {
   fun invoke()
}
```

For example, consider the following Kotlin functional interface:

```kotlin
fun interface IntPredicate {
   fun accept(i: Int): Boolean
}
```

If you don't use a SAM conversion, you will need to write code like this:

```kotlin
// Creating an instance of a class
val isEven = object: IntPredicate {
   override fun accept(i: Int): Boolean {
       return i % 2 == 0
   }
}
```

By leveraging Kotlin's SAM conversion, you can write the following equivalent code instead:

```kotlin
// Creating an instance using lambda
val isEven = IntPredicate { it % 2 == 0 }
```

A short lambda expression replaces all the unnecessary code.

```kotlin
fun main() {
   println("Is 7 even? - ${isEven.accept(7)}")
}
```

만약, SAM 인터페이스가 아니라면 object 키워드를 통해 익명 객체를 만들어서 사용해야 한다.

```kotlin
// Retrofit
val callAsync = paymentHttpService.approvePayment(request)
callAsync.enqueue(object: Callback<Unit> {
  override fun onResponse(call: Call<Unit>, response: Response<Unit>) {}
  override fun onFailure(call: Call<Unit>, t: Throwable) {}
})
```

### kapt

- __Related Articles__
  - [Using kapt](https://kotlinlang.org/docs/kapt.html#command-line-compiler)

자바 이외의 언어에서 어노테이션을 지원하기 위해서는 `자바의 컴파일러`와 `어노테이션 프로세스를 위한 플러그인 대상 API` 가 필요한데, 이를 정리한 스펙 문서가 [JSR 269 : Pluggable Annotation Processing API in JCP](https://jcp.org/en/jsr/detail?id=269) 이다.

Kotlin 프로젝트를 컴파일 할 때는 javac 가 아닌 kotlinc 로 컴파일을 하기 때문에 Java 로 작성한 Annotation Processor 가 동작하지 않는다. __따라서 코틀린에서는 자바로 작성된 어노테이션을 처리하기 위해 kapt 를 사용한다.__

이 플러그인 API 를 사용하면 특정 어노테이션이 정의되었을때, 컴파일러에게 어노테이션에 작성된 클래스, 메서드, 필드 등의 구성 요소를 질의하고 컴파일러는 해당 구성 요소를 나타내는 객체의 컬렉션을 반환하게 된다.

이후 프로세서가 이 컬렉션을 검증하고, 새로운 코드(=Stub)을 생성하게 된다.

코틀린의 경우 빌드한 바이너리가 자바이기 때문에, 코틀린 컴파일러의 실행후 자바 컴파일러가 바이너리 파일인 `*.class` 를 인식한다.

이때 컴파일러는 코틀린과 자바에서 생성된 각 바이너리에 대해서 구별할 수는 없다.

다만, 코틀린은 언어의 특성상 Processor 가 생성한 선언을 참조할 수 없고, 바이너리에는 주석이 포함되지않기때문에 이를 해결하기 위해 KAPT 를 사용하는 것이다.

KAPT 를 사용하면 [Annotation Processing Tool](https://docs.oracle.com/javase/7/docs/technotes/guides/apt/GettingStarted.html) 와 똑같이 Stub 을 생성하고 자바의 의존성을 가지는 대신 구현이 상대적으로 쉽다는 장점이 있다.
하지만 KAPT 도 APT 와 마찬가지로 결국 Stub 을 생성하기 위해 __많은 컴파일 및 빌드 타임을 소모__ 하게 되는 문제점은 그대로 남아있게 된다.

Stub 을 생성하는 것은 kotlinc 의 분석 비용의 3분의 1이나 차지하므로, 많은 오버헤드가 발생하게 된다.

## KSP

- __Related Articles__
  - [See the full-sized diagram](https://kotlinlang.org/docs/images/ksp-class-diagram.svg)

> kapt is in maintenance mode. We are keeping it up-to-date with recent Kotlin and Java releases but have no plans to implement new features. Please use the [Kotlin Symbol Processing API (KSP)](https://kotlinlang.org/docs/ksp-overview.html) for annotation processing. [See the list of libraries supported by KSP](https://kotlinlang.org/docs/ksp-overview.html#supported-libraries).

KSP 는 Java 관점이 아닌 Kotlin 의 관점에서 접근하며, kapt 에 비해 약 2배 빨라졌다고 한다. kotlin 사이트에서도 KSP 를 소개하고 있지만 공식적으론 Google 에서 관리하는 오픈소스 프로젝트이다.

Another way to think of KSP is as a preprocessor framework of Kotlin programs. The data flow in a compilation can be described in the following steps:

1. Processors read and analyze source programs and resources.
2. Processors generate code or other forms of output.
3. The Kotlin compiler compiles the source programs together with the generated code.

- __장점__
  - 기존에는 코틀린 전용 어노테이션 프로세서가 없었기 때문에, javax.lang.model 패키지에서 제공하는 API 를 통해 어노테이션 프로세서를 작성했다. 이 프로세서를 수행하기 위해 KAPT 는 코틀린 코드를 자바 Stub 으로 컴파일하게 되며 이 비용은 컴파일 전체의 1/3 을 차지한다. KSP 를 사용하면 약 2배 가량 컴파일 시간이 빨라짐
  - 코틀린 친화적. extension function, Declaration-Site Variance, local functions 등을 이해함
  - 타입을 모델링하고 동등성 및 할당호환성(assign-compatibility)과 같은 기본적인 타입을 검사하는 기능을 제공
  - KSP 는 JVM 에 종속되지 않도록 설계되었기 때문에 향후 다른 플랫폼에 보다 쉽게 적용할 수 있음
    - [KSP with Kotlin Multiplatform](https://kotlinlang.org/docs/ksp-multiplatform.html#type-and-resolution)

## Links

- [KSP release](https://github.com/google/ksp/releases)
  - KSP 버전은 앞에 숫자는 코틀린 버전이고, 뒤가 KSP 버전을 나타냄
  - 1.7.0-Beta-1.0.5: 코틀린 1.7.0-Beta 기반의 1.0.5 버전
- [Why KSP](https://kotlinlang.org/docs/ksp-why-ksp.html)
- [Kotlin KSP](https://thdev.tech/android/2022/05/14/Kotlin-KSP/)
- [How KSP models Kotlin code](https://kotlinlang.org/docs/ksp-additional-details.html)
- [Tachiyomi repository](https://github.com/tachiyomiorg/tachiyomi)
- [Google KSP Repository](https://github.com/google/ksp)
- [KSP API definition](https://github.com/google/ksp/tree/main/api/src/main/kotlin/com/google/devtools/ksp)
- [KSP symbol definition](https://github.com/google/ksp/tree/main/api/src/main/kotlin/com/google/devtools/ksp/symbol)
- [Kotlin Symbol Processing API](https://kotlinlang.org/docs/ksp-overview.html)
- [Kotlin Symbol Processing Api Part 1 — Annotation 과 KAPT](https://androiddeepdive.github.io/Team-Blog/2021/07/21/2021-07-21%20Kotlin%20Symbol%20Processing%20Api%20Part%201/)
- [Kotlin Symbol Processing Api Part 2 — What is it ?](https://androiddeepdive.github.io/Team-Blog/2021/07/21/2021-07-21%20Kotlin%20Symbol%20Processing%20Api%20Part%202/)
- [Kotlin Symbol Processing Api Part 3 — KSP vs KAPT](https://androiddeepdive.github.io/Team-Blog/2021/07/21/2021-07-21%20Kotlin%20Symbol%20Processing%20Api%20Part%203/)
- [KSP: Fact or kapt?](https://proandroiddev.com/ksp-fact-or-kapt-7c7e9218c575)
- [Annotation Processing 101](https://hannesdorfmann.com/annotation-processing/annotationprocessing101/)
- [Pushing the limits of Kotlin annotation processing](https://medium.com/@workingkills/pushing-the-limits-of-kotlin-annotation-processing-8611027b6711)
- [KAPT 보다 2배 더 빠르게, 코틀린을 위한 KSP](https://www.charlezz.com/?p=45255)