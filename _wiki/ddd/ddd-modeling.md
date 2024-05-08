---
layout  : wiki
title   : Domain Modeling
summary : 
date    : 2024-05-02 22:57:32 +0900
updated : 2024-05-02 23:21:24 +0900
tag     : ddd
toc     : true
comment : true
public  : true
parent  : [[/ddd]]
latex   : true
---
* TOC
{:toc}

## Domain Modeling

### The Importance of a Shared Model

Domain experts 와 Developers 간의 iterative process 는 (at the core of "agile" development process) 는 __translation cost__ 가 크다.
이러한 agile 한 프로세스에서 translator 의 역할은 Developers 가 담당한다.

![](/resource/wiki/ddd-modeling/shared-model.png)

#### The goal of Domain-Driven Design

이러한 문제를 해결하기 위해 Domain experts, Developers, Other stakeholders, Code 등은 same model 인 __Shared Model__ 을 통해 communication 한다.
코드 또한 shared mental model 을 직접적으로 반영한다.

#### How to create a shared model - guidelines

- Focus on business events and workflows rather than data structures.
- Partition the problem domain into smaller subdomains.
- Create a model of each subdomain in the solution.
- Develop a common language (known as the "Ubiquitous Language") that is shared between everyone involved in the project and is used everywhere in the code.

### Domain Events

__Domain Events__ are always written in the past tense - something happened - because it's a fact that can't be changed.
For example, "new order form received" is a Domain Event.

Domain Events 를 발굴하는 것은 shared model 을 구축하는데 아주 중요하다. 발굴하기 위한 방법으로는 __Event Storming__ 이 있다.

#### Using Event Storming to Discover the Domain

__[The most-likely outcome of an Event Storming workshop](https://threedots.tech/)__:

![](/resource/wiki/ddd-modeling/event_storming.png)

- Domain experts, Developers, Other stakeholders 를 포함하여 facilitated workshop 을 통해 Event Storming 을 시작할 수 있다. (It's called EventStorming Workshop)
- 같은 Room 에 있어야 하며 벽면에 whiteboard 가 많으면 좋다.
- 누구든 질문할 수 있고 답변할 수 있다.
- sticky notes 를 사용해도 되고, draw 해도 된다.
- 워크샵이 진행되는 동안 사람들은 business events 를 sticky notes 에 적어서 whiteboard 에 붙인다.
- 다른 사람은 해당 노트에, 이 이벤트가 발생할 수 있는 business workflows 를 적을 수 있다.
  - The notes can often be organized into a timeline.
- ref
  - [How we used Event Storming Meetings for enabling Software Domain-Driven Design](https://medium.com/building-inventa/how-we-used-event-storming-meetings-for-enabling-software-domain-driven-design-401e5d708eb)
  - [Domain-driven Design: A Practitioner's Guide](https://ddd-practitioners.com/2023/03/20/remote-eventstorming-workshop/)

### Documenting Commands

"What made these Domain Events happen ?" Domain Events 가 발생한 이유를 __commands__ 라고 한다.

- e.g Command: "Place an order"; Domain Event: "Order placed"

![](/resource/wiki/ddd-modeling/input-output-way.png)

This way of thinking about business processes - a pipeline with an input and some outputs - is an excellent fit with the way that __functional programming works__.

## Links

- [Domain Driven Design and Development In Practice](https://www.infoq.com/articles/ddd-in-practice/)
- [Domain Modeling with FP (DDD Europe 2020)](https://www.slideshare.net/ScottWlaschin/domain-modeling-with-fp-ddd-europe-2020)

## References

- Domain Modeling Made Functional / Scott Wlaschin / The Pragmatic Programmers