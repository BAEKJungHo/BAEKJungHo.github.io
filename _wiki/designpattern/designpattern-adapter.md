---
layout  : wiki
title   : ADAPTER
summary : 
date    : 2025-02-08 11:28:32 +0900
updated : 2025-02-08 12:15:24 +0900
tag     : designpattern
toc     : true
comment : true
public  : true
parent  : [[/designpattern]]
latex   : true
---
* TOC
{:toc}

## ADAPTER

![](/resource/wiki/designpattern-adapter/adapter-meaning.png)

The Adapter design pattern solves problems like:
- How can a class be reused that has not the interface clients require?
- How can classes work together that have incompatible interfaces?

___[Adapter](https://en.wikipedia.org/wiki/Adapter_pattern)___ 은 인터페이스의 비호환성을 위해서 사용되는 경우가 많다. 일반적으로 설계 결함을 교정하는 보상 패턴이라고 볼 수 있다. 

### Design Principles

- ___[최소 지식 원칙(the least knowledge principle)](https://klarciel.net/wiki/oop/oop-minimalist-concepts/)___: 정말 친한 친구하고만 얘기하라.

기존 코드를 변경하지 않고 원하는 인터페이스 구현체를 만들어 재사용할 수 있으며 기존 코드가 하던 일과 특정 인터페이스 구현체로 변환하는 작업을 각기 다른 클래스로 분리하여 관리할 수 있다는 장점이 있다.

![](/resource/wiki/designpattern-adapter/adapter-structure.png)

- Client: 클라이언트는 타겟 인터페이스만 바라본다.
- Target Interface
- Adapter: 어댑터에서 타겟 인터페이스를 구현한다.
- Adaptee: 모든 요청은 어댑티에게 위임된다. (변환 대상) 기존 시스템이나 클래스를 의미하는 객체입니다. 이 객체는 호환되지 않는 인터페이스를 가지고 있으며, 이 인터페이스를 Target 인터페이스로 변환해주는 역할을 한다.

어댑티 패턴에서는 Adaptee 클래스를 변환 대상으로 보고, 이를 Target 인터페이스로 맞추는 방식으로 작동합니다. 즉, Adaptee 는 기존의 시스템을 대표하는 클래스이며, Target 인터페이스는 새로운 시스템이나 클라이언트 코드에서 사용하려는 표준화된 인터페이스이다.

__[ClassAdapter vs ObjectAdapter](https://web.archive.org/web/20170828230927/http://w3sdesign.com/?gr=s01&ugr=proble#gf)__:

```java
package com.sample.adapter.basic;

public class Client { 
    public static void main(String[] args) { 
        // Creating an object adapter 
        // and configuring it with an Adaptee object.
        Target objectAdapter = new ObjectAdapter(new Adaptee());  
        System.out.println("(1) Object Adapter: " + objectAdapter.operation()); 
        
        // Creating a class adapter 
        // that commits to the Adaptee class at compile-time.
        Target classAdapter = new ClassAdapterAdaptee();        
        System.out.println("(2) Class Adapter : " + classAdapter.operation()); 
    } 
}

public interface Target {
  String operation();
}

public class ObjectAdapter implements Target {
  private Adaptee adaptee;

  public ObjectAdapter(Adaptee adaptee) {
    this.adaptee = adaptee;
  }
  public String operation() {
    // Implementing the Target interface in terms of 
    // (by delegating to) an Adaptee object.
    return adaptee.specificOperation();
  }
}

public class ClassAdapterAdaptee extends Adaptee implements Target {
  public String operation() {
    // Implementing the Target interface in terms of 
    // (by inheriting from) the Adaptee class.
    return specificOperation();
  }
}

public class Adaptee {
  public String specificOperation() {
    return "Hello World from Adaptee!";
  }
}
```

### HandlerAdapter

Spring Framework 에서 HandlerAdapter 도 어댑터 패턴이 적용되었다. 개발자가 작성하는 다양한 형태의 핸들러 코드를 스프링 MVC 가 실행할 수 있는 형태로 변환해주는 어댑터용 인터페이스이다.

Spring MVC 에서는 다양한 종류의 Controller(핸들러)를 지원해야 한다.
하지만 DispatcherServlet(프론트 컨트롤러)은 여러 종류의 핸들러를 직접 처리하는 대신, HandlerAdapter 를 이용해 적절한 방식으로 핸들러를 실행한다.
즉, 핸들러(컨트롤러)의 종류와 DispatcherServlet 간의 결합을 느슨하게 만들어 유연성을 제공하는 것이 Adapter 패턴의 핵심 역할이다.

다음과 같은 이점이 있다.

- 핸들러(컨트롤러)와 DispatcherServlet 간의 결합도를 낮춤
→ 새로운 타입의 컨트롤러(핸들러)가 추가되더라도 HandlerAdapter 만 구현하면 기존 DispatcherServlet 을 수정할 필요가 없음

- 다양한 핸들러 유형을 지원 가능
→ SimpleControllerHandlerAdapter, RequestMappingHandlerAdapter 등 다양한 핸들러를 처리할 수 있음

- 확장성이 뛰어남
→ 새로운 방식의 핸들러가 필요할 경우 새로운 HandlerAdapter 를 추가하면 됨

### java.util.Arrays#asList(T…)

어댑터 패턴이란, 호환되지 않는 인터페이스를 가진 클래스들이 서로 상호작용할 수 있도록 중재하는 패턴이다.
java.util.Arrays#asList(T... a)는 어댑터 패턴을 활용하는 예시로 볼 수 있다. 이 메서드는 배열을 리스트로 변환하는 방법을 제공하며, 그 과정에서 배열 타입을 List 인터페이스에 맞게 변환하는 역할을 한다.
Arrays.asList()는 배열을 List 로 변환하는 과정에서 배열과 리스트라는 서로 다른 타입의 객체를 호환 가능하게 만드는 역할을 한다.

```java
String[] array = {"apple", "banana", "cherry"};
List<String> list = Arrays.asList(array);
```

### Backward Interface Compatibility

JDK 1.0 에는 컬렉션 컨테이너를 순회하는 Enumeration 클래스가 포함되어있었지만, JDK 2.0 부터 Iterator 로 대체되었다.
만약, 버전이 업데이트되면서 이전 버전의 인터페이스르 사용하지 못하도록 제거하는 경우, 이전 버전 인터페이스를 사용하는 모든 서비스에 문제가 발생할 것이다.

따라서 Collections 에서는 내부 구현에서 Iterator 클래스를 호출하도록 구현되어있다.

![](/resource/wiki/designpattern-adapter/enumeration.png)

### SLF4J

To switch logging frameworks, just replace ___[slf4j](https://www.slf4j.org/manual.html)___ bindings on your class path. For example, to switch from java.util.logging to reload4j, just replace slf4j-jdk14-2.0.16.jar with slf4j-reload4j-2.0.16.jar.

since 2.0.0 As of version 2.0.0, SLF4J bindings are called providers. Nevertheless, the general idea remains the same. SLF4J API version 2.0.0 relies on the ServiceLoader mechanism to find its logging backend. See the relevant FAQ entry for more details.

Here is a graphical illustration of the general idea.

![](/resource/wiki/designpattern-adapter/slf4j.png)

## References

- Gangs of Four Design Patterns
- 设计模式之美 / 王争