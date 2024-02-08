---
layout  : wiki
title   : Background, Foreground State in App
summary : 
date    : 2024-02-05 15:02:32 +0900
updated : 2024-02-05 15:12:24 +0900
tag     : mobile
toc     : true
comment : true
public  : true
parent  : [[/mobile]]
latex   : true
---
* TOC
{:toc}

## Background, Foreground

- Foreground 상태란 사용자가 앱을 보고 있는 화면이다.
- Background 상태란 앱이 홈화면에 들어가서 사용자한테 보이지 않는 상태를 의미한다.
  - 하지만 앱이 background 상태가 되어도 계속 실행해야 될 때가 존재한다. (e.g 음악 스트리밍)
  - 예를 들어, 앱으로 차량 제어 시 차 문 열림 등은 Background 상태일 때도 알람을 받아야 한다. 이때, Firebase Cloud Messaging(FCM) 을 사용하면 된다.

## Apple Push Notification System

Apple Push Notification Service(APNs)는 Apple이 iOS, watchOS, tvOS, macOS 등의 운영 체제에서 사용되는 디바이스들에 푸시 알림을 보내는 시스템이다. 이 시스템은 앱 개발자가 자사 애플리케이션을 통해 사용자들에게 중요한 정보나 업데이트를 제공하는 데 사용된다.

APNs 를 사용하면 [app's life cycle](Managing your app’s life cycle) 의 Background 상태일때 사용자에게 중요한 정보를 전달할 수 있다.




