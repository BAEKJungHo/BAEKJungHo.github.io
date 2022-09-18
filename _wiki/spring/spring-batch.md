---
layout  : wiki
title   : Spring Framework Batch
summary : 
date    : 2022-08-18 15:05:32 +0900
updated : 2022-08-18 15:15:24 +0900
tag     : spring batch
toc     : true
comment : true
public  : true
parent  : [[/spring]]
latex   : true
---
* TOC
{:toc}

## BatchApplication

### @EnableBatchProcessing

- modular 옵션 활성화 시 ModularBatchConfiguration 동작
- modular 옵션 비활성화 시 SimpleBatchConfiguration 동작
- 초기화 관련 클래스
  - `BatchAutoConfiguration`
      - 스프링 배치가 초기화 될 때 자동으로 실행되는 설정 클래스
      - Job 을 수행하는 JobLauncherApplicationRunner 빈을 생성
  - `SimpleBatchConfiguration`
      - JobBuilderFactory 와 StepBuilderFactory 생성
      - 스프링 배치의 주요 구성 요소 생성 - 프록시 객체로 생성됨
  - `BatchConfigurerConfiguration`
      - BasicBatchConfigurer
          - SimpleBatchConfiguration 에서 생성한 프록시 객체의 실제 대상 객체를 생성하는 설정 클래스
          - 빈으로 의존성 주입 받아서 주요 객체들을 참조해서 사용할 수 있다.
      - JpaBatchConfigurer
          - JPA 관련 객체를 생성하는 설정 클래스
      - 사용자 정의 BatchConfigurer 인터페이스를 구현하여 사용할 수 있음

### Job, Step, Tasklet

> Job > Step > Tasklet 순서로 실행

1. Configuration 설정: 하나의 배치 Job 을 정의하고 빈 설정
2. JobBuilderFactory: Job 을 생성하는 빌더 팩토리
3. StepBuilderFactory: Step 을 생성하는 빌더 팩토리
4. Job: Job 생성
5. Step: Step 생성
6. Tasklet: Step 안에서 단일 태스크로 수행되는 로직 구현

## Metadata Schema

![](/resource/wiki/spring-batch/meta-data-erd.png)

