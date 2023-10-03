---
layout  : wiki
title   : Defensive Copy
summary : Deep Copy
date    : 2023-10-03 15:02:32 +0900
updated : 2023-10-03 15:12:24 +0900
tag     : fp kotlin deepcopy
toc     : true
comment : true
public  : true
parent  : [[/functional]]
latex   : true
---
* TOC
{:toc}

## Defensive Copy

Legacy Code 나 신뢰할 수 없는 코드로부터 불변성을 유지시키기 위해서는 Copy on Wirte 만으로 해결할 수 없다.
이때 사용되는 기술이 __방어적 복사(defensive copy)__ 이다. 방어적 복사는 데이터를 변경할 수도 있는 코드와 불변성 코드 사이에 데이터를 주고 받기 위한 원칙이다.

Defensive copy 는 깊은 복사(deep copy)를 사용하는 반면 [Copy on Write 는 얕은 복사(shallow copy)](https://baekjungho.github.io/wiki/functional/functional-copy-on-write/)를 사용한다는 차이가 있다. 
따라서 비용적인 측면에서는 defensive copy 가 더 비용이 많이 든다.

불변성이 지켜지는 코드 영역을 __안전 지대(safe zone)__ 라고 한다.

![](/resource/wiki/functional-defensive-copy/deepcopy.png)

Unsafe Zone 에서 변경 가능한 원본 데이터를 Safe Zone 으로 보낼 때에는 Safe Zone 에서 Deep Copy 를 통해 복사본을 만들고 쓰기를 한다.
또한 Safe Zone 에서 Unsafe Zone 으로 보내는 데이터는 Deep Copy 된 데이터이다.

__Principals__:
- 데이터가 Safe Zone 에서 나갈때 복사하기
- Safe Code 로 데이터가 들어올 때 복사하기

```kotlin
fun safeZone() {
    ... 
    val copyData = deepCopy(data) // Deep Copy
    legacyCall(copyData) // Legacy Code, Unsafe Zone 으로 데이터를 전달
    safeVariable = deepCopy(copyData) // Safe Code 로 들어오는 데이터를 위한 복사
}
```

__Application Programming Interaface use Deep Copy__:
- API 통신을 할 때 JSON 형식으로 통신을 한다. 직렬화, 역직렬화를 통해 통신을 하는데, 이때 JSON 은 깊은 복사본(deep copy) 이다.
- 모듈이 서로 통신하기 위해 방어적 복사를 구현했다면 이것을 __비공유 아키텍처(shared nothing architecture)__ 라고 한다.

## Links

- [Differences Between a Deep Copy and a Shallow Copy](https://www.baeldung.com/cs/deep-vs-shallow-copy)
- [Create a Deep Copy of a Kotlin Data Class](https://www.baeldung.com/kotlin/deep-copy-data-class)

## References

- Grokking Simplicity / Eric Normand / Manning