---
layout  : wiki
title   : GarbageCollection
summary : 
date    : 2023-02-10 11:28:32 +0900
updated : 2023-02-10 12:15:24 +0900
tag     : java kotlin
toc     : true
comment : true
public  : true
parent  : [[/java]]
latex   : true
---
* TOC
{:toc}

## What is GarbageCollection

Automatic garbage collection is the __process of looking at heap memory, identifying which objects are in use and which are not, and deleting the unused objects__.
The main purpose of garbage collection is to free up memory space and __prevent memory leaks__, which can cause an application to slow down or crash.

In Java, process of deallocating memory is handled automatically by the garbage collector.

## JVM Architecture

![](/resource/wiki/java-garbage-collection/hotspot-jvm.png)

__The key components of the JVM that relate to performance are:__

- Heap Memory
- Garbage Collector
- JIT Compiler

There are three components of the JVM that are focused on when tuning performance. The heap is where your object data is stored. This area is then managed by the garbage collector selected at startup. Most tuning options relate to sizing the heap and choosing the most appropriate garbage collector for your situation. The JIT compiler also has a big impact on performance but rarely requires tuning with the newer versions of the JVM.

## Describing Garbage Collector Process

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

## Links

- [Garbage Collection Documents](https://www.oracle.com/webfolder/technetwork/tutorials/obe/java/gc01/index.html)