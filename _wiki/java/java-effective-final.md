---
layout  : wiki
title   : Effective Final with Lambda Capturing
summary : 
date    : 2023-08-20 11:28:32 +0900
updated : 2023-08-20 12:15:24 +0900
tag     : java kotlin
toc     : true
comment : true
public  : true
parent  : [[/java]]
latex   : true
---
* TOC
{:toc}

## Lambda Capturing

Lambda Capturing 은 람다 바디 외부에 선언된 변수를 람다 바디 내부에서 사용하는 것을 의미한다.
이때 제약조건이 있는데 변수가 __final__ 이거나 __Effective Final__ (사실상 final 로 간주되는 변수) 이어야 한다. 그렇지 않을 경우
concurrency 문제가 생길 수 있어서 컴파일러가 알려준다. (Variable used in lambda expression should be final or effectively final)

```java
int count = 1;

// 람다는 람다를 선언한 메서드의 Scope 와 람다 바디의 Scope 가 동일하다.
IntConsumer printInt = (i) -> {
    /**
     * int count = 2; 선언 불가능
     * Variable 'count' is already defined in the scope
     */
    System.out.println(count);
};
```





