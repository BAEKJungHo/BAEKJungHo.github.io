---
layout  : wiki
title   : Entity Logging
summary : 
date    : 2023-05-05 20:54:32 +0900
updated : 2023-05-05 21:15:24 +0900
tag     : logging
toc     : true
comment : true
public  : true
parent  : [[/logging]]
latex   : true
---
* TOC
{:toc}

## Entity Logging

__Entity:__

```java
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;

@Entity
public class Entity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private String email;
    private String phone;

    // 생성자, getter/setter, equals/hashcode 메소드 등 생략
}
```

엔티티에 있는 속성들을 log 에 출력하기 위해 아래와 같이 사용하는 경우 주의해야 한다.

```
log.info(" # [Entity] {}", entity);
```

이 때, Entity 의 toString() 이 호출된다. @ToString 어노테이션을 사용하지 않거나 오버라이딩 하지 않는 경우
객체의 주소값이 출력된다.

문제는 참조 관계에 있는 엔티티간에 toString() 이 무한으로 호출될 가능성이 있다.

- A 엔티티의 toString() 에서 B 엔티티의 프로퍼티를 출력하는 경우 + 그 반대

따라서 __toJson(), toLog()__ 같은 메서드를 엔티티에 제공하는 것도 방법이다.

```java
public interface EntityLogger {
    /**
     * <b>FetchType 이 Lazy 인 참조 엔티티의 프로퍼티를 출력하는 것은 꼭 필요한지 재고</b>
     * @return stringify entity properties
     */
    String toJson();
}
```

이제 엔티티 로깅이 필요한 경우 위 인터페이스를 구현하여 사용하면 된다.