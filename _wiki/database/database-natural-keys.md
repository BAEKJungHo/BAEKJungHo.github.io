---
layout  : wiki
title   : Don't use natural keys
summary : 
date    : 2024-06-07 15:28:32 +0900
updated : 2024-06-07 18:15:24 +0900
tag     : database
toc     : true
comment : true
public  : true
parent  : [[/database]]
latex   : true
---
* TOC
{:toc}

## Don't use natural keys

Vehicle identification number(VIN; also called a chassis number or frame number) 혹은 주민등록번호와 같은 자연키(natural key)를 
데이터베이스의 기본키로 사용해서는 안된다. 아무리 국가 정책이더라도 정책은 변경 가능성을 내포하고 있기 때문이다.

## Links

- [You'll regret using natural keys by Mark Seemann](https://blog.ploeh.dk/2024/06/03/youll-regret-using-natural-keys/)