---
layout  : wiki
title   : Polyglot Persistence
summary :
date    : 2022-05-29 11:54:32 +0900
updated : 2022-05-29 12:15:24 +0900
tag     : msa
toc     : true
comment : true
public  : true
parent  : [[/msa]]
latex   : true
---
* TOC
{:toc}

## Polyglot Persistence

> Polyglot 은 특정 서비스를 구축하는데 사용되는 언어나 저장소를 자율적으로 선택할 수 있는 방식을 의미한다.

![]( /resource/wiki/msa-polyglot/polyglot-persistence.png)

> CBD/SOA 의 경우에는 애플리케이션은 모듈별로 분리했으나 저장소까지는 분리하지 못했다. 따라서 데이터의 강한 결합으로 애플리케이션도 독립적으로 사용하기가 힘들었다.
> 
> 마이크로서비스는 폴리글랏 저장소(polyglot persistence) 접근법을 선택하며, 서비스별로 데이터베이스를 갖도록 설계한다. 
> 
> __각 저장소가 서비스별로 분산되어있어야 하며, 다른 서비스의 저장소를 직접 호출할 수가 없고 API 를 통해서만 접근해야 한다는 의미이다.__

## Links

- [What is polyglot persistence](https://www.jamesserra.com/archive/2015/07/what-is-polyglot-persistence/)

## References

- 도메인 주도 설계로 시작하는 마이크로서비스 개발 / 한정헌, 유해식, 최은정, 이주영 저 / 위키북스