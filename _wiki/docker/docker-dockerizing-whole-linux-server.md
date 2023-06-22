---
layout  : wiki
title   : Dockerizing a whole physical Linux server
summary : 
date    : 2023-06-15 20:54:32 +0900
updated : 2023-06-15 21:15:24 +0900
tag     : docker
toc     : true
comment : true
public  : true
parent  : [[/docker]]
latex   : true
---
* TOC
{:toc}

## Dockerizing a whole physical Linux server

Original. [Dockerizing a whole physical Linux server](https://juliensalinas.com/en/dockerize-whole-linux-server/)

- Korean - [Linux 서버 통째로 Dockerizing 하기](https://gruuuuu.github.io/cloud/linux-dockerlizing/)

Docker is great not only for microservice architecture but for whole server containerization as well.
Dockerizing a whole server can be a perfect option __if you need to secure an existing prod server__ like mine here with no documentation, no GitHub repo, no initial developers…

