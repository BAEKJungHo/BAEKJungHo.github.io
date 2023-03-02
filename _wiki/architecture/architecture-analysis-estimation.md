---
layout  : wiki
title   : Storage Estimation with Quantitative Analysis
summary : 정량적 분석을 통한 스토리지 측정
date    : 2023-02-28 15:02:32 +0900
updated : 2023-02-28 15:12:24 +0900
tag     : architecture
toc     : true
comment : true
public  : true
parent  : [[/architecture]]
latex   : true
---
* TOC
{:toc}

## Quantitative Analysis

음식 주문앱, 택시 호출 서비스 등과 같은 곳에서 실시간 위치 검색 서비스를 사용 중이다. 이러한 서비스를 구현하기 위해 지리 공간 인덱스(Geo-spatial Index)에 대한 백엔드 인프라 설계가 필요하다.

__Quantitative Analysis:__
 - We start with 200 million locations.
 - The growth rate is 25% each year

__Storage Estimation:__
- 위치는 title, type, description, lat, lon 으로 표시된다.
- 매개변수의 크기를 정해야 함
  - (title = 100 bytes, type = 1 byte, description = 1000 bytes, lat = 8 bytes, long = 8 bytes)
- 따라서 단일 위치에는 최소한 다음의 용량이 필요함
  - (100 + 1 + 1,000 + 16) bytes = ~1,120 bytes = ~1,200 bytes
- 2억개의 위치를 기반으로 서비스를 하는 경우 필요한 용량은 다음과 같음 (200 * 10⁶ * 1200 bytes = 240GB(Gigabytes))
- 여기에 정량적 분석에 나와있는 성장률을 가지고 5년을 계획한다면 다음과 같음

```
1st Year: 240 Gigabytes
2nd Year: (240 + 240 * .25) = 300 Gigabytes
3rd Year: (300 + 300 * .25) = 375 Gigabytes
4th Year: (375 + 375 * .25) = ~470 Gigabytes
5th Year: (470 + 470 * .25) = ~600 Gigabytes
```

따라서 최소 600GB 저장소가 필요함. 대략 1TB 로 잡고, AWS 같은 곳에서 제공하는 스토리지를 이용할 수 있다. 성장률이 더 높아지면 스토리지 또는 시스템이 더 필요할 수 있다.

__충분히 합리적인 데이터 크기와 증가를 염두에 두고 데이터를 기반으로 결정을 내리는 것이 중요하다.__

## I/O per second

IOPS(I/O per second) 측정도 중요하다. 사용자가 늘어남에 따라 초당 얼마큼의 IO를 처리할 수 있는지, 디스크에 어떻게 이 IO를 분배할지에 대한 전략도 같이 고민되어야 한다.

IOps (Input/Output Operations per Second) is a measure of the number of read or write operations that can be performed in a second on a storage device such as a hard drive or solid-state drive.

__To calculate IOps, you will need to know the following information:__
1. The size of the I/O operations in bytes.
2. The number of I/O operations performed in a given time period (typically one second).
3. The latency of each I/O operation in milliseconds.
Once you have this information, you can use the following formula to calculate IOps:

__IOps = (I/O size in bytes) / (latency in milliseconds) * (number of I/O operations)__

For example, if you have a storage device that performs 4KB (4096 bytes) I/O operations with a latency of 5 milliseconds, and you are able to perform 1000 I/O operations in one second, then your IOps would be:

```
IOps = (4096 bytes) / (5 milliseconds) * (1000 I/O operations)
IOps = 819,200 I/O operations per second
```

Note that this is just an example, and the actual IOps performance of a storage device can vary depending on a number of factors, including the type of storage technology, the workload being performed, and the hardware and software configuration of the system.

## Links

- [System Design: Design a Geo-Spatial index for real-time location search](https://kousiknath.medium.com/system-design-design-a-geo-spatial-index-for-real-time-location-search-10968fe62b9c)
- [Design a Geo-Spatial index for real-time location search - 번역본](https://blog.imqa.io/design_a_geo-spatial_index_1/)