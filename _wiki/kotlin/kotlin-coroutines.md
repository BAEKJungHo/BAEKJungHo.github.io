---
layout  : wiki
title   : Coroutines
summary : 
date    : 2022-06-18 20:54:32 +0900
updated : 2022-06-18 21:15:24 +0900
tag     : kotlin coroutine
toc     : true
comment : true
public  : true
parent  : [[/kotlin]]
latex   : true
---
* TOC
{:toc}

## Coroutines

코루틴은 컴퓨터 프로그램 구성 요소 중 하나로 비선점형 멀티태스킹(non-preemptive multitasking)을 수행하는 일반화한 서브루틴(subroutine)이다. 코루틴은 실행을 일시 중단(suspend) 하고, 재개(resume)할 수 있는 여러 진입 지점(entry point)을 허용한다.

### Subroutines
 
서브루틴은 여러 명령어를 모아 이름을 부여해서 반복 호출할 수 있게 정의한 프로그램 구성요소로 함수라고 부르기도 한다. 객체지향 언어에서는 메서드도 서브루틴이라 할 수 있다.

서브루틴에 진입하는 방법은 한 가지(해당 함수를 호출하면 서브루틴의 맨 처음부터 실행이 시작됨) 뿐이며, 그때 마다 __활성 레코드(activation record)__ 라는 것이 __스택(stack)__ 에 할당 되고, 서브루틴 내부의 로컬 변수 등이 초기화 된다.

서브루틴에서 반환되고 나면 활성 레코드가 스택에서 사라지기 때문에 실행 중이던 모든 상태를 잃어버린다. 따라서 여러 번 반복 실행해도(전역 변수나 다른 부수 효과가 있지 않는 한) 항상 같은 결과를 반복해서 얻게 된다.

### Multitasking

멀티태스킹은 여러 작업을 동시에 수행하는 것처럼 보이거나 실제로 동시에 수행하는 것이다. 비선점형이란 멀티태스킹의 각 작업을 수행하는 참여자들의 실행을 운영체제가 강제로 일시 중단시키고 다른 참여자를 실행하게 만들 수 없다는 뜻이다. 따라서 각 참여자들이 서로 자발적으로 협력해야만 비선점형 멀티태스킹이 제대로 작동할 수 있다.

### Subroutines vs Coroutines

![](/resource/wiki/kotlin-coroutines/subvsco.png)

### Coroutines Thread ?

- One can think of coroutines as a light-weight thread.
- The biggest difference is that coroutines are very cheap, almost free: we can create thousands of them, and pay very little in terms of performance.
- __Light-weight thread__

## Why use Coroutines

