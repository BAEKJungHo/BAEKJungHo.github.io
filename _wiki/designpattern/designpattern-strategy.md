---
layout  : wiki
title   : Strategy
summary : Strategy Pattern, Template Callback Pattern
date    : 2022-08-03 15:28:32 +0900
updated : 2022-08-03 18:15:24 +0900
tag     : designpattern
toc     : true
comment : true
public  : true
parent  : [[/designpattern]]
latex   : true
---
* TOC
{:toc}

## Strategy

> 전략 패턴은 한 유형의 알고리즘을 보유한 상태에서 런타임에 적절한 알고리즘을 선택하는 기법을 의미한다.

템플릿 메서드 패턴을 사용할 때, 상속으로 인한 결합도 증가 및 서브 클래스에서 불필요한 메서드 구현 등의 단점등이 있었다. 전략 패턴을 사용하면 이런 부분을 해결할 수 있다.

![](/resource/wiki/designpattern-strategy/strategy.JPG)

- __디자인 원칙__
  - 상속 보다는 구성(Composition)을 사용하라.
- __정의__
  - 전략 패턴은 한 유형의 알고리즘을 보유한 상태에서 런타임에 적절한 알고리즘을 선택하는 기법
  - 전략을 활용하면 알고리즘을 사용하는 클라이언트와는 독립적으로 알고리즘을 변경할 수 있다.
  - 전략 패턴은 변하지 않는 부분을 Context 에 두고, 변하는 부분을 Strategy 라는 인터페이스를 만들고 구현하여 문제를 해결한다. 즉, 상속이 아닌 위임을 사용하여 문제를 해결한다.
    - Context: 변하지 않는 템플릿 역할
    - Strategy: 알고리즘 역할
- __핵심__
  - 전략 패턴의 핵심은 Context 는 Strategy 인터페이스에만 의존한다는 점이다. 덕분에 Strategy 의 구현체를 변경하거나 새로 만들어도 Context 코드에는 영향을 주지 않는다.
  - 스프링의 Dependency Injection 에 사용되는 디자인 패턴이 전략 패턴이다.


전략 패턴의 종류에는 두 가지가 있다. 하나는 전략을 필드에 보관하는 방식(setter 메서드 사용)이고, 하나는 템플릿 콜백 패턴이라고 하는 contextMethod 의 인자로 전략을 전달하는 방식이다. 우리는 조금더 유연한 템플릿 콜백 패턴(Template Callback)을 사용하여 AI Seller 의 발주 자동화 기능을 구현할 것이다.

전략 패턴은 세 부분으로 구성된다.

- __알고리즘을 나타내는 인터페이스(Strategy Interface)__
  - 인터페이스는 하나 이상의 추상 메서드를 가질 수 있다.
- __다양한 알고리즘을 나타내는 한 개 이상의 인터페이스 구현__
  - ConcreteStrategyA, ConcreteStrategyB 같은 구체적인 구현 클래스
- __전략 객체를 사용하는 한 개 이상의 클라이언트__

### AI Seller

발주 자동화 구현 예제이다.

__Strategy Interface__:

```java
public interface OrderAutomationStrategy {

    // 발주 정보 조회
    OrderInformation findOrderInformation();

    /**
     * @impleSpec
     * 이 구현체는 발주 결과를 문자로 발송할지 말지 정하는 기능을 한다.
     * 기본 설정은 문자 발송을 하는 것을 원칙으로 한다.
     */
    default boolean wantSendSms() {
        return true;
    }
}
```

JAVA 8 에서 Interface 에 default 메서드를 작성할 수 있게 추가되었는데, default 메서드는 서브 클래스에서 default 메서드의 기능이 존재하는지 모를 수 있다. 따라서 Javadoc 에서 제공하는 @implSpec 을 통하여 문서화를 해야 한다.

__Implementations__:

```java
public class CUOrderAutomation implements OrderAutomationStrategy {

    @Override
    public OrderInformation findOrderInformation() {
        // CU 에 해당 되는 기능 구현
    }

    @Override
    public boolean wantSendSms() {
        return false;
    }
}
```
```java
public class SevenElevenOrderAutomation implements OrderAutomationStrategy {

    @Override
    public OrderInformation findOrderInformation() {
        // 7-eleven 에 해당 되는 기능 구현
    }
}
```

__Context__:

```java
public class OrderAutomationContext {

    public void order(OrderAutomationStrategy strategy) {
        BasicInformation basicInfo = findBasicInformation();
        OrderInformation orderInfo = strategy.findOrderInformation(); 
        OrderResult orderResult = orderAndPayment(orderInfo); 
        save(orderResult); 
        if(strategy.wantSendSms()) {
            sendSms(basicInfo);
        }
    }

    private BasicInformation findBasicInformation() {
        // 기본 정보 조회
    }

    private OrderResult orderAndPayment(OrderInformation orderInfo) {
        // 발주 및 결제
    }

    public void save(OrderResult orderResult) {
        // 발주 결과 저장
    }

    private void sendSms(BasicInformation basicInfo) {
        // 문자 발송
    }
}
```

__Use__:

```java
@Test
void orderAutomationTest() {
    OrderAutomationContext context = new OrderAutomationContext();
    context.order(new CUOrderAutomation());
    context.order(new SevenElevenOrderAutomation());
}
```

전략 패턴을 적용함으로써 클라이언트는 Context 를 실행하는 시점에 동적으로 Strategy를 전달할 수 있다. 따라서 더욱 유연한 코드가 되었다. 서브 클래스에서도 불필요한 메서드를 구현하지 않아도 되고, 하나의 Context 객체만 생성하여 전략을 파라미터로 전달하여 사용할 수 있게 되었다.

## Template Callback

OrderAutomationContext 는 Context에 해당하며 변하지 않는 템플릿 역할을 한다. 그리고 변하는 부분은 Strategy 를 파라미터로 넘겨서 처리한다. __이렇게 다른 코드의 파라미터로 넘겨주는 실행 가능한 코드를 `콜백(callback)`이라고 한다.__

> 프로그래밍에서 콜백(callback) 또는 콜 애프터 함수(call-after function)는 다른 코드의 인수로서 넘겨주는 실행 가능한 코드를 말한다. 콜백을 넘겨받는 코드는 이 콜백을 필요에 따라 즉시 실행할 수도 있고, 아니면 나중에 실행할 수도 있다.

쉽게 말하면, callback 은 코드가 호출(call)은 되는데 코드를 넘겨준 곳의 뒤(back)에서 실행된다는 뜻이다.

- 자바 언어에서의 콜백
  - 매개변수로 전략 객체나, 기능을 갖고 있는 객체를 넘긴 후, 뒤에서 그 객체를 이용하여 기능을 실행하는 것을 말한다.

즉, 위와 같은 전략 패턴을 적용한 AI Seller 의 발주 자동화 코드를 템플릿 콜백(Template Callback) 패턴이라고 한다. 전략 패턴에서 Context 가 템플릿 역할을 하고, Strategy 부분이 콜백으로 넘어온다고 생각하면 된다.

## Links

- [Template Method](https://baekjungho.github.io/wiki/designpattern/designpattern-template-method/)