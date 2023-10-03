---
layout  : wiki
title   : Principle Of Immutability is Copy on Write
summary : Immutable Data Structure, It's Fast Enough
date    : 2023-10-02 15:02:32 +0900
updated : 2023-10-02 15:12:24 +0900
tag     : fp datastructures
toc     : true
comment : true
public  : true
parent  : [[/functional]]
latex   : true
---
* TOC
{:toc}

## Copy on Write

함수형 프로그래밍에서 쓰기 동작은 불변성의 원칙에 따라 구현해야한다. 불변성의 원칙을 __Copy on Write__ 라고 한다.

__Copy on Write 3 Steps__:
- 복사본 만들기
- 복사본 변경하기
- 복사본 리턴하기

```kotlin
fun addStock(stock: Stock<Int>, element: Int): Array<Int> {
    val copy = stock.copy() // 복사본 만들기 
    copy.add(element) // 복사본 바꾸기
    return copy // 복사본 리턴하기
}
```

Copy On Write 는 쓰기를 읽기로 변경한다. 복사본을 만들어서 변경된 복사본은 리턴했기 때문에 원본은 변경되지 않는다.
따라서 __정보를 리턴하는 읽기__ 로 변환된 것이다.

쓰기와 읽기를 동시에 하는 Javascript 의 경우 shift() 함수가 있다. 

이 경우 불변성을 유지하는 방법은 __값을 두 개 리턴하는 함수로 변경__ 하는 것이다.

핵심 아이디어는 읽기와 쓰기를 같이 하는(e.g shift()) 함수를 __감싸는 것__ 이다.

```javascript
function shift(array) {
    return array.shift()
}
```

__동작을 감싸는__ 것을 이용하면, 아래 처럼 값을 두 개 리턴하는 함수로 변경할 수 있다.

```javascript
function shift(array) {
    return {
        first: first_element(array), // 읽기 동작
        array: drop_first(array) // 쓰기 동작
    };
}
```

Copy On Write 는 __[얕은 복사(shallow copy)](https://www.baeldung.com/kotlin/deep-copy-data-class)__ 를 사용한다. 얕은 복사는 [구조적 공유(structural sharing)](https://blog.klipse.tech/javascript/2021/02/26/structural-sharing-in-javascript.html) 를 사용한다.

![](/resource/wiki/functional-copy-on-write/shallow-copy.png)

## Immutable Data Structure, It's Fast Enough

불변 데이터 구조는 Copy On Write 를 기반으로 하기 때문에 메모리를 더 많이 쓰는 것은 사실이다.

그럼에도 불구하고 불변 데이터 구조를 사용하는 이유는 the most obvious benefit is __avoiding the accidental mutation of data__ 이다.

> 몇가지 논점은 있다. by Grokking Simplicity
>
> - __언제든 최적화 할 수 있다__: 애플리케이션을 개발할 때 예상하기 힘든 병목 지점이 항상 있기 때문에 성능 개선을 할 때 보통 미리 최적화 하지 않고, 성능 이슈가 발생하면 그때 최적화 해도 된다.
> - __가비지 콜렉터는 매우 빠르다__ 
> - __생각보다 많이 복사하지 않는다__: 데이터 구조의 최상위 단계만 복사하는 것을 얕은 복사(shallow copy)라고 한다. 얕은 복사는 같은 메모리를 가리키는 참조에 대한 복사본을 만든다. 이것을 구조적 공유(structural sharing)라고 한다.
> - __함수형 프로그래밍 언어에는 빠른 구현체가 있다__: 예를 들어 Clojure 에서 지원하는 불변 데이터 구조는 다른 언어에서 참고할 만큼 효율적이다. 보통 데이터 구조를 복사할 때 최대한 많은 구조를 공유한다. 그래서 더 적은 메모리를 사용하고 GC 의 부담을 줄여준다.

Copy on Write 를 지원하지 않는 언어에서는 직접 구현해줘야 한다. 따라서 boilerplate code 를 줄이기 위해 기본적인 배열과 객체 동작에 대한 copy on write 버전을 만들어 두는 것이 좋다.

## Links

- [Purely Functional Data Structures](https://citeseerx.ist.psu.edu/viewdoc/download?doi=10.1.1.64.3080&rep=rep1&type=pdf)
- [Immutable data structures for Rust](https://docs.rs/im/latest/im/)

## References

- Grokking Simplicity / Eric Normand / Manning