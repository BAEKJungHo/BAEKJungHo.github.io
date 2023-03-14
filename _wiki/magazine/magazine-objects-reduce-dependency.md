---
layout  : wiki
title   : Thoughts of Objects to Reduce Dependencies Between Packages
summary : 패키지간 의존성을 줄이기 위한 객체에 대한 고찰 및 생산성과 안정성에 대한 트레이드오프
date    : 2023-03-14 19:54:32 +0900
updated : 2023-03-14 20:15:24 +0900
tag     : magazine
toc     : true
comment : true
public  : true
parent  : [[/magazine]]
latex   : true
---
* TOC
{:toc}

## TradeOff Productivity and Stability

[Part1. The Importance of Architecture: 아키텍처의 중요성과 개발 설계의 생산성과 안정성](https://baekjungho.github.io/wiki/magazine/magazine-productivity-stability/) 에 대한 글을 먼저 읽고 오면 좋습니다.

Part1 마지막 챕터인 Productivity and Stability 에 대한 더 디테일한 의견과, 패키지간 의존성을 줄이기 위한 객체에 대한 고찰을 해보려고 합니다.

Part1 에서 "주문 서비스는 비지니스의 요구사항이 자주 추가되거나 변경될 가능성이 농후합니다. 안정성 역시 중요하지만 생산성 또한 안정성 못지 않게 중요합니다." 라고 했습니다. 주문 서비스는 생산성과 안정성 모두 고려해야하는 서비스입니다. (물론, 모든 애플리케이션을 설계할 때 생산성과 안정성에 대한 trade-off 를 고민해야 합니다.)

생산성과 안정성 어떤 것에 더 우위(priority)를 두어야할지 애매한 경우가 있습니다. 

이러한 Trade-off 를 잘 하기 위한 저의 기준은 다음과 같습니다.

![](/resource/wiki/magazine-objects-reduce-dependency/tradeoff.png)

안정성은 __도메인에 대한 안정성__ 을 의미합니다. 도메인만 외부 변경으로부터 보호하면 비지니스 로직이 외부 변경으로부터 안전한 상태가 되기 때문에, 애플리케이션이 안정성을 띄고있다고 말 할 수 있습니다.

Y 축은 도메인과 연관되어있으며, X 축은 서비스의 위치를 의미합니다.

먼저 주문 서비스부터 살펴보면 주문 서비스는 도메인 로직의 추가 변경이 자주일어나며 유지보수가 빈번하기 때문에 생산성을 고려해야합니다. 또한 주문 처리를 위한 비지니스 로직은 중요하기 때문에 안정성도 매우 중요합니다. 따라서 모두 고려해야하며 어떤 것에 더 우위를 둘 지는 개발자 몫입니다.

다음으로는 결제 서비스인데, 결제 서비스는 결제가 필요한 다양한 백엔드 서버와 통신합니다. 또한 도메인 로직이 매우 중요하기 때문에 안정성을 최우선으로 고려해야합니다.

어드민 서비스는 단순 CRUD 성 API 가 많으며 주문 서비스에 비해 상대적으로 도메인 로직의 중요성이 떨어진다고 생각합니다. 물론 중요한 도메인 로직이 있을 수 있지만, 단순 CRUD API 가 너무 많은 비중을 차지하므로 생산성을 우선으로 고려해야한다고 생각합니다.

마지막은 프록시 서비스입니다. 서버간 통신에서 내부 백엔드 서비스를 호출하기 전에 중간 서비스를 두는 경우가 있습니다. 프록시 서비스에서는 상대적으로 중요한 도메인 로직을 잘 다루지 않기 때문에 생산성을 우선으로 고려하는 것이 좋습니다. 프록시 서비스에 대한 예를 하나 들자면, Gateway - Orchestrator - Backend 구조에서 Orchestrator 는 중간 다리 역할을 하는 (여기서 말하는) 프록시 서비스에 해당합니다. Orchestrator 는 최대한 비지니스로직을 담지 않아야 하며 백엔드 서비스 호출을 조정하는 조정자(mediator)의 역할만 해줘야 하기 때문에 생산성을 우선으로 고려하는 것이 좋습니다.

## Objects to Reduce Dependencies Between Packages

생산성을 위해 DTO 를 domain layer 에 넣는 경우가 있습니다. DTO 를 두 가지 케이스로 나눠서 생각해볼 수 있습니다.

케이스를 나누는 조건은 __DTO 의 변경이 클라이언트와 서버 어느쪽에 의존하는지__ 입니다.

클라이언트(e.g 관리자 페이지, 화면 등)로 부터 요청 데이터를 전달 받는 경우 DTO 의 변경은 클라이언트에 의존할 가능성이 큽니다. 예를 들면, 화면에 checkbox 혹은 inputbox 가 추가되는 경우 DTO 도 변경될 가능성이 있습니다. 이 경우에는 __domain layer 가 클라이언트의 변경사항으로부터 의존하지 않게 하기 위해(패키지간 의존성을 제거하기 위해)__ DTO 와는 별개의 Object 를 Domain Layer 에 두고 Mapper 를 통해 의존성을 격리 시키는 것이 좋습니다. 주문 서비스를 생각해보면 주문 화면에 변경이 일어날때 주문 생성 DTO 가 변경될 가능성이 큽니다. 따라서 DTO 와 별개의 객체를 두는게 좋다고 생각합니다.

서버에 의존하는 경우(e.g 비지니스로직 변경 등)에는 DTO 가 domain layer 에 위치해도 좋습니다. 예를 들어 주문-결제 서버를 생각했을 때 주문 서버에서 결제 생성을 위한 명세(객체)를 만들어 결제 서버로 요청하고, 결제 서버에서는 Controller 에서 DTO 로 매핑 하게 됩니다. 결제 서버에서 사용되는 DTO 는, 결제 생성을 위한(결제 생성 비지니스 로직 처리를 위한) 명세 역할을 하는 DTO 이니, 이런 경우엔 DTO 를 presentation layer 에 두기보다 domain layer 에 두어서 패키지간 의존성을 줄이기 위한 객체를 별도로 생성하지 않는 방식이 더 낫다고 생각합니다.

__Sample:__
- domainName (package)
  - controller (package) - controller
  - service (package) - service, dto 등
  - infra 는 서브 모듈로 관리

Controller 에서 받는 DTO 가 __비지니스 로직을 처리하기 위한 명세의 역할__ 을 한다면(e.g 결제 요청을 처리하기 위한 명세), 그리고 DTO 의 변경이 클라이언트가 아니라 서버에 의해 변경이 일어나는 경우 에 DTO 가 service 패키지에 있다고 해서 안정성이 떨어진다고 생각하진 않습니다. DTO 의 변경이 서버에 의해 일어나는 경우 DTO 대신 Spec 이라는 네이밍을 고려하는 것도 좋습니다.

위 내용들을 종합했을때 아래와 같은 결론을 낼 수 있습니다.

1. DTO 는 Presentation Layer 에 위치할 수도 있고, Domain Layer 에 위치할 수 도 있다.
2. DTO 가 Domain Layer 에 위치한다고 해서 안정성이 떨어지는 것은 아니다.
3. DTO 의 변경이 클라이언트에 의존하는지 서버에 의존하는지를 기준으로 판단하는 것이 좋다. 서버에 의존하는 경우 DTO 는 명세(Spec)의 역할을 한다고 볼 수 있다.

End.