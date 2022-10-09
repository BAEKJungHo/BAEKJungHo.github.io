---
layout  : wiki
title   : Duality in ReactiveX
summary : Reactive Streams 에서의 상대성 이론
date    : 2022-10-04 15:05:32 +0900
updated : 2022-10-04 15:15:24 +0900
tag     : reactive
toc     : true
comment : true
public  : true
parent  : [[/reactive]]
latex   : true
---
* TOC
{:toc}

## Reactive

- Reactive = 반응성
  - 무엇에 반응? = Event
- Reactive Programming = 반응성 프로그래밍
  - __이벤트가 발생__ 했을 때 그에 대한 __반응__ 을 하는 코드를 작성하는 프로그래밍
- ReactiveX 를 이해하기 위한 핵심 개념이 Observable 이다.
  - 그리고 Observable 을 공부하다보면 등장하는 개념이 상대성(Duality)이다.
  - 상대성(Duality) 을 이해하기 위해서 Iterable 의 next() 와 Observable 의 notify() 를 비교해보면 좋다.
    - [Observer Design Pattern](https://baekjungho.github.io/wiki/designpattern/designpattern-observer/)
    - [Iterable](https://baekjungho.github.io/wiki/java/java-iterable/)

## Duality

ReactiveX 에서 비슷한 의미로 사용되는 용어가 많다. ReactiveX 에서 핵심이 되는 개념이 상대성(이중성, Duality) 이다.  해당 용어들이 Duality 를 설명하기 좋다고 생각한다.

Duality 에서 __Push : Pull = One : Many__ 의 관계를 가진다.

| Push                | Pull            |
|---------------------|-----------------|
 | Observable          | Observer        |
 | Observable notify() | Iterable next() |
 | Publisher(pub)      | Subscriber(sub) |

- Iterable 의 상대성(duality)은 Observable 이다. 
  - Iterable 은 next() 로 원하는 결과값을 가져온다. 값을 사용하는 쪽에서 `pull` 하는 방식
  - Observable 은 `push` 방식

위 표의 관계(push vs pull)를 pseudo code 로 나타내면 다음과 같다.

__DATA method(void) <-> void method(DATA)__

## Observable

- Observable 을 Observer 에 등록
  - Observable : Observer = One : Many
  - Source > Event/Data > Observer

```java
public class ObservableApp {
    public static void main(String[] args) {
        Observer ob = new Observer() { // Subscriber
            @Override
            public void update(Observable o, Object arg) {
                System.out.println(Thread.currentThread().getName() + ":" + arg);
            }
        };

        IntObservable io = new IntObservable();
        io.addObserver(ob); // register observer 
        // io.run();
        
        // 별도의 스레드에서 동작
        ExecutorService es = Executors.newSingleThreadExecutor();
        es.execute(intObservable);

        // main thread
        System.out.println(Thread.currentThread().getName() + " EXIT");

        es.shutdown();
    }

    static class IntObservable extends Observable implements Runnable { // Publisher
        @Override
        public void run() {
            for (int i = 1; i <= 10; i++) {
                setChanged();
                notifyObservers(i); // push
            }
        }
    }
}
```

## Links

- [토비의 봄 TV - Spring Reactive Programming](https://www.youtube.com/watch?v=8fenTR3KOJo&list=LL&index=2&t=3s)
- [ReactiveX](https://reactivex.io/)
- [ReactiveX - intro](https://reactivex.io/intro.html)
- [Duality Theory](https://www.dam.brown.edu/people/huiwang/classes/am121/Archive/dual_121.pdf#:~:text=Duality%20Theory%20Duality%20Theory%20Every%20LP%20is%20associated,understanding%20the%20linear%20programming%20%28and%20non-linear%20programming%2C%20indeed%29.)
- [What are the advantages of Observables over an iterable of futures?](https://softwareengineering.stackexchange.com/questions/317809/what-are-the-advantages-of-observables-over-an-iterable-of-futures)