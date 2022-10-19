---
layout  : wiki
title   : Trunk based Development
summary : 
date    : 2022-10-17 15:54:32 +0900
updated : 2022-10-17 20:15:24 +0900
tag     : git
toc     : true
comment : true
public  : true
parent  : [[/git]]
latex   : true
---
* TOC
{:toc}

## Trunk based Development

> With trunk-based development, where developers merge small, frequent updates to a core “trunk” 
> 
> ![](/resource/wiki/git-trunk-based-development/trunk.png)
> 
> - Committing changes to the master branch triggers the CI/CD pipeline.
> - If the pipeline flags up any failures, it is everyone’s responsibility to jump in to try and fix it as soon as possible.
> - The aim is to __keep the master branch in a deployable state__, with changes being released frequently.

## Push Strategy

> ![](/resource/wiki/git-trunk-based-development/strategies.png)

### Committing straight to the trunk

> [Committing straight to the trunk](https://trunkbaseddevelopment.com/committing-straight-to-the-trunk/)
> - Suitable for active committer counts between 1 and 100.
- __소규모 팀의 경우에는 trunk branch 에 직접 커밋을 하는 전략을 선택할 수 있다.__
  - Some teams will choose to commit/push straight to the trunk. Most likely it is because they are a small team with each team member knowing what the others are up to. Their build is probably fast and relatively exhaustive.
- __trunk branch 에 직접 커밋하는 방식은 현업에서 사용하기 어려운 방식이다.__
  - Committing (and pushing) straight to the trunk has a challenge. 
  - Principally, someone could commit/push code that breaks the build, and the server(s) setup to guard Continuous Integration don’t catch that for some time after the commit is available for teammates to pull/sync to their dev-workstation for unrelated work.
  - Risk mitigation is everyone running the full build (the same build the CI demon would do) before the commit/push, and only pushing to trunk if that passes. This is an essential integration activity.

### Short-Lived Feature Branches

> [Alternatives to committing straight to the trunk: Short-Lived Feature Branches](https://trunkbaseddevelopment.com/short-lived-feature-branches/)
> - Suitable for active committer counts between 2 and 1000.

- Google were effectively doing the same in their Monorepo for some years before.
  - 국내 사례에서는 [Workingflow in monorepo - buzzvil](https://tech.buzzvil.com/handbook/workingflow-in-monorepo/) 를 참고하면 좋다.

> ![](/resource/wiki/git-trunk-based-development/shortlived.png)

짧은 생명주기를 가진 feature branch 전략의 경우 몇 가지 핵심 규칙이 존재한다.

- branch 의 생명 주기는 최대 2일까지만 유지한다. 2일보다 긴 경우 __long-lived feature branch__ 가 될 가능성이 높다.
- feature 브랜치 하나당 1명의 개발자 수(페어프로그래밍의 경우 2명)를 유지하는 것이 좋고, 해당 브랜치는 팀 내에서 공유되지 않는다.(코드 리뷰를 위한 공유는 제외)
- Do a speculative main/pull from main/trunk before attempting any push to main/trunk.
  - Do not Attempt to merge to main/trunk and if that’s blocked do a merge/pull from main/trunk before attempting the push again.
  - 이 방식의 장점: No trace if there’s nothing to merge in from the other branch.

### Feature Flags & Branch by Abstraction

> [Feature Flags](https://trunkbaseddevelopment.com/feature-flags/) & [Branch by Abstraction](https://trunkbaseddevelopment.com/branch-by-abstraction/)

현업에서는 feature branch 의 생명주기가 항상 짧지만은 않다. 기획에서 의사결정이 늦어지는 경우나, 기타 다른 일정 때문에 우선순위가 밀리는 경우 등에 의한 이유로 long-lived feature branch 가 될 가능성이 많다.

Feature Flags 와 Branch by Abstraction 은 long-lived feature branch 를 위한 기술이다.

Branch by Abstraction 에도 몇 가지 핵심 규칙이 존재한다.

- long-lived feature branch 가 공유 리포지토리에 커밋/푸시 되지 않아도, 운영에 영향이 있으면 안된다.
- long-lived feature branch 에 의존하는 개발자가 많이 있으며, 해당 브랜치로 인해 그들의 작업이 느려지는 것을 원하지 않는다.

### Coupled “Patch Review” System

> Suitable for active committer counts between 2 and 40,000.
> 
> "We do Trunk-Based Development" - Google 직원 Rachel Potvin - @Scale 기조 연설, 2015년 9월(14분):
> 
> ![](/resource/wiki/git-trunk-based-development/patch.png)

## Feature based development

> One of its primary differences from a trunk-based workflow is that it never pushes code changes to the main branch.
> 
> Before developing a feature, the developer checks out a “feature” branch and makes all the code changes there. The developer creates a merge request with the main branch when the development on the feature is complete. Depending upon company policy, there might be a code review before merging the feature branch into the main branch. __Most importantly, developers never push code changes directly to the main branch in the feature-based workflow.__
> - [Trunk-based vs Feature-based development](https://circleci.com/blog/trunk-vs-feature-based-dev/)

## Links

- [Trunkbaseddevelopment](https://trunkbaseddevelopment.com/)
- [FeatureBranch - MartinFowler](https://martinfowler.com/bliki/FeatureBranch.html)
- [Trunk-based development - Jetbrains](https://www.jetbrains.com/teamcity/ci-cd-guide/concepts/trunk-based-development/)
- [Trunk-based development - Atlassian](https://www.atlassian.com/continuous-delivery/continuous-integration/trunk-based-development)
- [Devops tech Trunk-based development](https://cloud.google.com/architecture/devops/devops-tech-trunk-based-development)
- [Branch by Abstraction](https://trunkbaseddevelopment.com/branch-by-abstraction/)