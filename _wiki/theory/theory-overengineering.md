---
layout  : wiki
title   : Overengineering
summary : Overengineering and Yagni
date    : 2022-10-16 15:05:32 +0900
updated : 2022-10-16 15:15:24 +0900
tag     : theory
toc     : true
comment : true
public  : true
parent  : [[/theory]]
latex   : true
---
* TOC
{:toc}

## Overengineering

> The dictionary just defines it as a combination of “over” (meaning __“too much”__) and “engineer” (meaning __“design and build”__). So per the dictionary, it would mean that you designed or built too much.
>
> Over-engineered code affects productivity because when someone inherits an over-engineered design, they must spend time
learning the nuances of that design before they can comfortably extend or maintain it.
> 
> With overengineering, the big problem is that it makes it difficult for people to understand your code.
> 
> There’s some piece built into the system that doesn’t really need to be there, and the person reading the code can’t figure out why it’s there, or even how the whole system works (since it’s now so complicated).
>
> [As a consequence, the model encourages early overdesign as the programmer tries to predict every possible use the software might require, adding layers of type and abstraction just in case.](https://go.dev/talks/2012/splash.article)

클래스 설계만 하더라도, 조기에 모든 가능한 사용을 예측해서 추상화 Level 을 높이게 되는 경우가 있다.

## Ways overengineering

오버엔지니어링이 되는 방법은 많다. 그 중 두가지는 다음과 같다.

1. __확장할 필요가 없는데 너무 확장하는 것__
2. __너무 일반적으로 만들어버리는 것__

1번의 경우에는 __추상화 비용__ 과도 연결 지을 수 있다. 확장성을 고려하다보면 추상화 레벨이 깊어지는 경우가 대다수인데, 다른 사람이 코드를 이해하는데 많은 노력이 필요할 수 있다. 참고로, 코드는 작성하는 비용보다 읽는데 드는 비용이 더 많이든다.

2번의 경우에는 "버그 추적기" 같은 특정 기능에 초점을 맞춘 시스템을 만들려고 시작을 했으나, "데이터를 관리하기 위한 일반 시스템" 을 만들기로 결정한 경우이다. 즉, __특정 기능__ 에 초점을 맞추는 대신 __모든 사람에게 모든 것을__ 제공하려는 것에 초점을 맞추게 되면서 발생한다.

## Away from overengineering

오버엔지니어링을 피하는 방법은 아래와 같다.

- __너무 먼 미래를 설계하지 않는 것__: [Designing too far into the future](https://www.codesimplicity.com/post/designing-too-far-into-the-future/)
    - 프로그래밍에서 알 수 없는 가장 큰 것은 프로그램이 미래에 어떻게 변할 것 인지이다.
    - 1주, 1달의 단기간의 미래는 어느정도 예측할 수 있을지라도, 5년, 10년 .. 후에는 어떻게 바뀔지 모른다.
- __현 시점에서 확장 니즈가 명료한가__
    - 처음부터 확장성을 너무 고려하여 개발하면, 다른 사람들이 코드 분석에 어려움을 겪는다.

## You Arent Gonna Need It

> Always implement things when you actually need them, never when you just foresee that you may need them.

### From: MartinFowler

> Yagni originally is an acronym that stands for "You Aren't Gonna Need It". It is a mantra from ExtremeProgramming that's often used generally in agile software teams. It's a statement that some capability we presume our software needs in the future should not be built now because "you aren't gonna need it".
> 
> Yagni only applies to capabilities built into the software to support a presumptive feature, it does not apply to effort to make the software easier to modify.
> 
> - [Yagni - MartinFowler](https://martinfowler.com/bliki/Yagni.html)

### From: Ward's Wiki

> There are two main reasons to practise YagNi: [Ward's Wiki](http://wiki.c2.com/?YagNi)
> - You save time, because you avoid writing code that you turn out not to need.
> - Your code is better, because you avoid polluting it with 'guesses' that turn out to be more or less wrong but stick around anyway

## Underengineering

> It doesn’t need to be there now, but you’d be underengineering if you made it impossible to add it later.

## Links

- [What is Overengineering - Code Simplicity](https://www.codesimplicity.com/post/what-is-overengineering/)
- [Stop Over-Engineering!](https://www.industriallogic.com/img/blog/2005/09/StopOverEngineering.pdf)
- [Overengineering: How much is too much?](https://www.edn.com/overengineering-how-much-is-too-much/)
- [Wikipedia](https://en.wikipedia.org/wiki/Overengineering#:~:text=Overengineering%20%28or%20over-engineering%29%2C%20is%20the%20act%20of%20designing,effectiveness%20as%20that%20of%20the%20original%20design.%20)
