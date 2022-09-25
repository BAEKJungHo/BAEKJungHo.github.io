---
layout  : wiki
title   : Utility Class in Kotlin
summary : 코틀린에서의 유틸 클래스
date    : 2022-09-19 20:54:32 +0900
updated : 2022-09-19 21:15:24 +0900
tag     : kotlin
toc     : true
comment : true
public  : true
parent  : [[/kotlin]]
latex   : true
---
* TOC
{:toc}

## Java 에서의 Utility Class

- __Constraint__
  - 아무 인스턴스를 갖지 않음
  - 비공개 생성자로 인스턴스 생성을 막음
  - final 키워드로 상속을 못하게 막음
  - static method 를 모아두는 역할을 담당

```java
public final class JavaUtility {
    private JavaUtility() {}
    
    public static String getMethodName() {
        // ...
    }
}
```

이러한 패턴은 코틀린에서 권장되지 않는다.

## Kotlin 에서의 Utility Class

코틀린에서는 최상위 선언을 패키지 안에 함게 모아둘 수 있기 때문에 불필요한 유틸리티 클래스를 선언할 필요가 없다.

예를 들어 날짜 관련 유틸리티가 필요한 경우 DateTimeUtils 라는 파일을 하나 만들고 최상위 선언 함수를 통해 기능을 제공할 수 있다.

## 참고 문헌

- 코틀린 완벽 가이드 / Aleksei Sedunov 저 / 길벗