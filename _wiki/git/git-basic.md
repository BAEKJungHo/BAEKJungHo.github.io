---
layout  : wiki
title   : Git basic 
summary : 깃 기초
date    : 2022-07-04 15:54:32 +0900
updated : 2022-07-04 20:15:24 +0900
tag     : http
toc     : true
comment : true
public  : true
parent  : [[/git]]
latex   : true
---
* TOC
{:toc}

# Git

깃은 컴퓨터 파일의 변경사항을 추적하고 여러 명의 사용자들 간에 해당 파일들의 작업을 조율하기 위한 분산 버전 관리 시스템이다.

## Process

![](/resource/wiki/git-basic/process.png)

### USER

- __Working Directory: USER__
  - 내가 작업하려는 PC 내의 디렉터리
  - .git 폴더가 들어가 있는 상위 폴더

### INDEX

- __Staging Area: INDEX__
  - git add 에 의해 저장되는 공간
  - .git directory 내에 INDEX 파일과 함께 .git/objects 디렉터리 안에 파일로 관리됨

![](/resource/wiki/git-basic/index.png)

예를 들어, README.md 라는 파일 안에 'Hello' 문자를 작성하고 git add 를 하면, 'Hello' 문자를 SHA-1 이라는 해시 알고리즘으로 해시코드(40자리)를 만들고, 그 중 처음 2자리에 해당하는 문자로 .git/object 안에 디렉터리를 만들고, 나머지 38자리로 파일을 만든다. 중요한 것은, 누가, 어떤 컴퓨터에서 만들든 파일 안의 내용이 동일하면 같은 해시코드값을 갖는다.

SHA-1 을 사용하면 소스 코드의 일부만 바뀌더라도 별개의 해시 값이 되기 때문에, 파일 식별이 쉬워진다.

### HEAD

- __Local Repository: HEAD__
  - commit 또한 .git/objects 디렉터리 안에 파일로 관리된다.
  - 중요한 정보 2가지
    - parent: 해당 commit 바로 이전의 상위 commit id
    - tree: commit 을 통해 관리된 파일들의 이름과 내용에 대한 구조

> git branch  명령을 실행할 때 Git 이 마지막 커밋의 해시 값(SHA-1)을 아는 이유는, 바로 .git 디렉토리에 `HEAD` 라는 파일을 사용하여 관리하기 때문이다.

### Remote Repository

- Github, GitLab 과 같은 원격 저장소를 의미한다.
