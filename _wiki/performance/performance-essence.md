---
layout  : wiki
title   : The Essence of Performance Testing
summary : 
date    : 2024-12-22 11:54:32 +0900
updated : 2024-12-22 12:15:24 +0900
tag     : performance
toc     : true
comment : true
public  : true
parent  : [[/performance]]
latex   : true
---
* TOC
{:toc}

## The Essence of Performance Testing

성능 테스트는 시스템이 주어진 조건에서 얼마나 효율적이고 안정적으로 동작하는지 검증하는 과정이다. 이를 통해 시스템의 처리 속도, 안정성, 확장성, 그리고 자원 사용 효율성을 평가할 수 있다.

___[TPS](https://klarciel.net/wiki/performance/performance-littles-law/)___ 를 높이기 위해선 ___처리 시간(processing time)___ 을 줄여야한다. 처리 시간(을 줄이기 위해서 자원을 늘리는(e.g Thread Pool, Server) 방법이 있다. 하지만 
결국 임계치를 넘어가면 TPS 가 떨어지게된다. 따라서, 처리 시간을 줄이기 위해 Caching, Indexing, 로직 최적화, Scale-Up 등을 활용해야 한다.

사실 Indexing 만 제대로 하더라도 성능 개선이 많이 된다.

> ResponseTime = Latency Time) + Processing Time
> - Latency Time = Client <-> Server
> - Processing Time = Server <-> DB

본질적으로 성능 테스트는 아래의 질문에 답하기 위한 도구이다.

- 처리량: 시스템이 한 번에 얼마나 많은 작업을 처리할 수 있는가?
- 응답 시간: 요청에 대한 응답은 얼마나 빠른가?
- 확장성: 부하가 증가할 때 시스템이 잘 확장되는가?
- 안정성: 장시간 사용이나 높은 부하 상황에서 시스템이 안정적으로 동작하는가?
- 자원 효율성: CPU, 메모리, 네트워크 등 자원을 얼마나 효율적으로 사용하는가?

성능 테스트의 목적은 단순히 시스템의 한계를 찾는 것이 아니라, 사용자의 요구사항과 기대치를 만족시키는 시스템을 구축하고 유지하는 데 있다.
