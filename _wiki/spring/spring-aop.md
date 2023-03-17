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

## Aspect Oriented Programming

__Pre-knowledge for learning Spring AOP:__
- [Proxy Pattern](https://baekjungho.github.io/wiki/designpattern/designpattern-proxy/)
- [Decorator Pattern](https://baekjungho.github.io/wiki/designpattern/designpattern-decorator/)
- [Dynamic Proxy](https://baekjungho.github.io/wiki/java/java-dynamicproxy/)
- [Code Generator Library, CGLIB](https://baekjungho.github.io/wiki/java/java-cglib/)

AOP 는 [Aspect Oriented Programming with Spring Docs](https://docs.spring.io/spring-framework/docs/current/reference/html/core.html#aop) 읽는게 가장 최고인것 같다. 당장 Aspect 라는 개념을 알고 싶으면 ChatGPT 보다도 Docs 가 짱이다.

__Aspect:__
- A modularization of a concern that cuts across multiple classes. Transaction management is a good example of a crosscutting concern in enterprise Java applications.

위 내용만 봐도 Aspect 가 관심사를 모듈화한 형태라는 것을 알 수 있고, Transaction Management 가 AOP 를 사용한다는 것을 알 수 있다.

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

![](/resource/wiki/spring-aop/beanpostprocessor.png)

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

## Transaction

Spring Boot 1.4 Release Notes 를 보면 @Transactional 은 기본이 cglib proxies 로 동작하게끔 설정되었다고 한다.

> [@Transactional default to cglib proxies](https://github.com/spring-projects/spring-boot/wiki/Spring-Boot-1.4-Release-Notes)
> 
> When Boot auto-configures the transaction management, proxyTargetClass is now set to true (meaning that cglib proxies are created rather than requiring your bean to implement an interface). If you want to align that behaviour for other aspects that aren’t auto-configured, you’ll need to explicitly enable the property now
> 
> If you happen to use @Transactional on interfaces, you’ll have to be explicit and add @EnableTransactionManagement to your configuration. This will restore the previous behaviour.

- [Steady-Coding Transaction 사용 방법](https://steady-coding.tistory.com/610)
- [Spring 동일한 Bean(Class)에서 @Transactional 동작 방식](https://cheese10yun.github.io/spring-transacion-same-bean/)
- [AOP 에 대한 사실과 오해 그런데 트랜잭션을 사알짝 곁들인..](https://tecoble.techcourse.co.kr/post/2022-11-07-transaction-aop-fact-and-misconception/)

## References

- 스프링 핵심원리 고급 / 김영한 저 / Inflearn