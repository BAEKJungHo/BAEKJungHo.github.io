---
layout  : wiki
title   : Hot Diggety Dog!
summary : 
date    : 2023-04-26 15:02:32 +0900
updated : 2023-04-26 15:12:24 +0900
tag     : kata
toc     : true
comment : true
public  : true
parent  : [[/kata]]
latex   : true
---
* TOC
{:toc}

## Hot Diggety Dog!

[NealFord Katas](https://nealford.com/katas/list.html)

![](/resource/wiki/kata-hotdog/hotdog.png)

## Katas

> Taking the form of an unorganized article.

### Must be lightweight

> must be lightweight in size--laptop is too unwieldy to use efficiently when making hot dogs on the street

"Must be lightweight" 요구사항에 의해서 단순하게, __Mobile, Tablet__ 을 생각해 볼 수 있다.

Mobile, Tablet 이 적합한지 "증명(proof)" 을 해야 한다.

- __configurability__: 가판대 상인이 사용하기 쉬워야 하고 또한 소프트웨어 설정도 편해야 한다.
- __installability__: 소프트웨어 설치가 편해야 한다.

첫 번째 요구사항이 갖는 아키텍처 구조적 특성 중 configurability 와 installability 가 가장 중요하지 않을까 생각한다.

어쨋든, 요구 사항에 적합한 시스템은 __Mobile point-of-sale(mPOS)__ 이다.

### That won't need replacement in 3 years is more important

> That won't need replacement in 3 years is more important

3년이면 꽤 긴시간이다.

소프트웨어 업그레이드가 충분히 많이 일어날 수 있는 기간이다. __upgradeability__ 까지 고려하자.

Mobile, Tablet 같은 Device 에 탑재하는 소프트웨어라면 APP 설치만 하게 만들어주면, 위 세가지 특성을 만족시킬 수 있을 것 같다.

Mobile, Tablet 같이 여러 Device 에서 데이터 접근이 가능해야 하므로, Cloud 환경의 Database 가 좋을 것 같다.
Cloud 를 사용한다면 __scalability__ 까지 어느정도 얻게 될 것 같다.

### Time to completion is important

> time to completion is important

완성까지의 시간이 중요하다는 것은 빨리 만들어야 한다는 의미인데, MSA 보단 Monolithic 형태의 아키텍처가 훨씬 빠를 것이다.

Monolithic 으로 가기 위한 근거를 더 찾아야 겠다.. 

지역 고객이 수천명, 특정 월에는 N만명 일때, 핫도그 1개 가판대당 평균 고객 수가 얼마나 될지 가늠해야할 것 같다.
만약 해당 지역이 관광지 이거나, 혹은 특정 월에 관광으로 인한 고객 수가 더 증가한다거나 이러한 특이 사항을 고려해야할 것 같다.
혹은 핫도그 명물 지역으로 선정될지 누가 알까.

- 지역 고객이 5000 명 특정 월에는 3배 증가라고 했을때 15000명 
- Average: 100명, Hot-Month(Peak): 300명

확실히 __대용량 트래픽을 고려해야하는 것__ 은 아니다. 트래픽으로 인한 확장 가능성은 낮은 셈이다.

__performance__ 와 __scalability__ 는 이번 아키텍처에서 큰 비중을 차지하진 않는 것 같다. 

(물론, 소프트웨어가 잘 돼서 전 지역으로 팔려나가게 된다면 트래픽이 많아질 테니 고려를 안할 순 없지만, 현재 요구사항에서는 중요성이 낮다는 생각이다.)

완성 까지의 시간을 고려했고, 확장성이 덜 중요하기 때문에 MSA 보단, Monolithic 이 더 낫다는 근거가 충분히 되지 않을까 생각한다.

이번 아키텍처에서는 __maintenance__ 가 오히려 더 중요하다.

### Social-media integration

> provide a social-media integration so customers can be notified when a hot dog stand is nearby.

핫도그 가판대가 근처에 있을 때, Social-Media 로 알림을 주기 위해서는 mPOS 가 social-media 와 통합 되어야 한다.

소셜 미디어 플랫폼(Instagram, Facebook)에서 제공하는 API 를 활용하면 될 것 같다.

### Track sales by time and location

__Time tracking:__
- 시간대별 판매 기록을 추적하기 위해, 판매 시간을 저장해야 한다.

__Location tracking:__
- POS 는 GPS 나 Wi-Fi 같은 위치 정보를 활용하여 매출이 이루어진 위치를 저장해야 한다.

시간과 위치별 매출 분석을 위한 기능이 있어야 겠다. 효과적인 시각화도 중요하겠다.

### Send inventory updates to mobile inventory-management staff

핫도그를 만들기 위해 필요한 재료 - 빵, 소시지, 케찹 등의 재료를 미리 재고 관리 시스템에 등록을 해야할 것이고

POS 시스템을 통해 주문/결제가 완료되면 재고 차감이 이루어질 것이다. 특정 기준치 미만으로 도달할 경우 "inventory-management staff" 에게
notify 를 할 수도 있을 것 같다.

따라서, 재고 부족으로 인해 핫도그를 판매하지 못하는 일이 발생하지 않도록 하는 것이 중요할 것 같다.

## References

- [ECOMMERCE PLATFORMS - What Is a Mobile POS System (mPoS)?](https://ecommerce-platforms.com/glossary/what-is-mobile-pos-system)