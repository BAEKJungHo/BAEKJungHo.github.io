---
layout  : wiki
title   : Marble Diagram
summary : 
date    : 2023-02-12 15:05:32 +0900
updated : 2023-02-12 15:15:24 +0900
tag     : reactive
toc     : true
comment : true
public  : true
parent  : [[/reactive]]
latex   : true
---
* TOC
{:toc}

## Marble Diagram

![](/resource/wiki/reactive-marble-diagram/marble.png)

아래로 내려오는 점선 화살표는 입력, 출력을 의미한다. 아이템들이 Observable 에 의해 방출될 때 onNext() 가 호출되며, 파이프(`|`)에서는 onComplete() 가 호출된다. `X` 에서는 onError() 가 호출된다.

__Operators:__
- Observable -> Operators -> Observer
- We can apply a chain of operators on an Observable where each output of one operator is the input of the next operator. Using these operators we can modify, combine or filter the data streams emitted by an Observable.

__The essential concepts in RxJS which solve async event management are:__
- __Observable__: represents the idea of an invokable collection of future values or events.
- __Observer__: is a collection of callbacks that knows how to listen to values delivered by the Observable.
- __Subscription__: represents the execution of an Observable, is primarily useful for cancelling the execution.
- __Operators__: are pure functions that enable a functional programming style of dealing with collections with operations like map, filter, concat, flatMap, etc.
- __Subject__: is the equivalent to an EventEmitter, and the only way of multicasting a value or event to multiple Observers.
- __Schedulers__: are centralized dispatchers to control concurrency, allowing us to coordinate when computation happens on e.g. setTimeout or requestAnimationFrame or others.

### Filter

![](/resource/wiki/reactive-marble-diagram/filter.png)

- 원을 찾는 필터

### Map

![](/resource/wiki/reactive-marble-diagram/map.png)

- 원을 다이아몬드로 변환

### FlatMap

![](/resource/wiki/reactive-marble-diagram/flatmap.png)

- Observable 이 방출한 항목을 Observable 로 변환한 다음 단일 Observable 로 병합
- flatMap 은 Item 대신 Observable 을 방출

### ConcatMap

![](/resource/wiki/reactive-marble-diagram/concatmap.png)

- flatMap 과 유사하지만 Observable 의 순서를 보장 

### SwitchMap

![](/resource/wiki/reactive-marble-diagram/switchmap.png)

- 항상 최신 Observable 을 반환
- convert an Observable that emits Observables into a single Observable that emits the items emitted by the most-recently-emitted of those Observables
- Switch subscribes to an Observable that emits Observables. Each time it observes one of these emitted Observables, the Observable returned by Switch unsubscribes from the previously-emitted Observable begins emitting items from the latest Observable. Note that it will unsubscribe from the previously-emitted Observable when a new Observable is emitted from the source Observable, not when the new Observable emits an item. This means that items emitted by the previous Observable between the time the subsequent Observable is emitted and the time that subsequent Observable itself begins emitting items will be dropped (as with the yellow circle in the diagram above).

## Links

- [ReactiveX Operators](https://reactivex.io/documentation/operators.html)
- [RxJava — Understanding Operators with the Marble Diagram](https://levelup.gitconnected.com/rxjava-understanding-operators-with-the-marble-diagram-fc96addb0beb)
- [Projectreactor - Appendix B: How to read marble diagrams ?](https://projectreactor.io/docs/core/release/reference/#howtoReadMarbles)
- [RxMarbles](https://rxmarbles.com/#from)