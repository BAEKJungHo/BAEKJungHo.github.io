---
layout  : wiki
title   : BRIDGE
summary : 
date    : 2025-02-15 11:28:32 +0900
updated : 2025-02-15 12:15:24 +0900
tag     : designpattern
toc     : true
comment : true
public  : true
parent  : [[/designpattern]]
latex   : true
---
* TOC
{:toc}

## BRIDGE

![](/resource/wiki/designpattern-bridge/bridge-meaning.png)

브릿지 패턴은 추상화(Abstraction)와 구현(Implementation)을 분리하여 독립적으로 확장할 수 있도록 설계하는 패턴이다.
즉, 하나의 클래스 계층에서 두 개의 개념을 분리하여 결합도를 낮추고 확장성을 높이는 것이 목적이다.

### Design Principles

상속대신 합성(composition)을 사용하여 많은 서브 클래스를 만들어야 하는 문제를 해결한다. 
___M X N___ 을 ___M + N___ 문제로 해결해준다.

![](/resource/wiki/designpattern-bridge/structure.png)

- __Abstraction__
  - defines theabstraction's interface.
  - maintains a reference to an object of type Implementor.
- __RefmedAbstraction__
  - Extends the interface defined by Abstraction.
- __Implementor__
  - defines the interface for implementation classes. This interface doesn't have to correspond exactly to Abstraction's interface; in fact the two inter- faces can be quite different. Typically the Implementor interface provides only primitive operations, and Abstraction defines higher-level operations based on these primitives.
- __Concretelmplementor__
  - implements the Implementor interface and defines its concrete implementation.

### Examples

- 자동차의 종류: 승용차, 트럭, SUV
- 연료 타입: 가솔린, 전기, 하이브리드

만약 자동차의 종류와 연료 타입을 단순한 계층 구조로 만든다면, 이렇게 하면 각 조합마다 새로운 클래스를 만들어야 해서 확장성이 떨어진다.
따라서 합성을 이용하여 ___자동차의 종류(Car)와 연료 타입(Engine)을 분리해서 설계하면 확장성을 높일 수 있다.___

__Abstraction__:

```kotlin
// 자동차 클래스에서 엔진을 조합
abstract class Car(private val engine: Engine) {
    abstract fun drive()

    fun startCar() {
        println(engine.start())
    }
}

class Sedan(engine: Engine) : Car(engine) {
    override fun drive() {
        println("세단을 운전합니다.")
    }
}

class SUV(engine: Engine) : Car(engine) {
    override fun drive() {
        println("SUV를 운전합니다.")
    }
}
```

__Implementation__:

```kotlin
// 연료 타입을 인터페이스로 분리
interface Engine {
    fun start(): String
}

class GasolineEngine : Engine {
    override fun start() = "가솔린 엔진 시동을 겁니다."
}

class ElectricEngine : Engine {
    override fun start() = "전기 엔진 시동을 겁니다."
}

class HybridEngine : Engine {
    override fun start() = "하이브리드 엔진 시동을 겁니다."
}
```

## References

- Gangs of Four Design Patterns
- 设计模式之美 / 王争