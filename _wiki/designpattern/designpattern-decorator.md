---
layout  : wiki
title   : Decorator
summary : 
date    : 2023-03-15 16:28:32 +0900
updated : 2023-03-15 19:15:24 +0900
tag     : designpattern proxy
toc     : true
comment : true
public  : true
parent  : [[/designpattern]]
latex   : true
---
* TOC
{:toc}

## Decorator

프록시패턴인데 __부가기능 추가__ 가 목적이다.

![](/resource/wiki/designpattern-decorator/decorator.png)

Decorator 구현체에 중복되는 기능들이 있을 수 있다. 이러한 기능들을 Decorator 라는 추상 클래스로 만들어 중복을 제거할 수 있는데, Decorator 추상 클래스 내부에서 Component 를 속성으로 가지고 있어야 한다. 이렇게 하면 추가로 클래스 다이어그램에서 어떤 것이 실제 컴포넌트 인지, 데코레이터인지 명확하게 구분할 수 있다. 이것이 바로 GOF 에서 설명하는 데코레이터 패턴이다.

The main components of the decorator pattern are:
- __Component__: An interface or abstract class that defines the common behavior of the objects that will be decorated. This component can also be a concrete class in some cases.
- __Concrete Component__: A concrete implementation of the component interface or class. This is the base object that will be decorated with new functionality.
- __Decorator__: An abstract class or interface that extends or implements the component interface. The decorator class maintains a reference to a component object and delegates the core behavior to that object. Decorators can add or override behavior as needed.
- __Concrete Decorator__: A concrete implementation of the decorator class that defines the specific additional functionality or behavior to be added to the component.

클래스 기반으로 데코레이터 패턴을 구현할 수 있다.

```java
@Slf4j
public class ConcreteLogic {

    public String call() {
        log.info("ConcreteLogic 실행");
        return "data";
    }
}
```

```java
@Slf4j
public class TimeProxy extends ConcreteLogic {

    private ConcreteLogic concreteLogic;

    public TimeProxy(ConcreteLogic concreteLogic) {
        this.concreteLogic = concreteLogic;
    }

    @Override
    public String call() {
        log.info("TimeDecorator 실행");
        long startTime = System.currentTimeMillis();

        String result = concreteLogic.call();

        long endTime = System.currentTimeMillis();
        long resultTime = endTime - startTime;
        log.info("TimeDecorator 종료 resultTime={}ms", resultTime);
        return result;
    }
}
```

```java
public class ConcreteClient {

    private ConcreteLogic concreteLogic;

    public ConcreteClient(ConcreteLogic concreteLogic) {
        this.concreteLogic = concreteLogic;
    }

    public void execute() {
        concreteLogic.call();
    }
}
```

```java
@DisplayName("구체 클래스 기반 프록시 테스트")
@Test
void concreteProxyTest() throws Exception {
    ConcreteLogic concreteLogic = new ConcreteLogic();
    TimeProxy timeProxy = new TimeProxy(concreteLogic);
    ConcreteClient client = new ConcreteClient(timeProxy);
    client.execute();
}
```

## Beverage pricing system

```kotlin
// Component
interface Beverage {
    fun getDescription(): String
    fun cost(): Double
}

// Concrete Component
class Coffee : Beverage {
    override fun getDescription(): String = "Coffee"

    override fun cost(): Double = 1.50
}

// Another Concrete Component
class Tea : Beverage {
    override fun getDescription(): String = "Tea"

    override fun cost(): Double = 1.00
}

// Decorator
abstract class BeverageDecorator(private val beverage: Beverage) : Beverage {
    override fun getDescription(): String = beverage.getDescription()

    override fun cost(): Double = beverage.cost()
}

// Concrete Decorator
class Milk(beverage: Beverage) : BeverageDecorator(beverage) {
    override fun getDescription(): String = super.getDescription() + ", Milk"

    override fun cost(): Double = super.cost() + 0.25
}

// Another Concrete Decorator
class Sugar(beverage: Beverage) : BeverageDecorator(beverage) {
    override fun getDescription(): String = super.getDescription() + ", Sugar"

    override fun cost(): Double = super.cost() + 0.15
}

// Usage
fun main() {
    val coffeeWithMilkAndSugar = Sugar(Milk(Coffee()))
    println("${coffeeWithMilkAndSugar.getDescription()} costs ${coffeeWithMilkAndSugar.cost()}")

    val teaWithMilk = Milk(Tea())
    println("${teaWithMilk.getDescription()} costs ${teaWithMilk.cost()}")
}
```

__Outputs:__

```
Coffee, Milk, Sugar costs 1.9
Tea, Milk costs 1.25
```