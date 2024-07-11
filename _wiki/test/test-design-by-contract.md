---
layout  : wiki
title   : Design by Contract
summary : 
date    : 2024-07-11 10:25:32 +0900
updated : 2024-07-11 10:29:24 +0900
tag     : test contract kotlin
toc     : true
comment : true
public  : true
parent  : [[/test]]
latex   : true
---
* TOC
{:toc}

## Design by Contract

A _[contract](https://kt.academy/article/ak-contracts#the-meaning-of-a-contract)_ is a set of expectations on an element, library, or service. By “contract”, we mean what is "promised" by the creators of this solution in documentation, comments, or by explicit code structures.

클래스를 설계할 때 대부분 __제약 사항(constraints)__ 이 따른다. 예를 들면, "TaxCalculator 클래스가 수행하는 계산은 양수일 때만 가능하다" 와 같은 제약 사항이 있을 수 있다.

이렇게 __Constraints Modeling__ 을 하기 위한 방법으로 일반적으로 3가지 선택지가 있다.

- 클라이언트 클래스가 유효하지 않은 입력으로, 서버 클래스를 절대로 호출하지 못하도록 한다.
- 유효하지 않은 입력이 발생하면 예외를 발생 시켜, 시스템을 중단하고 사용자에게 에러 메시지를 전달한다.
    - 이 방법은 복잡성이 증가하지만 시스템을 탄력적(resilience)으로 만든다.
- 개발 중인 각 클래스에 대해 명확한 계약을 정의한다. 계약은 각 클래스가 사전 조건(pre-conditions)으로 무엇을 요구하는지, 사후 조건(post-conditions)으로 무엇을 제공하는지, 불변식(invariants)은 클래스에 대해 항상 무엇을 유지하도록 하는지를 명확하게 설계한다. 이 방법은 __계약에 의한 설계(_[Design by Contract](https://en.wikipedia.org/wiki/Design_by_contract)_)__ 에 따른 모델링 활동이다.

### Pre/Post Conditions

Pre/Post Conditions 으로 대표적인 예는 _[Bean Validation](https://baekjungho.github.io/wiki/spring/spring-validation/#bean-validation)_ 이 있다. 생소하지만 [Contracts for Java](https://github.com/nhatminhle/cofoja) 도 있다.
IntelliJ 에서도 @Nullable, @NotNull 과 같은 Annotation 을 제공한다.

__BankAccount__:

```kotlin
import java.lang.IllegalArgumentException

class BankAccount(private var balance: Double) {
    
    init {
        // pre-conditions
        require(balance >= 0) { "Initial balance cannot be negative" }
    }

    /**
     * 입금 메서드
     * @param amount 입금할 금액 (양수)
     * @throws IllegalArgumentException 입금할 금액이 0보다 작거나 같으면 예외 발생
     */
    fun deposit(amount: Double) {
        // pre-conditions
        require(amount > 0) { "Deposit amount must be positive" }
        
        val oldBalance = balance
        balance += amount
        
        // post-conditions
        assert(balance == oldBalance + amount) { "Balance calculation error" }
    }

    /**
     * 출금 메서드
     * @param amount 출금할 금액 (양수)
     * @return 출금된 금액
     * @throws IllegalArgumentException 출금할 금액이 0보다 작거나 같으면 예외 발생
     * @throws IllegalStateException 잔고가 출금할 금액보다 적으면 예외 발생
     */
    fun withdraw(amount: Double): Double {
        // pre-conditions
        require(amount > 0) { "Withdraw amount must be positive" }
        require(balance >= amount) { "Insufficient balance" }
        
        val oldBalance = balance
        balance -= amount
        
        // post-conditions
        assert(balance == oldBalance - amount) { "Balance calculation error" }
        
        return amount
    }
}
```

JavaDoc(_[How to Write Doc Comments for the Javadoc Tool](https://www.oracle.com/kr/technical-resources/articles/java/javadoc-tool.html)_) 으로 메서드의 계약(사전 조건, 사후 조건 등)을 잘 기술해야 한다.

- [Kotlin Contracts](https://kt.academy/article/ak-contracts) / [Baeldung](https://www.baeldung.com/kotlin/contracts)
- [DESIGN BY CONTRACT WITH F#](https://laurent.le-brun.eu/site/index.php?post/2008/03/26/32-design-by-contract-with-fsharp)

### Invariants

메서드의 사전, 사후 모두의 경우에서 유지되어야 하는 조건을 __불변식(invariants)__ 이라 한다. 따라서 불변식은 객체의 Lifecycle 전반에 걸쳐 조건이 충족되어야 한다.
예를 들면, 장바구니에 더하거나 뺄 때 제품과는 상관 없이 장바구니에 있는 제품의 합계는 절대 음수가 될 수 없다.

__Temperature__:

```kotlin
import java.lang.IllegalArgumentException

class Temperature(private val celsius: Double) {

    init {
        require(celsius >= -273.15) { "Celsius temperature cannot be below absolute zero" }
    }

    fun toFahrenheit(): Double {
        // 섭씨를 화씨로 변환하는 공식: °F = °C × 9/5 + 32
        val fahrenheit = celsius * 9 / 5 + 32
        
        // 변환 후에도 불변식 유지
        assert(isValidFahrenheit(fahrenheit)) { "Invariant broken: Converted Fahrenheit temperature is invalid" }
        
        return fahrenheit
    }

    private fun isValidFahrenheit(fahrenheit: Double): Boolean {
        // 화씨 온도는 -459.67°F(절대 영도)보다 낮을 수 없음
        return fahrenheit >= -459.67
    }
}
```

불변식은 메서드 실행 도중 유지되지 않을 수 있다. 메서드는 알고리즘의 일부인 불변량을 잠시 깨뜨릴 수 있다. 하지만 메서드는 결국에는 불변식이 유지되도록 보장할 필요가 있다.

__Test Code__:

```kotlin
import io.kotest.core.spec.style.StringSpec
import io.kotest.matchers.doubles.shouldBeLessThanOrEqual
import io.kotest.matchers.shouldBe
import io.kotest.property.checkAll

class TemperatureTest : StringSpec({

    "Temperature conversion: Celsius to Fahrenheit" {
        val temperature = Temperature(0.0)
        temperature.toFahrenheit() shouldBe 32.0
    }

    "Temperature initialization: invalid Celsius value should throw IllegalArgumentException" {
        shouldThrow<IllegalArgumentException> {
            Temperature(-300.0)
        }
    }

    "Invariant check: Converted Fahrenheit temperature should be valid" {
        val temperature = Temperature(100.0)
        val fahrenheit = temperature.toFahrenheit()
        fahrenheit shouldBeLessThanOrEqual 212.0
    }

    "Property-based testing: Temperature conversion consistency" {
        checkAll<Double> { celsius ->
            val temperature = Temperature(celsius)
            val fahrenheit = temperature.toFahrenheit()
            val convertedBack = (fahrenheit - 32) * 5 / 9
            convertedBack shouldBe celsius
        }
    }
})
```

High _[Coverage](https://baekjungho.github.io/wiki/test/test-coverage/)_ 를 달성하기 위해 _[PropertyBasedTesting](https://baekjungho.github.io/wiki/test/test-property-based-test/)_ 이 적용된 것을 볼 수 있다.

### Contract Change and Liskov Substitution Principles

현업에서는 클래스나 메서드의 계약을 정의한 후에 변경이 생기지 않도록 할 수는 없을지라도, 그 __영향(_[SideEffect](https://en.wikipedia.org/wiki/Side_effect_(computer_science))_)__ 을 파악해야 한다. 따라서 계약의 변경이 __테스트 및 품질__ 과 관련이 있음을 보여준다.
SideEffect 를 확인하는 방법은 변경된 클래스를 사용하는 ___[Dependency](https://baekjungho.github.io/wiki/spring/spring-di/)___ 를 확인하는 것이다.

### Validation Versus Contract

__유효성 검사(_[Validation](https://baekjungho.github.io/wiki/spring/spring-validation/)_)__ 와 __계약(_[contract](https://www.cs.unc.edu/~stotts/COMP145/CRC/DesByContract.html)_)__ 간의 차이를 살펴보자.

유효성 검사는 사용자로부터 들어올 수 있는 invalid data 가 시스템에 침투하지 않도록 한다. 즉, 클라이언트로 부터 전달 받은 데이터가 올바른지 확인하고 그렇지 않은 경우 메시지를 반환한다.
반면 계약은 클래스 간의 의사소통이 문제 없이 일어나도록 한다. 예를 들어 A 클래스에서 B 클래스를 호출하기 위해서는 B 의 계약을 만족시켜야 한다.

__[Stackoverflow - Design by Contract vs Validation](https://stackoverflow.com/questions/5049163/when-should-i-use-apache-commons-validate-istrue-and-when-should-i-just-use-th/5452329#5452329)__:

```java
public int m(int n) {
  // the class invariant should hold upon entry;
  assert this.invariant() : "The invariant should hold.";

  // a precondition in terms of design-by-contract
  assert this.isInitialized() : "m can only be invoked after initialization.";

  // Implement a tolerant contract ensuring reasonable response upon n <= 0:
  // simply raise an illegal argument exception.
  Validate.isTrue(n > 0, "n should be positive");

  // the actual computation.
  int result = complexMathUnderTrickyCircumstances(n);

  // the postcondition.
  assert result > 0 : "m's result is always greater than 0.";
  assert this.processingDone() : "processingDone state entered after m.";
  assert this.invariant() : "Luckily the invariant still holds as well.";

  return result;
}
```

위 코드는 Validation 과 Contract 이 모두 적용된 경우다.

## References

- Effective Software Testing: A developer's guide / Mauricio Aniche
- Bertrand Meyer, "[Applying Design by Contract](https://se.inf.ethz.ch/~meyer/publications/computer/contract.pdf)", IEEE Computer, 1992
- Johsua Bloch. Effective Java, 2nd ed., Item 38. Check parameters for validity