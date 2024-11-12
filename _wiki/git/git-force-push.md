---
layout  : wiki
title   : Force Push
summary : 
date    : 2024-11-12 19:54:32 +0900
updated : 2024-11-12 20:15:24 +0900
tag     : git
toc     : true
comment : true
public  : true
parent  : [[/git]]
latex   : true
---
* TOC
{:toc}

## Force Push

다음과 같은 상황에서 ___Force Push___ 를 사용하면 좋다.

- feature/X 에서 작업하여 MR 이 올라가 있는 상태
- 다른 사람이 작업한 feature/Y 가 develop 브랜치에 머지됨
- 로컬 feature/X 에서 develop 브랜치의 최신 사항을 rebase 한 상태

위와 같은 상황에서 rebase 한 local feature/X 를 remote feature/X 로 Push 하기 위해서는 `git push origin feature/X --force` 이렇게 입력하면 된다.