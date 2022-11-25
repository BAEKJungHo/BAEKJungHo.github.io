---
layout  : wiki
title   : Sealed
summary : Sealed Class and Sealed Interface
date    : 2022-05-21 20:54:32 +0900
updated : 2022-05-21 21:15:24 +0900
tag     : kotlin
toc     : true
comment : true
public  : true
parent  : [[/kotlin]]
latex   : true
---
* TOC
{:toc}

## Enum

똑같은 타입을 공유하는 미리 정의된 상수의 집합을 Enum 이라고 한다. 

```kotlin
enum class Result {
    SUCCESS, FAIL
}
```

Enum class 를 사용하여 요청이 성공인지 실패인지를 표현할 수 있다. 만약 종류별로 애트리뷰트가 달라야하는 경우에는 __Class Hierarchy__ 를 사용하여 모델링할 수 있다.

## Class Hierarchy

```kotlin
abstract class Result {
    class Success(val value: Any): Result() {
        fun printResult() { println(value) }
    }
    
    class Fail(val message: String): Result() {
        fun throwException() {
            throw RuntimeException(message)
        }
    }
}
```

```kotlin
val message = when (val result = runComputation()) {
    is Result.Success -> "${result.value}"
    is Result.Fail -> "${result.message}"
    else -> return
}
```

이 방식의 단점은 Result 의 종류를 Success, Fail 로 한정하지 못한다. 즉, 새로운 하위 클래스를 다른 개발자가 추가해서 사용할 수 있다.

이러한 __Sub Classing__ 이 가능하다는 점이 when 식에서 else 가 필요한 이유이기도 하다. 이러한 문제를 __sealed class(interface)__ 를 사용하여 문제를 해결할 수 있다.

## sealed class

```kotlin
sealed class Result {
    class Success(val value: Any): Result() { ... }
    class Fail(val message: String): Result() { ... }
}
```

- sealed class 는 같은 컴파일 단위 안의 같은 패키지에 있는 sealed class 나 sealed interface 를 상속할 수 있다. 다른 패키지에 있는 경우에는 상속할 수 없다.
- sealed class 는 abstract class 처럼 직접 인스턴스를 만들 수 없다.
- sealed class 의 constructor 는 디폴트로 private 이다. 접근 제한자를 바꾸면 compile error 가 발생한다.

```kotlin
// else 문이 필요 없다.
val message = when (val result = runComputation()) {
    is Result.Success -> "${result.value}"
    is Result.Fail -> "${result.message}"
}
```

### syntactic tree

data class 도 sealed class 를 상속할 수 있다.

```kotlin
sealed class Expr

data class Const(val num: Int): Expr()
data class Neg(val operand: Expr): Expr()
data class Plus(val op1: Expr, val op2: Expr): Expr()
data class Mul(val op1: Expr, val op2: Expr): Expr()

fun Expr.eval(): Int = when (this) {
    is Const -> num
    is Neg -> -operand.eval()
    is Plus -> op1.eval() + op2.eval()
    is Mul -> op1.eval() + op2.eval()
}

fun main() {
    val expr = Mul(Plus(Const(1), Const(2)), Const(3))
}
```

## sealed interface

Kotlin 1.5 버전부터는 sealed 변경자를 인터페이스에서도 사용할 수 있게 되었다. 또한 아래 제약 조건도 제거되었다.

- __Removed Restrictions__
  - Starting on Kotlin 1.5 location restrictions will get relaxed, so we can declare them on different files under the same module.
  - This is also possible for [sealed classes and sealed interfaces](https://openjdk.org/jeps/360) in Java 15
- __Aims__
  - The aim is also to allow splitting large sealed class hierarchies into different files to make things more readable.

### Why not sealed class

- sealed interface 를 사용해야하는 이유 중 하나는, Kotlin 에서 Enum class 는 interface 를 구현할 수 있다.
  - [Implementing interfaces in enum classes](https://kotlinlang.org/docs/enum-classes.html#implementing-interfaces-in-enum-classes)
- interface 는 다른 여러 인터페이스를 구현할 수 있지만, sealed class 는 하나의 부모 클래스에만 제한된다.
- sealed interface 는 sealed class 보다 hierarchy 를 표현하기에 더 적합합니다.

### Hierarchy

#### sealed class

```kotlin
sealed class CommonErrors: LoginErrors()
object ServerError: CommonErrors()
object Forbidden: CommonErrors()
object Unauthorized: CommonErrors()

sealed class LoginErrors {
  data class InvalidUsername(val username: String) : LoginErrors()
  object InvalidPasswordFormat : LoginErrors()
}
```

```kotlin
fun handleLoginError(error: LoginErrors): String = when (error) {
  ServerError -> TODO()
  Forbidden -> TODO()
  Unauthorized -> TODO()
  is LoginErrors.InvalidUsername -> TODO()
  LoginErrors.InvalidPasswordFormat -> TODO()
}
```

sealed class 의 문제는 CommonErrors 를 다른 두 계층 구조의 일부로 만들고 싶으면 다중 상속을 해야하는데, 이것은 불가능하다.

```kotlin
// impossible
sealed class CommonErrors: LoginErrors(), GetUserErrors()
```

이러한 문제를 sealed interface 를 사용하여 해결할 수 있다.

#### sealed interface

```kotlin
sealed class CommonErrors : LoginErrors, GetUserErrors // extend both hierarchies
object ServerError : CommonErrors()
object Forbidden : CommonErrors()
object Unauthorized : CommonErrors()

sealed interface LoginErrors {
  data class InvalidUsername(val username: String) : LoginErrors
  object InvalidPasswordFormat : LoginErrors
}

sealed interface GetUserErrors {
  data class UserNotFound(val userId: String) : GetUserErrors
  data class InvalidUserId(val userId: String) : GetUserErrors
}
```

## Links

- [Sealed interfaces in Kotlin](https://jorgecastillo.dev/sealed-interfaces-kotlin)
- [Sealed interfaces and sealed classes freedom](https://github.com/Kotlin/KEEP/blob/master/proposals/sealed-interface-freedom.md)

## References

- Kotlin In Action / Dmitry Jemerov, Svetlana Isakova 공저 / 에이콘
- 코틀린 완벽 가이드 / Aleksei Sedunov 저 / 길벗