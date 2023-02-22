---
layout  : wiki
title   : ParameterizedTypeReference
summary : 
date    : 2023-02-21 15:05:32 +0900
updated : 2023-02-21 15:15:24 +0900
tag     : spring
toc     : true
comment : true
public  : true
parent  : [[/spring]]
latex   : true
---
* TOC
{:toc}

## ParameterizedTypeReference

The purpose of this class is to enable capturing and passing a generic Type. In order to capture the generic type and retain it at runtime, you need to create a subclass (ideally as anonymous inline class) as follows:

```java
ParameterizedTypeReference<List<String>> typeRef = new ParameterizedTypeReference<List<String>>() {};
```

Here is an example of how you might use ParameterizedTypeReference with Spring's RestTemplate class:

```java
// Create a ParameterizedTypeReference object that captures the generic type List<MyObject>
ParameterizedTypeReference<List<MyObject>> typeRef = new ParameterizedTypeReference<List<MyObject>>() {};

// Make a GET request to an API that returns a List<MyObject>
ResponseEntity<List<MyObject>> response = restTemplate.exchange(url, HttpMethod.GET, null, typeRef);

// Get the list of MyObject instances from the response
List<MyObject> myObjects = response.getBody();
```

Use ParameterizedTypeReference with Spring's WebClient class:

```java
// Return type is Mono<Page<OrderSpec.SearchResponse>>
return this.webClient.get()
        .uri(builder.build().toUri())
        .retrieve()
        .onStatus(HttpStatus::is4xxClientError, clientResponse -> handleClientError(clientResponse))
        .onStatus(HttpStatus::is5xxServerError, clientResponse -> handleServerError(clientResponse))
        .bodyToMono(new ParameterizedTypeReference<Page<OrderSpec.SearchResponse>>() {})
        .onErrorMap(throwable -> {
            if (throwable instanceof WebClientResponseException) {
                WebClientResponseException ex = (WebClientResponseException) throwable;
                return new ServiceException(ex.getResponseBodyAsString());
            }
            return throwable;
        });
```

## Links

- [ParameterizedTypeReference - Spring Docs](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/core/ParameterizedTypeReference.html)
