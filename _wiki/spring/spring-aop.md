---
layout  : wiki
title   : Aspect Oriented Programming (작성중)
summary : 
date    : 2023-03-16 19:45:32 +0900
updated : 2023-03-16 20:15:24 +0900
tag     : spring proxy
toc     : true
comment : true
public  : true
parent  : [[/spring]]
latex   : true
---
* TOC
{:toc}

## Cross-cutting concerns

Cross-cutting concerns are aspects of a software system that affect multiple components or layers but do not necessarily fit into the primary functional decomposition of an application. These concerns often represent common functionality or behavior that is required across different parts of the system, such as logging, security, caching, or transaction management.

![](/resource/wiki/spring-aop/cross-cutting-concerns.png)

Examples of cross-cutting concerns include:
- __Logging__: Capturing information about the execution of an application, such as user actions, system events, or errors.
- __Security__: Ensuring that only authorized users can access specific resources and functionality, such as authentication and authorization.
- __Caching__: Storing the results of expensive or frequently used operations to improve performance.
- __Transaction management__: Ensuring that a series of operations are executed atomically and consistently, usually in the context of a database.
- __Error handling__: Capturing, handling, and reporting errors or exceptions that occur during the execution of an application.
Monitoring and performance metrics: Collecting data about the performance and health of an application to enable analysis and optimization.

## Aspect Oriented Programming

