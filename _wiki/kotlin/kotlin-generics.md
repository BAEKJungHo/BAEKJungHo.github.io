---
layout  : wiki
title   : Generics
summary : 
date    : 2022-12-19 20:54:32 +0900
updated : 2022-12-19 21:15:24 +0900
tag     : kotlin java
toc     : true
comment : true
public  : true
parent  : [[/kotlin]]
latex   : true
---
* TOC
{:toc}

## Generics Background

제네릭의 탄생 배경은 __특정 타입만 다루는 클래스, 함수를 만들기 위함__ 이다. Generic 이 없던 시절에는 List 에 여러 타입의 값들이 담겼을 것이다. 이 값들을 꺼내서 사용하려면 __type casting__ 을 거쳐야 한다. 즉, 내가 사용하고자 하는 타입으로 변환을 해줘야 한다.

## Type Parameter

타입 파라미터는 __특정 타입을 다루는 클래스, 함수를 만들기 위한 파라미터를 의미__ 한다. `<T>` 와 같은 것을 타입 파라미터라고 한다. 그리고 `T` 를 __제네릭 타입(generic type)__ 이라고 한다.

```kotlin
// fun 뒤에있는 <T> 가 타입 파라미터이다.
// 타입 파라미터는 수신 객체와 반환 타입에 쓰인다.
fun <T> List<T>.slice(indices: IntRange): List<T>
```

## Raw Type

자바에서는 타입 파라미터를 지정하지 않은 Raw Type 을 사용할 수 있다. 하지만 코틀린에서는 이를 허용하지 않는다. 코틀린에서는 구체적인 타입을 지정하거나, 타입 추론이 가능해야 한다.

### Extension Property

일반 프로퍼티가 아닌 확장 프로퍼티만 제네릭하게 만들 수 있다.

```kotlin
val <T> List<T>.penultimate: T
    get() = this[size - 2]

println(listOf(1, 2, 3, 4).penultimate)
```

## Generic class

```kotlin
interface List<T> {
    operator fun get(index: Int): T
}
```

## Bounded Generics

__타입 파라미터 제약(Type parameter constraint)__ 은 클래스나 함수에 사용할 수 있는 타입 인자를 제한하는 기능이다.

```kotlin
// Upper Bound - 숫자 타입으로 제한
fun <T: Number> List<T>.sum(): T
```

아래는 비교 가능한 타입으로 제한하는 코드이다.

```kotlin
fun <T: Comparable<T>> max(first: T, second: T): T {
    return if (first > second) first else second
}
```

where 를 사용하여 타입 파라미터에 여러 제약을 추가할 수 있다.

```kotlin
fun <T> ensureTrailingPeriod(seq: T) where T: CharSequence, T: Appendable {
    if (!seq.endsWith('.')) { // CharSequence 의 확장 함수 호출
        seq.append('.') // Appendable 의 Interface 호출
    }
}
```

코틀린은 기본적으로 T 는 Any? 취급이 된다. 따라서 널이 될 수 없는 타입으로 한정하고 싶은 경우에는 아래처럼 제약을 걸어야 한다.

```kotlin
class Processor<T: Any> {
    fun process(value: T) {
        value.hashCode()
    }
}
```

Null 이 될 수 있는 타입이 들어오면 Error: Type argument is not within its bounds: should be subtype of 'Any' 라는 에러를 내뱉는다.

## Type Erasure

> Type erasure can be explained as the process of enforcing type constraints only at compile time and discarding the element type information at runtime.

