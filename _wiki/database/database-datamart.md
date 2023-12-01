---
layout  : wiki
title   : Datamart
summary : 
date    : 2023-11-27 15:28:32 +0900
updated : 2023-11-27 18:15:24 +0900
tag     : database datamart
toc     : true
comment : true
public  : true
parent  : [[/database]]
latex   : true
---
* TOC
{:toc}

## Datamart

__[Datamart](https://aws.amazon.com/ko/what-is/data-mart/)__ 란 운영상 생성된 데이터를 변환, 집계하여 분석을 위해 __운영 데이터를 가공한 데이터셋__ 을 의미한다. 조직의 성공을 위해 데이터 기반으로 의사결정을 주도한다는 점을 고려할 때, 운영 데이터보다 더 중요하거나 __“중심”__ 이 되는 정보라고 생각할 수 있다. 데이터 마트는 원시 정보를 특정 비즈니스 부서를 위해 의미 있는 정형 콘텐츠로 변환한다.

### How to implement datamart?

클라우드 데이터 엔지니어는 다음을 수행하여 데이터 마트를 설정한다.

- 클라우드 네이티브 데이터 플랫폼을 시작한다.
- 비즈니스 데이터로 데이터 마트를 채운다. 데이터 형식이 올바르고 비즈니스 사용자와 관련이 있는지 확인한다.
- 여러 사용자가 데이터에 액세스할 수 있도록 데이터 마트를 설정한다. 예를 들어, 데이터 마트에 보고 대시보드를 설치한다.
- 데이터 마트가 실행될 때 계속해서 문제를 모니터링, 최적화 및 해결한다.

AWS 를 사용하는 경우 [Amazon Redshift](https://aws.amazon.com/ko/redshift/) 를 사용하여 데이터 마트를 구축할 수 있다.

- Amazon Redshift Serverless 를 사용하면 클러스터의 크기 및 규모에 대한 고려 사항이 자동으로 처리된다.
- 기본 데이터 공유로 인해 데이터 마트의 데이터가 데이터 웨어하우스의 데이터에 액세스하거나 데이터 웨어하우스와 공유될 수 있다.

![](/resource/wiki/database-datamart/datamart.png)

## Links

- [원티드랩 데이터 마트 — 설립기](https://medium.com/wantedjobs/%EC%9B%90%ED%8B%B0%EB%93%9C%EB%9E%A9-%EB%8D%B0%EC%9D%B4%ED%84%B0-%EB%A7%88%ED%8A%B8-%EC%84%A4%EB%A6%BD%EA%B8%B0-bbb54169c6ce)