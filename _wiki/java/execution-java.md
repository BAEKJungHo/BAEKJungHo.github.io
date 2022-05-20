---
layout  : wiki
title   : Execution of Java Program
summary : 자바 프로그램이 실행되는 과정
date    : 2022-05-19 11:28:32 +0900
updated : 2022-05-19 12:15:24 +0900
tag     : java
toc     : true
comment : true
public  : true
parent  : [[/java]]
latex   : true
---
* TOC
{:toc}

## Execution of Java Program

![](/resource/wiki/execution-java/executionofjavaprogram.png)

1. IDE(Ex. IntelliJ)를 사용하여 Program.java 코드를 작성한다.
2. `Java Compiler(javac)` 가 자바 소스 코드를 참고하여 클래스 파일(Program.class)을 생성한다.
3. 생성된 클래스 파일은 JVM 이 설치되어있는 환경이면 어디에서든지 실행 가능하다.
4. JVM 은 바이트 코드를 `Interpreter` 를 사용하여 한 줄 씩 기계어로 번역한다.

## Compiler

컴파일이란 고수준 프로그래밍 언어(high-level programming language)로 작성된 프로그램을 소스 코드에서 객체 코드(Object Code)로 변환하는 것을 의미한다.

- Source Code: 원시 코드
- Object Code: 목적 코드
  - Compiler 에 의해 생성된 코드를 의미한다.

그러면 `저수준 언어는(low level language)`는 무엇일까? 저수준 언어는 기계어나 어셈블리어를 의미하며, 고수준 프로그래밍 언어보다 하드웨어에 더 밀접한 언어이다.

컴파일러와 인터프리터는 `HLL` 로 작성된 프로그램을 기계어로 변환한다는 공통점이 있다. 단, 변환 과정에서 차이가 존재한다.

컴파일러만을 사용하는 대표적인 언어로 C 언어가 있다. 컴파일러는 런타임 이전에 전체 소스 코드를 기계어로 변환시킨다. `컴파일 결과물이 바로 기계어`가 되기 때문에 OS 에 종속적이다.
따라서, 대부분의 하드웨어 제어 시스템을 만들 때 C 언어를 쓰는 이유 중 하나가 Compiler 를 사용하기 때문이다.

이렇게 소스 코드를 빌드하였을 때 특정 플랫폼에서만 사용가능한 기계어로 컴파일되는 형식을 `AOT(Ahead of Time) Compile` 이라고 한다.

컴파일러의 단점이라고 하면 프로그램 크기가 크면, 컴파일 타임이 증가한다는 것이 있겠다.

## Interpreter

인터프리터만을 사용하는 대표적인 언어로는 파이썬이 있다. 인터프리터는 소스 코드를 바로 기계어로 바꾸지 않고 `중간 단계`를 거친 뒤, 런타임 시에 한 줄씩 기계어로 해석한다.
컴파일러와 달리 한 줄씩 해석하기 때문에 컴파일 방식보다는 속도가 느리다. 대신, 프로그램을 즉시 실행할 수 있으며 런타임에 디버깅 및 값 변경이 가능하다. 또한 플랫폼에 종속적이지 않다.

런타임에 코드를 구동시키기 때문에, 필요할 때마다 메모리에 올려서 사용한다. 이것을 `동적 적재(Dynamic Loading)`라고 한다.

> 중간 단계 언어 : Java 로 따지면 ByteCode, C# 으로 따지면 IL(Intermediate Language)

자바에서는 `ClassLoader` 를 사용하여 클래스를 `동적 적재(Dynamic Loading)`를 할 수 있다.

## 자바에서 Compiler 와 Interpreter 를 같이 사용하는 이유

> 자바는 WORA(Write Once Run Anywhere) 의 특징을 갖고 있고, 플랫폼에 독립적이다. 반면, JVM 은 플랫폼(OS)에 종속적이다.

이와 같은 말을 자바를 공부한 사람이라면 많이 들어봤을 것이다.

자바는 Compiler 를 사용하여 중간 단계 언어인 바이트 코드로 변환한 다음 Class Loader 가 클래스 파일을 JVM 의 메모리 영역(Memory Area)에 로드한다. 그리고 JVM 에서는 Interpreter 를 사용하여 기계어로 해석한다.

자바로 작성된 언어가 플랫폼에 종속적이지 않은 이유는 JVM 에서 Interpreter 를 사용하기 때문이다.

그러면 JVM 은 왜 플랫폼에 종속적일까?

![](/resource/wiki/execution-java/jvmisdependentonos.png)

개발 환경에서는 Windows 를 사용하고 배포 환경에서는 Linux 를 사용한다. 각 OS 에서는 Java 로 작성된 프로그램을 실행시키기 위해 `JDK`가 설치되어있어야 한다. 즉, 플랫폼에 종속적인것을 볼 수 있다.

Oracle 에서 JDK 를 다운로드 받으려고하면 플랫폼을 선택할 수 있게 나온다. 자바로 작성된 프로그램은 어떤 OS 던지간에 JVM 만 설치되어있으면, JVM 이 Interpreter 를 사용하여 기계어로 해석하기 때문에, 자바는 플랫폼에 독립적이고, JVM 은 플랫폼에 종속적이다.

## JIT Compiler

자바로 작성된 프로그램은 느리다라는 말이 있다. Compiler 와 Interpreter 의 특징을 기억하면 된다. 이러한 특징들 때문에, 자바에서 `JIT Compiler` 를 도입했다.

자바는 Profile-Guided Optimization(PGO) 프로필 기반 최적화를 응용하는 환경이므로 AOT 플랫폼에서 불가능한 방식으로, 런타임 정보를 활용할 여지가 있다. 따라서 동적 인라이닝, 가상 호출 등으로 성능을 개선할 수 있다.

> Java SE 9에서는 AOT 가 실험 기능으로 추가되었다고 한다.

JIT(Just-In-Time) 컴파일러는 런타임 시 Java 기반 애플리케이션의 성능 최적화를 담당하는 JRE 의 필수 부분이다.

![](/resource/wiki/execution-java/jitcompiler.png)

- JIT Compiler 는 런타임에 바이트 코드를 Native Machine Code 로 변환한다.
- 같은 함수가 여러 번 호출되는 경우에, 기계어로 변환된 함수의 코드를 `캐싱`해두어서 재사용한다.
- 이름이 JIT(Just In Time)인 이유는, 기계어로의 변환은 코드가 실행 되는 과정(런타임)에 실시간으로 일어, 전체 코드의 필요한 부분만 변환하기 때문이다.
- 기계어로 변환된 코드는 캐시에 저장되기 때문에 재사용시 컴파일을 다시 할 필요가 없다.

> 바이트 코드(Byte Code) : JVM 이 이해할 수있는 0과 1로 구성된 이진 코드(Binary Code)
>
> Native Machine Code : 기계어, 컴퓨터가 이해할 수 있는 0과 1로 구성된 이진 코드(Binary Code)
>
> 따라서, 모든 이진 코드(Binary Code) 는 기계어가 아니다.

## Links

- [Compilation](https://www.webopedia.com/definitions/compilation/)
- [High Level Language](https://www.webopedia.com/definitions/high-level-language/)
- [Profile Guided Optimizations](https://docs.microsoft.com/ko-kr/cpp/build/profile-guided-optimizations?view=msvc-170)
- [Ahead of time Compilation](https://www.baeldung.com/ahead-of-time-compilation)

