---
layout  : wiki
title   : AI-Driven Modern Test Driven Development
summary : 
date    : 2024-11-22 10:08:32 +0900
updated : 2024-11-22 10:15:24 +0900
tag     : tdd test ai
toc     : true
comment : true
public  : true
parent  : [[/tdd]]
latex   : true
---
* TOC
{:toc}

## AI-Driven Modern Test Driven Development

![](/resource/wiki/tdd-ai/tdd-meaning.png)

___[Kent Beck said "Immediate feedback for interface design decisions"](https://tidyfirst.substack.com/p/tdd-isnt-design)___

![](/resource/wiki/tdd-interface-design-decisions/tdd-offers.png)

TDD 를 통해서 <mark><em><strong>Immediate feedback for interface design decisions</strong></em></mark> 를 경험해봤다. 
하지만, 아직도 TDD 는 어렵고, 익숙하지 않아서 그런지 현업에서 사용하길 주저하게 된다.

![](/resource/wiki/tdd-ai/banking-exercise.png)

위 예제를 통해 TDD 를 연습하던 찰나, AI 가 있는데 TDD 랑 같이 사용할 순 없을까? 라는 생각을 하게 된다.

그래서 아래와 같은 ___AI-Driven Cycle___ 을 세워봤다.

__AI-Driven Cycle__:
```
1. 요구사항 구체화 (requirements)
2. 설계 (design)
3. 명확한 Prompt 가 반영된, AI 기반의 실패하는 테스트 코드 작성 (fail test)
   Write a test for a program that transfers money between accounts. 
   Scenarios: 
     - Successful transfer with sufficient balance.
     - Transfer failure due to insufficient balance.
     - Data consistency when two transfers are made simultaneously.
4. AI 가 생성한 테스트 코드의 논리 검증
5. 테스트를 통과하기 위한 Production Code 작성
6. 테스트 통과
7. 리팩토링
```

## Links

- [Experience report: Test-driven development intensive, by Jason Gorman](https://alvarogarcia7.github.io/blog/2015/04/12/jason-gorman-tdd-intensive-workshop/)
- [Test Driven Development](https://github.com/testdouble/contributing-tests/wiki/Test-Driven-Development)