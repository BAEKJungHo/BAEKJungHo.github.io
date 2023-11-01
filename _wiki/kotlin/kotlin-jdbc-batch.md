---
layout  : wiki
title   : JDBC Batch Updates
summary : 
date    : 2023-10-26 20:54:32 +0900
updated : 2023-10-26 21:15:24 +0900
tag     : kotlin java
toc     : true
comment : true
public  : true
parent  : [[/kotlin]]
latex   : true
---
* TOC
{:toc}

## JDBC Batch Updates

```kotlin
val dataSource: DataSource = DataSourceFactory.of(env = env, service = service)
DriverManager.getConnection(dataSource.url, dataSource.user, dataSource.pw)
    .use { connection ->

        connection.autoCommit = false

        try {
           // QUERY: UPDATE vehicle SET vehicle_id=? WHERE vehicle_id=?
           val ps: PreparedStatement = connection.prepareStatement(QUERY)

           for(id in VEHICLE_IDS) {
             ps.setString(1, vehicleId.next)
             ps.setString(2, vehicleId.prev)
             ps.addBatch()
           }

           val result: IntArray = ps.executeBatch()
           println("#[Result] ${result.contentToString()}")
           connection.commit()
         } catch (e: Exception) {
           connection.rollback()
         }
     }
```

## Links

- [Spring Docs JDBC Batch Operations](https://docs.spring.io/spring-framework/reference/data-access/jdbc/advanced.html)
- [JDBC Batch Updates](https://jenkov.com/tutorials/jdbc/batchupdate.html)
