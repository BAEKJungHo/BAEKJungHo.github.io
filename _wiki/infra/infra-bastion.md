---
layout  : wiki
title   : Bastion Server
summary : 
date    : 2022-06-16 15:54:32 +0900
updated : 2022-06-16 20:15:24 +0900
tag     : infra
toc     : true
comment : true
public  : true
parent  : [[/infra]]
latex   : true
---
* TOC
{:toc}

## Bastion

![](/resource/wiki/infra-bastion/bastion.png)

Bastion 이란, 성 외각을 보호하기 위해 돌출된 부분으로 적으로부터 효과적으로 방어하기 위한 수단이다. 이를 아키텍처에도 적용할 수 있다.

예를 들어, 터미널에 접속하기 위해 사용되는 ssh 22 번 포트의 경우 보안이 뚫린다면 서비스에 심각한 문제를 일으킬 수 있다. 그렇다고 모든 서버에 동일한 수준의 보안을 설정하고자 하면, Auto-Scaling 등 확장성을 고려한 구성과 배치된다. 이 경우 관리 포인트가 늘어나기에 일반적으로는 보안 설정을 일정 부분을 포기하는 결정을 하게 된다.

![](/resource/wiki/infra-bastion/bastion2.jpg)

__Bastion Server 가 있다면, 악성 루트킷, 랜섬웨어 등으로 피해를 보더라도 Bastion Server 만 재구성하면 되므로, 서비스에 영향을 최소화할 수 있다.__

추가적으로, __서비스 정상 트래픽과 관리자용 트래픽을 구분__ 할 수 있다는 이점이 있다. 가령, 서비스가 DDos 공격을 받아 대역폭을 모두 차지하고 있다면 일반적인 방법으로 서비스용 서버에 접속하기는 어렵기 때문에 별도의 경로를 확보해둘 필요가 있습니다.

따라서, 22번 Port 접속을 Bastion 서버에 오픈하고 그 서버에 보안을 집중하는 것이 효율적이다.

### 특징

- 서비스용 서버는 정상 트래픽인지 유무를 판단하고 웹 방화벽을 두어 트래픽의 시그니처를 검사한다.
- 서비스용 서버는 애플리케이션 서버에서 사용하는 기술의 보안성을 위주로 검사한다.
- 관리자용 서버는 접속할 수 있는 대상을 제한한다.
  - VPN 등의 인증과정을 거치기도 하고, 오피스 등 특정 IP 대역만 접근 가능하도록 구성하기도 한다.
  - 인증/인가 정책상 허용된 사용자라 하더라도, 터미널로 접속하여 작업한 명령어 히스토리(감사로그)를 기록해둔다.
  - 관리자용 서버는 서비스용 서버가 DDos 등의 공격으로 접속이 불가능하더라도 접속이 가능하여야 한다.

## Links

- [What is bastion host server](https://www.learningjournal.guru/article/public-cloud-infrastructure/what-is-bastion-host-server/)
- [NextStep 인프라 공방](https://edu.nextstep.camp/)