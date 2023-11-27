---
layout  : wiki
title   : Generation Based Design of Garbage Collection
summary : Weak Generational Hypothesis
date    : 2023-11-21 11:28:32 +0900
updated : 2023-11-21 12:15:24 +0900
tag     : gc java kotlin
toc     : true
comment : true
public  : true
parent  : [[/java]]
latex   : true
---
* TOC
{:toc}

## Generation Based Design

세대 기반 디자인(generation based design)이 도입된 이유는 다음과 같다.

```java
sum = new BigDecimal(0);
for (StockPrice sp: prices.values()) {
  BigDecimal diff = sp.getClosingPrice().subtract(averagePrice);
  diff = diff.multiply(diff);
  sum = sum.add(diff);
}
```

객체에서 연산이 수행될 때 신규 객체가 생성된다. (그리고 보통 이전 값을 가진 이전 객체는 폐기 된다.) 간단한 루프로 일년치의 주식을 계산할 때, 중간 값을 저장하려면, 이 루프에서만 750 개의 BigDecimal 객체가 생성된다.
이 객체들은 루프가 다음 번 반복될 때 폐기된다. 이렇게 매우 적은 양의 코드에서 많은 객체들이 매우 빠르게 생성되고 폐기된다.

이런 형태의 동작은 자바에서 아주 흔하며 __가비지 컬렉터는 많은 객체들이 일시적으로 사용된다는 사실을 이용해서 설계됐다.__ 이로 인해 __제너레이션 기반 디자인(Generation Based Design)__ 이 도입되었다.

- 객체는 먼저 Young Generation 에 할당된다.
- Young Generation 이 가득차면 더이상 사용되지 않는 객체는 폐기되고 여전히 사용 중인 객체는 어딘가로 옮겨져야 하는데 이를 Minor GC 라고 부른다.

이 설계는 성능상 두 가지 이점이 있다.

1. 먼저 영 제너레이션은 전체 힙의 일부분일 뿐이므로 이와 같이 처리하면 전체 힙을 처리하는 것보다 빠르다. 즉, 애플리케이션 중단 시간이 더 짧아진다는 뜻이다. 대신 더 자주 중지된다. 하지만 더 자주 중지되더라도 대체로 짧게 처리되는 편이 더 이익이다.
2. 객체는 에덴에 할당된다. GC 가 수집되는 동안 영 제너레이션이 비워진다면 에덴 내의 모든 객체는 이동되거나 폐기된다. 살아있는 객체는 전부 다른 서바이버 스페이스나 올드 제너레이션으로 이동된다. 모든 객체가 이동됐으므로 영 제너레이션은 압축된다.

모든 GC 알고리즘은 __영 제너레이션에서 수집하는 동안 모든 애플리케이션 스레드를 중단__ 시킨다. 즉, Minor GC 가 발생하면 __[Stop The World](https://baekjungho.github.io/wiki/java/java-garbage-collection/#stop-the-world)__ 가 발생한다는 것이다.

영 제너레이션(young generation) 에서의 수집(Minor GC) 는 Full GC 보다 자주 발생하더라도 애플리케이션 중단 시간이 더 적기 때문에 이득이다. 

### Weak Generational Hypothesis

Garbage collector 는 두 가지 전제조건을 기반으로 한다.

__약한 세대별 가설(Weak Generational Hypothesis)__:
- 대부분의 객체는 금방 접근 불가능 상태(unreachable)가 된다.
- 오래된 객체에서 젊은 객체로의 참조는 아주 적게 존재한다.

결론은 장수 객체와 단명 객체를 완전히 떼어놓는게 가장 좋다는 것이다. 이러한 전제조건을 기반으로 물리적 공간을 두 개로 나눴는데, Young Generation 과 Old Generation 이다.

늙은 객체가 젋은 객체를 참조하고 있을 수도 있는데, 이를 __카드 테이블(card-table)__ 이라는 자료 구조에 저장해둔다.
이 카드 테이블에서 각 원소는 Old Generation 공간의 512 byte 영역을 가리킨다.

핵심 로직은 다음과 같다. 늙은 객체 `o` 에 있는 참조형 필드 값이 바뀌면 `o` 에 해당하는 instanceOop 가 들어 있는 카드를 찾아 해당 엔트리를 __Drity Marking__ 한다.
HotSpot 은 레퍼런스 필드를 업데이트할 때마다 단순 __쓰기 배리어(write barrier)__ 를 이용한다.

```
// 0 으로 설정하는 것이 Dirty 하다고 표시하는 것이다.
// 카드 테이블이 512 바이트라서 9비트 우측으로 시프트한다.
cards[*instanceOop >> 9] = 0;
```

> 쓰기 배리어(write barrier)란 늙은 객체와 젋은 객체의 관계가 맺어지면 카드 테이블 엔트리를 더티 값으로 세팅하고, 반대로 관계가 해제되면 더티 값을 지우는, 실행 엔진에 포함된 작은 코드 조각을 의미한다.

## References

- Optimizing Java / Benjamin Evans, James Gough, Chris Newland / O'REILLY
- Java Performance: The Definitive Guide / Scott Oaks / O'REILLY
- The Garbage Collection Handbook / Richard Jones, Antony Hosking, Eliot Moss / Chapman and Hall/CRC