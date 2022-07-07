---
layout  : wiki
title   : Load Test
summary : 부하 테스트
date    : 2022-06-27 15:54:32 +0900
updated : 2022-06-27 20:15:24 +0900
tag     : infra
toc     : true
comment : true
public  : true
parent  : [[/infra]]
latex   : true
---
* TOC
{:toc}

## Fault Tolerance

> 장애가 없는 서비스를 만들 수는 없다. 장애가 나더라도 쉽게 복구 가능한 장애 내성을 가진 서비스를 만드는 것이 중요하다.

- __장애 내성을 가진 서비스를 만들기 위한 노력__
  - 로깅
  - 성능 테스트
  - 부하 테스트
  - 스트레스 테스트
  - 권한 관리
    - 계정, DB, 설정 파일 등
  - ...
  
## Load Test

- 현재 시스템이 어느 정도의 부하를 견디는지 
- 한계치에서 병목이 발생하는 지점은 어디인지
- 한계치를 확인함으로써
  - 우리의 서비스가 어느정도 트래픽까지 괜찮은지 알 수 있음
  - 한계점을 넘어설 때 어떤 증상이 나타나는지 알 수 있음
  - 장애 발생시에 어떻게 대응하고 복구해야 할지 계획할 수 있음

## Links

- [NextStep 인프라 공방](https://edu.nextstep.camp/)
- [Fault Tolerance](https://baekjungho.github.io/wiki/msa/msa-fault-tolerance/)