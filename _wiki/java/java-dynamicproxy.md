---
layout  : wiki
title   : DynamicProxy
summary : 
date    : 2023-03-16 11:28:32 +0900
updated : 2023-03-16 12:15:24 +0900
tag     : java proxy spring
toc     : true
comment : true
public  : true
parent  : [[/java]]
latex   : true
---
* TOC
{:toc}

## DynamicProxy

Java 에서 Proxy 인스턴스를 런타임에 만들 수 있는 방법을 제공하는데 이를 DynamicProxy 라 한다. 즉, 애플리케이션 실행 중(runtime)에 인스턴스를 동적으로 만든다는 것이다.

- JDK 동적 프록시를 사용하면 리플렉션을 통해 런타임에 Java 인터페이스 구현을 만들 수 있다.
- JDK 동적 프록시는 인터페이스를 기반으로 프록시를 동적으로 만들어준다. 따라서 인터페이스가 필수이다.
- JDK 동적 프록시에 적용할 로직은 InvocationHandler 인터페이스를 구현하여 작성하면 된다.

Aspect Oriented Programming(AOP) 의 주요 패러다임 중 하나가 트랜잭션 관리, 로깅, 유효성 검사 등과 같은 관심사를 분리하는 것이다. 따라서
AOP 를 많이 사용하는 프레임워크가 [Proxy Mechanism](https://baekjungho.github.io/wiki/designpattern/designpattern-proxy/) 에 의존하는 것은 당연하다.

사용자 정의 프록시(user defined proxy)를 구현하기 위해서는 [InvocationHandler](https://docs.oracle.com/javase/7/docs/api/java/lang/reflect/InvocationHandler.html) 를 구현하면된다.

__InvocationHandler:__

```java
package java.lang.reflect;

public interface InvocationHandler {
    /**
     * @params proxy the proxy instance that the method was invoked on(메서드가 호출된 프록시 자신)
     * @params method 호출한 메서드
     * @params args 메서드를 호출할 때 전달한 인수
     */
    public Object invoke(Object proxy, Method method, Object[] args)
        throws Throwable;
}
```

인터페이스가 꼭 필요하다고했는데 프록시 생성할 때 Concrete Class 를 넣는다면 어떻게 될까?

```kotlin
fun main(args: Array<String>) {
    // Create target instance
    val targetInstance = TargetClass()

    // Create proxy
    val proxy = Proxy.newProxyInstance(TargetClass::class.java.classLoader, arrayOf(targetInstance.javaClass), LogExecutionTimeProxy(targetInstance)) as TargetClass

    // Invoke the target instance method through the proxy
    val result = proxy.action()
    println(result)
}
```

__Errors stackTrace:__

```kotlin
Exception in thread "main" java.lang.IllegalArgumentException: proxy.TragetClass is not an interface
```

TargetClass 를 Interface 를 사용해서 구현해보자. 프록시는 Proxy.newProxyInstance() 를 사용해서 생성할 수 있다.

__Interface:__

```kotlin
interface Target {
}
```

__TargetClass:__

```kotlin
class TargetClass: Target {

    override fun action() {
        println("do action")
    }
}
```

__User defined proxy(the one that implements the InvocationHandler interface):__

```kotlin
// 사용자 정의 프록시
class LogExecutionTimeProxy(
    private val invocationTarget: Any
): InvocationHandler {

    override fun invoke(proxy: Any, method: Method, args: Array<out Any>?): Any? {
        val startTime = System.nanoTime()

        // Invoke the method on the target instance
        val result = if (args == null) {
            method.invoke(invocationTarget)
        } else {
            method.invoke(invocationTarget, *args)
        }

        // Print the execution time
        println("Executed method " + method.name + " in "
                + (System.nanoTime() - startTime) + " nanoseconds")

        // Return the result to the caller
        return result
    }
}
```

method.invoke(invocationTarget) 는 어떤 인스턴스에 있는 메서드를 실행할 것인지를 의미한다. 따라서 인스턴스를 넣어주면 된다.

__Main:__

```kotlin
fun main(args: Array<String>) {
    // Create target instance
    val targetInstance = TargetClass()

    // Create proxy
    val proxy = Proxy.newProxyInstance(
        Target::class.java.classLoader,
        targetInstance.javaClass.interfaces,
        LogExecutionTimeProxy(targetInstance)
    ) as proxy.Target

    // Invoke the target instance method through the proxy
    proxy.action()
}
```

정상적으로 동작하는 것을 알 수 있다. 아래 처럼 람다를 사용할 수도 있다.

__Using Lambda:__

```kotlin
// Create proxy
val proxy = Proxy.newProxyInstance(
    Target::class.java.classLoader,
    targetInstance.javaClass.interfaces
) { _, method, args ->
    val startTime = System.nanoTime()

    // Invoke the method on the target instance
    val result = if (args == null) {
        method.invoke(targetInstance)
    } else {
        method.invoke(targetInstance, *args)
    }

    // Print the execution time
    println("Executed method " + method.name + " in " + (System.nanoTime() - startTime) + " nanoseconds")

    // Return the result to the caller
    result
} as Target
```

## Separation Of Concerns

The mechanism we have just seen is the basis for many Aspect Oriented Programming frameworks. 

위에서 TargetClass 가 하나라서 Proxy 의 효과가 별로 없어보이지만 로깅, 검증 등의 로직(공통 관심사)이 여러 메서드들에 대해서 존재한다고 하면 각 메서드마다 공통 관심사를 별도로 구현해야 한다.

따라서 DynamicProxy 를 사용하면 런타임에 공통 관심사 기능을 생성해서 사용할 수 있다.

## Links

- [Bytes lounge - JDK Dynamic Proxies](https://www.byteslounge.com/tutorials/jdk-dynamic-proxies)