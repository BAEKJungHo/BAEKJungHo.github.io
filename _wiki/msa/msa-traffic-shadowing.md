---
layout  : wiki
title   : Traffic Shadowing
summary : 
date    : 2023-06-30 15:54:32 +0900
updated : 2023-06-30 20:15:24 +0900
tag     : msa
toc     : true
comment : true
public  : true
parent  : [[/msa]]
latex   : true
---
* TOC
{:toc}

## Traffic Shadowing

Traffic Shadowing 은 Production 환경에서 원본 트래픽을 복제하여 아직 공개 되지 않은 테스트 서버에 미러링을 수행하는 것이다.
이렇게 하면 테스트 서버에서 내가 만든 API 들이 실제 트래픽과 동일한 요청을 받기 때문에 Production 에 배포했을 때 어떤 문제가 생길지 미리 알 수 있다.

테스트 서버에 존재하는 특정 API 가 총 트래픽의 일부(%)만 수신하게 할 수도 있다. (Filter 같은 기술을 사용하면 될 듯 하다.)

Traffic 이 별로 없는 서비스라면 딱히 의미가 없을 것 같다.

## Links

- [오늘의집 MSA Phase 1. 백엔드 분리작업](https://www.bucketplace.com/post/2022-01-14-%EC%98%A4%EB%8A%98%EC%9D%98%EC%A7%91-msa-phase-1-%EB%B0%B1%EC%97%94%EB%93%9C-%EB%B6%84%EB%A6%AC%EC%9E%91%EC%97%85/)
- [MicroService Architecture Release Strategy](https://junhyunny.github.io/msa/msa-release/)