---
layout  : wiki
title   : Handling Nulls Safely
summary : 
date    : 2024-01-12 20:54:32 +0900
updated : 2024-01-12 21:15:24 +0900
tag     : kotlin 
toc     : true
comment : true
public  : true
parent  : [[/kotlin]]
latex   : true
---
* TOC
{:toc}

## Lack of value

null 은 __값이 부족하다(lack of value)__ 는 것을 나타낸다.

함수가 null 을 리턴하는 것은 여러 의미를 가질 수 있으며, null 은 최대한 __명확한 의미__ 를 가져야 한다.
null 사용이 나쁜 것은 아닌데, 보기에 의미가 없는 null 일 경우에는 나쁜 케이스에 해당된다.

- String.toIntOrNull() 은 Int 로 변환할 수 없을 경우 null 을 반환
- Iterable.firstOrNull(() -> Boolean) 은 주어진 조건에 맞는 요소가 없을 경우 null 을 반환

## Handling Nulls Safely

### Safe Call & Smart Casting

```kotlin
printer?.print() // safe call
if (printer != null) printer.print() // smart casting
val printName = printer?.name ?: "Unnamed"
```

Smart Casting 은 코틀린의 __규약 기능(contracts feature)__ 을 지원한다.

```kotlin
println("What is your name ?")
val name = readLine()
if (!name.isNullOrBlank()) {
    println("Hello ${name.toUpperCase()}")
}

val news: List<News>? = getNews()
if (!news.isNullOrEmpty()) {
    news.forEach{ notifyUser(it) }
}
```

### Exception Throwing

```kotlin
fun process(user: User) {
    requireNotNull(user.name)
    val context = checkNotNull(context)
    val networkService = getNetworkService(context) ?: throw NoInternetConnection()
    networkService.getData {
        data, userData -> show(data!!, userData!!)
    }
}
```

### Notnull Assertion

nullable 을 처리하는 가장 간단한 방법은 Notnull Assertion(!!) 를 사용하는 것이다. 근데 사실 좋은 방법은 아니다.
!! 기호가 되게 못생겼는데, 그 이유는 가급적 사용하지 말라는 뜻으로 설계되었다고 알고 있다.

!! 를 사용하면 자바에서 nullable 을 처리할 때 발생할 수 있는 문제가 똑같이 발생한다. 좋은 방법은 아니다.

!! 는 타입이 nullable 이지만 __null 이 나오지 않는다는 것을 확신할 수 있는 경우__ 에만 사용해야 한다. 
현재가 확실하다고 미래가 확실한 것은 아니다. !! 로 되어있다면 미래에 리팩토링할 때 다른 개발자가 nullability(널일 수 있는지) 를 놓치는 경우가 발생할 수 있다.

### Avoiding Meaningless Nullability

의미 없는 nullability 는 피해야 한다. nullability 는 어떻게든 적절하게 처리해야 하므로 추가 비용이 발생한다.

__How to avoiding meaningless nullability__:
- 함수 제공 (e.g List 의 get 과 getOrNull)
- 어떤 값이 클래스 생성 이후에 확실하게 설정된다는 보장이 있다면, lateinit 프로퍼티와 notNull delegate 사용
- 빈 컬렉션 대신 null 을 리턴하지 말기. null 은 컬렉션이 없다는 것을 의미한다. 따라서 요소가 부족하다는 것을 나타내려면 빈 컬렉션을 반환해야 한다.

__lateinit property__:

```kotlin
class UserControllerTest {
    private lateinit var repository: UserRepository
    private lateinit var controller: UserController
    
    @BeforeEach
    fun init() {
        repository = mockk()
        UserController(repository)
    }
    
    @Test
    fun test() {
        controller.doSomething()
    }
}
```

lateinit 은 처음 사용하기 전에 반드시 초기화가 되어있어야 한다. 프로퍼티가 초기화된 이후에는 초기화되지 않은 상태로 돌아갈 수 없다.

__Delegates.notNull__:

```kotlin
class DoctorActivity: Activity() {
    private var doctorId: Int by Delegates.notNull()
    private var fromNotification: Boolean by Delegates.notNull()
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        doctorId = intent.extras.getInt(DOCTOR_ID_ARG)
        fromNotification = intent.extras.getBoolean(FROM_NOTIFICATION_ARG)
    }
}
```

lateinit 을 사용할 수 없는 경우도 있다. JVM 에서 Int, Long, Double, Boolean 과 같은 기본 타입과 연결된 타입으로 프로퍼티를 초기화해야 하는 경우이다.
이런 경우에는 lateinit 보다는 약간 느리지만, Delegates.notNull 을 사용한다.

아래와 같이 __프로퍼티 위임(property delegation)__ 패턴을 사용하여 nullability 로 발생하는 여러 가지 문제를 안전하게 처리할 수 있다.

```kotlin
class DoctorActivity: Activity() {
    private var doctorId: Int by arg(DOCTOR_ID_ARG)
    private var fromNotification: Boolean by arg(FROM_NOTIFICATION_ARG)
}
```

## References

- Effective Kotlin / Marcin Moskala 저 / 인사이트