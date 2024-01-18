---
layout  : wiki
title   : Kafka Headers
summary : KIP-82 - Add Record Headers
date    : 2023-01-16 20:54:32 +0900
updated : 2023-01-16 21:15:24 +0900
tag     : kafka
toc     : true
comment : true
public  : true
parent  : [[/kafka]]
latex   : true
---
* TOC
{:toc}

## Kafka Headers

[KIP-82 - Add Record Headers](https://cwiki.apache.org/confluence/display/KAFKA/KIP-82+-+Add+Record+Headers#KIP82AddRecordHeaders-Motivation) 에서
Custom Headers 가 추가되었다. Spring 을 사용하는경우 Spring Integration 을 통해 Kafka 를 사용한다. 이때 Message(record) 를 생산(produce) 할 때 [ProducerRecord](https://kafka.apache.org/10/javadoc/org/apache/kafka/clients/producer/ProducerRecord.html) 클래스를 사용한다.

해당 클래스에서 headers 라는 필드가 추가되었다. headers 필드에 담는 경우 아래 Header 부분에 포함되며, ProducerRecord 의 value 에 headers 를 담아서 보낼 수도 있다.

```
Message =>
        Length => varint
        Attributes => int8
        TimestampDelta => varlong
        OffsetDelta => varint
        KeyLen => varint
        Key => data
        ValueLen => varint
        Value => data
        Headers => [Header] <------------ NEW Added Array of headers
         
Header =>
        Key => string (utf8) <------------------------------- NEW UTF8 encoded string (uses varint length)
        Value => bytes  <------------------------------------ NEW header value as data (uses varint length)
```

The 0.11.0.0 client introduced support for headers in messages. As of version 2.0, Spring for Apache Kafka now supports mapping these headers to and from spring-messaging [MessageHeaders](https://docs.spring.io/spring-kafka/reference/kafka/headers.html).

## Links

- [Using Spring for Apache Kafka](https://docs.spring.io/spring-kafka/reference/kafka.html)