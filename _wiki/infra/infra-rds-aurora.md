---
layout  : wiki
title   : MySQL RDS vs MySQL Aurora
summary : 
date    : 2023-02-08 15:54:32 +0900
updated : 2023-02-08 20:15:24 +0900
tag     : infra
toc     : true
comment : true
public  : true
parent  : [[/infra]]
latex   : true
---
* TOC
{:toc}

## MySQL RDS vs MySQL Aurora

Amazon Web Services (AWS) provides two managed relational database services: Amazon RDS for MySQL and Amazon Aurora MySQL. Both provide managed relational databases based on the MySQL database engine, but there are some differences between the two that you should be aware of when choosing which service to use for your application.

__Amazon RDS for MySQL:__

Is a fully managed database service that provides you with the ability to run MySQL databases in the cloud.
Provides compatibility with standard MySQL, making it easier to port existing applications to the cloud.
Offers multi-AZ deployments for high availability and automatic failover, as well as a variety of backup and recovery options.
Is designed to provide a highly available, scalable, and secure database solution, making it a good choice for applications that need these features.

__Amazon Aurora MySQL:__

Is a fully managed relational database service that provides up to five times better performance than standard MySQL databases, with lower latency and higher throughput.
Uses a unique storage architecture that provides fast and predictable performance, making it a good choice for applications with high performance requirements.
Offers automatic failover, high availability, and replication across multiple availability zones, as well as a variety of backup and recovery options.
Is fully compatible with standard MySQL, making it easier to port existing applications to the cloud.

In summary, Amazon RDS for MySQL provides a fully managed, standard MySQL database service that is well-suited for applications that need high availability and scalability, while Amazon Aurora MySQL provides a high-performance managed database service that is well-suited for applications with demanding performance requirements. The choice between the two depends on the specific needs of your application and what you are looking to achieve.

한줄 요약: MySQL Aurora 가 성능이 훨씬 좋음.

## Why does MySQL Aurora perform better ?

Amazon Aurora is designed to provide better performance than standard MySQL databases through a number of architectural innovations. Here are some key aspects of the Aurora architecture that contribute to its improved performance:

- __Storage Architecture__: Aurora uses a unique, shared-nothing architecture that separates the storage layer from the compute layer, providing faster and more predictable performance than traditional relational databases. The storage layer is distributed across multiple storage nodes and automatically replicates data across multiple availability zones, providing low latency and high throughput.
- __Query Processing__: Aurora uses a high-performance query processing engine that is optimized for read-intensive workloads. It also uses a parallel query execution mechanism that allows queries to be executed in parallel, further increasing performance.
- __Caching__: Aurora includes a high-performance caching layer that helps to reduce the latency and increase the throughput of read-intensive workloads. The cache is automatically managed by the service, and you can choose to configure it for your specific needs.
- __Replication__: Aurora uses a high-performance, fault-tolerant replication mechanism that provides fast and reliable data replication across multiple availability zones. The replication mechanism is designed to minimize data loss and minimize downtime in the event of a failure.

In summary, the shared-nothing architecture, optimized query processing, caching, and high-performance replication mechanism all work together to provide faster and more predictable performance than traditional relational databases. These architectural innovations make Amazon Aurora a good choice for applications with demanding performance requirements.

## Links

- [AWS RDS MySQL vs MySQL Aurora](https://houseofbrick.com/blog/aws-rds-mysql-vs-aurora-mysql/)