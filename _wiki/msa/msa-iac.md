---
layout  : wiki
title   : Infrastructure as Code
summary : 
date    : 2022-05-28 17:54:32 +0900
updated : 2022-05-28 20:15:24 +0900
tag     : msa
toc     : true
comment : true
public  : true
parent  : [[/msa]]
latex   : true
---
* TOC
{:toc}

## Infrastructure as Code

> Infrastructure as Code 란 코드를 이용해 인프라 구성부터 애플리케이션 빌드, 배포를 정의하는 것을 의미

IaC로 인프라 프로비저닝을 자동화하면 애플리케이션을 개발하거나 배포할 때마다 개발자가 직접 서버, 운영 체제, 스토리지, 기타 인프라 구성 요소를 수동으로 프로비저닝하고 관리할 필요가 없어진다. 인프라를 코드화하여 템플릿을 만들고 프로비저닝할 때 이 템플릿을 사용하면 된다. 이러한 작업은 수동으로 진행할 수도 있고 Red Hat® Ansible Automation® Platform 과 같은 자동화 툴을 사용할 수도 있다.

## Provisioning

> 프로비저닝(provisioning)은 사용자의 요구에 맞게 시스템 자원을 할당, 배치, 배포해 두었다가 필요 시 시스템을 즉시 사용할 수 있는 상태로 미리 준비해 두는 것을 말한다.

## IaC 장점

원래 인프라 프로비저닝은 시간과 비용이 많이 드는 수동 프로세스였다. 하지만 이제 데이터 센터의 물리적 하드웨어(조직에서 여전히 물리적 하드웨어를 사용할 수도 있음)가 아니라 가상화, 컨테이너, 클라우드 컴퓨팅을 이용하여 인프라 관리를 하게 되었다.

클라우드 컴퓨팅이 등장하면서 인프라 구성 요소의 수가 늘어났고, 날마다 더 많은 애플리케이션이 프로덕션 환경에 릴리스되고 있다. 이에 따라 더 잦은 빈도로 가동하고, 중지하고, 확장할 수 있는 인프라가 필요해졌다. IaC 이용 사례를 확립하지 않으면 현재 인프라의 규모를 관리하기가 갈수록 어려워질 것이다.

조직은 IaC를 이용해 IT 인프라 요구 사항을 관리함과 동시에 일관성을 높이고 오류 및 수동 구성을 줄일 수 있다.

- 비용 절감
- 배포 속도 향상
- 오류 감소
- 인프라 일관성 향상
- 구성 변동 제거

## Links

- [What is infrastructure as code](https://www.redhat.com/ko/topics/automation/what-is-infrastructure-as-code-iac)

## References

- 도메인 주도 설계로 시작하는 마이크로서비스 개발 / 한정헌, 유해식, 최은정, 이주영 저 / 위키북스