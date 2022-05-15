---
layout  : wiki
title   : Kotlin Singleton
summary : 코틀린에서의 싱글톤과 자바의 싱글톤
date    : 2022-05-09 15:54:32 +0900
updated : 2022-05-09 20:15:24 +0900
tag     : kotlin
toc     : true
comment : true
public  : true
parent  : [[/kotlin]]
latex   : true
---
* TOC
{:toc}

## Singleton

싱글톤 패턴은 객체가 프로그램 내부에서 단 1개만 생성됨을 보장하며 멀티 스레드에서 이 객체를 공유하며 동시에 접근하는 경우에 발생하는 동시성 문제도 해결해주는 디자인 패턴이다.

## Singleton In Java

> 자바에서는 LazyHolder 라는 방식을 사용하여 싱글톤을 구현한다. Double-Checked Locking, Eager initialization, Lazy initialization 등 다양한 방법이 있지만 LazyHolder 가 JVM 의 성능을 최대로 끌어내서 사용하는 방식이다.

### Eager initialization

```java
public class Singleton {

	private static Singleton instance;
    
    static {
        instance = new Singleton();
    }
	
	private Singleton() {}
	
	public static Singleton getInstance() {
		return instance;
	}
}
```

Eager initialization 방식은 싱글톤 객체를 생성하기 위한 가장 기본적인 방식이다. Eager initialization 는 싱글톤 객체를 미리 생성해 놓는 방식이며, 항상 싱글톤 객체가 필요하거나 객체 생성비용이 크게 들어가지 않는 경우에 사용한다. 

### Lazy Holder

```java
public class Singleton {

    private Singleton() {}
    
    // private static inner class 인 LazyHolder
    private static class LazyHolder {
        // LazyHolder 클래스 초기화 과정에서 JVM 이 Thread-Safe 하게 instance 를 생성
        private static final Singleton instance = new Singleton();
    }

    // LazyHolder 의 instance 에 접근하여 반환
    public static Singleton getInstance() {
        return LazyHolder.instance;
    }
}
```

LazyHolder 는 JVM(Java Virtual Machine)의 클래스의 초기화 과정에서 원자성을 보장하는 원리를 이용하는 방식이다. getInstance() 가 호출되면 LazyHolder 의 instance 변수에 접근하는데, 이때 LazyHolder 가 static class 이기 때문에 클래스의 초기화 과정이 이루어진다.

LazyHolder 클래스가 초기화 되면서 instance 객체의 생성도 이루어 지는데, JVM 은 이러한 클래스 초기화 과정에서 원자성을 보장한다.

따라서, final 로 선언한 instance 는 getInstance() 호출 시 LazyHolder 클래스의 초기화가 이루어 지면서 원자성이 보장된 상태로 단 한번 생성되고, final 변수 이므로 이후로 다시 instance 가 할당되는 것 또한 막을 수 있다.

이러한 방법에 장점은 Synchronized 를 사용하지 않아도 JVM 자체가 보장하는 원자성을 사용하여 Thread-Safe 하게 싱글톤 패턴을 구현할 수 있는 것이다.

> [위키피디아](https://en.wikipedia.org/wiki/Initialization-on-demand_holder_idiom)를 참고하면 JVM 의 클래스 초기화 과정에서 원자성을 보장한다는 내용을 조금 더 자세히 살펴볼 수 있다.
>
> Since the class initialization phase is guaranteed by the JLS to be sequential, i.e., non-concurrent, no further synchronization is required in the static getInstance method during loading and initialization.

Java Language Specification 에 명시된 대로 JVM 의 클래스 초기화 과정이 sequential, non-concurrent 하므로, 추가적인 Synchronized 를 사용하여 스레드 동기화를 더 할 필요가 없다는 걸 알 수 있다.

## Singleton In Kotlin

> Kotlin 에서는 object 라는 키워드를 사용하여 쉽게 싱글톤 객체를 만들 수 있다.

```kotlin
object Singleton {
    fun run() {
        // do Something
    }
}
```

해당 코드를 디컴파일해보면 다음과 같이 되어있다.

```java
public final class Singleton {
   @NotNull
   public static final Singleton INSTANCE;

   public final void run() {
   }

   private Singleton() {
   }

   static {
      Singleton var0 = new Singleton();
      INSTANCE = var0;
   }
}
```

static 블럭은 클래스 로딩의 마지막 단계인 초기화 단계에서 실행된다. 초기화 단계에서 모든 정적 변수는 원래 값으로 할당되고 정적 블록(static block)이 실행된다.

따라서, 코틀린의 object 는 클래스 로딩 시점에 메모리에 올라가는 것을 알 수 있고, Eager initialization 으로 구현한 방식과 동일하다. 따라서, 자바로 직접 구현한 LazyHolder 방식보다는 성능이 떨어진다.

### Lazy Holder

코틀린에서는 다음과 같이 Lazy Holder 방식을 사용하여 싱글톤 객체를 구현할 수 있다.

```kotlin
class Singleton private constructor() {
    init {
        "This is {$this} singleton".also(::println)
    }

    private object LazyHolder {
        val INSTANCE = Singleton()
    }

    companion object {
        val instance: Singleton by lazy { LazyHolder.INSTANCE }
    }
}
```

companion object 를 만들어서 lazy 에 의해 위임된 속성 인스턴스를 제공한다. 즉, instance 가 Singleton 객체의 책임을 갖는다는 것을 의미한다.

따라서 아래와 같이 객체를 생성하지 않고 바로 사용할 수 있다.

```kotlin
fun main(args: Array<String>) {
    Singleton.instance
}
```

## Links

- [Singleton Pattern in Kotlin](https://pranaybhalerao.wordpress.com/2018/06/22/singleton-pattern-in-kotlin/)
