---
layout  : wiki
title   : Coroutines
summary : 
date    : 2022-06-18 20:54:32 +0900
updated : 2022-06-18 21:15:24 +0900
tag     : kotlin
toc     : true
comment : true
public  : true
parent  : [[/kotlin]]
latex   : true
---
* TOC
{:toc}

# Coroutines

코루틴은 컴퓨터 프로그램 구성 요소 중 하나로 비선점형 멀티태스킹(non-preemptive multitasking)을 수행하는 일반화한 서브루틴(subroutine)이다. 코루틴은 실행을 일시 중단(suspend) 하고, 재개(resume)할 수 있는 여러 진입 지점(entry point)을 허용한다.

## Subroutines
 
> 서브루틴은 여러 명령어를 모아 이름을 부여해서 반복 호출할 수 있게 정의한 프로그램 구성요소로 함수라고 부르기도 한다. 객체지향 언어에서는 메서드도 서브루틴이라 할 수 있다.
>
> 서브루틴에 진입하는 방법은 한 가지(해당 함수를 호출하면 서브루틴의 맨 처음부터 실행이 시작됨) 뿐이며, 그때 마다 __활성 레코드(activation record)__ 라는 것이 __스택(stack)__ 에 할당 되고, 서브루틴 내부의 로컬 변수 등이 초기화 된다.
> 
> 서브루틴에서 반환되고 나면 활성 레코드가 스택에서 사라지기 때문에 실행 중이던 모든 상태를 잃어버린다. 따라서 여러 번 반복 실행해도(전역 변수나 다른 부수 효과가 있지 않는 한) 항상 같은 결과를 반복해서 얻게 된다.

## Multitasking

> 멀티태스킹은 여러 작업을 동시에 수행하는 것처럼 보이거나 실제로 동시에 수행하는 것이다. 비선점형이란 멀티태스킹의 각 작업을 수행하는 참여자들의 실행을 운영체제가 강제로 일시 중단시키고 다른 참여자를 실행하게 만들 수 없다는 뜻이다. 따라서 각 참여자들이 서로 자발적으로 협력해야만 비선점형 멀티태스킹이 제대로 작동할 수 있다.

__따라서, 코루틴이란 서로 협력해서 실행을 주고 받으면서 작동하는 여러 서브루틴을 의미한다.__

## Subroutines vs Coroutines

![](/resource/wiki/kotlin-coroutines/subvsco.png)

## Coroutines Thread ?

- One can think of coroutines as a light-weight thread.
- The biggest difference is that coroutines are very cheap, almost free: we can create thousands of them, and pay very little in terms of performance.
- __Light-weight thread__

## Links

- [kotlinx.coroutines](https://kotlin.github.io/kotlinx.coroutines/kotlinx-coroutines-core/index.html)
- [wikipedia coroutines](https://en.wikipedia.org/wiki/Coroutine
- [taehwandev kotlin coroutines](https://speakerdeck.com/taehwandev/kotlin-coroutines)

## 참고 문헌

- Kotlin In Action / Dmitry Jemerov, Svetlana Isakova 공저 / 에이콘