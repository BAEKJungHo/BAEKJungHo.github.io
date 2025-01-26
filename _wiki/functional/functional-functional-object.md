---
layout  : wiki
title   : Functional Object
summary : 
date    : 2025-01-20 15:02:32 +0900
updated : 2025-01-20 15:12:24 +0900
tag     : fp
toc     : true
comment : true
public  : true
parent  : [[/functional]]
latex   : true
---
* TOC
{:toc}

## Functional Object

![](/resource/wiki/functional-functional-object/immutable-object.png)

Functional Object 설계의 핵심 중 하나는, 항상 새로운 객체를 생성하는 것이다.
변경 불가능한 객체는 시간에 따라 변하는 상태 공간을 갖지 않아서, 추론이 쉽다.
객체 전달이 자유롭다.
상태를 갖는 변경 가능한 객체는 코드의 다른 부분에 전달하기 전에 복사를 해놓는 등의 방어조치가 필요하다.
변경 불가능한 객체는 상태를 바꿀 수 없기 때문에 Thread Safe 하다.
변경 불가능한 객체의 단점은 바로 상태를 변경하면 간단할 수 있는데도, 거대한 객체 그래프를 복사해야하는 경우가 있다.

## References

- Programming in Scala 4/e / Martin Odersky