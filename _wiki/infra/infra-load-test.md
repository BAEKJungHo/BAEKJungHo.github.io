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
- k6, nGrinder 등의 도구를 사용할 수 있다.
  - 어떤 도구를 사용하던 아래 세 가지 요건이 충족되는게 중요하다.
  - a. 시나리오 기반 테스트
  - b. 동시 접속자 수, 요청 간격, 최대 처리량 등 부하 조정이 가능
  - c. 부하 테스트 서버 Scale out 지원

### smoke

> smoke test 를 통해 소프트웨어 개발자는 자신이 만든 빌드의 유효성을 확인할 수 있다. 다른 공식 테스트가 완료되기 전에 스모크 테스트 단계를 구현함으로써 이후 테스트 단계에서 시간이나 리소스가 낭비되지 않도록 할 수 있다. smoke test 는 빌드가 공식 테스트를 수행할 준비가 되었는지 여부를 나타내는 지표이기 때문에 중요하다.

![](/resource/wiki/infra-load-test/smoke.png)

- VUser 1 ~ 2 로 구성
- 최소한의 부하로, 테스트 시나리오 오류를 검증
- 최소 부하 상태에서 시스템 오류가 없는지 확인

### load

- 서비스의 평소 트래픽과 최대 트래픽으로 구성
- 기능이 정상 동작하는지 검증
- 배포, 인프라 변경(scale out, DB failover)시 성능 변화 확인

### stress

- 점진적으로 부하가 증가하도록 구성
- 최대 사용자, 최대 처리량 등 한계점을 확인
- 스트레스 테스트 이후 시스템이 수동 개입 없이도 복구 되는지 확인

## Links

- [NextStep 인프라 공방](https://edu.nextstep.camp/)
- [Fault Tolerance](https://baekjungho.github.io/wiki/msa/msa-fault-tolerance/)
- [The ultimate guide to smoke testing](https://www.globalapptesting.com/blog/the-ultimate-guide-to-smoke-testing)