---
layout  : wiki
title   : Anonymous Class with Super Token Types 
summary : 
date    : 2023-08-17 11:28:32 +0900
updated : 2023-08-17 12:15:24 +0900
tag     : java kotlin jackson
toc     : true
comment : true
public  : true
parent  : [[/java]]
latex   : true
---
* TOC
{:toc}

## Anonymous Class

[Deserialize Generic](https://baekjungho.github.io/wiki/java/java-deserialize-generic/) 에서 Super Type Tokens 라는 개념을 잠깐 살펴봤는데, 
이 개념의 핵심은 anonymous inner classes 를 활용하여 컴파일 시간동안 타입 정보를 보존 하는 것이다.

```kotlin
var typeRef: TypeReference<Member> = object : TypeReference<Member>() {}
```

__익명 클래스는 내부 클래스이기 때문에 Member 에 대한 참조를 가지고 있다.__

위 코드를 디컴파일 하면 아래와 같다.

```java
@Metadata(
   mv = {1, 7, 0},
   k = 2,
   d1 = {"\u0000\u000e\n\u0000\n\u0002\u0018\u0002\n\u0002\u0018\u0002\n\u0002\b\u0005\" \u0010\u0000\u001a\b\u0012\u0004\u0012\u00020\u00020\u0001X\u0086\u000e¢\u0006\u000e\n\u0000\u001a\u0004\b\u0003\u0010\u0004\"\u0004\b\u0005\u0010\u0006¨\u0006\u0007"},
   d2 = {"typeRef", "Lcom/fasterxml/jackson/core/type/TypeReference;", "Lteam/backend/domain/member/entity/Member;", "getTypeRef", "()Lcom/fasterxml/jackson/core/type/TypeReference;", "setTypeRef", "(Lcom/fasterxml/jackson/core/type/TypeReference;)V", "api"}
)
public final class PrincipalDetailsKt {
   @NotNull
   private static TypeReference typeRef = (TypeReference)(new TypeReference() {
   });

   @NotNull
   public static final TypeReference getTypeRef() {
      return typeRef;
   }

   public static final void setTypeRef(@NotNull TypeReference var0) {
      Intrinsics.checkNotNullParameter(var0, "<set-?>");
      typeRef = var0;
   }
}
```

d2 를 보면 `Lteam/backend/domain/member/entity/Member;` 코드를 볼 수 있다.