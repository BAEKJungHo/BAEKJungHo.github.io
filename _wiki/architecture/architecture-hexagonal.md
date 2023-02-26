---
layout  : wiki
title   : Hexagonal Architecture
summary : 
date    : 2023-02-23 15:02:32 +0900
updated : 2023-02-23 15:12:24 +0900
tag     : architecture
toc     : true
comment : true
public  : true
parent  : [[/architecture]]
latex   : true
---
* TOC
{:toc}

## Hexagonal Architecture

> The idea of Hexagonal Architecture is to put inputs and outputs at the edges of our design. Business logic should not depend on whether we expose a REST or a GraphQL API, and it should not depend on where we get data from — a database, a microservice API exposed via gRPC or REST, or just a simple CSV file.
> 
> The pattern allows us to isolate the core logic of our application from outside concerns. Having our core logic isolated means we can easily change data source details without a significant impact or major code rewrites to the codebase.
>
> One of the main advantages we also saw in having an app with clear boundaries is our testing strategy — the majority of our tests can verify our business logic without relying on protocols that can easily change.

## Links

- [NetFlix - Ready for changes with Hexagonal Architecture](https://netflixtechblog.com/ready-for-changes-with-hexagonal-architecture-b315ec967749)
- [Mesh Korea - Hexagonal Architecture](https://mesh.dev/20210910-dev-notes-007-hexagonal-architecture/)