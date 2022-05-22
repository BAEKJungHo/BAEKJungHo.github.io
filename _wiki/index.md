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
* [[/kotlin/kotlin-singleton]]
* [[/kotlin/kotlin-range]]
* [[/kotlin/kotlin-range-progression]]

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

## Clean Code

* [[/cleancode/cleancode-guide]]

## Network

* [[/network/network-layeredarchitectures]]

## Http

* [[/http/http-localstorage]]

## Javascript

* [[/javascript/js-eventloop]]

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