- [Java Language Specification: Type Erasure](https://docs.oracle.com/javase/specs/jls/se8/html/jls-4.html#jls-4.6)

JVM 의 제네릭스는 보통 __타입 소거(type erasure)__ 를 사용해 구현된다. 이는 실행 시점에 제네릭 클래스의 인스턴스에 타입 인자 정보가 들어있지 않다는 것이다.

```java
public static  <E> boolean containsElement(E [] elements, E element){
    for (E e : elements){
        if(e.equals(element)){
            return true;
        }
    }
    return false;
}
```

The compiler replaces the unbound type E with an actual type of Object:

```java
public static  boolean containsElement(Object [] elements, Object element){
    for (Object e : elements){
        if(e.equals(element)){
            return true;
        }
    }
    return false;
}
```

__Therefore the compiler ensures type safety of our code and prevents runtime errors.__

코틀린에서는 __inline__ 을 통해서 타입 인자가 지워지지 않도록 할 수 있다. 이것을 __실체화(reify)__ 라고 한다.

### Star projection

인자를 알 수 없는 제네릭 타입을 표현할 때, 자바에서는 `List<?>` 를 사용하며 코틀린에서는 `List<*>` 를 사용한다.

```kotlin
fun printSum(c: Collection<*>) {
    val intList = c as? List<Int> // warning - Unchecked cast: List<*> to List<Int>
        ?: throw IllegalArgumentException()
    println(intList.sum())
}

printSum(listOf(1, 2, 3)) // 정상 동작
```

코틀린 컴파일러는 안전하지 못한 `is` 검사는 금지하고 위험한 `as` 캐스팅은 경고를 출력한다.

## Reify

코틀린 제네릭 타입의 타입 인자 정보는 실행 시점에 지워진다. 따라서 제네릭 클래스의 인스턴스가 있어도 그 인스턴스를 만들 때 사용한 타입 인자를 알아낼 수 없다. 하지만 [inline](https://baekjungho.github.io/wiki/kotlin/kotlin-inline/) 키워드를 붙인 함수의 경우에는 이러한 제약을 피할 수 있다.

__inline 을 붙이면 컴파일러가 인라인 함수의 본문을 구현한 바이트 코드를 그 함수가 호출되는 모든 지점에 삽입한다.__

```kotlin
// 컴파일 가능
inline fun <reified T> isA(value: Any) = value is T
```

### filterIsInstance

표준 라이브러리 함수인 filterIsInstance 는 컬렉션의 원소 중에서 타입 인자로 지정한 클래스의 인스턴스만을 모아서 만든 리스트를 반환한다.

```kotlin
val items = listOf("one", 2, "three")
println(items.filterIsInstance<String()) // one, three
```

## Variance

변성(Variance) 개념은 `List<String>`, `List<Any>` 와 같이 기저 타입이 같고 타입 인자가 다른 여러 타입이 서로 어떤 관계가 있는지 설명하는 개념이다.

- [Kotlin Generics - Variance](https://kotlinlang.org/docs/generics.html#variance)

> One of the trickiest aspects of Java's type system is the wildcard types. Kotlin doesn't have these. Instead, Kotlin has declaration-site variance and type projections
> 
> Let's think about why Java needs these mysterious wildcards. The problem is explained well in Effective Java, 3rd Edition, Item 31: Use bounded wildcards to increase API flexibility. First, generic types in Java are invariant, meaning that `List<String>` is not a subtype of `List<Object>`. If List were not invariant, it would have been no better than Java's arrays, as the following code would have compiled but caused an exception at runtime

```java
// Java
List<String> strs = new ArrayList<String>();
List<Object> objs = strs; // !!! A compile-time error here saves us from a runtime exception later.
objs.add(1); // Put an Integer into a list of Strings
String s = strs.get(0); // !!! ClassCastException: Cannot cast Integer to String
```

> Joshua Bloch gives the name Producers to objects you only read from and Consumers to those you only write to. He recommends:
> 
> "For maximum flexibility, use wildcard types on input parameters that represent producers or consumers", and proposes the following mnemonic:
>
> PECS stands for Producer-Extends, Consumer-Super.

### Sub Types

타입 사이의 관계를 논하기 위해서는 하위 타입(subtype)이라는 개념을 알아야 한다. 어떤 타입 A의 값이 필요한 모든 장소에 어떤 타입 B의 값을 넣어도 아무 문제가 없다면 타입 B 는 타입 A 의 하위 타입이다. 상위 타입(supertype)은 그 반대이다.

### Invariant

제네릭 타입을 인스턴스화할 때 타입 인자로 서로 다른 타입이 들어가면 인스턴스 타입 사이의 하위 타입 관계가 성립하지 않으면 그 제네릭 타입을 __무공변(invariant)__ 이라고 한다. 자바에서는 모든 클래스가 무공변이다.

### Covariant

> Covariant - 하위 타입의 관계를 유지

A 가 B 의 하위 타입이면 `List<A>` 는 `List<B>` 의 하위 타입이다. 이런 클래스나 인터페이스를 __공변적(covariant)__ 이라고 한다.

예를 들어 Cat 이 Animal 의 하위 타입이기 때문에 `Producer<Cat>` 이 `Producer<Animal>` 의 하위 타입이다. 코틀린에서 제네릭 클래스가 타입 파라미터에 대해 공변적임을 표시하려면 타입 파라미터 이름 앞에 `out` 을 넣어야 한다.

```kotlin
// interface 가 T 에 대해 공변적이다.
interface Producer<out T> {
    fun produce(): T
}
```

무공변은 Upper Bound 를 사용하여 아래와 같이 설계할 수 있다.

```kotlin
class Herd<T: Animal> { ... }

// Herd<Cat> 과 Herd<Animal> 은 서로 아무 관계가 없다.
```

### In and Out

T 가 함수의 반환 타입에 쓰인다면 T 는 __out__ 위치에 있다. 그 함수는 T 타입의 값을 __생산(produce)__ 한다. T 가 함수의 파라미터 타입에 쓰인다면 T 는 __in__ 위치에 있다. 그런 함수는 T 타이브이 값을 __소비(consumer)__ 한다.

- __Covariant - out is producer__
- __Contravariance - in is consumer__

```kotlin
interface Comparator<in T> { // T 의 값을 소비만 한다.
    fun complete(e1: T, e2: T): Int { ... } // T 를 in 위치에 사용
}
```

### Contravariance

반공변성(contravariance)은 공변성의 반대이다. 예를 들면 `Consumer<Animal>` 이 `Consumer<Cat>` 의 하위 타입이다.

in keyword 와 같이 사용된다.

| Covariant                        | Contravariance                  | Invariant       |
|----------------------------------|---------------------------------|-----------------|
| `Producer<out T>`                | `Consumer<in T>`                | `MutableList<T>` |
| 타입 인자의 하위 타입 관계가 제네릭 타입에서도 유지된다. | 타입 인자의 하위 타입 관계가 제네릭 타입에서 뒤집힌다. | 하위 타입 관계가 성립하지 않는다.|
| T 를 out 위치에서만 사용할 수 있다. | T 를 in 위치에서만 사용할 수 있다. | T 를 아무 위치에서 사용할 수 있다. |

### Other case

사용 지점 변성이라는게 있다. MutableList 와 같이 상당수의 인터페이스는 파라미터로 지정된 타입을 __소비 하는 동시에 생산도 할 수 있기 때문에__ 일반적으로 무공변적이다. 하지만 그런 인터페이스의 타입의 변수가 한 함수안에서 생산자(producer) 또는 소비자(consumer) 의 역할만을 담당하는 경우가 자주 있다.

```kotlin
// source 원소 타입은 destination 원소의 하위 타입이어야 한다.
fun <T: R, R> copyData(source: MutableList<T>, destination: MutableList<R>) {
    for (item in source) { // source - consumer
        destination.add(item) // destination - producer
    }
}
```

위 코드를 out 프로젝션 타입 파라미터를 사용하여 구현할 수 도 있다.

```kotlin
// source 를 in 위치에 사용하지 않겠다는 의미 = consumer 역할로 사용하지 않겠다는 의미이다.
fun <T> copyData(source: MutableList<out T>, destination: MutableList<T>) {
    for (item in source) { // source - consumer
        destination.add(item) // destination - producer
    }
}
```

## Links

- [Type Erasure in Java Explained](https://www.baeldung.com/java-type-erasure)
- [Toby - Generics](https://www.youtube.com/watch?v=ipT2XG1SHtQ)

## References

- Kotlin In Action / Dmitry Jemerov, Svetlana Isakova 공저 / 에이콘
- 코틀린 완벽 가이드 / Aleksei Sedunov 저 / 길벗