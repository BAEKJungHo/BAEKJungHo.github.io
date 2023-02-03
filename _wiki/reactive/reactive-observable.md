---
layout  : wiki
title   : Observable
summary : 
date    : 2023-01-29 15:05:32 +0900
updated : 2023-01-29 15:15:24 +0900
tag     : reactive
toc     : true
comment : true
public  : true
parent  : [[/reactive]]
latex   : true
---
* TOC
{:toc}

## Reactive Extensions

Reactive Extensions(Rx) 는 [Observer](https://ko.wikipedia.org/wiki/%EC%98%B5%EC%84%9C%EB%B2%84_%ED%8C%A8%ED%84%B4) 패턴, [Iterator](https://en.wikipedia.org/wiki/Iterator_pattern) 패턴, 함수형 프로그래밍의 조합이다.

- __Procedure__

```java
public static Iterable<Book> getAuthorsBooks(Collection<Book> allBooks, String author) {
    List<Book> result = new ArrayList();
    for (Book book: allBooks) {
        if (author.equals(book.author)) {
            result.add(book);
        }    
    }
    return result;
}
```

- __Functional__

```java
public static Iterable<Book> getAuthorsBooks(Collection<Book> allBooks, String author) {
    return allBooks.stream()
        .filter(book -> author.equals(book.author))  
        .collect(Collectors.toList());
}
```

- __Reactive__

```java
public static Observable<Book> getAuthorsBooks(Collection<Book> allBooks, String author) {
    return Observable.from(allBooks).filter(book -> author.equals(book.author));
}
```

## Observable

- [Observable Documentation](https://reactivex.io/documentation/observable.html)
- [Reactive Duality](https://baekjungho.github.io/wiki/reactive/reactive-duality/)
- [Introduction to Rx](http://introtorx.com/Content/v1.0.10621.0/02_KeyTypes.html#IObserver)

| Event          | Iterable(pull)   | Observable(push)   |
|----------------|------------------|--------------------|
| retrieve data  | T next()         | onNext(T)          |
| discover error | throws Exception | onError(Exception) |
| complete       | !hasNext()       | onCompleted()      |

- [Observable operators](https://reactivex.io/documentation/operators.html)

![](/resource/wiki/reactive-observable/observable.png)

> ReactiveX, many instructions may execute in parallel and their results are later captured, in arbitrary order, by “observers.” Rather than calling a method, you define a mechanism for retrieving and transforming the data, in the form of an “Observable,” and then subscribe an observer to it, at which point the previously-defined mechanism fires into action with the observer standing sentry to capture and respond to its emissions whenever they are ready.

## Links

- [Reactive Extensions - Brunch](https://brunch.co.kr/@oemilk/78)
- [RxJava Presentation](https://www.slideshare.net/MateuszBukowicz/rxjavapresentation-56077123)

## References

- Reactive Systems Explained / Grace Jansen & Peter Gollmar 저 / O'REILLY