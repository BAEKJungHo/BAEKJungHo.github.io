---
layout  : wiki
title   : Salted Challenge Response Authentication Mechanism
summary : Credentials Authentication Mechanism
date    : 2023-01-04 22:57:32 +0900
updated : 2023-01-04 23:21:24 +0900
tag     : auth kafka
toc     : true
comment : true
public  : true
parent  : [[/auth]]
latex   : true
---
* TOC
{:toc}

## SCRAM

__Salted Challenge Response Authentication Mechanism (SCRAM)__ 은 __credentials(username/password)__ 기반 인증 매커니즘이다.

- [MongoDB uses SCRAM to verify the supplied user credentials](https://www.mongodb.com/docs/manual/core/security-scram/)
- [Kafka Authentication using SASL/PLAIN](https://kafka.apache.org/documentation/#security_sasl_plain)

### Kafka Authentication using SASL/PLAIN

- Kafka supports `SCRAM-SHA-256` and `SCRAM-SHA-512` which can be used with TLS to perform secure authentication.
- [Configuring Kafka Brokers](https://kafka.apache.org/documentation/#security_sasl_scram_brokerconfig)

Kafka Broker 간 SASL/PLAIN 통신을 하기 위한 구성은 아래와 같다.

- __JAAS 파일을 각 Kafka 의 브로커 config 디렉터리에 추가__

```
KafkaServer {
    org.apache.kafka.common.security.scram.ScramLoginModule required
    username="admin"
    password="admin-secret";
};
```

- __JAAS 설정 파일을 JVM 매개변수로 각 Kafka 브로커에 전달__

```properties
-Djava.security.auth.login.config=/etc/kafka/kafka_server_jaas.conf
```

- __server.properties 에서 SASL 포트 및 SASL 메커니즘을 구성__

```properties
# SASL_PLAIN 으로 listener 를 추가하고 Broker 간의 내부 통신은 SASL/PLAIN 으로 한다는 의미이다.
listeners=SASL_SSL://host.name:port
security.inter.broker.protocol=SASL_SSL
sasl.mechanism.inter.broker.protocol=SCRAM-SHA-256 (or SCRAM-SHA-512)
sasl.enabled.mechanisms=SCRAM-SHA-256 (or SCRAM-SHA-512)
```

## Simple Authentication and Security Layer

__SASL/PLAIN__ 인증 방식은 username/password 를 통한 인증 방식이다. credentials 로 인증을 할 때에는 SSL 통신을 해야 plain text 가 노출되지 않는다.

## Java Authentication and Authorization Service

- [Documentation](https://docs.oracle.com/en/java/javase/11/security/java-authentication-and-authorization-service-jaas-reference-guide.html)
- [Guide To The Java Authentication And Authorization Service (JAAS)](https://www.baeldung.com/java-authentication-authorization-service)

## Links

- [Salted Challenge Response Authentication Mechanism](https://ko.wikipedia.org/wiki/Salted_Challenge_Response_Authentication_Mechanism)
- [RFC5802](https://www.rfc-editor.org/rfc/rfc5802)