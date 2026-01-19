---
layout  : wiki
title   : Architecture Decision Records
summary : 
date    : 2023-10-05 15:02:32 +0900
updated : 2023-10-05 15:12:24 +0900
tag     : architecture adr
toc     : true
comment : true
public  : true
parent  : [[/architecture]]
latex   : true
---
* TOC
{:toc}

## Architecture Decision Records

Architecture Decision Records 에는 **상태, 컨텍스트, 결정사항, 결론** 이라는 4가지 핵심 섹션이 존재한다.
- ADR 제안은 상태에서 만들어진다.
- 컨텍스트는 상황을 설정하고 의사결정을 내려아하는 문제나 범위를 서술한다.
- 결정사항은 어떤 계획을 수립하는지, 어떻게 계획을 실행할 것인지를 명확하게 정의한다. 모든 결정사항은 아키텍처상의 결론이나 트레이드오프로 이어진다.

> 프로젝트가 살아있는 동안 추적하기 가장 어려운 것 중 하나는 어떤 의사결정이 내려진 동기다. by Michael Nygard.

ADR 을 리뷰할 때는 ADR 에 기록된 결정사항에 동의하는지 또는 다른 대안은 없는지 확인하는 것이 중요하다. ADR 을 작성하기에 앞서 충분한 논의를 하고 그 결과를 기록하는게 좋다.

단비교육 에서 [AWS Control Tower 도입을 결정](https://aws.amazon.com/ko/blogs/tech/danbiedu-architecture-modernization-using-aws-control-tower/)하면서, Architecture Decision Records 도입을 하기로 했다고 한다.

이때 아키텍처 결정 기록(ADR)은 아래와 같은 세 가지 비즈니스 성과를 목표로 했다고 한다.

- 현재의 팀 구성원과 미래의 팀 구성원을 연결해 주는 역할을 한다.
- 프로젝트 또는 제품에 대한 전략적 방향을 설정한다.
- 아키텍처 결정을 적절히 문서화하고 전달하는 프로세스를 정의하여 의사 결정 방지 패턴을 피할 수 있다.

## Links

- [Decision record template by Michael Nygard](https://github.com/joelparkerhenderson/architecture-decision-record/blob/main/templates/decision-record-template-by-michael-nygard/index.md#decision-record-template-by-michael-nygard)
- [Existing ADR Templates](https://adr.github.io/#existing-adr-templates)

## References

- [Using architectural decision records to streamline technical decision-making for a software development project](https://docs.aws.amazon.com/prescriptive-guidance/latest/architectural-decision-records/welcome.html)