---
layout  : wiki
title   : Serverless
summary : Amazon API Gateway, AWS Lambda
date    : 2022-06-28 15:54:32 +0900
updated : 2022-06-28 20:15:24 +0900
tag     : infra
toc     : true
comment : true
public  : true
parent  : [[/infra]]
latex   : true
---
* TOC
{:toc}

# Serverless

서버리스(serverless)란 개발자가 서버를 관리할 필요 없이 애플리케이션을 빌드하고 실행할 수 있도록 하는 [클라우드 네이티브](https://baekjungho.github.io/wiki/msa/msa-business-agility/) 개발 모델이다.

Amazon API Gateway 와 AWS Lambda 를 연동해서 서버 컴퓨터를 미리 확보할 필요 없이, 서버의 규모에 대한 고민 없이 코드만 작성해서 애플리케이션을 구축하는 할 수 있다. 이 두 개의 기술은 AWS 의 Serverless 의 핵심적인 역할을 담당하는 기술이다.
 
## AWS Lambda

> AWS Lambda 는 0.1 초 단위로 컴퓨터를 임대해주는 기술이다. AWS Lambda 는 코드가 실행 되는 순간 0.1 초 단위로 컴퓨터를 빌려주며, 코드의 동작이 끝나면 자동으로 컴퓨터를 반납한다.

- __API Gateway 를 Lambda 앞에 붙이면 Lambda 를 웹 서버 처럼 사용할 수 있다.__
  - 사용자가 API Gateway 의 endpoint 로 요청이 들어오면 Lambda 가 xml, json 등의 데이터를 생성하고 사용자는 API Gateway 를 통해서 정보를 받을 수 있다.
  - Lambda 에서 `Trigger` 를 구성하여 다른 서비스에서 어떠한 변화가 생겼을때 Lambda 를 실행 시킬 수 있다.
  - 그 중 가장 강력한 것은 Amazon API Gateway 이다.

### Trigger

> Lambda 가 강력한 이유 중 하나는 Trigger 를 통해서 다른 AWS Service 들과 연동이 된다는 것이다.

- Lambda > 추가 트리거를 통해서 트리거를 구성할 수 있다.
- __S3 + Lambda__
  - S3 에 Bucket(폴더)를 만들고, 해당 Bucket 에 파일이 업로드 될때 Lambda 를 실행 시킬 수 있다.
- __API Gateway + Lambda__
  - API Gateway 의 endpoint 로 요청이 들어오면 Lambda 가 xml, json 등의 데이터를 생성하고 사용자는 API Gateway 를 통해서 정보를 받을 수 있다.
- ...

## Amazon API Gateway

> API 는 사용하는 쪽과 사용되는 쪽 사이의 약속이다. 그 약속의 핵심은 사용방법이 변하지 않는다는 것이다. 그런데 API 를 제공하는 쪽에서는 여러가지 이유로 API 의 사용법이 달라질 수 있다. API 의 사용방법이 바뀌면 API 를 사용하는 수 많은 애플리케이션이 더 이상 동작하지 않게 된다. 이런 문제를 해결하기 위해서 존재하는 도구가 API Gateway 라고 불리는 제품들이다. API Gateway 를 사용하면 클라이언트 측의 코드를 바꾸지 않고도 API 를 자유롭게 변경할 수 있다.

- __API Gateway 의 장점__
  - 로깅
  - 액세스 제어
  - 모니터링
  - 인증
  - ... 등의 작업들을 통합적으로 관리할 수 있다.
- __API Gateway 의 구성 요소__
  - HTTP API
  - REST API
  - WebSocket API

![](/resource/wiki/infra-serverless/apigateway.png)

example.org 가 example.com 으로 통합되었다 하더라도 API Gateway 의 설정을 통해서 클라이언트의 코드 수정 없이 쉽게 변경할 수 있다.

## Links

- [AWS Lambda](https://docs.aws.amazon.com/ko_kr/lambda/latest/dg/welcome.html)
- [Amazon API Gateway](https://docs.aws.amazon.com/ko_kr/apigateway/latest/developerguide/welcome.html)
- [생활 코딩](https://www.youtube.com/watch?v=60goWpADp-I&list=PLuHgQVnccGMAMjC3Epa9oyF7ciAtX83o7&index=2)