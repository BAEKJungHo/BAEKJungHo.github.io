---
layout  : wiki
title   : Delegates
summary : 
date    : 2024-06-21 15:54:32 +0900
updated : 2024-06-21 20:15:24 +0900
tag     : kotlin designpattern
toc     : true
comment : true
public  : true
parent  : [[/kotlin]]
latex   : true
---
* TOC
{:toc}

## Delegates

__Delegation Design Pattern__:

```java
class A {
    void foo() {
        // "this" also known under the names "current", "me" and "self" in other languages
        this.bar();
    }

    void bar() {
        print("a.bar");
    }
}

class B {
    private delegate A a; // delegation link

    public B(A a) {
        this.a = a;
    }

    void foo() {
        a.foo(); // call foo() on the a-instance
    }

    void bar() {
        print("b.bar");
    }
}

a = new A();
b = new B(a); // establish delegation between two objects
```

위임은 객체가 직접 작업을 수행하지 않고 다른 도우미 객체가 그 작업을 처리하게 맡기는 디자인 패턴을 의미한다. 이때 작업을 처리하는 도우미 객체를 위임 객체(delegate) 라고 부른다.

<script async="" class="speakerdeck-embed" data-id="fcd3b563bce247fe86f66b8d29d08324" data-ratio="1.77777777777778" src="//speakerdeck.com/assets/embed.js"></script>

### Delegation Property

kotlin.properties.ReadOnlyProperty, kotlin.properties.ReadWriteProperty 두 개를 각각 상속받아 property 활용이 가능하다.

![]( /resource/wiki/kotlin-delegate/delgate.png)

