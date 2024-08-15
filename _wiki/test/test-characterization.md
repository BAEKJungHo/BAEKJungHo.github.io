---
layout  : wiki
title   : Characterization Test
summary : Golden Master Testing(also known as Snapshot Test, Approval Test) is Testing Techniques Used When Refactoring LegacyCode
date    : 2024-08-15 10:28:32 +0900
updated : 2024-08-15 11:15:24 +0900
tag     : test refactoring spring
toc     : true
comment : true
public  : true
parent  : [[/test]]
latex   : true
---
* TOC
{:toc}

## Characterization Test

___[Characterization Test (Golden Master Testing)](https://en.wikipedia.org/wiki/Characterization_test)___ 는 복잡한 Legacy 코드를 리팩토링하는 경우 적절한 단위 테스트를 작성하기 어려운 상황에서 안전하게 ___[Refactoring](https://refactoring.guru/ko/refactoring)___ 할 수 있도록 하는 ___[Integration Testing](https://baekjungho.github.io/wiki/test/test-integration/)___  기법이다.
여기서 말하는 LegacyCode 는 _["code without unit tests" or "profitable code that we feel afraid to change"](https://blog.thecodewhisperer.com/permalink/surviving-legacy-code-with-golden-master-and-sampling)_ 의 의미를 담고 있다.

테스트 환경을 실제 운영 환경과 유사하게 구축해야 한다. 이때 ___[Testcontainers](https://testcontainers.com/)___ 는 Docker Container 를 사용하여 DB, Message Broker, API 등의 의존성을 구축할 수 있다.
DB Testing 을 쉽게 만들어주는 도구로는 ___[Database Rider](https://github.com/database-rider/database-rider)___ 가 있다. DB Rider 는 사전에 준비된 데이터셋을 활용하여 DB 를 특정 상태로 설정해주는 기능 이외에도, DB 의 상태를 추출하여 데이터 검증에 활용 할 수 있는 기능도 제공한다.

스프링은 테스트 모음 내에서 ApplicationContext 을 재사용할 수 있도록 ___[ContextCaching](https://docs.spring.io/spring-framework/reference/testing/testcontext-framework/ctx-management/caching.html)___ 기법을 사용한다. 따라서, 이 효과를 극대화 하기 위해서는 공통 설정 정보를 추상클래스로 만들어서 관리할 수 있다.

```kotlin
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.context.DynamicPropertyRegistry
import org.springframework.test.context.DynamicPropertySource
import org.testcontainers.containers.PostgreSQLContainer
import org.testcontainers.junit.jupiter.Container
import org.testcontainers.junit.jupiter.Testcontainers

@SpringBootTest
@ActiveProfiles("test")
@Testcontainers
abstract class AbstractIntegrationTest {

    companion object {
        @Container
        private val postgresContainer = PostgreSQLContainer<Nothing>("postgres:13").apply {
            withDatabaseName("testdb")
            withUsername("testuser")
            withPassword("testpassword")
        }

        @JvmStatic
        @DynamicPropertySource
        fun registerDynamicProperties(registry: DynamicPropertyRegistry) {
            registry.add("spring.datasource.url", postgresContainer::getJdbcUrl)
            registry.add("spring.datasource.username", postgresContainer::getUsername)
            registry.add("spring.datasource.password", postgresContainer::getPassword)
        }
    }

    // 공통 테스트 설정이나 헬퍼 메소드를 여기에 추가할 수 있다.
}
```

Golden Master Testing 을 사용하여 리팩토링 전과 후의 동작이 같다면 리팩토링에 성공했다고 봐도 무방하다.

## Links

- [Surviving Legacy Code with Golden Master and Sampling](https://blog.thecodewhisperer.com/permalink/surviving-legacy-code-with-golden-master-and-sampling)
- [리팩토링을 위한 통합 테스트 - MUSINSA](https://medium.com/musinsa-tech/%EB%A6%AC%ED%8C%A9%ED%86%A0%EB%A7%81%EC%9D%84-%EC%9C%84%ED%95%9C-%ED%86%B5%ED%95%A9-%ED%85%8C%EC%8A%A4%ED%8A%B8-cd23498918a7)
- [Improved Testcontainers Support in Spring Boot 3.1](https://spring.io/blog/2023/06/23/improved-testcontainers-support-in-spring-boot-3-1)