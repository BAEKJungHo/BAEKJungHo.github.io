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

서버리스(serverless)란 개발자가 서버를 관리할 필요 없이 애플리케이션을 빌드하고 실행할 수 있도록 하는 클라우드 네이티브 개발 모델이다.

> 독립적으로 분리되어 배포될 수 있는 조각으로 구성된 애플리케이션(Micro Service)을 Cloud Native Application 이라고 한다.
>
> Amazon API Gateway 와 AWS Lambda 를 연동해서 서버 컴퓨터를 미리 확보할 필요 없이, 서버의 규모에 대한 고민 없이 코드만 작성해서 애플리케이션을 구축하는 할 수 있다. 이 두 개의 기술은 AWS 의 Serverless 의 핵심적인 역할을 담당하는 기술이다.
 
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

## Links

- [AWS Lambda](https://docs.aws.amazon.com/ko_kr/lambda/latest/dg/welcome.html)
- [Amazon API Gateway](https://docs.aws.amazon.com/ko_kr/apigateway/latest/developerguide/welcome.html)