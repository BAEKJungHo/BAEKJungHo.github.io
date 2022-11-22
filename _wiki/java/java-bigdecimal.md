---
layout  : wiki
title   : BigDecimal
summary : 
date    : 2022-11-12 11:28:32 +0900
updated : 2022-11-12 12:15:24 +0900
tag     : java
toc     : true
comment : true
public  : true
parent  : [[/java]]
latex   : true
---
* TOC
{:toc}

## IEEE 754

자바의 float 과 Double 은 값의 정확성을 보장할 수 없다. 그 이유는 자바는 IEEE 754 부동소수점 방식을 사용하기 때문에 정확한 실수를 저장하지 않고 근사치 값을 저장한다. 

```kotlin
val a = 100.0000000008
val b = 10.0000000007
assertThat(a - b).isEqualTo(90.0000000001) // Error. Expecting 90.0000000009999
```

따라서, 금융권 처럼 돈을 다루는 곳에서는 float, double 을 사용한다면 문제가 발생할 가능성이 높다.

따라서, 부동소수점 방식이 아닌 정수를 이용해 실수를 표현하는 `BigDecimal` 클래스를 사용하면 된다.

### Limit of Precision

float 과 double 은 정밀도에 제한이 있다. 그 이유는 부동소수점 표기 방식으로 저장되기 때문인데, 부동소수점이 표현할 수 있는 범위가 제한적이기 때문이다.

![](/resource/wiki/java-bigdecimal/float.png)

![](/resource/wiki/java-bigdecimal/double.png)

실수를 메모리에 표현하는 방법은 가수부, 지수부를 각각 필드에 맞게 할당하면 된다.

저장할 수 있는 공간을 늘려 정밀도를 높이지 않은 이유:
- 한정된 메모리를 최대한 효율적이게 사용하기 위해 자료형 공간을 한정

오차가 없는 계산이 필요한 경우:
- 오차가 없는 계산이 필요할 땐 라이브러리를 사용하거나 소수점 자리수만큼 10을 곱해 정수로 만든 다음 계산하는 방법을 사용

## BigDecimal

- BigDecimal 은 변경할 수 없으며 (= immutable 하며) 임의의 정밀도와 부호를 가진 십진수이다.
- BigDecimal 은 불변 객체이기 때문에 연산 결과는 기존의 객체의 값을 변화시키지 않고, 새로운 객체를 반환한다.

BigDecimal 는 다음과 같이 표현이 가능하다:
- __unscaledValue × 10^-scale__
  - unscaledValue : 임의의 유효자리 정수 값 
  - scale : 소수점 오른쪽의 자릿수를 나타내는 32비트 정수 
  - e.g BigDecimal 3.14는 unscaledValue 314, scale 2이다.

```java
public class BigDecimal extends Number implements Comparable<BigDecimal> {

    private final BigInteger intVal;
    private final int scale;
    private transient int precision;
    private transient String stringCache;
    private final transient long intCompact;
    private static final int MAX_COMPACT_DIGITS = 18;
    ...
}
```

- intVal: 정수로 표현된 BigDecimal 의 값 (= unscaledValue)
- scale: 0 또는 양수인 경우 소수점 오른쪽의 자리 수, 음수일 경우 스케일 되지 않은 숫자 값에 10을 스케일 부정의 거듭 제곱
- precision: unscaledValue 의 자리 수
- stringCache: Used to store the canonical string representation, if computed.
- intCompact: BigDecimal 의 길이("." 포함)가 18자리 이하일 땐, intVal 에 값을 따로 저장하지 않고 intCompact 에 정수 값을 저장

### How to use

- __문자열로 숫자를 표현하여 사용__

```java
BigDecimal number = new BigDecimal("123.45"); 
```

문자열이 아닌 double 타입으로 전달할 경우 이진수의 근사치를 가지게 되어 오차가 발생할 수 있다.

### Compare

- [Java BigDecimal Zero - Baeldung](https://www.baeldung.com/java-bigdecimal-zero)
  - CompareTo: Two BigDecimal objects that are equal in value but have a different scale (like 2.0 and 2.00) are considered equal by this method.

## Links

- [BigDecimal Docs](https://docs.oracle.com/javase/8/docs/api/java/math/BigDecimal.html)
- [BigDecimal](https://github.com/Stacked-Book/java-deep-study/blob/main/java/1%EC%A3%BC%EC%B0%A8/BigDecimal.md)
- [BigDecimal 에 관한 고찰](https://velog.io/@new_wisdom/Java-BigDecimal%EA%B3%BC-%ED%95%A8%EA%BB%98%ED%95%98%EB%8A%94-%EC%95%84%EB%A7%88%EC%B0%8C%EC%9D%98-%EB%84%88%EB%93%9C%EC%A7%93)
- [float 과 double 의 소수점 표현](https://bigpel66.oopy.io/library/c/chewing-c/4)

