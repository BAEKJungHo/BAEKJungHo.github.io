---
layout  : wiki
title   : Polymorphism
summary : 
date    : 2024-03-28 15:02:32 +0900
updated : 2024-03-28 15:12:24 +0900
tag     : oop
toc     : true
comment : true
public  : true
parent  : [[/oop]]
latex   : true
---
* TOC
{:toc}

## Polymorphism

__[Polymorphism](https://en.wikipedia.org/wiki/Polymorphism_(computer_science))__ is the provision of a single __interface__ to entities of different types.

__[Kinds of Polymorphism](http://lucacardelli.name/Papers/OnUnderstanding.A4.pdf)__:

![](/resource/wiki/oop-polymporphism/varieties-of-polymorphism.png)

### Ad hoc Polymorphism

[Ad hoc polymorphism](https://en.wikipedia.org/wiki/Ad_hoc_polymorphism) 은 Java 의 overloading 이라고 생각하면 된다. 

### Parametric Polymorphism

In programming languages and type theory, parametric polymorphism is a way to make a language more expressive, while still maintaining full static type-safety.

[Parametric Polymorphism](https://en.wikipedia.org/wiki/Parametric_polymorphism) 은 Java 의 __[Generic](http://www.angelikalanger.com/GenericsFAQ/JavaGenericsFAQ.html)__ 이라고 생각하면 된다.

```java
Collection<Animal> animals = new ArrayList<Animal>();
```

### Inclusion Polymorphism

Inclusion Polymorphism, also called as Subtyping Inclusion Polymorphism. 

참조를 통해 Derived Class(sub class) 를 사용하는 기법이다.

```java
abstract class Image {
    public Image() {
    }
 
    abstract void display();
}
 
class Jpg extends Image {
    public Jpg() {
    }
 
    @Override
    void display() {
        System.out.println("JPG Image File");
    }
}
 
class Png extends Image {
    public Png() {
    }
 
    @Override
    void display() {
        System.out.println("PNG Image File");
    }
}
 
public class Main {
    public static void main(String[] args) {
        Image img;
        Jpg jg = new Jpg();
        Png pg = new Png();
 
        // stores the reference of Jpg
        img = jg;
 
        // invoking display() method of Jpg
        img.display();
 
        // stores the reference of Png
        img = pg;
 
        // invoking display() method of Png
        img.display();
    }
}
```

### Coercion Polymorphism

Coercion Polymorphism, also called as Casting Coercion Polymorphism occurs when an object or primitive is cast into some other type.

User Defined Data type 을 Fundamental Data type 으로 변경하는 것을 의미한다.

```java
class IntClass {
    private int num;
 
    public IntClass(int a) {
        num = a;
    }
 
    public int intValue() {
        return num;
    } // conversion from User-defined type to Basic type
}
 
class Main {
    public static void show(int x) {
        System.out.println(x);
    }
 
    public static void main(String[] args) {
        IntClass i = new IntClass(100);
        show(746);
        show(i.intValue());
    }
}
```

### The Nature of Polymorphism

- 다형성으로 인터페이스를 구현한 객체를 실행 시점에서 유연하게 변경할 수 있다.
- 클라이언트를 변경하지 않고 서버 기능을 유연하게 변경할 수 있다.

Spring Framework 에서 __[Inversion of Control & Dependency Injection](https://baekjungho.github.io/wiki/spring/spring-ioc/)__ 은 다형성을 활용해서 역할과 구현을 편리하게 다룰 수 있도록 해준다.
클라이언트 코드 변경 없이 쉽게 기능 확장이 가능한 이유가 Spring Framework 의 IoC/DI 때문이다.

### Dependency Inversion Principle

[Dependency Inversion Principle](https://baekjungho.github.io/wiki/oop/oop-solid/) 은 추상화에 의존해야지 구체화에 의존하면 안된다는 원칙이다.
즉, 역할에 의존해야지 구현에 의존하지 말라는 원칙이다.

### Polymorphic Types

- [Smart Home Control Command APIs Designs with Sealed Interface](https://baekjungho.github.io/wiki/realworld/realworld-smarthome-control-command/)
- [kotlinx.serialization Polymorphism](https://github.com/Kotlin/kotlinx.serialization/blob/master/docs/polymorphism.md)
- [Deduction-Based Polymorphism in Jackson 2.12](https://www.baeldung.com/jackson-deduction-based-polymorphism)
- [Jackson 2.12: Deduction-based Polymorphism](https://github.com/FasterXML/jackson/wiki/Jackson-Release-2.12)

## Links

- [Ad-hoc, Inclusion, Parametric & Coercion Polymorphisms](https://www.geeksforgeeks.org/ad-hoc-inclusion-parametric-coercion-polymorphisms/)
- [Java polymorphism and its types](https://www.infoworld.com/article/3033445/java-101-polymorphism-in-java.html)