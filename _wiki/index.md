---
layout  : wikiindex
title   : wiki
toc     : true
public  : true
comment : false
regenerate: true
---

## [[kotlin]]

* [[kotlin]]
  * [[/kotlin-sequence]]

## [[spring]]

* [[spring]]
  * [[/spring-pojo]]

## [[ddd]]

* [[ddd]]
  * [[/ddd-quotes]]

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

