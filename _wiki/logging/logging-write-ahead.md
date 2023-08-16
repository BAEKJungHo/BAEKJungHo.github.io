---
layout  : wiki
title   : Write Ahead Logging
summary : 
date    : 2023-08-11 20:54:32 +0900
updated : 2023-08-11 21:15:24 +0900
tag     : logging jpa
toc     : true
comment : true
public  : true
parent  : [[/logging]]
latex   : true
---
* TOC
{:toc}

## Write Ahead Logging

미리 쓰기 로그는 크래시 및 트랜잭션 복구에 사용되는 추가 전용 보조 디스크 상주 구조이다. __변경 사항은 데이터베이스에 기록되기 전에 안정적인 저장소에 기록되어야 하는 로그에 먼저 기록된다.__

안정적인 저장소(stable storage)는 쓰기 작업에 대해서 원자성(atomicity)과 내구성(durability)을 보장하기 위한 저장소이다.

WAL 을 사용하는 시스템에서는 모든 수정 사항이 적용되기 전에 로그 에 기록된다. 일반적으로 undo(변경되기 이전 데이터를 백업 해두는 공간) 및 redo(commit 이 완료된 데이터를 백업) 정보는 모두 로그에 저장된다.  buffer 를 비우기 전에 로그 파일에 기록한다.

## Links

- [Wikipedia - Write-ahead Logging](https://en.wikipedia.org/wiki/Write-ahead_logging)
- [PostgreSQL Docs](https://www.postgresql.kr/docs/9.6/wal-intro.html)