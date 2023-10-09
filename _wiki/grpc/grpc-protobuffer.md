---
layout  : wiki
title   : Protobuffer
summary : 
date    : 2023-10-08 20:54:32 +0900
updated : 2023-10-08 21:15:24 +0900
tag     : grpc
toc     : true
comment : true
public  : true
parent  : [[/grpc]]
latex   : true
---
* TOC
{:toc}

## ProtoBuffer Faster than JSON

[gRPC](https://grpc.io/docs/languages/go/) 는 HTTP/2 위에서 [Protocol Buffers(protobuf)](https://protobuf.dev/)를 사용해 직렬화된 바이트 스트림으로 통신하므로 JSON 기반의 통신보다 속도가 빠르다.
Protocol Buffers are language-neutral, platform-neutral extensible mechanisms for serializing structured data.

Protobuf 의 장점은 성능적인 부분도 있지만 API 들의 __[source of truth](https://en.wikipedia.org/wiki/Single_source_of_truth)__ 가 된다는 장점이 있다. 또한 Proto File 만 배포하면 환경과 프로그램 언어에 구애받지 않고 서로 간의 데이터 통신이 가능하다.

## Stub

RPC 의 핵심 개념은 Stub 이다.

In distributed computing, a [stub](https://en.wikipedia.org/wiki/Stub_(distributed_computing)) is a piece of code that converts parameters passed between the client and server during a remote procedure call (RPC). The main purpose of an RPC is to allow a local computer (client) to invoke procedures on a remote computer (server).

![](/resource/wiki/grpc-protobuffer/stub.png)

[Interface Definition Language](https://en.wikipedia.org/wiki/Interface_description_language) 을 사용하여 호출 __Spec__ 을 정의하고 함수명, 인자, 반환값에 대한 데이터형이 정의된 IDL 파일을 rpcgen 으로 컴파일하면 stub code 가 자동으로 생성된다.

[banksalad](https://blog.banksalad.com/tech/production-ready-grpc-in-golang/#%EC%99%9C-grpc%EB%A5%BC-%EC%82%AC%EC%9A%A9%ED%95%98%EB%8A%94%EA%B0%80)의 경우에는 __idl__ 리포지토리에 protobuf 파일뿐 아니라 protoc 를 통해 변환된 Go, Java, Python, Swagger, Swift 파일 등이 있는 gen 폴더까지 git 에 포함해 관리하고 있다고 한다.

## FieldMask

__Practical API Design at Netflix__:
- [PART 1 - Using Protobuf FieldMask](https://netflixtechblog.com/practical-api-design-at-netflix-part-1-using-protobuf-fieldmask-35cfdc606518)
- [PART 2 - Protobuf FieldMask for Mutation Operations](https://netflixtechblog.com/practical-api-design-at-netflix-part-2-protobuf-fieldmask-for-mutation-operations-2e75e1d230e4)

[FieldMask](https://protobuf.dev/reference/csharp/api-docs/class/google/protobuf/well-known-types/field-mask.html#class_google_1_1_protobuf_1_1_well_known_types_1_1_field_mask)

## Grpc Gateway

[grpc gateway](https://github.com/grpc-ecosystem/grpc-gateway) 를 사용하여 gRPC 서비스가 기존 서비스들(HTTP JSON) 과의 호환을 지원하도록 할 수 있다.

## Links

- [AWS - The difference between grpc and rest](https://aws.amazon.com/ko/compare/the-difference-between-grpc-and-rest/)
- [NAVER CLOUD PLATFORM - 시대의 흐름, gRPC 깊게 파고들기 #1](https://medium.com/naver-cloud-platform/nbp-%EA%B8%B0%EC%88%A0-%EA%B2%BD%ED%97%98-%EC%8B%9C%EB%8C%80%EC%9D%98-%ED%9D%90%EB%A6%84-grpc-%EA%B9%8A%EA%B2%8C-%ED%8C%8C%EA%B3%A0%EB%93%A4%EA%B8%B0-1-39e97cb3460)
- [Banksalad - 프로덕션 환경에서 사용하는 golang과 gRPC](https://blog.banksalad.com/tech/production-ready-grpc-in-golang/#%EC%99%9C-grpc%EB%A5%BC-%EC%82%AC%EC%9A%A9%ED%95%98%EB%8A%94%EA%B0%80)
