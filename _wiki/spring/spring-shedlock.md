---
layout  : wiki
title   : SchedulerLock
summary : 
date    : 2024-03-15 09:28:32 +0900
updated : 2024-03-15 12:15:24 +0900
tag     : spring shedlock
toc     : true
comment : true
public  : true
parent  : [[/spring]]
latex   : true
---
* TOC
{:toc}

## SchedulerLock

Distributed 환경에서의 Scheduler 는 Job 이 여러 노드에서 동시에 실행될 수 있다. 

Spring, by default, cannot handle scheduler synchronization over multiple instances. It executes the jobs simultaneously on every node instead.

따라서, 중복 실행을 방지하도록 Lock Mechanism 이 필요하다. 대표적으로 사용되는 것이 __[ShedLock](https://github.com/lukas-krecan/ShedLock)__ 이다. 주로 Spring Batch 를 사용할 때 같이 사용된다.

특징은 다음과 같다.

- if one task is already being executed on one node, execution on other nodes does not wait, it is simply skipped.
- ShedLock is not a distributed scheduler
- Lock Providers - JdbcTemplate, R2DBC, Redis, MongoDB ... etc

shedlock 사용 시 cronJob 의 시간을 lockAtLeastFor, lockAtMostFor 과 동일하게 하면 lock 점유로 인해 아래와 같은 쿼리가 계속 점유 중일 수 있고, 그로 인해 [cpu wait_event](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/apg-waits.cpu.html) 가 증가할 수도 있다.

```sql
UPDATE shedlock
SET lock_until = ? locked_at = ? locked_by = ?
WHERE name = ? AND lock_until <= ?
```

그리고 lockAtMostFor 값을, Job Task ElapseTime 보다 크게 주는 것이 좋다.

## Links

- [ShedLock Spring](https://www.baeldung.com/shedlock-spring)
- [Shedlock, Duplicate Batch Processing, and lockAtMostFor](https://www.bennorthrop.com/Snippets/shedlock-duplicate-batch-processing-lockAtMostFor.php)