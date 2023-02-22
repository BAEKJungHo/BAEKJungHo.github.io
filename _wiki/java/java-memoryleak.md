---
layout  : wiki
title   : Memory Leak
summary : 
date    : 2022-07-09 11:28:32 +0900
updated : 2022-07-09 12:15:24 +0900
tag     : java
toc     : true
comment : true
public  : true
parent  : [[/java]]
latex   : true
---
* TOC
{:toc}

## Memory Leak

> Memory Leak 이란 heap memory 에 할당된 객체들이 GC(Garbage Collector)에 의해 제거되지 않아, 불필요한 객체들이 메모리에 계속 남아있는 현상을 의미한다.

- Memory Leak 은 시간이 지남에 따라 시스템 성능 저하를 일으킴
- Memory Leak 이 지속되면 heap memory 가 꽉 차서, OutOfMemoryError 에 의해 시스템이 종료됨

GC 는 참조 되지 않은 객체를 주기적으로 제거하지만, 참조 중인 객체는 수집하지 않는다. 이 과정에서 Memory Leak 이 발생할 수 있다.

Memory leaks in a JVM can occur due to a variety of reasons, including:

- __Unreleased resources__: When an application acquires a resource like a file handle, database connection, or network socket, it must release the resource when it is no longer needed. Failure to release these resources can lead to memory leaks, as the resources are not released and the application continues to consume more and more memory.
- __Caches__: Applications may use caches to improve performance by storing frequently used data in memory. If these caches are not managed properly, they can cause memory leaks by storing data that is no longer needed.
- __Circular references__: Objects that reference each other in a circular pattern can cause memory leaks, as the JVM's garbage collector is unable to detect that these objects are no longer being used and should be garbage collected.
- __Poorly implemented data structures__: Data structures like linked lists or trees can also cause memory leaks if they are not implemented properly. For example, a linked list node that is not properly removed from the list can cause all subsequent nodes to remain in memory, even if they are no longer needed.
- __Large objects__: Creating and storing large objects in memory can also cause memory leaks, especially if the objects are not properly managed or released.

### by static field

- Java 에서 static field 는 실행 중인 애플리케이션 전체 수명과 일치한다. 
- Collection 혹은 큰 객체가 static 으로 선언되면 애플리케이션 수명 내내 메모리에 남아있기 때문에, Memory Leak 이 발생한다.

따라서, 정적 변수의 사용을 최소화 해야 한다.

## by resource not closed

새로운 커넥션을 맺거나 스트림을 열 때마다 JVM 은 리소스에 대한 메모리를 할당한다. (Ex. DB Connection, InputStream, Session, and so on)

만약에, 리소스를 사용하고 난 후 닫아주지 않으면, 리소스에 남겨진 열린 연결들이 메모리를 차지하기 때문에 OutOfMemoryError 가 발생할 수도 있다.

방지하는 방법은 아래와 같다.

- __finally 문에 close() 호출__
  - 리소스를 닫는 코드에서 예외가 발생되는 코드가 존재해서는 안된다.
- __Autocloseable 을 구현한 클래스인지 확인__
- __Java7 이상이면, [try-with-resources](https://docs.oracle.com/javase/tutorial/essential/exceptions/tryResourceClose.html) 사용__
  - close() 메서드가 자동으로 호출됨

## by Improper equals() and hashCode() implementations

HashSet 과 HashMap 을 사용하는 경우 equals() 와 hashCode() 를 재정의 하지 않으면 Memory Leak 이 발생할 수 있다.

```java
public class User {
    public String name;
    
    public User(String name) {
        this.name = name;
    }
}
```

HashMap 의 Key 값으로 User 객체를 넣을 것이다.

```java
@Test
public void givenMap_whenEqualsAndHashCodeNotOverridden_thenMemoryLeak() {
    Map<Person, Integer> map = new HashMap<>();
    for(int i=0; i<100; i++) {
        map.put(new User("baek"), 1);
    }
    Assert.assertFalse(map.size() == 1);
}
```

equals() 메서드를 재정의 하지 않아서, 중복 객체가 쌓여 메모리가 증가하게 된다.

### by Inner Classes That Reference Outer Classes

> [Inner Classes That Reference Outer Classes](https://www.baeldung.com/java-memory-leaks#4-inner-classes-that-reference-outer-classes)

### by finalize()

> [Through finalize() Methods](https://www.baeldung.com/java-memory-leaks#4-inner-classes-that-reference-outer-classes)

### by intern String

Java String 풀은 PermGen 에서 HeapSpace 로 전송될 때 Java 7에서 주요 변경을 거쳤다. 그러나 버전 6 이하에서 작동하는 응용 프로그램의 경우 큰 문자열로 작업할 때 더 주의해야 한다.

방대한 String 객체 를 읽고 해당 객체에 대해 intern() 을 호출하면 PermGen(영구 메모리)에 있는 문자열 풀로 이동하고 애플리케이션이 실행되는 동안 그대로 유지되어 Memory Leak 이 발생할 수 있다.

### by ThreadLocal

> [Using ThreadLocals](https://www.baeldung.com/java-memory-leaks#7-using-threadlocals)
> 
> [ThreadLocal 사용 시 주의 점](https://baekjungho.github.io/wiki/spring/spring-concurrency/#threadlocal-%EC%9D%84-%EC%82%AC%EC%9A%A9%ED%95%A0-%EB%95%8C%EB%8F%84-%EC%A3%BC%EC%9D%98%EC%A0%90%EC%9D%B4-%EC%9E%88%EB%8A%94%EB%8D%B0)

## Links

- [Understanding Memory Leaks in Java](https://www.baeldung.com/java-memory-leaks)
- [implements Closeable or implements AutoCloseable](https://stackoverflow.com/questions/13141302/implements-closeable-or-implements-autocloseable)

