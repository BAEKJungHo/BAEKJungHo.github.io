---
layout  : wiki
title   : Software Development Methodology
summary : 
date    : 2022-04-18 19:54:32 +0900
updated : 2022-04-18 21:15:24 +0900
tag     : methodology
toc     : true
comment : true
public  : true
parent  : [[/methodology]]
latex   : true
---
* TOC
{:toc}

# Software Development Methodology

## Test Code Is Required ?

> 대부분의 경우 테스트 가능한 애플리케이션을 목표로 할 경우 훌륭한 애플리케이션 코드를 작성하게 된다.   - Rod Johnson

## Testing Motivators

- __Validate the System__
- __Code Coverage__
- __Enable Refactoring__
- __Document the Behavior of the System__

테스트 코드가 잘 작성된 프로그램은 리팩토링이 쉽다. 테스트 코드가 작성되지 않은 상태에서 새로운 기능을 추가하거나 리팩토링을 해야하는 경우 내가 작성/변경한 코드가 Side Effect 없이 잘 작성된 코드인지 어떻게 검증할 것인가?

__테스트 코드가 해결해 준다.__

## Good Test is ?

- __Atomic__
  - Atomic 의 기준은 Scenario 일 수도 있고, Method 일 수도 있고, Behavior 일 수도 있다. Atomic 의 기준은 목적(purpose)에 따라 달라진다. 
- __Isolated__
  - 다른 테스트로부터 독립 되어있어야 하며, 다른 테스트에 영향을 주어서는 안된다.

# [Extreme Programming](https://baekjungho.github.io/wiki/driven/extreme-programming)

# TDD

![](/resource/wiki/test-methodology/tdd.png)

테스트 주도 개발(TDD)은 테스트를 작성하여 소프트웨어를 구축하는 기술이다. 1990년대 후반에 Extreme Programming 의 일부로 Kent Beck 에 의해 개발되었다. 

In essence you follow three simple steps repeatedly:

- __[RED]__ Write a test for the next bit of functionality you want to add.
- __[GREEN]__ Write the functional code until the test passes.
- __[REFACTOR]__ Refactor both new and old code to make it well structured.

TDD 는 시스템 기능을 구축하면서 한 번에 한 테스트씩 이 세 단계를 계속 반복하는 프로세스이다.

## Unit Test

Unit Test 는 특정 단위(테스트 대상)가 의도한대로 작동하는지 검증하는 것을 말한다.

![](/resource/wiki/test-methodology/unittest.png)

## Sociable and Solitary

- 단위 테스트 작성 시 관계를 맺고있는 대상(협력 객체)이 있는 경우를 고려해야 함
- 협력 객체를 실제 객체로 사용하는지 Mock 객체로 사용하는지에 따라 테스트 구현이 달라짐

> 단위의 정의를 논하기 앞서 테스트하는 단위가 통합(Sociable)되어야 하는지 고립(Solitary)되어야 하는지 먼저 고려해야 한다.

## Test Double

- 테스트 목적으로 실제 객체 대신 사용되는 모든 종류의 척도 객체에 대한 일반 용어
- 실제 (예 : 클래스, 모듈 또는 함수)를 가짜 버전으로 대체한다는 의미
- 가짜 버전은 실제와 같은 것처럼 보이고 (동일한 메서드 호출에 대한 답변) 단위 테스트 시작 시 스스로 정의한 미리 준비된 답변으로 응답함
- Test Double 에는 여러 종류가 있지만 대체 한다는 큰 의미에서는 같다고 할 수 있음

![](/resource/wiki/test-methodology/testdouble.png)

> 테스트 더블은 크게 Dummy, Fake, Stub, Spy, Mock 으로 나눈다.

### Dummy

> 인스턴스화된 객체가 필요해서 구현한 가짜 객체일 뿐이고, 생성된 Dummy 객체는 정상적인 동작을 보장하지 않음

- 가장 기본적인 테스트 더블
- 인스턴스화 된 객체가 필요하지만 기능은 필요하지 않은 경우에 사용
- Dummy 객체의 메서드가 호출되었을 때 정상 동작은 보장하지 않음
- 객체는 전달되지만 사용되지 않는 객체

```kotln
interface AService {
  fun print()
}
class AServiceDummy(): AService {
  override fun print() {
    // nothing to do 
  }
}
```

특정 테스트에 대해서 해당 구현체의 동작이 필요하지 않을 수 있다. 이처럼 동작하지 않아도 테스트에는 영향을 미치지 않는 객체를 Dummy 객체라고 한다.

### Fake 

> 동작은 하지만 실제 사용되는 객체처럼 정교하게 동작하지는 않는 객체를 의미

