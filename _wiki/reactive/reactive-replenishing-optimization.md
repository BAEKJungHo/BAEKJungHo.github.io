---
layout  : wiki
title   : Replenishing Optimization
summary : 
date    : 2023-02-18 15:05:32 +0900
updated : 2023-02-18 15:15:24 +0900
tag     : reactive webflux
toc     : true
comment : true
public  : true
parent  : [[/reactive]]
latex   : true
---
* TOC
{:toc}

## Replenishing Optimization

> You might also have noticed that some operators have variants that take an int input parameter called prefetch. This is another category of operators that modify the downstream request. These are usually operators that deal with inner sequences, deriving a Publisher from each incoming element (like flatMap).
>
> __Prefetch__ is a way to tune the initial request made on these inner sequences. If unspecified, most of these operators start with a demand of 32.
>
> These operators usually also implement a __replenishing optimization: Once the operator has seen 75% of the prefetch request fulfilled, it re-requests 75% from upstream__. This is a heuristic optimization made so that these operators proactively anticipate the upcoming requests.

![](/resource/wiki/reactive-replenishing-optimization/prefetch.png)

```java
Flux.range(1, 10)
    .flatMap(i -> Flux.range(i, 2), 2) // use prefetch of 2 for flatMap
    .subscribe(System.out::println);
```

The overall effect of the prefetch parameter in this example is that it limits the amount of data that is buffered in the flatMap operator. 
__Without the prefetch parameter, the flatMap operator would request all the data from the upstream publisher immediately, which could lead to high memory usage if the publisher emits a large number of inner sequences or if the inner sequences themselves emit a large number of elements__. By limiting the amount of data requested from the upstream publisher and from the inner sequences, the prefetch parameter helps to control the amount of memory used by the flatMap operator.

This behavior can be observed by adding some logging statements to the code:

```java
Flux.range(1, 100)
    .flatMap(i -> Flux.range(i, 2), 10) // use prefetch of 10 for flatMap
    .doOnRequest(n -> System.out.println("Requesting " + n + " elements"))
    .doOnNext(n -> System.out.println("Received " + n))
    .subscribe(System.out::println);
```

As the flatMap operator processes the incoming data, it will request more data from upstream in chunks of 10 elements at a time. When it has processed 75% (7.5 elements) of the current chunk, it will proactively request another chunk of 10 elements from upstream, even if the downstream subscriber hasn't yet signaled a demand for more data.

__prefetch 옵션을 주지 않으면 보충 최적화(replenishing optimization)가 적용되지 않는다:__
- The replenishing optimization only applies to operators that use the prefetch parameter. This parameter is used to control the number of elements that the operator requests from its upstream source at once.
- The replenishing optimization is triggered when the operator has received 75% of the elements it requested via prefetch. At this point, the operator proactively requests another 75% of the prefetch amount from its upstream source. This is done to avoid potential stalls when the downstream consumer requests more elements, by anticipating the upcoming requests and keeping a buffer of data ready.
- If an operator is not using the prefetch parameter, the replenishing optimization does not apply, and the operator simply requests more data from its upstream source whenever the downstream consumer requests more elements.

## Links

- [Operators that Change the Demand from Downstream](https://projectreactor.io/docs/core/release/reference/#_operators_that_change_the_demand_from_downstream)