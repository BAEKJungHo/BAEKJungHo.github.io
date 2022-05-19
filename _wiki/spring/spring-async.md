---
layout  : wiki
title   : Async Annotation
summary : 
date    : 2022-05-17 20:28:32 +0900
updated : 2022-05-17 21:15:24 +0900
tag     : spring
toc     : true
comment : true
public  : true
parent  : [[/spring]]
latex   : true
---
* TOC
{:toc}

## @Async

- @Async 는 Spring 에서 제공하는 Thread Pool 을 활용하는 비동기 메서드 지원 Annotation 이다.
- 기본 전략은 비동기 작업마다 스레드를 생성하는 SimpleAsyncTaskExecutor 를 사용한다.
- 스레드 관리 전략을 ThreadPoolTaskExecutor 로 바꿔서 스레드풀을 사용하게끔 할 수 있다.

## How Does @Async Work?

> When you put an Async annotation on a method underlying it, it creates a proxy of that object where Async is defined (JDK Proxy/CGlib) based on the proxyTargetClass property. Then, Spring tries to find a thread pool associated with the context to submit this method's logic as a separate path of execution. To be exact, it searches a unique TaskExecutor bean or a bean named as taskExecutor. If it is not found, then use the default SimpleAsyncTaskExecutor.
>
> Now, as it creates a proxy and submits the job to the TaskExecutor thread pool, it has a few limitations that have to know. Otherwise, you will scratch your head as to why your Async did not work or create a new thread! Let's take a look.

## Limitations of @Async

- private method 는 사용 불가, public method 만 사용 가능
- self-invocation(자가 호출) 불가, 즉 inner method 는 사용 불가
- QueueCapacity 초과 요청에 대한 비동기 method 호출시 방어 코드 작성
  - 최대 수용 가능한 Thread Pool 수와 QueueCapacity 까지 초과된 요청이 들어오면 TaskRejectedException 에러가 발생한다.
  - 따라서, TaskRejectedException 에러에 대한 추가적인 핸들링이 필요하다.
  
@Async 의 동작은 AOP 가 적용되어 Spring Context 에서 등록된 Bean Object 의 method 가 호출 될 시에, Spring 이 확인할 수 있고 @Async 가 적용된 method 의 경우 Spring 이 method 를 가로채 다른 Thread 에서 실행 시켜주는 동작 방식이다. 이 때문에 Spring 이 해당 @Async method 를 가로챈 후, 다른 Class 에서 호출이 가능해야 하므로, private method 는 사용할 수 없는 것이다.

또한 Spring Context 에 등록된 Bean 의 method 의 호출이어야 Proxy 적용이 가능하므로, inner method 의 호출은 Proxy 영향을 받지 않기에 self-invocation 이 불가능하다.

> AsyncExecutionAspectSupport 클래스의 doSubmit() 메서드에 의해서 @Async 어노테이션을 달면 해당 메서드가 비동기로 동작할 수 있는 것이다.

### Async Annotation Uses in a Class

```java
@Component
public class AsyncMailTrigger {

  @Async
  public void senMail(Map<String,String> properties) {
      System.out.println("Trigger mail in a New Thread :: "  + Thread.currentThread().getName());
      properties.forEach((K,V)->System.out.println("Key::" + K + " Value ::" + V));
  }
}
```

### Caller Class

```java
@Component
public class AsyncCaller {

  @Autowired
  AsyncMailTrigger asyncMailTriggerObject;
  
  public void rightWayToCall() {
    System.out.println("Calling From rightWayToCall Thread " + Thread.currentThread().getName());
    asyncMailTriggerObject.senMail(populateMap());
  }
  
  public void wrongWayToCall() {
    System.out.println("Calling From wrongWayToCall Thread " + Thread.currentThread().getName());
    AsyncMailTrigger asyncMailTriggerObject = new AsyncMailTrigger();
    asyncMailTriggerObject.senMail(populateMap());
  }
  
  private Map<String,String> populateMap(){
    Map<String,String> mailMap= new HashMap<String, String>();
    mailMap.put("body", "A Ask2Shamik Article");
    return mailMap;
  }
}
```