__Pre-knowledge for learning Spring AOP:__
- [Proxy Pattern](https://baekjungho.github.io/wiki/designpattern/designpattern-proxy/)
- [Decorator Pattern](https://baekjungho.github.io/wiki/designpattern/designpattern-decorator/)
- [Dynamic Proxy](https://baekjungho.github.io/wiki/java/java-dynamicproxy/)
- [Code Generator Library, CGLIB](https://baekjungho.github.io/wiki/java/java-cglib/)


[Aspect Oriented Programming with Spring Docs](https://docs.spring.io/spring-framework/docs/current/reference/html/core.html#aop)

__Aspect:__
- A modularization of a concern that cuts across multiple classes. Transaction management is a good example of a crosscutting concern in enterprise Java applications.

__Advisor = Pointcut + Advice:__
```kotlin
@Around("execution(* com.example.demo.TestController.*(..))") // Pointcut
fun logExecutionTime(joinPoint: ProceedingJoinPoint): Any? { // Advice
    TODO("do something")
}
```

### ProxyFactory

스프링 부트는 AOP 를 적용할 때 기본적으로 proxyTargetClass=true 로 설정해서 사용한다. 따라서 인터페이스가 있어도 항상 CGLIB 를 사용해서 구체 클래스를 기반으로 프록시를 생성한다.  자세한 이유는 강의 뒷 부분에서 설명한다.

하나의 Target 에 여러 Advice 를 등록하기 위해서 Advice 만큼 프록시 클래스를 생성하는 것은 너무 비효율적일 것이다. 스프링은 ProxyFactory 를 통해서 하나의 Target 에 여러 Advice 를 등록하 수 있게 해준다. 

- proxyFactory.addAdvisor(advisor) 를 통해 등록 가능

__즉, Advice 개수가 10개더라도 프록시를 1개만 생성한다. 하나의 target 에 여러 AOP 가 동시에 적용되어도, 스프링의 AOP 는 target 마다 하나의 프록시만 생성한다.__

### BeanPostProcessor

[BeanPostProcessor](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/beans/factory/config/BeanPostProcessor.html) 는 이름에서 알 수 있듯이 빈 후처리기를 의미한다. Bean 의 특정 메서드를 호출하거나 프록시 객체로 변경하거나 등의 기능을 수행할 수 있다.

__Factory hook that allows for custom modification of new bean instances — for example, checking for marker interfaces or wrapping beans with proxies.__

The @PostConstruct annotation in Java is used to mark a method that should be called after the bean has been instantiated and all dependency injection has been performed. Spring 이 CommonAnnotationBeanPostProcessor 를 사용하여 @PostConstruct 가 붙은 메서드를 호출한다.

__Registration Bean(or Proxy) Flow:__

![](/resource/wiki/spring-aop/beanpostprocessor-flow.png)

위 그림에서 postProcessAfterInitialization(bean, beanName) 을 통해서 bean 을 proxy 객체로 바꿔치기할 수 있다. 그 후 생성된 bean 혹은 바꿔치기된 proxy(target: bean)를 빈 저장소에 등록한다.

```kotlin
@Slf4j
class PackageLogTraceProxyPostProcessor(private val basePackage: String, private val advisor: Advisor) : BeanPostProcessor {

    private val log = LoggerFactory.getLogger(PackageLogTraceProxyPostProcessor::class.java)

    @Throws(BeansException::class)
    override fun postProcessAfterInitialization(bean: Any, beanName: String): Any {
        log.info("param beanName={} bean={}", beanName, bean.javaClass)

        // Check if the bean is a proxy target
        // If not, return the original bean
        val packageName = bean.javaClass.packageName
        if (!packageName.startsWith(basePackage)) {
            return bean
        }

        // If the bean is a proxy target, create a proxy and return it
        val proxyFactory = ProxyFactory(bean)
        proxyFactory.addAdvisor(advisor)
        val proxy = proxyFactory.proxy
        log.info("create proxy: target={} proxy={}", bean.javaClass, proxy.javaClass)
        return proxy
    }
}
```

위 코드는 basePackage 기준으로 proxy 로 등록할지 bean 으로 등록할지 정했지만, AOP 개념을 도입하면 pointcut 을 기준으로 어떤 것을 등록할 지 정할 수 있다.

Pointcut 은 다음 두 곳에 사용된다.

1. 프록시 적용 대상 여부를 체크해서 꼭 필요한 곳에만 프록시를 적용한다. (빈 후처리기 - 자동 프록시 생성)
2. 프록시의 어떤 메서드가 호출 되었을 때 어드바이스를 적용할 지 판단한다. (프록시 내부)

### AnnotationAwareAspectJAutoProxyCreator

Spring Boot 는 AnnotationAwareAspectJAutoProxyCreator 빈 후처리기를 빈으로 자동으로 등록한다. 이 빈 후처리기는 스프링 빈으로 등록된 Advisor 들을 자동으로 찾아서 프록시가 필요한 곳에 자동으로 프록시를 적용해준다. 또한 @AspectJ와 관련된 AOP 기능도 자동으로 찾아서
처리해준다. Advisor 는 물론이고, @Aspect 도 자동으로 인식해서 프록시를 만들고 AOP 를 적용해준다.

Advisor 들을 찾아서 프록시를 생성하는 과정을 [AbstractAutoProxyCreator](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/aop/framework/autoproxy/AbstractAutoProxyCreator.html) 에서 한다. 해당 클래스의 postProcessBeforeInstantiation 와 postProcessAfterInitialization 를 확인하면 된다.

따라서, __Advisor 만 스프링 빈으로 등록하면 스프링이 자동으로 Advisor 들을 찾아 프록시를 생성하여 프록시를 빈으로 등록__ 해준다.

### BeanFactoryAspectJAdvisorsBuilder

AspectJ 의 @Aspect 어노테이션을 붙이고 빈으로 등록하면, 위에서 배운 프록시가 자동으로 생성된다. 스프링은 @Aspect 가 붙은 정보를 기반으로 Advisor 를 만들고 @Aspect 어드바이저 빌더 내부 저장소에 캐시한다. 캐시에 어드바이저가 이미 만들어져 있는 경우 캐시에 저장된 어드바이저를 반환한다.

## Weaving

위빙(weaving)은 포인트컷으로 결정한 타켓의 조인 포인트에 어드바이스를 적용하는 것을 의미한다. 위빙을 통해 핵심 기능 코드에 영향을 주지 않고 부가 기능을 추가 할 수 있다. Spring AOP 는 Runtime Weaving 을 사용한다. 이것이, 스프링에서 차용하고 있는 방식이며 프록시 방식의 AOP 이다.

프록시 방식을 사용하는 스프링 AOP는 스프링 컨테이너가 관리할 수 있는 스프링 빈에만 AOP 를 적용할 수 있다.

[Spring AOP](https://docs.spring.io/spring-framework/docs/3.2.x/spring-framework-reference/html/aop.html#aop-introduction-defn), like other pure Java AOP frameworks, performs weaving at runtime.

## Method internal calls with Transaction

__Related Articles__
- [Steady-Coding Transaction 사용 방법](https://steady-coding.tistory.com/610)
- [Spring 동일한 Bean(Class)에서 @Transactional 동작 방식](https://cheese10yun.github.io/spring-transacion-same-bean/)
- [AOP 에 대한 사실과 오해 그런데 트랜잭션을 사알짝 곁들인..](https://tecoble.techcourse.co.kr/post/2022-11-07-transaction-aop-fact-and-misconception/)

Spring Boot 1.4 Release Notes 를 보면 @Transactional 은 기본이 cglib proxies 로 동작하게끔 설정되었다고 한다.

> [@Transactional default to cglib proxies](https://github.com/spring-projects/spring-boot/wiki/Spring-Boot-1.4-Release-Notes)
>
> When Boot auto-configures the transaction management, proxyTargetClass is now set to true (meaning that cglib proxies are created rather than requiring your bean to implement an interface). If you want to align that behaviour for other aspects that aren’t auto-configured, you’ll need to explicitly enable the property now
>
> If you happen to use @Transactional on interfaces, you’ll have to be explicit and add @EnableTransactionManagement to your configuration. This will restore the previous behaviour.

어쨋든 중요한건 @Transactional 이 대표적인 AOP 라는 것이다. 그리고 AOP 는 Proxy Mechanism 으로 동작한다. 근데 이 Proxy Mechanism 을 사용할때 주의해야할 점이 있다.

```kotlin
class OrderService {
    
    fun createOrder() {
        // create order
        createPayment()
    }
    
    @Transactional
    fun createPayment() {
        // create payment 
        throw Exception()
    }
}
```

위 코드에서 createPayment() 에서 예외가 발생하면 createPayment 내에서 진행한 모든 결과가 롤백이 될까?

정답은 전체를 롤백 시키지 않는다는 것이다. createOrder 가 프록시로 등록이 되어있더라도 createPayment() 를 호출하는 것은 메서드 내부 호출에 해당되기 때문에 프록시가 적용되지 않는다. 

따라서, __대상 객체의 내부에서 메서드 호출이 발생하면 프록시를 거치지 않고 대상 객체를 직접 호출하는 문제가 발생__ 한다.

> [SpringDocs - Transaction Declarative Annotations](https://docs.spring.io/spring-framework/docs/current/reference/html/data-access.html#transaction-declarative-annotations)
>
> In proxy mode (which is the default), only external method calls coming in through the proxy are intercepted. This means that self-invocation (in effect, a method within the target object calling another method of the target object) does not lead to an actual transaction at runtime even if the invoked method is marked with @Transactional. Also, the proxy must be fully initialized to provide the expected behavior, so you should not rely on this feature in your initialization code for example, in a @PostConstruct method.

스프링은 프록시 방식의 AO P를 사용한다. 프록시 방식의 AOP 는 메서드 내부 호출에 프록시를 적용할 수 없다.

## References

- 스프링 핵심원리 고급 / 김영한 저 / Inflearn