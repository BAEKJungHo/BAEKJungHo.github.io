---
layout  : wiki
title   : Domain Modeling
summary : 
date    : 2024-05-02 22:57:32 +0900
updated : 2024-05-02 23:21:24 +0900
tag     : ddd designpattern
toc     : true
comment : true
public  : true
parent  : [[/ddd]]
latex   : true
---
* TOC
{:toc}

# Domain Modeling

## About DDD, Understanding the Domain 

### Domain

A __domain__ is an area of knowledge associated with the problem we are trying to solve, or simply, that which a "domain expert" is expert in.

The main goal of a __domain model__ is to help us deal with the complexity and chaos of the real world. The model is such a scoped __“snapshot of reality”__ that we can put in our heads and express in code.

Because the __model__ is always simpler than reality, it includes not all the details of the domain, but only those that we consider important. And the first step in designing is to understand what details we want to include in the model.

### The Importance of a Shared Model

Domain experts 와 Developers 간의 iterative process 는 (at the core of "agile" development process) 는 __translation cost__ 가 크다.
이러한 agile 한 프로세스에서 translator 의 역할은 Developers 가 담당한다.

#### The goal of Domain-Driven Design

![](/resource/wiki/ddd-modeling/shared-model.png)

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

__Tactical Design with Domain Events__:

![](/resource/wiki/ddd-modeling/tactical-design-domain-events.png)

