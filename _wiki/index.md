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

## spring

* [[/spring/spring-pojo]]
* [[/spring/spring-concurrency]]
* [[/spring/spring-converter]]
* [[/spring/spring-psa]]
* [[/spring/spring-di]]
* [[/spring/spring-logging]]

## ddd

* [[/ddd/ddd-quotes]]

## Test Methodology

* [[/driven/test-methodology]]
* [[/driven/extreme-programming]]

## etc

* [[mathjax-latex]]

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

