---
layout  : wiki
title   : Error .. is not in std golang 
summary : $GOPATH/go.mod exists but should not
date    : 2024-07-21 12:54:32 +0900
updated : 2024-07-21 13:15:24 +0900
tag     : go error
toc     : true
comment : true
public  : true
parent  : [[/go]]
latex   : true
---
* TOC
{:toc}

## Error .. is not in std golang 

GoLand 를 설치하고, 프로젝트 생성을 시도 했다.

![](/resource/wiki/go-error-std/create-project.png)

둘 다 해봤는데, GOPATH 로 생성하게 되는경우 Preferences > GOPATH 에 프로젝트의 ROOT 경로가 자동으로 설정되어있었다.

_[go mod init {module_name}](https://github.com/golang/go/issues/27951)_ 을 통해서 프로젝트의 모듈 이름 설정 및 의존성 관리를 위한 go.mod 파일을 생성하였다.
해당 파일의 경로가 프로젝트의 ROOT 경로와 동일할 경우 Application 을 실행 시 .. is not in std golang 그리고 $GOPATH/go.mod exists but should not 와 같은 에러가 발생하였다.

해결 방법은 src 폴더를 하나 생성해서, 생성된 go.mod 파일을 src 하위로 이동하였다. 

예를 들어 프로젝트의 ROOT 디렉터리 아래에 go.mod 파일을 두고 싶으면 아래와 같이 PATH 를 설정하면된다.

- GOPATH : {ProjectRootDir}/app
  - app 하위에는 main.go 가 존재

