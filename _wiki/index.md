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
* [[/kotlin/kotlin-source-machine]]
* [[/kotlin/kotlin-compiler-k2]]
* [[/kotlin/kotlin-coroutines]]
* [[/kotlin/kotlin-simplesyntax]]
* [[/kotlin/kotlin-receiver-lambda]]

## java

* [[/java/execution-java]]
* [[/java/java-memoryleak]]

## spring

* [[/spring/spring-pojo]]
* [[/spring/spring-concurrency]]
* [[/spring/spring-concurrency-resolve]]
* [[/spring/spring-converter]]
* [[/spring/spring-psa]]
* [[/spring/spring-di]]
* [[/spring/spring-logging]]
* [[/spring/spring-async]]
* [[/spring/spring-data]]
* [[/spring/spring-sqlinjection]]
* [[/spring/spring-jdbc]]
* [[/spring/spring-graceful-shutdown]]

## msa

* [[/msa/msa-business-agility]]
* [[/msa/msa-iac]]
* [[/msa/msa-polyglot]]
* [[/msa/msa-eventual-consistency]]
* [[/msa/msa-fault-tolerance]]
* [[/msa/msa-reactive-manifesto]]

## infra

* [[/infra/infra-cloud]]
* [[/infra/infra-network-segmentation]]
* [[/infra/infra-collision-domain]]
* [[/infra/infra-vpc-subnet]]
* [[/infra/infra-docker]]
* [[/infra/infra-bastion]]
* [[/infra/infra-reverse-proxy]]
* [[/infra/infra-bashrc]]
* [[/infra/infra-gateway]]
* [[/infra/infra-customer]]
* [[/infra/infra-webpagetest]]
* [[/infra/infra-web-performance-budget]]
* [[/infra/infra-load-test]]
* [[/infra/infra-serverless]]
* [[/infra/infra-availability]]
* [[/infra/infra-elasticbeanstalk]]
* [[/infra/infra-security-group]]
* [[/infra/infra-incident]]
* [[/infra/infra-awsec2ssh]]
* [[/infra/infra-ip]]

## git

* [[/git/git-basic]]
* [[/git/git-internal]]
* [[/git/git-commands]]

## auth

* [[/auth/auth-hmac]]
* [[/auth/auth-jwt]]

## design pattern

* [[/designpattern/designpattern-singleton]]
* [[/designpattern/designpattern-template-method]]
* [[/designpattern/designpattern-strategy]]

## ddd

* [[/ddd/ddd-quotes]]
* [[/ddd/ddd-aggregate]]
* [[/ddd/ddd-layered-architectures]]
* [[/ddd/ddd-service]]
* [[/ddd/ddd-factory]]

## Methodology

* [[/driven/test-methodology]]
* [[/driven/extreme-programming]]
* [[/driven/oop-oo]]
* [[/driven/driven-use]]
* [[/driven/development-design-docs]]

## Database

* [[/database/mysql-index]]
* [[/database/hikaricp-concepts]]
* [[/database/query-index]]
* [[/database/database-surrogatekey]]

## Clean Code

* [[/cleancode/cleancode-guide]]
* [[/cleancode/cleancode-good-implementation]]

## Network

* [[/network/network-layeredarchitectures]]
* [[/network/network-polling]]
* [[/network/network-tcp]]
* [[/network/network-tcp-performance]]

## Http

* [[/http/http-localstorage]]
* [[/http/http-famous-api]]
* [[/http/http-headers]]
* [[/http/http-api-spec]]

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
* [[/etc/regular-expression]]


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