- 복잡한 로직이나 객체 내부에서 필요로 하는 다른 외부 객체들의 동작을 단순화하여 구현한 객체
- 동작의 구현을 가지고 있지만 실제 프로덕션에는 적합하지 않은 객체
- [InMemoryTestDatabase](https://martinfowler.com/bliki/InMemoryTestDatabase.html)

### Stub

> 테스트에서 호출된 요청에 대해 미리 준비해둔 결과를 제공

- Dummy 객체가 실제로 동작한느 것 처럼 보이게 만들어 놓은 객체
- 인터페이스 또는 기본 클래스가 최소한으로 구현된 상태
- 테스트에서 호출된 요청에 대해 미리 준비해둔 결과를 제공
  - Mockito Framework 도 Stub 과 같은 역할을 제공함
- 테스트를 위해 의도한 결과만 반환되도록 하기 위한 객체

### Spy

> 실제 객체로도 사용할 수 있고 Stub 객체로도 활용할 수 있으며 필요한 경우 특정 메서드가 제대로 호출되었는지 여부를 확인할 수 있음

- Stub 의 역할을 가지면서 호출된 내용에 대해 약간의 정보를 기록한다.
- 테스트 더블로 구현된 객체에 자기 자신이 호출되었을 때 확인이 필요한 부분을 기록하도록 구현한다.
- 실제 객체처럼 동작시킬 수도 있고, 필요한 부분에 대해서는 Stub 을 만들어서 동작을 지정할 수도 있다.
  - Mockito 프레임워크의 verify() 메서드가 같은 역할을 함

### Mock

> 호출에 대한 기대를 명세하고 내용에 따라 동작하도록 프로그래밍 된 객체

## Inside Out, Outside In

### Inside Out

- 처음부터 도메인 모델에 주의를 집중
- 도메인 로직이 UI 에 의존하지 않도록 함
- 도메인 객체 구현 후 일단 동작하면 그 위에 UI를 적용하는 순서로 진행
- 이렇게 하면 Mock 객체를 사용할 필요가 없어짐
- 무조건 사용하지 않는다는 것이 아니라 사용 빈도가 낮아짐

### Outside In

- 테스트 대상의 외부 인터페이스를 설계하는 것부터 시작
- 계층적 시스템에서도 적용 가능
- 레이어 별로 테스트를 작성하고, 단계적으로 한번에 하나의 레이어에 대해 진행
- OO와 TDD 가 익숙하지 않은 사람들에게 가이드할 때 도움이 된다고 생각됨
- 도메인에 대한 이해도가 높지 않은 상태에서 진행이 가능

### 어떤 기준으로 선택해야 할까?

> 사실은 상향식, 하향식 둘 다 TDD 의 프로세스를 효과적으로 설명해 줄 수 없다. ... 만약 어떤 방향성을 가질 필요가 있다면 '아는 것에서 모르는 것으로(known-to-unknown)' 방향이 유용할 것이다. 우리가 어느 정도의 지식과 경험을 가지고 시작한다는 점, 개발하는 중에 새로운 것을 배우게 될 것임을 예상한다는 점 등을 암시한다.
>
> Test-Driven Development, kent beck

- 컨트롤러를 먼저 만들것인지 도메인 모델을 먼저 만들것인지는 정답이 없음
- 인수 테스트로 인해서 우리는 어떤 컨트롤러가 나와야 하는지 알고 있으므로 컨트롤러를 먼저 작성해도 좋고
도메인 모델의 기능 정의가 나와있는 상황에서 도메인을 먼저 작성해도 좋다.

# ATDD

![](/resource/wiki/test-methodology/atddcycle.png)

## ATDD 란

- 원래는 다양한 관점을 가진 팀원(기획, 개발, 테스트 등)들과 협업을 위한 애자일 방법 중 하나
- 다른 관점에서 원활한 커뮤니케이션 없이 논의를 한다면 서로 다른 결과물을 상상하여 작업을 진행할 수 있음
- 따라서 프로덕트 결과물이 나오는 시점에서야 이해하고 있던 내용이 다름을 인지하게 되는 경우 발생
- ATDD 는 이러한 리스크를 사전에 방지하고자 기획 단계부터 인수 테스트를 통해 공통의 이해를 도모하여 프로젝트를 진행

## TDD vs ATDD

- TDD 는 개발자 영역을 다루며 시스템을 구성하는 유닛이나 모듈을 테스트 함
- TDD 설계 이슈는 특정 모듈이나 클래스가 인수 테스트 전체 또는 일부분을 통과할 수 있도록 책임을 할당
- TDD 와 ATDD 는 동일한 품질 목표를 갖고, 서로 상호 관계에 있다.
- 궁극적으로 TDD를 통해 특정 모듈이나 클래스를 담당하고 이 들이 모여 인수 테스트 전체 또는 일부분을 통과할 수 있도록 책임을 할당

## 인수 테스트의 중요성

테스트 가능한 요구사항은 인수 테스트(acceptance test)에 꼭 필요한 사항이다. 인수 테스트가 개발 방향을 정하기 때문이다. ATDD 에서 양질의 제품을 생산하기 위해서는 실제 테스트를 할 수 있을 만큼의 명확한 요구사항이 있어야 한다.

- 고객은 인수 테스트를 이해하고 구체화한다.
- 구현은 변할 수 있어도 인수 테스트는 변경되지 않는다.

## Acceptance Criteria

> 인수 기준(Acceptance Criteria)은 구체화 되지 않은 일반적인 인수 조건을 의미한다.

예를 들어, '속도를 내는 가속기, 최고 속도, 분명히 빨라야 한다' 같은 조건을 의미한다.

## Acceptance Test 

> 인수 테스트(Acceptance Test)는 인수를 하기 위한 특정 조건을 의미한다.

예를 들어, '4.5 초 이내에 60 마일 까지 속도를 내야 한다' 등이 될 수 있다.

- 사용자의 관점에서 올바르게 작동하는지 테스트
- __UserStory 에서 Scenario 를 도출하고 요구사항들을 테스트 하여, 사용자 관점에서 올바르게 작동하는지 테스트__
- 인수 조건은 기술(개발) 용어가 사용되지 않고 일반 사용자들이 이해할 수 있는 단어를 사용
- 클라이언트가 의뢰했던 소프트웨어를 인수 받을 때, 미리 전달했던 요구사항이 충족되었는지를 확인하는 테스트
- 인수 테스트는 소프트웨어가 기능적으로 어떤일을 해야 하는지 알려주고 확실하고 믿을 만한 원천
- 사용자 인수 테스트, 애자일에서의 인수 테스트 등
- __자동화 된 테스트__
  - 인수 테스트는 수동으로도 가능하지만, 자동화되면 새로운 시스템 변경 사항이 이미 구현된 요구사항에 영향을 미치지 않는지를 확인하는 `회귀 테스트`로도 사용할 수 있음
  - 회귀 테스트가 가능한 이유가 뭘까?
    - 보통 UserStory -> Scenario 를 만들고 테스트를 함
    - __중요한 것은 Test Code 가 최대한 Production Code 와 결합하지 않도록 하는 것이 중요__
- __시나리오 기반 테스트__
  - 도메인이나 기술에 대한 배경 지식이 없어도 이해할 수 있음
  - 요구사항을 명확하게 이해할 수 있음
- __Black Box Test__
  - 인수 테스트는 Black Box 테스트 형식이다.
  - 세부 구현에 영향을 받지 않게 구현하기
  > 인수 테스트는 블랙 박스 테스트의 성격을 가지는게 좋다. 시스템 내부 코드를 가능한 직접 호출하지 말고 외부에서 요청하는 방식으로 검증하는 것을 추천

```
Feature : 테스트에 대상의 기능/책임을 명시한다.

Scenario : 테스트 목적에 대한 상황을 설명한다.
  Given : 시나리오 진행에 필요한 값을 설정한다.
  When : 시나리오를 진행하는데 필요한 조건을 명시한다.
  Then : 시나리오를 완료했을 때 보장해야 하는 결과를 명시한다.
```

## User Story

```
“As a <user or stakeholder type>
I want <some software feature>
So that <some business value>”
```

- [User Stories and User Story Examples by Mike Cohn](https://www.mountaingoatsoftware.com/agile/user-stories)
- [User Story Template Advantages](https://www.mountaingoatsoftware.com/blog/advantages-of-the-as-a-user-i-want-user-story-template)
- [올바른 유저 스토리 작성을 위한 엔지니어링 가이드](https://wholeman.dev/posts/guide-to-writing-correct-user-stories/)
- [“As a, I want, So that” Considered Harmful](https://blog.crisp.se/2014/09/25/david-evans/as-a-i-want-so-that-considered-harmful)

### 스토리 포인트 추정

- [What are story points and how do you estimate them?](https://www.atlassian.com/agile/project-management/estimation)
- Planning Poker : <https://github.com/ahastudio/til/blob/main/agile/planning-poker.md>

### Xper 위키의 사용자 스토리 사례

[Xper:Xper Wiki Tests](https://web.archive.org/web/20061012054901/http://xper.org/wiki/xp/XperWikiTests)

## ATDD 개발 프로세스

- 인수 조건 정의
- 인수 테스트 작성
- 문서화
- 기능 구현
- 테스트 리팩터링

## ATDD + TDD Cycle

![](/resource/wiki/test-methodology/tddcycle.png)

## ATDD Example

- __인수 조건__
  - 인수 테스트가 충족해야하는 조건
  - 인수 조건을 표현하는 여러가지 포맷이 있음
    - 시나리오 기반 표현 방식
    - Given-When-Then

> [Acceptance Criteria: Purposes, Formats, and Best Practices](https://www.altexsoft.com/blog/business/acceptance-criteria-purposes-formats-and-best-practices/)

```java
Feature: 최단 경로 구하기

  Scenario: 지하철 최단 경로 조회
    Given 지하철역들이 등록되어 있다.
    And 지하철노선이 등록되어 있다.
    And 지하철노선에 지하철역들이 등록되어 있다.
    When 사용자는 출발역과 도착역의 최단 경로 조회를 요청한다.
    Then 사용자는 최단 경로의 역 정보를 응답받는다.
```

```
Feature: 지하철 노선 관리 기능

  Scenario: 지하철 노선 생성
    When 지하철 노선 생성을 요청 하면
    Then 지하철 노선 생성이 성공한다.
    
  ...
```

```java 
/**
 * When 지하철 노선 생성을 요청 하면
 * Then 지하철 노선 생성이 성공한다.
 */
@DisplayName("지하철 노선 생성")
@Test
void createLine() {
}
```

> [Cucumber Gherkin Syntax](https://cucumber.io/docs/gherkin/)

### 문서화

- Spring Rest Docs 를 활용하여 API 문서화
- 문서화를 위해서는 Mock 서버 & DTO 정의가 필요
- 프론트엔드, 다른 백엔드 개발자와 병렬로 작업하는데 유리함
- 인수 테스트와는 별개로 API 테스트를 수행
- 다른 개발자들과 협업 시 커뮤니케이션에 큰 장점

## 문서 자동화와 테스트

### Spring Rest Docs vs Swagger

- __Spring REST Docs__
  - 코드의 추가 및 수정이 없다.
  - 테스트 코드 작성이 필요하며, 테스트 성공 시 문서가 생성된다.
  - Spring Rest Doc 는 테스트 코드에 설정(및 작성)하여 프로덕션 코드에 영향이 적음
    - 버전 변화에 유연하고 정확성이 높다.
- __Swagger__
  - 코드에 어노테이션등을 추가해야 한다.
  - 테스트 코드 없이 서비스 쪽 코드 및 어노테이션 추가로 문서를 생성할 수 있다.
  - 버전 변화에 맞춰 재 작성해야 하며 이를 하지 않을 때 정확성이 낮다.
  - Swagger 는 API call 하여 테스트하는 기능에 특화
  - 비개발직군 입장에서 Swagger 보다는 Spring Rest Docs 가 가독성이 좋다고 함
  - Swagger 는 (상대적으로) 기능이 많은 반면에 Spring Rest Docs 는 단순히 문서임
  - Swagger 사용 시 불필요한 프로덕션 코드 오염이 발염
  - Swagger 의 api call 기능은 intellij(local) 에서 Http Request 하는 기능을 사용하여 대체함

### 개발 전 문서화 장점

- __병렬 작업이 가능__
  - 백엔드 개발자간 병렬 작업
  - 백엔드 & 프론트엔드 개발자간 병렬 작업
- __특히 백엔드 & 프론트엔드 병렬 작업 시 유용함__
  - 커뮤니케이션 비용 줄일 수 있음
  - 동작하는 Mock API 생성
- __문서화 테스트 자체가 API 테스트__
  - 문서화 테스트 자체가 API 테스트가 되기 때문에 따로 컨트롤러 테스트를 만들 필요 없음

## Links

- [Acceptance Test Driven Development](https://mysoftwarequality.wordpress.com/2013/11/12/when-something-works-share-it/)
- [Test Driven Development](https://martinfowler.com/bliki/TestDrivenDevelopment.html)
- [Unit Test](https://martinfowler.com/bliki/UnitTest.html)
- [Extreme Programming](https://martinfowler.com/bliki/ExtremeProgramming.html)
- [Mocks Aren't Stubs](https://martinfowler.com/articles/mocksArentStubs.html)
- [Test Double](https://martinfowler.com/bliki/TestDouble.html)
- [Test Double By Tecoble](https://tecoble.techcourse.co.kr/post/2020-09-19-what-is-test-double/)
- [Asciidoctor](https://docs.asciidoctor.org/asciidoc/latest/)

## References

- Extreme Programming / Kent Beck / 인사이트
- Extreme Programming Installed / Ron Jeffries, Ann Anderson, Chet Handrickson 공저 / 인사이트
- 린 애자일 기법을 활용한 테스트 주도 개발 / Kenneth Pugh 저 / 에이콘