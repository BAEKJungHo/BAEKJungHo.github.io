---
layout  : wiki
title   : Cache Hierarchy; Why Cache Layers Exist Between CPU and Memory
summary : Multilevel Caches
date    : 2024-11-08 11:02:32 +0900
updated : 2024-11-08 12:12:24 +0900
tag     : operatingsystem cpu cache memory
toc     : true
comment : true
public  : true
parent  : [[/operatingsystem]]
latex   : true
---
* TOC
{:toc}

## Why Cache Layers Exist Between CPU and Memory

일반적인 시스템에서 Memory 의 속도는 CPU 100분의 1에 불과한다. CPU 는 한 번에 한 가지 일만 하기 때문에, CPU 가 명령어를 실행하는 속도를 끌어 올려야 성능이 향상될 것이다.
따라서, 더 이상 CPU 는 느릿느릿한 메모리와 직접 상호작용하지 않는다.

CPU 는 Memory 와 통신하기 위해 ___[Cache](https://en.wikipedia.org/wiki/CPU_cache)___ 를 사용한다. 보통 L1, L2, L3 로 구성되어있으며, 레지스터 칩 내에 묶여 packaging 되어있다.
L1 캐시는 보통 4클럭 주기가 소요되고, L2 는 10클럭 주기, L3 는 50클럭 주기가 소요된다. 캐시 단계에 따라 접근 속도는 낮아지지만 용량은 증가한다.
이러한 ___[MultiLevel Cache Hierarchy](https://en.wikipedia.org/wiki/Cache_hierarchy)___ 구조에서 CPU 는 Memory 에 접근해야할 때 L1 캐시를 찾아보고 Cache Miss 인 경우 L2 를 살펴보고, 여기서도 Cache Miss 가 발생하면 L3 캐시를 찾아본다.

Performance 를 향상 시킬 수 있다는 점이 매력적이지만, Cache 를 사용할 때는 ___데이터 불일치(data inconsistent)___ 문제를 항상 신경 써야 한다.
(e.g 서비스 개발 시 RDBMS 와 Cache 간 데이터 불일치)

캐시의 데이터는 갱신되었지만 메모리의 데이터는 그대로일 수 있다.

## References

- The secret of the underlying computer / lu xiaofeng
