---
layout  : wiki
title   : Open Session In View Pattern
summary : 
date    : 2022-04-13 09:28:32 +0900
updated : 2022-04-13 12:15:24 +0900
tag     : spring jpa designpattern
toc     : true
comment : true
public  : true
parent  : [[/spring]]
latex   : true
---
* TOC
{:toc}

## Open Session In View

OSIV stands for Open Session In View, and it is a design pattern used in Hibernate to manage database transactions and sessions.

By keeping the session open, the OSIV pattern can help simplify the management of Hibernate sessions and transactions, and make it easier to work with lazy-loaded data. However, it can also have drawbacks, such as causing performance issues and potential __memory leaks__.

The OSIV strategy maintains persistence contexts and database connections from the beginning of the initial database connection until the end of the API response, just like the beginning of the transaction.

__spring.jpa.open-in-view__ default value is __true__.  Starting with version 2.0, [Spring Boot now issues a warning if the Open Session In View mode is active](https://github.com/spring-projects/spring-boot/issues/7107) so that you can disable it sooner than later.

The drawbacks are that the database connection is maintained for too long.

![](/resource/wiki/spring-jpa-osiv/osiv.png)

Turning off OSIV closes the persistence context at the end of the transaction and returns the database connection. Therefore, connection resources are not wasted.

For real-time APIs with a lot of traffic, it is recommended to turn off the OSIV option, and it is okay to turn on the OSIV option in places that do not occupy much connections, such as ADMIN.

### Vlad Mihalcea

Vlad Mihalcea said ["OSIV" is Anti-pattern](https://vladmihalcea.com/the-open-session-in-view-anti-pattern/).

## Links

- [Java Persistence with Hibernate](https://hoclaptrinhdanang.com/downloads/pdf/spring/Java%20Persistence%20with%20Hibernate.pdf)
- [Eternity - Open Session In View Pattern](http://pds19.egloos.com/pds/201106/28/18/Open_Session_In_View_Pattern.pdf)
- [OSIV 와 성능 최적화](https://catsbi.oopy.io/eedf92ff-8834-458d-86e4-0ed2e01b5971)