> Origin. [What does ‘by’ keyword do in Kotlin? - StackOverflow](https://stackoverflow.com/questions/38250022/what-does-by-keyword-do-in-kotlin)

__Example__:

```kotlin
import kotlin.reflect.KProperty

class Example {
    var p: String by Delegate()
}

class Delegate {
    operator fun getValue(thisRef: Any?, property: KProperty<*>): String {
        return "$thisRef, thank you for delegating '${property.name}' to me!"
    }

    operator fun setValue(thisRef: Any?, property: KProperty<*>, value: String) {
        println("$value has been assigned to '${property.name}' in $thisRef.")
    }
}

val e = Example()
println(e.p) // Example@33a17727, thank you for delegating 'p' to me!
```

프로퍼티 위임 관례를 따르는 Delegate 클래스는 `getValue` 와 `setValue` 메서드를 제공해야 한다.(단, 변경 가능한 프로퍼티만 setValue 를 필요로 한다.)

### lazy initialization

__지연 초기화(lazy initialization)__ 는 객체의 일부분을 초기화하지 않고 남겨뒀다가 실제로 그 부분이 값이 필요할 경우 초기화할 때 흔히 쓰이는 패턴이다.

초기화 과정에 자원을 많이 사용하거나 객체를 사용할 때마다 꼭 초기화하지 않아도 되는 프로퍼티에 대해 지연 초기화 패턴을 사용할 수 있다.

__Syntax__:

```kotlin
public actual fun <T> lazy(initializer: () -> T): Lazy<T> = SynchronizedLazyImpl(initializer)
```

결국 by 이후에 오는 lazy 에게 프로퍼티 생성을 위임하고, lazy 의 내부 동작에 따라 코드를 초기화한다.

Lazy 의 최상위는 interface 로 구성되어 있고, property 인 value 와 함수인 isInitialized 로 구성되어 있다.
결국 value 는 Properties 를 getter 로 구성해 값을 리턴하는데, 이때 lazy 패턴을 활용하는 형태로 구성되어 있다.

```java
/**
 * Represents a value with lazy initialization.
 *
 * To create an instance of [Lazy] use the [lazy] function.
 */
public interface Lazy<out T> {
    /**
     * Gets the lazily initialized value of the current Lazy instance.
     * Once the value was initialized it must not change during the rest of lifetime of this Lazy instance.
     */
    public val value: T

    /**
     * Returns `true` if a value for this Lazy instance has been already initialized, and `false` otherwise.
     * Once this function has returned `true` it stays `true` for the rest of lifetime of this Lazy instance.
     */
    public fun isInitialized(): Boolean
}
```

by lazy {} 를 사용하는 경우 기본적으로 SynchronizedLazyImpl 를 사용하게 된다. 

```kotlin
private class SynchronizedLazyImpl<out T>(initializer: () -> T, lock: Any? = null) : Lazy<T>, Serializable {
    private var initializer: (() -> T)? = initializer
    @Volatile private var _value: Any? = UNINITIALIZED_VALUE
    // final field is required to enable safe publication of constructed instance
    private val lock = lock ?: this

    override val value: T
        get() {
            val _v1 = _value
            if (_v1 !== UNINITIALIZED_VALUE) {
                @Suppress("UNCHECKED_CAST")
                return _v1 as T
            }

            return synchronized(lock) {
                val _v2 = _value
                if (_v2 !== UNINITIALIZED_VALUE) {
                    @Suppress("UNCHECKED_CAST") (_v2 as T)
                } else {
                    val typedValue = initializer!!()
                    _value = typedValue
                    initializer = null
                    typedValue
                }
            }
        }

    override fun isInitialized(): Boolean = _value !== UNINITIALIZED_VALUE

    override fun toString(): String = if (isInitialized()) value.toString() else "Lazy value not initialized yet."

    private fun writeReplace(): Any = InitializedLazyImpl(value)
}
```

외부에서 value 를 호출하면 value 안에 있는 get() 에서 이를 늦은 처리하도록 한다.

따라서, by lazy {} 호출 시 lazy 에게 위임해 내부 코드의 동작에 따라 delegation 처리를 함을 알 수 있다.

지연 초기화를 위임 프로퍼티를 통해 구현하면 다음과 같다.

```kotlin
class Person(val name: String) {
    val emails by lazy { loadEmails(this) }
}
```

lazy 함수는 코틀린 관례에 맞는 시그니처의 getValue 메서드가 들어있는 객체를 반환한다.
따라서, lazy 를 by 키워드와 함께 사용해 위임 프로퍼티를 만들 수 있다.

lazy 함수는 기본적으로 `Thread-safe` 하다. 하지만, SynchronizedLazyImpl 에서 보면 알 수 있듯이
필요에 따라 동기화에 사용할 락을 함수의 인자로 전달할 수 있으며, 멀티 스레드 환경에서 사용하지 않을 프로퍼티를 위해
lazy 함수가 동기화를 하지 못하게 막을 수도 있다.

### Delegation Interface

상속대신 위임을 사용할 수 있다.

```kotlin
interface BaseInterface {
    val value: String
    fun f()
}

class ClassA: BaseInterface {
    override val value = "property from ClassA"
    override fun f() { println("fun from ClassA") }
}

// The ClassB can implement the BaseInterface by delegating all public 
// members from the ClassA.
class ClassB(classA: BaseInterface): BaseInterface by classA {}

object SampleBy {
    @JvmStatic fun main(args: Array<String>) {
        val classB = ClassB(ClassA())
        println(classB.value)
        classB.f()
    }
}
```

결과는 다음과 같다.

```idle
property from ClassA
fun from ClassA
```

### Delegation Parameters

```kotlin
// for val properties Map is used; for var MutableMap is used
class User(mapA: Map<String, Any?>, mapB: MutableMap<String, Any?>) {
    val name: String by mapA
    val age: Int by mapA
    var address: String by mapB
    var id: Long by mapB
}

object SampleBy {
    @JvmStatic fun main(args: Array<String>) {
        val user = User(mapOf("name" to "John", "age" to 30),
            mutableMapOf("address" to "city, street", "id" to 5000L))

        println("name: ${user.name}; age: ${user.age}; " +
            "address: ${user.address}; id: ${user.id}")
    }
}
```

결과는 다음과 같다.

```idle
name: John; age: 30; address: city, street; id: 5000
```

### Delegate Observable

[Delegate Observable](https://kotlinlang.org/docs/delegated-properties.html#observable-properties) 을 사용하면 Logging, Validation 에 활용할 수 있다.

__Logging__:

```kotlin
import kotlin.properties.Delegates

class Settings {
    var volume: Int by Delegates.observable(0) { property, oldValue, newValue ->
        logChange(property.name, oldValue, newValue)
    }

    private fun logChange(propertyName: String, oldValue: Int, newValue: Int) {
        println("Property '$propertyName' changed from $oldValue to $newValue")
        // 실제 로깅 로직을 여기에 추가합니다.
    }
}

fun main() {
    val settings = Settings()
    settings.volume = 5
    settings.volume = 10
}
```

__Validation__:

```kotlin
import kotlin.properties.Delegates

class Product {
    var price: Double by Delegates.observable(0.0) { property, oldValue, newValue ->
        validatePrice(newValue)
    }

    private fun validatePrice(newPrice: Double) {
        if (newPrice < 0) {
            throw IllegalArgumentException("Price cannot be negative")
        }
        println("Price is valid: $newPrice")
    }
}

fun main() {
    val product = Product()
    product.price = 19.99
    product.price = -5.0  // 이 줄은 예외를 발생시킵니다.
}
```

## Links

- [Delegated properties](https://kotlinlang.org/docs/delegated-properties.html)
- [Kotlin Delegation](https://thdev.tech/kotlin/2020/11/27/kotlin_delegation/)

## References

- Kotlin In Action / Dmitry Jemerov, Svetlana Isakova 공저 / 에이콘