---
layout  : wiki
title   : TestDoubles
summary : When to fake; when to mock
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

__테스트 더블(_[Test Doubles](https://martinfowler.com/bliki/TestDouble.html)_)__ 이란 프로덕션 객체(Production Object)를 대체하는 테스트 전용 객체를 의미한다.

> Meszaros uses the term _[Test Double](https://en.wikipedia.org/wiki/Test_double)_ as the generic term for any kind of pretend object used in place of a real object for testing purposes.

__TestDoubles__:
- __Dummy__ objects are passed around but never actually used. Usually they are just used to fill parameter lists.
- __Fake__ objects actually have working implementations, but usually take some shortcut which makes them not suitable for production (an _[InMemoryTestDatabase](https://martinfowler.com/bliki/InMemoryTestDatabase.html)_ is a good example).
- __Stub__ provide canned answers to calls made during the test, usually not responding at all to anything outside what's programmed in for the test.
- __Spy__ are stubs that also record some information based on how they were called. One form of this might be an email service that records how many messages it was sent.
- __Mock__ are pre-programmed with expectations which form a specification of the calls they are expected to receive. They can throw an exception if they receive a call they don't expect and are checked during verification to ensure they got all the calls they were expecting

크게는 Mock(Mock & Spy) 과 Stub(Stub, Dummy, Fake) 로 나뉜다. 테스트 더블을 사용하는 것은 단위 테스트에만 국한되지 않는다. 더 정교한 테스트 더블을 사용하면 제어된 방식으로 시스템의 전체 부분을 시뮬레이션할 수 있다.

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
- Fake 객체는 실제 구현과 유사한 동작을 하지만, 실제 프로덕션 코드를 사용하지 않는다. 훨씬 더 단순한 방법으로 동작한다. 예를 들어, 인메모리 데이터베이스 등을 사용할 수 있다.

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
- 테스트 대상 메서드가 의존 대상과 어떻게 상호작용하는지 단언하고자 하는 경우에 사용된다.

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
- Stub 객체는 특정 메서드 호출에 대해 __미리 준비된(하드코딩 된) 응답을 제공__ 한다. 스텁은 실제로 동작하는 구현체가 없다.
- 테스트 과정에서 종속성의 비용이 크다면 Stub 이 유용할 수 있다.

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

_[Effective Software Testing: A developer's guide](https://www.amazon.com/Effective-Software-Testing-developers-guide/dp/1633439933)_ 책에서는 Mock 과 Stub 의 차이점으로 아래와 같이 설명하고 있다.

이메일 발송과 같이 서버에 사이드 이펙트를 초라하는 상호 작용의 경우에 사용되는 테스트 대역은 Mock 이며, 데이베이스에서 데이터 검색과 같이 서버 내부로 들어오는 상호작용에 사용되는 테스트 대역은 Stub 이다.

```java
// Mock
public void Sending_a_greetings_email() {
    var mock = new Mock<IEmailGateway>();
    var sut = new Controller(mock.Object);
    // ...
}
// Stub
public void Creating_a_report() {
    var stub = new Mock<IDatabase>();
    val sut = new Controller(stub.Object);
    // ...
}
```

위 처럼 외부 시스템을 사용하는 경우에는 Mock 을 사용하며 __상호 작용__ 을 모방하고 검증하는 반면, Stub 의 경우에는 상호 작용만 모방하고 검사하진 않는다.

#### Over Specification

최종 결과가 아닌 사항을 검증하는 관행을 __과잉 명세(overspecification)__ 라고 한다. 과잉 명세는 상호 작용을 검사할 때 가장 흔하게 발생한다.

__Anti-Patterns__:

```java
public void Creating_a_report() {
    var stub = new Mock<IDatabase>();
    stub.Setup(x => x.GetNumberOfUsers()).Returns(10);
    
    val sut = new Controller(stub.Object);
    
    Report report = sut.CreateReport();
    
    Assert.Equal(10, report.NumberOfUsers);
    
    // Over Specification
    stub.Verify(
            x => x.GetNumberOfUsers(),
            Times.Once
    );
}
```

이러한 과잉 명세는 스텁을 사용하면서 상호 작용을 검사하려고 할 때 발생한다.

#### Command Query Responsibility Segregation

Mock 과 Stub 은 명령과 조회와 연관되어있다. 즉, _[Command Query Responsibility Segregation](https://en.wikipedia.org/wiki/Command_Query_Responsibility_Segregation)_ 원칙과 관련이 있다.

명령에 속하며, 메서드가 void 타입이고 사이드 이펙트를 일으키는 경우에는 Mock, 조회에 속하며 사이드 이펙트가 없고 값을 반환하는 경우에는 Stub 이다.
즉, <mark><em><strong>명령을 대체하는 테스트 대역은 Mock 이며, 조회를 대체하는 테스트 대역은 Stub</strong></em></mark> 이다.

항상 이 원칙을 따르지는 않는데 메서드가 값을 반환하면서 사이드 이펙트를 일으키는 경우도 있다. (e.g stack.pop())

### Mock with Stub

Mock 과 Stub 을 함께 사용할 수 도 있다. 

```java
public void Purchase_fails_when_not_enough_inventory() {
    var storeMock = new Mock<IStore>();

    // Stub = 미리 준비된 응답을 제공
    storeMock.Setup(x = > x.HasEnoughInventory(Product.Shampoo, 5)).Returns(false);

    var sut = new Customer();

    bool success = sut.Purchase(storeMock.Object, Product.Shampoo, 5);

    Assert.False(success);

    // Mock = SUT 에서 수행한 호출을 검사
    storeMock.Verify(
            x = > x.RemoveInventory(Product.Shampoo, 5),
            Times.Never()
    );
}
```

### Drawbacks of Mock

특정 개발자들은 모의 객체를 사용하는 것은 테스트 스위트가 __코드가 아니라 모의 객체를 테스트__ 하도록 만든다고 믿는다.
또한 실제로 이런 일이 발생한다. 모의 객체를 사용하면 자연스럽게 테스트를 덜 현실적으로 만든다.

테스트가 프로덕션 코드에 대해서 너무 많이 알고 있는 경우, __테스트를 변경하기 힘들 수 있다.__ 프로덕션 코드의 클래스 동작을 변경하려는 경우,
테스트 또한 변경이 많이 생길 수 있다.

모의 객체는 테스트를 단순하게 해주지만 테스트와 제품 코드간의 결합도(coupling) 를 증가 시킨다.

### When to fake; when to mock

의존성이 다음과 같은 종류일 때 Mock 또는 Stub 을 사용하는 것이 좋다.

- __의존성이 너무 느린 경우__: 의존하는 대상이 너무 느리면 이를 시뮬레이션 하는 것이 좋다.
- __의존성이 외부 인프라와 통신 하는 경우__: 의존성이 외부 인프라와 통신하고 있다면 매우 느리거나, 인프라 설정 과정이 복잡할 수 있다.
- __의존성을 시뮬레이션하기 힘든 경우__: 의존성을 강제로 시뮬레이션하기 힘든 경우 모의 객체나 스텁이 도움이 된다.

아래와 같은 경우에는 Mock 또는 Stub 을 꺼리게 된다.

- __Entity__
- __Native Library 와 Utility Methods__
- __단순한 의존성__

___[When to fake; when to mock](https://thecodewhisperer-blog.tumblr.com/post/1121571119/when-to-fake-when-to-mock)___ 에서는 다음과 같이 말하고 있다.

![](/resource/wiki/test-testdoubles/mock-fake.png)

## Wrapping DateTime

자바의 시간 API 를 어떻게 Stub 으로 제공하기 위해서는 자바 Date Library 를 포함한 모든 날짜 및 시간 로직을 특정 클래스로 ___[Encapsulation](https://baekjungho.github.io/wiki/oop/oop-encapsulation/)___ 하는 것이다.

__Abstracted by Clock Class__:

```java
public class Clock {
    public LocalDate now() {
        return LocalDate.now();
    }
    
    // 그 외 날짜 및 시간 연산 ...
}
```

__Production Code__:

```java
public class ChristmasDiscount {
    private final Clock clock;
    
    public ChristmasDiscount(Clock clock) {
        this.clock = clock;
    }
    
    public double applyDiscount(double rawAmount) {
        LocalDate today = clock.now();
        // Logic ...
    }
}
```

__Test Code__:

```java
class ChristmasDiscountTest {
    private final Clock clock = mock(Clock.class);
    private final ChristmasDiscount cd = new ChristmasDiscount(clock);
    
    @Test
    void christmas() {
        LocalDate christmas = LocalDate.of(2024, Month.DECEMBER, 25);
        when(clock.now()).thenReturn(christmas);
        
        double finalValue = cd.applyDiscount(100.0);
        assertThat(finalValue).isCloseTo(85.0, offset(0.001));
    }
}
```

- [Overriding System Time for Testing in Java](https://www.baeldung.com/java-override-system-time)
- [테스트 코드에선 LocalDate.now()를 쓰지말자](https://jojoldu.tistory.com/416)

## References

- Effective Software Testing: A developer's guide / Mauricio Aniche
- [Test Double / Martinfowler](https://martinfowler.com/bliki/TestDouble.html)
- [Mocks Aren't Stubs /  Martinfowler](https://martinfowler.com/articles/mocksArentStubs.html)