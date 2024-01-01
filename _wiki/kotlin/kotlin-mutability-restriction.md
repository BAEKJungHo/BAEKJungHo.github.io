---
layout  : wiki
title   : Mutability Restriction
summary : Difficulties in managing states
date    : 2024-01-01 09:54:32 +0900
updated : 2024-01-01 10:15:24 +0900
tag     : kotlin
toc     : true
comment : true
public  : true
parent  : [[/kotlin]]
latex   : true
---
* TOC
{:toc}

## Difficulties in managing states

```kotlin
class BankAccount {
    val balance = 0.0
        private set
    ...
}
```

위 처럼 __상태(state)__ 를 관리하는 것은 양날의 검이다. 시간의 변화에 따라서 변하는 요소를 표현할 순 있지만,
상태를 적절히 관리하는 것이 어렵다.

__Cons__
- 프로그램을 이해하고 디버그 하기 힘들다. 상태를 갖는 부분들의 관계를 이해해야 하며, 예상치 못한 오류가 발생했을 때 상태 관리가 어렵다.
- 가변성(mutability)이 있으면, 코드의 실행을 추론하기 어렵다. 시점에 따라서 값이 달라질 수 있기 때문에, 현재 어떤 값을 갖고 있는지 알아야 코드의 실행을 예측할 수 있다.
- 멀티스레드 프로그램일 경우 동기화가 필요하다.
- 테스트하기 어렵다. 모든 상태를  테스트해야 하므로, 변경이 많으면 많을수록 더 많은 조합을 테스트해야 한다.

대규모 팀일 경우 __일관성(consistency) 문제__, __복잡성(complexity) 증가__ 와 관련된 문제에 익숙하다. __공유 상태(shared states)__ 를 관리하는 것은 정말 힘들다.

## Mutability Restriction

코틀린에서 가변성을 제한하는 방법

__읽기 전용 프로퍼티(val)__:
- val 의 값은 변경될 수 있지만 프로퍼티 래퍼런스 자체를 변경할 수는 없으므로 동기화 문제 등을 줄일 수 있다.
- 즉, val 은 immutable 하진 않다.
- 만약 완전히 변경할 수 없다면 final property 를 사용하는 것이 좋다.

__가변 컬렉션과 읽기 전용 컬렉션 구분하기__:
- 읽기 전용 컬렉션도 내부의 값을 변경할 수 없는건 아니다. 하지만 읽기 전용 인터페이스가 이를 지원하지 않기 때문에 변경하지 못하는 것 뿐이다.
- 컬렉션을 진짜 불변(immutable)하게 만들지 않고, 읽기 전용으로 설계했다.
- 리스트를 읽기 전용으로 리턴하면, 읽기 전용으로만 사용해야 한다.
- 읽기 전용에서 mutable 로 변경해야 한다면, 복제(copy)를 통해서 새로운 mutable 컬렉션을 만들어 사용해야 한다. (e.g list.toMutableList)
  - list is MutableList (X)

__data class 의 copy__:
- immutable 객체를 사용했을 때의 장점
  - immutable 객체를 공유하더라도 충돌이 이뤄지지 않아 병렬 처리를 안전하게 할 수 있다.
  - immutable 객체에 대한 참조가 변경되지 않아 캐시할 수 있다.
  - immutable 객체는 [방어적 복사본(defensive copy)](https://baekjungho.github.io/wiki/functional/functional-defensive-copy/) 를 할 필요가 없다.
  - immutable 객체는 다른 객체(mutable, immutable)를 만들 때 활용하기 좋다.
  - immutable 객체는 set, map 의 key 로 활용할 수 있다.
    - set, map 이 내부적으로 해시 테이블을 사용하고, 해시 테이블은 처음 요소를 넣을 때 요소의 값을 기반으로 버킷을 결정한다. 따라서 요소가 변경되면 안된다.

```kotlin
class User(
    val name: String,
    val surname: String
) {
    // 성을 변경해야 하는 경우, withSurname 메서드를 제공해서 새로운 객체를 생성
    fun withSurname(surname: String) = User(name, surname)
}
```

위 처럼 함수를 하나하나 만드는 것이 귀찮기 때문에 __copy__ 메서드를 사용하면 됨.

```kotlin
var user = User(name = "Jin", surname = "Mac")
user = user.copy(surname = "Max")
```

### Defensive Copy

방어적 복제(defensive copy) 를 사용하여 가변성을 제한할 수 있다.

```kotlin
class UserHolder {
    private val user: MutableUser()
    
    fun get(): MutableUser {
        return user.copy()
    }
}
```

### Upcasting to Supertype

슈퍼타입으로 업캐스팅하여 가변셩을 제한할 수 있다.

```kotlin
data class User(val name: String)

class UserRepository {
    private val storedUsers: MutableMap<Int, String> = mutableMapOf()
    
    // Upcasting to Supertype
    fun loadAll(): Map<Int, String> {
        return storedUsers
    }
}
```

## References

- Effective Kotlin / Moskala, Marcin 저 / 프로그래밍인사이트