---
layout  : wiki
title   : GC
summary : Garbage Collection
date    : 2023-02-10 11:28:32 +0900
updated : 2023-02-10 12:15:24 +0900
tag     : gc java kotlin
toc     : true
comment : true
public  : true
parent  : [[/java]]
latex   : true
---
* TOC
{:toc}

## Background

### What is GarbageCollection

Automatic garbage collection is the __process of looking at heap memory, identifying which objects are in use and which are not, and deleting the unused objects__.
The main purpose of garbage collection is to __free up memory space__ and __prevent [memory leaks](https://baekjungho.github.io/wiki/java/java-memoryleak/)__, which can cause an application to slow down or crash. 
In Java, process of deallocating memory is handled __automatically__ by the garbage collector.

### Stop the World

__stop the world__ 는 GC 를 수행하기 위해 모든 Application 의 Thread 들이 일시적으로 정지하는 현상을 의미한다.
따라서, GC 가 빈번하게 일어난다고 해서 좋은 건 아니며, stop-the-world 시간을 줄이는 것이 중요하다.

즉, GC 튜닝이란 이 stop-the-world 시간을 줄이는 것이다.

### Principals

모든 Garbage collector 는 두 가지 원칙을 준수해야 한다.

1. 알고리즘은 반드시 모든 가비지를 수집해야 한다.
2. 살아 있는 객체는 절대로 수집해서는 안된다.
  - The garbage collector can reclaim only objects that have no references pointing to them either directly or indirectly from the root set.

두 번째 원칙이 더 중요한데, 살아 있는 객체를 수집하면 __segmentation fault__ 가 발생할 수 있다.

> segmentation fault 는 프로그램이 허용되지 않는 메모리 영역에 접근을 시도하거나 허용되지 않는 방법으로 메모리 영역에 접근을 시도하려는 경우를 의미한다.

### Unreachable

참조가 있는 상태를 reachable, 참조가 없는 상태를 unreachable 이라고 한다. unreachable 객체를 대상으로 gc 를 수행한다.

### GC Root

GC Root 는 GC 프로세스의 __시작점(메모리의 고정점, anchor point)__ 이다. 메모리 풀 외부에서 내부를 가리키는 포인터이다.

__Types__:
- Stack Frame: 로컬 스택에 저장된 메소드에 대한 로컬 변수 및 매개변수
- JNI(Java Native Interface): JNI 호출을 위해 생성된 네이티브 코드 Java 개체입니다. 로컬 변수, JNI 메소드에 대한 매개변수 및 글로벌 JNI 참조를 포함
- Register(끌어올려진(hoisted) 변수)
- Classes loaded by the system classloader
- Live threads
- Static variables

GC roots are starting points for __[tracing collectors](https://www.baeldung.com/java-gc-cyclic-references#tracing-gcs)__.

### Java References

GC 는 기본적으로 unreacheable 인 객체를 대상으로 gc 를 수행하지만 java.lang.ref 패키지를 활용하면 gc 대상을 제어할 수 있다. 즉, 객체의 reachability를 조절하기 위해서 java.lang.ref 패키지의 SoftReference, WeakReference, PhantomReference, ReferenceQueue 등을 사용할 수 있다.
자세한 내용은 [Java Reference 와 GC - Naver D2](https://d2.naver.com/helloworld/329631) 참고.

### System.gc

__Do not use System.gc()__:
- There is no guarantee that the actual GC will be triggered.
- System.gc() triggers a major GC. Hence, there is a risk of spending some time on the stop-the-world phase, depending on your garbage collector implementation. As a result, we have an unreliable tool with a potentially significant performance penalty.

System.gc() 가 그나마 [유용한 경우](https://www.baeldung.com/java-system-gc#other-usages)도 있다고 하는데, 대부분의 GC 는 우리보다 똑똑하다. 정말 잘 알고 쓰는 것이 아니라면, 사용하지 않는 것을 추천한다.

### Java Memory Layout - Ordinary Object Pointers

> [Java Memory Layout](https://www.baeldung.com/java-memory-layout)

HotSpot JVM 은 [OOPS(Ordinary Object Pointers)](https://github.com/openjdk/jdk15/tree/master/src/hotspot/share/oops)라는 데이터 구조를 사용하여 객체에 대한 포인터를 나타낸다.

JVM 의 모든 pointer(객체와 배열)는 [oopDesc](https://github.com/openjdk/jdk15/blob/e208d9aa1f185c11734a07db399bab0be77ef15f/src/hotspot/share/oops/oop.hpp#L52) 라는 데이터 구조에 기반한다.

해당 메모리 레이아웃은 모든 객체에 대해 기계어 워드 2개로 구성된 헤더로 시작된다.

- One __mark word__: 인스턴스 관련 메타데이터를 가리키는 포인터 
  - The HotSpot JVM uses this word to store identity hashcode, biased locking pattern, locking information, and GC metadata.
- One, possibly compressed, __klass word__: 클래스 메타데이터를 가리키는 포인터 
  - 클래스 이름, 해당 수정자, 슈퍼클래스 정보 등과 같은 언어 수준 클래스 정보를 캡슐화한다.

Java7 까지는 instanceOop 의 Klass word 가 자바 힙의 일부인 permgen 영역을 가리켰지만, Java8 부터는 자바 힙 밖을 가리키므로 객체 헤더가 필요 없게 되었다.

__oop inheritance structures__:

```
oop (추상 베이스)
  instanceOop (인스턴스 객체)
  methodOop (메서드 표현형)
  arrayOop (배열 추상 베이스)
  symbolOop (내부 심볼 / 스트링 클래스)
  klassOop (Klass 헤더) (자바 7 이전만 해당)
  markOop
```

### Arena

Hotspot GC 는 __아레나(arena, 무대)__ 라는 메모리 영역에서 작동한다. 그리고 HotSopt 은 자바 Heap 을 관리할 때 system call 을 하지 않는다.
유저 공간 코드에서 힙 크기를 관리한다.

### Weak Generational Hypothesis

Garbage collector 는 두 가지 전제조건을 기반으로 한다.

__약한 세대별 가설(Weak Generational Hypothesis)__:
- 대부분의 객체는 금방 접근 불가능 상태(unreachable)가 된다.
- 오래된 객체에서 젊은 객체로의 참조는 아주 적게 존재한다.

결론은 장수 객체와 단명 객체를 완전히 떼어놓는게 가장 좋다는 것이다. 이러한 전제조건을 기반으로 물리적 공간을 두 개로 나눴는데, Young Generation 과 Old Generation 이다.

늙은 객체가 젋은 객체를 참조하고 있을 수도 있는데, 이를 __카드 테이블(card-table)__ 이라는 자료 구조에 저장해둔다.
이 카드 테이블에서 각 원소는 Old Generation 공간의 512 byte 영역을 가리킨다.

핵심 로직은 다음과 같다. 늙은 객체 `o` 에 있는 참조형 필드 값이 바뀌면 `o` 에 해당하는 instanceOop 가 들어 있는 카드를 찾아 해당 엔트리를 __Drity Marking__ 한다.
HotSpot 은 레퍼런스 필드를 업데이트할 때마다 단순 __쓰기 배리어(write barrier)__ 를 이용한다.

```
// 0 으로 설정하는 것이 Dirty 하다고 표시하는 것이다.
// 카드 테이블이 512 바이트라서 9비트 우측으로 시프트한다.
cards[*instanceOop >> 9] = 0;
```

> 쓰기 배리어(write barrier)란 늙은 객치와 젋은 객체의 관계가 맺어지면 카드 테이블 엔트리를 더티 값으로 세팅하고, 반대로 관계가 해제되면 더티 값을 지우는, 실행 엔진에 포함된 작은 코드 조각을 의미한다.

## GCs 

### Mark and Compact

As stated earlier, having to __mark and compact all the objects in a JVM is inefficient__.
As more and more objects are allocated, the list of objects grows and grows leading to longer and longer garbage collection time. However, empirical analysis of applications has shown that most objects are short lived.

점점 더 많은 개체가 할당됨에 따라 개체 목록이 증가하고 증가하여 가비지 수집 시간이 점점 길어지게 되어 비효율적이다.

#### Marking

The first step in the process is called marking. __This is where the garbage collector identifies which pieces of memory are in use and which are not.__

![](/resource/wiki/java-garbage-collection/marking.png)

This can be a very time consuming process if all objects in a system must be scanned.

#### Normal Deletion

Normal deletion removes unreferenced objects leaving referenced objects and pointers to free space.

![](/resource/wiki/java-garbage-collection/normal-deletion.png)

#### Deletion with Compacting

To further __improve performance__, in addition to deleting unreferenced objects, __you can also compact the remaining referenced objects.__ By moving referenced object together, this makes new memory allocation much easier and faster.

![](/resource/wiki/java-garbage-collection/deletion-with-compacting.png)

### Birth of Generation 

Mark and Compact 방식은 마킹하고 압축하는 과정에서 개체가 많을 수록 GC 의 시간이 길어져 비효율적이다. 이것을 개선하기 위해서 __Heap Memory 를 세대별로 분류__ 한 방식이 탄생하게 되었다.

![](/resource/wiki/java-garbage-collection/heap.png)

The __Young Generation__ is where all new objects are allocated and aged. When the young generation fills up, this causes a __minor garbage collection__. Minor collections can be optimized assuming a high object mortality rate. A young generation full of dead objects is collected very quickly. Some surviving objects are aged and eventually move to the old generation.
- Young Generation 은 많은 객체가 할당되고 노화되는 영역이며, 이 영역이 꽉차게 되었을 때 발생하는 GC(`Eden Area`) 를 __Minor GC__ 라고 부른다.
- __Stop the World Event__: All minor garbage collections are "Stop the World" events. This means that all application threads are stopped until the operation completes. Minor garbage collections are always Stop the World events.
- Eden 은 새로 생성된 객체가 할당되는 곳이다. 아직 사용중인 객체는 Survivor 영역으로 이동하며, Eden 영역은 비워진다.

The __Old Generation__ is used to store long surviving objects. Typically, a threshold is set for young generation object and when that age is met, the object gets moved to the old generation. Eventually the old generation needs to be collected. This event is called a major garbage collection.
- Young Generation 의 threshold(임계값)이 10일이라고 치면, 10일 이후에 살아남은 개체들은 (늙었으니) Old Generation 으로 이동시킨다.
- Young Generation 에서 Old Generation 으로 이동 시키는 과정을 __Major GC__ 라고 한다.
- Major garbage collection are also Stop the World events. Often a major collection is much slower because it involves all live objects. So for Responsive applications, major garbage collections should be minimized. Also note, that the length of the Stop the World event for a major garbage collection is affected by the kind of garbage collector that is used for the old generation space.

The __Permanent generation__ contains `metadata` required by the JVM to describe the classes and methods used in the application. The permanent generation is populated by the JVM at runtime based on classes in use by the application. In addition, Java SE library classes and methods may be stored here.

Java8 부터 [Permanent 영역은 사라지고 Metaspace 영역](https://johngrib.github.io/wiki/java8-why-permgen-removed/)으로 되었다. 

__In summary: Why is heap memory separated by generation in GC?__

The heap memory is separated into different generations because of __performance reasons__. __It is based on the observation that most objects are short-lived and die young, while a few objects tend to survive for a longer time__.

When the JVM creates a new object, it is stored in the young generation. The young generation is smaller in size than the old generation, so minor GCs occur more frequently and are much faster. This helps to minimize the time the application is stopped while the GC is running.

Objects that survive multiple minor GCs are moved to the old generation. The old generation is much larger than the young generation, so it takes longer to fill up. When it does fill up, a major GC or full GC is triggered, which takes longer to complete than a minor GC. However, since major GCs occur less frequently, their impact on application performance is reduced.

By dividing the heap into different generations, the JVM can manage memory more efficiently. Most objects can be quickly collected and freed up, while a smaller number of longer-lived objects are collected less frequently, minimizing the impact of GC on performance.

### Allocation, Aging, Promotion

First, any new objects are allocated to the eden space. Both survivor spaces start out empty.

![](/resource/wiki/java-garbage-collection/allocation.png)

When the eden space fills up, a minor garbage collection is triggered.

![](/resource/wiki/java-garbage-collection/eden-space.png)

Referenced objects are moved to the first survivor space. Unreferenced objects are deleted when the eden space is cleared.

![](/resource/wiki/java-garbage-collection/copying.png)

At the next minor GC, the same thing happens for the eden space. Unreferenced objects are deleted and referenced objects are moved to a survivor space. However, in this case, they are moved to the second survivor space (S1). In addition, objects from the last minor GC on the first survivor space (S0) have their age incremented and get moved to S1. Once all surviving objects have been moved to S1, both S0 and eden are cleared. Notice we now have differently aged object in the survivor space.

![](/resource/wiki/java-garbage-collection/aging.png)

At the next minor GC, the same process repeats. However this time the survivor spaces switch. Referenced objects are moved to S0. Surviving objects are aged. Eden and S1 are cleared.

![](/resource/wiki/java-garbage-collection/aging2.png)

This slide demonstrates __promotion__. After a minor GC, when aged objects reach a certain age threshold (8 in this example) they are promoted from young generation to old generation.
- Young Generation 에서 Old Generation 으로 이동하는 과정이 Promotion

![](/resource/wiki/java-garbage-collection/promotion.png)

이러한 과정을 계속 반복하게 된다.

__In Summary:__

![](/resource/wiki/java-garbage-collection/summary.png)

## JDK9 G1 GC

__JDK9 ~ 13 Heap Memory__:

![](/resource/wiki/java-garbage-collection/jdk9-memory.png)

JDK9 부터는 __[Garbage First Garbage Collector(G1GC)](https://www.oracle.com/java/technologies/javase/hotspot-garbage-collection.html)__ 가 기본 방식으로 채택되었다. JDK7 에서 처음 등장하였다.

The G1 collector is a server-style garbage collector, targeted for multi-processor machines with large memories.

__G1 Heap Allocation__:

![](/resource/wiki/java-garbage-collection/g1-heap-allocation.png)

## Links

- [Garbage Collection Document](https://www.oracle.com/webfolder/technetwork/tutorials/obe/java/gc01/index.html)
- [InfoQ Garbage Collection is Good!](https://www.infoq.com/presentations/garbage-collection-benefits/)
- [DZone The Evolution of the Java Memory Architecture](https://dzone.com/articles/evolution-of-the-java-memory-architecture-java-17)
- [DZone Java Memory Management](https://dzone.com/articles/java-memory-management)
- [DZone The JVM Architecture Explained](https://dzone.com/articles/jvm-architecture-explained)
- [DZone A Detailed Breakdown of the JVM](https://dzone.com/articles/a-detailed-breakdown-of-the-jvm)
- [JVM Garbage Collection](https://renuevo.github.io/java/garbage-collection/)
- [JVM 튜닝](https://imp51.tistory.com/entry/G1-GC-Garbage-First-Garbage-Collector-Tuning)
- [Java Garbage Collection - D2](https://d2.naver.com/helloworld/1329)

## References

- Optimizing Java / Benjamin Evans, James Gough, Chris Newland / O'REILLY
- Java Performance: The Definitive Guide / Scott Oaks / O'REILLY
- The Garbage Collection Handbook / Richard Jones, Antony Hosking, Eliot Moss / Chapman and Hall/CRC