---
layout  : wiki
title   : STREAM
summary : 
date    : 2025-05-27 08:02:32 +0900
updated : 2025-05-27 08:12:24 +0900
tag     : architecture stream
toc     : true
comment : true
public  : true
parent  : [[/architecture]]
latex   : true
---
* TOC
{:toc}

## STREAM

A ___[stream](https://en.wikipedia.org/wiki/Stream_(computing))___ represents data that is progressively produced over time. Unlike traditional batch processing where you work with finite datasets, streams deal with continuous, unbounded data flows that never truly "complete."

All streams across different domains share the fundamental essence of <mark><em><strong>"continuous data flow with real-time processing"!</strong></em></mark> Streams transform how we think about data: from "having data" to <mark><em><strong>"flowing data"</strong></em></mark> - enabling real-time, scalable, and resilient systems.

Users generate data yesterday, today, and will continue generating data as long as the service exists. This fundamental characteristic means that ___stream processing___ is essentially about handling infinite data processing scenarios.

Stream processing can operate in two main modes:
- **Time-windowed processing**: Processing data at fixed intervals (e.g., aggregating ad click events every minute)
- **Event-driven processing**: Processing data immediately as events occur, without fixed time boundaries

> All streams across different domains share the fundamental essence of ___"continuous data flow with real-time processing"!___ Streams transform how we think about data: from "having data" to ___"flowing data"___ - enabling real-time, scalable, and resilient systems.

All data processing systems operate with two distinct time concepts:
- **Event Time**: When the event actually occurred in the real world
- **Processing Time**: When the event was observed and processed by the system

> Data teams often require precise timestamps for when clients and servers send and receive events to maintain data integrity and enable accurate analysis.

## Event Organization and Messaging Systems in Stream Processing

When building systems like ad click event aggregation, you often work with log files distributed across multiple servers. The typical processing pipeline involves:

__File-Based Stream Processing__:
- Input Source: Log files scattered across distributed servers
- File Format: Input consists of files (sequence of bytes) from various sources
- Parsing Stage: The first step typically involves analyzing files and converting them into a sequence of records
- Record Processing: Each record becomes a unit of processing in the stream

In stream processing terminology, these records are commonly referred to as ___[EVENT](https://klarciel.net/wiki/architecture/architecture-event/)___.

__Stream systems organize related events using__:
- Topics: Logical groupings of similar events
- Subjects: Alternative term for topics in some systems
- Streams: The actual data flow channels

To notify consumers about new events, stream systems rely on ___Messaging Systems___ that implement various delivery patterns.

### Key Design Questions for Pub/Sub Systems

When designing ___[Publish/Subscribe System](https://klarciel.net/wiki/architecture/architecture-pub-sub/)___, two critical questions help determine the appropriate architecture:

### Handling Producer-Consumer Speed Mismatch

What happens when producers send messages faster than consumers can process them?

- __Option A: Drop Messages__
   - enable to data loss (message throwing)
   - Suitable for non-critical, high-volume scenarios
- __Option B: Buffer in Queue (Backpressure/Flow Control)__
   - Strategy used by Unix Pipes and TCP
   - Maintains a small, fixed-size buffer
   - Blocks sender when buffer is full until receiver consumes data
- __Option C: Block Producer__
  - Prevents the producer from sending additional messages
  - Avoids message loss but can create system bottlenecks

__Critical Buffer Management Considerations__:
- When messages are buffered in queues, it's essential to understand the implications of growing queue sizes:
  - Memory Management:
    - What happens when queue size exceeds available memory?
    - Does the system crash or gracefully handle the overflow?
  - Disk Persistence:
    - Does the system write messages to disk when memory is exhausted?
    - If disk storage is used, how does disk I/O impact messaging system performance?
  - Performance Impact:
    - How does increasing queue size affect overall system throughput?
    - What are the latency implications of different buffering strategies?

### Fault Tolerance and Message Durability

What happens when nodes fail or go offline temporarily? Will messages be lost?

__Message Loss Tolerance Assessment__:
- Acceptable Loss: Can the system afford to lose some messages?
- Zero Loss Requirement: If message loss is unacceptable, persistence mechanisms are mandatory

__System-Specific Trade-offs__:
- Different systems have varying tolerance levels based on business requirements
- Financial systems typically require zero message loss
- Analytics systems might tolerate some data loss for better performance
- Real-time gaming systems might prioritize low latency over perfect delivery

__Persistence Strategies__:
- In-memory only: Fast but vulnerable to data loss
- Write-ahead logging: Balances performance and durability
- Replicated storage: Provides high availability and fault tolerance
- Hybrid approaches: Combine multiple strategies based on message criticality

## Stream Applications Across Domains

Whether it's database change streams, network packet flows, multimedia streaming, IoT sensor data, or financial market feeds - they all embody the same fundamental concept: ___processing continuous sequences of data elements as they arrive, enabling real-time insights and immediate responses___. This essence transcends specific technologies and domains, making stream processing a universal paradigm in modern computing systems.

Streams are fundamental to many modern systems:
- **Real-time Analytics**: Processing user behavior data as it happens
- **IoT Data Processing**: Handling sensor data from connected devices
- **Financial Trading**: Processing market data and executing trades
- **Social Media**: Managing user interactions and content feeds
- **Network Protocols**: [Stream in HTTP2](https://klarciel.net/wiki/network/network-binary-based-protocol/)

### Java Stream

Java Stream 은 기본 스트림의 핵심 철학을 차용했지만, 유한한 컬렉션 처리에 특화된 API 이다.

## References

- Designing Data-Intensive Application / Martin Kleppmann
- System Design Interview Volume 2 / Alex Xu, Sahn Lam
- Streaming Systems / Tyler Akidau
