---
layout  : wiki
title   : Prevent Duplicate Storing in Redis
summary : 
date    : 2023-08-23 13:15:32 +0900
updated : 2023-08-23 13:55:24 +0900
tag     : redis
toc     : true
comment : true
public  : true
parent  : [[/redis]]
latex   : true
---
* TOC
{:toc}

## Prevent Duplicate Storing in Redis

__Enum 을 사용하여 Redis Key 를 사용하는 경우__:

```kotlin
class RedisKey(private val key: String, private val enum: Enum) {

    fun getKeyStr() = this.hashCode()
    
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (other == null || javaClass != other.javaClass) return false
        val redisKey = other as RedisKey
        return key == redisKey.key && enum == redisKey.enum
    }

    override fun hashCode(): Int {
        return key.hashCode() + enum.name.hashCode()
    }
}
```

위 hashCode 메서드에서 enum.name() 대신 enum 자체를 넘겨준다면 __JVM 이 재시작될때마다 새로운 주소값을 가진 인스턴스가 할당__ 되므로 조회가 안될 수 있다.

```kotlin
fun isDuplicated(redisKey: RedisKey): Boolean = 
  redisTemplate.opsForValue().isExistKey(redisKey.getKeyStr())
```

## Links

- [Enum은 싱글톤이니 Redis Key로 사용해도 문제 없겠지?](https://goodgid.github.io/TIL-Precautions-when-using-Enum-as-Redis-Key/#enum-reference-is-mutable)