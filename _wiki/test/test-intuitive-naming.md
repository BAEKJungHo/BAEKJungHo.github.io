---
layout  : wiki
title   : Intuitive Naming
summary : 
date    : 2024-07-26 20:28:32 +0900
updated : 2024-07-26 21:15:24 +0900
tag     : test
toc     : true
comment : true
public  : true
parent  : [[/test]]
latex   : true
---
* TOC
{:toc}

## Intuitive Naming

코드를 작성할 때, __직관적인 이름__ 을 사용하는 것은 가독성을 높이는데 중요하다.

단위 테스트를 작성할 때 아래와 같은 명명법을 사용할 수 있다.

- 테스트 대상 메서드_시나리오_예상 결과
- doingSomeOperationGeneratesSomeResult(어떤 동작을 하면 어떤 결과가 나온다.)
- someResultOccursUnderSomeCondition(어떤 결과는 어떤 조건에서 발생한다.)
- BDD(Behavior-Driven Development) 에서 말하는 Given-When-Then 양식
  - givenSomeContextWhenDoingSomeBehaviorThenSomeResultOccurs(주어진 조건에서 어떤 일을 하면 어떤 결과가 나온다.)
  - 너무 길면 givenSomeContext 부분 제거: whenDoingSomeBehaviorThenSomeResultOccurs(어떤 일을 하면 어떤 결과가 나온다.)
  - 이것은 doingSomeOperationGeneratesSomeResult 와 일치한다.

직관적인 이름을 짓는데 참고할 만한 지침으로는 아래와 같다.

- 엄격한 명명 정책 따르지 않고, 표현의 자유를 인정하기. 복잡한 동작에 대한 높은 수준의 설명을 표현하기 위해서는 개발자들의 표현의 자유를 인정해야 한다.
- 문제 도메인에 익숙한 비개발자들(e.g 도메인 전문가나 비지니스 분석가)에게 시나리오를 설명하는 것 처럼 테스트 이름을 짓자
