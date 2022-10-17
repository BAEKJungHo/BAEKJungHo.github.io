---
layout  : wiki
title   : Kotlin Delegate
summary : 코틀린의 위임
date    : 2022-05-24 15:54:32 +0900
updated : 2022-05-24 20:15:24 +0900
tag     : kotlin
toc     : true
comment : true
public  : true
parent  : [[/kotlin]]
latex   : true
---
* TOC
{:toc}

## Delegate

> 위임은 객체가 직접 작업을 수행하지 않고 다른 도우미 객체가 그 작업을 처리하게 맡기는 디자인 패턴을 의미한다. 이때 작업을 처리하는 도우미 객체를 위임 객체(delegate) 라고 부른다.

2019년 한국 코틀린 행사에서 Pluu 님이 발표했던 Kotlin 을 여행하는 히치하이커의 준비서를 보면 자세하게 설명하고 있으니 참고하면 좋다.

<script async="" class="speakerdeck-embed" data-id="fcd3b563bce247fe86f66b8d29d08324" data-ratio="1.77777777777778" src="//speakerdeck.com/assets/embed.js"></script>

## Delegation Property

kotlin.properties.ReadOnlyProperty, kotlin.properties.ReadWriteProperty 두 개를 각각 상속받아 property 활용이 가능하다.

![]( /resource/wiki/kotlin-delegate/delgate.png)

> Origin. [What does ‘by’ keyword do in Kotlin? - StackOverflow](https://stackoverflow.com/questions/38250022/what-does-by-keyword-do-in-kotlin)

### Syntax

The syntax is:

```kotlin
val/var <property name>: <Type> by <expression>. 
```

위임 프로퍼티의 일반적인 문법은 다음과 같다.

```kotlin
class Foo {
    var p: Type by Delegate()
}
```

컴파일 결과는 다음과 같다.

```kotlin
class Foo {
    private val delegate = Delegate()
    var p: Type
    set(value: Type) = delegate.setValue(..., value)
    get() = delegate.getValue(...)
}
```

프로퍼티 위임 관례를 따르는 Delegate 클래스는 `getValue` 와 `setValue` 메서드를 제공해야 한다.(단, 변경 가능한 프로퍼티만 setValue 를 필요로 한다.)

```kotlin
class Delegate {
    // for get() method, ref - a reference to the object from 
    // which property is read. prop - property
    operator fun getValue(ref: Any?, prop: KProperty<*>) = "textA"
    // for set() method, 'v' stores the assigned value
    operator fun setValue(ref: Any?, prop: KProperty<*>, v: String) {
        println("value = $v")
    }
}
```

### lazy initialization

> 지연 초기화(lazy initialization)는 객체의 일부분을 초기화하지 않고 남겨뒀다가 실제로 그 부분이 값이 필요할 경우 초기화할 때 흔히 쓰이는 패턴이다.
> 초기화 과정에 자원을 많이 사용하거나 객체를 사용할 때마다 꼭 초기화하지 않아도 되는 프로퍼티에 대해 지연 초기화 패턴을 사용할 수 있다.

The syntax is:

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

## Delegation Interface

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

## Delegation parameters

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

## Links

- [Delegated properties](https://kotlinlang.org/docs/delegated-properties.html)
- [What does ‘by’ keyword do in Kotlin? - StackOverflow](https://stackoverflow.com/questions/38250022/what-does-by-keyword-do-in-kotlin)
- [Kotlin Delegation](https://thdev.tech/kotlin/2020/11/27/kotlin_delegation/)

## References

- Kotlin In Action / Dmitry Jemerov, Svetlana Isakova 공저 / 에이콘