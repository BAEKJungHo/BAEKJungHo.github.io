---
layout  : wiki
title   : LazyConnectionDataSourceProxy
summary : 
date    : 2022-10-13 21:28:32 +0900
updated : 2022-10-13 22:15:24 +0900
tag     : spring database
toc     : true
comment : true
public  : true
parent  : [[/spring]]
latex   : true
---
* TOC
{:toc}

## LazyConnectionDataSourceProxy

> Proxy for a target DataSource, fetching actual JDBC Connections lazily. This DataSource proxy allows to avoid fetching JDBC Connections from a pool unless actually necessary.

- 스프링은 트랜잭션 시작시 커넥션의 실제 사용여부와 무관하게 커넥션을 확보한다.
  - __단점__
    - Cache 를 사용하는 경우 Database 에 접근하지 않음에도 불필요한 커넥션을 점유
    - Hibernate 의 영속성 컨텍스트 1차 캐시에도 불필요한 커넥션을 점유
    - 외부 서비스에 접근해서 작업을 수행한 이후 그 결과값을 Database 에 Read/Write 하는 경우 외부 서비스에 의존하는 시간 만큼 불필요한 커넥션을 점유
    - Multi DataSource 환경에서 트랜잭션 진입한 이후 DataSource 를 결정 해야할 때, 이미 트랜잭션 진입 시점에서 DataSource 가 결정되므로 분기 불가능
- 이로인해 트랜잭션 시작 후 커넥션과 무관한 다른 작업으로 많은 시간이 지체되면 그 시간 동안 해당 트랜잭션의 커넥션은 사용불가 상태가 되어, 데이터소스에 커넥션 풀이 부족해지는 사태를 유발할 수도 있다.
- [LazyConnectionDataSourceProxy](https://docs.spring.io/spring-framework/docs/3.0.x/javadoc-api/org/springframework/jdbc/datasource/LazyConnectionDataSourceProxy.html) 를 사용하면 트랜잭션이 시작되어도 실제로 커넥션이 필요한 경우에만 데이터소스에서 커넥션을 반환한다.

### getConnection()

> When asked for a Statement (or PreparedStatement or CallableStatement).
>
> ![](/resource/wiki/spring-lazyconnectiondatasourceproxy/lazy-connection.png)

### HikariPoolMXBean 으로 Connection Monitoring 하기

- LazyConnectionDataSourceProxy 설정을 하지 않은 경우에는 트랜잭션에 진입하는 순간 커넥션이 할당된다.
- LazyConnectionDataSourceProxy 설정을 한 경우에는 __When asked for a Statement (or PreparedStatement or CallableStatement)__ 일때 커넥션이 할당된다.

```kotlin
@Service
class AuthService(
    private val dataSource: DataSource,
    private val repository: AuthRepository
) {
    
    private val log = LoggerFactory.getLogger(this.javaClass)
    
    @Transactional
    fun createToken(request: TokenDto.CreateReqeust) {
        printConnectionStatus()
    }
    
    private fun printConnectionStatus() {
        val hikari = datasource as HikariDataSource
        val hikariPoolMXBean = hikari.getHikariPoolMXBean()
        log.info("Active Connections: $hikariPoolMXBean.getActiveConnections()")
        log.info("Idle Connections: $hikariPoolMXBean.getIdleConnections()")
    }
}
```

### Config

```java
@Configuration
public class DataSourceConfig{

    @Bean
    public DataSource lazyDataSource(DataSourceProperties properties) {
        HikariDataSource dataSource = new HikariDataSource();
        dataSource.setJdbcUrl(properties.getUrl());
        dataSource.setUsername(properties.getUsername());
        dataSource.setPassword(properties.getPassword());
        dataSource.setDriverClassName(properties.getDriverClassName());
        return new LazyConnectionDataSourceProxy(dataSource);
    }
}
```

## Master/Slave 

- Master/Slave 로 구성된 환경에서 LazyConnectionDataSourceProxy 와 dynamicDataSource 를 설정하여, 런타임에 어떤 커넥션을 맺을지 정할 수 있다.

```xml
<bean id="abstractDataSource"
      abstract = "true"
      class="com.mchange.v2.c3p0.ComboPooledDataSource"
      destroy-method="close">
    <property name="maxPoolSize" value="30" />
    <property name="minPoolSize" value="10" />
    <property name="autoCommitOnClose" value="false" />
    <property name="checkoutTimeout" value="10000" />
    <property name="acquireRetryAttempts" value="2" />
</bean>

<!--Master /Slave DataSource-->
<bean id="master" parent="abstractDataSource">
    <!--connection pool attrs-->
    <property name="driverClass" value="${jdbc.driver}"/>
    <property name="jdbcUrl" value="${jdbc.master.url}"/>
    <property name="user" value="${jdbc.username}"/>
    <property name="password" value="${jdbc.password}"/>
</bean>

<bean id="slave" parent="abstractDataSource">
    <!--connection pool attrs-->
    <property name="driverClass" value="${jdbc.driver}"/>
    <property name="jdbcUrl" value="${jdbc.slave.url}"/>
    <property name="user" value="${jdbc.username}"/>
    <property name="password" value="${jdbc.password}"/>
</bean>

<!--Configure Dynarmic Data Routing Data Source -->
<bean id ="dynamicDataSource" class= "com.example.o2o.dao.split.DynamicDataSource">
    <!-- Map<Object, Object> targetDataSources; -->
    <property name="targetDataSources">
        <map>
            <entry value-ref="master" key="master"></entry>
            <entry value-ref="slave" key="slave"></entry>
        </map>
    </property>
</bean>

<!--Evaluate DataSource when it is needed at runtime, lazy connection/evaluation-->
<bean id ="dataSource" class ="org.springframework.jdbc.datasource.LazyConnectionDataSourceProxy">
    <property name="targetDataSource">
        <ref bean="dynamicDataSource"></ref>
    </property>
</bean>
```

## Links

- [LazyConnectionDataSourceProxy - Docs](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/jdbc/datasource/LazyConnectionDataSourceProxy.html)
- [LazyConnectionDataSourceProxy - kwonnam](https://kwonnam.pe.kr/wiki/springframework/lazyconnectiondatasourceproxy)
- [LazyConnectionDataSourceProxy 알아보기 - sup2is](https://sup2is.github.io/2021/07/08/lazy-connection-datasource-proxy.html)
- [Master/Slave Replication](https://tongshi049.github.io/2019/07/24/db-master-slave-replication/)