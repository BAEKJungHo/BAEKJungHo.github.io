---
layout  : wiki
title   : Companion Object
summary : 동반 객체
date    : 2022-09-20 20:54:32 +0900
updated : 2022-09-20 21:15:24 +0900
tag     : kotlin
toc     : true
comment : true
public  : true
parent  : [[/kotlin]]
latex   : true
---
* TOC
{:toc}

## Companion Object

Java 에서는 static field, method 들이 존재했지만 코틀린에서는 static 이 사라졌다. 대신 static 처럼 사용할 수 있는
companion object 가 존재한다.

Companion Object 을 사용하면 `Factory Design Pattern` 을 쉽게 구현할 수 있다. 

> 생성자를 사용하면 어떤 사전 검사 결과에 따라 널을 반환하거나 다른 타입의 객체를 반환할 수 없다. 생성자는 자기 자신을 반환하거나 예외만 던질 수 있기 때문이다.

```kotlin
class Order private constructor(val orderName: String) {
    object Factory {
        fun create(args: Array<String>): Order {
            val orderName = args.firstOrNull() ?: throw EntityCreationException(Order::class)
            return Order(orderName)
        }
    }
}
```

위의 경우엔는 별도로 Factory method 를 import(Order.Factory.create) 하지 않는 이상, 매번 사용 시 마다 내포된 객체의 이름을 지정해야 한다.

```kotlin
val order = Order.Factory.create(arrayOf("Coke"))
```

이때 Companion Object 를 사용하여 문제를 해결할 수 있다.

```kotlin
class Order private constructor(val orderName: String) {
    companion object Factory {
        fun create(args: Array<String>): Order {
            val orderName = args.firstOrNull() ?: throw EntityCreationException(Order::class)
            return Order(orderName)
        }
    }
}
```

```kotlin
val order = Order.create(arrayOf("Coke"))
```

Companion Object 사용 시, 이름을 지정하지 않으면 Companion 이라는 이름을 디폴트로 사용한다.

- __Constraint__
  - Companion Object 는 한 클래스에 한 개만 존재할 수 있다.
  - Java 의 static 과 차이점은, Compile 시 Companion(혹은 별도로 지정한 이름의 동반 객체) 클래스로 감싸져 컴파일된다.
  - Java 의 static 은 정적 멤버(정적 멤버 클래스)이지만 Kotlin 은 객체 인스턴스이다.
    - 따라서, Companion Object 는 다른 상위 타입을 상속할 수 있다.
  - Companion Object 에서도 init 블록을 사용할 수 있다.
    - Kotlin 클래스에는 하나 이상의 초기화 블록이 있을 수 있으며 이들은 선언 순서대로 차례로 실행된다.
    - INIT 블록은 항상 Primary 생성자 바로 다음에 호출된다.

## Inheritance and Companion Object

A companion object is not inheritable. But it can inherit from another class or implement interfaces.

```kotlin
interface Theme {
    fun someFunction(): String
}

abstract class FactoryCreator {
    abstract fun produce(): Theme
}
```

After that, let’s define classes that represent factories:

```kotlin
class FirstRelatedClass: Theme {
    companion object Factory : FactoryCreator() {
        override fun produce() = FirstRelatedClass()
    }
    override fun someFunction(): String {
        return "I am from the first factory."
    }
}

class SecondRelatedClass: Theme {
    companion object Factory : FactoryCreator() {
        override fun produce() = SecondRelatedClass()
    }
    override fun someFunction(): String {
        return "I am from the second factory."
    }
}
```

Now, we can use the design pattern:

```kotlin
fun main() {
    val factoryOne: FactoryCreator = FirstRelatedClass.Factory
    println(factoryOne.produce().someFunction())

    val factoryTwo: FactoryCreator = SecondRelatedClass.Factory
    println(factoryTwo.produce().someFunction())
}
```

- __Related Articles__
  - [Abstract Factory Pattern in Kotlin](https://www.baeldung.com/kotlin/abstract-factory-pattern)

## Java Interoperability

- __Related Articles__
  - [Access Kotlin Companion Object in Java](https://www.baeldung.com/kotlin/companion-objects-in-java)
- __@JvmStatic__
  - To access a companion object’s methods from Java, we need to mark the methods with the @JvmStatic annotation.

```kotlin
companion object {
    @JvmStatic
    fun increment(num: Int): Int {
      return num + 1
    }
}
```

```java
public class Main {
    public static void main(String[] args) {
        MethodSample.increment(1);
    }
}
```

## Interfaces and Companion Object

A companion object can be used in interfaces as well. One potential usage is storing constants and helper functions related to the interface:

```kotlin
interface MyInterface {
    companion object {
        const val PROPERTY = "value"
    }
}
```

## Links

- [Object expressions and declarations](https://kotlinlang.org/docs/object-declarations.html)
- [Kotlin Companion Object - Baeldung](https://www.baeldung.com/kotlin/companion-object)

## 참고 문헌

- 코틀린 완벽 가이드 / Aleksei Sedunov 저 / 길벗