---
layout  : wiki
title   : Duality in Reactive
summary : 
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
- ReactiveX 를 이해하기 위한 핵심 개념이 [Observable](https://reactivex.io/documentation/observable.html) 이다.
  - 그리고 Observable 을 공부하다보면 등장하는 개념이 [Dual(category theory)](https://en.wikipedia.org/wiki/Dual_(category_theory))이다.
  - Duality 를 이해하기 위해서 Iterable 의 next() 와 Observable 의 notify() 를 비교해보면 좋다.
    - [Observer Design Pattern](https://baekjungho.github.io/wiki/designpattern/designpattern-observer/)
    - [Iterable](https://baekjungho.github.io/wiki/java/java-iterable/)

## Duality

> In category theory, a branch of mathematics, __duality__ is a correspondence between the properties of a category C and the dual properties of the opposite category Cop.

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

```java
/** relation of push vs pull */
// void method(DATA) ↔ DATA method(void)
```

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

## Drawbacks in Observer Pattern

ReactiveX 를 처음 만든 Microsoft Engineers 가 Observer Pattern 은 좋지만 두 가지가 부족하다고 지적했다.

1. __complete 라는 개념이 없다.__
  - 더 이상 데이터가 오지 않으면 ? 혹은 데이터를 다 줬다는 complete 라는 개념이 없음
2. __Error 처리를 어떻게 할 것인가.__
  - Recoverable Exception(복구 가능한 예외, Ex. Network Error 등)가 발생했을 때 어떻게 복구할 것인가에 대한 패턴이 녹아져 있지 않다.

Observer Pattern 에서 위 두 가지의 개념을 보완한 것이 Reactive Programming 의 한 축이다.

## Links

- [The Reactive Manifesto](https://www.reactivemanifesto.org/)
- [Spring Reactive Programming - Toby](https://www.youtube.com/watch?v=8fenTR3KOJo&list=LL&index=2&t=3s)
- [ReactiveX](https://reactivex.io/)