__Patterns ref__.
- [Canonical Data Model](https://www.enterpriseintegrationpatterns.com/patterns/messaging/CanonicalDataModel.html) [MessageTranslator](https://www.enterpriseintegrationpatterns.com/patterns/messaging/MessageTranslator.html) [CommandMessage](https://www.enterpriseintegrationpatterns.com/patterns/messaging/CommandMessage.html) [EventMessage](https://www.enterpriseintegrationpatterns.com/patterns/messaging/EventMessage.html)

__More Reads__.
- [How to share domain event scheme between microservices?](https://stackoverflow.com/questions/60018336/how-to-share-domain-event-scheme-between-microservices)

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

### Partitioning the Domains into Subdomains

Partition the problem domain into smaller subdomains. "When faced with a large problem, it's natural to break it into smaller components."

![](/resource/wiki/ddd-modeling/subdomains.png)

When converting the real world into a model, details can get lost, that's normal

![](/resource/wiki/ddd-modeling/solution-space.png)

In the model, we display domains and subdomains as [bounded contexts](https://martinfowler.com/bliki/BoundedContext.html)—parts of the overall model, each of which simulates one subdomain.

Domains and contexts are not always 1 to 1. Sometimes a domain is split into several contexts, or several domains are modeled through one context. It depends on the task. But the important thing is that each context has only one clear responsibility.

실제로 업무를 함에 있어서도 해결하고자 하는 문제의 범위가 큰 경우(다양한 부서간 협업이 필요하고 의사 결정이 늦어지는 경우)에 당장 우리 부서가 할 수 있는 일부터 진행하는 것이 좋은 경우가 있다. 

### Context Maps

Bounded Context 를 정의하고 나서 __Context Maps__ Diagram 을 그려보는 것이 좋다.

![](/resource/wiki/ddd-modeling/context-maps.png)

Some domains are more important to the business and, in fact, make money—these are the __core domains__. Those that help the core domains work are called __supportive domains__. Those that are not unique to the business and can be outsourced are generic.

For example, for the company in the example, order-taking may be the core domain, because the company is famous for its customer support. Billing could be a supportive domain, and shipping, which can be outsourced, could be a generic domain.

### Ubiquitous Language

The __Ubiquitous Language__ is a set of concepts and vocabulary that is associated with the domain and is shared by both the team members and the source code.

### Persistence Ignorance

The concept of a "database" is certainly not part of the ubiquitous language. The users do not care about how data is persisted.
In DDD terminology this is called __persistence ignorance__. It is an important principle because it forces you to focus on __modeling the domain__ accurately, without worrying about the representation of the data in a database.

### Documenting the Domain

__The process of accepting an order__:

```
Process “Accept Order”
	Caused by the “Received Order Form” event
	Main input data: Order Form
	Implicit input data: Product Catalog
	Output data: “Order Received” event
	Side effects: Notification of acceptance sent.
```

#### Workflow

__Place Order Workflow__:

```
Bounded Context: Order-Taking

Workflow: "Place Order"
  triggered by:
    "Order form received" event (when Quote is not checked)
  primary input:
    An order form
  other input:
    Product catalog
  output events:
    "Order Placed" event
  side-effects:
    An acknowledgment is sent to the customer, along with the placed order
```

And we can document the __data structures__ associated with the workflow:

```
bounded context: Order-Taking

data Order = 
  CustomerInfo
  AND ShippingAddress
  AND BillingAddress
  AND list of OrderLines
  AND AmountToBill
  
data OrderLine = 
  Product
  AND Quantity
  AND Price
  
data CustomerInfo = ??? // don't know yet
data BillingAddress = ??? // don't know yet
```

The advantage of this kind of __text-based design__ is that it's not scary to non-programmers.

#### Representing Complexity in Our Domain Model

모델이 복잡해지는 경우, 코딩 단계보다 설계 단계에서 복잡성을 처리하는 것이 더 좋다.
OrderQuantity 와 같은 Ubiquitous Language 가 의미하는 제약 조건을 표현하는 것이다. 

__Representing Constraints__:

```
data OrderQuantity = UnitQuantity OR KilogramQuantity

data UnitQuantity = integer between 1 and 1000
data KilogramQuantity = decimal between 0.05 and 100.00
```

#### Representing the Life Cycle of and Order

제약 조건을 명시하고나서, 주문의 Life Cycle 또한 반영해야 한다. Life Cycle 을 나타내기 위해서 주문을 여러개의 데이터 구조로 분리하는 단계를 거쳐야 한다.

__아직 검증되지 않은 주문의 경우__:

```
data UnvalidatedOrder =
  UnvalidatedCustomerInfo
  AND UnvalidatedShippingAddress
  AND UnvalidatedBillingAddress
  AND list of UnvalidatedOrderLine

data UnvalidatedOrderLine =
  UnvalidatedProductCode
  AND UnvalidatedOrderQuantity”
```

__검증된 주문의 경우__:

```
data ValidatedOrder =
  ValidatedCustomerInfo
  AND ValidatedShippingAddress
  AND ValidatedBillingAddress
  AND list of ValidatedOrderLine

data ValidatedOrderLine =
  ValidatedProductCode
  AND ValidatedOrderQuantity”
```

__가격이 책정된 주문의 경우__:

```
data PricedOrder =
  ValidatedCustomerInfo
  AND ValidatedShippingAddress
  AND ValidatedBillingAddress
  AND list of PricedOrderLine  // different from ValidatedOrderLine
  AND AmountToBill             // new

data PricedOrderLine =
  ValidatedOrderLine
  AND LinePrice
```

__The final stage is to create the order acknowledgment__:

```
data PlacedOrderAcknowledgment =
  PricedOrder
  AND AcknowledgmentLetter
```

You can see now that we've captured quite a lot of the business logic in this design already — rules such as these:
- An unvalidated order does not have a price
- All the lines in a validated order must be validated, not just some of them.

The model is a lot more complicated.  

__The whole workflow in pseudocode__:

```
workflow "Place Order" =
  input: OrderForm
  output:
    OrderPlaced event
    OR InvalidOrder

  // step 1
  do ValidateOrder
  If order is invalid then:
  stop

  // step 2
  do PriceOrder

  // step 3
  do SendAcknowledgmentToCustomer

  // step 4
  return OrderPlaced event (if no errors)
```

__Substep__:

```
substep "ValidateOrder" =
  input: UnvalidatedOrder
  output: ValidatedOrder OR ValidationError
  dependencies: CheckProductCodeExists, CheckAddressExists

  validate the customer name
  check that the shipping and billing address exist
  for each line:
    check product code syntax
    check that product code exists in ProductCatalog

  if everything is OK, then:
    return ValidatedOrder
  else:
    return ValidationError
```

## Functional Architecture

We'll take a brief look at typical software architecture for a functionally oriented domain model.

### Simon Brown's C4 approach

__[The C4 model for visualising software architecture - Context, Containers, Components, and Code](https://c4model.com/)__

- 시스템 컨텍스트는 우리가 모델링하는 전체 시스템이다.
- 이는 개별적으로 배포할 수 있는 개별 유닛인 여러 컨테이너로 구성된다 .
- 각 컨테이너는 코드의 구성 요소인 구성 요소로 구성된다.
- 각 구성 요소는 낮은 수준의 기능과 작업을 갖춘 모듈로 구성된다.

### Bounded Contexts as Autonomous Software Components

Each context is ideally a self-contained subsystem with clear boundaries. At the beginning of the design, however, we don’t care whether we are going to deploy the project as a microservice or as a monolith. The main thing is to make sure that we keep the contexts decoupled.

### Communicating Between Bounded Contexts

__Completely decoupled design__:

![](/resource/wiki/ddd-modeling/completely-decoupled-design.png)

### Trust Boundaries and Validation

Bounded Context 안은 valid 하기 때문에 trusted 상태이다. 반면 Bonded Context 의 밖은 invalid 한 상태이기 때문에 검증이 필요하다.

각 컨텍스트의 경계는 게이트 역할을 한다. 외부에서 컨텍스트로 들어오는 모든 것은 DTO 이므로 확인하고 검증해야 한다. 검증 후에는 안전한 데이터로 작업할 수 있는 도메인 개체를 얻게 된다. 유효성 검사는 입력 게이트에서 처리된다.

__Everything that comes from outside must be validated, the data inside we consider safe__:

![](/resource/wiki/ddd-modeling/trust-boundaries.png)

### Contracts Between Bounded Contexts

컨텍스트가 아무리 분리되어 있어도 컨텍스트 간의 통신은 여전히 결합을 생성한다. 문제 없이 진행하려면 컨텍스트에서 통신할 때 사용할 메시지 형식을 선택해야 한다. 즉, 계약을 작성해야 한다.

__Contracts forms__:
- __[Shared Kernel](http://ddd.fed.wiki.org/view/shared-kernel)__ - 두 컨텍스트가 공통 메시지 형식을 사용하기로 결정한 경우
- __Consumer Driven__ - 소비자가 원하는 메시지 형식을 결정하고 보낸 사람이 해당 형식에 맞게 조정하는 경우
- __Conformist__ - 발신자가 형식을 선택하고 소비자가 따르는 경우

#### Anti-corruption Layers

외부 시스템과 통신할때, 외부 시스템의 인터페이스가 우리의 domain model 과 일치하지 않는 경우가 있다.
이때 사용할 수 있는 것이 [ACL(Anti-corruption Layer)](https://baekjungho.github.io/wiki/ddd/ddd-anticorruption-layer/) 이다.

![](/resource/wiki/ddd-modeling/acl.png)

### Workflows Within a Bounded Context

The input to a workflow is always the data associated with a command, and the output is always a set of events to communicate to other contexts.

![](/resource/wiki/ddd-modeling/workflow-input-output.png)

In a functional architecture, each of the workflows is a function whose input is a command and whose output is one or more events. Such workflows are always within the same context and never implement End-to-End processes.

In the output, we have to give only what we really need to the next context, no more. For example, after order acceptance we don’t need to give all information about the order to BillingContext, just the order ID, delivery address and total order amount:

```
data BillableOrderPlaced =
  OrderId
  AND BillingAddress
  AND AmountToBill
```

Also make sure that all domain events are result work and do not call other handlers within the process.

### Code Structure Within a Bounded Context

__[Onion architecture](https://baekjungho.github.io/wiki/architecture/architecture-clean/)__:

![](/resource/wiki/ddd-modeling/onion-architecture.png)

The domain is in the center and the I/O is on the edges.

## Modeling 

Scott Wlaschin 은 "Domain Modeling Made Functional" 이라는 책에서 모델링의 첫 번째 단계로 도메인에 대한 철저한 조사를 제안한다. 이 책에서는 코드에 관여하지 않지만 우리가 설명하려는 도메인을 이해하는 사람들을 인터뷰할 것을 제안한다. 예를 들어 이러한 사람들은 제품 소유자, UX 디자이너 또는 비즈니스 고객이 될 수 있다.

### Details and Limitations

[Domain modeling](https://bespoyasov.me/blog/explicit-design-1/) 을 할때 불필요하거나 중요하지 않은 세부사항을 모델에 반영하지 않도록 주의해야 한다. 세부사항을 안다는 것은 설계에는 도움이 될 수 있어도, 코드의 복잡성이 증가할 수 있다.
필요한 만큼의 정보만 반영하여 simply, compactly 한 model 을 만드는 것이 중요하다.

### Nuances of Modeling

비지니스로직이 단순한 CRUD 성격을 띤 애플리케이션의 기능은 서버 요청과 수신된 데이터를 화면에 표시하는 것으로 제한되며 별도의 모델을 구별할 필요가 없을 수도 있다. 즉, 모든 애플리케이션이 rich domain model 을 가질 필요는 없다.

## Links

- [Domain Driven Design and Development In Practice](https://www.infoq.com/articles/ddd-in-practice/)
- [Start Your Architecture Modernization with Domain-Driven Discovery](https://www.infoq.com/articles/architecture-modernization-domain-driven-discovery/)
- [Domain Modeling with FP (DDD Europe 2020)](https://www.slideshare.net/ScottWlaschin/domain-modeling-with-fp-ddd-europe-2020)
- [Domain Modeling Made Functional by Scott Wlaschin](https://bespoyasov.me/blog/domain-modelling-made-functional/)

## References

- Domain Modeling Made Functional / Scott Wlaschin / The Pragmatic Programmers
- Domain-Driven Design Distilled, 1/e by Vaughn Vernon