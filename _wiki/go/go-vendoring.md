---
layout  : wiki
title   : Vendoring
summary : 
date    : 2023-10-22 12:54:32 +0900
updated : 2023-10-22 13:15:24 +0900
tag     : go
toc     : true
comment : true
public  : true
parent  : [[/go]]
latex   : true
---
* TOC
{:toc}

## Vendoring

__[Vendoring](https://go.dev/ref/mod#vendoring)__:
- go mod vendor also creates the file vendor/modules.txt that contains a list of vendored packages and the module versions they were copied from. When vendoring is enabled, this manifest is used as a source of module version information, as reported by go list -m and go version -m. When the go command reads vendor/modules.txt, it checks that the module versions are consistent with go.mod. If go.mod changed since vendor/modules.txt was generated, go mod vendor should be run again.

```
// usage
go mod vendor [-e] [-v] [-o]
```

-  `-mod vendor` 플래그는 현재 프로젝트의 의존성을 vendor 디렉토리에 있는 패키지들을 사용하여 해결하도록 지시한다. vendor 디렉토리에는 프로젝트의 의존 패키지들의 복사본이 저장된다.

-  __Build__:

```
go build -mod vendor -o {projectName}
```