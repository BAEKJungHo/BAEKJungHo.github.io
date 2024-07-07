---
layout  : wiki
title   : TestDoubles
summary : Dummy, Fake, Spy, Stub, Mock
date    : 2024-07-07 10:25:32 +0900
updated : 2024-07-07 10:29:24 +0900
tag     : test
toc     : true
comment : true
public  : true
parent  : [[/test]]
latex   : true
---
* TOC
{:toc}

## TestDoubles

테스트 더블(Test Double) 이란 프로덕션 객체(Production Object)를 대체하는 테스트 전용 객체를 의미한다.

> Meszaros uses the term _[Test Double](https://en.wikipedia.org/wiki/Test_double)_ as the generic term for any kind of pretend object used in place of a real object for testing purposes.

__TestDoubles__:
- __Dummy__ objects are passed around but never actually used. Usually they are just used to fill parameter lists.
- __Fake__ objects actually have working implementations, but usually take some shortcut which makes them not suitable for production (an _[InMemoryTestDatabase](https://martinfowler.com/bliki/InMemoryTestDatabase.html)_ is a good example).
- __Stub__ provide canned answers to calls made during the test, usually not responding at all to anything outside what's programmed in for the test.
- __Spy__ are stubs that also record some information based on how they were called. One form of this might be an email service that records how many messages it was sent.
- __Mock__ are pre-programmed with expectations which form a specification of the calls they are expected to receive. They can throw an exception if they receive a call they don't expect and are checked during verification to ensure they got all the calls they were expecting

테스트 더블을 사용하는 것은 단위 테스트에만 국한되지 않는다. 더 정교한 테스트 더블을 사용하면 제어된 방식으로 시스템의 전체 부분을 시뮬레이션할 수 있다.

### Mocks Aren't Stub

Mock 은 __동작 검증(Behavior Verification)__ 을 수행하며, Stub 은 __상태 검증(State Verification)__ 을 수행한다는 차이점이 있다.

__Behavior Verification__:

```java
class OrderInteractionTester...
  public void testOrderSendsMailIfUnfilled() {
    Order order = new Order(TALISKER, 51);
    Mock warehouse = mock(Warehouse.class);
    Mock mailer = mock(MailService.class);
    order.setMailer((MailService) mailer.proxy());

    mailer.expects(once()).method("send"); 
    warehouse.expects(once()).method("hasInventory")
      .withAnyArguments()
      .will(returnValue(false));

    order.fill((Warehouse) warehouse.proxy());
  }
}
```

__State Verification__:

```java
class OrderStateTester...
  public void testOrderSendsMailIfUnfilled() {
    Order order = new Order(TALISKER, 51);
    MailServiceStub mailer = new MailServiceStub();
    order.setMailer(mailer);
    order.fill(warehouse);
    assertEquals(1, mailer.numberSent());
  }
```

### Examples

__Dummy__:
- Dummy 객체는 보통 테스트 시 사용되지 않지만, 메서드 호출 시 필요한 매개변수로 사용된다.

```kotlin
import io.kotest.core.spec.style.StringSpec

class DummyExample : StringSpec({
    "dummy example" {
        class Service
        class Controller(val service: Service)

        val dummyService = Service() // This service is not actually used in the test
        val controller = Controller(dummyService)

        // Perform tests on controller without interacting with dummyService
    }
})
```

__Fake__:
- Fake 객체는 실제 구현과 유사한 동작을 하지만, 실제 프로덕션 코드를 사용하지 않는다. 예를 들어, 인메모리 데이터베이스 등을 사용할 수 있다.

```kotlin
import io.kotest.core.spec.style.StringSpec
import io.kotest.matchers.shouldBe

class FakeExample : StringSpec({
    "fake example" {
        class InMemoryRepository {
            private val data = mutableListOf<String>()

            fun save(item: String) {
                data.add(item)
            }

            fun findAll() = data.toList()
        }

        val repository = InMemoryRepository()
        repository.save("item1")
        repository.save("item2")

        repository.findAll() shouldBe listOf("item1", "item2")
    }
})
```

__Spy__:
- Spy 객체는 실제 객체를 감싸서 메서드 호출을 감시하고, 실제 메서드 호출을 그대로 전달한다. 호출된 메서드와 인자를 확인할 때 유용하다.

```kotlin
import io.kotest.core.spec.style.StringSpec
import io.kotest.matchers.shouldBe
import io.mockk.spyk
import io.mockk.verify

class SpyExample : StringSpec({
    "spy example" {
        class UserService {
            fun greet(name: String) = "Hello, $name!"
        }

        val userService = spyk(UserService())
        userService.greet("Alice") shouldBe "Hello, Alice!"

        verify { userService.greet("Alice") }
    }
})
```

__Stub__:
- Stub 객체는 특정 메서드 호출에 대해 미리 준비된 응답을 제공한다.

```kotlin
import io.kotest.core.spec.style.StringSpec
import io.kotest.matchers.shouldBe
import io.mockk.every
import io.mockk.mockk

class StubExample : StringSpec({
    "stub example" {
        class UserService {
            fun getUser(id: Int) = "User$id"
        }

        val userService = mockk<UserService>()
        every { userService.getUser(1) } returns "Mocked User"

        userService.getUser(1) shouldBe "Mocked User" // 상태 검증
    }
})
```

__Mock__:
- Mock 객체는 호출된 메서드와 인자 등을 검증하고, 특정 동작을 설정할 수 있다.

```kotlin
import io.kotest.core.spec.style.StringSpec
import io.kotest.matchers.shouldBe
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify

class MockExample : StringSpec({
    "mock example" {
        class UserService {
            fun getUser(id: Int) = "User$id"
        }

        val userService = mockk<UserService>()
        every { userService.getUser(1) } returns "Mocked User"

        userService.getUser(1) shouldBe "Mocked User"

        verify { userService.getUser(1) } // 동작 검증 = 메서드 호출 여부 확인 
    }
})
```

## References

- [Test Double / Martinfowler](https://martinfowler.com/bliki/TestDouble.html)
- [Mocks Aren't Stubs /  Martinfowler](https://martinfowler.com/articles/mocksArentStubs.html)