### Outcome

```
Calling From rightWayToCall Thread main
2019-03-09 14:08:28.893  INFO 8468 --- [           main] o.s.s.concurrent.ThreadPoolTaskExecutor  : Initializing ExecutorService 'applicationTaskExecutor'
Trigger mail in a New Thread :: task-1
Key::body Value ::A Ask2Shamik Article
++++++++++++++++
Calling From wrongWayToCall Thread main
Trigger mail in a New Thread :: main
Key::body Value ::A Ask2Shamik Article
```

## 자바에서의 비동기 코드

```java
public class Async {

    static ExecutorService executorService = Executors.newFixedThreadPool(5);

    public void asyncMethod(final String message) throws Exception {
        executorService.submit(new Runnable() {
            @Override
            public void run() {
                // do something
            }            
        });
    }
}
```

비동기 관련 코드를 작성할 때마다 Runnable 을 구현하고 run 메서드를 오버라이딩 해줘야 하는 불편함이 있다. 또한 비동기 코드를 작성하기 위해서 많은 노력을 들여야한다.

## 어노테이션 기반 비동기 코드

```kotlin
@Async("asyncThreadPoolTaskExecutor")
fun asyncMethod(message: String) {
    // do something
}
```

@Async 어노테이션을 사용하면 비동기 관련 코드를 작성하기 위한 불편함이 사라진다.

## @Async 를 사용하기 위한 설정

```kotlin
@EnableAsync
@SpringBootApplication
class AsyncServiceApplication

fun main(args: Array<String>) {
	runApplication<AsyncServiceApplication>(*args)
}
```

이 경우에는 `SimpleAsyncTaskExecutor` 를 사용하게된다.

## SimpleAsyncTaskExecutor

> TaskExecutor implementation that fires up a new Thread for each task, executing it asynchronously.
Supports limiting concurrent threads through the "concurrencyLimit" bean property. By default, the number of concurrent threads is unlimited.
>
> NOTE: __This implementation does not reuse threads!__ Consider a thread-pooling TaskExecutor implementation instead, in particular for executing a large number of short-lived tasks. - Spring Docs

SimpleAsyncTaskExecutor 는 각 작업에 대해서 새로운 스레드를 생성하여 TaskExecutor 를 구현하여 비동기적으로 실행시킨다.

SimpleAsyncTaskExecutor 는 __스레드를 재사용하지 않기 때문에__ thread-pooling TaskExecutor 구현을 고려하라고 제시하고 있다.

## ThreadPoolExecutor

