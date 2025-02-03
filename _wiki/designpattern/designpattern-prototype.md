---
layout  : wiki
title   : PROTOTYPE
summary : 
date    : 2025-02-03 11:28:32 +0900
updated : 2025-02-03 12:15:24 +0900
tag     : designpattern
toc     : true
comment : true
public  : true
parent  : [[/designpattern]]
latex   : true
---
* TOC
{:toc}

## PROTOTYPE

기존 객체를 복사(clone)하여 새로운 객체를 생성하는 방식의 생성(Creational) 패턴이다. 객체를 새로 생성하는 대신, 기존 객체를 복제하여 초기화 비용을 줄이고, 복잡한 객체 구조를 효율적으로 관리할 수 있다.

### Design Principles

__Structure__:

![](/resource/wiki/designpattern-prototype/prototype.png)

- Prototype: Declares an interface for cloning itself.
- ConcretePrototype: Implements an operation for cloning itself.
- Client: Creates a new object by asking a prototype to clone itself.

### Examples: External Library Object Copy

프로덕션 코드에서 타사 라이브러리에서 제공하는 구상 클래스에 의존하면 안되는 경우 ___[Prototype](https://en.wikipedia.org/wiki/Prototype_pattern)___ 패턴을 사용할 수 있다.

__External Library Object__:

```kotlin
// 외부 라이브러리에서 제공하는 복잡한 클래스들
interface ExternalDocument {
    fun clone(): ExternalDocument  // 복제 기능만 제공
    fun getContent(): String
}

class PDFDocument(private val content: String) : ExternalDocument {
    override fun clone(): ExternalDocument = PDFDocument(content)
    override fun getContent() = "PDF: $content"
}

class WordDocument(private val content: String) : ExternalDocument {
    override fun clone(): ExternalDocument = WordDocument(content)
    override fun getContent() = "Word: $content"
}
```

__Apply Prototype__:

```kotlin
// 프로토타입 패턴을 적용한 도구 클래스
class DocumentProcessor(private val prototype: ExternalDocument) {
    fun processDocument(): ExternalDocument {
        val clonedDoc = prototype.clone()  // 구체적인 클래스에 의존하지 않고 복제
        println("Processing Document: ${clonedDoc.getContent()}")
        return clonedDoc
    }
}
```

__Client__:

```kotlin
fun main() {
    // 외부 객체 (프로토타입으로 사용)
    val pdfPrototype = PDFDocument("Kotlin Design Patterns")
    val wordPrototype = WordDocument("Prototype Pattern Example")

    // 프로세서에 프로토타입 전달
    val pdfProcessor = DocumentProcessor(pdfPrototype)
    val wordProcessor = DocumentProcessor(wordPrototype)

    // 프로토타입 복제 및 처리
    pdfProcessor.processDocument()   // Processing Document: PDF: Kotlin Design Patterns
    wordProcessor.processDocument()  // Processing Document: Word: Prototype Pattern Example
}
```

이 처럼 Prototype 을 적용하게 되면, 새로운 문서 타입이 추가되어도 DocumentProcessor 는 수정할 필요가 없으며,
새로운 문서 클래스가 clone() 만 구현하면 된다. 또한 외부 코드 수정 없이도 내부 로직을 유연하게 확장할 수 있다.

### Examples: Non-Disruptive Cache Update

해시값 계산과 같은 복잡한 계산을 통해 데이터를 얻거나, RPC, Network, Database 등에 대한 접근을 통해 데이터를 얻어서 객체를 생성해야 하는 경우에는
시간이 많이 소요된다. 이 경우 기존 객체를 복사해서 생성하는 방식을 적용할 수 있다.

예를 들어 상품 클래스는 이름과 가격만 존재한다. 특정 keyword 로 상품을 조회하는데, 매번 데이터베이스에서 조회하면 비용이 크기 때문에
메모리에 올려두어서 사용한다고 가정한다. 이때 메모리 있는 값은 ___valid___ 한지를 보장하지 못하기 때문에, 데이터베이스에 새 상품이 추가되는 경우, 항상 모든 데이터를 데이터베이스에서 조회해야한다.
또한 데이터가 10만건 이상이라고 가정한다.

__Product Model__:

```kotlin
data class Product(val id: String, var name: String, var price: Double) : Cloneable {
    // 얕은 복사 (속도 빠름)
    public override fun clone(): Product = super.clone() as Product

    // 깊은 복사 (데이터 독립성 보장)
    fun deepClone(): Product = Product(id, name, price)

    // 변경 사항 비교
    fun isDifferentFrom(other: Product): Boolean {
        return this.name != other.name || this.price != other.price
    }
}
```

__Apply Prototype__:

```kotlin
class ProductCacheManager {
    private var productCache: MutableMap<String, MutableList<Product>> = mutableMapOf()

    // 초기 데이터 로딩
    fun loadInitialData() {
        val dbData = mapOf(
            "electronics" to mutableListOf(Product("1", "Laptop", 1200.0), Product("2", "Smartphone", 800.0)),
            "furniture" to mutableListOf(Product("3", "Desk", 300.0), Product("4", "Chair", 150.0))
        )
        productCache.putAll(dbData)
    }

    // 데이터 조회
    fun getProductsByKeyword(keyword: String): List<Product>? = productCache[keyword]

    // 캐시 업데이트 (얕은 복사 + 깊은 복사 병행)
    fun updateCache(keyword: String, latestProducts: List<Product>) {
        // 1️⃣ 기존 캐시를 얕은 복사 (빠른 스냅샷)
        val clonedCache = productCache.toMutableMap()

        // 2️⃣ 기존 캐시 데이터와 비교하여 변경된 데이터만 깊은 복사
        val existingProducts = clonedCache[keyword]?.associateBy { it.id } ?: emptyMap()

        val updatedProducts = latestProducts.map { newProduct ->
            val existingProduct = existingProducts[newProduct.id]
            if (existingProduct != null && newProduct.isDifferentFrom(existingProduct)) {
                newProduct.deepClone() // 변경된 경우 깊은 복사
            } else {
                newProduct.clone() // 변경되지 않은 경우 얕은 복사
            }
        }.toMutableList()

        // 3️⃣ 캐시 스왑
        clonedCache[keyword] = updatedProducts
        productCache = clonedCache
    }
}
```

- [How to Make a Deep Copy of an Object in Java](https://www.baeldung.com/java-deep-copy)
- [Copy a Map in Kotlin](https://www.baeldung.com/kotlin/copy-map)

## References

- Gangs of Four Design Patterns
- 设计模式之美 / 王争
