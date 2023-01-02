---
layout  : wiki
title   : Parallel Change
summary : 확장과 축소 리팩터링
date    : 2023-01-01 17:54:32 +0900
updated : 2023-01-01 20:15:24 +0900
tag     : refactoring kotlin
toc     : true
comment : true
public  : true
parent  : [[/refactoring]]
latex   : true
---
* TOC
{:toc}

## Parallel Change

인터페이스를 변경해야 하는 경우 __병렬 변경(Parallel Change)__ 기법을 사용한다. __확장과 축소 리팩터링__ 이라고도 한다.
확장과 축소 리팩터링은 새 인터페이스를 추가하고, 예전 인터페이스를 사용하는 부분을 새 인터페이스를 사용하게 변경한 후, 아무도 예전 인터페이스를 사용하지 않을 때 예전 인터페이스를 제거하는 단순한 개념이다.

자바로 작성된 코드를 코틀린으로 변환할 때, __인터페이스 정의와 구현을 코틀린으로 변환한 다음에, 코틀린 코드에 새 인터페이스를 추가한다.__ 그 후 클라이언트를 새 인터페이스를 사용하게 변환하면서 클라이언트를 코틀린으로 변환한다.

- __Java__

```java
public class Legs {
    public static Optional<Leg> findLongestLegOver(
            List<Leg> legs,
            Duration duration
    ) {
        Leg result = null;
        for (Leg leg: legs) {
            if (isLongerThan(leg, duration)) {
                result = leg;
            }
        }
        return Optional.ofNullable(result);
    }

    private static boolean isLongerThan(Leg leg, Duration duration) {
        return leg.getPlannedDuration().compareTo(duration) > 0;
    }
}
```

- __Kotlin__

```kotlin
// java optional 을 kotlin 으로 전환할 때는 optional 을 반환하는 함수와 ?(nullable)을 반환하는 하는 함수 2개가 있어야 한다.
// java 에서 Optional.orElseThrow() 는 코틀린의 !! 와 같다.
// !! 는 가급적 사용하는 것을 지양해야 하지만, Optional.orElseThrow() 의 대안으로는 사용 가능하다.
object LegsV2 {

    // 자바가 사용하는 메서드
    // 추후에 모든 코드가 리팩토링되면 해당 메서드는 삭제하면 된다.
    @JvmStatic
    fun findLongestLegOver(
        legs: List<Leg>,
        duration: Duration
    ): Optional<Leg> {
        return Optional.ofNullable(longestLegOver(legs, duration))
    }

    // 코틀린이 사용하는 메서드 = 새롭게 추가한 인터페이스
    fun longestLegOver(legs: List<Leg>, duration: Duration): Leg? {
        var result: Leg? = null
        for (leg in legs) {
            if (isLongerThan(leg, duration)) {
                if (result == null || isLongerThan(leg, result.plannedDuration)) {
                    result = leg
                }
            }
        }
        return result
    }

    private fun isLongerThan(leg: Leg, duration: Duration): Boolean {
        return leg.plannedDuration > duration
    }
}
```

- __코틀린스럽게 변환한 코드__

```kotlin
// let 사용, 하지만 가독성 측면에서 그렇게 좋진 않다.
fun longestLegOverV1(legs: List<Leg>, duration: Duration): Leg? {
    return legs.maxByOrNull(Leg::getPlannedDuration)?.let { longestLeg ->
        if (longestLeg.plannedDuration > duration) longestLeg
        else null
    }
}

// takeIf 는 술어가 true 면 수신객체를 반환하고 true 가 아니면 null 을 반환한다.
fun longestLegOverV2(legs: List<Leg>, duration: Duration): Leg? =
    legs.maxByOrNull(Leg::getPlannedDuration)?.takeIf { longestLeg -> longestLeg.plannedDuration > duration }

// V2 보다 코드는 길지만 명시성 측면에서 더 좋다.
fun List<Leg>.longestLegOverV3(duration: Duration): Leg? {
    val longestLeg = maxByOrNull(Leg::getPlannedDuration)
    return when {
        longestLeg == null -> null
        longestLeg.plannedDuration > duration -> longestLeg
        else -> null
    }
}

private fun isLongerThan(leg: Leg, duration: Duration) = leg.plannedDuration > duration
```

## Links

- [ParallelChange](https://martinfowler.com/bliki/ParallelChange.html)

## References

- 자바에서 코틀린으로: 코틀린으로 리팩터링하기 / 냇프라이스 와 덩컨맥그레거 저 / O'REILLY