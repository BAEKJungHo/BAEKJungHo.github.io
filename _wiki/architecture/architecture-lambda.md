---
layout  : wiki
title   : Lambda Architecture to handle massive quantities
summary : Batch RealTime Architecture
date    : 2023-03-06 15:02:32 +0900
updated : 2023-03-06 15:12:24 +0900
tag     : architecture
toc     : true
comment : true
public  : true
parent  : [[/architecture]]
latex   : true
---
* TOC
{:toc}

## Lambda Architecture

[Lambda architecture](https://en.wikipedia.org/wiki/Lambda_architecture) is a data-processing architecture designed to handle massive quantities of data by taking advantage of both batch and stream-processing methods.

통계(statistics)를 위한 DashBoard 를 만드는 경우 통계 자료를 어떤식으로 클라이언트에게 제공을 해야 할까? 통계 자료가 실시간으로 봐야하는건지 혹은 특정 시점에만 제공되면 되는지가 중요하다.

따라서 크게 2가지 관점으로 접근할 수 있다.

1. 실시간(real-time)
2. 배치(batch)

데이터가 많지 않은 경우에는 요구사항이 "특정시점에만 제공해줘도 된다" 하더라도 1번으로 처리해도 문제가 없을 것이다. 통계를 위한 API 들을 제공해주고, API 호출될 때마다 Query 를 사용하여 RDBMS 를 조회하는 방법이다.

항상 문제는 __대용량(massive quantities)__ 을 다룰때 발생한다. 데이터가 많으면 어떻게 해야할까?

결론 부터 말하면, 데이터를 __실시간성 데이터(real-time data)__ 와 __배치 데이터(batch data)__ 로 구분해야 한다. 당일 00:00~23:99 까지가 실시간성 데이터를 의미하고, 과거의 날짜들이 배치 데이터에 해당한다. 실시간 집계 테이블과 배치 테이블로 구분하여 (배치는 매일 돌아감) Join 을 통해서 Aggregation 할 수 있다. Aggregate data from Batch view and real-time view.

![](/resource/wiki/architecture-lambda/lambda-layer.png)

__즉, 배치 레이어를 두는 것은 실시간 데이터를 매우 짧은 Latency 로 쿼리로 사용하기 위함이다.__

Nathan Marz 는 Lambda Architecture 를 __Batch/RealTime Architecture__ 라고 명명했다.

### Batch Layer

배치 레이어는 매우 많은 양의 데이터를 처리할 수 있는 분산 처리 시스템을 사용하여 결과를 미리 계산한다. Apache Hadoop, Snowflake 및 Big Query 같은 관계형 데이터베이스들이 이 역할에 사용된다.

### Speed Layer

스피드 레이어는 데이터를 실시간으로 처리한다. 이 계층은 최신 데이터에 대한 실시간 보기를 제공하여 대기 시간을 최소화하는 것을 목표로 하기 때문에 처리량을 희생한다. Apache Kafka, Apache Spark, Azure Stream Analytics 등이 이 역할에 사용된다.

### Serving Layer

배치 및 속도 레이어의 출력은 서빙 레이어에 저장되며 미리 계산된 뷰를 반환하거나 처리된 데이터에서 뷰를 작성하여 임시 쿼리에 응답한다.
서빙 레이어에서 사용되는 기술의 예로는 두 레이어의 출력을 처리하는 단일 클러스터를 제공하는 Druid 가 있다. 

서빙 레이어에서 사용하는 저장소로는 Apache Cassandra, Apache HBase, Azure Cosmos DB, MongoDB 등이 사용된다.

## Links

- [Lambda Architecture: Design Simpler, Resilient, Maintainable and Scalable Big Data Solutions](http://www.infoq.com/articles/lambda-architecture-scalable-big-data-solutions)
- [빅데이타 분석을 위한 람다 아키텍쳐 소개와 이해](https://bcho.tistory.com/984)
- [How SmartNews Built a Lambda Architecture on AWS to Analyze Customer Behavior and Recommend Content](https://aws.amazon.com/ko/blogs/big-data/how-smartnews-built-a-lambda-architecture-on-aws-to-analyze-customer-behavior-and-recommend-content/)