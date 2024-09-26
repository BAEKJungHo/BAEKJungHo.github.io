---
layout  : wiki
title   : Carrying Capacity
summary : 
date    : 2024-09-26 15:54:32 +0900
updated : 2024-09-26 20:15:24 +0900
tag     : business
toc     : true
comment : true
public  : true
parent  : [[/business]]
latex   : true
---
* TOC
{:toc}

## Carrying Capacity

___Growth Dynamics___ 의 핵심 개념인 ___[Carrying Capacity](https://en.wikipedia.org/wiki/Carrying_capacity)___ 는 제품을 만드는 PO, PM, Developer 들이 꼭 알아야 하는 개념이다.
이 값을 알면 우리 서비스가 도달할 MAU 를 예측할 수 있다.

토스 이승건 대표님의 세션인 ___[토스 리더가 말하는 PO가 꼭 알아야할 개념 - PO SESSION](https://www.youtube.com/watch?v=tcrr2QiXt9M&t=59s)___ 에서 Carrying Capacity 개념을 정말 잘 설명해주고있다.

Carrying Capacity 는 ___제품이 가진 본질적인 (마케팅, 광고가 제외된) 체력을 의미___ 한다. 유저를 잘 모으고 가둬두는 체력을 의미한다.
마케팅 활동을 통해 일시적으로 Inflow Boosting 은 가능하지만 결국 광고를 끄면 그대로 다시 주저 앉게 된다. C.C 가 변하지 않았기 때문이다. 결국 근본적인 C.C 의 향상은 제품 개선을 통한 Inflow 와 Retention(특정 기간 동안 활성화된 유저 혹은 고객의 수) 향상, Churn 감소 외에는 방법이 없고, 이것은 마켓팅 활동으로는 바뀔 수 없다.

![](/resource/wiki/business-carrying-capacity/basic-system.png)

- ___Inflow___: Of New Daily Customers
- ___Stock___: MAU
- ___Outflow(Churn)___: Customers You Lost Each Day(%)

Carrying Capacity 에 영향을 주는 요소는 ___Inflow(= New User + Resurrection)___ 와 ___Churn(= Lost Customer)___ 뿐이다.
C.C 의 계산식은 다음과 같다. (Carrying Capacity 를 잘 활용하기 위해서는 Churn 에 대한 정의가 되게 중요하다.)

- Carrying Capacity = # Of New Daily Customers / Customers You Lost Each Day(%)

예를 들어, Inflow 가 7500 이고 Churn 이 1% 라면 Carrying Capacity 는 750K 이다. 이 상황에서 MAU 가 100만 인 경우에 광고를 하게 되면 MAU 가 조금 더 증가할 지라도 결국 Carrying Capacity 인 75만으로 다시 돌아오게 된다.
MAU 가 50~60만일 때 광고를 하는게 좋을까? 정답은 아니다. 결국 MAU 는 C.C 에 도달할 것이기 때문에 이때는 광고를 하기 보다 C.C 를 늘리기 위한 노력을 해야 한다.
C.C 를 늘리는 방법 중 하나는 완전히 새로운 서비스를 내놓는 것이다. 그러면 새로운 Inflow 와 Churn 이 생겨나며, 앱 전체의 C.C 를 늘릴 수 있다.

Developer 가 생각해보면 좋은 두 가지 질문이 있다.

1. You have 24 hours of downtime, the next day you come back up your traffic is down. Will this have a long-term effect you need to worry about?
2. You start having email deliverability problems (or Facebook turns off notifications) so you can’t notify users of new activity on the site. The # of unique visitors decreases slightly but you’re not too worried, should you be?

첫 번째 질문에 대한 답은, 장애가 발생하여 트래픽이 줄었더라도 ___Inflow___ 와 ___Churn___ 만 보면된다. 만약 Carrying Capacity 가 내려 앉으면 유저가 우리 서비스에 대한 신뢰를 잃어버려서 다른 서비스로 이전했다고 봐도된다. 하지만 대부분의 경우 Downtime 이 C.C 에 영향을 주는 경우는 드물다.

두 번째 질문에 대한 답은, push 알림이 꺼졌으면 들어오는 유저수는 줄겠지만, 이 기능이 꺼져서 churn 유저도 같이 줄어들었을 수 있다. 즉, C.C 가 변하는지가 핵심이다. 쓸 때 없는 push 때문에 나가는 유저수도 같이 줄어들면 크게 문제가 안된다.

## Links

- [Web and Mobile Products: Understanding your customers](https://keithschacht.medium.com/web-and-mobile-products-understanding-your-customers-d8ee1e56b5a3)