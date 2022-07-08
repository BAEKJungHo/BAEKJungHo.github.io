---
layout  : wiki
title   : Availability and Performance
summary : 가용성과 성능
date    : 2022-06-29 15:54:32 +0900
updated : 2022-06-29 20:15:24 +0900
tag     : infra
toc     : true
comment : true
public  : true
parent  : [[/infra]]
latex   : true
---
* TOC
{:toc}
 
## Availability

> 시스템이 서비스를 정상적으로 제공할 수 있는 상태

가령, 한 대의 서버에 문제가 생겨도 사용자는 인지 못할 수 있다. 가용성을 높이기 위해서는 단일 장애점(SPOF)을 없애고 확장성 있는 서비스를 만들어야 한다.

## Performance

> 성능이 좋다라는 것을 판단할 수 있는 지표는 무엇일까?

- __Users__
  - 얼마나 많은 사람들이 동시에 사용할 수 있는지
- __TPS__
  - 일정시간 동안 얼마나 많이 처리할 수 있는지
- __Time__
  - 서비스가 얼마나 빠른지

### Users

- 서버의 관점에서는 로그인한 사용자와 로그인하지 않은 사용자가 존재
- 성능 테스터 관점에서는 Concurrent User 와 Active User 가 존재
  - VUser 는 Active User 와 유사

### TPS

- 서버가 처리할 수 없어 대기하는 작업들이 누적되면, 응답시간이 급격히 증가한다. 이 한계점을 파악하기 위해 Stress Test 를 진행한다.
- scale out, scale up 둘 다 처리량을 증가
  - 성능에 문제가 있는 경우엔, 단일 사용자에 대한 응답속도가 늦어짐
  - 확장성에 문제가 있는 경우엔 당장에는 이슈가 없지만 부하가 많아질 경우 응답속도가 느려짐

![](/resource/wiki/infra-availability/tps.png)

scale out 을 해서 TPS 가 증가한다 하더라도, DB 가 받는 부하가 증가하게 되어 처리하지 못하고 대기하는 쿼리들이 발생하고, 이것도 WAS 에서 요청을 물고 있는 상태가 되다 보니까 TPS 가 점점 감소하게 되는 현상이 발생한다. 따라서 올바른 TPS 목표 값을 설정해야 한다.

### Time

![](/resource/wiki/infra-availability/time.png)

- [인터넷 구간은 webpagetest 등을 통해서 확인 가능](https://baekjungho.github.io/wiki/infra/infra-web-performance-budget/)
  - 캐싱 설정
  - CDN 사용
  - keep-alive 설정
  - gzip 압축, 이미지 압축
  - 불필요한 다운로드 제거
  - 불필요한 작업을 지연로딩
  - 스크립트 병합하여 요청 수 최소화
- __서버 구간__
  - 서버의 리소스 문제
  - 프로그램 로직상의 문제
  - DB 혹은 다른 서비스와의 연결 문제
    - 데이터 캐시, 비동기, 집계 테이블

## Links

- [NextStep 인프라 공방](https://edu.nextstep.camp/)
- [서버 성능 올리기 - 처리량, 응답시간](https://www.youtube.com/watch?v=JJJ4LReZ5q4)