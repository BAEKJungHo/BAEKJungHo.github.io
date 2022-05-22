---
layout  : wiki
title   : Spring Data Repository 
summary : 
date    : 2022-05-22 09:28:32 +0900
updated : 2022-05-22 12:15:24 +0900
tag     : spring
toc     : true
comment : true
public  : true
parent  : [[/spring]]
latex   : true
---
* TOC
{:toc}

## Spring Data Repository 

- Spring Data Repository 추상화의 목표는 다양한 영속성 저장소에 대한 데이터 접근 계층을 구현하는 데 필요한 상용구 코드(boilerplate)의 양을 크게 줄이는 것이다.
- 쉽게 말해, 데이터를 조회하기 위해 Persistence Layer 인 Repository 를 구현하기 위해서 필요한 boilerplate 를 줄이는 것이 목적이다.
- Spring Data JPA 에서 JpaRepository 는 Infrastructure Layer 에 속하며, 그것을 상속받아서 구현한 Repository 는 Persistence Layer 에 속한다.

## Core concepts

- Spring Data Repository 추상화의 핵심 인터페이스는 `Repository Inteface` 이다.
  - ```java
    @Indexed
    public interface Repository<T, ID> {}
    ```
- _Spring Data JPA Repository Architectures_
  - `J`paRepository (interface)
    - `P`agingAndSortingRepository (interface)
      - `C`rudRepository (interface)
        - `R`epository (interface)
    - `Q`ueryByExampleExecutor (interface)
- __Repository<T, ID>__
  - T is `Domain class`
  - ID is `Identifier`
  - __작업할 유형을 캡처__ 하고, __인터페이스를 확장하는데 도움이 되는__ `마커 인터페이스(Marker Interface)` 역할을 한다.
  - 특정 기술을 추상화한 JpaRepository, MongoRepository 같은 Persistence 를 제공한다. 이러한 인터페이스들은 `CrudRepository` 를 상속 받고 있다.
- __PagingAndSortingRepository<T, ID>__
  - 페이지 접근을 용이하게 해주는 추상화된 인터페이스
- __Derived Count Query__
  - CrudRepository 를 상속 받아서 새로운 인터페이스를 만들 수 있다.
  - ```java
    interface UserRepository extends CrudRepository<User, Long> {
      long countByLastname(String lastname);
    }
    ```


## Spring Data 를 사용하기 위한 4단계

- __Interface 구현__
  - ```java
    interface PersonRepository extends Repository<Person, Long> { … }
    ```
- __쿼리 메서드 선언__
  - ```java
    interface PersonRepository extends Repository<Person, Long> {
      List<Person> findByLastname(String lastname);
    }
    ```
- __Java 기반 설정__
  - ```java
    @EnableJpaRepositories
    class Config { … }
    ```
- __xml 기반 설정__
  - ```xml
    <jpa:repositories base-package="com.acme.repositories"/>
    ```
- __Repository 를 주입 받아서 사용__
  - ```java
    class SomeClient {
        private final PersonRepository repository;

        SomeClient(PersonRepository repository) {
          this.repository = repository;
        }

        void doSomething() {
          List<Person> persons = repository.findByLastname("Matthews");
        }
     }
     ```

## Links

- [Spring Data Docs](https://docs.spring.io/spring-data/jdbc/docs/current/reference/html/#repositories)
- [Query Methods](https://docs.spring.io/spring-data/jdbc/docs/current/reference/html/#repositories.query-methods)