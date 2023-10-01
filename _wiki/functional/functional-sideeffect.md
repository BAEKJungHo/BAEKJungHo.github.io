---
layout  : wiki
title   : Side Effect
summary : 
date    : 2023-09-27 15:02:32 +0900
updated : 2023-09-27 15:12:24 +0900
tag     : fp
toc     : true
comment : true
public  : true
parent  : [[/functional]]
latex   : true
---
* TOC
{:toc}

## Side Effect

부수 효과(side effect)란 함수에서 결괏값을 주는 것 외에 하는 모든 행동을 의미한다.

```kotlin
fun call() {
    // Do something is side effect
    return "result"
}
```