- __Why use Coroutines__
  - [Callback Pattern](https://baekjungho.github.io/wiki/designpattern/designpattern-callback/)
  - Reactive Streams 의 문제는 코드의 Flow 를 이해하기 어렵다는 것이다. 코루틴은 비동기를 처리하면서도 코드를 동기식으로 이해할 수 있다.

## Suspension Mechanism

- [Suspension Mechanism](https://baekjungho.github.io/wiki/kotlin/kotlin-suspend/)

## Coroutine builder

> suspending 람다를 인자로 받는 함수로 코루틴을 생성하고 어떤 경우는 결과에 접근할 수 있는 옵션을 제공한다. 예를 들어 launch{}, future(), sequence()는 코루틴 빌더다.

## launch

launch 는 코루틴을 Job 으로 반환하며 만들어진 코루틴은 기본적으로 즉시 실행된다. Job 의 cancel() 을 통해서 코루틴 실행을 중단 시킬 수 있다.

launch 가 동작하기 위해서는 CoroutineScope 객체가 블록의 this 로 지정돼야 한다.

```kotlin
public fun CoroutineScope.launch(
    context: CoroutineContext = EmptyCoroutineContext,
    start: CoroutineStart = CoroutineStart.DEFAULT,
    block: suspend CoroutineScope.() -> Unit
): Job {
    val newContext = newCoroutineContext(context)
    val coroutine = if (start.isLazy)
        LazyStandaloneCoroutine(newContext, block) else
        StandaloneCoroutine(newContext, active = true)
    coroutine.start(start, coroutine, block)
    return coroutine
}
```

다른 suspend 함수 내부라면 해당 함수가 사용 중인 CoroutineScope 가 있겠지만, 그렇지 않은 경우에는 GlobalScope 를 이용하면 된다.

```kotlin
fun now() = ZoneDateTime.now().toLocalTime().truncatedTo(ChronoUnit.MILLIS)

fun log(msg: String) = println("${now()}: ${Thread.currentThread()}: ${msg}")

fun launchInGlobalScope() {
    GlobalScope.launch {
        log("coroutine started")
    }
}

fun main() {
    log("main() started")
    launchInGlobalScope()
    log("launchInGlobalScope() executed")
    Thread.sleep(5000L)
    log("main() terminated")
}
```

실행 결과는 다음과 같다.

```idle
Thread[main] main() started 
Thread[main] launchInGlobalScope() executed
Thread[DefaultDispatcher-worker-2] coroutine started
Thread[main] main() terminated
```

GlobalScope.launch 가 만들어낸 코루틴은 메인 함수와 다른 스레드에서 실행된다. GlobalScope 는 메인 스레드가 실행 중인 동안만 코루틴의 동작을 보장해준다. 따라서 Thread.sleep(5000L) 이 없더라면 코루틴이 실행되지 않을 것이다.

이를 방지하기 위해서는 비동기적으로 launch 를 실행하거나, launch 가 모두 다 실행될 때 까지 기다려야 한다. 코루틴의 실행이 끝날 때까지 현재 스레드를 블록시키는 함수 `runBlocking()` 이 있다. runBlocking() 은 일반 함수이기 때문에 별도의 코루틴 스코프 객체 없이 사용 가능하다.

```kotlin
expect fun <T> runBlocking(context: CoroutineContext = EmptyCoroutineContext, block: suspend CoroutineScope.() -> T): T
```

```kotlin
fnn runblockingExample() {
    runBlocking {
        launch {
            log("GlobalScope.launch started")
        }
    }
}
```

실행 결과는 다음과 같다.

```idle
Thread[main] main() started 
Thread[main] coroutine started
Thread[main] runBlockingExample() executed
Thread[main] main() terminated
```

__스레드가 모두 main() 에서 동작하기 때문에 코루틴들이 서로 yield() 를 해주면서 협력할 수 있다.__

```kotlin
fun yieldExample() {
    runBlocking {
        launch {
            log("1")
            yield()
            log("3")
            yield()
            log("5")
        }
        log("after first launch")
        launch {
            log("2")
            delay(1000L)
            log("4")
            delay("1000L")
            log("6")
        }
    }
}
```

실행 결과는 다음과 같다.

```idle
Thread[main] main() started 
Thread[main] after first launch
Thread[main] after second launch
Thread[main] 1
Thread[main] 2
Thread[main] 3
Thread[main] 5
Thread[main] 4
Thread[main] 6
Thread[main] after runBlocking
Thread[main] yieldExample() executed
Thread[main] main() terminated
```

결과를 통해서 다음과 같은 특징을 알 수 있다.

- launch 는 즉시 반환된다.
- runBlocking 은 내부 코루틴이 모두 끝난 다음 반환된다.
- delay() 를 사용한 코루틴은 그 시간이 지날 때 까지 다른 코루틴에게 실행을 양보한다. 만약, delay() 대신 yield() 를 사용했다면 1,2,3,4,5,6 의 결과가 나왔을 것이다.

## async

```kotlin
public fun <T> CoroutineScope.async(
    context: CoroutineContext = EmptyCoroutineContext,
    start: CoroutineStart = CoroutineStart.DEFAULT,
    block: suspend CoroutineScope.() -> T
): Deferred<T> {
    val newContext = newCoroutineContext(context)
    val coroutine = if (start.isLazy)
        LazyDeferredCoroutine(newContext, block) else
        DeferredCoroutine<T>(newContext, active = true)
    coroutine.start(start, coroutine, block)
    return coroutine
}
```

async 는 launch 와 같은 일을 한다. 차이는 async 는 Deferred 를 반환한다. Deferred 는 Job 을 상속했기 때문에 launch 대신 async 를 써도 문제가 없다.

```kotlin
interface Deferred<out T> : Job
```

> All functions on this interface and on all interfaces derived from it are thread-safe and can be safely invoked from concurrent coroutines without external synchronization.
> 
> Deferred interface and all its derived interfaces are not stable for inheritance in 3rd party libraries, as new methods might be added to this interface in the future, but is stable for use.

Deferred 의 타입 파라미터는 Deferred 코루틴이 계산을 하고 돌려주는 값의 타입이다. Job 은 Unit 을 돌려주는 `Deferred<Unit>` 이라고 생각할 수 있다.

async 는 코드 블록을 비동기로 실행할 수 있고, async 가 반환하는 Deferred 의 `await` 을 사용해서 코루틴이 결과 값을 내놓을 때까지 기다렸다가 결과 값을 얻어낼 수 있다.

```kotlin
/**
 * Awaits for completion of this value without blocking a thread and resumes when deferred computation is complete, returning the resulting value or throwing the corresponding exception if the deferred was cancelled.
 */
abstract suspend fun await(): T
```

async/await 을 사용한 코드는 다음과 같다.

```kotlin
val result = runBlocking {
    orders.map { order ->
        async {
            val approveResult = orderService.approve(order)
            order.update(status = approveResult.status)
            approveResult
        }
    }.awaitAll()
}
```

async 로 코드를 실행하는 데는 시간이 거의 걸리지 않는다. 병렬 처리와의 가장 큰 차이는 모든 작업이 main() 스레드 안에서 일어난다는 점이다. 비동기 코드가 늘어남에 따라 async/await 을 사용한 비동기가 빛을 발한다. 실행하려는 작업이 시간이 얼마 걸리지 않거나 I/O 에 의한 대기 시간이 크고, CPU 코어 수가 작아 동시에 실행할 수 있는 스레드 개수가 한정된 경우에는 특히 코루틴과 일반 스레드를 사용한 비동기 처리 사이에 차이가 커진다.

## CoroutineDispatcher

```kotlin
abstract class CoroutineDispatcher : AbstractCoroutineContextElement, ContinuationInterceptor
```

> The following standard implementations are provided by kotlinx.coroutines as properties on the Dispatchers object:
> 
> Dispatchers.Default — is used by all standard builders if no dispatcher or any other ContinuationInterceptor is specified in their context. It uses a common pool of shared background threads. This is an appropriate choice for compute-intensive coroutines that consume CPU resources.
> 
> Dispatchers.IO — uses a shared pool of on-demand created threads and is designed for offloading of IO-intensive blocking operations (like file I/O and blocking socket I/O).
> 
> Dispatchers.Unconfined — starts coroutine execution in the current call-frame until the first suspension, whereupon the coroutine builder function returns. The coroutine will later resume in whatever thread used by the corresponding suspending function, without confining it to any specific thread or pool. The Unconfined dispatcher should not normally be used in code.
>
> Private thread pools can be created with newSingleThreadContext and newFixedThreadPoolContext.
>
> An arbitrary java.util.concurrent.Executor can be converted to a dispatcher with the asCoroutineDispatcher extension function.

## suspend

코루틴 안에서 delay(), yield() 는 일시 중단(suspending) 함수라고 불린다. 코루틴이 아닌 일반 함수 속에서 일시 중단 함수를 사용하게 되면 __Suspend function 'yield' should be called only from a coroutine or another suspend function__ 이라는 오류가 표시된다. 즉, 일시 중단 함수를 코루틴이나 일시 중단 함수가 아닌 함수에서 호출하는 것은 컴파일러 수준에서 금지된다.

### Continuation passing style

일시 중단 함수는 어떻게 만들어질까? 일시 중단 함수 안에서 yield() 를 해야 하는 경우 어떤 동작이 필요할까?

- 코루틴에 진입할 때와 코루틴에서 나갈 때 __코루틴이 실행 중이던 상태를 저장하고 복구하는 등의 작업__ 을 할 수 있어야 한다.
- 현재 실행 중이던 위치를 저장하고 다시 코루틴이 재개될 때 해당 위치부터 실행을 재개할 수 있어야 한다.
- 다음에 어떤 코루틴을 실행할지 결정한다.

마지막 동작은 코루틴 컨텍스트에 있는 디스패처에 의해 수행된다. 일시 중단 함수를 컴파일하는 컴파일러는 앞의 두 가지 작업을 할 수 있는 코드를 생성해 내야 한다. 이때  코틀린은 __CPS(Continuation passing style) 변환과 상태 기계(state machine)__ 를 활용해 코드를 생성해낸다.

CPS 변환은 프로그램의 실행 중 특정 시점 이후에 진행해야 하는 내용을 별도의 함수로 뽑고(이런 함수를 `Continuation` 이라 함), 그 함수에게 현재 시점까지 실행한 결과를 넘겨서 처리하게 만드는 소스코드 변환 기술이다.

CPS 를 사용하는 경우 프로그램이 다음에 해야 할 일이 항상 컨티뉴에이션이라는 함수 형태로 전달된다.

```kotlin
suspend fun example(v: Int): Int {
    return v*2
}
```

코틀린 컴파일러는 이 함수를 컴파일하면서 뒤에 Continuation 을 인자로 만들어 붙여준다.

```kotlin
public static final Object example(int v, @NotNull Continuation var1)
```

그리고 이 함수를 호출할 때는 함수 호출이 끝난 후 수행해야 할 작업을 var1 에 Continuation 으로 전달하고, 함수 내부에서는 필요한 모든 일을 수행한 다음에 결과를 var1 에 넘기는 코드를 추가한다. (이 예제에서는 v*2 를 인자로 Continuation 을 호출하는 코드가 들어간다.)

## Kotlin Coroutines with async libraries

> [[Kotlin Coroutines 톺아보기 - 당근마켓 로컬 커머스팀](https://www.youtube.com/watch?v=eJF60hcz3EU&list=LL&index=1&t=1s)]

### 비동기에 대한 고민

- __동기 프로그래밍과 다르다__
  - 한번에 이해하기 힘들다
  - 추적이 어렵다
  - 에러 핸들링이 어렵다
- __다양한 비동기 라이브러리__
  - Spring Reactor
  - CompletableFuture
  - Hibernate React MUTINY
  - 어떻게 혼용해서 써야할까?
  - 어떤 결과 타입을 반환해야 할까?
  - 또 다른 비동기 라이브러리가 추가되면?
- __Coroutine 이 해결사?__
  - 우수한 가독성
  - 에러 핸들링
  - 동시성 처리
  - Flow
  - Channel

Coroutine 의 가장 큰 장점은 비동기 매커니즘을 언어 레벨에서 지원하다는 점이다.

주문 생성에 관한 동기와 비동기 코드를 보자.

- __주문 생성 과정__
  - 구매자 조회
  - 주소 조회 및 유효성 체크
  - 상품 목록 조회
  - 스토어 목록 조회
  - 주문 생성

### sync


```kotlin
fun execute(inputValues: InputValues): Order {
    val (userId, productsIds) = inputValues
    
    // 1. 구매자 조회
    val buyer = userRepository.findUserByIdSync(userId)
    
    // 2. 주소 조회 및 유효성 체크
    val address = addressRepotiroy.findAddressByUserSync(buyer).last()
    
    // 3. 상품들 조회
    val products = productRepository.findAllProductsByIdsSync(productIds)
    check(products.isNotEmpty())
    
    // 4. 스토어 조회
    val stores = storeRepository.findStoresByProductsSync(products)
    check(stores.isNotEmpty())
    
    // 5. 주문 생성
    val order = orderRepository.createOrderSync(buyer, products, stores, address)
    
    return order
}
```

### async - RxJava3 Maybe

- Maybe: 결과가 없거나 혹은 1개의 결과 또는 에러를 반환하는 타입

```kotlin
import io.reactivex.rxjava3.core.Maybe

class UserRxRepository : UserRepositoryBase(), UserAsyncRepository {
    override fun findUserByIdAsMaybe(userId: String): Maybe<User> {
        val user = prepareUser(userId)
        return Maybe.just(user)
            .delay(TIME_DELAY_MS, TimeUnit.MILLISECONDS)
    }
}
```

### async - JDK9 Flow

- 주소 조회를 JDK9 Flow 로 구현한 코드
- JDK9 Flow: item 을 publish 하고 complete 이벤트로 flow 종료

```kotlin
import java.util.concurrent.Flow

class AddressReactiveRepository : AddressRepositoryBase(), AddressAsyncRepository {
    override fun findAddressByUserAsPublisher(user: User): Flow.Publisher<Address> {
        val addressIterator = prepareAddresses().iterator()

        return Flow.Publisher<Address> { subscriber ->
            subscriber.onSubscribe(object: Flow.Subscription {
                override fun request(n: Long) {
                    Thread.sleep(TIME_DELAY_MS)
                    var cnt = n
                    while (cnt-- > 0) {
                        if (addressIterator.hasNext()) {
                            subscriber.onNext(addressIterator.next())
                        } else {
                            subscriber.onComplete()
                            break
                        }
                    }
                }

                override fun cancel() {
                    // do nothing
                }
            })
        }
    }
}
```

### async - reactor Flux 

- 상품 조회를 reactor Flux 로 구현한 코드
- o .. n, Error

```kotlin
import reactor.core.publisher.Flux

class ProductReactorRepository : ProductRepositoryBase(), ProductAsyncRepository {
    override fun findAllProductsByIdsAsFlux(productIds: List<String>): Flux<Product> {
        val products = productIds.map { prepareProduct(it) }
        return Flux.fromIterable(products)
            .delayElements(Duration.ofMillis(TIME_DELAY_MS))
    }
}
```

### async - mutiny Multi 

- 스토어 조회를 mutiny Multi 로 구현한 코드
- 0 .. n, Error

```kotlin
import io.smallrye.mutiny.Multi

class StoreMutinyRepository : StoreRepositoryBase(), StoreAsyncRepository {
    override fun findStoresByProductsAsMulti(products: List<Product>): Multi<Store> {
        return Multi.createFrom().iterable(
            products.map { prepareStore(it) }
        )
    }
}
```

### async - JDK8 CompletableFuture

- 주문 생성은 JDK8 의 CompletableFuture 사용
- complete 되는 시점에 결과 반환

```kotlin
import java.util.concurrent.CompletableFuture

class OrderFutureRepository : OrderAsyncRepository {
    override fun createOrderAsFuture(
        buyer: User,
        products: List<Product>,
        stores: List<Store>,
        address: Address,
    ): CompletableFuture<Order> {
        val orderItems = products.zip(stores).map { (product, store) ->
            OrderItem(product, store)
        }

        val createdOrder = Order(
            buyer = buyer,
            items = orderItems,
            address = address,
        )

        val delayed = CompletableFuture.delayedExecutor(TIME_DELAY_MS, TimeUnit.MILLISECONDS)
        return CompletableFuture.supplyAsync({ createdOrder }, delayed)
    }
}
```

### subscribe hell 

- 위 코드들을 다모아서 처리하는 경우 아래와 같은 모양의 코드가 작성된다.
- subscribe 는 결과를 얻은 시점에 주어진 subscriber(consumer)를 실행하는 일종의 callback
- 반환값들이 아래에서 계속 필요해서 subscribe 가 중첩

```kotlin
fun execute(inputValues: InputValues): Mono<Order> {
    val (userId, productIds) = inputValues

    return Mono.create { emitter ->
        userRepository.findUserByIdAsMaybe(userId)
            .subscribe { buyer ->
                addressRepository.findAddressByUserAsPublisher(buyer)
                    .subscribe(LastItemSubscriber { address ->
                        checkValidRegion(address)
                        productRepository.findAllProductsByIdsAsFlux(productIds)
                            .collectList()
                            .subscribe { products ->
                                check(products.isNotEmpty())
                                storeRepository.findStoresByProductsAsMulti(products)
                                    .collect().asList()
                                    .subscribe().with { stores ->
                                        check(stores.isNotEmpty())
                                        orderRepository.createOrderAsFuture(
                                            buyer, products, stores, address
                                        ).whenComplete { order, _ ->
                                            emitter.success(order)
                                        }
                                    }
                            }
                    })
            }
    }
}
```

### flatMap hell

- 각각의 비동기 함수를 Reactor 로 변경
- RxJava3Adapter
- JdkFlowAdapter
- Flux.collectList
- Flux.form
- Mono.fromFuture

```kotlin
fun execute(inputValues: InputValues): Mono<Order> {
    val (userId, productIds) = inputValues

    return RxJava3Adapter.maybeToMono(userRepository.findUserByIdAsMaybe(userId))
        .flatMap { buyer ->
            JdkFlowAdapter.flowPublisherToFlux(
                addressRepository.findAddressByUserAsPublisher(buyer))
                .last()
                .flatMap { address ->
                    checkValidRegion(address)
                    productRepository.findAllProductsByIdsAsFlux(productIds)
                        .collectList()
                        .flatMap { products ->
                            check(products.isNotEmpty())
                            Flux.from(storeRepository.findStoresByProductsAsMulti(products))
                                .collectList()
                                .flatMap { stores ->
                                    check(stores.isNotEmpty())
                                    Mono.fromFuture(
                                        orderRepository.createOrderAsFuture(
                                            buyer, products, stores, address
                                        )
                                    )
                                }
                        }
                }
        }
}
```

### Coroutine 적용

- Mayebe`<T>`.awiatSingle
- Publisher`<T>`.awaitList
- Flow`<T>`.toList
- CompletableFuture`<T>`.await

위 함수들은 suspend 내에서 동작할 수 있도록 하는 Bridge 역할을 하는 함수이다.

```kotlin
suspend fun execute(inputValues: InputValues): Order {
    val (userId, productIds) = inputValues

    // 1. 구매자 조회
    val buyer = userRepository.findUserByIdAsMaybe(userId).awaitSingle()

    // 2. 주소 조회 및 유효성 체크
    val addressDeferred = CoroutineScope(Dispatchers.IO).async {
        addressRepository.findAddressByUserAsPublisher(buyer)
            .awaitLast()
    }

    // 3. 상품들 조회
    val products = productRepository.findAllProductsByIdsAsFlux(productIds).asFlow().toList()
    check(products.isNotEmpty())

    // 4. 스토어 조회
    val storesDeferred = CoroutineScope(Dispatchers.IO).async {
        storeRepository.findStoresByProductsAsMulti(products).asFlow().toList()
    }

    val address = addressDeferred.await()
    val stores = storesDeferred.await()

    checkValidRegion(address)
    check(stores.isNotEmpty())

    // 5. 주문 생성
    val order = orderRepository.createOrderAsFuture(buyer, products, stores, address).await()

    return order
}
```

동기 코드랑 비교해봤을때 큰 차이가 없다는 것이 장점이다.

### Coroutine 실행

- runBlocking 은 동기 코드에서 coroutine 을 실행할 수 있게 bridge 역할을 함

```kotlin
@Test
fun `should return a createdOrder in coroutine`() = runBlocking {
    // given
    val userId = "user1"
    val productIds = listOf("product1", "product2", "product3")

    // when
    val watch = StopWatch().also { it.start() }

    val inputValues = CreateOrderCoroutineUseCase.InputValues(userId, productIds)
    val createdOrder = createOrderUseCase.execute(inputValues)

    watch.stop()
    println("Time Elapsed: ${watch.time}ms")

    // then
    println(createdOrder)
}
```

## Coroutine 톺아보기

- __Kotlin Compiler__
  - Finite State Machine(FSM) 기반의 재귀함수로 변환
- Kotlin Compiler 가 suspend 가 붙은 함수에 추가적인 코드를 추가
  - Continuation 인자를 타겟 함수에 추가하고 Continuation 구현체를 생성
  - 타겟 함수 내의 모든 suspend 함수에 생성한 continuation 객체를 패스
  - 코드를 분리해서 switch case 안에 넣고 label 을 이용해서 state 를 변경

### FSM 기반의 재귀함수

![](/resource/wiki/kotlin-coroutines/fms.png)

- execute 함수가 실행되면 재귀 호출을 이용해서 스스로 execute 함수를 실행하면서 state 를 변경
- state 가 최종에 도달하면 값을 caller 에 반환

### FSM 기반의 동기 코드

- SharedData 를 통해서 여러가지 context 를 저장
- label 은 state machine 의 현재 state 값
- 이전 state 에서 찾은 값들을 buyer, address, products, stores, order 에 저장
- resumeWith 으로 재귀 호출을 하고 결과를 result 에 저장
- 인자의 sharedData 가 null 이라면 생성하고, 아니면 있는 sharedData 를 사용

```kotlin
class CreateOrderSyncStateMachineUseCase(
    private val userRepository: UserSyncRepository,
    private val addressRepository: AddressSyncRepository,
    private val productRepository: ProductSyncRepository,
    private val storeRepository: StoreSyncRepository,
    private val orderRepository: OrderSyncRepository,
) : CreateOrderUseCaseBase() {
    data class InputValues(
        val userId: String,
        val productIds: List<String>,
    )

    class SharedData {
        var label: Int = 0
        lateinit var result: Any
        lateinit var buyer: User
        lateinit var address: Address
        lateinit var products: List<Product>
        lateinit var stores: List<Store>
        lateinit var order: Order
        lateinit var resumeWith: (result: Any) -> Order
    }

    fun execute(
        inputValues: InputValues,
        sharedData: SharedData? = null,
    ): Order {
        val (userId, productIds) = inputValues

        val that = this
        val shared = sharedData ?: SharedData().apply {
            this.resumeWith = fun (result: Any): Order {
                this.result = result
                return that.execute(inputValues, this)
            }
        }

        return when (shared.label) {
            0 -> {
                shared.label = 1
                userRepository.findUserByIdSync(userId)
                    .let { user ->
                        shared.resumeWith(user)
                    }
            }
            1 -> {
                shared.label = 2
                shared.buyer = shared.result as User
                addressRepository.findAddressByUserSync(shared.buyer).last()
                    .let { address ->
                        shared.resumeWith(address)
                    }
            }
            2 -> {
                shared.label = 3
                shared.address = shared.result as Address
                checkValidRegion(shared.address)
                productRepository.findAllProductsByIdsSync(productIds)
                    .let { products ->
                        shared.resumeWith(products)
                    }
            }
            3 -> {
                shared.label = 4
                shared.products = shared.result as List<Product>
                check(shared.products.isNotEmpty())
                storeRepository.findStoresByProductsSync(shared.products)
                    .let { stores ->
                        shared.resumeWith(stores)
                    }
            }
            4 -> {
                shared.label = 5
                shared.stores = shared.result as List<Store>
                check(shared.stores.isNotEmpty())
                orderRepository.createOrderSync(
                    shared.buyer, shared.products, shared.stores, shared.address
                ).let { order ->
                    shared.resumeWith(order)
                }
            }
            5 -> {
                // 마지막에서는 recursive call 을 하지 않고 마지막 값을 반환
                shared.order = shared.result as Order
                shared.order
            }
            else -> throw IllegalAccessException()
        }
    }
}
```

### FSM 기반의 비동기 코드

- SharedDataContinuation 을 통해서 여러가지 context 를 저장
- label 은 state machine 의 현재 state 값
- 이전 state 에서 찾은 값들을 buyer, address, products, stores, order 에 저장
- resumeWith 으로 재귀 호출을 하여 결과를 result 에 저장
- 인자로 sharedData 가 SharedDataContinuation 타입이 아니라면 생성

```kotlin
class CreateOrderAsyncStateMachine2UseCase(
    private val userRepository: UserAsyncRepository,
    private val addressRepository: AddressAsyncRepository,
    private val productRepository: ProductAsyncRepository,
    private val storeRepository: StoreAsyncRepository,
    private val orderRepository: OrderAsyncRepository,
) : CreateOrderUseCaseBase() {
    data class InputValues(
        val userId: String,
        val productIds: List<String>,
    )

    class SharedDataContinuation(
        val completion: Continuation<Any>,
    ) : Continuation<Any> {
        var label: Int = 0
        lateinit var result: Any
        lateinit var buyer: User
        lateinit var address: Address
        lateinit var products: List<Product>
        lateinit var stores: List<Store>
        lateinit var order: Order
        lateinit var resume: () -> Unit

        override val context: CoroutineContext = completion.context
        override fun resumeWith(result: Result<Any>) {
            this.result = result
            this.resume()
        }
    }

    fun execute(inputValues: InputValues, completion: Continuation<Any>) {
        val (userId, productIds) = inputValues

        val that = this
        val cont = completion as? SharedDataContinuation
            ?: SharedDataContinuation(completion).apply {
                resume = fun() {
                    // recursive self
                    that.execute(inputValues, this)
                }
            }

        when (cont.label) {
            0 -> {
                cont.label = 1
                userRepository.findUserByIdAsMaybe(userId)
                    .subscribe { user ->
                        cont.resumeWith(Result.success(user))
                    }
            }
            1 -> {
                cont.label = 2
                cont.buyer = (cont.result as Result<User>).getOrThrow()
                addressRepository.findAddressByUserAsPublisher(cont.buyer)
                    .subscribe(LastItemSubscriber { address ->
                        cont.resumeWith(Result.success(address))
                    })
            }
            2 -> {
                cont.label = 3
                cont.address = (cont.result as Result<Address>).getOrThrow()
                checkValidRegion(cont.address)
                productRepository.findAllProductsByIdsAsFlux(productIds)
                    .collectList()
                    .subscribe { products ->
                        cont.resumeWith(Result.success(products))
                    }
            }
            3 -> {
                cont.label = 4
                cont.products = (cont.result as Result<List<Product>>).getOrThrow()
                check(cont.products.isNotEmpty())
                storeRepository.findStoresByProductsAsMulti(cont.products)
                    .collect().asList()
                    .subscribe().with { stores ->
                        cont.resumeWith(Result.success(stores))
                    }
            }
            4 -> {
                cont.label = 5
                cont.stores = (cont.result as Result<List<Store>>).getOrThrow()
                check(cont.stores.isNotEmpty())
                orderRepository.createOrderAsFuture(
                    cont.buyer, cont.products, cont.stores, cont.address
                ).whenComplete { order, _ ->
                    cont.resumeWith(Result.success(order))
                }
            }
            5 -> {
                cont.order = (cont.result as Result<Order>).getOrThrow()
                cont.completion.resumeWith(Result.success(cont.order))
            }
            else -> throw IllegalAccessException()
        }
    }
}
```

#### FSM 기반의 비동기 코드 실행

- testContinuation 을 생성해서 execute 함수에 주입

```kotlin
import kotlin.coroutines.Continuation
import kotlin.coroutines.EmptyCoroutineContext

@ExtendWith(MockKExtension::class)
class CreateOrderAsyncStateMachine2UseCaseTests {
    @InjectMockKs
    private lateinit var createOrderUseCase: CreateOrderAsyncStateMachine2UseCase

    @SpyK
    private var spyUserRepository: UserRxRepository = UserRxRepository()

    @SpyK
    private var spyProductRepository: ProductReactorRepository = ProductReactorRepository()

    @SpyK
    private var spyStoreRepository: StoreMutinyRepository = StoreMutinyRepository()

    @SpyK
    private var spyOrderRepository: OrderFutureRepository = OrderFutureRepository()

    @SpyK
    private var spyAddressRepository: AddressReactiveRepository = AddressReactiveRepository()

    @Test
    fun `should return a createdOrder in async with state machine`() {
        // given
        val userId = "user1"
        val productIds = listOf("product1", "product2", "product3")

        // when
        val watch = StopWatch().also { it.start() }
        val lock = CountDownLatch(1)
        val testContinuation = object: Continuation<Any> {
            override val context = EmptyCoroutineContext
            override fun resumeWith(result: Result<Any>) {
                watch.stop()
                lock.countDown()

                println("Time Elapsed: ${watch.time}ms")
                println(result.getOrThrow())
            }
        }

        val inputValues = CreateOrderAsyncStateMachine2UseCase.InputValues(userId, productIds)

        createOrderUseCase.execute(inputValues, testContinuation)

        // then
        lock.await(3000, TimeUnit.MILLISECONDS)
    }
}
```

### FSM 기반의 Coroutines 

- 각각의 비동기 라이브러리에서 사용하는 객체에 대한 extension function 생성
- Flux.toList, Multi.toList, CompletionStage.awaitSingle 은 실제와 다름

```kotlin
import com.karrot.example.repository.shipment.LastItemSubscriber
import io.reactivex.rxjava3.core.Maybe
import io.smallrye.mutiny.Multi
import reactor.core.publisher.Flux
import java.util.concurrent.CompletionStage
import java.util.concurrent.Flow
import kotlin.coroutines.Continuation

fun <T: Any> Maybe<T>.awaitSingle(cont: Continuation<Any>) {
    this.subscribe { user ->
        cont.resumeWith(Result.success(user))
    }
}

fun <T: Any> Flow.Publisher<T>.awaitLast(cont: Continuation<Any>) {
    this.subscribe(LastItemSubscriber { address ->
        cont.resumeWith(Result.success(address))
    })
}

fun <T: Any> Flux<T>.toList(cont: Continuation<Any>) {
    this.collectList()
        .subscribe { products ->
            cont.resumeWith(Result.success(products))
        }
}

fun <T: Any> Multi<T>.toList(cont: Continuation<Any>) {
    this.collect()
        .asList()
        .subscribeAsCompletionStage()
        .whenComplete { stores, _ ->
            cont.resumeWith(Result.success(stores))
        }
}

fun <T: Any> CompletionStage<T>.awaitSingle(cont: Continuation<Any>) {
    this.whenComplete { order, _ ->
        cont.resumeWith(Result.success(order))
    }
}
```

대체한 코드는 아래와 같다.

```kotlin
class SharedDataContinuation(
      private val continuation: Continuation<Any>,
  ) : Continuation<Any> {
      var label: Int = 0
      lateinit var result: Any
      lateinit var buyer: User
      lateinit var address: Address
      lateinit var products: List<Product>
      lateinit var stores: List<Store>
      lateinit var order: Order
      lateinit var resume: () -> Unit

      override val context: CoroutineContext = continuation.context

      override fun resumeWith(result: Result<Any>) {
          this.result = result
          this.resume()
      }

      fun complete(result: Result<Any>) {
          this.continuation.resumeWith(result)
      }
  }

  fun execute(inputValues: InputValues, continuation: Continuation<Any>) {
      val (userId, productIds) = inputValues

      val that = this
      val cont = continuation as? SharedDataContinuation
          ?: SharedDataContinuation(continuation).apply {
              resume = fun() {
                  that.execute(inputValues, this)
              }
          }

      when (cont.label) {
          0 -> {
              cont.label = 1
              userRepository.findUserByIdAsMaybe(userId).awaitSingle(cont)
          }
          1 -> {
              cont.label = 2
              cont.buyer = (cont.result as Result<User>).getOrThrow()
              addressRepository.findAddressByUserAsPublisher(cont.buyer).awaitLast(cont)
          }
          2 -> {
              cont.label = 3
              cont.address = (cont.result as Result<Address>).getOrThrow()
              checkValidRegion(cont.address)
              productRepository.findAllProductsByIdsAsFlux(productIds).toList(cont)
          }
          3 -> {
              cont.label = 4
              cont.products = (cont.result as Result<List<Product>>).getOrThrow()
              check(cont.products.isNotEmpty())
              storeRepository.findStoresByProductsAsMulti(cont.products).toList(cont)
          }
          4 -> {
              cont.label = 5
              cont.stores = (cont.result as Result<List<Store>>).getOrThrow()
              check(cont.stores.isNotEmpty())
              orderRepository.createOrderAsFuture(
                  cont.buyer, cont.products, cont.stores, cont.address
              ).awaitSingle(cont)
          }
          5 -> {
              cont.order = (cont.result as Result<Order>).getOrThrow()
              cont.complete(Result.success(cont.order))
          }
          else -> throw IllegalAccessException()
      }
  }
```

Coroutines 최종 코드는 아래와 같다.

```kotlin
suspend fun execute(inputValues: InputValues): Order {
    val (userId, productIds) = inputValues

    // 1. 구매자 조회
    val buyer = userRepository.findUserByIdAsMaybe(userId).awaitSingle()

    // 2. 주소 조회 및 유효성 체크
    val address = addressRepository.findAddressByUserAsPublisher(buyer)
        .awaitLast()
    checkValidRegion(address)

    // 3. 상품들 조회
    val products = productRepository.findAllProductsByIdsAsFlux(productIds).asFlow().toList()
    check(products.isNotEmpty())

    // 4. 스토어 조회
    val stores = storeRepository.findStoresByProductsAsMulti(products).asFlow().toList()
    check(stores.isNotEmpty())

    // 5. 주문 생성
    val order = orderRepository.createOrderAsFuture(buyer, products, stores, address).await()

    return order
}
```

### Async 를 사용한 동시성 처리

- CoroutineDispatcher
- 여러 Thread 를 오고가며 로직 처리가능
- Dispatchers.IO 를 사용하면 완전히 별개의 스레드에서 동작함

```kotlin
suspend fun execute(inputValues: InputValues): Order {
    val (userId, productIds) = inputValues

    // 1. 구매자 조회
    val buyer = userRepository.findUserByIdAsMaybe(userId).awaitSingle()

    // 2. 주소 조회 및 유효성 체크
    val addressDeferred = CoroutineScope(Dispatchers.IO).async {
        addressRepository.findAddressByUserAsPublisher(buyer)
            .awaitLast()
    }

    // 3. 상품들 조회
    val products = productRepository.findAllProductsByIdsAsFlux(productIds).asFlow().toList()
    check(products.isNotEmpty())

    // 4. 스토어 조회
    val storesDeferred = CoroutineScope(Dispatchers.IO).async {
        storeRepository.findStoresByProductsAsMulti(products).asFlow().toList()
    }

    val address = addressDeferred.await()
    val stores = storesDeferred.await()

    checkValidRegion(address)
    check(stores.isNotEmpty())

    // 5. 주문 생성
    val order = orderRepository.createOrderAsFuture(buyer, products, stores, address).await()

    return order
}
```

### try-catch 를 이용한 에러 핸들링

- try/catch 를 통해서 일관성 있게 에러 핸들링 가능

```kotlin
// 1. 구매자 조회
val buyer = try {
    userRepository.findUserByIdAsMaybe(userId).awaitSingle()
} catch (e: Exception) {
    throw NoSuchElementException("no such user")
}
```

## Links

- [Kotlin Coroutines - KEEP](https://github.com/Kotlin/KEEP/blob/master/proposals/coroutines.md)
- [Kotlin Coroutine series](https://github.com/tmdgusya/kotlin-coroutine-series)
- [Kotlin CoroutineKR](https://github.com/hikaMaeng/kotlinCoroutineKR)
- [kotlinx.coroutines](https://kotlin.github.io/kotlinx.coroutines/kotlinx-coroutines-core/index.html)
- [coroutines - wikipedia](https://en.wikipedia.org/wiki/Coroutine)
- [kotlin coroutines - taehwandev](https://speakerdeck.com/taehwandev/kotlin-coroutines)

## References

- 코틀린 완벽 가이드 / Aleksei Sedunov 저 / 길벗
- Kotlin In Action / Dmitry Jemerov, Svetlana Isakova 공저 / 에이콘