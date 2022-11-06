---
layout  : wiki
title   : Mockk
summary : Mockk 를 활용한 테스트
date    : 2022-09-15 20:54:32 +0900
updated : 2022-09-15 21:15:24 +0900
tag     : kotlin mockk test
toc     : true
comment : true
public  : true
parent  : [[/kotlin]]
latex   : true
---
* TOC
{:toc}

## @Mockk

Mockk which is similar to Mockito but better suited for Kotlin.

```kotlin
@ExtendWith(MockKExtension::class)
internal class UserServiceTest: DescribeSpec() {

    companion object {
        private const val DUPLICATED_EMAIL = "abc@naver.com"
    }

    @MockK private lateinit var userStore: UserStore
    @MockK private lateinit var userReader: UserReader
    @InjectMockKs private lateinit var userService: UserService

    init {
        describe("회원 가입") {
            val validUser = UserCommand.RegisterUser(email = DUPLICATED_EMAIL, password = "123!abACC123")

            it("이메일이 중복되는 경우 회원 가입 실패") {
                assertThrows<DuplicatedEmailException> { userService.register(validUser) }
            }
        }
    }

    override fun beforeEach(testCase: TestCase) {
        // Unit-returning functions to be relaxed
        MockKAnnotations.init(this, relaxUnitFun = true)

        every { userReader.existsByEmail(DUPLICATED_EMAIL) } returns true
        every { userStore.register(any()) } just Runs
    }
}
```

- MockKAnnotations: Initializes properties annotated with @MockK, @RelaxedMockK, @Slot and @SpyK in provided object.
- @Mockk: If you want use to this annotation then follow guides
  - ```kotlin
    @MockK
    @AdditionalInterface(Runnable::class)
    private lateinit var car: Car
    ```
  - Dependency Injection: `lateinit var`

## Links

- [Mockk.io](https://mockk.io/)
- [Spring Boot Kotlin Tutorials](https://spring.io/guides/tutorials/spring-boot-kotlin/)
- [SpringMockK](https://github.com/Ninja-Squad/springmockk)
- [Mocking is not rocket science: MockK features](https://blog.kotlin-academy.com/mocking-is-not-rocket-science-mockk-features-e5d55d735a98)
- [Quarkus mockk](https://github.com/quarkiverse/quarkus-mockk)