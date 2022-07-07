---
layout  : wiki
title   : Web Performance Budget
summary : 웹 성능 예산
date    : 2022-06-26 15:54:32 +0900
updated : 2022-06-26 20:15:24 +0900
tag     : infra
toc     : true
comment : true
public  : true
parent  : [[/infra]]
latex   : true
---
* TOC
{:toc}

## Web Performance Budget

> 어느정도까지 허용 가능한지 목표를 정해야 한다.

![](/resource/wiki/infra-web-performance-budget/metrics.png)

### Priority

> 웹 성능 예산 - 우선 순위
> 
> - 사용자에게 컨텐츠가 빠르게 노출되는 것이 중요한지
> - 사용자가 관련 링크를 빠르게 클릭하는 것이 중요한지

![](/resource/wiki/infra-web-performance-budget/metrics2.png)

### 기준을 정하는게 중요

- 메인 페이지의 모든 오브젝트 파일 크기는 10MB 미만으로 제한한다.
- 모든 웹 페이지의 각 페이지 내 포함된 자바스크립트 크기는 1MB 를 넘지 않아야 한다.
- 검색 페이지에는 2MB 미만의 이미지가 포함되어야 한다.
- LTE 환경에서의 모바일 기기의 Time to Interactive 는 5초 미만이어야 한다.
- Dom Content Loaded 는 10초, First Meaningful Paint 는 15초 미만이어야 한다.
- Lighthouse 성능 감사에서 80점 이상이어야 한다.
- ...

## Links

- [NextStep 인프라 공방](https://edu.nextstep.camp/)
- [webpagetest](https://www.webpagetest.org/)