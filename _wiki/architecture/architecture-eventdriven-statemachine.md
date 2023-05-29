---
layout  : wiki
title   : Event-driven Architecture, State machines
summary : 
date    : 2023-05-24 15:02:32 +0900
updated : 2023-05-24 15:12:24 +0900
tag     : architecture reactive kotlin
toc     : true
comment : true
public  : true
parent  : [[/architecture]]
latex   : true
---
* TOC
{:toc}

## Event-driven Architecture, State machines

The code of nanomsg to use state machines internally, passing asynchronous events around instead of using random callbacks between the components.
To solve [The Callback Hell](https://250bpm.com/blog:24/) Problems.

__[Sústrik, Martin - Event-driven Architecture, State machines](https://250bpm.com/blog:25/)__

![](/resource/wiki/architecture-eventdriven-statemachine/event.png)

__Combining Events and Functions:__

![](/resource/wiki/architecture-eventdriven-statemachine/event-function.png)

The solution has two nice features:
1. Most of the invocations in any system are root-to-leave-directed which means that most invocations in the codebase are simple function calls. The events are relatively rare and don't overwhelm the system.
2. Given that posting an event is somehow more complex than invoking a function it makes the developer stop and think twice before adding a new leave-to-root-directed invocation. That in turn helps keeping interaction patterns inside the codebase as simple and tree-like as possible.

__State Machines:__

- Generic Object

```
struct {
    int productId
    int price
    int processing_stage
}
```

- state machine

``` 
struct {
    int productId
    int price
    int state
}
```

Nothing changes from the technical point of view. That being said, the state machines are an instrument for turning __abstract processing mechanisms (objects)__ into __narratives__.

__Event is deeply related to the narratives.__

All you have to do is to draw all the possible states as boxes and connect them by arrows representing valid state transitions.
Like TCP protocol state machine:

![](/resource/wiki/architecture-eventdriven-statemachine/Tcp_state_diagram.png)

When using events with state machines can eliminate confusion and maintain consistency.