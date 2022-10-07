---
layout  : wiki
title   : Configuring a Load Test Environment with k6 + grafana + influxdb
summary : k6 + grafana + influxdb 를 사용하여 부하 테스트 환경 구성하기
date    : 2022-10-01 15:54:32 +0900
updated : 2022-10-01 20:15:24 +0900
tag     : infra
toc     : true
comment : true
public  : true
parent  : [[/infra]]
latex   : true
---
* TOC
{:toc}

## docker compose

```yaml
# docker compose -f docker-compose.yml up -d --build
version: '3.9'

services:
  influxdb:
    image: influxdb:1.7
    networks:
      - k6
      - grafana
    ports:
      - "8086:8086"
    environment:
      - INFLUXDB_DB=k6
  grafana:
    image: grafana/grafana:latest
    networks:
      - grafana
    ports:
      - "3000:3000"
    environment:
      - GF_AUTH_ANONYMOUS_ORG_ROLE=Admin
      - GF_AUTH_ANONYMOUS_ENABLED=true
      - GF_AUTH_BASIC_ENABLED=false
    volumes:
      - ./grafana:/etc/grafana/provisioning/
  k6:
    image: loadimpact/k6:latest
    networks:
      - k6
    ports:
      - "6565:6565"
    environment:
      - K6_OUT=influxdb=http://influxdb:8086/k6
    volumes:
      - ./samples:/scripts
  app-order:
    container_name: order
    build: ../application/order
    ports:
      - 8084:8084
    networks:
      - internal-network

networks:
  internal-network:
    driver: bridge
  k6:
    driver: bridge
  grafana:
    driver: bridge
```

## k6 설치

- [Homebrew](https://brew.sh/index_ko) 사용해서 설치

## InfluxDB 확인

- Docker CLI 에서 influx 입력
  - show databases 등의 명령어 수행

## Grafana 설정

- Configuration > DataSource 추가
- DataSource
  - URI: http://influxdb:8086 (도커 컨테이너상에서 호출해야하므로 컨테이너명을 적어야함)
- Dashboards > Import > Grafana.com Dashboard 항목에 2587을 입력하고, datasource 로 influxdb 를 설정한 후 import 해야 함
  - https://grafana.com/grafana/dashboards/2587

## k6 실행

- k6 run --out influxdb=http://localhost:8086/k6 smoke.js

## 함께 읽기

- [Test methods for improved availability and performance](https://baekjungho.github.io/wiki/infra/infra-load-stress-smoke/)

## Links

- https://intrepidgeeks.com/tutorial/load-test-with-k6
- https://k6.io/docs/
- https://github.com/grafana/k6
- https://k6.io/blog/load-test-your-kafka-producers-and-consumers-using-k6/
- https://k6.io/docs/javascript-api/
- https://k6.io/blog/integrating-k6-with-apache-kafka/
- https://issuecloser.com/blog/how-to-load-test-your-kafka-producers-and-consumers-using-k6
- https://medium.com/swlh/beautiful-load-testing-with-k6-and-docker-compose-4454edb3a2e3
- https://docs.influxdata.com/influxdb/v2.0/security/tokens/create-token/