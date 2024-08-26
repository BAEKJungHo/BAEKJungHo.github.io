---
layout  : wiki
title   : Developer Experience
summary : 
date    : 2024-08-26 18:54:32 +0900
updated : 2024-08-26 20:15:24 +0900
tag     : experience dx
toc     : true
comment : true
public  : true
parent  : [[/kotlin]]
latex   : true
---
* TOC
{:toc}

## Developer Experience

___[개발자 경험(Developer Experience)](https://github.blog/enterprise-software/collaboration/developer-experience-what-is-it-and-why-should-you-care/)___ 은 개발자의 업무 만족도와 생산성이 올라가기 때문에 중요하다. DevX 는 개발자 마다 다르기 때문에 주관적이다. 

___[GitHub 의 DevX 공식](https://queue.acm.org/detail.cfm?id=3595878)___ 은 다음과 같다.

- Productivity: 코드베이스를 얼마나 빨리 간단하게 변경할 수 있는가
- Impact: 아이디어에서 생산으로의 이동이 얼마나 원활한가
- Satisfaction: 환경, Workflow, 도구가 개발자의 행복에 미치는 영향 

__What Makes A Good DevX__:

- Collaboration
- Speed
- Short Feedback Loops
- High degrees of automation and integration
- Low levels of friction or toil
- Transparent, well-documented processes

![](/resource/wiki/experience-developer/devx-three-core.png)

___Productivity___ - 생산성이 좋지 않은 코드베이스에서 코딩을 하게 되는 경우 만족스러운 DevX 를 얻지 못할 것이다.
Library, Framework 등 적절한 도구를 도입하여 어떻게든 생산성을 높여야 한다.

___Faster Feedback___ - 업무를 진행하기 위한 Context 부족인 경우 혹은 이해가 잘 안가는 부분은 GL, TL, 동료 분들께 바로바로 물어봐야 한다. 또한 내가 생각한 방향성이 맞는지도
확인하면 좋다. _"TDD can help people who don’t (yet) know (everything they need to know about) how to design software."_ 상황에서 TDD 를 사용하면 좋은데 TDD 의 가장 큰 장점은 ___[Faster Feedback](https://baekjungho.github.io/wiki/tdd/tdd-interface-design-decisions/)___ 이다.
Feedback Loop 를 방해하는 요소 중 하나는 Code Review Delay 가 있다. 동료의 DevX 를 위해서라도 빠르게 Feedback 을 주는 것이 중요하다고 생각한다.

___Positive relationship___ - 동료와의 긍정적은 관계에 힘을 써야 한다. 예를 들어 Code Review 를 할 때에도 동료가 잘한 부분이 있다면 칭찬을 해주고, 겸손한 어투로 리뷰를 해야 한다고 생각한다.
누구든 자신이 회사에 가치가 있다고 느낄때 더 높은 성과를 낼 것이다.

___Cognitive Load___ - 코드를 작성할 때 가장 중요한 부분중 하나는 ___[Readability](https://baekjungho.github.io/wiki/cleancode/cleancode-readability/)___ 이다. 코드를 읽을때 인지 부하가 걸리지 않는 것도 중요하지만, Log 를 통한 Debugging 시에도 정말 중요하다.
특히 Log 를 Monitoring 할 때 인지 부하가 적어야 부담이 덜 간다.

## Links

- [DevEx: What Actually Drives Productivity](https://queue.acm.org/detail.cfm?id=3595878)
- [What happens when software developers are (un)happy](https://www.sciencedirect.com/science/article/pii/S0164121218300323?via%3Dihub)
- [Maximizing Developer Effectiveness / Martinfowler](https://martinfowler.com/articles/developer-effectiveness.html)
- [Oxford Handbook of Positive Psychology](https://academic.oup.com/edited-volume/28153/chapter-abstract/212941827?redirectedFrom=fulltext&login=false)
- [Design for readability](https://kt.academy/article/ek-readability)