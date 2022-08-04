---
layout  : wiki
title   : Incident, Defect tracking
summary : 장애 대응
date    : 2022-07-13 15:54:32 +0900
updated : 2022-07-13 20:15:24 +0900
tag     : infra
toc     : true
comment : true
public  : true
parent  : [[/infra]]
latex   : true
---
* TOC
{:toc}
 
# Incident

## 재발 방지 대책

> 시스템에 장애가 발생하면, 장애 보고서를 작성하게 된다. 그 후, 장애를 해결하고, 재발을 방지하기 위한 과정을 거치게 된다.

- 장애는 재현이 가능해야 한다
- 문제를 해결하기 위해 어떤 과정을 거쳤고, 어떤 테스트를 진행했는지를 문서화로 남기자.

## 장애 발생 빈도를 낮추는 방법

> 장애 없는 서비스는 없다.

- 운영 DB 를 로컬에서 직접 다루는 일은 가급적 피하자
  - 혹시나, truncate 나 delete 문을 다뤄야 하는 경우는 더욱 조심해야 한다.
- 테스트 코드를 작성한다
  - 코드를 작성하고 자체적으로 E2E 테스트를 진행하고 코드리뷰를 거친다 하더라도 놓친 부분이 있을 수 있다.
- 다양한 케이스에 대한 테스트를 진행하자.

## 장애 복구를 빠르게 하는 방법

- 서비스 중단 시간을 최소화 해야 한다.
  - 무중단 배포
- 장애 발생 시, System Engineer, Developer 로 부터 인입이 되도록 해야 한다.
  - 유저로부터 장애 인입이 들어오게되면 서비스의 신뢰도가 떨어질 것이다.
  - Slack Alarm

## Links

- [What should be done after a bug is found (Bug Defect Tracking)?](https://www.softwaretestingclass.com/what-should-be-done-after-a-bug-is-found/)
- [도쿄 리전의 AWS 장애 발생시 클래스 메소드 기술 지원 팀이하는 일](https://dev.classmethod.jp/articles/technical-support-aws-failure-launch01/)
- [LINE 의 장애 보고와 후속 절차 문화](https://engineering.linecorp.com/ko/blog/line-failure-reporting-and-follow-up-process-culture/)
- [LINE 플랫폼 서버의 장애 대응 프로세스와 문화](https://engineering.linecorp.com/ko/blog/line-platform-server-outage-process-and-dev-culture/)
- [인프런, 2022년 1월 100% 할인 이벤트 장애 부검](https://tech.inflab.com/202201-event-postmortem/)
- [훈련은 실전처럼, 실전은…… 싫어요](https://story.baemin.com/2663/)
- [우아~한 장애대응](https://techblog.woowahan.com/4886/)
- [우리는 모의장애훈련에 진심입니다](https://techblog.woowahan.com/6557/)
- [SRE 팀에서 장애의 root cause 를 찾고 재발방지 하는 방법](https://techblog.woowahan.com/2700/)
- [시스템신뢰성개발팀(SRE)을 소개합니다](https://techblog.woowahan.com/2716/)
- [재난급 서버 장애내고 개발자 인생 끝날뻔 한 썰 - 납량특집! DB에 테이블이 어디로 갔지?](https://www.youtube.com/watch?v=SWZcrdmmLEU)