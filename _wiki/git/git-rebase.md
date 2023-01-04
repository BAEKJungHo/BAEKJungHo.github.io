---
layout  : wiki
title   : rebase
summary : Git rebase
date    : 2023-01-03 15:54:32 +0900
updated : 2023-01-03 20:15:24 +0900
tag     : git
toc     : true
comment : true
public  : true
parent  : [[/git]]
latex   : true
---
* TOC
{:toc}

## rebase

__base__ 는 각 저장소(원격 저장소, fork 한 내 저장소, clone 한 내 Local Repository)에 있는 __커밋 해시값들의 묶음__ 이라고 생각하면 된다. rebase 는 base 를 __갱신(최신으로 유지)__ 하는 작업을 의미한다. push 는 base 가 같아야만 할 수있다.

![](/resource/wiki/git-rebase/rebase.png)

``` 
// feature branch 는 release branch 가 commitX 일때 만들어진 브랜치
<release branch> <your feature branch>
commitX              commitX
commitY              commitA
commitZ              commitB
```

release branch 에 다른 사람의 commitY,Z 가 추가되어 base 가 달라졌다. feature 브랜치를 release branch 에 push 하기 위해서는 commit A 의 부모가 commit X 에서 commit Z 로 변경되어야 한다.

- __AS-IS__

```
// feature branch
commitX (A 의 parent)
commitA
commitB
```

- __TO-BE__

```
// feature branch
commitX
commitY
commitZ (A 의 parent)
commitA
commitB
```

- 부모커밋이 변경됐으니 새로만들 commitA 의 __해쉬값이 변경__ 된다. 즉, 새로운 커밋이 생성된다는 말이며, 커밋 메시지는 같다. 부모의 해쉬값이 달라졌기때문에 당연히 commitA 의 해쉬값도 달라지게 된다. 만약 여기서 아무런 내용 충돌이 없다면 바로 commitZ 뒤에 commitA 를 추가하게 된다. 
- 충돌이 난다면 충돌을 해결하고 나면 아래의 명령어를 통해서 rebase 를 계속 해 나간다.

### Advantages

- merge 커밋이 남지 않는다.
- 커밋 History 를 깔끔하게 관리할 수 있다.

## Command

> git rebase [base]

The Git command above will rebase the current branch onto [base], which can be any kind of commit reference (an ID, a branch name, a tag, or a relative reference to HEAD).

Once completed, HEAD (the current commit), is a descendant of [base], but it contains all the changes as if it had been merged with [base]

원격 저장소에 있는 release 브랜치로 부터 rebase 해야 하는 경우는 다음과 같다.

- `git remote update`: 모든 원격 브랜치를 업데이트하여 최신 상태로 갱신
- `git stash`: 현재 작업 중이던 branch 에 있던 내용을 커밋하지 않고 보관함에 저장
- `git rebase origin/release`: 원격 저장소 release 브랜치로부터 rebase
- `git stash apply`: 내가 작업중이던 파일을 다시 꺼내옴

git stash apply 하는 과정에서 __충돌(Conflict)__ 이 발생할 수 있다. 충돌이난 파일은 IntelliJ 기준으로 __빨간색 글씨__ 로 표기되며 코드를 적절하게 수정하고 git add 를 통해서 내가 하던 작업을 계속 이어나가면 된다.

git stash 와 rebase 과정을 하나로 합칠 수 있다.

- `git remote update`
- `git rebase --autostash origin/release`
  - stash 와 stash apply 를 자동으로 해준다.

### Examples

- __새로운 작업을 위해 new-feature 브랜치 생성__

```
# Start a new feature
git checkout -b new-feature release

# Edit files
git commit -a -m "Start developing a feature"
```

- __다른 사람이 release 에 있는 버그를 수정하기 위해 hotfix 브랜치 생성 후 작업을 완료하여 master 로 merge__ 

```
# Create a hotfix branch based off of master
git checkout -b hotfix release

# Edit files
git commit -a -m "Fix security hole"

# hotfix merge into release
git checkout release
git merge hotfix
git branch -d hotfix
```

이때 merge 커밋이 남음. 

- __new-feature 브랜치 작업이 완료되고나서 merge 커밋 없이 release 로 반영하고자 함__

```
# rebasing
git checkout new-feature
git remote update
git stash
git rebase origin/release
git stash apply
```

- __충돌 해결후 new-feature 에서 작업하던 내용을 commit 후 push__

```
# resolve conflict
git add 
git commit -m "message"
git push 
```

- __new-feature branch 를 release 로 merge__

```
git checkout release
git remote update
git merge origin/new-feature
```

## Request

현업에서 __"rebase 해주세요 !!"__ 와 같은 요청은 무슨 의미일까? 

Case by Case 겠지만, 한 가지 예로 들자면 다른 사람들이 작업한 브랜치를 하나로 합쳐야 하는데 이 과정에서 __충돌(Conflict)__ 이 발생할 가능성이 높다. 즉, rebase 해달라는 요청은 __다른 사람의 작업 내용을 하나의 브랜치로 합치면서 충돌을 해결해주세요__ 라는 의미와 같다.

## Links

- [Git rebase - benmarshall](https://www.benmarshall.me/git-rebase/)
- [NextStep code review process](https://github.com/next-step/nextstep-docs/blob/master/codereview/review-step3.md)
