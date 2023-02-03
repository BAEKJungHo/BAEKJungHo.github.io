---
layout  : wiki
title   : Reactor Pattern
summary : 
date    : 2022-10-05 15:05:32 +0900
updated : 2022-10-05 15:15:24 +0900
tag     : reactive
toc     : true
comment : true
public  : true
parent  : [[/reactive]]
latex   : true
---
* TOC
{:toc}

## From: Reactive Systems Explained

> The reactor pattern, illustrated in Figure 3-2 in its most basic form,
approaches both concurrency and parallelism. In the typical imple‐
mentation of the pattern, asynchronously received requests are
demultiplexed (in a sense, serialized) for processing. The event loop,
running on one thread, cycles through the incoming events and
handles them. Callback functions are registered for requests that will
result in a long-running task or blocking operation. The handle for
the event gets added to a queue. The event loop iterates through the
queue and will eventually observe the completion of the longrunning task, trigger a callback, and return the result to the
application.
>
> ![](/resource/wiki/reactive-reactor-pattern/reactor-pattern.png)
> 
> Node.js is one implementation of the reactor pattern,
and [its website](https://nodejs.org/en/docs/guides/event-loop-timers-and-nexttick/) does an excellent job of explaining how
this implementation works.

### Multireactor Pattern

> The multireactor pattern is an approach to taking fuller advantage of
the available compute resources on multicore, multithreaded pro‐
cessors. In its basic form, instead of one event loop, you have many;
the number usually depends on the number of cores on your
machine. Vert.x, an open source toolkit for building reactive appli‐
cations on the JVM, works in this way. For example, multiple event
loops each run on their own thread, delivering events/tasks to han‐
dlers and servicing them upon completion. Code with blocking calls
should be handled in the same manner as described earlier and run
asynchronously on a separate thread (taken from a predefined
thread pool).

## References

- Reactive Systems Explained / Grace Jansen & Peter Gollmar 저 / O'REILLY