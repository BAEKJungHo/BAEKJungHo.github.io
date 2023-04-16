---
layout  : wiki
title   : Projection for Avoid LazyInitializationException
summary : 
date    : 2022-04-14 09:28:32 +0900
updated : 2022-04-14 12:15:24 +0900
tag     : spring jpa
toc     : true
comment : true
public  : true
parent  : [[/spring]]
latex   : true
---
* TOC
{:toc}

## LazyInitializationException

To avoid the LazyInitializationException, you can either make sure to access the lazily loaded property or collection while still within the Hibernate session or transaction, or you can configure Hibernate to eagerly load the property or collection instead of lazily loading it. 

[Vlad Mihalcea - The best way to handle the LazyInitializationException](https://vladmihalcea.com/the-best-way-to-handle-the-lazyinitializationexception/)

## Projection

Projection refers to the query of a database query by selecting only a few columns. Returns only the values of the selected columns by extracting only the desired columns from the query results. This can speed up query execution.

__Using DTO:__

```kotlin
data class PostCommentDto(
    val id: Long,
    val review: String,
    val title: String
)
```

```java
List<PostCommentDTO> comments = doInJPA(entityManager -> {
    return entityManager.createQuery(
        "select new " +
        "   PostCommentDto(" +
        "       pc.id, pc.review, p.title" +
        "   ) " +
        "from PostComment pc " +
        "join pc.post p " +
        "where pc.review = :review", PostCommentDTO.class)
    .setParameter("review", review)
    .getResultList();
});
```

__Using Interface:__

```java
public interface PostOfComments {
    Long getId();

    String getReview();

    String getTitle();
}
```

```
List<PostOfComments> comments ...
```

ADMIN 처럼 통계성 쿼리를 뽑아내야 하는 경우에 유용하게 쓰일 수 있다. 혹은 CQRS 를 구현할 때도 유용하게 쓰일 것 같다.