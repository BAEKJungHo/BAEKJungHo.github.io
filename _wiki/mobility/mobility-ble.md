---
layout  : wiki
title   : BLE Technology Driving Connected Car Innovation 
summary : The Future of Efficient Vehicle Connectivity
date    : 2024-08-01 12:54:32 +0900
updated : 2024-08-01 17:15:24 +0900
tag     : mobility bluetooth
toc     : true
comment : true
public  : true
parent  : [[/mobility]]
latex   : true
---
* TOC
{:toc}

## Bluetooth

Bluetooth 는 2.4-2.485GHz 분산 스펙트럼에서 작동하는 저전력 NFC 용 범용 프로토콜이다. 
추가 보안 제어를 위해 Bluetooth 는 초당 1,600 홉(hop)으로 주파수를 ___[hopping](https://hoo-story.tistory.com/14)___ 한다.
Bluetooth 범위의 최소 사양은 10m 이며 최대 100m 까지 갈 수 있다. 

### Pairing

휴대폰과 같은 Bluetooth Device 를 휴대폰에 연결하는 것을 Pairing 이라고 한다. Bluetooth Device 를 페어링 모드로 설정해 검색 가능하게 하면
디바이스는 실제로 이름, 클래스, 지원되는 서비스 목록 및 기술 정보를 포함해 세부 정보를 전송한다.

두 디바이스가 실제로 페어링 되면(Mobile <-> Vehicle 등) 사전에 공유한 비밀키(pre-shared secret key)라고 하는 것을 교환한다.
각 Bluetooth Device 는 이 키를 저장해 향후 페어링에서 다른 Device 를 식별하게 되므로, 휴대폰에서 페어링된 장치를 기억하므로, 계속해서 페어링 프로세스를 거칠 필요가 없게 된다.

모든 Bluetooth Device 에는 고유한 48비트 식별자가 있다. Bluetooth 디바이스가 서로 페어링 되면 하나의 마스터가 최대 7개의 활성화된 슬레이브와 통신할 수 있는 ___[piconet](https://en.wikipedia.org/wiki/Piconet)___ 이라는 것을 생성한다.
피코넷은 Bluetooth 기술 프로토콜을 사용하여 무선 사용자 그룹 장치를 연결하는 ___[임시 네트워크(ad-hoc network)](https://en.wikipedia.org/wiki/Ad_hoc_network)___ 이다.

__Piconet Topology__:

![](/resource/wiki/mobility-ble/piconet.png)

Bluetooth 는 주파수 호핑을 사용하기 때문에 이러한 장치의 통신은 주파수 충돌 가능성이 거의 없기 때문에 서로 간섭하지 않는다.

### BTScanner

BTScanner 는 Bluetooth 장치에 대한 정보를 검색하고 수집하는데 사용되는 리눅스 기반 도구이다.
정상 작동 시에는 브로드캐스트 모드에서 장치를 검색하지만 브로드캐스팅 하지 않는 장치도 검색할 수 있다.

Bluetooth 인터페이스를 발견하고 BTScanner 로 다음과 같은 정보를 확인할 수 있다.

- Bluetooth MAC 주소
- Class - 장치가 무엇인지 구체적으로 알려주는 장치의 기능을 기반으로 할당된 16진수 값 (e.g 스마트폰, 데스크톱 컴퓨터, 무선 헤드셋)
- Bluetooth 로 이용 가능한 서비스
- LMP 버전(사용중인 Bluetooth 버전)
- 제조사
- 기능
- 클럭 오프셋(클럭 주기를 동기화 하는데 사용)

## Bluetooth Low Energy

BLE(Bluetooth Low Energy)는 Connected Car 시장의 OEM 사이에서 점점 인기를 얻고 있다. BLE 를 통해 Driver 가 자동차를 잠금 해제하고 시동할 수 있다.

### Advertising Primer

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

- Hacking Connected Cars: Tactics, Techniques, and Procedures / Alissa Knight
- [CCC Digital Key – The Future of Vehicle Access](https://carconnectivity.org/wp-content/uploads/2022/11/CCC_Digital_Key_Whitepaper_Approved.pdf)
- [BLE ADVERTISING PRIMER](https://www.argenox.com/library/bluetooth-low-energy/ble-advertising-primer/#ble-beacons-and-ibeacons)
- [Apple iBeacon](https://developer.apple.com/ibeacon/)