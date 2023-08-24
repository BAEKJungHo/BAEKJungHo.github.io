---
layout  : wiki
title   : MetadataLock
summary : 
date    : 2023-08-22 15:28:32 +0900
updated : 2023-08-22 18:15:24 +0900
tag     : database lock
toc     : true
comment : true
public  : true
parent  : [[/database]]
latex   : true
---
* TOC
{:toc}

## MetadataLock

Metadata is “the data about the data.” __Anything that describes the database__ is metadata. Thus column names, database names, user names, version names, and most of the string results from SHOW are metadata. 

![](/resource/wiki/database-metadata-lock/metalock.png)

만약, Lock Wait Timeout 내에 TxA 의 작업이 완료되면, TxB 의 작업도 성공적으로 수행될 수 있다.

```
// TxB finally gets the output
Query OK, 1 row affected (35.23 sec)
```

TxA 에서 대량의 Rows Update 가 일어나고 있는 동안 TxB 에서 delete 같은 DML 을 보내는 경우에도 TxB 가 아래와 같은 Lock Wait Timeout 예외를 받을 수 있다.

```
ERROR 1205 (HY000): Lock wait timeout exceeded; try restarting transaction
```

[MySQL InnoDB Lock Wait Timeout](https://dev.mysql.com/doc/refman/8.0/en/innodb-parameters.html#sysvar_innodb_lock_wait_timeout) 의 기본 값은 50sec 이다.

## Links

- [MySQL Metadata Locking](https://dev.mysql.com/doc/refman/8.0/en/metadata-locking.html)
- [Viewing all Metadata Locks in MariaDB](https://mariadb.com/kb/en/metadata-lock-info-plugin/#viewing-all-metadata-locks)
- [Matching Metadata Locks with Threads and Queries in MariaDB](https://mariadb.com/kb/en/metadata-lock-info-plugin/#matching-metadata-locks-with-threads-and-queries)