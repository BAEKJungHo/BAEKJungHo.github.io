---
layout  : wiki
title   : If you know this, you can solve concurrency
summary : 
date    : 2023-07-25 15:54:32 +0900
updated : 2023-07-25 20:15:24 +0900
tag     : msa concurrency lock
toc     : true
comment : true
public  : true
parent  : [[/msa]]
latex   : true
---
* TOC
{:toc}

## Key Note

- DistributedLock: 동시성 이슈 해결이 목적
- Concurrency Issues: 공유 자원을 변경할 때 일어남 (읽기만 해서는 X)

따라서, __공유 자원(shared resources)__ 이 어떤 것인지를 파악하는 것이 가장 중요하다.

