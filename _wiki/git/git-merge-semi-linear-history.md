---
layout  : wiki
title   : Merge commit with semi-linear history
summary : 
date    : 2024-01-25 15:54:32 +0900
updated : 2024-01-25 20:15:24 +0900
tag     : git
toc     : true
comment : true
public  : true
parent  : [[/git]]
latex   : true
---
* TOC
{:toc}

## Merge commit with semi-linear history

[Merge commit with semi-linear history](https://docs.gitlab.com/ee/user/project/merge_requests/methods/#merge-commit-with-semi-linear-history) 는 [rebase](https://baekjungho.github.io/wiki/git/git-rebase/) 를 사용하며 merge 커밋을 남기는 전략이다.

With `--no-ff` Generate a merge commit even if the merge resolved as a [fast-forward](https://blog.naver.com/PostView.nhn?blogId=parkjy76&logNo=220308638231&categoryNo=73&parentCategoryNo=0&viewDate=&currentPage=1&postListTopCurrentPage=1&from=postView).
merge 시에 `--no-ff` 옵션을 주면 fast-forward 관계더라도 merge commit 이 남는다. `-m` 옵션을 같이 주면 머지 커밋 메시지를 남길 수 있다.

__Commands__:

```sh
git checkout -b feature/xxx # Create feature branch
git commit -m "Message" # Commit
git rebase origin/develop # Rebase (from remote) 
git checkout develop 
git merge --no-ff feature/xxx # Merge - Generated merge commit
# git merge --no-ff -m "Merge branch 'branch-name' into 'master'"
```

feature 브랜치에서 작업도중, 원격 브랜치(e.g develop)에 다른 누군가가 커밋한 경우 feature 브랜치를 Push 하기 전 아래와 같이 작업할 수도 있다.

```sh
git commit -m "Message" # commit in feature branch
git checkout develop
git pull develop
git checkout feature/xxx # Move to feature branch
git rebase origin/develop # Rebase 
# conflict resolve (충돌 해결한 파일을 git add)
git rebase --continue # 충돌 해결 후 rebase 진행
# push feature branch
```

## Links

- [Udacity Git Commit Message Style Guide](https://udacity.github.io/git-styleguide/)
