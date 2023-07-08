---
layout  : wiki
title   : Distributed Key-Value Store in Cassandra
summary : 
date    : 2023-07-05 15:28:32 +0900
updated : 2023-07-05 18:15:24 +0900
tag     : database cassandra msa
toc     : true
comment : true
public  : true
parent  : [[/database]]
latex   : true
---
* TOC
{:toc}

## Distributed Key-Value Store in Cassandra

__[Cassandra Data Partitions](https://www.instaclustr.com/blog/cassandra-data-partitioning/)__:

![](/resource/wiki/database-cassandra-kkv/partitions.png)

__Primary Key = Partition Key + [Clustering Columns]__ 

이러한 Cassandra 의 Key-Value Store Model 을 KKV 라고 한다.

첫 번째 K 는 파티션 키이며 데이터가 어느 노드에 있고 디스크의 어디에 있는지 확인하는 데 사용된다.

Cassandra uses a partition key to determine which node store data on and where to find data when it’s needed.

즉, 파티션 키는 __locality__ 를 정한다.

두번째 K 는 클러스터링 키를 의미한다. 이 클러스터링 키는 파티션에 있는 여러 행들을 식별하는데 사용된다. 파티션내에서 행들을 정렬 하기 위해 사용된다.

__Some of Key Design Objectives__:

- 쓰기는 수십억 건에 달하고 추가 전용 로그를 사용하도록 최적화해야 하지만 읽기는 지리적으로 매우 다양할 수 있다. 따라서 데이터 센터 간 복제가 필요하며 우수한 읽기 효율성을 위해 중요하다.

수십억건의 쓰기를 효율적으로 하기 위해서 Cassandra 는 [Log Structured File System](https://pages.cs.wisc.edu/~remzi/OSTEP/file-lfs.pdf) 을 사용한다.
즉, 로그에 순차적으로 쓰기를 수행하는 것이다.

Writes are appended to a commit log and written to an in memory structure called a memtable that is eventually flushed to disk.

읽기 최적화도 진행을 하는데 [Cassandra - Distributed key-value store optimized for write-heavy workloads](https://medium.com/coinmonks/cassandra-distributed-key-value-store-optimized-for-write-heavy-workloads-77f69c01388c) 글에 있는 원문을 그대로 적는다.

"Then further optimizations using [bloom filter](https://meetup.nhncloud.com/posts/192) to avoid disk lookups. There is also some locality with key and the columns. But in case of column families, certain columns might be further away — this is optimized using a column index."
