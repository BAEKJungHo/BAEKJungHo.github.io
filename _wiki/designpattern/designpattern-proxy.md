---
layout  : wiki
title   : Proxy
summary : 
date    : 2023-03-15 15:28:32 +0900
updated : 2023-03-15 18:15:24 +0900
tag     : designpattern proxy
toc     : true
comment : true
public  : true
parent  : [[/designpattern]]
latex   : true
---
* TOC
{:toc}

## Proxy

프록시 패턴은 원본 객체를 대신하여 클라이언트와 소통하는 자라고 생각한다. 원본 객체를 위임(delegate)받아 원본 객체의 동작을 수행하기 전에 보안, 캐싱, 로깅, 검증, 원격 객체 등의 작업을 사전에 수행할 수 있다. 

![](/resource/wiki/designpattern-proxy/proxy.png)

1. __Subject__: This is the interface or abstract class that defines the operations that the real object and the proxy must implement.
2. __RealSubject__: This is the real object that the proxy represents. It implements the operations defined in the subject interface.
3. __Proxy__: This is the object that acts as a surrogate or placeholder for the real object. It implements the subject interface and delegates the operations to the real object.

코드로 보면 다음과 같다.

__Subject:__

```kotlin
interface Subject {
    fun doSomething(): Void
}
```

__Real Subject:__

```kotlin
class RealSubject: Subject {
    override fun doSomething() {
        // doSomething
    }
}
```

__Proxy class:__

```kotlin
class Proxy: Subject {
    private val realSubject = RealSubject()

    override fun doSomething(): Void {
        // doSomething (caching, logging ... 
        return realSubject.doSomething() // delegation
    }
}
```

이러한 방식으로 구현해서 사용하면 된다.

### Remote Proxy

원격 프록시(Remote Proxy)는 프록시는 로컬에 있고, RealSubject 가 원격 서버(다른 서버)에 존재하는 경우 사용할 수 있다.
프록시는 네트워크 통신을 통해 클라이언트 요청을 RealSubject 로 전달한다.

__Subjects:__

```kotlin
interface ProductService {
    fun getProducts(): List<Product>
}
```

Next, we define the real subject class that implements the ProductService interface and fetches the list of products over the network:

```kotlin
class RemoteProductService : ProductService {
    override fun getProducts(): List<Product> {
        // Fetch products over the network
        Thread.sleep(5000) // Simulate network delay
        return listOf(Product("Product 1"), Product("Product 2"), Product("Product 3"))
    }
}

data class Product(val name: String)
```

Now, we define the remote proxy class that implements the ProductService interface and delegates the operations to the real subject class:

```kotlin
class RemoteProductServiceProxy : ProductService {
    private val realService = RemoteProductService()

    override fun getProducts(): List<Product> {
        // Check if the list of products is already cached
        // If yes, return the cached list
        // Otherwise, fetch the list from the remote service
        return realService.getProducts()
    }
}
```

Finally, we can use the remote proxy to fetch the list of products without incurring the overhead of network communication:

```kotlin
fun main() {
    val productService: ProductService = RemoteProductServiceProxy()

    // Fetch the list of products
    val products = productService.getProducts()

    // Print the list of products
    println("Products:")
    products.forEach { println(it.name) }
}
```

### Virtual Proxy

객체 생성 작업이 무거울때 사용하는 Lazy Initialization 방식

First, we define the subject interface that defines the operations for loading and displaying the image:

```kotlin
interface Image {
    fun display()
}
```

Next, we define the real subject class that implements the Image interface and loads the actual image:

```kotlin
class RealImage(private val filename: String) : Image {
    init {
        loadFromDisk()
    }

    private fun loadFromDisk() {
        // Load the image from the disk
        println("Loading image from disk: $filename")
    }

    override fun display() {
        // Display the image
        println("Displaying image: $filename")
    }
}
```

Now, we define the virtual proxy class that implements the Image interface and creates the real subject object only when it is needed:

```kotlin
class VirtualImage(private val filename: String) : Image {
    private var realImage: RealImage? = null

    override fun display() {
        // Create the real image object only when it is needed
        if (realImage == null) {
            realImage = RealImage(filename)
        }

        // Display the image
        realImage?.display()
    }
}
```

### Protection Proxy

보호 프록시의 목적은 접근 권한을 제어하는 것이다.

First, we define the subject interface that defines the operations for accessing the information:

```kotlin
interface InformationService {
    fun getInformation(): String
}
```

Next, we define the real subject class that implements the InformationService interface and provides access to the sensitive information:

```kotlin
class RealInformationService : InformationService {
    override fun getInformation(): String {
        return "Sensitive information"
    }
}
```

Now, we define the protection proxy class that implements the InformationService interface and checks the permissions before granting access to the sensitive information:

```kotlin
class ProtectionInformationService(private val informationService: InformationService, private val user: String) : InformationService {
    override fun getInformation(): String {
        // Check if the user has the proper permissions
        if (user == "admin") {
            // Grant access to the sensitive information
            return informationService.getInformation()
        } else {
            // Deny access to the sensitive information
            throw SecurityException("Access denied")
        }
    }
}
```

Finally, we can use the protection proxy to restrict access to the sensitive information:

```kotlin
fun main() {
    // Create the real subject object
    val realService: InformationService = RealInformationService()

    // Create a protection proxy for the information service
    val informationService: InformationService = ProtectionInformationService(realService, "admin")

    // Get the sensitive information
    val information = informationService.getInformation()

    // Print the sensitive information
    println("Information: $information")
}
```

## Links

- [프록시(Proxy) 패턴 - 완벽 마스터하기](https://inpa.tistory.com/entry/GOF-%F0%9F%92%A0-%ED%94%84%EB%A1%9D%EC%8B%9CProxy-%ED%8C%A8%ED%84%B4-%EC%A0%9C%EB%8C%80%EB%A1%9C-%EB%B0%B0%EC%9B%8C%EB%B3%B4%EC%9E%90)