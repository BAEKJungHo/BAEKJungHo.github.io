---
layout  : wiki
title   : How to prevent SQL Injection In Spring Framework
summary : Spring, JPA 에서 SQL Injection 을 방어하는 방법
date    : 2022-06-14 09:28:32 +0900
updated : 2022-06-14 12:15:24 +0900
tag     : spring
toc     : true
comment : true
public  : true
parent  : [[/spring]]
latex   : true
---
* TOC
{:toc}

## Pre-compile

PreparedStatement 혹은 JPA 를 사용하는 경우 pre-compile 과정을 거치고, 이 때 파라미터로 들어가는 값을 바인딩 하여 사용한다. SQL 문법이 아닌 컴파일 언어로 처리하기 때문에 문법적 의미를 가지지 않으므로, 바인딩 변수에 query 를 넣더라도 의미있는 쿼리로 동작하지 않는다.

> When you use prepared statement(i.e pre-compiled statement), As soon as DB gets this statement, it compiles it and caches it so that it can use the last compiled statement for successive call of same statement. So it becomes pre-compiled for successive calls.
>
> Other advantages of prepared statements are :-
>
> - __Protection against SQL-injection attack__  
> - __Faster for successive calls of same statements__  
> 
> How it works :-
> 
> Pre-compilation is done by the database. Some simpler databases don't precompile statements at all. Others might precompile it on the prepareStatement call, and yet others might do it when execute is first called on the statement, taking values of the parameters into account when compiling (creating a plan for) the statement.
>
> Databases that do precompile statements usually cache them, so in all probability ps1 won't be compiled again. Some JDBC drivers (eg. Oracle's) even cache prepared statements, so they haven't actually closed it when ps.close() was called.

Databases generally cache statements until something evicts them from the cache.

### SQL query processing workflow:

![](/resource/wiki/spring-sqlinjection/precompile.png)

- __Parsing__
  - SQL Query 는 토큰이라고 하는 개별 단어로 나뉜다.
  - SQL 쿼리의 유효성 검사(구문 오류, 맞춤법 등)가 수행된다.
- __Semantic Checks__
  - DBMS 가 쿼리의 유효성을 설정한다.
    - 열과 테이블이 존재하는지
    - 사용자에게 이 쿼리를 실행할 권한이 있는지
- __Binding__
  - 쿼리는 기계가 이해할 수 있는 형식인 바이트 코드로 변환된다.
  - 그 후, 컴파일된 쿼리가 최적화 및 실행을 위해 데이터베이스 서버로 보내진다.
- __Query Optimization__
  - DBMS 는 비용을 고려하여 쿼리 실행에 가장 적합한 알고리즘을 선택한다.
- __Cache__
  - 최상의 알고리즘은 캐시에 저장되므로 다음에 동일한 쿼리가 실행될 때 위 네 단계를 건너뛰고 바로 실행으로 넘어간다.
- __Execution__
  - 쿼리가 실행되고 결과가 사용자에게 반환된다.

### Prepared statement processing workflow:

![](/resource/wiki/spring-sqlinjection/precompile2.png)

SQL query processing workflow 와 거의 유사하다.

- __Parsing and Semantics Check are the same__
- __Binding__ 을 사용하면 데이터베이스 엔진이 placeholders 를 감지하고 쿼리가 placeholders 로 컴파일된다.
- __Cache is Same__
- Cache 와 Execution 사이에 `Placeholder Replacement` 라는 추가 단계가 있다.
  - 이 시점에서 자리 표시자(placeholders)는 사용자 데이터로 바뀐다. 그러나 쿼리는 이미 미리 __컴파일되어 있으므로(Binding) 최종 쿼리는 다시 컴파일 단계를 거치지 않는다.__
  - 이러한 이유로 사용자가 제공한 데이터는 항상 단순 문자열로 해석되며 원래 쿼리의 논리를 수정할 수 없다. 따라서 쿼리는 해당 데이터에 대한 SQL 주입 취약점에 영향을 받지 않는다.

## Links

- [Prepared statement](https://en.wikipedia.org/wiki/Prepared_statement)
- [How to prevent SQL Injection vulnerabilities: How Prepared Statements Work](https://www.hackedu.com/blog/how-to-prevent-sql-injection-vulnerabilities-how-prepared-statements-work)
- [What does it mean when I say Prepared statement is pre-compiled?](https://stackoverflow.com/questions/23845383/what-does-it-mean-when-i-say-prepared-statement-is-pre-compiled)