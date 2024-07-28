---
layout  : wiki
title   : Managed Service
summary : 
date    : 2024-07-27 15:02:32 +0900
updated : 2024-07-27 15:12:24 +0900
tag     : architecture
toc     : true
comment : true
public  : true
parent  : [[/architecture]]
latex   : true
---
* TOC
{:toc}

## Managed Service

_[Managed Service](https://en.wikipedia.org/wiki/Managed_services)_ 란 Authentication, Systems management, DB Backup and Recovery, Data storage, warehouse and management, Monitoring 등
에 대한 리소스 관리를 외부 공급업체(e.g AWS) 등에 위임하는 것을 의미한다. 직접 구축했을때보다 운영 및 관리 비용에 대한 이점이 크다.

- [Amazon Managed Streaming for Apache Kafka](https://aws.amazon.com/ko/msk/) 
  - Apache Kafka 및 Kafka Connect 클러스터의 프로비저닝, 구성 및 유지 관리 등의 운영 오버헤드를 제거
  - Apache Kafka 용으로 구축된 애플리케이션 및 도구를 코드 변경 없이 바로 사용하고 클러스터 용량을 자동으로 확장