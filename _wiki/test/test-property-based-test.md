---
layout  : wiki
title   : PropertyBasedTest
summary : ExampleBasedTest
date    : 2024-07-05 15:54:32 +0900
updated : 2024-07-05 20:15:24 +0900
tag     : test
toc     : true
comment : true
public  : true
parent  : [[/test]]
latex   : true
---
* TOC
{:toc}

## Property Based Test

목록이 입력으로 주어질때, 요소의 순서가 알고리즘에 영향을 미치는 경우 일반적으로 __예시 기반 테스트(Example-Based Test)__ 를 사용한다.
예시 기반 테스트란 __가능한 입력 중에서 하나의 특정 입력만 골라서 하는 테스트__ 를 의미한다. 특정 테스트 케이스를 위해 데이터를 만들어서(data point) 테스트를 진행할 수 있다.

예시 기반 테스트의 단점은, 개발자가 생각 하지 못한 Edge Case 나 입력 커버리지 부족으로 인해 오류를 놓치기 쉽다는 점이다. 장점으로는 단순하고 자동화와 창의성을 많이 필요로 하지 않는다.
단순하기 때문에 요구사항을 이해하기 쉽고 더 좋은 테스트 케이스를 설계할 수 있다. 많은 문제를 해결함에 있어서 예시 기반 테스트로 충분하지만, 확신할 수 없을때 __속성 기반 테스트(Property-Based Test)__ 를 사용하는것을 추천한다.
속성 기반 테스트는 __창의성(creativity)__ 이 핵심이다. 속성을 나타내는 방법을 찾고, 임의의 데이터를 생성하는 등의 창의성이 필요하다.

__[PropertyBasedTest](https://kotest.io/docs/proptest/property-based-testing.html)__ 는 닉네임, 이메일등의 유효성을 검사 논리를 강화하는 데 도움이 되는 수천 가지의 조합을 생성하는데 유용하다.
속성 기반 테스트 프레임워크는 같은 테스트를 백 번 수행하고, 수행할 때마다 다른 조합의 추정을 사용한다. 만약 임의의 입력 중 한 가지 경우에 대해 테스트가 실패한다면 프레임워크는 테스트를 멈추고 코드를 깨뜨린 해당 임의의 입력값을 보고한다.

__[Jqwik Examples](https://www.baeldung.com/java-jqwik-property-based-testing)__:

```kotlin
import net.jqwik.api.ForAll
import net.jqwik.api.Property
import net.jqwik.api.constraints.IntRange
import kotlin.test.assertEquals

class MathProperties {

    /**
     * 덧셈의 교환 법칙 (Commutative Property): a + b는 b + a와 같아야 한다.
     */
    @Property
    fun additionIsCommutative(@ForAll a: Int, @ForAll b: Int) {
        assertEquals(a + b, b + a)
    }

    /**
     * 덧셈의 결합 법칙 (Associative Property): (a + b) + c는 a + (b + c)와 같아야 한다.
     */
    @Property
    fun additionIsAssociative(@ForAll a: Int, @ForAll b: Int, @ForAll c: Int) {
        assertEquals((a + b) + c, a + (b + c))
    }

    /**
     * 0은 덧셈의 중립 원소 (Neutral Element)입니다: a + 0은 a와 같아야 한다.
     */
    @Property
    fun zeroIsNeutralElement(@ForAll a: Int) {
        assertEquals(a + 0, a)
        assertEquals(0 + a, a)
    }

    /**
     * 두 양수의 합은 각 숫자보다 커야 한다.
     */
    @Property
    fun additionWithPositiveNumbersIsGreater(
        @ForAll @IntRange(min = 1, max = 100) a: Int,
        @ForAll @IntRange(min = 1, max = 100) b: Int
    ) {
        assert(a + b > a)
        assert(a + b > b)
    }
}
```

__Outputs__:

```
timestamp = 2024-07-03T21:23:34.812151, MathProperties:additionWithPositiveNumbersIsGreater = 
                              |-------------------jqwik-------------------
tries = 1000                  | # of calls to property
checks = 1000                 | # of not rejected calls
generation = RANDOMIZED       | parameters are randomly generated
after-failure = PREVIOUS_SEED | use the previous seed
when-fixed-seed = ALLOW       | fixing the random seed is allowed
edge-cases#mode = MIXIN       | edge cases are mixed in
edge-cases#total = 16         | # of all combined edge cases
edge-cases#tried = 16         | # of edge cases tried in current run
seed = -4659458336646274198   | random seed to reproduce generated values
```

__[Kotest Examples](https://kotest.io/docs/proptest/property-based-testing.html)__:

```kotlin
import io.kotest.core.spec.style.StringSpec
import io.kotest.matchers.string.shouldHaveLength
import io.kotest.property.Arb
import io.kotest.property.checkAll
import io.kotest.property.forAll

class PropertyTest : StringSpec({
    "String size" {
        forAll<String, String> { a, b ->
            (a + b).length == a.length + b.length
        }

        checkAll<String, String> { a, b ->
            a + b shouldHaveLength a.length + b.length
        }
    }

    "a many iterations test" {
        checkAll<Double, Double>(10_000) { a, b ->
            // test here
        }
    }

    "is allowed to drink in Chicago" {
        forAll(Arb.int(21..150)) { a ->
            isDrinkingAge(a) // assuming some function that calculates if we're old enough to drink
        }
    }
    "is allowed to drink in London" {
        forAll(Arb.int(18..150)) { a ->
            isDrinkingAge(a) // assuming some function that calculates if we're old enough to drink
        }
    }
})
```

속성 기반 테스트를 할때 알아야할 2가지 개념은 __[Arbitrary](https://kotest.io/docs/proptest/property-test-generators.html#arbitrary)__ 와 __[Exhaustive](https://kotest.io/docs/proptest/property-test-generators.html#exhaustive)__ 이다. 쉽게 말하면 임의의(무작위) 값을 생성하는 것과, 폐쇄된 공간에서 유한한 값 집합을 생성하는 것을 의미한다.

__[ScalaTest Examples](https://www.scalatest.org/user_guide/property_based_testing)__:

```scala
forAll { (n: Int, d: Int) =>
  whenever (d != 0 && d != Integer.MIN_VALUE
      && n != Integer.MIN_VALUE) {

    val f = new Fraction(n, d)

    if (n < 0 && d < 0 || n > 0 && d > 0)
      f.numer should be > 0
    else if (n != 0)
      f.numer should be < 0
    else
      f.numer should be === 0

    f.denom should be > 0
  }
}
```