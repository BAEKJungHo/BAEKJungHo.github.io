---
layout  : wiki
title   : Immediate feedback for interface design decisions
summary : 
date    : 2024-01-04 15:54:32 +0900
updated : 2024-01-04 20:15:24 +0900
tag     : tdd test
toc     : true
comment : true
public  : true
parent  : [[/tdd]]
latex   : true
---
* TOC
{:toc}

## Immediate feedback for interface design decisions

TDD 는 설계 방법론이 아니다. TDD 가 설계(design)의 필요성을 대체하지 않는다.

__[Kent Beck said "Immediate feedback for interface design decisions"](https://tidyfirst.substack.com/p/tdd-isnt-design).__

![](/resource/wiki/tdd-interface-design-decisions/tdd-offers.png)

위 내용이 TDD 가 제공하는 이점이자 핵심인 것 같다.

말로만 들어서는 이해하기 어렵다. 직접 코딩을 하면서 느껴야 Kent Beck 님이 말한 내용 중 "Immediate feedback for interface design decisions" 이 부분에 대해서 공감을 할 수 있다.

### Examples

아래 예제는 [테스트 주도 개발 시작하기 - 최범균](#) 책에있는 '서비스 만료일 계산' 예제를 따왔다.

__서비스 규칙__:
- 서비스를 사용하려면 매달 1만원을 선불로 납부한다. 납부일 기준으로 한달 뒤가 서비스 만료일이 된다.
- 2개월 이상 요금을 납부할 수 있다.
- 10만원을 납부하면 서비스를 1년 제공한다.

적절한 클래스 이름을 생각한 후에 빈 테스트 클래스를 작성한다.

```kotlin
class ExpiryDateCalculatorTest { }
```

쉬운 것 부터 테스트를 시작한다. (아주 중요한 규칙이다.) 가독성을 위해서 테스트 메서드명은 한글로 작성한다.

```kotlin
@Test
fun `만원을 납부하면 한달 뒤가 만료일이 됨`() {
    val billingDate = LocalDate.of(2019, 3, 1)
    val payAmount = 10_000
    val calculator = ExpiryDateCalculator()
    val expiryDate = calculator.calculateExpiryDate(billingDate, payAmount)
    assertEquals(LocalDate.of(2019, 4, 1), expiryDate)
}
```

[RedGreenRefactor](https://baekjungho.github.io/wiki/tdd/tdd-red-green-refactor/) 규칙에 따라 실패하는 테스트 코드를 작성하고, 실행한다.

다음으로 테스트를 통과 시키기 위해서 ExpiryDateCalculator 클래스를 작성해야 한다. 이 시점부터, TDD 가 __인터페이스 디자인 결정에 대한 즉각적인 피드백__ 을 준다는 느낌을 받을 수 있다.

```kotlin
class ExpiryCalculator {
    fun calculateExpiryDate(billingDate: LocalDate, payAmount: Int): LocalDate {
        return LocalDate.of(2019, 4, 1) // hard coding
    }
}
```

하드 코딩으로 테스트를 통과하게 만들었다.

이제 __새로운 단언문을 추가하면서 구현을 일반화__ 한다.

```kotlin
@Test
fun `만원을 납부하면 한달 뒤가 만료일이 됨`() {
    val payAmount = 10_000
    val calculator = ExpiryDateCalculator()
    
    val billingDate1 = LocalDate.of(2019, 3, 1)
    val expiryDate = calculator.calculateExpiryDate(billingDate1, payAmount)
    assertEquals(LocalDate.of(2019, 4, 1), expiryDate)

    val billingDate2 = LocalDate.of(2019, 4, 1)
    val expiryDate = calculator.calculateExpiryDate(billingDate, payAmount)
    assertEquals(LocalDate.of(2019, 5, 1), expiryDate)
}
```

위 코드를 통과 시키기 위해서 구현 클래스의 반환문을 수정해야 한다.

```kotlin
class ExpiryCalculator {
    fun calculateExpiryDate(billingDate: LocalDate, payAmount: Int): LocalDate {
        return billingDate.plusMonths(1)
    }
}
```

리팩토링할 내용이 보이면 리팩토링을 진행하면된다.

```kotlin
class ExpiryDateCalculatorTest {

    private val calculator = ExpiryCalculator()

    @Test
    fun `만원을 납부하면 한달 뒤가 만료일이 됨`() {
        assertExpiryDate(
            billingDate = LocalDate.of(2024, 1,1),
            payAmount = 10_000,
            expected = LocalDate.of(2024, 2,1)
        )

        assertExpiryDate(
            billingDate = LocalDate.of(2024, 2,1),
            payAmount = 10_000,
            expected = LocalDate.of(2024, 3,1)
        )
    }
    
    private fun assertExpiryDate(
        billingDate: LocalDate,
        payAmount: Int,
        expected: LocalDate
    ) {
        val expiryDate = calculator.calculateExpiryDate(billingDate = billingDate, payAmount = payAmount)
        assertEquals(expected, expiryDate)
    }
}
```

이제 예외적인 상황을 처리하기 위한 시나리오를 생각한다.

- 납부일이 2019-01-31 이고 납부액이 1만원이면 만료일은 2019-02-28 이다.
- 납부일이 2024-01-31 이고 납부액이 1만원이면 만료일은 2024-02-29 이다.
- 납부일이 2024-05-31 이고 납부액이 1만원이면 만료일은 2024-06-30 이다.

예외적인 상황을 처리하기 위한 테스트 코드를 작성하고 실행을 하면 통과할 것이다. LocalDate 의 plusMonths 메서드가 알아서 처리를 해준다.

이제 다음 테스트를 위한 시나리오를 생각한다.

- 첫 납부일이 2019-01-31 이고 만료되는 2019-02-28 에 1만원을 납부하면 다음 만료일은 2019-03-31 이다.
- 첫 납부일이 2019-01-30 이고 만료되는 2019-02-28 에 1만원을 납부하면 다음 만료일은 2019-03-30 이다.
- 첫 납부일이 2019-05-31 이고 만료되는 2019-06-30 에 1만원을 납부하면 다음 만료일은 2019-07-31 이다.

위 테스트 케이스를 처리하기 위해서는 calculateExpiryDate 메서드의 파라미터에 첫 납부일이 필요하다. 즉, __인터페이스 디자인 결정__ 을 내려야 하는 순간이다.
파라미터가 3개 이상인 경우에는 가독성을 위해서 별도의 클래스로 추출하여 리팩토링 할 수 있다.

```kotlin
data class PayData(
    val billingDate: LocalDate,
    val payAmount: Int
)
```
```kotlin
class ExpiryCalculator {

    fun calculateExpiryDate(payData: PayData): LocalDate {
        return payData.billingDate.plusMonths(1)
    }
}
```

테스트 코드는 아래와 같이 수정해준다.

```kotlin
class ExpiryDateCalculatorTest {

    private val calculator = ExpiryCalculator()

    @Test
    fun `만원을 납부하면 한달 뒤가 만료일이 됨`() {
        assertExpiryDate(
            billingDate = LocalDate.of(2024, 1,1),
            payAmount = 10_000,
            expected = LocalDate.of(2024, 2,1)
        )

        assertExpiryDate(
            billingDate = LocalDate.of(2024, 2,1),
            payAmount = 10_000,
            expected = LocalDate.of(2024, 3,1)
        )
    }

    private fun assertExpiryDate(
        billingDate: LocalDate,
        payAmount: Int,
        expected: LocalDate
    ) {
        val payData = PayData(billingDate = billingDate, payAmount = payAmount)
        val expiryDate = calculator.calculateExpiryDate(payData)
        assertEquals(expected, expiryDate)
    }
}
```

이 처럼, RedGreenRefactor 단계로 TDD 를 하다 보면 TDD 가 __인터페이스 디자인 결정에 대한 즉각적인 피드백(Immediate feedback for interface design decisions)__ 을 준다는 느낌을 받는다.