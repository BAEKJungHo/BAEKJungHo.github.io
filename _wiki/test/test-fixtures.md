---
layout  : wiki
title   : Fixtures
summary : Sharing Test Fixtures/Dependency
date    : 2024-07-25 20:28:32 +0900
updated : 2024-07-25 21:15:24 +0900
tag     : test
toc     : true
comment : true
public  : true
parent  : [[/test]]
latex   : true
---
* TOC
{:toc}

## Fixtures

TestFixtures 란 _[SUT(System Under Test)](https://baekjungho.github.io/wiki/test/tdd-sut-doc/)_ 으로 전달되는 인수를 의미한다.
각 테스트가 실행하기 전에 고유한 상태를 유지한다. 모든 TestFixtures 를 Lifecycle 을 가지고 있다. 보통 SetUp/TearDown 을 갖는다.

__[Meaning of #NUnit](https://www.linkedin.com/pulse/what-test-fixtures-nunit-abhay-velankar-lwk3f/)__:
- A test fixture is simply a class that is marked with the [TestFixture] attribute. This attribute tells NUnit that the class contains one or more test methods.

```java
// TestFixture
public class SampleTestFixture {
    // [SetUp]
    public void SetUp() {
        // Code to run before each test method
    }

    // [TearDown]
    public void TearDown() {
        // Code to run after each test method
    }
    
    // Test methods will be defined here
}
```

## Sharing Test Fixtures/Dependency

테스트를 작성하다 보면 가독성, Fixtures 의 재사용성 그리고 테스트 의존성에 대한 고려를 하게 된다. _[Object Mother](https://baekjungho.github.io/wiki/test/test-object-mother/)_ 패턴 등을 통해
쉽게 test instance 를 생성할 수 있으며, Fixture Monkey 와 같은 라이브러리도 존재한다.

### Readability

SUT 에 전달해야하는 매개변수가 너무 많은 경우 혹은, 특정 클래스에 대한 테스트 코드를 작성하는데 해당 클래스의 의존성이 수십개인 경우 _[Mockist](https://baekjungho.github.io/wiki/test/test-detroit-mockist/)_ 방식으로 의존성을 테스트 클래스의 상위에 정의하는 경우
테스트 메서드를 보기 위해서 스크롤을 해야할 것이다. 이 경우 가독성을 너무 저하시키기 때문에, TestFixtures 를 모아둔 클래스를 제공할 수 있다.

__Bad Case__:

```kotlin
class LegacyServiceTest: FunSpec({
    val clientA = mockk<ClientA>()
    val repositoryA mockk<RepositoryA>()
    more dependency ...
    val sut = LegacyService(clientA, repositoryA, ...)

    beforeTest {
        mockkStatic(::currentUTC) // extensions function
        val fixedAt = LocalDateTime.of(2024, 7, 25, 10, 0)
        every { currentUTC() } returns fixedAt
    }
    
    test("...") { }
})
```

어떤 Fixtures 가 있는지 보다, 어떤 테스트를 다루고 있는지가 더 관심사 일 것이다. 이 경우 아래와 같은 패턴을 사용할 수도 있다.

```kotlin
class LegacyServiceTest: FunSpec({
    val fixtures = LegacyTestFixtures()
    
    beforeTest {
        mockkStatic(::currentUTC) // extensions function
        val fixedAt = LocalDateTime.of(2024, 7, 25, 10, 0)
        every { currentUTC() } returns fixedAt
    }

    test("...") { 
        with(receiver = fixtures) {
            // ...
        }
    }
})

class LegacyTestFixtures {
    val clientA = mockk<ClientA>()
    val repositoryA mockk<RepositoryA>()
    more dependency ...
    val sut = LegacyService(clientA, repositoryA, ...)
}
```

### Reusability

_[java-test-fixtures](https://docs.gradle.org/current/userguide/java_testing.html#sec:java_test_fixtures)_ 플러그인을 사용하면 테스트용으로 작성한 Builder, Helper 클래스 등을 다른 모듈과 공유할 수 있다.
또한 해당 모듈의 테스트 전용 의존성까지 전파시킬 수 있다. 이와 관련된 내용은 _[테스트 의존성 관리로 높은 품질의 테스트 코드 유지하기 - Toss Payments](https://toss.tech/article/how-to-manage-test-dependency-in-gradle)_ 에 잘 정리 되어있다.

## Links

- [Gradle Java Test Fixtures](https://docs.gradle.org/current/userguide/java_testing.html#sec:java_test_fixtures)
- [Gradle Dependency management](https://docs.gradle.org/current/userguide/java_plugin.html#sec:java_plugin_and_dependency_management)