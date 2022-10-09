---
layout  : wiki
title   : Observer
summary : 옵저버 패턴
date    : 2022-10-01 15:54:32 +0900
updated : 2022-10-01 20:15:24 +0900
tag     : designpattern reactive
toc     : true
comment : true
public  : true
parent  : [[/designpattern]]
latex   : true
---
* TOC
{:toc}

## UML

### From: Wikipedia

![](/resource/wiki/designpattern-observer/observer1.png)

### From: whiteship

![](/resource/wiki/designpattern-observer/observer2.png)

## Design Principle

> Observer Design Pattern: 다수의 객체가 특정 객체 상태 변화를 감지하고 알림을 받는 패턴. pub-sub(발행-구독) 패턴을 구현할 수 있다. polling (주기적으로 요청해서 데이터를 가져오는 방식) 방식이 적합하지 않을 때 유용하다.

- 서로 상호작용을 하는 객체 사이에서는 가능하면 느슨하게 결합하는 디자인을 사용해야 한다.
- 옵저버 패턴에서는 한 객체의 상태가 바뀌면 그 객체에 의존하는 다른 객체들한테 연락이 가고 자동으로 내용이 갱신되는 방식으로 __일대다(one-to-many)__ 의존성을 정의한다. __one 이 주제(subject) 이며, many 는 옵저버(observer)__ 이다.
- 어떤 이벤트가 발생했을 때 한 객체(주제(subject) 라 불리는)가 다른 객체 리스트(옵저버(observer) 라 불리는)에 자동으로 알림을 보내야 하는 상황에서 옵저버 디자인 패턴을 사용한다. GUI 애플리케이션에서 옵저버 패턴이 자주 등장한다. 버튼 GUI 컴포넌트에 옵저버를 설정할 수 있다. 그리고 사용자가 버튼을 클릭하면 옵저버에 알림이 전달되고 정해진 동작이 수행된다.
- 옵저버 패턴은 어떤 객체에 이벤트가 발생했을 때, 이 객체와 관련된 객체들(옵저버들)에게 통지하도록 하는 디자인 패턴을 말한다. 즉, 객체의 상태가 변경되었을 때, 특정 객체에 의존하지 않으면서 상태의 변경을 관련된 객체들에게 통지하는 것이 가능해진다. 이 패턴은 __Pub/Sub(발행/구독)__ 모델으로 불리기도 한다.

## Loose coupling

두 객체가 느슨하게 결합되어 있다는 것은, 그 둘이 상호작용을 하긴 하지만 서로에 대해 잘 모른다는 것을 의미한다. 옵저버 패턴은 느슨한 결합을 제공한다. 

> 느슨한 결합하는 디자인을 사용하면 변경 사항이 생겨도 무난히 처리할 수 있는 유연한 객체지향 시스템을 구축할 수 있다. 객체 사이의 상호의존성을 최소화 할 수 있다.

- 주제가 옵저버에 대해서 아는 것은 옵저버가 특정 인터페이스(Observer 인터페이스)를 구현 한다는 것 뿐이다.
  - 옵저버의 구상 클래스가 무엇인지, 옵저버가 무엇을 하는지 등에 대해서 알 필요가 없다.
- 옵저버는 언제든 새로 추가할 수 있다.
  - 실행 중 옵저버를 변경할 수도 있고, 제거할 수도 있다.
- 새로운 형식의 옵저버를 추가하려고 할 때도 주제를 전혀 변경할 필요가 없다.
  - 새로운 클래스에서 Observer 인터페이스를 구현하고 옵저버로 등록하면 된다.
- 주제나 옵저버가 바뀌더라도 서로한테 영향을 미치지는 않는다.

## Implementation

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

## Java Observer

java.util.Observable 클래스와 java.util.Observer 인터페이스가 있다. 이 두개는 직접 구현하는것 보다 훨씬 많은 기능을 지원한다. `푸시 방식` 으로 갱신할 수도 있고, `풀 방식` 으로 갱신할 수도 있다.

## Links

- [Observer Pattern - wikipedia](https://en.wikipedia.org/wiki/Observer_pattern#:~:text=The%20Observer%20design%20pattern%20is%20a%20behavioural%20pattern%2C,easier%20to%20implement%2C%20change%2C%20test%2C%20and%20reuse.%20)
- [Design Pattern - whiteship](https://www.inflearn.com/course/%EB%94%94%EC%9E%90%EC%9D%B8-%ED%8C%A8%ED%84%B4/dashboard)

## 참고 문헌

- GOF Design Pattern / gof 저 / 프로텍 미디어
- Head First Design Pattern / 에릭 프리먼, 엘리자베스 프리먼, 케이시 시에라, 버트 베이츠 저 / O'REILLY
- Java 객체지향 디자인 패턴 / 정인상, 채흥석 저 / 한빛미디어