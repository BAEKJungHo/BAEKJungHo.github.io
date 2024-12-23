---
layout  : wiki
title   : Autowiring in Spring Integration Tests with Kotest
summary : 
date    : 2024-12-23 10:25:32 +0900
updated : 2024-12-23 10:29:24 +0900
tag     : test kotlin kotest
toc     : true
comment : true
public  : true
parent  : [[/test]]
latex   : true
---
* TOC
{:toc}

## Autowiring in Spring Integration Tests with Kotest

__Dependency__:

```kotlin
testImplementation("org.springframework.boot:spring-boot-starter-test")
testImplementation("io.kotest:kotest-runner-junit5:$kotestVersion")
testImplementation("io.kotest.extensions:kotest-extensions-spring:$kotestExtensionsVersion")
```

___@SpringBootTest + SpringExtension___ 을 같이 사용해야지 Autowired 가 정상적으로 동작한다.

```kotlin
@SpringBootTest
class BookingDistributedLockConcurrencyIntegrationTest: DescribeSpec() {

    override fun extensions() = listOf(SpringExtension)

    @Autowired
    private lateinit var bookingController: BookingController

    @Autowired
    private lateinit var bookingFacade: BookingFacade

    @Autowired
    private lateinit var bookingRepository: BookingRepository

    init {
        describe("...") {
           ...
        }
    }
}
```

### SpringTestExtension

```kotlin
val SpringExtension = SpringTestExtension(SpringTestLifecycleMode.Test)

class SpringTestExtension(private val mode: SpringTestLifecycleMode = SpringTestLifecycleMode.Test) : TestCaseExtension,
   SpecExtension {

   var ignoreSpringListenerOnFinalClassWarning: Boolean = false
    
   // Spring 컨텍스트 초기화 및 정리를 Kotest 의 Spec 또는 TestCase 실행 라이프사이클에 맞춰 처리
   override suspend fun intercept(spec: Spec, execute: suspend (Spec) -> Unit) {
      safeClassName(spec::class)

      val context = TestContextManager(spec::class.java)
      withContext(SpringTestContextCoroutineContextElement(context)) {
         testContextManager().beforeTestClass()
         testContextManager().prepareTestInstance(spec)
         execute(spec)
         testContextManager().afterTestClass()
      }
   }

   override suspend fun intercept(testCase: TestCase, execute: suspend (TestCase) -> TestResult): TestResult {
      val methodName = method(testCase)
      if (testCase.isApplicable()) {
         testContextManager().beforeTestMethod(testCase.spec, methodName)
         testContextManager().beforeTestExecution(testCase.spec, methodName)
      }
      val result = execute(testCase)
      if (testCase.isApplicable()) {
         testContextManager().afterTestExecution(testCase.spec, methodName, result.errorOrNull)
         testContextManager().afterTestMethod(testCase.spec, methodName, result.errorOrNull)
      }
      return result
   }

   /**
    * Returns true if this test case should have the spring lifecycle methods applied
    */
   private fun TestCase.isApplicable() = (mode == SpringTestLifecycleMode.Root && isRootTest()) ||
      (mode == SpringTestLifecycleMode.Test && type in arrayOf(TestType.Test, TestType.Dynamic))

   ...
```

- Spring 의 테스트 컨텍스트 라이프사이클을 정확히 준수하며, 필요에 따라 클래스 수준이나 테스트 수준에서 컨텍스트를 재사용한다.
- SpringTestLifecycleMode 를 통해 개발자가 원하는 방식으로 컨텍스트 초기화 및 종료를 제어할 수 있다.

```kotlin
testContextManager().beforeTestClass()
testContextManager().prepareTestInstance(spec)
execute(spec)
testContextManager().afterTestClass()
```

__Spring 컨텍스트 라이프사이클을 제어__:
- beforeTestClass: 테스트 클래스 실행 전에 Spring 컨텍스트 초기화
- prepareTestInstance: 현재 Spec 에 대한 테스트 인스턴스 초기화
- execute(spec): Spec 실행
- afterTestClass: Spec 실행 후 컨텍스트 정리

## Links

- [How to Write a Spring Boot Test Using Kotest](https://www.baeldung.com/kotlin/kotest-spring-boot-test)