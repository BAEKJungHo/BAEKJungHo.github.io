---
layout  : wiki
title   : Code Generator Library, CGLIB
summary : 
date    : 2023-03-16 15:28:32 +0900
updated : 2023-03-16 19:15:24 +0900
tag     : java proxy spring
toc     : true
comment : true
public  : true
parent  : [[/java]]
latex   : true
---
* TOC
{:toc}

## CGLIB

- CGLIB 은 바이트코드를 조작해서 동적으로 클래스를 생성하는 기술을 제공하는 라이브러리이다.
- CGLIB 은 구체 클래스를 상속(extends)해서 프록시를 만든다. 따라서 final 이 붙으면 안된다.
- CGLIB 은 자식 클래스를 동적으로 생성하기 때문에 기본 생성자가 필요하다.

kotlin 의 경우에 모든 클래스들이 default 로 final 이기 때문에 AOP 이슈가 생길 수도 있다. 항상 그럼 상속 가능하게 open 을 붙여주는 것도 엄청 귀찮을 것이다. 

```gradle
plugins {
    kotlin("plugin.spring") version "1.7.0"
}
```

위와 같은 plugin.spring 이 있으면 @Component, @Async, @Transactional, @Cacheable, @SpringBootTest, @Configuration, @Controller, @RestController, @Service, @Repository 어노테이션에 대해서 all-open 을 자동으로 추가시킨다. - [Kotlin 으로 Spring 개발할 때](https://cheese10yun.github.io/spring-kotlin/#null)

DynamicProxy 는 InvocationHandler 를 이용했는데, CGLIB 은 MethodInterceptor 라는 것을 이용한다. Spring 을 사용한다면 의존성이 자동으로 추가가 되어있을 것이다.

```java
package org.springframework.cglib.proxy;

import java.lang.reflect.Method;

public interface MethodInterceptor extends Callback {
    /**
     * @params obj : CGLIB 이 적용된 객체
     * @params method : 호출된 메서드
     * @params args : 메서드를 호출하면서 전달된 인수
     * @params proxy : 메서드 호출에 사용
     */
    Object intercept(Object obj, Method method, Object[] args, MethodProxy proxy) throws Throwable;
}
```

구현은 다음과 같다. (Spring 사용 X)

__CGLIB Dependency:__

```gradle
implementation("cglib:cglib:3.3.0")
```

__VM Options:__

아래 옵션을 활성화 시켜줘야 에러가 안난다.

```
--add-opens java.base/java.lang=ALL-UNNAMED
--add-opens java.base/java.lang.reflect=ALL-UNNAMED
--add-opens java.base/java.util=ALL-UNNAMED
```

1. Go to Run -> Edit Configurations.
2. Select your run configuration from the list.
3. In the VM Options field, add the above options.

활성화 안해주면 아래와 같은 에러를 만난다.

```
1. Caused by: java.lang.reflect.InaccessibleObjectException: Unable to make protected final java.lang.Class java.lang.ClassLoader.defineClass(java.lang.String,byte[],int,int,java.security.ProtectionDomain) throws java.lang.ClassFormatError accessible: module java.base does not "opens java.lang" to unnamed module @deb6432
2. Caused by: net.sf.cglib.core.CodeGenerationException: java.lang.reflect.InaccessibleObjectException-->Unable to make protected final java.lang.Class java.lang.ClassLoader.defineClass(java.lang.String,byte[],int,int,java.security.ProtectionDomain) throws java.lang.ClassFormatError accessible: module java.base does not "opens java.lang" to unnamed module @deb6432
```

__Target:__

```kotlin
class TargetConcrete {

    fun action() {
        println("do action")
    }
}
```

__Proxy:__

```kotlin
class LogExecutionTimeMethodInterceptor(
    private val invocationTarget: Any
): MethodInterceptor {

    override fun intercept(obj: Any, method: Method, args: Array<out Any>?, proxy: MethodProxy): Any {
        val startTime = System.nanoTime()

        // Invoke the method on the target instance
        val result = if (args == null) {
            proxy.invoke(obj, emptyArray())
        } else {
            proxy.invoke(obj, args)
        }

        // Print the execution time
        println("Executed method " + method.name + " in "
                + (System.nanoTime() - startTime) + " nanoseconds")

        // Return the result to the caller
        return result
    }
}
```

__Main:__

```kotlin
fun main(args: Array<String>) {
    // Create Enhancer: Enhancer 가 CGLIB Proxy 를 만든다.
    val enhancer = Enhancer()

    // CGLIB 는 구체 클래스를 상속 받아서 프록시를 생성할 수 있다.
    // 어떤 구체 클래스를 상속 받을지 정한다.
    enhancer.setSuperclass(TargetConcrete::class.java)

    // 프록시에 적용할 실행 로직을 할당한다.
    enhancer.setCallback(LogExecutionTimeMethodInterceptor(targetInstance))

    // Create Proxy
    // ConcreteC$$EnhancerByCGLIB$$860aca8f@2209
    val proxy = enhancer.create() as TargetConcrete
    proxy.action()
}
```

## Aspect Oriented Programming

CGLIB 은 JDK Dynamic Proxy 와 함께 AOP 기술에 사용된다.

[Proxying mechanisms - Aspect Oriented Programming with Spring](https://docs.spring.io/spring-framework/docs/3.0.0.M3/reference/html/ch08s06.html)

To force CGLIB proxying when using the @AspectJ autoproxy support, set the 'proxy-target-class' attribute of the `<aop:aspectj-autoproxy>` element to true:

```xml
<aop:aspectj-autoproxy proxy-target-class="true"/>
```

또는

```kotlin
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.EnableAspectJAutoProxy

@Configuration
@EnableAspectJAutoProxy(proxyTargetClass = true)
class AppConfig {
}
```

## Performance

CGLIB 은 바이트코드를 조작해서 클래스를 생성하고, JDK Dynamic Proxy 는 리플렉션을 사용하기 때문에 CGLIB 이 성능이 더 좋다.
일단 리플렉션을 사용하는 것은 성능상 조금 단점이 있다고 생각하면 된다. 

[Why is reflection slow ?](https://stackoverflow.com/questions/3502674/why-is-reflection-slow)

__Dynamic type checking:__ 
- When using reflection, method invocation and field access require dynamic type checking at runtime. The JVM must verify that the method or field actually exists in the target class and that the provided arguments match the method signature. This runtime verification adds overhead compared to direct calls, where type checking is done at compile time.

그 외에도 __Object boxing and unboxing__, __Access checks__ 등이 있다.