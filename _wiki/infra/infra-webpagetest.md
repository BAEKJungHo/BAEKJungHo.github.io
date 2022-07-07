---
layout  : wiki
title   : Web Page Test
summary : 
date    : 2022-06-25 15:54:32 +0900
updated : 2022-06-25 20:15:24 +0900
tag     : infra
toc     : true
comment : true
public  : true
parent  : [[/infra]]
latex   : true
---
* TOC
{:toc}

## 주로 웹 서버에 영향을 받는 지표

![](/resource/wiki/infra-webpagetest/webserver.png)

- __Security score__
  - TLS 및 HTTP 헤더의 보안성
  - JS 라이브러리의 보안 취약성
- __First Byte Time__
  - 웹 서버에서 받은 컨텐츠의 첫 번째 바이트가 얼마만에 도착했는가?
  - 즉, 서버 응답시간 + 네트워크 비용
- __Keep-Alive Enabled__
  - TCP 연결을 재사용하기 위한 Keep-Alive 설정이 되어 있는가?
  - 그래서 매번 3-way-handshake 등의 과정을 거쳐 Connection 을 생성하지 않고 재사용하는지
- __Compress Transfer__
  - 스크립트 파일이 Content-Encoding 으로 압축되어 있는가?
  - gzip 압축 했는지?
- __Compress Image__
  - 이미지를 압축했는가?
  - 사용자는 이미지 품질에 따른 차이보다 네트워크 지연에 더 민감하다
- __Cache Static Content__
  - 정적 파일(JS, CSS, 이미지, 웹 폰트 등)이 캐싱 설정이 되어 있는가?
  - 전송 비용을 줄이는 것보다 불필요한 요청 수를 줄이는 것이 효과적
- __Effective use of CDN__
  - CDN 을 사용하는지
  - 이왕 받을거면 가까운데서 받는 것이 효율적

> 위 지표들이 우수하다면
> 
> CDN 덕분에 가까운데서 keep-alive 설정으로 connection 을 재사용하고 캐싱으로 요청 수를 최소화하여 gzip 압축을 통해 각 리소스의 전송 인코딩을 최적화하고 이미지를 압축하여 패킷 사이즈를 줄여 네트워크 비용을 줄일 수 있다.

## 정적 컨텐츠와 네트워크 상태에 영향을 받는 지표

![](/resource/wiki/infra-webpagetest/static.png)

- __First Contentful Paint__
  - 첫번째 이미지, 텍스트가 표시되는 시간을 의미
  - gzip 등의 압축이 큰 영향을 미친다
- __Speed Index__
  - 컨텐츠가 얼마나 빨리 표시되는지를 의미
  - JS/CSS 지연로딩하여 렌더링 차단 리소스를 제거해본다
- __Largest Contentful Paint__
  - 가장 큰 컨텐츠 요소가 화면에 렌더링 되는 시기를 의미
  - 최대 페인트 이미지를 미리 로드하거나, 압축하여 네트워크 비용을 줄인다
- __Cumulative Layout Shift + Total Blocking Time__
  - JS 설계에 영향을 받음
  
> 지표를 높이려면 gzip 압축학나 JS/CSS 지연로딩 하거나 불필요한 JS 를 제거하여 각 정적 리소스들의 전송 비용을 줄여 사용자 경험을 개선할 수 있다

## Links

- [NextStep 인프라 공방](https://edu.nextstep.camp/)
- [webpagetest](https://www.webpagetest.org/)