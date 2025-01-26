---
layout  : wiki
title   : Law of Demeter
summary : 
date    : 2025-01-25 15:02:32 +0900
updated : 2025-01-25 15:12:24 +0900
tag     : oop designpattern
toc     : true
comment : true
public  : true
parent  : [[/oop]]
latex   : true
---
* TOC
{:toc}

## Law of Demeter

___[LoD(Law of Demeter)](https://www.baeldung.com/java-demeter-law)___ 는 최소 지식의 원칙(the least knowledge principle) 이라고도 한다. 최소 지식 원칙은 모든 유닛이 자신과 매우 밀접하게 관련된 유닛에 대해서 제한된 지식만 알아야 한다.

![](/resource/wiki/oop-law-of-demeter/law-of-demeter.png)
*<small><a href="https://www2.ccs.neu.edu/research/demeter/papers/law-of-demeter/oopsla88-law-of-demeter.pdf">Object-Oriented Programming : An Objective Sense of Style </a></small>*

데메테르의 법칙은 높은 응집도와 낮은 결합도를 달성하는데 도움이 된다. 높은 응집도와 낮은 결합도는 코드의 가독성과 유지 보수성을 효과적으로 향상시키고 기능 변경으로 인한 코드 변경 범위를 줄일 수 있는 매우 중요한 설계 사상이다.

- 높은 응집도
  - 클래스 자체의 설계에 사용된다. 즉, 유사한 기능은 동일한 클래스에 배치되어야 하고, 유사하지 않은 기능은 다른 클래스로 분리해야 함을 의미한다.
  - 높은 응집도는 코드를 유지 보수하기 쉬워진다.
- 낮은 결합도
  - 클래스 간의 의존성 설계에 사용된다. 코드에서 클래스 간의 의존성이 단순하고 명확해야 함을 의미한다.
  - 두 클래스가 종속 관계에 있을 때, 둘 중 어느 한 쪽의 클래스를 수정하더라도 다른 클래스의 코드가 거의 수정되지 않아야 한다.

대부분의 설계 원칙과 사상은 추상적이며 사람마다 해석이 다를 수 있다. 따라서 실제 개발에 유연하게 적용하려면 실무적인 경험이 필요하다.

__设计模式之美 / 王争 이 정의하는 LoD__:

- 직접 의존성이 없어야 하는 클래스 사이에는 반드시 의존성이 없어야 하며
- 의존성이 있는 클래스는 필요한 인터페이스에만 의존해야 한다

### Factory Design Pattern

다음은 Product 클래스가 특정 제품의 가격 정보를 가져오는 코드이다.

```kotlin
class Product(private val productId: String) {
private val price: Double

    init {
        val fetcher = PriceFetcher()
        this.price = fetcher.fetchPrice(productId)
    }

    fun getPrice(): Double {
        return price
    }
}
```

위 코드는 다음과 같은 문제점을 가지고 있다:
- Product 클래스가 PriceFetcher 에 강하게 의존한다.
- PriceFetcher 객체가 Product 생성자에서 직접 생성되므로, 인터페이스 기반 설계를 위반한다.
- 위 문제로 인해 테스트하기 어려운 구조가 된다.

이러한 문제를 해결하기 위해 Factory 패턴을 적용할 수 있다. Factory 패턴을 사용하면, 객체 생성 로직을 별도의 클래스로 분리하여 유연성과 테스트 용이성을 높일 수 있다.

```kotlin
class Product(private val productId: String, private val price: Double) {
    fun getPrice(): Double {
        return price
    }
}

class ProductFactory(private val priceFetcher: PriceFetcher) {
    fun createProduct(productId: String): Product {
        val price = priceFetcher.fetchPrice(productId)
        return Product(productId, price)
    }
}

class PriceFetcher {
    fun fetchPrice(productId: String): Double {
        // 가격 데이터를 외부 시스템에서 가져온다고 가정
        return 100.0 // 예제 데이터
    }
}
```

- Product 클래스는 더 이상 PriceFetcher 에 의존하지 않으므로 LoD를 준수한다.
- 객체 생성은 ProductFactory 가 담당하므로 책임 분리가 명확하다.
- PriceFetcher 를 목(Mocking) 처리하여 Product 를 손쉽게 테스트할 수 있다.

### High Cohesiveness Design

직렬화와 역직렬화를 담당하는 클래스를 설계할 때는 LoD 를 준수하면서도 높은 응집도를 유지해야 한다. 이를 위해 한 클래스에서 두 역할(Serialization/Deserialization)을 모두 처리할 수 있다.

```kotlin
interface Serializable {
    fun serialize(obj: Any): String
}

interface Deserializable {
    fun deserialize(text: String): Any
}

class JsonSerialization : Serializable, Deserializable {
    override fun serialize(obj: Any): String {
        // 객체를 JSON 문자열로 변환
        return "{\"key\":\"value\"}" // 예제 데이터
    }

    override fun deserialize(text: String): Any {
        // JSON 문자열을 객체로 변환
        return mapOf("key" to "value") // 예제 데이터
    }
}

class DataProcessor(private val serializer: Serializable) {
    fun process(data: Any): String {
        return serializer.serialize(data)
    }
}
```

__응집도와 LoD의 균형__:
- 위 코드에서는 직렬화와 역직렬화의 역할을 하나의 클래스(JsonSerialization)에 통합하여 높은 응집도를 유지했다. 하지만 만약 직렬화/역직렬화 기능이 복잡해져 유지보수가 어려워진다면, 아래와 같이 역할을 분리할 수 있다

```kotlin
class JsonSerializer : Serializable {
    override fun serialize(obj: Any): String {
        return "{\"key\":\"value\"}"
    }
}

class JsonDeserializer : Deserializable {
    override fun deserialize(text: String): Any {
        return mapOf("key" to "value")
    }
}
```

## References

- 设计模式之美 / 王争