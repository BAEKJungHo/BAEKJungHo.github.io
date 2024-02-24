---
layout  : wiki
title   : Perfectly Keyless, Wireless digital key system
summary : Car Connectivity Consortium NFC digital key specification
date    : 2024-02-21 15:54:32 +0900
updated : 2024-02-21 20:15:24 +0900
tag     : mobility digitalkey
toc     : true
comment : true
public  : true
parent  : [[/mobility]]
latex   : true
---
* TOC
{:toc}

## Perfectly Keyless by Digital Key

Perfectly keyless is a keyless vehicle access system. Both passive __vehicle access and start are controlled by a digital key on a mobile phone__. Also, perfectly keyless offers the driver greater __convenience and flexibility__. An app allows the vehicle owner to grant other users access to their vehicle. For this, an additional key is sent by cloud.

Perfectly keyless 를 사용하면 스마트폰을 주머니에 넣는 것만으로도 충분하다. 차량 접근 시스템은 운전자와 스마트폰이 가까워지면 자동으로 차량의 잠금을 해제한다.

이러한 완벽한 keyless 방식은 __UWB(Ultra-Wide band)__ 을 기반으로 한다. UWB 는 단거리 무선 통신 프로토콜이다.
UWB 를 사용하면 근거리 무선기기간 통신과 무선 기기간의 거리 측정이 가능하다는 장점이 있다. 이러한 UWB 측위 기술이 자동차 업계에서도 Perfectly Keyless 방식을 구현하는데 중요한 역할을 한다.

자동차 키 응용에서도 자동차의 여러 위치에 놓여진 UWB Anchor 가 운전자의 스마트키(UWB Tag)를 인식하여 스마트키를 가지고 있는 운전자가 차로 다가오는 위치를 정확히 파악하는데 사용된다.
자동차 키 응용에서 사용되는 UWB 측위 기술을 __Network-centric__ 방식이라고 한다. 절대 위치 기반이다.

Digital Key 는 근거리무선통신(NFC, Near Field Communication) 기술을 하고 있으며, 근거리무선통신은 스마트폰 결제시스템이나 스마트폰 교통카드 등에서 이미 사용되고 있는 기술이다.
Bluetooth 저에너지(BLE) 및 초 광대역 무선 연결(UWB)을 활용하여 패시브 위치 인식 Keyless 액세스를 지원하여 모바일 기기를 가방이나 주머니에서 꺼내지 않아도 차량 접속 가능하다.

### Wireless digital key system compliant with the CCC’s global standard specification

__Wireless digital key system__:

![](/resource/wiki/mobility-digital-key/wireless-digital-key-system.png)

- [Car Connectivity Consortium unveils NFC digital key specification](https://www.nfcw.com/2020/05/07/366483/car-connectivity-consortium-unveils-nfc-digital-key-specification/)
- [Alps Alpine and Giesecke+Devrient Jointly Develop Wireless Digital Key System Based on CCC Specification](https://www.alpsalpine.com/e/news_release/2022/0426_01.html)
- [국제 표준 기반 Digital Key 국내 솔루션 아키텍처 - AutoCrypt]([차량과 디바이스간의 상호운용이 가능한 AutoCrypt Digital Key](https://autocrypt.co.kr/autocrypt-digitalkey/))

## Links

- [CCC Digital Key Certification](https://carconnectivity.org/digital-key/ccc-digital-key-certification/)
- [The future of digital car keys: Q&A with Car Connectivity Consortium vice president Daniel Knobloch](https://members.nfcw.com/99365/the-future-of-digital-car-keys-car-connectivity-consortium-daniel-knobloch/)
- [BOSCH Digital Vehicle Key - Digital Key Transfer](https://www.bosch-mobility.com/en/solutions/software-and-services/perfectly-keyless/?gad_source=1&gclid=Cj0KCQiAxOauBhCaARIsAEbUSQSN7bFWCxd8_Xu31jVBvKTSYdHRnqHIKG4P33O_lhxdSZ496_wAFTYaAvxWEALw_wcB)
- [Bosch wants to replace your car keys with a smartphone and an app](https://www.digitaltrends.com/cars/bosch-perfectly-keyless-technology-provides-convenience-safety/)
- [Custom digital key development solution in compliance with CCC - AutoCrypt](https://autocrypt.io/products/digital-key/)