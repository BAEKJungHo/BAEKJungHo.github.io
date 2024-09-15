---
layout  : wiki
title   : Value semantics
summary : 값 의미론과 값 객체
date    : 2022-12-30 20:54:32 +0900
updated : 2022-12-30 21:15:24 +0900
tag     : kotlin java ddd
toc     : true
comment : true
public  : true
parent  : [[/kotlin]]
latex   : true
---
* TOC
{:toc}

## Value semantics

> In computer science, having value semantics (also value-type semantics or copy-by-value semantics) means for an object
> that only its value counts, not its identity. Immutable objects have value semantics trivially.

Wikipedia 에 따르면 값 의미론(Value semantics)이란 클래스에서 다루고있는 `값(value)`만 중요하다고 한다.
또한 [불변 객체(Immutable Object)](https://en.wikipedia.org/wiki/Immutable_object)는 값 의미론을 지닌다고 한다.

> 자바의 원시 타입은 모두 값 의미론을 따른다. 객체는 값 의미론을 따를 수도 있고 따르지 않을 수도 있다.

Immutable object is an object whose state cannot be modified after it is created.

불변 객체는 생성되고나서 수정이 불가능한 객체를 의미한다. 생성된 __객체의 값을 수정이 불가능(immutable)__ 하도록 만들었을 때의 장점은 해당 객체를 이리 저리 넘겨서 사용하더라도 __Side Effect__ 가 없다는 것을 보장할 수 있다. 따라서 객체를 안전하게 공유할 수 있다.

## Value Object

### Domain Driven Design

개념적 식별성이 없는 객체도 많은데, 이러한 객체는 __사물의 어떤 특징__ 을 묘사한다. Entity 와의 차이는 Entity 는 식별성을 관리한다. 모든 객체가 식별성을 갖는다면 관리도 어렵고, 시스템 성능 문제도 발생할 것이며 분석 작업도 별도로 필요하다.

개념적 식별성을 갖지 않으면서 도메인의 서술적 측면을 나타내는 객체를 __VALUE OBJECT__ 라고 한다.

> __주소(Address)는 Value Object 일까?__
> 
> 우체국에서 물건을 보낼 주소가 필요하다. 이 경우에는 여러 사람이 주문하더라도 같은 곳에 있다는 사실은 중요하지 않으므로 값 객체이다. 하지만, 우편 서비스에서 사용하는 배송 경로 추적을 위해 계층 구조 형태로 작성되어있어야 하는 주소는 ENTITY 이다. 

모델에 포함된 어떤 요소의 속성에만 관심이 있다면 그것을 VALUE OBJECT 로 분류하라. VALUE OBJECT 에서 해당 VALUE OBJECT 가 전하는 속성의 의미를 표현하게 하고 관련 기능을 부여하라. 또한 VALUE OBJECT 는 불변적(immutable)으로 다뤄라. VALUE OBJECT 에는 아무런 식별성을 부여하지 말고 ENTITY 를 유지하는 데 필요한 설계상의 복잡성을 피하라.

값을 선호하는 경우의 장점은 다음과 같다.

- 맵의 키나 집합 원소로 불변 객체를 넣을 수 있다.
- 불변 객체의 불변 컬렉션에 대해 이터레이션하는 경우 원소가 달라질지 열며할 필요가 없다.
- 초기 상태를 깊이 복사(deep copy) 하지 않고도 다양한 시나리오를 탐험할 수 있다.(불변 객체를 쓰면 되돌리기나 다시하기 등도 쉽게 구현할 수 있다.)
- 여러 스레드에서 불변 객체를 안전하게 공유할 수 있다.

### Java 

- __Money 구현에서 감춰야 하는 세부사항__
  - 이 클래스는 amount 필드의 정밀도가 currency 필드가 가리키는 통화의 보조 통화 단위와 일치하게 보장한다는 __불변 조건(invariant)__ 을 유지한다. 따라서 private constructor 가 불변 조건을 어기는 것을 막는다.
  - Money.of(BigDecimal, Currency) 와 add 메서드를 통해서 불변 조건을 유지한다.

```java
public class Money {

    private final BigDecimal amount;
    private final Currency currency;

    private Money(BigDecimal amount, Currency currency) {
        this.amount = amount;
        this.currency = currency;
    }

    public static Money of(BigDecimal amount, Currency currency) {
        return new MoneyJava(amount.setScale(currency.getDefaultFractionDigits()), currency);
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public Currency getCurrency() {
        return currency;
    }

    public Money add(MoneyJava that) {
        if (!this.currency.equals(that.currency)) {
            throw new IllegalArgumentException("cannot add Money values of different currencies");
        }
        return new Money(this.amount.add(that.amount), this.currency);
    }

    // equals, hashCode, toString
}
```

## Refactoring to Kotlin

### Use of Data class

코틀린의 Data class 는 __copy method__ 를 제공한다. 

- 컴파일러가 데이터 클래스 객체의 모든 프로퍼티 값을 그대로 복사한 객체를 생성하되, 원하면 일부를 다른 값으로 교체 가능 함
- 이 문제는 클래스가 내부 표현을 추상화하거나 프로퍼티 사이에 어떤 __불변 조건(invariant)__ 을 유지해야 하는 경우에 copy 메서드가 클라이언트 코드에 값의 내부 상테에 직접 접근하도록 불변 조건을 깰 수 있다.

__따라서, 완벽한 불변 조건을 유지해야하는 경우에는 data class 를 사용하면 안된다.__

### Use of class

```kotlin
class Money private constructor(
    val amount: BigDecimal,
    val currency: Currency
) {
    fun add(that: Money): MoneyV1 {
        require(currency == that.currency) {
            "cannot add Money values of different currencies"
        }
        return Money(amount.add(that.amount), currency)
    }

    companion object {
        @JvmStatic
        fun of(amount: BigDecimal, currency: Currency): MoneyV1 {
            return Money(amount.setScale(currency.defaultFractionDigits), currency)
        }
    }

    // equals, hashCode, toString
}
```

### Use of Operators

자바에서 코틀린으로 코드를 변환할 때 토대가 되는 코드(여러 군데에서 참조하여 사용하는 코드)를 리팩토링 하기 위해서는 JVM 코드를 생성하는 방법을 제어하는 몇 가지 어노테이션을 사용하면 코틀린의 장점과 유지 보수해야 하는 자바 코드를 위해 전형적인 자바 스타일의 API 를 제공할 수 있다.

- __AS-IS__
  - val grossPrice = netPrice.add(netPrice.mul(taxRate))
  - 산술 연산에 메서드를 사용하면 계산식이 읽기 어려워진다는 단점이 있다. 자바에서는 위 코드가 최선이지만 코틀린은 가독성을 더 개선할 수 있다.
- __TO-BE__
  - val grossPrice = netPrice + netPrice * taxPrice

```kotlin
import java.math.BigDecimal
import java.util.*

class Money private constructor(
  val amount: BigDecimal,
  val currency: Currency
) {
  override fun equals(other: Any?) =
    this === other ||
            other is Money &&
            amount == other.amount &&
            currency == other.currency

  override fun hashCode() =
    Objects.hash(amount, currency)

  override fun toString() =
    amount.toString() + " " + currency.currencyCode

  fun add(that: Money) = this + that

  operator fun plus(that: Money): Money {
    require(currency == that.currency) {
      "cannot add Money values of different currencies"
    }
    return Money(this.amount + that.amount, currency)
  }

  companion object {
    // Java 에서는 동일하게 Money.of 로 사용
    @JvmStatic
    fun of(amount: BigDecimal, currency: Currency) =
      this(amount, currency) 

    operator fun invoke(amount: BigDecimal, currency: Currency) =
      Money(
        amount.setScale(currency.defaultFractionDigits),
        currency
      )

    @JvmStatic
    fun of(amountStr: String, currency: Currency) =
      of(BigDecimal(amountStr), currency)

    @JvmStatic
    fun of(amount: Int, currency: Currency) =
      of(BigDecimal(amount), currency)

    @JvmStatic
    fun zero(userCurrency: Currency) =
      of(BigDecimal.ZERO, userCurrency)
  }
}
```

## Improve Performance 

코틀린에서는 __Inlining__ 기법을 통해서 값 객체를 사용할 때 성능을 향상시킬 수 있다.

### Inline class

Kotlin 1.3 에서는 Inline class 라는 것이 등장했다.

Inline classes are a subset of value-based classes that only hold values. Kotlin 1.3 introduced Inline classes which add the goodness of [Typealiases](https://kotlinlang.org/docs/type-aliases.html) with the value range of the primitive data types.

Inline Function 과 같이 인라이닝을 통해 성능을 최적화 한다는 장점이 있다.

- __AS-IS__
  - val price = Price(100f)
- __TO-BE__
  - val price = 100f

두 가지 장점이 있다.

1.  Developer ease : One can easily qualify the datatype by a descriptive inline class name and not worry about accidentally putting a wrong value i.e substitute value in rupees for dollars or vice versa while creating instances of the class.
2. Memory Overhead: The runtime never sees the inline class all it sees is the underlying value since the compiler does the dirty work here, so this

### Value class

Kotlin 1.5 에서는 Value class 라는 것이 등장했다. Inline class 는 이제 deprecated 되었다. 

You can use them as wrappers for a value of a certain type without the additional overhead that comes from using memory allocations.

```kotlin
value class Password(val s: String)
```

JVM 백엔드에는 특수 @JvmInline 어노테이션도 필요하다.

```kotlin
@JvmInline
value class Password(val s: String)
```

- [코틀린, 저는 이렇게 쓰고 있습니다 - Kakaopay](https://tech.kakaopay.com/post/katfun-joy-kotlin/)

## Value class to be immutable ?

Value objects are generally considered to be immutable, meaning that their state cannot be changed after they are created. This is because the primary role of a value object is to represent a specific value or set of values, and changing that value would fundamentally change the meaning of the object.

One of the main benefits of immutability is that it makes your code safer and easier to reason about. Because an immutable object cannot be changed, you don't have to worry about other parts of your code modifying it in unexpected ways, which can lead to bugs and other issues. Also, since an immutable object cannot change its state, it can be safely shared across multiple threads without the need for locks or other synchronization mechanisms.

In Java, you can make an object immutable by following these steps:
- Make all fields final and private
- Don't provide any setter methods
- Ensure that the object's state is fully initialized in the constructor
- Don't allow subclasses to override methods
- Make sure that any mutable objects stored inside the value object are also immutable or at least defensively copied.

- Here is an example of an immutable LottoNumber class:

```java
final public class LottoNumber {
    private final int number;

    public LottoNumber(int number) {
        this.number = number;
    }

    public int getNumber() {
        return number;
    }
}
```

In this example, the LottoNumber class has a single final private field, which stores the lotto number, and a constructor that initializes this field with the provided number. It also has a getter method that allows the number to be read, but no setter method that would allow the number to be modified.

Note that in this example, the LottoNumber class has no mutable objects stored.

It's worth noting that, in some cases, an object should not be immutable, and that's fine, as long as it's being used in a way that makes sense for the context of the application.

## Links

- [Design Notes on Kotlin Value Classes](https://github.com/Kotlin/KEEP/blob/master/notes/value-classes.md)
- [Kotlin and Domain-Driven Design—Value Objects](https://dev.to/flbenz/kotlin-and-domain-driven-design-value-objects-4m32)
- [Kotlin value class](https://mahendranv.github.io/posts/kotlin-value-class/#:~:text=From%20Kotlin%201.5%20%E2%80%94%20we%20have%20value%20class,sure%20there%20is%20no%20overhead%20due%20to%20wrapping.)
- [Working with kotln inline class](https://medium.com/@anvith/working-with-kotlin-inline-class-daac9822596f)

## References

- 자바에서 코틀린으로: 코틀린으로 리팩터링하기 / 냇프라이스 와 덩컨맥그레거 저 / O'REILLY
- 도메인 주도 설계 / Eric Evans 저 / 위키북스