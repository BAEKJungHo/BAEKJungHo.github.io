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
git rebase origin/develop # Rebase 
git checkout develop 
git merge --no-ff feature/xxx # Merge - Generated merge commit
# git merge --no-ff -m "Merge branch 'branch-name' into 'master'"
```

## Links

- [Udacity Git Commit Message Style Guide](https://udacity.github.io/git-styleguide/)
