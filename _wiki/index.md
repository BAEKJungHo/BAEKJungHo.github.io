---
layout  : wikiindex
title   : wiki
toc     : true
public  : true
comment : false
regenerate: true
---

## kotlin

* [[/kotlin/kotlin-sequence]]
* [[/kotlin/kotlin-philosophy]]
* [[/kotlin/kotlin-range]]
* [[/kotlin/kotlin-range-progression]]
* [[/kotlin/kotlin-delegate]]

## java

* [[/java/execution-java]]

## spring

* [[/spring/spring-pojo]]
* [[/spring/spring-concurrency]]
* [[/spring/spring-converter]]
* [[/spring/spring-psa]]
* [[/spring/spring-di]]
* [[/spring/spring-logging]]
* [[/spring/spring-async]]
* [[/spring/spring-data]]

## msa

* [[/msa/msa-business-agility]]
* [[/msa/msa-iac]]
* [[/msa/msa-polyglot]]
* [[/msa/msa-eventual-consistency]]
* [[/msa/msa-fault-tolerance]]
* [[/msa/msa-reactive-manifesto]]

## auth

* [[/auth/auth-hmac]]
* [[/auth/auth-jwt]]

## design pattern

* [[/designpattern/designpattern-singleton]]

## ddd

* [[/ddd/ddd-quotes]]
* [[/ddd/ddd-aggregate]]

## Test Methodology

* [[/driven/test-methodology]]
* [[/driven/extreme-programming]]
* [[/driven/oop-oo]]

## Database

* [[/database/mysql-index]]
* [[/database/hikaricp-concepts]]
* [[/database/query-index]]

## Clean Code

* [[/cleancode/cleancode-guide]]

## Network

* [[/network/network-layeredarchitectures]]

## Http

* [[/http/http-localstorage]]

## DataStructures

* [[/datastructures/datastructures-recursion]]

## Javascript

* [[/javascript/js-eventloop]]

## NodeJS

* [[/nodejs/node-express]]

## etc

* [[/etc/mathjax-latex]]
* [[/etc/character-encoding]]
* [[/etc/environment-settings]]

---

## blog posts
<div>
    <ul>
{% for post in site.posts %}
    {% if post.public != false %}
        <li>
            <a class="post-link" href="{{ post.url | prepend: site.baseurl }}">
                {{ post.title }}
            </a>
        </li>
    {% endif %}
{% endfor %}
    </ul>
</div>

