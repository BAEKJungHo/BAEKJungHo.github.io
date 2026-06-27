---
layout  : wiki
title   : SPEC DRIVEN DEVELOPMENT
summary : 
date    : 2026-06-27 10:54:32 +0900
updated : 2026-06-27 11:15:24 +0900
tag     : methodology test tdd sdd
toc     : true
comment : true
public  : true
parent  : [[/methodology]]
latex   : true
favorite: true
---
* TOC
{:toc}

## SPEC DRIVEN DEVELOPMENT

***스펙 주도 개발(SPEC DRIVEN DEVELOPMENT)*** 은 구현 코드보다 명세(Specification)를 먼저 정의하고, 그 명세를 기준으로 설계, 구현, 테스트를 진행하는
개발방식이다. 이렇게 작성된 <mark><em><strong>"명세는 시스템이 만족해야하는 계약과 규칙의 SSOT"</strong></em></mark> 이다.

AI 시대에 인간의 역할은 코드를 직접 작성하는 것이 아닌, 모호한 **문제를 잘 정의**하고, **목표와 맥락을 AI 에게 전달**하여 AI 가 **구현한 결과물을 검증**하는 역할이 되었다고 생각한다.
인간이 이러한 역할을 잘 수행해내기 위한 방법론이 <mark><em><strong>SPEC DRIVEN DEVELOPMENT</strong></em></mark> 라고 생각한다.

나는 다음과 같은 Workflow 를 사용한다.

1. Context Document (Human)
2. Write Spec (AI)
3. Spec Validation (Human)
4. Task Document (Human)
5. Task Planning (AI)
6. Task Planning Review (Human)
7. Implementation by TDD (AI)
8. Implementation Review (Human)
9. (Before Push) Code Review (AI)
10. Apply Code Review Feedback (Human)
11. Verification (Human)
12. SSOT Update (AI)
13. Commit Message Generation (AI)
14. Commit & Push (Human)

새로운 기능 구현을 해야하는 경우를 생각해보자. 기획자가 작성한 기획 문서를 통해서 개발자는 문제, 제약조건, 스펙에 대해서 작성을 해야한다.
이것을 Context 라고 한다. Context Document 를 작성하고 나서 AI 에게 이를 잘 구조화하여 Spec 으로 만들도록 시킨다.
스펙 문서의 산출물은 다음과 같다. 

1. Testcase
2. Sequence Diagram
3. Functional Requirements
4. Non-Functional Requirements
5. API contracts
6. Edge Cases
7. Domain Rules

개발자는 작성된 Spec 문서를 검토하고 개선하는 루프를 진행하게 된다. 완성도 있는 Spec 문서를 작성하기 위해서는 Context Document 가 최대한 디테일해야 한다.
요구사항에 대한 디테일, 모호한 경계 정의, AI 가 하지 말아야할 것을 결정, 제약 조건 등을 디테일하게 정의해야한다.

만약, 인간이 검토가 끝나면 위 스펙 문서들을 프로젝트 루트 하위에 `docs(SSOT)` 폴더를 만들어서 이동 시키고, `AGENTS.md` 가 docs 를 항상 참고하도록 한다.
이렇게 하면 실제 Agents 가 구현을 시작할때 SSOT 를 항상 참고하게 된다.

이렇게 STEP3(Spec Validation) 까지 끝나면 인간은 기능을 완성 시키기 위해서 작업을 Ticket 단위로 쪼개야 한다.
그리고 Ticket 을 처리하기 위해 다시 작업에 대한 문제 정의, 목표, 제약조건 등을 AI 에게 제시하기 위한 문서를 작성해야 하며 이 단계가 STEP4 인 Task Document 단계이다.
AI 에게 Task Document 를 주고 Task Planning 을 시키며, AI 가 작성한 Planning Document 를 인간이 검토한다.
검토가 완료되면 구현을 AI 에게 시킨다. 이때 중요한 점은 <mark><em><strong>[TDD](https://klarciel.net/wiki/tdd/)</strong></em></mark> 를 사용하는 것이다.

내 생각에 테스트 코드는 이제 더 이상 인간을 위한 코드가 아니다. 테스트 코드는 AI 가 프로젝트를 빠르게 이해하기 위한 정책 문서라고 생각한다.
그리고 TDD 는 AI 가 구현시 회귀 문제를 일으키지 않도록 하기 위함이며, 프로덕션 코드가 테스트 없이 작성되지 않도록(즉, 검증되지 않은 코드가 작성되지 않도록)
방지하기 위한 도구라고 생각한다. 이렇게 쌓인 테스트 코드들은 추후에 대규모 리팩토링을 진행함에 있어서 회귀 문제를 단 한번도 일으키지 않도록 막아주는데 도움이 된다.

AI 의 구현이 완료되면 인간은 구현 리뷰를 진행한다. 이때 AI 가 구현이 완료되면 자신이 진행하면서 얻은 인사이트와 여정을 별도 문서로 남기도록 하면 좋다.
STEP9, 10은 생략할 수 있고(원격 저장소에 AI 기반 자동 리뷰 시스템이 구축되어있다면 생략해도 된다), 구현 리뷰 단계에서 Verification 을 같이 진행할 수 있다.