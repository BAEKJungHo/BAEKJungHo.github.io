---
layout  : wiki
title   : CodeCoverage
summary : 
date    : 2024-07-09 10:25:32 +0900
updated : 2024-07-09 10:29:24 +0900
tag     : test coverage jacoco
toc     : true
comment : true
public  : true
parent  : [[/test]]
latex   : true
---
* TOC
{:toc}

## CodeCoverage

소스 코드의 구조를 사용하여 테스트를 도출하는 것을 __구조적 테스트(StructureBasedTest)__ 라고 한다.
구조적 테스트를 사용하기 위해서는 __코드 커버리지 기준__ 을 이해해야 한다. 대표적인 코드 커버리지 도구로는 _[Jacoco](https://www.baeldung.com/jacoco)_ 가 있다.

__Palindrome__:

```kotlin
class Palindrome {
    fun isPalindrome(inputString: String): Boolean {
        if (inputString.isEmpty()) {
            return true
        } else {
            val firstChar = inputString[0]
            val lastChar = inputString[inputString.length - 1]
            val mid = inputString.substring(1, inputString.length - 1)
            return (firstChar == lastChar) && isPalindrome(mid)
        }
    }
}
```

__Test__:

```kotlin
internal class PalindromeTest : StringSpec({
    "whenEmptyString_thenAccept" {
        val palindromeTester = Palindrome()
        palindromeTester.isPalindrome("").shouldBe(true)

    }
})
```

위 테스트의 커버리지를 측정하기 위해 _[JaCoCo Plugin](https://docs.gradle.org/current/userguide/jacoco_plugin.html)_ 을 설정해야 한다.

__build.gradle.kt__:

```
plugins {
    kotlin("jvm") version "1.9.22"
    id("jacoco")
}

group = "org.example"
version = "1.0-SNAPSHOT"

repositories {
    mavenCentral()
}

jacoco {
    toolVersion = "0.8.12" // 사용하고자 하는 JaCoCo 버전
}

dependencies {
    implementation("org.apache.maven.reporting:maven-reporting-api:4.0.0-M12")
    implementation("org.jacoco:jacoco-maven-plugin:0.8.12")
    testImplementation("org.jetbrains.kotlin:kotlin-test")
    testImplementation("io.kotest:kotest-runner-junit5:5.9.1")
    testImplementation("net.jqwik:jqwik:1.6.3")
    testImplementation("io.kotest:kotest-property:5.9.1")
}

tasks.test {
    useJUnitPlatform() // JUnit 플랫폼 사용
    finalizedBy(tasks.jacocoTestReport) // 테스트가 완료된 후에 jacocoTestReport 태스크 실행
}

tasks.jacocoTestReport {
    dependsOn(tasks.test) // 테스트가 완료된 후에 실행
    reports {
        xml.required.set(true) // XML 리포트 생성
        csv.required.set(false) // CSV 리포트 생성하지 않음
        html.outputLocation.set(file("${buildDir}/reports/jacoco")) // HTML 리포트 출력 위치 설정
    }
}

kotlin {
    jvmToolchain(17)
}
```

테스트를 실행하고 리포트 출력 위치로 가서 index.html 파일을 열면 아래와 같이 측정 결과를 볼 수 있다.

![](/resource/wiki/test-coverage/jacoco-1.png)

그리고 아래와 같은 보고서를 볼 수 있다.

![](/resource/wiki/test-coverage/jacoco-2.png)

- 빨간색 다이아몬드는 테스트 단계 동안 아무런 분기도 실행되지 않았음을 의미한다.
- 노란색 다이아몬드는 코드가 부분적으로 실행되었음을 의미한다. (일부 코드는 실행 X)
- 녹색 다이아몬드는 테스트 동안 모든 부분이 실행되었음을 의미한다.

__Jacoco metrics__:

- __Lines coverage__ reflects the amount of code that has been exercised based on the number of Java byte code instructions called by the tests.
- __Branches coverage__ shows the percent of exercised branches in the code, typically related to if/else and switch statements.
- __Cyclomatic complexity__ reflects the complexity of code by giving the number of paths needed to cover all the possible paths in a code through linear combination.

코드 커버리를 측정하여, 부족한 부분을 파악한 후에 어떤 테스트를 수행 해야할 지 판단하여 테스트를 작성하는 방법을 __구조적 테스트__ 라고 한다.

```kotlin
    "whenNearPalindrom_thenReject" {
        val palindromeTester = Palindrome()
        palindromeTester.isPalindrome("neon").shouldBe(false)
    }
```

### Flow

구조적 테스트는 _[SpecificationBasedTest](https://baekjungho.github.io/wiki/test/test-specification-based-test/_ 와 같이 사용하는 것이 효과적이다.

__StructureBasedTest Flow__:

1. 명세 기반 테스트를 수행
2. 구현 사항을 읽고, 개발자의 주요 결정사항 이해
3. 작성한 테스트 케이스를 코드 커버리지 도구로 수행
4. 테스트가 수행되지 않은 코드에 대해 __이해__ 및 추가 작성 여부를 __결정__
5. 테스트가 필요하다면 놓친 코드 조각을 수행하는 __자동화된 테스트 케이스를 구현__

이 Flow 에서 가장 중요한 점은 __구조적 테스트는 이전의 명세 기반 테스트로 고안한 테스트 스위트를 보강__ 한다는 것이다.

### Metrics and Coverage Relations

A coverage metric is expressed in terms of a ratio of the code construct items executed or evaluated at least once, to the total number of code construct items. This is usually expressed as a percentage.

![](/resource/wiki/test-coverage/coverage-percent.png)

__Test Coverage and Requirements Coverage__:

![](/resource/wiki/test-coverage/coverage-1.png)

__[Coverage Relations](https://itwiki.kr/w/%EC%86%8C%ED%94%84%ED%8A%B8%EC%9B%A8%EC%96%B4_%ED%85%8C%EC%8A%A4%ED%8A%B8_%EB%B3%80%EA%B2%BD_%EC%A1%B0%EA%B1%B4/%EA%B2%B0%EC%A0%95_%EC%BB%A4%EB%B2%84%EC%A7%80%EB%A6%AC)__:

![](/resource/wiki/test-coverage/coverage-relations.png)

분기 커버리지는 라인 커버지리를 포함한다. 즉, 100% 의 분기 커버리지는 항상 100% 의 라인 커버리지를 의미한다.
경로 커버리지는 __모든__ 실행 경로를 수행한다. 가장 강력한 기준이지만, 이것을 달성하기 위해서는 많은 비용이 든다.
경로 커버리지는 반복문이 있는 경우 복잡해진다.

복잡하고 긴 if 문에 대해 무엇을 할 수 있을까? 이 질문에 대한 좋은 대답은 수정된 __조건/의사결정 커버리지(_[Modified Condition/Decision Condition](https://en.wikipedia.org/wiki/Modified_condition/decision_coverage)_)__ 를 적용하는 것이다.
MC/DC 의 기준은 경로 커버리지와 마찬가지로 조건의 조합을 살펴본다. 그러나 가능한 모든 조합 대신, 테스트가 필요한 __중요한__ 조합을 찾아낸다.
각 매개변수의 가능한 모든 조건은 적어도 한 번은 결과에 영향을 주어야 한다.

### 100% Coverage Meant

누군가 '코드 줄 커버리지 100% 를 달성 했다고 한다면', 적어도 한 가지 테스트는 100% 의 코드 줄을 수행 했다는 의미다.

- [토스 SLASH 21 - 테스트 커버리지 100%](https://www.youtube.com/watch?v=jdlBu2vFv58&t=1s)

모든 코드는 다른 방식으로 증명될 때 까지 수행되어야 한다. 커버리지를 100% 달성해야 한다는 생각으로 시작하고, 그러고 나서 특정 코드는 테스트를 수행할 필요가 없는 경우에 예외를 둔다.

### Mutation testing

돌연변이 테스트(_[Mutation testing](https://en.wikipedia.org/wiki/Mutation_testing_)는 존재하는 코드에 일부러 버그를 주입해서 테스트 스위트가 깨지는지 검사하는 것을 의미한다.
만약, 코드에 버그가 있는데도 모든 테스트가 초록색이라면 개선할 부분을 찾은 것이다.

돌연변이(mutation)를 수행했을 때 테스트 스위트가 깨지면 테스트 스위트가 돌연변이를 __제거(eliminate)__ 한다고 한다. 만약 깨지지 않으면 돌연변이가 __살아남았다(alive)__ 라고 한다.

대표적인 라이브러리로 [Pitest](https://pitest.org/) 가 있다.

돌연변이 테스트는 테스트 스위트가 충분히 탄탄하다는 것을 보장하며, 가능한 많은 버그를 잡을 수 있다.

## Links

- [What is meant by Structural Code Coverage?](https://www.qa-systems.com/blog/what-is-meant-by-structural-code-coverage/)
- [Coverage criteria](https://en.wikipedia.org/wiki/Code_coverage)

## References

- Effective Software Testing: A developer's guide / Mauricio Aniche