---
layout  : wiki
title   : Template Method
summary : 템플릿 메서드 패턴
date    : 2022-08-02 15:28:32 +0900
updated : 2022-08-02 18:15:24 +0900
tag     : designpattern
toc     : true
comment : true
public  : true
parent  : [[/designpattern]]
latex   : true
---
* TOC
{:toc}

## Template Method

> 템플릿(Template) 이라는 단어에서 알 수 있듯이, 템플릿 메서드 패턴은 어떤 작업 알고리즘의 골격을 정의한다. 공통 기능과 세부기능을 갖도록 구현할 수 있으며, 세부 기능은 서브 클래스마다 달라질 수있다. 즉, 템플릿 메서드를 이용하면 알고리즘의 구조를 그대로 유지하면서 특정 단계만 서브 클래스에서 새로 정의하도록 할 수 있다.

![](/resource/wiki/designpattern-template-method/templatemethod.JPG)

### 생성 단계

- 상위 클래스(알고리즘 골격)를 캡슐화 한다.
  - 서로 공통점이 있는 메서드를 일반화 하여 새로 만든다.
- 어떤 알고리즘에 대한 템플릿 역할을 메서드가 한다.
- 서브 클래스에서 특정 알고리즘에 선택적으로 적용되어야 하는 경우에는 후크(hook)를 사용한다.

### AI Seller

지금으로부터 5년뒤, 높은 임금 문제로 인해 편의점에서는 더 이상 알바생이 존재하지 않게될 것이라는 전망이 있다. 5년뒤 CU, GS25, 7-eleven, Emart-24시 등 편의점들은 무인 편의점이 될것이다. TECHVU 라는 회사에서 미래를 대비해 미리 AI Seller 라는 AI 판매원을 만들려고한다.

AI Seller 의 프로토 타입 기능은 다음과 같다.

- 손님에게 인사
- 판매한 물건을 재고에서 차감하여 기록하고, 자주 판매되는 물건등에 대한 통계 자료 기록
- 발주 자동화

여기서 발주 자동화(Order Automation) 에 대한 개발을 할 것이다.

AI Seller 의 발주 자동화 기능 중 점주들이 설정할 수 있는 세부 사항은 다음과 같다.

- (필수) 재고에서 N% 남았을때 발주가능하도록 편의점 점주들에 의해서 세부 설정이 가능
- (옵션) 점주들이 발주 품목에 대한 BlackList 를 설정할 수 있다.
  - BlackList 품목들은 재고 부족 여부와 상관 없이 발주 되지 않는다.
- (옵션) 발주 완료 후, 점주들의 핸드폰으로 문자 발송 가능. 하지만 이 기능은 온오프 형식이다.

자동 발주 자동화의 동작 과정은 다음과 같다.

- 기본 정보 조회 : AI Seller 에 설정된 편의점과 점주 정보를 조회한다. (점주 정보에는 카드 정보까지 있음)
- 발주 정보 조회 : 발주해야할 품목들과, 총 금액을 계산하여 발주 리스트에 넣고 반환한다.
- 기본 정보와 발주 정보를 가지고, API 를 호출하여 발주와 결제를 진행 한다.
- 결제가 완료되면 API 를 통해 발주 품목 예상 도착일과, 영수증을 RETURN 받아서 저장한다.

### 발주 자동화 구현하기

주 자동화의 동작 과정이, 발주 작업에 대한 알고리즘 전체 골격이다. 여기서 이제 공통과 세부사항을 뽑아보자. 점주들이 설정할 수 있는 세부 사항을 살펴보면, 동작 과정에 있는 발주 정보 조회가 세부 사항인 것을 알 수 있다.

동작 과정을 메서드화 시키면 다음과 같다.

```java
void order() {
    findBasicInformation(); // 기본 정보 조회 : 공통
    OrderInformation orderInfo = findOrderInformation(); // 발주 정보 조회 : 세부 사항
    OrderResult orderResult = orderAndPayment(orderInfo); // 발주 및 결제
    save(orderResult); // 발주 결과 저장
}
```

템플릿 메서드 패턴을 적용하여 만든 코드는 다음과 같다. findOrderInformations() 메서드가 세부 구현체마다 다르게 개발되는 부분이다. 편의점 프랜차이즈별, 각 지점 별로 취급하는 물건이랑 옵션 등이 다를 수있다.

- __OrderAutomationTemplate__

```java
public abstract class OrderAutomationTemplate {

    // 발주 자동화
    public void order() { // template method
        // 변하지 않는 부분
        BasicInformation basicInfo = findBasicInformation();

        // 변하는 부분, orderInfo 에 블랙 리스트가 존재
        OrderInformation orderInfo = findOrderInformation(); 

        // 변하지 않는 부분
        OrderResult orderResult = orderAndPayment(orderInfo); 

        // 변하지 않는 부분
        save(orderResult); 

        // hook
        if(wantSendSms()) {
            sendSms(basicInfo);
        }
    }

    // 세부 구현체 마다 다른 방식으로 구현
    protected abstract OrderInformation findOrderInformation();

    public BasicInformation findBasicInformation() {
        // 기본 정보 조회
    }

    public OrderResult orderAndPayment(OrderInformation orderInfo) {
        // 발주 및 결제
    }

    public void save(OrderResult orderResult) {
        // 발주 결과 저장
    }

    /**
      * 후크(hook) : 서브클래스에서 알고리즘이 선택적으로 적용되야 하는 경우
      * 필요한 서브클래스에서는 오버라이딩 하여 구현한다.
      */
    public boolean wantSendSms() {
        return true;
    }

    public void sendSms(BasicInformation basicInfo) {
        // 문자 발송
    }
}
```

- __CUOrderAutomation__

```java
public class CUOrderAutomation extends OrderAutomationTemplate {

    @Override
    protected OrderInformation findOrderInformation() { // primitive method
        // 로직 구현
    }

    @Override
    public boolean wantSendSms() {
        if(...) {
          return true;
        } else {
          return false;
        }
    }
}
```

- __사용__

```java
/**
 * 템플릿 메서드 패턴 적용
 */
@Test
void orderAutomationTest() {
    OrderAutomationTemplate template = new CUOrderAutomation();
    template.order();
}
```

### 장점

템플릿 메서드의 장점은 변하는 부분과 변하지 않는 부분을 나눌 수 있다. 동일한 기능을 슈퍼 클래스에서 정의하면서 확장 및 변화가 필요한 부분만 서브 클래스에서 구현할 수 있다.

### 단점

템플릿 메서드를 사용하여 구현하였지만, 뭔가 부족하고 단점들이 보인다. 템플릿 메서드 패턴은 상속을 사용한다. 따라서 상속에서 오는 단점들을 그대로 안고간다. 특히 자식 클래스가 부모 클래스와 컴파일 시점에 강하게 결합되는 문제가 있다. 이것은 의존 관계에 대한 문제이다. 자식 클래스 입장에서는 부모 클래스의 기능을 전혀 사용하지 않는다. 그럼에도 불구하고 템플릿 메서드 패턴을 위해 자식 클래스는 부모 클래스를 상속 받고 있다. 즉, 템플릿 메서드 패턴은 상속으로 인한 단점들을 안고 가는 패턴이다.

이러한 템플릿 메서드 단점들을 개선하기 위한 대체 수단은 상속이 아닌 구성(Composition)을 사용하는 전략(Strategy) 패턴을 사용하는 것이다.