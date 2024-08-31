---
layout  : wiki
title   : Critical Thinking in the DNA of Software Engineers
summary : 
date    : 2024-08-31 11:54:32 +0900
updated : 2024-08-31 12:15:24 +0900
tag     : magazine software
toc     : true
comment : true
public  : true
parent  : [[/magazine]]
latex   : true
---
* TOC
{:toc}

## Critical Thinking in the DNA of Software Engineers

> Critical thinking the awakening of the intellect to the study of itself.

Software Engineer 에게 가장 중요한 능력은 무엇이냐 물어보면 대부분 ___문제 해결 능력(problem-solving skills)___ 이라고 할 것이다.
Software Engineer 가 갖춰야할 본질에 가까운것은 문제 해결 능력일까? 

문제를 해결하기 위한 Step 을 생각해보자. 더 세세하게 나눌 수 있지만 크게 아래와 같을 것이다.

1. __문제 정의__: 정확히 어떤 문제를 해결해야 하는지 명확히 이해하고 문제의 범위와 제약조건을 파악, 문제의 근본 원인을 파악하는 단계
2. __가설 수립__: (최적의) 해결책을 구상하는 단계
3. __구현 및 검증__: 구현 및 검증하는 단계

여기서 구현 및 검증에서 문제가 발생한 경우 1번과 2번중 어디로 가야할까? 케이스마다 다르다고 생각한다. 예를 들어 로그에서 민감 정보 마스킹을 하기 위한 기능을 구현해야 한다고 가정하자.

이때 어떤 필드를 대상으로 어떤 조건으로 마스킹할 것인지 문제 정의가 상당히 명확하고, 문제 정의 단계에서 실수를 범할 가능성이 굉장히 적다. 
문제 정의 후 해결책을 구상할때 Logback 을 활용할 것인지, 활용한다면 어떤 인터페이스를 구현할 것인지, 혹은 Utils 를 만들어서 처리할 것인지 등 다양한 해결 방법이 많다.
그리고 자신이 정의한 해결 방법을 하나씩 적용해볼 것이다. 이때 구현 및 검증 단계에서 문제가 발생하면 문제 정의로 넘어갈 필요가 없다.

이번 가정은 어떤 도메인의 문제를 해결 혹은 TroubleShooting 을 한다고 가정하자. 이 케이스는 문제 정의가 상당히 중요하다. 
문제 정의를 어떻게 하느냐에 따라서 접근 방식(해결책 구상)이 완전히 달라진다. 이 경우 구현 및 검증 단계에서 문제가 발생하면 문제 정의로 넘어가야 한다.

실제로 나는 실타래 처럼 꼬여져있는 코드 및 정책과 복잡한 도메인 다루는 서비스에서 버그가 발생하여 로그를 보면서 TroubleShooting 했을때, 문제 정의를 잘 못해서 시간을 허비해본 경험이 있다.
즉, ___버그의 근본적인 원인을 잘 못 분석___ 해서 시간을 낭비한 건이다. 하지만 이 접근 방식이 잘못되진 않았다, 문제 정의를 잘 못했다는 것을 인지하고 곧 바로 다시 문제 정의로 넘어가서 문제를 해결하였다.

두 사례를 통해 구현 및 검증 단계에서 문제가 발생했을 때 문제 정의로 돌아갈지, 가설 수립 단계로 돌아갈지 결정하는 것은 비판적 사고(Critical Thinking)를 통해 결정하게 된다.

문제 해결을 위해서는 ___문제 정의(Define Problems)___ 가 가장 중요하고, 문제 정의를 잘 하기 위해서는 <mark><em><strong>Critical Thinking</strong></em></mark> 을 잘해야 한다.

___[비판적 사고(Critical Thinking)](https://en.wikipedia.org/wiki/Critical_thinking)___ 는 정보를 객관적으로 분석하고 평가하여 합리적인(rational) 판단을 내리는 사고 과정을 말한다. 즉, <mark><em><strong>체계적이고 논리적으로 사고하는 능력</strong></em></mark> 이 Software Engineer 가 가져야할 본질(essence)이라고 생각한다.

비판적 사고를 잘하기 위한 구성 요소는 다음과 같다.

- __객관성__: 개인적 편견이나 감정에 좌우되지 않고 사실에 기반하여 판단
- __분석력__: 복잡한 정보를 체계적으로 분해하고 검토
- __평가__: 주장이나 증거의 신뢰성과 타당성을 평가
- __추론__: 주어진 정보를 바탕으로 논리적인 결론을 도출
- __개방성__: 새로운 아이디어나 관점을 수용
- __질문하기__: 당연하게 여겨지는 것에 대해서도 의문을 제기
- __메타인지__: 자신의 사고 과정을 인식하고 평가
- __문제해결__: 복잡한 문제에 대한 창의적이고 효과적인 해결책 고안

비판적 사고는 다음의 경우에서 적용될 수 있다.

- 요구사항 분석 시 숨겨진 가정이나 모순점 발견
- 다양한 설계 옵션의 장단점 평가
- 코드 리뷰 시 잠재적 문제점 식별
- 버그의 근본 원인 분석
- 새로운 기술이나 방법론 도입 시 그 적합성 평가
- 등등..

__[A well cultivated critical thinker](https://www.criticalthinking.org/pages/defining-critical-thinking/766)__:
- raises vital questions and problems, formulating them clearly and precisely;
- gathers and assesses relevant information, using abstract ideas to interpret it effectively comes to well-reasoned conclusions and solutions, testing them against relevant criteria and standards;
- thinks openmindedly within alternative systems of thought, recognizing and assessing, as need be, their assumptions, implications, and practical consequences; and
- communicates effectively with others in figuring out solutions to complex problems.

## References

- Taken from Richard Paul and Linda Elder, The Miniature Guide to Critical Thinking Concepts and Tools, Foundation for Critical Thinking Press, 2008

