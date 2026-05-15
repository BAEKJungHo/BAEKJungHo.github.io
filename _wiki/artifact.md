---
layout  : wiki
title   : Artifact
summary :
date    : 2022-01-01 18:30:40 +0900
updated : 2022-01-01 20:55:09 +0900
tag     : artifact
toc     : true
public  : true
parent  : [[/index]]
latex   : false
---

{% assign artifact_docs = site.wiki | sort: 'updated' | reverse %}
<ul class="post-list">
{% for doc in artifact_docs %}{% if doc.public != false and doc.url contains '/wiki/artifact/' and doc.title != 'Artifact' %}
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
