---
layout  : wiki
title   : 열린 범위와 닫힌 범위
summary : 
date    : 2022-05-21 20:54:32 +0900
updated : 2022-05-21 21:15:24 +0900
tag     : kotlin
toc     : true
comment : true
public  : true
parent  : [[/kotlin]]
latex   : true
---
* TOC
{:toc}

## 열린 범위

> 열린 범위란 끝 값을 포함하지 않는 범위를 의미한다.

```kotlin
operator fun Rectangle.contains(p: Point): Boolean {
    return p.x in upperLeft.x until lowerRight.x &&
            p.y in upperLeft.y until lowerRight.y
}
```

코틀린의 `until` 은 열린 범위이다.

## 닫힌 범위

> 닫힌 범위란 끝 값을 포함하는 범위를 의미한다.

```kotlin
1..100 // 1 ~ 100
```

`..` 연산자는 rangeTo 함수로 컴파일된다.

## 참고 문헌

- Kotlin In Action / Dmitry Jemerov, Svetlana Isakova 공저 / 에이콘