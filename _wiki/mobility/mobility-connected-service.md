---
layout  : wiki
title   : CONNECTED SERVICE
summary : 
date    : 2024-09-07 12:54:32 +0900
updated : 2024-09-07 17:15:24 +0900
tag     : mobility architecture realworld
toc     : true
comment : true
public  : true
parent  : [[/mobility]]
latex   : true
---
* TOC
{:toc}

## CONNECTED SERVICE

A ___[connected service](https://en.wikipedia.org/wiki/Connected_car)___ is a system that connects a vehicle to app to provide various functions and services.

![](/resource/wiki/mobility-connected-service/tesla-app.png)
*<small><a href="https://screenrant.com/tesla-account-best-security-practices-explained/">Best Security Practices For Your Tesla Account, Explained</a></small>*

Connected Service 의 주요 기능으로는 아래와 같다.

- 차량 구매(Purchase Vehicle)
- 원격 제어(Remote Control): 스마트폰 앱을 통한 차량 잠금/해제(access vehicle), 공조(climate) 제어 등
- 실시간 차량 상태 모니터링: 배터리 잔량, 위치 등 확인
- 내비게이션 및 실시간 교통 정보
- 소프트웨어 무선 업데이트(OTA)
- 엔터테인먼트 시스템 연동(IVI)
- 긴급 상황 자동 알림

__Connected Service Features__:

![](/resource/wiki/mobility-connected-service/mindmap.png)

Connected Service 를 구현하기 위해서 필요한 ___[Connectivity Type](https://www.compassiot.com.au/media/the-different-types-of-vehicle-connectivity)___ 은 아래와 같다.

| Type                  | Description                                                                                         |
|-----------------------|-----------------------------------------------------------------------------------------------------|
| Vehicle To Cloud(V2C) | 5G 와 같은 인터넷과 모바일 네트워크를 활용하여 Cloud 에 데이터를 저장하고 교환한다. OTA 및 Profile 별 시트, 미러 등의 차량 기본 설정 정보 저장 등이 있다. |
| Vehicle To Device(V2D) | 차량이 모든 스마트 기기와 정보를 공유할 수 있으며, 그 반대도 가능 하다. 예를 들어 Apple Carplay 를 사용하여 자동차 내부의 인포테인먼트 시스템에 연결 등을 할 수 있다. |

차량과 모바일간 데이터 교환을 위해서는 ___[Cloud](https://www.samsungsds.com/kr/cloud-glossary/what-is-cloud.html)___ 가 핵심이라는 것을 알 수 있다.

이제 Connected App 을 어떻게 구성할 지 및 핵심 기능 중 하나인 ___Vehicle Control___ 기능을 구현할 때 주의해야하는 기술적인 부분에 대해서 다뤄보자.

Connected App 은 다양한 기능(차량 구매, 제어, OTA 등)을 포함한다. 모든 기능을 하나의 애플리케이션으로 구성하면 ___SPOF(單一障礙點, Single Point Of Failure)___ 이 된다. 하나의 기능이 고장 나면 App 자체를 쓸 수 없게 된다.
따라서 기능 별로 Application 을 구성하는 형태가 될 것이다.

Vehicle Control 를 담당하는 Application 을 구성한다고 가정해보자. Kakao, LINE 등 다양한 슈퍼앱을 살펴보면 '공통 영역(common area)' 이 존재한다. 
이 공통 영역(회원, 인증, 공지사항, FAQ, 약관, 알림 등)을 별도의 Application 으로 분리해야 한다. Connected Service 에서 Vehicle Control 은 중요한 기능이지만 일시적으로 사용 불가능한 상태가 되더라도 Critical 하진 않다. 왜냐하면 직접 조작하면 되기 때문이다.
이때 Vehicle Control 기능이 먹통이라고 해서 공통 영역과 그 외 기능들 까지 먹통이 되면 안된다.

Vehicle 은 기본적으로 Network 가 불안정 하다는 것을 가정해야 한다. 이 말은 즉, 차량으로 제어 명령을 내려도 Network 가 끊겨서 Timeout 이 빈번하게 발생할 수 있다는 점이다.

Multi-Thread Application 에서 Timeout 이 자주 발생할 수 있다는 것은, ___Timeout 으로 인해 Thread-Hang 이 발생___ 할 수 있다는 것을 암시한다.

__Network Timeout by Vehicle__:

![](/resource/wiki/mobility-connected-service/vehicle-control-architectures.png)
*<small>Vehicle Control Architecture</small>*

대략 위와 같은 아키텍처에서, Vehicle 에서 부터 Network Timeout 이 발생한 경우 Vehicle Control Server 는
(서버에 설정된) Timeout 시간 까지 Thread 를 점유하게 되고, 요청 수가 많아지면 Thread Hang 이 발생할 것이다.

이러한 Microservice Architecture 에서 Network Timeout Handling 을 위한 Design Pattern 이 ___[Circuit Break & Fallback](https://baekjungho.github.io/wiki/architecture/architecture-circuit-breaker/)___ 이다.

Vehicle Network 가 불안정하여 Remote Control 기능을 사용할 수 없더라도, 나머지 모든 기능은 사용 가능해야 한다. 
따라서, Network Timeout 이슈가 해결되기 까지 앱에서는 Notification or Cloud Database 를 통해 해당 기능을 사용할 수 있는 상태인지 알 수 있어야 한다.
