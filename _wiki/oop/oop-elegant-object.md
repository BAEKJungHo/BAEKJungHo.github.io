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
// Bad Case
class CashFormatter(
    val dollars: Int
) {
    fun format() {
        return String.format("$ %d", this.dollars)
    }
}

// Good Case
class Cash(
    val dollars: Int
) {
    fun usd(): String = String.format("$ %d", this.dollars)
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

## Education

### Encapsulate Less

복잡성이 높으면 유지보수성이 저하된다. 4개 또는 그 이하의 객체를 캡슐화 할 것을 권장한다.
클래스 내부에 캡슐화된 모든 객체, 필드들이 객체의 식별자를 구성하는 요소이다. 객체의 식별자는 기본적으로 세계 안에서 객체가 위치하는 좌표이다.
책에서 4개로 제한한 이유는 4개 이상의 좌표는 __직관에 위배__ 되기 때문이라고 말한다.

### How Much Your Objects Encapsulate?

[How Much Your Objects Encapsulate?](https://www.yegor256.com/2014/12/15/how-much-your-objects-encapsulate.html):

최소한 뭔가는 캡슐화하라는 원칙이다.

```java
class Year {
    int read() {
        return System.currentTImeMillis() / (1000 * 60 * 60 * 24 * 30 * 12) - 1970;
    }
}
```

Year 클래스의 인스턴스는 어떤 것도 캡슐화 하지 않았기 때문에 이 클래스의 모든 객체들은 동일하다는 사실을 알 수 없다.

```java
class Year {
    private Number num;
    Year(final Millis msec) {
        this.num = msec.div(1000.mul(60).mul(60).mul(24).mul(30).mul(12)).min(1970);
    }
    int read() {
        return this.num.intValue();
    }
}
```

### Always Use The Interface

[Seven Virtues of a Good Object](https://www.yegor256.com/2014/11/20/seven-virtues-of-good-object.html):

항상 인터페이스를 사용하라는 원칙이다.

객체들은 서로를 필요로 하기 때문에 __결합(coupled)__ 된다. 객체들의 수가 수십 개를 넘어가면서부터 객체 사이의 강한 결합도(tight coupling)가 심각한 문제로 떠오른다.
결합도는 유지보수성에 영향을 미친다. __유지보수성(maintainability)__ 이 가장 중요하다.

기술적인 관점에서 객체 분리란 상호작용하는 다른 객체를 수정하지 않고도 해당 객체를 수정할 수 있도록 만든다는 것을 의미한다. 이를 가능하게 하는 가장 훌륭한 도구는
__인터페이스(interface)__ 이다.

```kotlin
interface Cash {
    fun multiply(factor: Float): Cash
}
```

인터페이스는 __계약(contract)__ 이다. 객체가 계약을 준수하도록 해야 한다.

철학적인 관점에서 클래스가 존재하는 이유는 다른 누군가가 클래스의 서비스를 필요로 하기 때문이다. 서비스는 계약이자 인터페이스이기 때문에 클래스가 제공하는 서비스는 어딘가에 문서화되어야 한다.
게다가 서비스 제공자들은 서로 경쟁한다. 다시 말해서 동일한 인터페이스를 구현하는 여러 클래스들이 존재한다는 뜻이다.
그리고 각각의 경재자는 서로 다른 경쟁자를 쉽게 대체할 수 있어야 한다. 이것이 __느슨한 결합도(loose coupling)__ 의 의미이다.

물론 인터페이스를 통해 결합이 된다고 생각할 수 있지만, 이러한 결합은 항상 존재하며 제거할 수 있는 방법이 없다. 결합 자체가 나쁜건 아니다.
시스템의 다른 부분이 변경 사항을 알지 못한 채 한 부분을 실수로 변경하더라도 시스템이 무너지지 않게 유지할 수 있다.

### Method Naming

- builder 이름은 명사로 조정자(manipulator)의 이름은 동사로 짓는다.
- 객체로 추상화한 실세계 엔티티를 수정하는 메서드를 조정자(manipulator) 라고 부른다.
  - void save(String content)
  - void remove(String item)
- 객체는 자신의 의무를 수행하는 방법을 알고 있고 존중 받기를 원하는 살아있는 유기체이다.
- boolean 값을 결과로 반환하는 경우에 접두사 'is' 는 중복이기 때문에 메서드의 이름에는 포함시키지 않지만 메서드를 읽을 때는 일시적으로 앞에 붙여 자연스럽게 들리도록 해야 한다.
  - boolean empty() // is empty
  - boolean readable() // is readable

### Contractual Coupling

계약을 통한 결합(contractual coupling)은 언제라도 분리가 가능하기 때문에 유지보수성을 저하시키지 않는다.

```java
public class Constants {
    public static final String EOL = "\r\n";
}
```

위 상수를 사용하는 두 클래스가 있는 경우 해당 클래스들은 같은 객체에 의존하게 되고, 이 의존성은 __하드 코딩__ 되어있다.
따라서 결합도는 증가하고 응집도는 낮아지게 된다. 즉, 퍼블릭 상수를 사용하면 객체의 응집도가 낮아진다.

응집도를 높이기 위해서는 데이터가 아닌 __기능을 공유__ 하는 새로운 클래스를 만들어야 한다.

```java
class EOLString {
    private final String origin;
    EOLString(Strings src) {
        this.origin = src;
    }
    @Override
    String toString() {
        return String.format("%s\r\n", origin);
    }
}
```

그리고 아래와 같이 사용할 수 있다.

```java
class Records {
    void write(Writer out) {
        for (Record rec: this.all) {
            out.write(new EOLString(rec.toString()));
        }
    }
}
```

위 처럼 __계약을 통한 결합(contractual coupling)__ 은 언제든 분리가 가능하기 때문에 유지보수성을 저하시키지 않는다.

그러면 퍼블릭 상수마다 계약의 의미를 캡슐화하는 새로운 클래스를 만들어야 한다는 것인가?
- 맞다.
- 중복 코드를 가진 마이크로 클래스들에 의해 코드가 더 장황해지고 오염되지 않을까? -> 아니다.
- __애플리케이션을 구성하는 클래스의 수가 많을 수록 설계가 더 좋아지고 유지보수하기도 쉬워진다.__

```java
// OOP 정신에 어긋나는 코드
String body1 = new HttpRequest()
        .method(HttpMethod.POST)
        .fetch();
// TO-DO
String body2 = new PostRequest(new HttpRequest()).fetch();
```

### Objects Should Be Immutable

[Objects Should Be Immutable](https://www.yegor256.com/2014/06/09/objects-should-be-immutable.html):

All classes should be immutable in a perfect object-oriented world.

This is an incomplete list of arguments in favor of immutability:
- immutable objects are simpler to construct, test, and use
- truly immutable objects are always thread-safe
- they help to avoid [temporal coupling](https://www.yegor256.com/2015/12/08/temporal-coupling-between-method-calls.html)
- their usage is side-effect free (no defensive copies)
- identity mutability problem is avoided
- they always have [failure atomicity](https://stackoverflow.com/questions/29842845/what-is-failure-atomicity-used-by-j-bloch-and-how-its-beneficial-in-terms-of-i)
- they are much easier to cache
- they prevent NULL references, [which are bad](https://www.yegor256.com/2014/05/13/why-null-is-bad.html)

### Smart

__Smart class__:

```java
interface Exchange {
    float rate(String source, String target);
    final class Smart {
        private final Exchange origin;
        public float toUsd(String source) {
            return this.origin.rate(source, "USD");
        }
    }
}
```

이 스마트 클래스는 아주 명확하고 공통적인 작업을 수행하는 많은 메서드들을 포함할 수 있다. 스마트 클래스를 인터페이스와 함께 제공해야 하는 또 다른 이유는
인터페이스를 구현하는 서로 다른 클래스 안에 동일한 기능을 반복해서 구현하고 싶지 않기 때문이다.

__Decorator__:

```java
interface Exchange { 
    float rate(String source, String target);
    final class Fast implements Exchange {
        private final Exchange origin;
        @Override 
        public float rate(String source, String target) {
            final float rate;
            if (source.equals(target)) {
                rate = 1.0.f;
            } else {
                rate = this.origin.rate(source, target);
            }
            return rate;
        }
        public float toUsd(String source) {
            return this.origin.rate(source, "USD");
        }
    }
}
```

Exchange.Fast 는 데코레이터인 동시에 스마크 클래스이다. 데코레이터가 스마트 클래스와 다른점은 스마트 클래스가 객체에 새로운 메서드를 추가하는데 비해 데코레이터는 이미 존재하는 메서드를 좀 더 강력하게 만든다.

## References

- Elegant Object / Yegor Bugayenko 