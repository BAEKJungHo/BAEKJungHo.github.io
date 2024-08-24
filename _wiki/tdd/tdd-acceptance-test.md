---
layout  : wiki
title   : Functional testing of a user story
summary : Acceptance testing is user's perspective test
date    : 2024-08-24 15:54:32 +0900
updated : 2024-08-24 20:15:24 +0900
tag     : tdd test
toc     : true
comment : true
public  : true
parent  : [[/tdd]]
latex   : true
---
* TOC
{:toc}

## Acceptance Testing - Functional testing of a user story

___[The Fundamental Test-Driven Development Cycle](https://baekjungho.github.io/wiki/tdd/tdd-red-green-refactor/)___ 에서 ___[Acceptance Test](https://en.wikipedia.org/wiki/Acceptance_testing)___ 는 TDD Cycle 과 통합될 수 있다.

![](/resource/wiki/tdd-acceptance-test/inner-and-outer-feedback.png)

___[Factory Acceptance Test](https://archive.md/20130204215825/http://www.tuv.com/en/corporate/business_customers/materials_testing_and_inspection/supply_chain_services/factory_acceptance_test/factory_acceptance_test.jsp#selection-887.0-887.266)___ is Prior to delivery or final installation, ___clients want to make sure that equipment operates as intended without disturbances occurring on site___. In achieving this, clients are therefore able to verify that all specifications and contractual requirements have been met.

Extreme Programming 에서는 클라이언트와 개발자간의 원활한 소통과 명확한 요구사항 이해를 위해 ___User Story___ 를 기반으로 한다. 그렇기 때문에 Extreme Programming 에서는 인수 테스트를 아래와 같이 소개하고 있다.

![](/resource/wiki/tdd-acceptance-test/extreme-programming.png)

Acceptance testing is <mark><em><strong>Functional testing of a user story</strong></em></mark> by the software development team during the implementation phase.

___[Practical Test Pyramid](https://martinfowler.com/articles/practical-test-pyramid.html#acceptance)___ 에서는 Acceptance Test 를 아래와 같이 소개하고 있다.

At one point you should make sure to test that your software works correctly from a <mark><em><strong>user's perspective</strong></em></mark>, not just from a technical perspective.

__[Lean-Agile Acceptance Test-Driven Development: Better Software Through Collaboration](https://www.amazon.com/Lean-Agile-Acceptance-Test-Driven-Development-Collaboration/dp/0321714083)__:

> 인수 테스트의 개념은 테스트 의도에 따라 정해지는 것이 테스트를 어떻게 구현하는지에 따라 정해지는 것은 아니다. 유닛 레벨, 통합 레벨, 사용자 인터페이스 레벨에서 인수 테스트를 적용할 수 있다.

__[The Importance of End-to-End Testing: A Horror Story](https://www.amazon.com/Growing-Object-Oriented-Software-Guided-Tests/dp/0321503627)__:

> Nat was once brought onto a project that had been using TDD since its inception. The team had been writing acceptance tests to capture requirements and show progress to their customer representatives. They had been writing unit tests for the classes of the system, and the internals were clean and easy to change. They had been making great progress, and the customer representatives had signed off all the implemented features on the basis of the passing acceptance tests.
>
> But the acceptance tests did not run end-to-end—they instantiated the system’s internal objects and directly invoked their methods. The application actually did nothing at all. Its entry point contained only a single comment:
> 
> // TODO implement this
> 
> Additional feedback loops, such as regular show-and-tell sessions, should have been in place and would have caught this problem.

### Tools

___[Golden Master Testing](https://baekjungho.github.io/wiki/test/test-characterization/)___ 와 같이 Integration Testing 을 하는 경우 테스트 환경을 실제 운영 환경과 유사하게 구축해야 한다. 이때 Testcontainers 를 사용한다. 인수 테스트도 비슷하게할 수 있다.

- [API Acceptance testing](https://solidstudio.io/blog/api-testing)

또한 Scenario Test 를 위해서 ___[Selenium](https://www.selenium.dev/)___ 을 사용할 수도 있다.

## Links

- [Get Reliable Usability and Avoid Risk with These Testing Scenarios](https://www.panaya.com/blog/testing/testing-scenarios/)
- [Acceptance Tests as Requirements Artifacts: An Agile Introduction](https://agilemodeling.com/artifacts/acceptanceTests.htm)
- [Best Practices for Unit Testing in Kotlin](https://phauer.com/2018/best-practices-unit-testing-kotlin/)

## References

- Lean-Agile Acceptance Test-Driven Development: Better Software Through Collaboration / Kenneth Pugh
- Growing Object-Oriented Software, Guided by Tests / Steve Freeman, Nat Pryce