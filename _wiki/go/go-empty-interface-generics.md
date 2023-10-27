---
layout  : wiki
title   : Empty Interface and Generics
summary : 
date    : 2023-10-18 12:54:32 +0900
updated : 2023-10-18 13:15:24 +0900
tag     : go
toc     : true
comment : true
public  : true
parent  : [[/go]]
latex   : true
---
* TOC
{:toc}

## Empty Interface and Generics

__Empty Interface__:

```go
interface{}
```

메서드가 zero 인 인터페이스를 __[Empty Interface](https://go.dev/tour/methods/14)__ 라고 한다. 비어있는 인터페이스는 모든 유형의 값을 보유할 수 있다. (모든 유형은 최소한 0개의 메소드를 구현한다.)

Java 의 Generic 과 비슷한 느낌이다. Go 에도 __[Generics](https://go.dev/blog/intro-generics)__ 이 있다.

[When Generics - Don’t replace interface types with type parameters](https://go.dev/blog/when-generics) 부분을 읽어보면 아래와 같이 설명되어있다.

> Go has interface types. Interface types permit a kind of generic programming.

이런 type parameter 대신 interface 를 사용하면 다음과 같은 장점이 있다고 한다.

> Omitting the type parameter makes the function easier to write, easier to read, and the execution time will likely be the same.

그래서 Generic 은 언제 써야 하냐면, 정확하게 동일한 코드를 여러번 작성하고 있다고 알아채기 전까지는 사용하면 안된다고 한다.

> If you find yourself writing the exact same code multiple times, where the only difference between the copies is that the code uses different types, consider whether you can use a type parameter.
>
> Another way to say this is that you should avoid type parameters until you notice that you are about to write the exact same code multiple times.

### Generic Function

[Generic Function](https://go.dev/blog/intro-generics) 을 사용하기 위해서는 두 단계로 나눠진다.

1. __Instantiation__
2. __Check that type argument satisfies the constraint__

```go
func GMin[T constraints.Ordered](x, y T) T {
    if x < y {
        return x
    }
    return y
}
```

```go
fmin := GMin[float64] // instantication
m := fmin(2.71, 3.14) // non-generic function
```