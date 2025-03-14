---
layout  : wiki
title   : FACADE
summary : 
date    : 2025-03-12 11:28:32 +0900
updated : 2025-03-12 12:15:24 +0900
tag     : designpattern
toc     : true
comment : true
public  : true
parent  : [[/designpattern]]
latex   : true
---
* TOC
{:toc}

## FACADE

![](/resource/wiki/designpattern-facade/facade_meaning.png)

퍼사드 패턴은 서브 시스템에 대한 통ㅇ합 인터페이스 세트를 제공하고, 하위 시스템을 더 쉽게 만들기 위한 상위 통합 인터페이스를 제공한다.

### Design Principles

복잡한 서브 시스템 의존성을 최소화하는 방법이다. 클라이언트가 사용해야 하는 복잡한 서브 시스템 의존성을 간단한 ___[인터페이스(interface)](https://klarciel.net/wiki/designpattern/designpattern-interface-design-thought/)___ 로 추상화 할 수 있다.

서브 시스템에 대한 의존성을 한곳으로 모을 수 있으며, 클라이언트는 서브 시스템에 대한 구체적이고 깊이 있는 학습 없이, 퍼사드 인터페이스에 대한 사용법만 알면 된다.
대한 모든 의존성을 가지더라도 가독성이 향상 된다면 좋은 선택일 수 있다.

![](/resource/wiki/designpattern-facade/facade.png)

### Linux Shell

Linux 의 ls, cp, mv, grep 같은 shell 명령어는 사실 커널의 다양한 기능을 감싸는 인터페이스 역할을 한다.

- ls → 내부적으로 opendir(), readdir(), stat() 같은 시스템 호출을 수행
- cp → open(), read(), write() 같은 파일 조작 API 사용
- rm → unlink() 호출

즉, shell 명령어는 시스템 호출을 감싸는 "간편한 인터페이스" 역할을 한다. 여기에 사용된 Facade 패턴의 목적은 ___인터페이스 사용성 개선___ 이다.

### Improved Interface Performance

Facade 패턴을 통해 성능을 향상 시킬 수 있다. 여러 개의 인터페이스 호출을 하나의 Facade Interface 호출로 대체함으로써 네트워크 통신 비용을 줄이고 클라이언트의 응답 속도를 향상시킬 수 있다.

### Transaction

Facade 패턴을 적용하면 여러개의 도메인 로직을 하나로 묶어서 트랜잭션 처리를 할 수 있다.

## References

- Gangs of Four Design Patterns
- 设计模式之美 / 王争