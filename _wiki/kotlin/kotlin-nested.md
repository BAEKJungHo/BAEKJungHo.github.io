---
layout  : wiki
title   : Nested Class
summary : Nested Class and Inner Class
date    : 2022-11-18 20:54:32 +0900
updated : 2022-11-18 21:15:24 +0900
tag     : kotlin java
toc     : true
comment : true
public  : true
parent  : [[/kotlin]]
latex   : true
---
* TOC
{:toc}

## Nested Class

중첩 클래스(Nested Class, Static Inner class) 는 바깥쪽 클래스에 대한 참조를 저장하지 않는다.
- In Java: `static class A`
- In Kotlin: `class A`

__Hierarchy__:

![](/resource/wiki/kotlin-nested/nested-hierarchy.png)

## Inner class

내부 클래스(Inner Class) 는 바깥쪽 클래스에 대한 참조를 저장한다. 
- In Java: `class A`
- In Kotlin: `inner class A`

자바에서 아래와 같이 inner class 를 사용하면 Inspector 가 아래와 같은 경고를 준다.

```
A static inner class does not keep an implicit reference to its enclosing instance. This prevents a common cause of memeory leaks and uses less memeory per instance of the class
```

익명 클래스는 이름이 없는 내부 클래스이다. (Anonymous classes are inner classes with no name)

내부 클래스도 빈으로 만들 수 있다.

```kotlin
@Component
class Tx(
   _txAdvice: TxAdvice,
) {

   init {
       txAdvice = _txAdvice
   }

   companion object {
       private lateinit var txAdvice: TxAdvice

       fun <T> run(function: () -> T): T {
           return txAdvice.run(function)
       }
   }

   @Component
   class TxAdvice {

       @Transactional
       fun <T> run(function: () -> T): T {
           return function.run()
       }
   }
}
```

이 경우 빈으로 등록되는 순서는 Outer Class -> Inner Class 이다.

```java
OuterClass outerClass = new OuterClass();
OuterClass.InnerClass innerClass = outerClass.new InnerClass()
```

### Shadowing

The declaration of the members of an inner class shadow those of the enclosing class if they have the same name.

### Serialization

To avoid a java.io.NotSerializableException while attempting to serialize a nested class, we should:

- Declare the nested class as static
- Make both the nested class and the enclosing class implement Serializable

## Effective Java

> 멤버 클래스에서 바깥 인스턴스에 접근할 일이 없다면 무조건 static 을 붙여서 정적 멤버 클래스로 만들자. static 을 생략하면 바깥 인스턴스로의 숨은 외부 참조를 갖게 된다. 앞서도 얘기했듯 이 참조를 저장하려면 시간과 공간이 소비된다. 더 심각한 문제는 가비지 컬렉션이 바깥 클래스의 인스턴스를 수거하지 못하는 메모리 누수가 생길 수 있다는 점이다. 참조가 눈에 보이지 않으니 문제의 원인을 찾기 어려워 때때로 심각한 상황을 초래하기도 한다.

## Links

- [Oracle - Nested Class](https://docs.oracle.com/javase/tutorial/java/javaOO/nested.html)
- [Java Nested Class](https://www.baeldung.com/java-nested-classes)

## References

- Kotlin In Action / Dmitry Jemerov, Svetlana Isakova 공저 / 에이콘
- Effective Java 3/E / Joshua J. Bloch 저 / 인사이트