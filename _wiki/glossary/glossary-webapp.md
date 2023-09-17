---
layout  : wiki
title   : Mobile Web, WebApp, NativeApp, HybridApp
summary : 
date    : 2022-11-19 15:05:32 +0900
updated : 2022-11-19 15:15:24 +0900
tag     : glossary
toc     : true
comment : true
public  : true
parent  : [[/glossary]]
latex   : true
---
* TOC
{:toc}

## Web

- Web: 기기에 상관없이 브라우저를 통해 이용
- 반응형 웹
  - 브라우저 크기에 맞게 자동으로 페이지 크기가 변경
- 적응형 웹
  - PC, Phone, 태블릿 등 화면 사이즈 별로 각각 페이지 개발

## Mobile Web, Web App

![](/resource/wiki/term-webapp/webapp.png)

- __Mobile Web__
  - 모바일 기기의 화면 크기에 맞게 디자인된 웹
- __Web App__
  - 모바일 웹보다 좀 더, 앱(Native) 처럼 디자인된 웹
  - 웹 앱은 SPA(Single Page Application)를 사용함
    - SPA 는 주로 Ajax 같은 비동기 기법을 사용
- __공통점__
  - 브라우저에 URL 을 입력해 호출할 수 있는 모바일 화면 크기에 맞게 구현된 웹사이트
- __장점__
  - 플랫폼(Android, iOS)에 상관없이 한 개의 소스로 개발할 수 있다.
  - 배포 검수 불필요
  - 수정된 소스를 서버에 반영하면, 즉시 적용 가능
- __단점__
  - 기기(하드웨어)를 제어할 수 없어 카메라, 저장소, GPS 등을 사용할 수 없다.
  - 화면에 보이는 모든 영역을 서버에서 불러와, 네이티브 앱보다 속도가 느리다.

## Native App

- 모바일 기기에 설치해 사용하는 프로그램
- 앱에 노출되는 화면의 틀은 최초 설치 때, 기기에 저장(용량 차지)
- 소스를 수정하면 앱 업데이트를 해야 함
  - 앱 사용자에게 앱 구동 시, 팝업창 노출
  - 업데이트 종류 선택(선택 업데이트, 강제 업데이트)
  - iOS 의 경우 변동사항을 배포하기 전에 __애플의 앱 검증__ 을 거쳐야 한다.
- 틀 안의 텍스트, 이미지, 영상 등 데이터는 필요할 때 마다 서버와 통신
  - e.g Youtube App, Instagram App, Facebook App
- __장점__
  - 이미 기기에 설치된 영역이 있기 때문에, 서버와 주고 받는 데이터양이 적다. 따라서 화면 로딩 속도가 빠르다.
- __단점__
  - Android, iOS 플랫폼을 별도로 개발해야 한다. 따라서 개발 비용이 증가한다.

### Internet-free Native App

- 휴대폰을 처음 샀을 때, 이미 설치 되어 있는 기본 앱
- 비행기 모드에서도 기능에 아무 문제 없는 앱
- 앱에서 사용되는 모든 프로그램 데이터를 기기에 설치
- e.g 시계, 카메라, 전화 앱 등

## Hybrid App

- Native App 과 Mobile Web 의 장점을 결합
- 속도가 빨라야 하는 부분은 Native 로 개발하고, 수정이 잦고 빠르게 개발해야 하는 곳은 Mobile Web 으로 개발
  - e.g Naver App, Kakao App

## Links

- [6년차 개발자가 알려주는 개발용어 4. 모바일웹, 웹앱, 네이티브앱, 하이브리드앱](https://www.youtube.com/watch?v=2HnYWwOvMVU)