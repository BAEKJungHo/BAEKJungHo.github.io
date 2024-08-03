---
layout  : wiki
title   : BLE Advertising Primer
summary : 
date    : 2024-08-01 12:54:32 +0900
updated : 2024-08-01 17:15:24 +0900
tag     : mobility ble
toc     : true
comment : true
public  : true
parent  : [[/mobility]]
latex   : true
---
* TOC
{:toc}

## BLE Advertising Primer

BLE ___[광고(Advertising)](https://www.argenox.com/library/bluetooth-low-energy/ble-advertising-primer/)___ 는 Bluetooth Low Energy(Bluetooth Smart) 에 중요한 역할을 한다.
Bluetooth 를 활성화하면 배터리가 더 빨리 소모되기 때문에, BLE 는 주변 기기의 전력 소모를 극도로 낮추기 위해 설계되었다.

스마트폰에서 사용되는 전력의 대부분은 광고 스캐닝에서 나온다. 이 때문에 Android 와 iOS는 스캐닝, 특히 백그라운드 스캐닝을 상당히 제한한다.

__Advertising Mode__:
- 디바이스가 자신의 존재를 알리고 연결 가능함을 브로드캐스트한다.
- 주기적으로 작은 데이터 패킷을 전송한다.
- 전력 소비가 낮고, 연결 없이 데이터를 전송할 수 있다.

__Connected Mode__:
- 두 디바이스 간에 양방향 통신 채널이 설정된다.
- 더 많은 데이터를 교환할 수 있고, 보안 연결이 가능하다.
- 주기적인 데이터 전송이나 명령 수행 등에 사용된다.

비콘은 연결을 허용하지 않고 광고만 사용하는 BLE 주변 기기를 의미한다. 광고를 사용하여 주변의 모든 장치에 패킷을 브로드캐스트한다. 즉, 패킷을 전송하기만 한다.

## References

- [CCC Digital Key – The Future of Vehicle Access](https://carconnectivity.org/wp-content/uploads/2022/11/CCC_Digital_Key_Whitepaper_Approved.pdf)
- [BLE ADVERTISING PRIMER](https://www.argenox.com/library/bluetooth-low-energy/ble-advertising-primer/#ble-beacons-and-ibeacons)
- [Apple iBeacon](https://developer.apple.com/ibeacon/)