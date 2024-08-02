---
layout  : wiki
title   : DigitalKey
summary : 
date    : 2024-08-02 10:54:32 +0900
updated : 2024-08-02 11:15:24 +0900
tag     : mobility digitalkey
toc     : true
comment : true
public  : true
parent  : [[/mobility]]
latex   : true
---
* TOC
{:toc}

## The Future of Vehicle Access is Digital Key

Digital Key 란 스마트폰이 차량의 키가 된다는 것이다. Digital Key 를 사용하면 차량의 문을 열고 시동을 거는 등의 제어를 수행할 수 있다.

![](/resource/wiki/mobility-digital-key/digitalkey-ccc.png)

Digital Key 는 _[Digital Wallet](https://en.wikipedia.org/wiki/Digital_wallet)_ 에 저장된다.
- [Add your car key to Apple Wallet on your iPhone or Apple Watch](https://support.apple.com/en-us/118271)

그리고 Wallet 을 통해서 서로 공유가 가능하다. _[Kia Digital Key 2](https://sweb.owners.kia.us/content/owners/en/digital-key.html)_ 의 경우에는 공유 인원 수를 최대 3명으로 제한하고 있다.

### Generation

Digital Key 1 의 경우에는 _[NFC](https://namu.wiki/w/NFC)_ 만을 사용하기 때문에 스마트폰을 차 손잡이에 갖다 대어야 차량이 열리고, 스마트폰을 NFC Reader 같은 기기에 올려둬야 시동을 걸 수 있었다.
즉, NFC 기반의 Digital Key 는 스마트폰을 호텔 카드 키 처럼 사용하는 것이다.

Digital Key 2 의 경우에는 기존 버전의 호환성을 위해 NFC 와 더불어 _[UWB](https://en.wikipedia.org/wiki/Ultra-wideband)_ 기술까지 지원한다. _[Genesis GV60](https://namu.wiki/w/%EC%A0%9C%EB%84%A4%EC%8B%9C%EC%8A%A4%20GV60?from=GV60)_ 차량에 해당 기술이 적용되었다.
Android 는 물론 Apple 의 _[CarKey API](https://developer.apple.com/documentation/CarKey)_ 도 지원한다. UWB 기술을 사용하게 되면, 측위(UWB)를 통해 스마트폰의 위치를 파악하여 더 먼 거리에서도 차 문이 열리도록 할 수 있다.

Digital Key 3 의 경우에는 NFC, UWB 와 더불어 _[BLE](https://baekjungho.github.io/wiki/mobility/mobility-ble/)_ 까지 지원한다.

### Car Connectivity Consortium Based Architectures

_[CCC(Car Connectivity Consortium)](https://carconnectivity.org/)_ 는 스마트폰과 자동차 간 커넥티비티 솔루션 선도하는 국제 기술 표준화 단체이다.

_[AutoCrypt](https://autocrypt.co.kr/autocrypt-digitalkey/)_ 에서는 _[CCC 표준](https://carconnectivity.org/wp-content/uploads/2022/11/CCC_Digital_Key_Whitepaper_Approved.pdf)_ 을 만족하는 Digital Key 솔루션을 만든다.

### Digital Key Provisioning

Digital Key Provisioning 은 Digital Key 를 사용하기 위한 준비 과정(등록 과정)을 의미한다. 사용자와 직접적인 연관이 있는 Provisioning 의 경우에는 Seamless 하게 제공되는 사용자 경험 측면에서 중요하다.
CCC 표준을 따르지 않는 Digital Key 와 CCC 표준을 따르는 Digital Key 는 서로 다른 Provisioning 단계를 거칠 것이다.

- [Hyundai 디지털 키 등록하기](https://www.hyundai.com/kr/ko/digital-customer-support/app/digital-key-2/digital-key-registration)
- [Use your BMW Digital Key with the MyBMW App and unlock endless joy - Youtube](https://www.youtube.com/watch?v=tHk9iUn-bnA)

Provisioning 단계가 끝나면 스마트폰만으로 차량에 접근하여 문을 열고, 차량의 시동을 걸 수 있다. 