---
layout  : wiki
title   : Why use mock any ?
summary : 
date    : 2024-01-11 15:54:32 +0900
updated : 2024-01-11 20:15:24 +0900
tag     : tdd test
toc     : true
comment : true
public  : true
parent  : [[/tdd]]
latex   : true
---
* TOC
{:toc}

## Why use mock any ?

정확하게 일치하는 값으로 모의 객체를 설정하면 작은 변화에도 테스트가 깨진다.

```java
@Test
void weakPassword() {
  // 정확하게 일치하는 값으로 모의 객체를 설정하면 작은 변화에도 테스트가 깨진다.
  BDDMockito.given(mockPasswordChecker.checkPasswordWeak("pw"))
}
```