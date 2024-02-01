---
layout  : wiki
title   : Elegant Object
summary : 
date    : 2024-01-29 15:02:32 +0900
updated : 2024-01-29 15:12:24 +0900
tag     : oop
toc     : true
comment : true
public  : true
parent  : [[/oop]]
latex   : true
---
* TOC
{:toc}

# Elegant Object

> "Step one in the transformation of a successful procedural developer into a successful object developer is a lobotomy" - David West

- [Seven Virtues of a Good Object](https://www.yegor256.com/2014/11/20/seven-virtues-of-good-object.html)

이 책의 목표는 코드의 __유지보수성(maintainability)__ 을 향상시키는 데 중점을 둔다. 유지보수성은 코드를 이해하는데 걸리는 시간으로 측정할 수 있다.
객체지향에서는 객체의 역할을 이해할 수 있어야 한다. 코드의 품질이 향상된 다는 것은 대부분의 프로젝트에서 비용 절감을 의미한다. 이것이 핵심이다.

## Birth

- 객체는 자신의 __가시성 범위(scope of visibility)__ 내에서 살아간다.
- 클래스는 객체의 __팩토리(factory)__ 이다. 일반적으로 클래스가 객체를 __인스턴스화(instantiate)__ 한다고 표현한다.
- Java, Kotlin 에서의 팩토리 패턴은 new 연산자를 실행하기 전에 부가적인 로직을 작성할 수 있다.
- 클래스는 객체의 __warehouse__ 로 바라보는 것이 좋다.

### Class Name

- 잘 못된 방법은 객체들이 무엇을 하고 있는지 살펴본 후 기능(functionality)에 기반해서 이름을 짓는 방법이다. (잘 못된 방식이지만 인기가 많은 방식)
- 무엇을 하는지(what he does)가 아니라 __무엇인지(what he is)__ 에 기반해서 지어야 한다.

```kotlin
class CashFormatter(
    val dollars: Int
) {
    fun format() {
        return String.format("$ %d", this.dollars)
    }
}
```

클래스 이름이 `-er` 로 끝난다면, 이 클래스의 인스턴스는 실제로는 객체가 아니라 어떤 데이터를 다루는 절차들의 집합이다.
이것은 과거에 C, COBOL, Basic 등의 언어를 사용하다 전향한 많은 객체지향 개발자들로부터 물려받은 절차적인 사고 방식이다.

오직 소수만으로 구성된 리스트를 얻는 것이 목적이면 PrimeNumbers 로 지어야 한다. (Primer, PrimeFinder, PrimeChooser .. 등으로 지으면 안된다.)

### There Can Be Only One Primary Constructor

[There Can Be Only One Primary Constructor](https://www.yegor256.com/2015/05/28/one-primary-constructor.html):

I suggest classifying class constructors in OOP as __primary__ and __secondary__. A primary constructor is the one that constructs an object and encapsulates other objects inside it. A secondary one is simply a preparation step before calling a primary constructor and is not really a constructor but rather an introductory layer in front of a real constructing mechanism.

My definition of a secondary constructor is simple: It dosen’t do anything besides calling a primary constructor, through this(..).

이 원칙의 핵심은 __중복 코드를 방지하고 설계를 더 간결하게 만들기 때문에 유지보수성이 향상된다는 점__ 이다. 
이 원칙을 다르게 표현하면 __내부 프로퍼티는 오직 한 곳에서만 초기화해야 한다는 것__ 이다.

메서드 개수가 많아지면 [Single Responsibility Principle](https://baekjungho.github.io/wiki/oop/oop-solid/) 를 위반하게 될 수 있다. 메서드 개수가 많아지면 클래스를 사용하기 더 어려워진다. 반면 ctor(constructor) 가 많아지면 유연성이 향상된다.

생성자 파라미터가 많은 경우 바인딩 하는 과정에서 개발자가 실수 할 수도 있다. 이러한 점을 Builder 패턴을 이용해서 해결하곤 하는데, Kotlin 의 경우에는 Builder 패턴을 사용할 이유가 없다.
따라서, Kotlin 이 Java 보다 더 나은 유연성을 가지고 있다고 볼 수 있다.

### Constructors Must Be Code-Free

[Constructors Must Be Code-Free](https://www.yegor256.com/2015/05/07/ctors-must-be-code-free.html):

ctor 에 코드가 없어야(code-free) 하는 순수한 기술적인 이유는 __성능 최적화__ 가 더 쉽고, 코드의 실행 속도가 더 빨라진다. 다른 이유는 __일관성(uniformity)__ 이라는
측면 때문이다. 클래스가 미래에 어떤 일이 일어날 지, 다음 리팩토링 시점에 얼마나 많은 변경이 더해질지 알 지 못한다.

__on demand(요청이 왔을 때)__ 파싱을 하도록 하면, 클래스의 사용자들이 파싱 시점을 자유롭게 결정할 수 있다.

```java
class StringAsInteger implements Number {
    private int num;

    public StringAsInteger(String txt) {
        // Bad Case -> intValue 를 호출할 필요가 없음에도 CPU 는 파싱을 위해 시간을 소모한다.
        this.num = Integer.parseInt(txt);
    }

    public int intValue() {
        // Integer.parsing 이 여기에 위치해야 성능 최적화가 된다.
        return this.num;
    }
}
```

파싱이 여러 번 수행되지 않도록 __decorator__ 를 추가할 수 있다.

```java
class CachedNumber implements Number {
    private Number origin;
    private Collection<Integer> cached = new ArrayList<>(1);
    public CachedNumber(Number num) {
        this.origin = num;
    }
    public int intValue() {
        if (This.cached.isEmpty()) {
            this.cached.add(this.origin(intValue()));
        }
        return this.cached.get(0);
    }
}
```


## References

- Elegant Object / Yegor Bugayenko 