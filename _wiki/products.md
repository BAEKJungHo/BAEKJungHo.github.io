---
layout  : wiki
title   : Products
summary :
date    : 2026-06-14 09:00:00 +0900
updated : 2026-06-14 09:00:00 +0900
tag     : products
toc     : true
public  : true
parent  : [[/index]]
latex   : false
---

{% assign product_docs = site.wiki | sort: 'updated' | reverse %}
<ul class="post-list">
{% for doc in product_docs %}{% if doc.public != false and doc.url contains '/wiki/products/' and doc.title != 'Products' %}
    <li>
        <div>
            <a class="post-link" href="{{ doc.url }}">
                <div class="post-meta">{{ doc.updated | date: "%Y.%m.%d" }} {% if doc.favorite %}<span style="color: #FFD700;">★</span>{% endif %} {{ doc.title }}</div>
                <div class="post-excerpt">{{ doc.summary }}</div>
            </a>
        </div>
    </li>
{% endif %}{% endfor %}
</ul>
