---
layout  : wiki
title   : Difference Between Method And Function
summary : Receiver
date    : 2023-10-01 12:54:32 +0900
updated : 2023-10-01 13:15:24 +0900
tag     : go oop
toc     : true
comment : true
public  : true
parent  : [[/go]]
latex   : true
---
* TOC
{:toc}

## Difference Between Method And Function

[What's the difference between a method and a function?](https://stackoverflow.com/questions/155609/whats-the-difference-between-a-method-and-a-function) 에 따르면
A __function__ is a piece of code that is called by name. A __method__ is a piece of code that is called by a name that is associated with an __object__.

즉, function 과 method 의 차이는 객체(object)와의 연관성에 따라 판단된다.

__[Golang functions vs methods](https://www.sohamkamani.com/golang/functions-vs-methods/)__:

```go
type Person struct {
  Name string
  Age int
}

// Function
// This function returns a new instance of `Person`
func NewPerson(name string, age int) *Person {
    return &Person{
        Name: name,
        Age: age,
    }
}

// Method
// The `Person` pointer type is the receiver of the `isAdult` method
func (p *Person) isAdult() bool {
    return p.Age > 18
}
```

receiver 를 이해하기 위해선 [OOP Message](https://baekjungho.github.io/wiki/driven/oop-oo/#%EB%A9%94%EC%8B%9C%EC%A7%80) 에 대해서 이해하면 된다.

> 객체지향의 세계에서는 오직 한 가지 의사소통 수단만이 존재한다. 이를 메시지라고 한다. 한 객체가 다른 객체에게 요청하는 것을 메시지를 전송한다고 말하고 다른 객체로부터 요청을 받는 것을 메시지를 수신한다고 말한다.
>
> 메시지를 전송하는 객체를 __송신자(sender)__ 라고 부르고 메시지를 수신하는 객체를 __수신자(receiver)__ 라고 부른다.
>
> 객체가 수신된 메시지를 처리하는 방법을 __메서드(method)__ 라고 한다.

Which in OOP terms would be the “class” that the method is a part of.

즉, 메시지를 처리하는 방법이 isAdult() 메서드인 것이고, 메시지를 수신하는 객체가 Person 이라는 것이다.
