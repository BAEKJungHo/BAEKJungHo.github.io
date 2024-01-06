---
layout  : wiki
title   : RedGreenRefactor
summary : Immediate feedback for interface design decisions
date    : 2024-01-02 15:54:32 +0900
updated : 2024-01-02 20:15:24 +0900
tag     : tdd
toc     : true
comment : true
public  : true
parent  : [[/tdd]]
latex   : true
---
* TOC
{:toc}

## Red Green Refactor

__[Test-driven development cycle](https://en.wikipedia.org/wiki/Test-driven_development)__ 은 총 3단계로 이뤄진다.

1. 실패하는 테스트 코드 작성하기
2. 테스트 통과 시키기 
3. 이전 두 단계에서 추가되거나 변경된 코드 개선하기

__Red-green-refactor__ is an alternative mnemonic for __TDD cycle__ of writing a test, making it pass, and making it pretty.

TDD Cycle 과 관련된 몇가지 팁이 있다.

- 첫 번째 테스트를 선택할 때는 __가장 쉽거__ 나 __가장 예외적인 상황__ 을 선택해야 한다.
  - 쉬운 경우에서 어려운 경우로 진행
  - 예외적인 경우에서 정상적인 경우로 진행
- 실패하는 테스트 코드를 작성하는 시점에서는, 만들려는 프로덕션 코드가 존재하지 않으므로 빨간색일 것이다. 그리고 테스트를 통과하기 위해 프로덕션 코드를 구현하고 테스트를 통과 시킨다.
- TDD 를 할 때 값비싸고 나쁜 가정들을 피하기 위해 항상 테스트가 먼저 실패하는지 관찰한다.
- 실패하는 각 테스트에 대해 그 테스트를 통과할 수 있는 코드만 추가하라. 가능한 가장 작은 증분(increment)을 추가하는 것이다.
- TDD 는 거의 모든 코드에 안전한 리팩토링을 가능하게 한다.
- TDD 의 리듬은 빠르다. 처음에는 10분정도로 제한하고 시도해본다. 더 오래 걸린다면 더 작게 쪼개서 테스트를 해야 한다.

### How to write test code that fails

처음은 구현 코드가 없는 상태에서 코드를 작성하게 된다. __기능__ 에 포커스를 맞춰 테스트 코드를 작성하면 된다.
예를 들어, 계산기를 만들어야 하는 경우 아래와 같이 실패하는 테스트 코드를 작성할 수 있다.

```kotlin
class CalculatorTest {
    @Test
    fun plus() {
        val result: Int = Calculator.plus(1, 2)
        assertEquals(3, result)
    }
}
```

이때, Calculator 클래스는 존재하지 않기 때문에 컴파일 에러가 발생한다. 별것도 아닌 코드 처럼 보인다. 하지만 Calculator.plus(1, 2) 를 작성하면서 많은 생각을 해야 한다.

- 클래스 이름은 적절한 지
- 메서드 이름은 적절한 지 (e.g plus, sum ...)
- 파라미터 설계는 어떻게 할 지
- 정적 메서드로 구현하는게 좋은 지, 인스턴스 메서드로 구현하는게 좋은 지

이러한 의사 결정을 내리도록 도움을 주는게 TDD 이다. 즉, __인터페이스 디자인 결정(interface design decisions)__ 을 내리도록 도움을 준다.

__[Kent Back said "Immediate feedback for interface design decisions"](https://tidyfirst.substack.com/p/tdd-isnt-design).__

인터페이스 결정을 테스트로 만들고 기록한 후, 구현 설계 결정이 첫 번째, 가장 낮은 기준을 통과하는지 여부에 대한 즉각적인 피드백을 받게 된다.

```kotlin
class Calculator {
    companion object {
        fun plus(a: Int, b: Int): Int {
            return 0
        }
    }
}
```

간단한 코드라 return 문을 바로 완성시키고 싶지만, 일단 위 처럼 작성하고 실행하면 테스트가 실패할 것이다.

### Write the simplest code that passes the new test

테스트를 통과하기 위해서, 위 코드를 수정해야 한다. 이 단계에서 중요한 점은 아래와 같다.

__[Inelegant or hard code is acceptable](https://en.wikipedia.org/wiki/Test-driven_development)__, as long as it passes the test. The code will be honed anyway in Step 5. No code should be added beyond the tested functionality.

```kotlin
class Calculator {
    companion object {
        fun plus(a: Int, b: Int): Int {
            return 3
        }
    }
}
```

하드 코딩을 통해서 테스트가 통과하도록 했지만, 단언(assert) 가 추가되면 언제든 실패할 수 있다.

```kotlin
assertEquals(5, Calculator.plus(4, 1))
```

### Refactoring

추가된 단언을 통과시키기 위해서, 구현 클래스를 리팩토링 한다.

```kotlin
class Calculator {
    companion object {
        fun plus(a: Int, b: Int): Int {
            return a + b
        }
    }
}
```

이렇게 점진적으로 구현을 완성해 나가면 된다.

## References

- TEST DRIVEN / LASSE KOSKELA / MANNING
- 테스트 주도 개발 시작하기 / 최범균 저 / 가메출판사