---
layout  : wiki
title   : Integration Testing
summary : 
date    : 2024-08-05 10:28:32 +0900
updated : 2024-08-05 11:15:24 +0900
tag     : test
toc     : true
comment : true
public  : true
parent  : [[/test]]
latex   : true
---
* TOC
{:toc}

## Integration Testing

단위 테스트가 비지니스 로직을 테스트하기에는 좋지만, 시스템이 데이터베이스, 메시지 버스 등의 외부와 어떻게 통합되는지 확인하기에는 충분하지 않다.
따라서 통합 테스트가 필요하다.

통합 테스트는 프로세스 외부 의존성과 통합해 어떻게 작동하는지를 검증한다. 외부 의존성과 엮이게 되면 테스트 동작 속도가 느려지고, 테스트 유지비가 많이 든다는 단점이 있다.

단위 테스트로는 가능한 한 많이 비지니스 시나리오의 예외 상황을 확인하고, 통합 테스트는 주요 흐름(happy path)과 단위 테스트가 다루지 못하는 예외 상황(edge case)를 확인한다.

프로세스 외부 의존성에 대해서 테스트 코드를 작성할때 __관리 의존성(e.g Database)__ 은 실제 인스턴스를 사용하고 __비관리 의존성(e.g 메시지 버스 등)__ 은 Mock 을 사용하면 된다.
관리 의존성은 해당 시스템 내부에만 종속되어있는 Database 를 예로 들 수 있다. 만약 DB 를 2개 사용하고 있고 하나는 외부 시스템에서도 참조하고 있는 경우에는 비관리 의존성으로 판단하면된다.
만약, 테스트 자동화 환경에 배포할 수 없는 Legacy Database 라던지 IT 보안 정책 혹은 데이터베이스 인스턴스 설정 및 유지관리 비용 때문에 실제 인스턴스로 사용이 불가능한 경우 
Mock 으로 대체하기보다 도메인 단위 테스트에 집중하는 것이 좋다. Mock 으로 대체해봤자 Repository 의 특정 메서드만 호출하는지 검증하는 것 뿐이므로 그다지 쓸모 없는 테스트 코드이다.

통합 테스트는 관리 의존성과 작동하는 모든 계층을 거쳐야 한다. 통합테스트는 높은 수준의 ___[CodeCoverage](https://baekjungho.github.io/wiki/test/test-coverage/)___ 를 달성하기 위해서 일정 수의 통합테스트는 꼭 필요하다.

## References

- Unit Testing Principles, Practices, and Patterns: Effective testing styles, patterns, and reliable automation for unit testing, mocking, and integration testing with examples in C# / Vladimir Khorikov
