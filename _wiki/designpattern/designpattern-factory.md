---
layout  : wiki
title   : FACTORY
summary : 
date    : 2025-02-01 11:28:32 +0900
updated : 2025-02-01 12:15:24 +0900
tag     : designpattern
toc     : true
comment : true
public  : true
parent  : [[/designpattern]]
latex   : true
---
* TOC
{:toc}

## FACTORY

__Design Principles__:
- ___[의존성 뒤집기 원칙(Dependency Inversion Principle)](https://klarciel.net/wiki/oop/oop-solid/)___: 추상화된 것에 의존하도록 만들어라. 구상 클래스에 의존하도록 만들지 않도록 한다.
- 이 원칙을 따르는 경우 ___MOCK___ 을 통한 객체 생성을 시뮬레이션 하기 쉽기 때문에 ___[Testability](https://klarciel.net/wiki/test/test-design-for-testability/)___ 가 증가한다.

팩토리 패턴(Factory Pattern) 은 객체 생성을 캡슐화하여, 클라이언트 코드가 직접 객체의 구체적인 클래스를 알지 않아도 적절한 객체를 생성할 수 있도록 하는 디자인 패턴이다.
즉, ___"객체를 생성하는 책임을 별도의 팩토리 클래스나 메서드가 담당하는 패턴"___ 이다.

### Static Factory Method; Simple Factory Pattern

정적 팩토리 메서드란 객체 생성의 역할을 하는 클래스 메서드를 의미한다.

- java.time.LocalTime 의 정적 팩터리 메서드

```java
public static LocalTime of(int hour, int minute) {
  ChronoField.HOUR_OF_DAY.checkValidValue((long)hour);
  if (minute == 0) {
    return HOURS[hour];
  } else {
    ChronoField.MINUTE_OF_HOUR.checkValidValue((long)minute);
    return new LocalTime(hour, minute, 0, 0);
  }
}

// hour, minutes 을 인자로 받아서 9시 30분을 의미하는 LocalTime 객체를 반환한다.
LocalTime openTime = LocalTime.of(9, 30); 
```

Effective Java 에서 가장 첫 번째로 소개되는 내용이 ___생성자 대신 정적 팩토리 메서드를 고려하라___ 이다.
정적 팩터리 메서드(static factory method)가 생성자보다 우위를 차지하는 점은 다음과 같다.

- 이름을 가질 수 있다. createLottoNumber, createCar 등 이름을 가지게되어 가독성이 좋아지고, 객체 생성의 목적을 나타낼 수 있다.
- 호출할 때마다 새로운 객체를 생성할 필요가 없다.
- enum 과 같이 자주 사용되는 요소의 개수가 정해져있다면 해당 개수만큼 미리 생성해놓고 조회(객체 캐싱)할 수 있는 구조로 만들수 있다.
- 생성자의 접근 제한자를 private 으로 설정하면 객체 생성을 정적 팩터리 메서드로만 가능하게하여, 객체 생성을 제한할 수 있다.
- 하위 자료형 객체를 반환할 수 있다.
  - Super Class : Vehicle
  - Sub Class : Car, Airplane, Train
- 객체 생성을 캡슐화 할 수 있다. 생성자를 클래스의 메서드 안으로 숨기면서 내부 상태를 외부에 드러낼 필요없이 객체 생성 인터페이스 단순화 시킬 수 있다.

__Naming Conventions__:

| Naming Convention           | Description                            |
|-----------------------------|----------------------------------------|
| **from**                    | 하나의 매개변수를 받아서 객체를 생성                   |
| **of**                      | 여러 개의 매개변수를 받아서 객체를 생성                 |
| **getInstance or instance** | 인스턴스를 생성하며, 이전에 반환했던 것과 같을 수 있음 |
| **newInstance or create**   | 새로운 인스턴스를 생성                                   |
| **get[OtherType]**          | 다른 타입의 인스턴스를 생성하며, 이전에 반환했던 것과 같을 수 있음 |
| **new[OtherType]**          | 다른 타입의 새로운 인스턴스를 생성                    |

다음 예제는 XML, JSON, YML, Properties 등의 직렬화 객체를 생성해야 하는 경우이다.

```java 
public class RuleConfigSerializerFactory {
    public static IRuleConfigSerializer createSerializer(String format) {
        IRuleConfigSerializer serializer = null;
        if ("json".equalsIgnoreCase(format)) {
            serializer = new JsonRuleConfigSerializer();
        } else if (...) {
            // ...
        } else if (...) {
            // ...
        }
        ...
    }
}
```

함수가 호출 될 때마다 새 객체를 생성하기 보다 미리 만들어 두고 캐시에서 사용할 수 있다.

__TO-BE__:

```java
public class RuleConfigSerializerFactory {
    private static final Map<String, RuleConfigSerializer> cachedSerializer = new HashMap<>();
    static {
        cachedSerializer.put("json", new JsonRuleConfigSerializer());
        cachedSerializer.put("xml", new XmlRuleConfigSerializer());
        cachedSerializer.put("yml", new YmlRuleConfigSerializer());
        cachedSerializer.put("properties", new PropertiesRuleConfigSerializer());
    }
    
    public static IRuleConfigSerializer createSerializer(String format) {
        if (configForma == null) {
            throw IllegalArgumentException("Invalid Arguments");
        }
        IRuleConfigSerializer serializer = cachedSerializer.get(format.toLowerCase());
        return serializer;
    }
}
```

위 두 예제의 경우 다른 타입이 추가 되는 경우 Factory 클래스의 코드가 변경되어야만 한다.
이는 ___[Open Closed Principle](https://klarciel.net/wiki/oop/oop-solid/)___ 에 위배될 수 있다. 하지만, Factory 클래스의 코드는
가끔씩만 수정되며, 수정의 범위가 크지 않으므로 OCP 를 완전히 만족하지 않아도 괜찮다. 즉, 적절한 ___Trade-Off___ 이다.

### Factory Method Pattern

__Structure__:

![](/resource/wiki/designpattern-factory/factory-method.png)

RuleConfigSerializerFactory 첫 번째 예제에서 if 문의 분기를 없애기 위해서는 ___[Polymorphism](https://klarciel.net/wiki/oop/oop-polymorphism/)___ 을 사용하는 방법이 있다.
즉, ___[Factory Method Pattern](https://en.wikipedia.org/wiki/Factory_method_pattern)___ 의 핵심은 다형성을 이용하는 것이다.

```kotlin
interface IRuleConfigSerializerFactory {
    fun createSerializer(): IRuleConfigSerializer
}

// 4. 개별 Factory 구현체 (각 Serializer 별 Factory)
class JsonRuleConfigSerializerFactory : IRuleConfigSerializerFactory {
    override fun createSerializer(): IRuleConfigSerializer = JsonRuleConfigSerializer()
}

class XmlRuleConfigSerializerFactory : IRuleConfigSerializerFactory {
    override fun createSerializer(): IRuleConfigSerializer = XmlRuleConfigSerializer()
}

class YmlRuleConfigSerializerFactory : IRuleConfigSerializerFactory {
    override fun createSerializer(): IRuleConfigSerializer = YmlRuleConfigSerializer()
}

class PropertiesRuleConfigSerializerFactory : IRuleConfigSerializerFactory {
    override fun createSerializer(): IRuleConfigSerializer = PropertiesRuleConfigSerializer()
}
```

팩터리 메서드 패턴을 적용한 경우 클라이언트 측에서는 아래와 같이 분기 처리가 필요하다.

```kotlin
fun main() {
    val format = "json"

    // 클라이언트가 직접 Factory 를 생성하고 관리해야 함
    val factory: IRuleConfigSerializerFactory = when (format.lowercase()) {
        "json" -> JsonRuleConfigSerializerFactory()
        "xml" -> XmlRuleConfigSerializerFactory()
        "yml" -> YmlRuleConfigSerializerFactory()
        "properties" -> PropertiesRuleConfigSerializerFactory()
        else -> throw IllegalArgumentException("Unsupported format: $format")
    }

    // Factory 를 사용하여 Serializer 생성
    val serializer = factory.createSerializer()

    // 직렬화 수행
    val result = serializer.serialize("My Config Data")
    println(result)
}
```

이를 위해서는 ___Factory 객체를 생성하기 위한 Simple Factory___ 를 도입하는 것이다.

```kotlin
// Factory 객체를 생성하기 위한 Simple Factory
object RuleConfigSerializerFactoryProvider {
    private val cachedFactories = mapOf(
        "json" to JsonRuleConfigSerializerFactory(),
        "xml" to XmlRuleConfigSerializerFactory(),
        "yml" to YmlRuleConfigSerializerFactory(),
        "properties" to PropertiesRuleConfigSerializerFactory()
    )

    fun getFactory(format: String): IRuleConfigSerializerFactory {
        return cachedFactories[format.lowercase()]
            ?: throw IllegalArgumentException("Unsupported format: $format")
    }
}

fun main() {
    val format = "json"

    // Factory를 가져와서 Serializer 생성
    val factory = RuleConfigSerializerFactoryProvider.getFactory(format)
    val serializer = factory.createSerializer()

    // 직렬화 수행
    val result = serializer.serialize("My Config Data")
    println(result)
}
```

이렇게 하면 기본적으로 

### Abstract Factory Pattern

현재는 파일의 형식(format)에 따라서 분류만 하기 때문에 하나의 Interface 만 존재하면 된다. 만약, 더 복잡한 규칙등에 의해서 분류를 해야하는 경우도 있다고 가정하자.
이 경우 IRuleConfigSerializer, ComplexRuleConfigSerializer 2개의 인터페이스에 기반하여 클래스가 생성되어야 한다.
이 경우 하나의 인터페이스당 json, xml, yml, properties 등 최소 4개씩의 클래스를 생성해야 하니, 총 8개를 생성해야 한다.
이렇게 되면 ___유지보수 비용이 증가하고 생산성___ 이 떨어진다.

__Structure__:

![](/resource/wiki/designpattern-factory/abstract-factory.png)

```kotlin
// Interface
interface SerializerFactory {
    fun createSerializer(): IRuleConfigSerializer
    fun createComplexSerializer(): IComplexRuleConfigSerializer
} 

// Concrete
class JsonRuleConfigSerializerFactory : SerializerFactory {
  override fun createSerializer(): IRuleConfigSerializer = JsonRuleConfigSerializer()
  override fun createComplexSerializer(): IComplexRuleConfigSerializer = JsonComplexRuleConfigSerializer()
}

class XmlRuleConfigSerializerFactory : SerializerFactory {
  override fun createSerializer(): IRuleConfigSerializer = XmlRuleConfigSerializer()
  override fun createComplexSerializer(): IComplexRuleConfigSerializer = XmlComplexRuleConfigSerializer()
}

class YmlRuleConfigSerializerFactory : SerializerFactory {
  override fun createSerializer(): IRuleConfigSerializer = YmlRuleConfigSerializer()
  override fun createComplexSerializer(): IComplexRuleConfigSerializer = YmlComplexRuleConfigSerializer()
}

class PropertiesRuleConfigSerializerFactory : SerializerFactory {
  override fun createSerializer(): IRuleConfigSerializer = PropertiesRuleConfigSerializer()
  override fun createComplexSerializer(): IComplexRuleConfigSerializer = PropertiesComplexRuleConfigSerializer()
}
```

생성자 메서드는 객체를 초기화하는 역할을 하며, 이 과정은 가능한 한 간단하고 명확해야 한다. 그러나 객체 초기화가 복잡하거나, 초기화 과정에서 다른 객체를 생성해야 하는 경우, 생성자 메서드 내에서 복잡한 로직이 발생할 수 있다. 이때, 팩토리 패턴을 도입하는 것이 좋은 습관이다.

팩토리를 사용하면 객체 생성 절차를 캡슐화하고, 객체의 생성과 초기화를 담당하는 코드가 한 곳에 집중되어 관리된다. 이로 인해 생성자 메서드는 간단하고 직관적으로 유지되며, 객체 생성 로직의 변경이 필요할 경우, 팩토리 클래스만 수정하면 됩니다. 반면, 생성자 메서드가 복잡해지면, 객체 생성에 대한 변경이 있을 때마다 생성자와 관련된 코드도 함께 수정될 가능성이 커지기 때문에, 유지보수성과 확장성 측면에서 불리해진다.

따라서, 객체 생성 절차가 복잡하다면 팩토리 패턴을 적용하는 것이 적합하며, 간단한 생성 절차라면 생성자 메서드를 직접 호출하는 방식이 더 효율적이다.

## Dependency Injection Container

___[Inversion of Control Container](https://klarciel.net/wiki/spring/spring-ioc/)___ 에서도 Factory 패턴이 적용되어있다.
모든 클래스의 객체 생성을 BeanFactory 같은 팩터리 클래스에서 담당하면 된다. 이때 새로운 클래스가 추가되더라도 BeanFactory 의 코드의 양이 증가하면안된다.
이때 사용되는 기술이 ___Reflection___ 이다.

- [Principle of operation of spring Dependency Injection](https://github.com/BAEKJungHo/deepdiveinreflection/blob/main/contents/%EC%8A%A4%ED%94%84%EB%A7%81%20DI%20%EA%B0%80%20%EB%8F%99%EC%9E%91%ED%95%98%EB%8A%94%20%EC%9B%90%EB%A6%AC.md)

## References

- Gangs of Four Design Patterns
- 设计模式之美 / 王争
