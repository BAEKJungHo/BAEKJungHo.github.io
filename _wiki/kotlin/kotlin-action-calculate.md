---
layout  : wiki
title   : Actions to Calculations
summary : 동작에서 계산으로
date    : 2023-01-16 20:54:32 +0900
updated : 2023-01-16 21:15:24 +0900
tag     : kotlin fp test
toc     : true
comment : true
public  : true
parent  : [[/kotlin]]
latex   : true
---
* TOC
{:toc}

## Actions to Calculations

- 동작(action)은 호출시점 혹은 호출 횟수마다 결과가 달라지는 경우를 의미한다.
- 계산(calculation)은 호출마다 결과가 동일한 경우를 의미한다.

계산을 선호하는 이유는 계산이 훨씬 더 다루기 쉽고 값을 믿고 쓸 수 있다. 즉, 부수 효과를 걱정하지 않고 사용할 수 있다.

계산은 아래와 같은 코드이다. 함수일 수도 있고 클래스로 위장한 경우도 있다.

```kotlin
fun fullName(customer: Customer) = "${customer.givenName} ${customer.familyName}"

data class Customer(
  val givenName: String,
  val familyName: String
) {
  fun upperCaseGivenName() = givenName.toUpperCase()

  val fullName get() = "$givenName $familyName"
}
```

### Referential Transparency

참조 투명성(referential transparency)은 함수를 호출한 모든 부분에서 함수 호출을 그 함수 호출의 결괏값(반환 값)으로 치환해도 프로그램이 똑같이 작동할 때 이런 함수를 참조 투명한 함수라고 말한다. 즉, __부수 효과(side effect)가 없는 함수__ 를 의미한다.

### Test Difficult

아래와 같은 코드는 테스트 코드 작성을 어렵게 한다.

```java
@Override
public Set<Trip> currentTripsFor(String customerId) {
    return tripsFor(customerId).stream()
        .filter(trip -> {
            Instant now = clock.instant();
            return trip.isPlannedToBeActiveAt(now);
        })
        .collect(toSet());
}
```

clock.instant() 는 동작이다. 호출할 때마다 결과가 달라진다. 이러한 코드를 테스트 하려면 가짜 시계를 주입(inject)하여 사용해야하며 테스트 코드에서 주입한 시간이 지나게 된경우 테스트가 실패하게 된다.

위 코드를 테스트 가능하도록 리팩토링 하려면 함수의 시그니처를 아래와 같이 변경하거나, 혹은 시간을 가져다 사용하는 클래스를 만들어 Dependency Injection 을 통해 사용해야 한다.

```java
public Set<Trip> currentTripsFor(String customerId, Instant at) {}
```

## References

- 자바에서 코틀린으로: 코틀린으로 리팩터링하기 / 냇프라이스 와 덩컨맥그레거 저 / O'REILLY