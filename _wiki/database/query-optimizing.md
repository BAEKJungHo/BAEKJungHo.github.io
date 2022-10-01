---
layout  : wiki
title   : Query Optimizing
summary : 쿼리 최적화, 실행계획과 인덱스
date    : 2022-09-28 15:28:32 +0900
updated : 2022-09-28 18:15:24 +0900
tag     : database
toc     : true
comment : true
public  : true
parent  : [[/database]]
latex   : true
---
* TOC
{:toc}

- __Prerequisite__
  - [Index](https://baekjungho.github.io/wiki/database/mysql-index/)

## Execution Plan

### id

![](/resource/wiki/query-optimizing/execution-plan.png)

- SQL 문이 수행되는 순서를 의미함
- 실행계획을 확인할 경우 첫 번째 행과 두 번째 행의 ID 가 같은데, 이는 조인을 의미함 
- FROM 절에서 급여 테이블의 데이터를 가져오는 인라인 뷰가 두 번째로 수행되고 있는 걸 알 수 있음

### select_type

- SIMPLE: 단순한 SELECT 문
- PRIMARY: 서브쿼리를 감싸는 외부 쿼리, UNION 이 포함될 경우 첫번째 SELECT 문
- SUBQUERY: 독립적으로 수행되는 서브쿼리 (SELECT, WHERE 절에 추가된 서브쿼리)
- DERIVED: FROM 절에 작성된 서브쿼리
- UNION: UNION, UNION ALL 로 합쳐진 SELECT
  - ![](/resource/wiki/query-optimizing/select-type.png)
- DEPENDENT SUBQUERY: 서브쿼리가 바깥쪽 SELECT 쿼리에 정의된 칼럼을 사용 
- DEPENDENT UNION: 외부에 정의된 컬럼을 UNION 으로 결합된 쿼리에서 사용하는 경우 
- MATERIALIZED: IN 절 구문의 서브쿼리를 임시 테이블로 생성한 뒤 조인을 수행 
- UNCACHEABLE SUBQUERY: RAND(), UUID() 등 조회마다 결과가 달라지는 경우

### type

- system: 테이블에 데이터가 없거나 한 개만 있는 경우
- const: 조회되는 데이터가 단 1건일 때
- eq_ref: 조인이 수행될 때 드리븐 테이블의 데이터에 PK 혹은 고유 인덱스로 단 1건의 데이터를 조회할 때
- ref: eq_ref 와 같으나 데이터가 2건 이상일 경우
- index: 인덱스 풀 스캔
- range: 인덱스 레인지 스캔
- all: 테이블 풀 스캔

### key

- 옵티마이저가 실제로 선택한 인덱스

### rows

- SQL 문을 수행하기 위해 접근하는 데이터의 모든 행 수

### extra

- Distinct: 중복 제거시
- Using where: WHERE 절로 필터시
- Using temporary: 데이터의 중간결과를 저장하고자 임시 테이블을 생성, 보통 DISTINCT, GROUP BY, ORDER BY 구문이 포함된 경우 임시 테이블을 생성
- Using index: 물리적인 데이터 파일을 읽지 않고 인덱스만 읽어서 처리. 커버링 인덱스라고 함
- Using filesort: 정렬시

## which better?

![](/resource/wiki/query-optimizing/which-better.png)

## Index Scan

### Index Range Scan

Index Range Scan 을 하기 위해서는 인덱스 선두 컬럼이 조건절에 있어야 한다.

![](/resource/wiki/query-optimizing/range-scan.png)

```sql
CREATE INDEX `idx_01` ON `subway`.`programmer` (id, create_date, status)
```

위와 같은 인덱스가 있을 때 인덱스를 타는 경우는 3가지이다.

- 조건절에 선두 컬럼만 있는 경우
  - `where id = #{id}`
- 조건절 첫 번째로 선두 컬럼이 있고, 두 번째로 create_date 가 있는 경우
  - `where id = #{id} and create_date = #{createDate}`
- 조건절에 인덱스 순서대로 컬럼이 있는 경우
  - `where id = #{id} and create_date = #{createDate} and status = #{status}`

### Index Full Scan

![](/resource/wiki/query-optimizing/full-scan.png)

리프 블록 전체를 스캔해야 할 때는 Index 를 Full Scan 한다.

```sql
SELECT COUNT(*) FROM subway.programmer
```

### Index Unique Scan

![](/resource/wiki/query-optimizing/unique-scan.png)

인덱스가 존재하는 컬럼이 중복값이 입력되어 있지 않아 인덱스 키 컬럼은 모두 `=` 조건으로 검색할 때는 데이터를 한 건 찾는순간 더 이상 탐색할 필요가 없다. 다만, Unique 라하더라도 범위검색할 때는 수직적 탐색만으로는 모두 찾을 수 없기 때문에 Index Range Scan 으로 처리된다.

```sql
-- different execution plan
SELECT * FROM subway.programmer WHERE id = 10
SELECT * FROM subway.programmer WHERE id < 10
```

## Minimize table access

테이블 액세스를 최소화 하기 위해 가장 일반적으로 사용하는 튜닝 기법은 인덱스에 컬럼을 추가하는 것이다. 인덱스는 정렬되므로, 조건절에 해당하는 Primary Key 범위를 줄여 랜덤 액세스 횟수가 줄어든다.

```sql
SELECT * FROM emp WHERE deptno = 30 AND sal >= 2000
```

![](/resource/wiki/query-optimizing/table-access.png)

위 질의 결과에 해당하는 데이터는 BLAKE 한명인데, 이를 찾기 위해 테이블에 여섯 번 액세스하는 것을 볼 수 있다. 물론 DEPTNO + SAL 순으로 인덱스 구성을 변경하면 해결될 문제이지만, 실 운영환경에서 인덱스 구성을 변경하기는 쉽지 않다. 따라서 기존 인덱스에 SAL 컬럼을 추가하여 (인덱스 스캔량은 줄지 않지만) 테이블 랜덤 액세스 횟수를 줄일 수 있다.

## Driving Table

드라이빙 테이블(outer table)은 join 시에 먼저 엑세스 되는 테이블을 의미한다. 반대로 나중에 엑세스되는 테이블은 드리븐 테이블(inner table)이라고 한다.

데이터베이스는 Optimizer 를 사용하여 드라이빙 테이블을 정하는데, 일반적으로는 Cost-Based Optimizer 를 사용한다.

## Optimizer

SQL 을 최적화해서 실행 계획을 수립한다.

### Rule-Based Optimizer

규칙 기반 옵티마이저는 대상 테이블의 레코드 건수나 선택도 등을 고려하지 않고 옵티마이저에 내장된 우선순위에 따라 실행 계획을 수립한다. 규칙 기반 옵티마이저는 이미 오래 전부터 많은 DBMS 에서 거의 지원되지 않거나 업데이트 되지 않은 상태로 남아있다.

### Cost-Based Optimizer

비용 기반 최적화는 작업의 비용(부하)과 대상 테이블의 통계 정보를 활용해서 실행 계획 수립한다. 대부분의 DBMS 가 비용 기반의 옵티마이저를 채택하고 있다.

비용 기반 최적화에서 가장 중요한 것은 `통계 정보`이다.

- __통계 정보 확인__

```sql
SHOW TABLE STATUS LIKE 'tb_test'\G 
SHOW INDEX FROM tb_test;
```

- __통계 정보 갱신: ANALYZE__
  - ANALYZE 는 인덱스 키값의 분포도(선택도)만 업데이트 한다.

```sql
-- 파티션을 사용하지 않은 일반 테이블의 통계 정보 수집
ANALYZE TABLE tb_test;

-- 파티션을 사용하는 테이블에서 특정 파티션의 통계 정보 수집
ANALYZE TABLE tb_test ANALYZE PARTITION p3;
```

InnoDB 에서는 ANALYZE 도중에 데이터의 읽기 쓰기가 모두 불가능하므로 서비스 도중에는 ANALYZE 를 실행하지 않는 것이 좋다.

## Covered Index

인덱스 스캔과정에서 얻은 정보만으로 처리할 수 있어 테이블 액세스가 발생하지 않는 쿼리를 의미한다.

```sql
EXPLAIN SELECT a.*
FROM (
	-- 서브쿼리에서 커버링 인덱스로만 데이터 조건과 select column을 지정하여 조인
	SELECT id 
    FROM subway.member 
    WHERE age BETWEEN 30 AND 39
) AS b JOIN programmer a ON b.id = a.id
```

## Optimizing Tips

### 인덱스 컬럼을 가공하지 않는다.

- __Bad__
  - ```sql
    EXPLAIN 
     SELECT *
     FROM tuning.employee
     WHERE SUBSTRING(id, 1, 4) = 1100
     AND LENGTH(id) = 5
    ```

- 인덱스 컬럼을 가공하지 않아야, 리프블록에서 스캔 시작점을 찾아 거기서부터 스캔하다가 중간에 멈출 수 있다.
  - `<>, NOT IN, NOT BETWEEN` 과 같은 NOT-EQUAL 로 비교된 경우
  - LIKE '%??'
  - SUBSTRING(column, 1, 1), DAYOFMONTH(coulmn)과 같이 인덱스 칼럼이 변형된 경우
  - WHERE char_column = 10 과 같이 데이터 타입이 다른 비교

### 인덱스 순서를 고려

- 인덱스는 항상 정렬 상태를 유지하므로 인덱스 순서에 따라 ORDER BY, GROUP BY를 위한 소트 연산을 생략할 수 있다.
- 조건절에 항상 사용하거나, 자주 사용하는 컬럼을 인덱스로 선정한다.
- `=` 조건으로 자주 조회하는 컬럼을 앞쪽에 둡니다.
- 추가적으로, 아래 세 인덱스는 중복이다. 마지막 인덱스를 남기고 모두 삭제해야 한다.
  - 과세코드
  - 과세코드 + 이름
  - 과세코드 + 이름 + 연령

### 인덱스를 제대로 사용하는지 확인

EXPLAIN 으로 항상 실행 계획을 확인하는 것이 좋다.

### 복합 인덱스시 범위 검색컬럼을 뒤에 배치

![](/resource/wiki/query-optimizing/compound-index.png)

```sql
EXPLAIN SELECT * FROM tuning.record WHERE employee_id = 110183 AND time BETWEEN '2020-01-01' AND '2020-08-30';
```

### 인덱스 구성 확인

```sql
-- 테이블 / 인덱스 크기 확인
SELECT
    table_name,
    table_rows,
    round(data_length/(1024*1024),2) as 'DATA_SIZE(MB)',
    round(index_length/(1024*1024),2) as 'INDEX_SIZE(MB)'
FROM information_schema.TABLES
where table_schema = 'subway';

-- 미사용 인덱스 확인
SELECT * FROM sys.schema_unused_indexes;

-- 중복 인덱스 확인
SELECT * FROM sys.schema_redundant_indexes;
```

### 조인 연결 key 들은 양쪽 다 인덱스를 갖도록 하자

한쪽에만 인덱스가 있을 경우, Join Buffer 를 사용하여 성능 개선을 하나 일반적인 중첩 루프 조인에 비해 효율이 떨어진다. 인덱스가 없는 테이블이 드라이빙 테이블이 된다.

> MySQL 옵티마이저는 조인 되는 두 테이블에 있는 각 컬럼에서 인덱스를 조사하고, 인덱스가 없는 테이블이 있으면 그 테이블을 먼저 읽어서 조인을 실행한다. 뒤에 읽는 테이블은 검색 위주로 사용되기 때문에 인덱스가 없으면 성능에 미치는 영향이 매우 크다.
>
> 조인이 수행될때 드리븐 테이블의 조인 컬럼에 적절한 인덱스가 없다면 드라이빙 테이블로부터 읽은 레코드의 건수만큼 매번 드리븐 테이블을 풀 테이블 스캔이다 인덱스 풀 스캔해야 한다. 이때 드리븐 테이블의 비효율적인 검색을 보완하기 위해 MySQL 은 드라이빙 테이블에서 읽은 레코드를 임시 공간에 보관해두고 필요할 때 재사용할 수 있게 해준다. 읽은 레코드를 임시로 보관해두는 메모리 공간을 __Join Buffer__ 라고하며 조인 버퍼가 사용되는 실행 계획의 Extra 컬럼에는 __Using join buffer__ 라는 메시지가 표시된다.

### 데이터가 적은 테이블을 랜덤 액세스 해야 한다

드라이빙 테이블의 데이터가 적을 경우, 중첩 루프 조인을 수행하며 드리븐 테이블의 많은 양의 데이터에 인덱스 스캔을 한다. 드리븐 테이블의 Primary Key 를 사용하지 않을 경우 많은 양의 데이터에 랜덤 액세스로 테이블에 접근하므로 비효율적일 수 있다.

### 모수 테이블의 크기 줄이기

- __AS-IS__

```sql
EXPLAIN
SELECT employee.id, employee.last_name, employee.first_name, employee.join_date
	FROM tuning.employee, tuning.salary
    WHERE employee.id = salary.id
    AND employee.id BETWEEN 10001 AND 50000
    GROUP BY employee.id
    ORDER BY SUM(salary.annual_income) DESC
    LIMIT 150,10;
```

- __TO-BE__

```sql
EXPLAIN    
SELECT employee.id, employee.last_name, employee.first_name, employee.join_date
	FROM (
		SELECT id
			FROM tuning.salary
            WHERE id BETWEEN 10001 AND 50000
            GROUP BY id
            ORDER BY SUM(salary.annual_income) DESC
            LIMIT 150,10
	) salary,
	employee
WHERE employee.id = salary.id;
```

### 서브쿼리보단 조인문을 활용

- 대부분의 경우 조인문이 서브쿼리 보다 성능이 좋다.
  - [Join vs. sub-query](https://stackoverflow.com/questions/2577174/join-vs-sub-query)
  - [Rewriting Subqueries as Joins](https://dev.mysql.com/doc/refman/5.7/en/rewriting-subqueries.html)

![](/resource/wiki/query-optimizing/sub-join.png)

- MySQL 5.6 이후로 [서브쿼리 최적화](https://dev.mysql.com/doc/refman/5.6/en/subquery-optimization.html)가 이루어진다. (SEMI JOIN, MATERIALIZED 등) 다만, 8.0 까지도 UPDATE, DELETE 등는 서브쿼리 최적화가 지원되지 않는다. 가능하면 JOIN 을 사용하는 것이 좋다.

## Links

- [NextStep 인프라 공방](https://edu.nextstep.camp/)
- [MySQL Query Performance Optimization Tips](https://www.section.io/engineering-education/mysql-query-performance-optimization-tips/)
- [MySQL workbench](https://www.mysql.com/products/workbench/)
- [Query Performance Optimization in MySQL](https://www.databasejournal.com/mysql/query-performance-optimization-in-mysql/)
- [드라이빙 테이블(DRIVING TABLE)의 개념/결정 규칙](https://devuna.tistory.com/36)

## 참고 문헌

- Real MySQL / 이성욱 저 / 위키북스