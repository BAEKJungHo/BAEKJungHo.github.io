---
layout  : wiki
title   : Cherrypick
summary : 
date    : 2023-06-28 15:54:32 +0900
updated : 2023-06-28 20:15:24 +0900
tag     : git
toc     : true
comment : true
public  : true
parent  : [[/git]]
latex   : true
---
* TOC
{:toc}

## Cherrypick

git [Cherrypick](https://git-scm.com/docs/git-cherry-pick) 을 사용하면 다른 branch 의 커밋 내용을 내가 작업하고자 하는 브랜치로 가져와서 작업할 수 있다.

아래와 같은 상황에서 stage branch 를 release 로 배포할 수 없는 상황이라고 하자. 나는 feature/TASK-B 를 만들어서 TASK-A 의 작업내용만 포함시켜서 release 브랜치에 머지해야 하는 상황이다.

![](/resource/wiki/git-cherrypick/cherrypick1.png)

위와 같은 상황일때 cherry-pick 이 유용하다. 아래와 같이 내가 가져오고 싶은 작업 내용이 포함된 커밋 해시 코드를 입력하면 된다.

```
git cherry-pick {commitHash}
```

![](/resource/wiki/git-cherrypick/cherrypick2.png)

release branch 에는 feature/TASK-A 의 8e5 작업 내용과 feature/TASK-B 의 rwq 작업 내용이 반영된다.