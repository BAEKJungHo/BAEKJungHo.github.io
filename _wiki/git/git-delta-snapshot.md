---
layout  : wiki
title   : Delta, Snapshot
summary : Using JSON Patch in Spring REST APIs
date    : 2023-12-05 15:54:32 +0900
updated : 2023-12-05 20:15:24 +0900
tag     : git delta snapshot
toc     : true
comment : true
public  : true
parent  : [[/git]]
latex   : true
---
* TOC
{:toc}

## Snapshot

- JSON Format

### From ChatGPT

> Snapshot 방식은 각각의 버전을 전체 파일의 스냅샷으로 캡처하는 방식입니다. 각 버전은 전체 프로젝트의 상태를 나타내는 완전한 스냅샷이며, 변경 내용을 비교하는 대신 전체 스냅샷을 저장합니다.
>
> - 전체 스냅샷 저장: 각 버전에서는 전체 프로젝트의 상태를 스냅샷으로 저장합니다.
> - 간편한 복구: 어떤 버전에서든지 프로젝트의 전체 상태를 복구하기 용이합니다. 각 버전은 전체 파일을 포함하고 있기 때문에 개별 파일의 차이를 계산할 필요가 없습니다.
> - 안전한 저장: 변경 내용을 차이로 저장하는 대신 전체 스냅샷을 저장하기 때문에 데이터 손실의 위험이 줄어듭니다.
>
> Git 은 사실상 Snapshot 방식을 사용하며, 각 커밋은 전체 작업 디렉토리의 스냅샷을 나타냅니다. 그러나 Git 은 일부 파일에 대한 차이를 저장하는 방식도 사용하여 저장 공간을 효율적으로 사용하고 있습니다. 이는 Git 의 내부적인 동작 구조에 대한 세부 사항이며, 사용자는 이러한 내부 동작에 대해 크게 신경 쓰지 않아도 됩니다. Git 은 안정적이고 효율적인 버전 관리를 제공하는 데 중점을 두고 설계되었습니다.

## Delta

- [JSON Patch Format - RFC6902](https://datatracker.ietf.org/doc/html/rfc6902)
  -  The "application/json-patch+json" media type is used to identify such patch documents.

### From ChatGPT

> Delta 방식은 변경된 파일의 차이나 패치를 저장하는 방식입니다. 이 방식에서는 각 버전 간의 차이를 저장하여 전체 파일을 저장하는 대신 변경된 내용만을 저장합니다. 이로써 저장 공간을 절약할 수 있습니다.
>
> - 각 버전 간의 차이 계산: 새로운 버전이 생성될 때, 이전 버전과의 차이를 계산합니다. 이 차이는 추가된 내용, 삭제된 내용, 또는 수정된 내용을 포함합니다.
> - 차이를 패치로 저장: 계산된 차이를 패치로 저장하고, 다음 버전에서는 해당 패치를 적용하여 변경 사항을 반영합니다.
> - 저장 공간 절약: 파일의 전체 내용을 저장하는 대신 변경된 부분만을 저장하므로 저장 공간을 효율적으로 활용할 수 있습니다.

## Links

- [Git: 델타와 스냅샷](https://dogfeet.github.io/articles/2012/git-delta.html)
- [Using JSON Patch in Spring REST APIs](https://www.baeldung.com/spring-rest-json-patch)