---
layout  : wiki
title   : Progression and Range
summary : 
date    : 2022-05-21 20:55:32 +0900
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

## Progression

> Progression 은 시작점과 끝점이 있으면 구간을 지정할 수 있다. Range 와 다르게 증가 값이 1 이상이 될 수 있다.

```kotlin
open class CharProgression(
    val startInclusive: Char,
    val endInclusive: Char,
    val step: Int 
): Iterable<Char>
```

Progression 은 아래와 같이 세 가지 방식으로 생성할 수 있다.

| function type  | function  |
|----------------|-----------|
| infix | downTo    |
| infix | step      |
| extension | reversed  |

```kotln
1..10 step 2 // 1, 3, 5 ...
10 downTo 1 step 2 // 10, 8, 6 ...
(1..10).reversed() // 10 downTo 1 step 1
```

## Range

> Progression 을 상속 하고 있으며, 증가값이 1로 고정 되어 있다.

```kotlin
class CharRange(
    startInclusive: Char,
    endInclusive: Char 
): CharProgression(startInclusive, endInclusive, 1), ClosedRange<Char>
```

## Links

- [Ranges and progressions](https://kotlinlang.org/docs/ranges.html)
- [loops ranges progressions kotlin](https://developersbreach.com/loops-ranges-progressions-kotlin/)
- [Kotlin 의 Progression 과 Range 제대로 이해하고 사용하기](https://kotlinworld.com/4)
- [CharProgression](https://kotlinlang.org/api/latest/jvm/stdlib/kotlin.ranges/-char-progression/)

## 참고 문헌

- Kotlin In Action / Dmitry Jemerov, Svetlana Isakova 공저 / 에이콘