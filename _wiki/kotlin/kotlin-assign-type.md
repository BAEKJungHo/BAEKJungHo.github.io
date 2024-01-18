---
layout  : wiki
title   : Type Assignment for Readability and Safe
summary : 
date    : 2024-01-15 20:54:32 +0900
updated : 2024-01-15 21:15:24 +0900
tag     : kotlin 
toc     : true
comment : true
public  : true
parent  : [[/kotlin]]
latex   : true
---
* TOC
{:toc}

## Type Assignment for Readability and Safe

변수 타입이 명확하지 않은 경우 확실하게 지정해야 한다.

```kotlin
val count = 10 // Good
val name = "Flex" // Good
val data = findData() // Bad
val result: Money = findBalance() // Good
```

타입을 숨기고 있는 경우 가독성을 떨어뜨린다. 가독성을 위해 코드를 설계할 때, 읽는 사람에게 중요한 정보를 숨겨서는 안된다.
가독성 향상 이외에 안전을 위해서도 타입을 지정하는 것이 좋다.

## References

- Effective Kotlin / Marcin Moskala 저 / 인사이트