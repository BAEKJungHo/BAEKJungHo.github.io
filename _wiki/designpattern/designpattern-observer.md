---
layout  : wiki
title   : OBSERVER
summary : 
date    : 2025-04-13 12:54:32 +0900
updated : 2025-04-13 13:15:24 +0900
tag     : designpattern reactive
toc     : true
comment : true
public  : true
parent  : [[/designpattern]]
latex   : true
---
* TOC
{:toc}

## OBSERVER

![](/resource/wiki/designpattern-observer/observer-meaning.png)

Also Known As ___Dependents___, ___[Publish-Subscribe](https://klarciel.net/wiki/architecture/architecture-pub-sub/)___

### Design Principle

![](/resource/wiki/designpattern-observer/observer-structure.png)

많은 객체들 사이에서 일대일 의존 관계가 정의되어 있을 때, 어느 한 객체의 상태가 변경되면 이 객체에 의존하고 있는 모든 객체는 자동으로 알림을 받는다.

- 서로 상호작용을 하는 객체 사이에서는 가능하면 느슨하게 결합하는 디자인을 사용해야 한다.
- 옵저버 패턴에서는 한 객체의 상태가 바뀌면 그 객체에 의존하는 다른 객체들한테 연락이 가고 자동으로 내용이 갱신되는 방식으로 __일대다(one-to-many)__ 의존성을 정의한다. __one 이 주제(subject) 이며, many 는 옵저버(observer)__ 이다.
- 어떤 이벤트가 발생했을 때 한 객체(주제(subject) 라 불리는)가 다른 객체 리스트(옵저버(observer) 라 불리는)에 자동으로 알림을 보내야 하는 상황에서 옵저버 디자인 패턴을 사용한다. GUI 애플리케이션에서 옵저버 패턴이 자주 등장한다. 버튼 GUI 컴포넌트에 옵저버를 설정할 수 있다. 그리고 사용자가 버튼을 클릭하면 옵저버에 알림이 전달되고 정해진 동작이 수행된다.
- 옵저버 패턴은 어떤 객체에 이벤트가 발생했을 때, 이 객체와 관련된 객체들(옵저버들)에게 통지하도록 하는 디자인 패턴을 말한다. 즉, 객체의 상태가 변경되었을 때, 특정 객체에 의존하지 않으면서 상태의 변경을 관련된 객체들에게 통지하는 것이 가능해진다. 이 패턴은 __Pub/Sub(발행/구독)__ 모델으로 불리기도 한다.

### Advantages

- 상태를 변경하는 객체(publisher)와 변경을 감지하는 객체(subscriber)의 관계를 느슨하게 유지할 수 있음
- Subject 의 상태 변경을 주기적으로 조회하지 않고 자동으로 감지할 수 있음
- 런타임에 옵저버를 추가하거나 제거할 수 있음

### Disadvantages

- 복잡도가 증가함
- 다수의 Observer 객체를 등록 이후 해지하지 않는다면 [Memory leak](https://baekjungho.github.io/wiki/java/java-memoryleak/) 이 발생할 수도 있음
  - Ex. `private Map<String, List<Subscriber>> subscribers = new HashMap<>();` 코드에서 subscribers 를 다른 곳에서 참조하지 않는다면 Map 에 WeakReference 를 적용할 수 있다. 이 경우 해지 메서드를 호출하지 않아도 GC 에 의한 회수 대상이 된다. 하지만 베스트 프랙티스는 __명시적으로 해지하는 코드를 작성__ 하는 것이 가장 좋다.

### Loose coupling

두 객체가 느슨하게 결합되어 있다는 것은, 그 둘이 상호작용을 하긴 하지만 서로에 대해 잘 모른다는 것을 의미한다. 옵저버 패턴은 느슨한 결합을 제공한다. 

> 느슨한 결합하는 디자인을 사용하면 변경 사항이 생겨도 무난히 처리할 수 있는 유연한 객체지향 시스템을 구축할 수 있다. 객체 사이의 상호의존성을 최소화 할 수 있다.

- 주제가 옵저버에 대해서 아는 것은 옵저버가 특정 인터페이스(Observer 인터페이스)를 구현 한다는 것 뿐이다.
  - 옵저버의 구상 클래스가 무엇인지, 옵저버가 무엇을 하는지 등에 대해서 알 필요가 없다.
- 옵저버는 언제든 새로 추가할 수 있다.
  - 실행 중 옵저버를 변경할 수도 있고, 제거할 수도 있다.
- 새로운 형식의 옵저버를 추가하려고 할 때도 주제를 전혀 변경할 필요가 없다.
  - 새로운 클래스에서 Observer 인터페이스를 구현하고 옵저버로 등록하면 된다.
- 주제나 옵저버가 바뀌더라도 서로한테 영향을 미치지는 않는다.

### Twit Notification Systems

옵저버 패턴으로 트위터 같은 커스터마이즈된 알림 시스템을 설계하고 구현할 수 있다. 다양한 신문 매체(뉴욕타임스, 가디언 등)가 뉴스 트윗을 구독하고 있으며 큭정 키워드를 포함하는 트윗이 등록되면 알림을 받고 싶어한다. 옵저버 인터페이스는 새로운 트윗이 있을 때 주제(Feed)가 호출할 수 있도록 notify 라고 하는 하나의 메서드를 제공한다.

- __옵저버 구현__

```java
class NYTimes implements Observer {
  public void notify(String tweet) {
    if(tweet != null & tweet.contains("money")) {
      System.out.println("Breaking news in NY! " + tweet);
    }
  }
}

class Guardian implements Observer {
  public void notify(String tweet) {
    if(tweet != null & tweet.contains("queen")) {
      System.out.println("Yet more news from London! " + tweet);
    }
  }
}
```

- __주제 인터페이스__

```java
interface Subject {
  void registerObserver(Observer o);
  void notifyObservers(String tweet);
  void removeObserver(Observer o);
}
```

주제는 registerObserver 메서드로 새로운 옵저버를 등록한 다음에 notifyObservers 메서드로 트윗의 옵저버에 이를 알린다.

- __주제 구현__

```java
class Feed implements Subject {
  private final List<Observer> observers = new ArrayList<>();
  // 옵저버 등록
  public void registerObserver(Observer o) {
    this.observers.add(o);
  }
  // 알림
  public void notifyObservers(String tweet) {
    observers.forEach(o -> o.notify(tweet));
  }
  // 옵저버 제거
  public void removeObserver(Observer o) {
    int i = this.observers.indexOf(o);
    if(i >= 0) {
      observers.remove(i);
    }
  }
}
```

- __주제와 옵저버를 연결하는 데모 애플리케이션__

```java
Feed f = new Feed();
f.registerObserver(new NYTimes());
f.registerObserver(new Guardian());
f.notifyObservers("The queen said her favourite book is Modern Java in Action!");
```

- __람다로 리팩토링 하기__

```java
f.registerObserver(String(tweet) -> {
  if(tweet != null && tweet.contains("money")) {
    System.out.println("Breaking news in NY! " + tweet);
  }
});
f.registerObserver(String(tweet) -> {
  if(tweet != null && tweet.contains("money")) {
    System.out.println("Yet more news from London! " + tweet);
  }
});
```

### Pub/Sub Systems

Chatting Service 처럼 polling 방식이 적합하지 않은 곳에서 pub/sub 패턴을 활용할 수 있다.

- __Subscriber__

```java
public interface Subscriber {
    void handleMessage(String message);
}
```

- __Concrete Subscriber__

```java
@Getter
public class User implements Subscriber {
    private String name;
    
    public User(String name) {
        this.name = name;
    }
    
    @Override
    public void handleMessage(String message) {
        System.out.println(message);
    }
}
```

- __ChatServer: Observer 패턴에 해당하는 Subject__

```java
public class ChatServer {
  
    private Map<String, List<Subscriber>> subscribers = new HashMap<>();
    
    // 등록
    public void register(String subject, Subscriber subscriber) {
        if (subscribers.containsKey(subject)) {
            subscribers.get(subject).add(subscriber);
        } else {
            List<Subscriber> list = new ArrayList<>();
            list.add(subscriber);
            subscribers.put(subject, list);
        }
    }
    
    // 해지
    public void release(String subject, Subscriber subscriber) {
        if (subscribers.containsKey(subject)) {
            subscribers.get(subject).remove(subscriber);
        }
    }
    
    // 알림
    public void notify(User user, String subject, String message) {
        if (subscribers.containsKey(subject)) {
            String userMessage = user.getName() + ": " + message;
            subscribers.get(subject).forEach(s -> s.handleMessage(userMessage));
        }
    }
}
```

- __사용 코드__

```java
public class Client {
    public static void main(String[] args) {
        ChatServer chatServer = new ChatServer();
        User user1 = new User("BAEK-1");
        User user2 = new User("BAEK-2");
        
        chatServer.register("오징어게임", user1);
        chatServer.register("오징어게임", user2);

        chatServer.register("디자인패턴", user1);
        
        chatServer.notify(user1, "오징어게임", "squid game");
        chatServer.notify(user2, "디자인패턴", "observer");
    }
}
```

### Java Observer

java.util.Observable 클래스와 java.util.Observer 인터페이스가 있다. 이 두개는 직접 구현하는것 보다 훨씬 많은 기능을 지원한다. `푸시 방식` 으로 갱신할 수도 있고, `풀 방식` 으로 갱신할 수도 있다.

- Observable 과 Observer (자바 9부터 deprecated)
- 자바 9 이후 부터는 PropertyChangeListener, PropertyChangeEvent, Flow API, SAX (Simple API for XML) 라이브러리

### Flow

- __SubmissionPublisher__

```java
/**
 * Creates a new SubmissionPublisher using the {@link
 * ForkJoinPool#commonPool()} for async delivery to subscribers
 * (unless it does not support a parallelism level of at least two,
 * in which case, a new Thread is created to run each task), with
 * maximum buffer capacity of {@link Flow#defaultBufferSize}, and no
 * handler for Subscriber exceptions in method {@link
 * Flow.Subscriber#onNext(Object) onNext}.
 */
public SubmissionPublisher() {
    this(ASYNC_POOL, Flow.defaultBufferSize(), null);
}
```

- __사용 코드__

```java
public class FlowInJava {

    public static void main(String[] args) throws InterruptedException {
        Flow.Publisher<String> publisher = new SubmissionPublisher<>();

        Flow.Subscriber<String> subscriber = new Flow.Subscriber<String>() {

            private Flow.Subscription subscription;

            @Override
            public void onSubscribe(Flow.Subscription subscription) {
                System.out.println("sub!");
                this.subscription = subscription;
                this.subscription.request(1);
            }

            @Override
            public void onNext(String item) {
                System.out.println("onNext called");
                System.out.println(Thread.currentThread().getName());
                System.out.println(item);
            }

            @Override
            public void onError(Throwable throwable) {
            }

            @Override
            public void onComplete() {
                System.out.println("completed");
            }
        };

        publisher.subscribe(subscriber);

        ((SubmissionPublisher)publisher).submit("hello java");

        System.out.println("이게 먼저 출력될 수도 있습니다.");
    }
}
```

- Reactive Stream API 의 주요 목적 중 하나는 BackPressure 를 관리하는 것이다. 구독을 하는 쪽에서 BackPressure 기능을 활용할 수 있다.

### Kotlin Observer

프로퍼티의 변경 사항을 로그로 출력하고 싶은 경우나, 변경 내용을 통지하고 싶은 경우 stdlib 의 observable delegate 를 사용할 수 있다.

```kotlin
var items: List<Items> by Delegates.observable(listOf()) {
    _, _, _ -> notifyDataSetChanged()
}

var key: String? by Delegates.observable(null) {
    _, old, new -> Log.e("key changed form $old to $new")
}
```

## Spring Observer

ApplicationContext(IoC Container, EventPublisher) 와 ApplicationEvent 에 Observer 패턴이 적용되어 있다.

### @EventListener

- __Event Object__

```java
public class MyEvent {

    private String message;

    public MyEvent(String message) {
        this.message = message;
    }

    public String getMessage() {
        return message;
    }
}
```

- __EventListener__

```java
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
public class MyEventListener {

    @EventListener(MyEvent.class)
    public void onApplicationEvent(MyEvent event) {
        System.out.println(event.getMessage());
    }
}
```

- __Runner__

```java
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Component;

@Component
public class MyRunner implements ApplicationRunner {

    private ApplicationEventPublisher publisher;

    public MyRunner(ApplicationEventPublisher publisher) {
        this.publisher = publisher;
    }

    @Override
    public void run(ApplicationArguments args) throws Exception {
        publisher.publishEvent(new MyEvent("hello spring event"));
    }
}
```

- __Application__

```java
@SpringBootApplication
public class ObserverInSpring {

    public static void main(String[] args) {
        SpringApplication app = new SpringApplication(ObserverInSpring.class);
        app.setWebApplicationType(WebApplicationType.NONE);
        app.run(args);
    }
}
```

### Guava EventBus

- [EventBusExplained](https://github.com/google/guava/wiki/EventBusExplained)

## Links

- [Observer Pattern - wikipedia](https://en.wikipedia.org/wiki/Observer_pattern#:~:text=The%20Observer%20design%20pattern%20is%20a%20behavioural%20pattern%2C,easier%20to%20implement%2C%20change%2C%20test%2C%20and%20reuse.%20)
- [Design Pattern - whiteship](https://www.inflearn.com/course/%EB%94%94%EC%9E%90%EC%9D%B8-%ED%8C%A8%ED%84%B4/dashboard)

## References

- Gangs of Four Design Patterns
- 设计模式之美 / 王争
- Head First Design Pattern / 에릭 프리먼, 엘리자베스 프리먼, 케이시 시에라, 버트 베이츠 저 / O'REILLY
- Java 객체지향 디자인 패턴 / 정인상, 채흥석 저 / 한빛미디어