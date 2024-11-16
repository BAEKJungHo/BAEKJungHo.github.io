---
layout  : wiki
title   : Determining When to Apply Test-Driven Development
summary : Benefits, Drawbacks of TDD
date    : 2024-07-13 10:08:32 +0900
updated : 2024-07-13 10:15:24 +0900
tag     : tdd test
toc     : true
comment : true
public  : true
parent  : [[/tdd]]
latex   : true
---
* TOC
{:toc}

## Determining When to Apply Test-Driven Development

Test-Driven Development(TDD) 는 개발자가 실제 코드를 작성하기 전에 테스트 케이스를 먼저 작성하고, 이 테스트를 통과할 정도로 충분한 코드를 작성하는 개발 방법론이다.

_[Giving Up on TDD - Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2016/03/19/GivingUpOnTDD.html)_, _[Is TDD Dead - Martinfowler](https://martinfowler.com/articles/is-tdd-dead/)_, _[RIP TDD - Kent Beck](https://www.facebook.com/notes/kent-beck/rip-tdd/750840194948847/?_rdr)_ 등
다양한 경로를 통해서 TDD 에 대한 다양한 Views 가 있다는 것을 알 수 있다. 또한 TDD 를 통해 클래스 설계를 개선할 수 있는 상황에 대한 다양한 연구가 있다.

긍정적인 연구 결과로는 아래와 같다.

- TDD 를 사용하면 객체 지향 개념을 더 잘 사용할 수 있다.
- TDD 를 사용하면 책임을 여러 클래스에 분산하도록 할 수 있다.
- TDD 에 익숙하지 않으면 생산성은 떨어지지만, 코드 품질 향상에 도움이 된다.
- TDD 가 주는 사이클로 인해 설계 개선이 이뤄진다.
- TDD 를 적용한 경우 그렇지 않은 프로젝트보다 배포 전 결함 밀도가 40%~90% 감소되었다.

결론을 내리지 못한 연구 결과로는 아래와 같다.

- 테스트 우선 방식이 기존 접근법에 비해 구현 속도가 개선되지 않으며, TDD 로 작성한 코드 역시 더 신뢰할 만하다고 할 수 없었다.
- TDD 가 내부 코드 품질에 일관된 영향을 미치지 않는다.

최근의 논문들 중에는 아래와 같은 의견도 있다.

- TDD 의 효과는 '테스트 우선 작성'에 미치는 것이 아니라, 최종 목표를 향해 걸음마를 뗀 것이라는 생각도 있다. 
- TDD 의 이점은 TDD 가 주는 _[Cycle](https://baekjungho.github.io/wiki/tdd/tdd-red-green-refactor/)_ 이 집중력과 흐름을 개선해주는 세분화되고 안정화된 단계를 가질 수 있도록 하기 때문일 수 있다고 주장한다.

나는 TDD 를 현재 공부 중이고, 가끔 현업에서도 적용해보려는 시도를 하고 있다. 현재까지 느낀 TDD 의 장점 중 하나는 ___[Faster Feedback](https://baekjungho.github.io/wiki/tdd/tdd-interface-design-decisions/)___ 이라고 생각한다.
_[No Silver Bullet in Software Test](https://baekjungho.github.io/wiki/test/test-no-silver-bullet/)_ 인 것 처럼, TDD 가 Silver Bullet 은 아니다. 따라서 특정 도구/기술을 맹목적으로 받아들이는 것은 위험하다고 생각된다.
TDD 를 팀 단위의 문화로 녹이고 싶다면, TDD 가 팀에 효과적인지 판단해야 하며 많은 허들이 있겠지만, 개인이 사용하기에는 좋다고 생각한다.
결국 다양한 상황(context)에서 의사 결정을 잘 하기 위해서는 TDD 에 대한 __Experience__ 가 중요할 것이다.

아직 많이 배워가야 하는 입장으로써 여러 논문들의 Views 대해서 100% 공감이 어려운 부분도 있지만, ___[TDD Cycle](https://baekjungho.github.io/wiki/tdd/tdd-red-green-refactor/)___ 이 주는 장점을 충분히 느끼려고 한다. 

__[Effective Software Testing](https://www.amazon.com/Effective-Software-Testing-developers-guide/dp/1633439933) 의 저자 'Mauricio Aniche' 의 TDD 사용 기준__:

- TDD 를 수행할 때 정상 경로와 비지니스 규칙에 먼저 집중하고, TDD 를 통해서 Production Code 작성이 끝나면 Test Mode 로 진입하여 코너 케이스와 경계에 대한 테스트를 진행할 수 있다.
- TDD 를 항상 사용하진 않는다. 설계나 아키텍처, 특정 요구사항에 대한 구현 방법이 명확하지 않을 때 TDD 를 사용한다고 한다. 이러한 경우에는 조금 천천히 진행하면서 여러 가능성을 실험하는 것이 좋다. 복잡한 문제를 다루거나 그 문제에 관한 전문성이 부족할 때 사용하는 것도 좋다. TDD 는 작은 테스트부터 작성 가능하게 해준다.
- 개발과정에서 배울만한 게 없으면 TDD 를 사용하지 않는다. 이미 어떤 문제와 그 해결책을 알고 있으면 편안하게 해결 방안을 바로 코딩한다. (테스트 코드 작성은 필수)
- TDD 는 설계 관점에서 뿐만 아니라, 구현 관점(코드가 필요한 일을 하고 있는가)에서 작성 중인 코드를 배울 수 있도록 해준다.
- 일부 복잡한 기능에 대해서는 어떤 테스트를 먼저 작성할지 결정하기 어려운데 이때는 TDD 를 사용하지 않는다고 한다.

## Drawbacks

___[TDD has a severe drawback of overthinking and idea fatigue](https://www.reddit.com/r/Python/comments/yhkur8/best_resource_to_learn_test_driven_development/?rdt=59629)___. What happen is when writing code, a developer thinks of various approaches and modifies the code design accordingly to write the most optimal but simplistic code. But TDD forces the developer to overthink about which approach is he going to finalize for his tests before actually trying them out practically. Because they have to write pseudo test first, they quickly get tired of thinking more practical approaches and feel reluctant to change tests again and proceed with the sub-optimal approach that works but may not be the best one.

Like you said, TDD is good only when you have proficiency in that task and you already know which is the most optimal implementation for that task.