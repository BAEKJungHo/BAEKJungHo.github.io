---
layout  : wiki
title   : Discover Spring REST Docs API Enum Designs
summary : 
date    : 2024-08-23 20:54:32 +0900
updated : 2024-08-23 21:15:24 +0900
tag     : kotlin spring
toc     : true
comment : true
public  : true
parent  : [[/kotlin]]
latex   : true
---
* TOC
{:toc}

## Discover Spring REST Docs API Enum Designs

___[Spring REST Docs API](https://github.com/ePages-de/restdocs-api-spec)___ 에서 사용된 Enum Design 이다.

```kotlin
internal interface SecurityRequirementsExtractor {
    fun extractSecurityRequirements(operation: Operation): SecurityRequirements?
}

internal class BasicSecurityHandler : SecurityRequirementsExtractor {
    override fun extractSecurityRequirements(operation: Operation): SecurityRequirements? {
        return if (isBasicSecurity(operation)) {
            Basic
        } else null
    }

    private fun isBasicSecurity(operation: Operation): Boolean {
        return operation.request.headers
            .filterKeys { it == HttpHeaders.AUTHORIZATION }
            .flatMap { it.value }
            .filter { it.startsWith("Basic ") }
            .isNotEmpty()
    }
}

internal interface SecurityRequirements {
    val type: SecurityType
}

internal data class Oauth2(val requiredScopes: List<String>) :
    SecurityRequirements {
    override val type = SecurityType.OAUTH2
}

internal object Basic : SecurityRequirements {
    override val type = SecurityType.BASIC
}

internal object JWTBearer : SecurityRequirements {
    override val type = SecurityType.JWT_BEARER
}

internal enum class SecurityType {
    OAUTH2,
    BASIC,
    API_KEY,
    JWT_BEARER
}
```

Basic 이나 JWTBearer 를 설계할때 sealed class 나 class 등 대신 object 를 사용한 이유는 무엇일까? 

__Answered by claude 3.5 sonnet__:

![](/resource/wiki/kotlin-restdocs-api-enum-design/answer.png)