- [java.util.concurrent.ThreadPoolExecutor](https://docs.oracle.com/en/java/javase/11/docs/api/java.base/java/util/concurrent/ThreadPoolExecutor.html)
- Executors 와 Spring Framework 의 ThreadPoolTaskExecutor 가 사용하는 쓰레드 풀 구현체
- 기본적으로 corePoolSize 만큼의 쓰레드를 만들고, corePool 이 꽉차면 workQueue(queueCapacity 만큼의 크기로 된 큐)에 넣음
- workQueue 조차도 꽉차면 그제서야 maxPoolSize 까지 쓰레드를 생성해가면서 작업 함
- 따라서 corePoolSize 가 0이 아니고 일정 수준 이상되고 queueCapacity 가 매우 크다면(보통 Integer.MAX_VALUE) 별다른 문제가 없는한 쓰레드 풀의 크기는 corePoolSize 를 넘길 수 없음

## ThreadPoolTaskExecutor

- SpringFramework 에서는 ThreadPoolTaskExecutor 를 사용
  - Spring 이 자동으로 bean lifecycle 을 관리
  - 따라서 애플리케이션 종료시 shutdown 을 해줌

### Config

> 기존에 Application 클래스에서 적용한 @EnableAsync 는 제거해야 한다.

```java
@Configuration
@EnableAsync
public class SpringAsyncConfig {

    @Bean(name = "threadPoolTaskExecutor")
    public Executor threadPoolTaskExecutor() {
        ThreadPoolTaskExecutor taskExecutor = new ThreadPoolTaskExecutor();
        taskExecutor.setCorePoolSize(3);
        taskExecutor.setMaxPoolSize(30);
        taskExecutor.setQueueCapacity(10);
        taskExecutor.setThreadNamePrefix("Executor-");
        taskExecutor.initialize();
        return taskExecutor;
    }
}
```

스레드 관리 전략을 여러개 가져간다면 빈 이름을 지정해주면 된다.

AsyncConfigurerSupport 클래스를 상속 받아서 스레드 관리 전략을 설정할 수도 있다.

```java
@Configuration
@EnableAsync
public class AsyncConfig extends AsyncConfigurerSupport {
    
    @Override
    public Executor getAsyncExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(5);
        executor.setMaxPoolSize(30);
        executor.setQueueCapacity(50);
        executor.setThreadNamePrefix("ASYNC-");
        executor.initialize();
        return executor;
    }
}
```

### Options

- __corePoolSize__
  - 동시에 실행 시킬 스레드의 수
- __maxPoolSize__
  - 스레드 풀의 최대 사이즈: 최대로 생성되는 스레드 사이즈 
  - maxPoolSize 는 ThreadPoolTaskExecutor 가 대기열의 항목 수가 queueCapacity 를 초과하는 경우에만 새 스레드를 생성 한다는 점 에서 queueCapacity 에 의존한다.
- __setQueueCapacity__
  - 스레드 풀의 큐 사이즈 
  - corePoolSize 를 넘어서는 요청이 들어왔을 때, queue 에 task 가 쌓이게 되고, 최대로 maxPoolSize 만큼 쌓일 수 있다.

### Test

> 옵션을 어떻게 설정해야 하는지 도움을 주는 테스트 코드다.

```kotlin
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import org.junit.jupiter.params.ParameterizedTest
import org.junit.jupiter.params.provider.ValueSource
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor
import java.util.concurrent.CountDownLatch
import java.util.concurrent.ThreadLocalRandom

/**
 * @Async 사용을 위한 ThreadPoolTaskExecutor 설정 테스트
 * @property corePoolSize 동시에 실행 시킬 스레드의 수
 * @property maxPoolSize 스레드 풀의 최대 사이즈
 * @property setQueueCapacity 스레드 풀의 큐 사이즈
 */
internal class ThreadPoolTest {

    companion object {
        const val USER_REQUEST_COUNT = 100
    }

    @Test
    fun `사용자의 요청 개수가 queueCapacity 보다 작은 경우에는, corePoolSize 를 넘어서는 스레드를 생성하지 않는다`() {
        val taskExecutor = ThreadPoolTaskExecutor().apply {
            corePoolSize = 5
            maxPoolSize = 20
            setQueueCapacity(200)
            afterPropertiesSet()
        }

        val countDownLatch = CountDownLatch(USER_REQUEST_COUNT)
        startThreads(taskExecutor, countDownLatch, USER_REQUEST_COUNT)

        while (countDownLatch.count > 0) {
            `다섯 개의 스레드만 생성된다`(taskExecutor.poolSize)
        }
    }

    @ValueSource(ints = [80, 90, 100])
    @ParameterizedTest
    fun `사용자의 요청 개수가 queueCapacity 보다 큰 경우에는, 최대 maxPoolSize 만큼의 스레드를 생성한다`(queueCapacity: Int) {
        val maxPoolSize = 20
        val taskExecutor = ThreadPoolTaskExecutor().apply {
            corePoolSize = 5
            this.maxPoolSize = maxPoolSize
            setQueueCapacity(queueCapacity)
            afterPropertiesSet()
        }

        val countDownLatch = CountDownLatch(USER_REQUEST_COUNT)
        startThreads(taskExecutor, countDownLatch, USER_REQUEST_COUNT)

        while (countDownLatch.count > 0) {
            `최대 maxPoolSize 만큼의 스레드만 생성된다`(maxPoolSize, taskExecutor.poolSize)
        }
    }

    private fun `다섯 개의 스레드만 생성된다`(poolSize: Int) {
        assertEquals(5, poolSize)
    }

    private fun `최대 maxPoolSize 만큼의 스레드만 생성된다`(maxPoolSize:Int, taskExecutorPoolSize: Int) {
        Assertions.assertThat(maxPoolSize >= taskExecutorPoolSize)
    }

    private fun startThreads(taskExecutor: ThreadPoolTaskExecutor, countDownLatch: CountDownLatch, numThreads: Int) {
        for (i in 0 until numThreads) {
            taskExecutor.execute {
                try {
                    Thread.sleep(100L * ThreadLocalRandom.current().nextLong(1, 10))
                    println(Thread.currentThread().name)
                    countDownLatch.countDown()
                } catch (e: InterruptedException) {
                    Thread.currentThread().interrupt()
                }
            }
        }
    }
}
```

## ThreadPoolTaskExecutor 를 CachedThreadPool 처럼 사용하는 방법

- corePoolSize : 0
- maxPoolSize : Integer.MAX_VALUE
- queueCapacity : 0

> cachedThreadPool 은 항상 필요한 만큼만 쓰레드를 생성하고, 불필요해지면 자동으로 쓰레드를 반환하므로 최적 상태가 된다. 지연이 발생할 가능성이 있다면 cachedThreadPool 의 경우 Java 프로세스가 수만개의 쓰레드를 생성하다가 죽을 수 있다.

## ThreadPoolTaskExecutor 를 FixedThreadPool 처럼 사용하는 방법

- corePoolSize : 원하는 고정 크기 쓰레드 갯수
- maxPoolSize : corePoolSize 와 동일하게
- queueCapacity : Integer.MAX_VALUE
- 위와 같이 설정하면 실제로는 corePoolSize 만큼만 쓰레드가 생성된다
- 만약 쓰레드가 적체되어 corePoolSize 이상의 작업이 들어오면 workQueue 에 queueCapacity 만큼 들어가고, corePool 에 남는 자리가 생기면 workQueue 에 있던것이 들어간다
- queueCapacity=Integer.MAX_VALUE 일 경우에는 여기까지 가는 것은 불가능하다고 보는게 맞다. 만약 queueCapacity 를 넘어간다면 이미 그 자체로 커다란 문제가 발생한 것이다

> 쓰레드 작업에 적체가 발생할 가능성이 큰 경우에는 fixedThreadPool 을 사용하는게 낫다. 단점은, 일단 corePoolSize 만큼의 쓰레드가 생성되면 불필요하게 항상 고정 크기 쓰레드가 생성된 상태로 유지된다. 실제로 사용되지 않아도 유지된다. 쓰레드 생성요청이 매우 많이 들어와도 애플리케이션이 죽지는 않지만 해당 쓰레드풀을 사용하는 작업이 매우 느려지기만 한다.

## Links

- [Effective Advice on Spring Async](https://dzone.com/articles/effective-advice-on-spring-async-part-1)
- [Spring Async](https://www.baeldung.com/spring-async)
- [Java: What is the limit to the number of threads you can create](http://blog.vanillajava.blog/2011/07/java-what-is-limit-to-number-of-threads.html)
- [Java Spring Thread-pool Test](https://github.com/kwon37xi/java-spring-thread-pool-test)
- [SimpleAsyncTaskExecutor Spring Docs](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/core/task/SimpleAsyncTaskExecutor.html)
- [corePoolSize vs maxPoolSize](https://www.baeldung.com/java-threadpooltaskexecutor-core-vs-max-poolsize)