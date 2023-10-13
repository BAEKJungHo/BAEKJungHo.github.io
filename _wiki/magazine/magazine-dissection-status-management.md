---
layout  : wiki
title   : Dissection Status Management
summary : StatusDirector
date    : 2023-10-09 20:54:32 +0900
updated : 2023-10-09 21:15:24 +0900
tag     : magazine
toc     : true
comment : true
public  : true
parent  : [[/magazine]]
latex   : true
---
* TOC
{:toc}

## Dissection Status Management

Service Application 을 개발하다보면 상태(status) 관리가 엄청 중요하다. 상태 관리를 잘 하기 위한 몇가지 생각을 적어본다.

__Model, Status, User__:
- __Model__ 이란 상태(status)를 관리하는 주체를 의미한다.
- __Status__ 란 경과의 의미를 갖거나(예: 주문 상태), 정해져 있는 특정 시간이나 상황, 상태를 의미한다.
- __User__ 란 서비스 를 사용하는 사용자를 의미한다.
  - e.g 쇼핑 앱을 이용하는 Customer
  - e.g 택시 운전을 담당하는 Driver, 택시 앱을 이용하는 Rider

__Taxi Call App Scenario__:
- 운행중인 택시 차량(Model)의 경우 Driver(User)의 배차 승인(Action)을 통해서 DISPATCHED(Status)를 갖게 된다.
- 주문(Order) 의 경우 Rider(user) 의 배차 요청(action) 에 의해서 DISPATCH(status) 를 갖게 된다.

이렇듯, Model 에서 관리하는 Status 는 __User Action__ 에 의해서 변경된다.

하지만 항상 User Action 에 의해서만 변경되는 것은 아니다. 예를 들어, 주문의 특정 상태로의 변경은 __현재 운행중인 차량의 상태__ 와 __User Action__ 의 조합으로 이뤄질 수도 있다.
또한 상태 변경은 단일 User Action 에 의해서만 일어나지 않는다. 시스템 내부 로직에서 event trigger 로 인해서 상태가 변경될 수도 있고, 그 외 다양한 케이스가 생길 수 있다.
한 마디로 정의하자면 __Service policy__ 에 영향을 받는다. 즉, 상태의 변경은 서비스 요구사항(정책) 에 따라 영향을 받게 된다.

### Director

Google 에 director 의미를 검색하면 다음과 같이 나온다.

> A person who is in charge of an activity, department, or organization

이제 부터 소스로 설명할 __StatusDirector__ 는 상태 관리를 담당하는 __책임(responsibility)을 갖는 객체__ 를 의미한다.

```kotlin
class DrivingVehicleStatusDirector(
    // Sync to RDBMS, Redis, Firestore etc...
    private val drivingVehicleStatusSyncHelper: DrivingVehicleStatusSyncHelper,
) {
    /**
     * Change status of vehicle
     * @param vehicle Model
     * @param action User Action
     */
    fun changeStatus(vehicle: Vehicle, action: Action) {
        when (action) {
            /**
             * Write Policy (e.g. Vehicle can be dispatched only when it is IDLE)
             */
            Action.DRIVER_DISPATCH -> {
                vehicle.status = Status.DISPATCHED
            }
            Action.DRIVER_ARRIVED -> {
                vehicle.status = Status.ARRIVED
            }
            Action.DRIVER_START_DRIVE -> {
                vehicle.status = Status.DRIVING
            }
            Action.DRIVER_END_DRIVE -> {
                vehicle.status = Status.IDLE
            }
            else -> {
                throw IllegalArgumentException("Invalid action: $action")
            }
        }
        drivingVehicleStatusSyncHelper.sync(vehicle)
    }   
}
```

위 코드의 핵심은 정책을 코드로 문서화 하고, 상태 변경의 책임을 하나의 객체가 담당하게 하는 것이다.

__pseudocode__:

```kotlin
class StatusDirector(
    // Sync to RDBMS, Redis, Firestore etc...
    private val syncHelper: SyncHelper,
) {
    /**
     * Write Policy (e.g. Vehicle can be dispatched only when it is IDLE)
     */
    fun changeStatus(model: Model, action: Action) {
        vehicle.status = Status.DISPATCHED
        drivingVehicleStatusSyncHelper.sync(vehicle)
    }   
}
```

추가로 복잡한 상태를 관리해야 할 때, Front 에서 Firestore 와 같은 실시간 동기화 저장소에 있는 특정 값을 구독하고 있다가
변경이 일어났을때 Event Trigger 형식으로 Server API 를 찌르는 방식은 상태 관리를 어렵게 만든다.

최대한 User Action 에 의해서 동작되게 만들려고 노력하고, Server 내부 로직에 의해서 Trigger 가 되어야 하는 경우에는 꼭 문서화를 해야한다.