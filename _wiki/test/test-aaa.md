---
layout  : wiki
title   : AAA
summary : Arrange,Act,Assert
date    : 2024-12-08 11:54:32 +0900
updated : 2024-12-08 12:15:24 +0900
tag     : test
toc     : true
comment : true
public  : true
parent  : [[/test]]
latex   : true
---
* TOC
{:toc}

## AAA

___[AAA(Arrange, Act, Assert)](https://automationpanda.com/2020/07/07/arrange-act-assert-a-pattern-for-writing-good-tests/)___ 의 목적은 테스트 케이스를 구조화 하여 테스트의 이해와 가독성을 높이는 것이다.

- ___Arrange___ describes whatever setup is needed
- ___Act___ describes the subject's behavior that's under test (and typically only describes a single line needed to invoke that behavior)
- ___Assert___ describes the verification that the subject's behavior had the desired effect by evaluating its return value or measuring a side-effect (with a spy or mock)

___[Testing Style](https://kotest.io/docs/framework/testing-styles.html)___ 중 하나를 선택하여 테스트 코드를 작성하곤 한다. 
테스트 코드를 작성하다 보면, 함수 내에서 arrange,act,assert or given,when,then 의 주석을 작성하거나 혹은 작성이 되어있지 않아 구조를 파악하는데 어려움을 겪을 때가 있다.
이때, AAA DSL 을 활용하면 주석이 필요 없으며, arrange 이후 act 과정에서 필요한 변수가 무엇인지 파악하기 쉽다는 장점이 있다.

AAA DSL 은 kotest original 인 StringSpec 또는 Scala 에서 영감을 받은 FunSpec 과 궁합이 좋다.

__AAA DSL__:

```kotlin
fun <T> arrange(block: () -> T): T {
    return block()
}

fun <T> act(block: () -> T): T {
    return block()
}

fun assert(block: () -> Unit) {
    block()
}
```

__Examples__:

```kotlin
import io.kotest.core.spec.style.StringSpec
import io.kotest.matchers.shouldBe
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify

class UserServiceTest : StringSpec({
    
    "should register a new user successfully" {
        val userRepository = mockk<UserRepository>()
        val emailValidator = mockk<EmailValidator>()
        val userService = UserService(userRepository, emailValidator)

        arrange {
            val newUser = User(email = "test@example.com", name = "Test User")
            every { userRepository.existsByEmail("test@example.com") } returns false
            every { emailValidator.isValid("test@example.com") } returns true
            every { userRepository.save(any()) } returns newUser
            newUser
        }.let { newUser ->
            act {
                userService.registerUser(newUser)
            }
            
            assert {
                verify(exactly = 1) { userRepository.save(newUser) }
                verify(exactly = 1) { emailValidator.isValid("test@example.com") }
                newUser.id shouldBe 1  // assuming save() sets the ID to 1
            }
        }
    }

    "should not register if email is invalid" {
        val userRepository = mockk<UserRepository>()
        val emailValidator = mockk<EmailValidator>()
        val userService = UserService(userRepository, emailValidator)

        arrange {
            val newUser = User(email = "invalid-email", name = "Test User")
            every { emailValidator.isValid("invalid-email") } returns false
            newUser
        }.let { newUser ->
            act {
                shouldThrow<InvalidEmailException> {
                    userService.registerUser(newUser)
                }
            }
            
            assert {
                verify(exactly = 0) { userRepository.save(any<User>()) }
            }
        }
    }

    "should not register existing user" {
        val userRepository = mockk<UserRepository>()
        val emailValidator = mockk<EmailValidator>()
        val userService = UserService(userRepository, emailValidator)

        arrange {
            val existingUser = User(email = "test@example.com", name = "Existing User")
            every { userRepository.existsByEmail("test@example.com") } returns true
            existingUser
        }.let { existingUser ->
            act {
                shouldThrow<UserAlreadyExistsException> {
                    userService.registerUser(existingUser)
                }
            }

            assert {
                verify(exactly = 0) { userRepository.save(any<User>()) }
            }
        }
    }
})
```

