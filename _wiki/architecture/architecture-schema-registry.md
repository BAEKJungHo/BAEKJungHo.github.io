---
layout  : wiki
title   : Schema Registry
summary : 
date    : 2023-05-12 15:02:32 +0900
updated : 2023-05-12 15:12:24 +0900
tag     : architecture cloudnative designpattern
toc     : true
comment : true
public  : true
parent  : [[/architecture]]
latex   : true
---
* TOC
{:toc}

## Schema Registry

Asynchronous Messaging Pattern 을 사용하는 경우 메시지나, 데이터 타입의 신뢰성과 안전한 비동기 메시징을 구현하기 위해서
__Schema Based Serialize & Deserialize__ 를 도입하는게 좋다. 여기서 말하는 Schema 란 통신에 참여하는 주체들이 주고받는 데이터를 정의하고 검증할 수 있는 정보가 담겨져 있다.

물론, 생산자와 소비자 측에서 스키마 기반으로 메시지를 검증해야 하니 성능상 부하가 발생할 수 밖에 없지만, 이 부분은 스키마 정보를 가져오는 등의
병목을 피하기 위해서 Caching 을 도입할 수 있다.

스키마 정의에 Apache Avro, Protocol Buffer, JSON Schema 와 같은 다양한 기술을 사용할 수 있다. 카프카 스키마 레지스트리를 사용하면
메시지에 대한 스키마를 저장하고 조회할 수 있고, 앞서 말한 형태의 스키마들을 모두 저장할 수 있다. 따라서 메시지를 생산하거나 소비하는 과정에서
스키마 기반으로 메시지를 검증할 수 있다.

__[Schema Registry Key Concepts](https://docs.confluent.io/platform/current/schema-registry/fundamentals/index.html):__

![](/resource/wiki/architecture-schema-registry/schema-registry-and-kafka.png)

## References

- Design Patterns for Cloud Native Applications / Kasun Indrasiri, Sriskandarajah Suhothayan Author / O'REILLY

