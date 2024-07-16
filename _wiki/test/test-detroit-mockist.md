---
layout  : wiki
title   : Detroit Versus Mockist
summary : 
date    : 2024-07-16 09:25:32 +0900
updated : 2024-07-16 09:29:24 +0900
tag     : test
toc     : true
comment : true
public  : true
parent  : [[/test]]
latex   : true
---
* TOC
{:toc}

## Detroit Versus Mockist

단위 테스트에서는 고전파(Detroit) 와 런던파(Mockist) 로 나뉜다. 고전파의 대표적인 책은 _[Test Driven Development - Kent Beck](https://www.amazon.com/Test-Driven-Development-Kent-Beck/dp/0321146530)_ 이며, 런던파의 대표적인 책은 _[Growing Object-Oriented Software, Guided by Tests - Steve Freeman](https://www.amazon.com/Growing-Object-Oriented-Software-Guided-Tests/dp/0321503627)_ 이 있다.
고전파, 런던파로 나뉘게된 배경은 단위 테스트의 정의를 내릴때 __격리(isolation)__ 문제 때문에 그렇다.

런던파에서는 테스트 대상 시스템을 협력자(collaborator) 에게서 격리하는 것을 일컫는다. 즉, 하나의 클래스가 다른 여러 클래스에 의존하면 이 모든 의존성을 ___[Test Doubles](https://baekjungho.github.io/wiki/test/test-testdoubles/)___ 로 대체해야 한다는 것이다.
이 경우 장점은 Object Graph 를 분할할 수 있으며, 단순한 테스트 스위트 구조(제품 코드의 각 클래스에 대해 테스트 클래스가 하나씩 있는 구조)를 확립하는데 도움이 된다. 이때 테스트 대상이 되는 클래스를 _[System Under Test](https://baekjungho.github.io/wiki/test/tdd-sut-doc/)_ 라고 부르며,
SUT 에서 의존하고 있는 컴포넌트들을 _[Depended On Component](https://baekjungho.github.io/wiki/test/tdd-sut-doc/)_ 라고 한다.

런던파는 Test Doubles 를 사용할 수 있는 대상을 __불변 의존성을 제외한 모든 의존성__ 으로 본다. 또한 런던파는 단위의 크기를 __단일 클래스__ 로 본다.

__London Style__:

```kotlin
// UserService.kt
class UserService(private val userRepository: UserRepository) {
    fun getUser(id: Int): User? {
        return userRepository.findById(id)
    }
}

interface UserRepository {
    fun findById(id: Int): User?
}

data class User(val id: Int, val name: String)
```

```kotlin
import io.kotest.core.spec.style.StringSpec
import io.kotest.matchers.shouldBe
import io.mockk.every
import io.mockk.mockk

class UserServiceTest : StringSpec({
    "should return user when user exists" {
        // Arrange
        val userRepository = mockk<UserRepository>()
        val userService = UserService(userRepository)
        val user = User(1, "John Doe")

        every { userRepository.findById(1) } returns user

        // Act
        val result = userService.getUser(1)

        // Assert
        result shouldBe user
    }

    "should return null when user does not exist" {
        // Arrange
        val userRepository = mockk<UserRepository>()
        val userService = UserService(userRepository)

        every { userRepository.findById(1) } returns null

        // Act
        val result = userService.getUser(1)

        // Assert
        result shouldBe null
    }
})
```

고전파는 "코드를 꼭 격리해서 테스트해야 하는 것은 아니다" 라는 입장이다. 대신 단위 테스트는 서로 격리해서 실행해야 한다. 고전파는 단위의 크기를 __단일 클래스 또는 클래스 세트__ 로 본다.
테스트는 서로 소통하고 실행 컨텍스트에 영향을 줄 수 있다. 예를 들어, 특정 테스트가 준비 단계에서 데이터베이스에 제품을 생성할 수 있고, 이 테스트가 실행되기 전에 다른 테스트의 준비 단계에서 제품을 삭제할 수도 있다.

__공유 의존성(shared dependency)__ 은 테스트 간에 공유되고 서로의 결과에 영향을 미칠 수 있는 수단을 제공하는 의존성이다. 대표적인 예로 정적 가변 필드(static mutable field)가 있다.
__비공개 의존성(private dependency)__ 은 공유하지 않는 의존성이다. __프로세스 외부 의존성(out-of-process dependency)__ 은 애플리케이션 실행 프로세스 외부에서 실행되는 의존성이며, 아직 메모리에 없는 데이터에 대한 프록시(proxy)다. 예를 들어 데이터베이스는 프로세스 외부이면서 공유 의존성이다. __휘발 의존성(volatile depencency)__ 은 개발자 머신에 기본 설치된 환경 외에 런타임 환경의 설정 및 구성을 요구한다. 데이터베이스와 API 서비스가 좋은 예다. 추가 설정이 필요하며 시스템에 기본으로 설치돼 있지 않다. 혹은 비결정적 동작(nondeterministic behavior)을 포함한다. 예를 들어 난수 생성기 또는 현재 날짜와 시간을 반환하는 클래스 등이 있다. 이런 의존성은 각 호출에 대해 다른 결과를 제공하기 때문에 비결정적이라고 한다. 예를 들어 난수 생성기의 경우에는 휘발성이지만, 각 테스트에 별도의 인스턴스를 제공할 수 있으므로 공유 의존성은 아니다.

고전파는 Test Doubles 를 사용할 수 있는 대상을 __공유 의존성__ 으로 본다.

런던파는 고전파보다 테스트가 더 __취약(fragility)__ 하다. 테스트를 작성할 때는 코드의 단위가 아니라 __동작의 단위__ 를 테스트하는 것이 좋다. 런던파는 코드의 단위를 테스트한다는 단점이 있다. Mock 을 사용하는 테스트는 고전적인 테스트보다 불안정한 경향이 있다. 대신 테스트가 세밀해서 한 번에 한 클래스만 확인할 수 있으며, 테스트가 실패하면 어떤 기능이 실패했는지 확실히 알 수 있다.

### Collaborator Versus Value Object

협력자(collaborator)는 공유하거나 변경 가능한 의존성이다. 시간에 따라 상태가 변하면 협력자로 본다. 반면 ___[Value Object](https://enterprisecraftsmanship.com/posts/entity-vs-value-object-the-ultimate-list-of-differences/)___ 나 Value 는 협력자로 보지 않는다.

## References

- Unit Testing Principles, Practices, and Patterns: Effective testing styles, patterns, and reliable automation for unit testing, mocking, and integration testing with examples in C# / Vladimir Khorikov