- DB 와 연동하기 위해서 꼭 생성되어야 하는 테이블
- org.springframework.batch.core 에 `schmea-*.sql` 형태로 존재
- 스키마 생성
  - 수동 생성: 쿼리 복사 후 직접 실행
  - 자동 생성: spring.batch.jdbc.initialize-schema 설정
    - ALWAYS: 스크림트 항상 실행, RDBMS 설정이 되어있을 경우 내장 DB 보다 우선으로 실행
    - EMBEDDED: 내장 DB 일때만 실행되며 스키마가 자동생성됨. 기본값
    - NEVER
      - 스크림트 항상 실행 안함
      - 내장 DB 일 경우 스크립트가 생성이 안되기 때문에 오류 발생
      - __운영에서 수동으로 스크립트 생성 후 NEVER 옵션으로 설정하는 것을 권장__
  - MySQL 이나 PostgreSQL 을 사용하는 경우 별도의 [Sequence Table](https://docs.spring.io/spring-batch/docs/current/reference/html/schema-appendix.html#metaDataIdentity)을 생성해야 함

## Test

- [JobLauncherTestUtils](https://docs.spring.io/spring-batch/docs/current/api/org/springframework/batch/test/JobLauncherTestUtils.html) 로 테스트 가능
  - 이 클래스는 static utility 가 아니라 Bean 으로 생성해야함 
  - setJob()으로 특정 Job 을 지정하거나, 그냥 @Autowired 될 수도 있음 
  - 특정 Step 만 테스트도 가능
- SpringBoot 와 SpringBatch 시에는 @MockBean 도 가능
- [Spring Batch unit test example - Mkyoung.com](https://mkyong.com/spring-batch/spring-batch-unit-test-example/)
- [JobLauncherTestUtils 를 이용한 Spring Batch Test](http://hwannnn.blogspot.com/2018/06/spring-batch-test-joblaunchertestutils_5.html)

## Links

- [Spring Batch - Docs](https://spring.io/projects/spring-batch)
- [Spring Batch - kwonnam](https://kwonnam.pe.kr/wiki/springframework/batch)
- [codecentric/spring-boot-starter-batch-web](https://github.com/codecentric/spring-boot-starter-batch-web)
- [Spring Batch 간단 정리 - Yun Blog](https://cheese10yun.github.io/spring-batch-basic/)
- [Run a Spring Batch Job With Quartz](https://dzone.com/articles/spring-batch-with-quartz)
- [Spring Batch (Michael Minella) - Youtube](https://www.youtube.com/watch?v=CYTj5YT7CZU&feature=youtu.be)
- [Configuring Skip Logic in Spring Batch - Baeldung](https://www.baeldung.com/spring-batch-skip-logic)
- [Open Source Java Projects: Spring Batch](https://www.infoworld.com/article/2458888/open-source-java-projects-spring-batch.html)
- [Spring Batch Tutorial – The ULTIMATE Guide](https://www.javacodegeeks.com/spring-batch-tutorial.html)
- [Spring Batch Tutorial - Mkyoung.com](https://mkyong.com/tutorials/spring-batch-tutorial/)
- [Spring Batch Enviornment](https://www.tutorialspoint.com/spring_batch/spring_batch_environment.htm)
- [Spring Batch 2.2 JavaConfig](#)
    - [Spring Batch 2.2 - JavaConfig Part 1: A comparison to XML](https://blog.codecentric.de/en/2013/06/spring-batch-2-2-javaconfig-part-1-a-comparison-to-xml/)
    - [Spring Batch 2.2 - JavaConfig Part 2: JobParameters, ExecutionContext and StepScope](https://blog.codecentric.de/en/2013/06/spring-batch-2-2-javaconfig-part-2-jobparameters-executioncontext-and-stepscope/)
    - [Spring Batch 2.2 - JavaConfig Part 3: Profiles and environments](https://blog.codecentric.de/en/2013/06/spring-batch-2-2-javaconfig-part-3-profiles-and-environments/)
    - [Spring Batch 2.2 - JavaConfig Part 4: Job inheritance](https://blog.codecentric.de/en/2013/06/spring-batch-2-2-javaconfig-part-4-job-inheritance/)
    - [Spring Batch 2.2 - JavaConfig Part 5: Modular configurations](https://blog.codecentric.de/en/2013/06/spring-batch-2-2-javaconfig-part-5-modular-configurations/)
    - [Spring Batch 2.2 - JavaConfig Part 6: Partitioning and Multi-threaded Step](https://blog.codecentric.de/en/2013/07/spring-batch-2-2-javaconfig-part-6-partitioning-and-multi-threaded-step/)
- [Spring Batch Transaction](#)
    - [Transactions in Spring Batch - Part 1: The Basics](https://blog.codecentric.de/en/2012/03/transactions-in-spring-batch-part-1-the-basics/)
    - [Transactions in Spring Batch - Part 2: Restart, cursor based reading and listeners](https://blog.codecentric.de/en/2012/03/transactions-in-spring-batch-part-2-restart-cursor-based-reading-and-listeners/)
    - [Transactions in Spring Batch - Part 3: Skip and retry](https://blog.codecentric.de/en/2012/03/transactions-in-spring-batch-part-3-skip-and-retry/)
- [SpringOne2GX Replay: Spring Batch Performance Tuning](http://spring.io/blog/2015/02/23/springone2gx-replay-spring-batch-performance-tuning)
- [Spring Batch Tasklet Example](http://examples.javacodegeeks.com/enterprise-java/spring/spring-batch-tasklet-example/)
- [Spring Batch Job Example](http://examples.javacodegeeks.com/enterprise-java/spring/spring-batch-job-example/)
- [Spring Batch Scheduler Example](http://examples.javacodegeeks.com/enterprise-java/spring-batch-scheduler-example/)
- [Spring Batch JobRepository Example](http://examples.javacodegeeks.com/enterprise-java/spring/spring-batch-jobrepository-example/) 
- [Spring Batch Partitioning Example](http://examples.javacodegeeks.com/core-java/spring-batch-partitioning-example/) 
- [Spring Batch Admin Tutorial](http://examples.javacodegeeks.com/enterprise-java/spring/spring-batch-admin-tutorial/) 
- [petrikainulainen Spring Batch Tutorial - introduction](http://www.petrikainulainen.net/programming/spring-framework/spring-batch-tutorial-introduction/) 
- [Spring Batch using Partitioner](http://www.baeldung.com/spring-batch-partitioner)
- [Java Batch Tutorial, Java Code Geeks - 2018](https://www.javacodegeeks.com/2018/05/java-batch-tutorial.html) 
- [Java Batch Tutorial, Examples Java Code Geeks - 2018](https://examples.javacodegeeks.com/enterprise-java/java-batch-tutorial/) 
- [Spring Batch - 작업실행](http://opennote46.tistory.com/76) 
- [How to use Spring Batch Late Binding - Step Scope & Job Scope - grokonez](https://grokonez.com/spring-framework/spring-batch/use-spring-batch-late-binding-step-scope-job-scope) 
- [Spring Batch - grokonez](https://grokonez.com/spring-framework-tutorial/spring-batch)
- [Spring Batch Example – MySQL Database To XML – Mkyong.com](https://www.mkyong.com/spring-batch/spring-batch-example-mysql-database-to-xml/) 
- [Spring Batch Exception Handling Example, Examples Java Code Geeks - 2018](https://examples.javacodegeeks.com/enterprise-java/spring/batch/spring-batch-exception-handling-example/)
- [egovframework:rte2:brte:batch_core:parallel_process [eGovFrame]](http://www.egovframe.go.kr/wiki/doku.php?id=egovframework:rte2:brte:batch_core:parallel_process)
- [Conditional Flow in Spring Batch - Baeldung](https://www.baeldung.com/spring-batch-conditional-flow)
- [Spring Boot 기반으로 개발하는 Spring Batch](https://www.inflearn.com/course/%EC%8A%A4%ED%94%84%EB%A7%81-%EB%B0%B0%EC%B9%98/dashboard)