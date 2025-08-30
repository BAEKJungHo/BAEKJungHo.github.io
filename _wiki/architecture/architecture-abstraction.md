---
layout  : wiki
title   : ABSTRACTION
summary : 
date    : 2024-09-10 15:02:32 +0900
updated : 2024-09-10 18:12:24 +0900
tag     : architecture cs abstraction
toc     : true
comment : true
public  : true
parent  : [[/architecture]]
latex   : true
---
* TOC
{:toc}

## ABSTRACTION

___[ABSTRACTION](https://en.wikipedia.org/wiki/Abstraction)___ 란 복잡한 자료, 모듈 시스템 등으로 부터 핵심적인 개념, 기능등을 간추려 내는 것을 의미한다.
이에 반대되는 개념인 ___명세화(specification)___ 는 일반적인 개념이나 추상적인 생각을 구체적인 사실로 분해하거나 분석하는 과정이다.
대표적으로 수학의 함수는 무수한 계산 과정을 한 기호로 추상화한 것이다.

추상화는 복잡성을 해결하는 데 있어 가장 핵심적인 원리이자 본질적인 개념이다.

> <mark><em><strong>Hides unnecessary details to Reduce complexity</strong></em></mark>

쉽게 설명하면, ___[추상화를 디자인하는 과정(Designing Abstractions)](https://branislavjenco.github.io/desired-state-systems/)___ 은 근본적인 복잡성을 숨기고 시스템을 사용하는 사람 또는 대상에게 더 간단한 인터페이스를 제공하는 과정을 의미한다.
복잡한 내부 구현이 아닌 추상화에만 집중할 수 있어서 프로그램 확장성이 향상되고 요구 사항 변화에도 더 잘 대응할 수 있다.

___함수 추상화(Function Abstractions)___ 를 잘하면 사용자는 함수의 내부 코드를 읽지 않고도 사용할 수 있다.

___데이터 추상화(Data Abstractions)___ 는 데이터를 어떻게 저장하고 처리하는지 구체적인 내용을 감추고, 사용자(클라이언트)는 필요한 기능만 사용할 수 있게 만드는 개념이다.

예를 들어 어떤 사람이 "물건들을 모아놓는 상자"를 만들고 싶다고 가정하자. 이 사람은 상자에 물건을 추가(add) 하고,
상자에서 물건을 빼기(remove) 하거나, 특정 물건이 상자 안에 있는지 확인(contains) 하고, 상자에 들어있는 물건이 몇 개인지 알고 싶어(size) 한다.
이 사람은 상자가 어떻게 만들어졌는지, 어떤 방식으로 물건들을 보관하는지 전혀 신경 쓰지 않는다. 즉,
상자가 배열로 만들어졌는지, 연결 리스트(Linked List)로 만들어졌는지,
다른 어떤 자료구조로 만들어졌는지는 관심이 없다. 사용자는 단지 **"물건들을 넣고 빼고 확인할 수 있는 상자"** 라는 기능만 알고 있으면 되는데,
이것이 바로 데이터 추상화이다.

이렇게 하면 사용자는 내부 구현 걱정 없이 기능을 사용할 수 있고, 구현자는 내부 구조를 자유롭게 바꿀 수 있어 유지보수와 확장성이 좋아진다.

추상화가 적용된 다른 사례도 살펴보자.

- 고급 프로그래밍 언어의 경우에도 기계 명령어의 세부 사항에 신경 쓸 필요가 없고, 고급 프로그래밍 언어로 CPU 를 직접 제어할 수 있다.
- 실행 중인 프로그램은 프로세스로 추상화 된다.
- 물리 메모리와 파일은 가상 메모리로 추상화 된다.
- 네트워크 프로그래밍은 소켓으로 추상화 된다.
- 프로세스와 프로세스에 종속적인 실행환경은 컨테이너(container)로 추상화 된다.
  - Containers are an abstraction at the software application level that packages an application's code together with all its dependencies and runtime environment, allowing it to run consistently across different systems.
  - 컨테이너는 앱 계층에서 코드와 종속성을 함께 패키징하는 추상화이다. 여러 컨테이너가 동일한 머신에서 실행될 수 있으며, 다른 컨테이너와 OS 커널을 공유하여 각 컨테이너가 사용자 공간에서 격리된 프로세스로 실행된다. 컨테이너는 VM보다 공간을 적게 차지하며(컨테이너 이미지는 일반적으로 수십 MB 크기), 더 많은 애플리케이션을 처리할 수 있고 더 적은 VM과 운영 체제를 필요로 한다.
- CPU, 운영 체제, 응용프로그램은 VM 으로 묶여(packaging) 추상화 된다.
  - Virtualization emulates computer hardware to enable the hardware elements of a single computer including processors, memory, and storage to be divided into multiple computers, commonly called virtual machines (VMs).
  - 가상 머신(VM)은 물리적 하드웨어를 추상화하여 하나의 서버를 여러 대의 서버로 변환하는 것이다. 하이퍼바이저를 사용하면 단일 머신에서 여러 VM을 실행할 수 있다. 각 VM에는 운영 체제, 애플리케이션, 필수 바이너리 및 라이브러리의 전체 복사본이 포함되어 수십 GB의 용량을 차지한다. 또한 VM은 부팅 속도가 느릴 수 있다.
- 포인터(pointer)는 메모리 주소를 추상화한 것이고, 참조(reference)는 포인터를 한 번 더 추상화한 것이다.

이처럼 추상화는 프로그래머를 저수준 계층에서 점점 더 멀어지게 만들고, 저수준 계층의 세부 사항도 신경 쓸 필요가 없도록 만든다.
하지만, 저수준 계층에 대한 이해는 고급 프로그래머를 남들과 구분 짓는 특징 중 하나이다.

## Links

- [Abstraction, CS211 course, Cornell University.](https://www.cs.cornell.edu/courses/cs211/2006sp/Lectures/L08-Abstraction/08_abstraction.html)
- [The Law of Leaky Abstractions](https://www.joelonsoftware.com/2002/11/11/the-law-of-leaky-abstractions/)

## References

- The secret of the underlying computer / lu xiaofeng