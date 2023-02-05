---
layout  : wiki
title   : Service Oriented Architecture
summary : SOA
date    : 2023-01-31 15:54:32 +0900
updated : 2023-01-31 20:15:24 +0900
tag     : msa
toc     : true
comment : true
public  : true
parent  : [[/msa]]
latex   : true
---
* TOC
{:toc}

## Service Oriented Architecture

- (재사용 가능한 서비스나 모듈을 재사용함으로써) 재사용을 통한 비용 절감
- 공통의 서비스를 ESB 에 모아 공통 서비스 형식으로 제공

## Microservice Architecture

- (재사용 보다는 더 작고 세밀하게 독립된 서비스로 분리하여) 서비스간 결합도를 낮추어 변화에 능동적으로 대응
- 각 독립된 서비스가 Exposed REST API 를 사용