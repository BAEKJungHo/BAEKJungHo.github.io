---
layout  : wiki
title   : Branch By Abstraction
summary : 
date    : 2023-03-08 15:02:32 +0900
updated : 2023-03-08 15:12:24 +0900
tag     : architecture designpattern
toc     : true
comment : true
public  : true
parent  : [[/architecture]]
latex   : true
---
* TOC
{:toc}

## Branch By Abstraction

"Branch by Abstraction" is a technique for making a large-scale change to a software system in gradual way that allows you to release the system regularly while the change is still in-progress.

기존 레거시 시스템과 구버전 앱을 유지하면서 새로운 시스템으로 교체하기 위한 방법으로 추상화된 브랜치 전략을 사용할 수 있다.

- [MartinFowler - BranchByAbstraction](https://martinfowler.com/bliki/BranchByAbstraction.html)
- [오늘의집 MSA Phase 1. 백엔드 분리작업](https://www.bucketplace.com/post/2022-01-14-%EC%98%A4%EB%8A%98%EC%9D%98%EC%A7%91-msa-phase-1-%EB%B0%B1%EC%97%94%EB%93%9C-%EB%B6%84%EB%A6%AC%EC%9E%91%EC%97%85/)

MartinFowler Blog 와, 오늘의집 Tech Blog 를 보면 단 번에 이해할 수 있다. (워낙 그림이 잘 나와있어서 따로 만들지 않음..)