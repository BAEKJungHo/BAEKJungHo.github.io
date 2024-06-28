---
layout  : wiki
title   : Persistence
summary : Data Persistence is a means for an application to persist and retrieve information from a non-volatile storage system
date    : 2024-06-08 15:28:32 +0900
updated : 2024-06-08 18:15:24 +0900
tag     : designpattern java jpa
toc     : true
comment : true
public  : true
parent  : [[/designpattern]]
latex   : true
---
* TOC
{:toc}

## Persistence

__Persist(지속, 영속)__ 는 애플리케이션이 종료되더라도 계속 유지된다는 것을 의미한다. 

Persistence simply means to Store Permanently. Data Persistence is a means for an application to persist and retrieve information from a non-volatile storage system.

따라서, Persistence Layer 라 하면 보통 DB 에 데이터를 저장하기 위한 Layer 를 의미한다. 
