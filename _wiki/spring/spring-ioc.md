---
layout  : wiki
title   : Analyzing Inversion of Control
summary : Dependency Injection
date    : 2024-03-21 15:05:32 +0900
updated : 2024-03-21 15:15:24 +0900
tag     : spring
toc     : true
comment : true
public  : true
parent  : [[/spring]]
latex   : true
---
* TOC
{:toc}

## Inversion Of Control

This phenomenon is __[Inversion of Control](https://martinfowler.com/bliki/InversionOfControl.html)__ (also known as the Hollywood Principle - "Don't call us, we'll call you").

A framework embodies some abstract design, with more behavior built in. Inversion of Control is a key part of what makes a framework different to a library.

The main control of the program was inverted, moved away from you to the framework.

The __[Dependency Injection](https://baekjungho.github.io/wiki/spring/spring-di/)__ pattern is a more specific version of IoC pattern, and is all about removing dependencies from your code.

ReadMore - [Martinfowler - Inversion of Control Containers and the Dependency Injection pattern](https://martinfowler.com/articles/injection.html#InversionOfControl)

### Analyzing Spring IOC Source Code

__Analyzing Spring IOC Source Code__:
- [SpringCloud - Analyzing Spring IOC Source Code](https://www.springcloud.io/post/2023-07/spring-ioc/#gsc.tab=0)
- [Spring IoC source code analysis and in-depth understanding of IoC](https://mp.weixin.qq.com/s/UuFdWGjBmJlDg4BelGL8GQ)

Spring IoC Container 에서 Bean 가져오기, 삭제 등의 기본 작업이 정의되어있는 핵심 인터페이스는 [BeanFactory Interface](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/beans/factory/BeanFactory.html) 이다. The root interface for accessing a Spring bean container.

```java
public interface BeanFactory {
    Object getBean(String name) throws BeansException;
    <T> T getBean(String name, Class<T> requiredType) throws BeansException;
    <T> T getBean(Class<T> requiredType) throws BeansException;
    boolean containsBean(String name);
    boolean isSingleton(String name) throws NoSuchBeanDefinitionException;
    boolean isPrototype(String name) throws NoSuchBeanDefinitionException;
    boolean isTypeMatch(String name, Class<?> targetType) throws NoSuchBeanDefinitionException;
    Class<?> getType(String name) throws NoSuchBeanDefinitionException;
    String[] getAliases(String name);
}
```

BeanFactory 의 기본 구현체는 [DefaultListableBeanFactory](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/beans/factory/support/DefaultListableBeanFactory.html) 이다. Typical usage is registering all bean definitions first (possibly read from a bean definition file), before accessing beans.
빈을 등록할 때는 Reflection 을 사용하는데, [BeanDefinition (빈 설정 메타 정보)](https://baekjungho.github.io/wiki/spring/spring-di/#beandefinition) 를 활용하여 빈을 생성한다.

```java
public interface BeanDefinition {
    String SCOPE_SINGLETON = ConfigurableBeanFactory.SCOPE_SINGLETON;
    String SCOPE_PROTOTYPE = ConfigurableBeanFactory.SCOPE_PROTOTYPE;

    String getBeanClassName();
    void setBeanClassName(String beanClassName);
    String getScope();
    void setScope(String scope);
    boolean isSingleton();
    boolean isPrototype();
    String getFactoryMethodName();
    void setFactoryMethodName(String factoryMethodName);
    String getFactoryBeanName();
    void setFactoryBeanName(String factoryBeanName);
    String[] getDependsOn();
    void setDependsOn(String... dependsOn);
    boolean isLazyInit();
    void setLazyInit(boolean lazyInit);
    ConstructorArgumentValues getConstructorArgumentValues();
    MutablePropertyValues getPropertyValues();
    boolean isAutowireCandidate();
    void setAutowireCandidate(boolean autowireCandidate);
}
```

핵심은 두 메서드이다. getBeanClassName() 메서드는 빈의 클래스 이름을 반환하고 getPropertyValues() 메서드는 빈의 속성 값을 반환한다.
구체적인 구현은 [DefaultListableBeanFactory](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/beans/factory/support/DefaultListableBeanFactory.html) 를 확인하면 된다.

__Bean creation__:
- In DefaultListableBeanFactory, the creation of bean is done through createBean() method.

__Bean’s dependency injection process__:
- In DefaultListableBeanFactory, the dependency injection of the bean is done through the __applyPropertyValues()__ method
- During the property assignment process, if the property value is a reference type, it will try to do autowiring.
- In the __resolveValueIfNecessary()__ method, if the value of the property is a BeanDefinitionHolder object or a RuntimeBeanReference object, it means that the property is a reference type and needs to be autowired. At this point, the __resolveReference()__ method is called for reference resolution and autowiring.

