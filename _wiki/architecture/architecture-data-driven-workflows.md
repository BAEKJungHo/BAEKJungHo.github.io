---
layout  : wiki
title   : Data Driven Workflows
summary : Orchestrating Kafka Events into Modular Tasks
date    : 2024-12-12 15:02:32 +0900
updated : 2024-12-12 18:12:24 +0900
tag     : architecture massivetraffics driven data kafka
toc     : true
comment : true
public  : true
parent  : [[/architecture]]
latex   : true
---
* TOC
{:toc}

## Data Driven Development

___[우아한 데이터 허브. 일 200억 건 데이터 안전하게 처리하는 대용량 시스템 구축하기](https://www.youtube.com/watch?v=AtmI56DGhi4&list=LL&index=1)___ 에서 ___Data Driven Development___ 를 소개하고 있다.

처음에는 ___[Layered Architecture](https://klarciel.net/wiki/architecture/architecture-layered/)___ 를 사용했다고 하나, 이는 아래와 같은 단점을 가지고 있어서 다른 아키텍처로의 전환이 필요했다고 한다.

- 데이터 흐름을 유연하게 변경하는 것의 어려움
- 트랜잭션 단위를 유연하게 구성하는 것의 어려움
- 특정 동작(서비스 로직)만 별도로 수행하기 어려움

따라서, 데이터를 기준으로 어떠한 방식으로 저장, 가공, 처리 되어야 하는 지를 중심으로 개발(데이터 중심으로 개발) 하는 ___[Data Driven Development](https://en.wikipedia.org/wiki/Data-driven_programming)___ 을 채택했다고 한다.

Data-driven programming is similar to ___event-driven___ programming.

일반적으로 Event 중심, Data 중심의 애플리케이션에서는 Data 를 받고 나면 원본(source) 데이터를 저장하는 역할을 먼저 한다.
그리고 그 이후에 부가적으로 수행되어야 하는 작업들이 존재한다.

독립적인 작업을 <mark><em><strong>Task</strong></em></mark> 로 구분한다.

```
MainTask
- SubTask A1 → SubTask A2 → SubTask A3-1,2,3
- SubTask B
- SubTask C
    - SubTask AC
```

각각의 SubTask 는 서로에게 영향을 주지 않고 독립적이다. 따라서 병렬로 실행할 수 있고, 각 Task 의 실패는 서로에게 영향을 주지 않는다.

```java
public interface Task<Input, Output> {
   /**
    * 독자적인 처리가 가능한 단위의 비지니스 로직
    * 독자적으로 수행 가능한 마이크로 트랜잭션
    */
   Output process(Input input);
}
```

그리고 다음과 같은 문제를 해결해야 한다.

- Task 를 어떻게 묶어서 처리할 것인가 ?
- Task 를 실패했을때 특정 범위의 Task 를 다시 실행할 수 있는가 ?

Task 는 <mark><em><strong>Flow</strong></em></mark> 를 가지고 있다.
이러한 Flow 를 처리하기 위한 방안으로 처음에는 xml, yml 등을 토대로 Graph 를 표현하려 했으나, 이는 예전 스프링의 xml 을 통한 빈 관리 방식과 유사하여
LinkedList 방식으로 구현했다고 한다.

```java
@Service
@RequiredArgsConstructor
public class BTask ... {
	private final CTask c;
	private final GTask g;
	
	@Override
	public R process (I i)
	
	@Override
	public List<Task> next() {
		return List.of(c,g);
  }
}
```

실제로 사용 중인 코드 일부를 간략화 한 것이라 한다.

```java
@Service
@RequireArgsConstructor
public class ProductMainTask implements Task<ProductMessage, ProductTaskResult> {

	private final ProductSubTask1 productSubTask1;
	private final ProductSubTask2 productSubTask2;
	
	private final ProductService productService;
	
	// 여기선 subtask1, subtask2 에 대한 어떠한 호출 코드도 존재하지 않음 -> 호출에 대한 결합도를 낮춤으로써
	// 독자적인 처리(+ 재처리)
	// subtask1, 2 에 대한 호출은 Framework 에 위임
	@Override
	public ProductTaskResult process(ProductMessage message) {
	   productService.save(message);
	   return new ProductTaskResult(...);
	}
	
	@Overrdie
	public List<Task> next() {
		return List.of(productSubTask1, productSubTask2);
  }
}
```

위 코드를 기반으로 나머지 코드를 대략적으로 추측해보자면 다음과 같다.

1. Kafka Event 를 통한 Consume 이 Trigger(Entry Point)가 될 것 이다.
2. 그리고 해당 Topic 에 맞는 MainTask 를 Bean 으로 가지고 있을 것이다.

```kotlin
@Component
class KafkaTaskListener {

    @Autowired
    private lateinit var taskExecutor: TaskExecutor

    @Autowired
    private lateinit var mainTaskRegistry: Map<String, MainTask<*, *>> // Topic 이름에 따라 MainTask 매핑

    private val executorService: ExecutorService = Executors.newCachedThreadPool()

    @KafkaListener(topics = ["topicA", "topicB", "topicC"])
    fun consume(event: KafkaEvent) {
        val topic = event.topic
        val message = event.message

        // MainTask 를 토픽 이름에 따라 가져옴
        val mainTask = mainTaskRegistry[topic] ?: throw IllegalArgumentException("No MainTask registered for topic: $topic")

        // TaskExecutor 를 통해 MainTask 실행
        executorService.submit {
            taskExecutor.execute(mainTask, message)
        }
    }
}

class TaskExecutor {

    private val executorService: ExecutorService = Executors.newCachedThreadPool()

    fun <I, R> execute(mainTask: MainTask<I, R>, input: I) {
        // MainTask 실행
        val result = mainTask.process(input)

        // SubTask 병렬 실행
        val subTasks = mainTask.next()
        subTasks.forEach { task ->
            executorService.submit {
                task.process(result)
            }
        }
    }
}
```

이러한 Task 기반의 데이터 중심 설계는 아래와 같은 장점이 존재한다.

- 작업 독립성: 각 작업이 독립적으로 실행되어야 함.
- 병렬성: 작업 간 의존성이 없으면 병렬 실행 가능.
- 실패 허용: 하나의 작업 실패가 전체 워크플로우에 치명적인 영향을 주지 않음.
- 확장성: 새로운 SubTask 추가나 제거가 메인 로직에 영향을 주지 않음.

하지만, 전체 비지니스 로직을 이해하는데 어려움이 있을 것 같은데 아마, 아래와 같은 방안들 중 일부를 선택하지 않았을까 생각한다.

- 전체 비지니스 로직을 나타내는 테스트 코드를 작성하여 문서화
- DAG (Directed Acyclic Graph), Task Dependency Graph 시각화
- Task Execution Logging
- 모놀리틱한 Task로 합치기 (적절한 수준에서 통합)

```java
class AggregateTaskA : Task<Input, Output> {
    override fun process(input: Input): Output {
        val resultA1 = SubTaskA1().process(input)
        val resultA2 = SubTaskA2().process(resultA1)
        return SubTaskA3().process(resultA2)
    }
}
```