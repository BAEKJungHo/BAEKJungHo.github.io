---
layout  : wiki
title   : Git Internal 
summary : .git 내부 구조 파헤치기
date    : 2022-07-05 15:54:32 +0900
updated : 2022-07-05 20:15:24 +0900
tag     : git
toc     : true
comment : true
public  : true
parent  : [[/git]]
latex   : true
---
* TOC
{:toc}

## Internal

- __.git 의 내부 구조__
  - ![](/resource/wiki/git-internal/gitdir.png)

## /objects

> objects 디렉터리는 실제 파일 안의 내용을 SHA-1 로 해시한 값에서 앞의 2자리를 폴더명으로, 나머지 38 자리를 파일 명으로 두어 식별자 형태로 사용한다.

![](/resource/wiki/git-internal/objects.png)

![](/resource/wiki/git-internal/objects2.png)

### blob, tree, commit

> /objects 에 저장 되는 파일의 형태는 크게 blob, tree, commit 으로 구분된다.

- __blob__
  - 소스 코드, 이미지 등 다양한 파일의 데이터를 저장
  - 파일의 메타데이터는 저장하지 않고 데이터 자체만 저장
  - 따라서, 동일한 소스 코드를 가진 파일이 여러개 있더라도 blob 파일은 하나만 생성 됨
- __tree__
  - 폴더 구조를 git 에서도 관리할 수 있게 해줌
  - 파일 식별자, 파일 데이터의 해시값, 파일의 이름이 저장
  - tree 는 blob 과 또 다른 tree 로 구성
    - 100644(읽기 파일 blob)
    - 100755(실행 파일 blob)
    - 040000(디렉터리 tree)
- __commit__
  - 각각의 커밋별로 하나의 커밋 파일로 저장됨
  - tree, parent, author, commiter, commit message 정보가 담김
  - parent 는 해당 commit 바로 이전의 상위 commit id 로, Linked List 형태로 커밋들이 구성됨

## /refs

![](/resource/wiki/git-internal/head.png)

- __git 에서 관리하는 branch 정보를 관리__
- __heads__
  - 로컬에서 작업하는 부분
- __remotes__
  - 원격 저장소
  - `HEAD` 에 각 브랜치별 마지막 커밋 해시값을 저장

## /logs

- __HEAD, 각각의 브랜치 별로 작업 목록의 로그로 기록됨__

## /hooks

- __git 에서 지원하는 기본적인 hook 들이 정의 되어 있음__

## SHA-1 에서 SHA-256 으로

> There is no contradiction. Linus himself [said in that same talk](https://git.wiki.kernel.org/index.php/LinusTalk200705Transcript):
> 
> __If I have those 20 bytes, I can download a git repository from a completely untrusted source and I can guarantee that they did not do anything bad to it__

SHA-1 을 사용하는 배경은 다음과 같다.

__At its core, the Git version control system is a `content addressable filesystem`. It uses the `SHA-1` hash function to name content.__

컨텐츠를 처리하기 위해 해시 함수를 사용했을 때의 이점은 다음과 같다.

- __Integrity checking is easy__
  - 무결성 검사가 쉽다.
  - 파일의 내용이 조금만 변경되더라도 해시값이 달라지기 때문이다.
- __Lookup of objects is fast__
  - 개체 조회가 빠르다.

암호화로 안전한 해시함수를 사용했을 때의 이점은 다음과 같다.

- __Object names can be signed and third parties can trust the hash to address the signed object and all objects it references.__
- __Communication using Git protocol and out of band communication methods have a short reliable string that can be used to reliably address stored content.__

하지만 2017년 2월 31일 [SHAttered Attack](https://shattered.io/?utm_source=thenewstack&utm_medium=website&utm_campaign=platform), 에서 실용적인 SHA-1 해시 충돌을 보여줬고, SHA-1 에 대한 취약점이 발견되면서, Git 2.13.0 이상의 버전에서는 SHAttered Attack 에 취약하지 않은 SHA-1 구현으로 이동했으며, Git 2.29 버전 부터는 SHA-256을 지원 한다고 한다.

> [Announcing the first SHA1 collision](https://security.googleblog.com/2017/02/announcing-first-sha1-collision.html) 구글과 네덜란드 CWI 연구소에서 SHA-1 해시 함수의 충돌쌍을 생성하는 서비스를 공개한 적도 있다. 



## Links

- [git hash function transition](https://git-scm.com/docs/hash-function-transition/)
- [Git Transitioning Away from the Aging SHA-1 Hash](https://thenewstack.io/git-transitioning-away-from-the-aging-sha-1-hash/)
- [How safe are signed git tags? Only as safe as SHA-1 or somehow safer?](https://security.stackexchange.com/questions/67920/how-safe-are-signed-git-tags-only-as-safe-as-sha-1-or-somehow-safer)
- [.git 내부 구조 파헤치기](https://tecoble.techcourse.co.kr/post/2021-07-08-dot-git/)