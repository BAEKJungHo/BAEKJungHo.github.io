---
layout  : wiki
title   : JavaBeans and Property
summary : JavaBeans 와 Kotlin, Java 에서의 Property
date    : 2022-10-07 19:54:32 +0900
updated : 2022-10-07 20:15:24 +0900
tag     : spring java kotlin oop
toc     : true
comment : true
public  : true
parent  : [[/kotlin]]
latex   : true
---
* TOC
{:toc}

## JavaBeans

### Conventions

- The class must have a public default constructor (no-argument). This allows easy instantiation within editing and activation frameworks.
- The class properties must be accessible using get, set, is (used for boolean properties instead of get) and other methods (so-called accessor methods and mutator methods), following a standard naming convention. This allows easy automated inspection and updating of bean state within frameworks, many of which include custom editors for various types of properties. Setters must receive only one argument.
- The class should be serializable. It allows applications and frameworks to reliably save, store, and restore the bean's state in a fashion independent of the VM and of the platform.

### Bean

The 'beans' of JavaBeans are classes that encapsulate one or more objects into a single standardized object (the bean). This standardization allows the beans to be handled in a more generic fashion, allowing easier code reuse and introspection.

> Bean is Reusable Objects

```java
package beans;

/**
 * Class <code>PersonBean</code>.
 */
public class PersonBean implements java.io.Serializable {

    private String name;

    private boolean deceased;
    static final long serialVersionUID = 1L;

    /** No-arg constructor (takes no arguments). */
    public PersonBean() {
    }

    /**
     * Property <code>name</code> (note capitalization) readable/writable.
     */
    public String getName() {
        return this.name;
    }

    /**
     * Setter for property <code>name</code>.
     * @param name
     */
    public void setName(final String name) {
        this.name = name;
    }

    /**
     * Getter for property "deceased"
     * Different syntax for a boolean field (is vs. get)
     */
    public boolean isDeceased() {
        return this.deceased;
    }

    /**
     * Setter for property <code>deceased</code>.
     * @param deceased
     */
    public void setDeceased(final boolean deceased) {
        this.deceased = deceased;
    }
}
```

Implementing Serializable is not mandatory but is very useful if you'd like to persist or transfer Javabeans outside Java's memory, e.g. in harddisk or over network.

### serialVersionUID

> If a [serializable](https://docs.oracle.com/en/java/javase/11/docs/api/java.base/java/io/Serializable.html) class does not explicitly declare a serialVersionUID, then the serialization runtime will calculate a default serialVersionUID value for that class based on various aspects of the class, as described in the Java(TM) Object Serialization Specification. However, it is strongly recommended that all serializable classes explicitly declare serialVersionUID values, since the default serialVersionUID computation is highly sensitive to class details that may vary depending on compiler implementations, and can thus result in unexpected InvalidClassExceptions during deserialization. Therefore, to guarantee a consistent serialVersionUID value across different java compiler implementations, a serializable class must declare an explicit serialVersionUID value. It is also strongly advised that explicit serialVersionUID declarations use the private modifier where possible, since such declarations apply only to the immediately declaring class--serialVersionUID fields are not useful as inherited members. Array classes cannot declare an explicit serialVersionUID, so they always have the default computed value, but the requirement for matching serialVersionUID values is waived for array classes.

__If you don't explicitly specify serialVersionUID, a value is generated automatically - but that's brittle because it's compiler implementation dependent.__

### Places where JavaBeans are used

They often just represents real world data

- __ Just a few reasons why JavaBeans should be used__
  - They serialize nicely. 
  - Can be instantiated using reflection. 
  - Can otherwise be controlled using reflection very easily. 
  - Good for encapsulating actual data from business code. 
  - Common conventions mean anyone can use your beans AND YOU CAN USE EVERYONE ELSE'S BEANS without any kind of documentation/manual easily and in consistent manner. 
  - Very close to [POJOs](https://baekjungho.github.io/wiki/spring/spring-pojo/) which actually means even more interoperability between distinct parts of the system.

## Property

- 프로퍼티란 빈이 관리하는 데이터를 의미한다.
- 프로퍼티 값을 구하는 메서드는 get 으로 시작한다.
- 프로퍼티 값을 변경하는 메서드는 set 으로 시작한다.
- get 과 set 뒤에는 프로퍼티의 이름 첫 글자를 대문자로 변경한다.
- set 메서드는 1개의 파라미터를 갖는다.

```java
public class Person {
    private String name; // 멤버 변수 or 필드라 부른다.
    
    private getPersonName() {
        return name;
    }
}
```

위 코드에서 Property 이름은 personName 이다.

### Why property are important

- Jackson 과 같은 대부분의 라이브러리들은 Deserialize 시에 Property 를 사용하여 값을 바인딩 시킨다. 
  - Deserialize 시 Default Constructor 도 필요함 
  - [Deserialize Data Class](https://baekjungho.github.io/wiki/kotlin/kotlin-deserialize-dataclass/)

## Kotlin Property

```kotlin
class Person {
    // Properties
    var firstName: String = ""
    var familyName: String = ""
    var age: Int = 0

    // Functions
    fun fullName() = "$firstName $familyName"
}
```

코틀린은 var 로 변수를 선언한 경우 getter/setter 가 자동 생성되기 때문에 class 안에 var 변수는 property 라고 보면된다.

### Receiver

프로퍼티는 어떤 클래스의 구체적인 인스턴스와 엮여 있기 때문에 이 인스턴스를 식으로 지정해야 한다.

```kotlin
// p is Instance
fun showFullName(p: Person) = println(p.fullName())
```

이런 인스턴스(위 코드에서는 p)를 수신 객체(receiver)라고 부르고, 수신 객체는 프로퍼티에 접근할 때 사용해야하는 객체를 지정한다. 클래스 내부에서는 this 로 수신 객체를 참조할 수 있다.

프로퍼티가 사용하는 내부 필드는 항상 캡슐화돼 있고 클래스 정의 밖에서는 이 내부 필드에 접근할 수 없다.

### Immutable Property

클래스 프로퍼티는 지역 변수와 마찬가지로 불변일 수 있다. 하지만 이런 경우 초기화를 하는 동안 프로퍼티 값을 지정할 수단이 있어야 한다.

```kotlin
class Person {
    val firstName = "John"
}
```

- __Decompile__

```java
public final class Person {
   @NotNull
   private final String name = "Jungho";

   @NotNull
   public final String getName() {
      return this.name;
   }
}
```

### Initialize Property by Constructor

생성자를 사용하여 프로퍼티를 초기화 할 수 있다.

```kotlin
class Person(firstName: String, familyName: String) {
    val fullName = "$firstName $familyName"
    
    // init 은 클래스안에 여러개가 존재할 수 있으며, 프로퍼티 초기화 다음으로 실행된다.
    /**
     * init 블록 안에서도 초기화를 시킬 수 있다.
     * 
     * val fullName: String
     * init {
     *   fullName = "BAEKJungHo"
     * }
     */
    init {
        println("Created new Person instance: $fullName")
    }
}
```

- __Decompile__

```java
public final class Person {
   @NotNull
   private final String fullName;

   @NotNull
   public final String getFullName() {
      return this.fullName;
   }

   public Person(@NotNull String firstName, @NotNull String familyName) {
      Intrinsics.checkNotNullParameter(firstName, "firstName");
      Intrinsics.checkNotNullParameter(familyName, "familyName");
      super();
      this.fullName = firstName + ' ' + familyName;
      String var3 = "Created new Person instance: " + this.fullName;
      System.out.println(var3);
   }
}
```

디컴파일 결과를 보면 프로퍼티가 1개 뿐이라는 것을 알 수 있다. 즉, 코틀린에서 class 나 data class 의 생성자에 있는 파라미터들은 프로퍼티가 아니라는 것이다.(val, var 키워드가 붙은 경우는 프로퍼티가 맞음. 아래에서 설명)

- __주 생성자 파라미터를 프로퍼티 초기화나 init 블록 밖에서 사용할 수 없다.__

```kotlin
class Person(firstName: String, familyName: String) {
    val fullName = ""
    fun printFirstName() { 
        println(firstName) // Error
    }
}
```

- __생성자 파라미터 값을 저장할 프로퍼티 만들기__

```kotlin
class Person(firstName: String, familyName: String) {
    val firstName = firstName
    fun printFirstName() { 
        println(firstName) // Error
    }
}
```

- __생성자 파라미터를 프로퍼티로 만들기__
    - 생성자 파라미터 앞에 var 또는 var 키워드를 붙이면 자동으로 프로퍼티를 정의한다.

```kotlin
class Person(private val firstName: String, familyName: String) {
    val fullName = "$firstName $familyName" // constructor parameter call
    
    init {
        println("Created new Person instance: $fullName")
    }
    
    fun printFirstName() {
        println(firstName) // property call
    }
}
```

### vararg 

```kotlin
// Person[] 타입을 Property 로 갖는 클래스 정의
class Room(vararg val persons: Person)
```

- __Decompile__

```java
public final class Room {
   @NotNull
   private final Person[] persons;

   @NotNull
   public final Person[] getPersons() {
      return this.persons;
   }

   public Room(@NotNull Person... persons) {
      Intrinsics.checkNotNullParameter(persons, "persons");
      super();
      this.persons = persons;
   }
}
```

## Links

- [JavaBeans - Wikipedia](https://en.wikipedia.org/wiki/JavaBeans)
- [What is Java Beans](https://stackoverflow.com/questions/11406977/what-is-a-java-bean#:~:text=JavaBeans%20are%20reusable%20software%20components%20for%20Java.%20Practically%2C,bean%20object%20instead%20of%20as%20multiple%20individual%20objects.)
- [Places where JavaBeans are used](https://stackoverflow.com/questions/1727603/places-where-javabeans-are-used)
- [JavaBeans Spec](https://www.oracle.com/java/technologies/javase/javabeans-spec.html)
- [JavaBeans API Definitions](https://docs.oracle.com/javase/6/docs/api/java/beans/package-summary.html)
- [Java PropertyUtils Example - getting and setting properties by name](https://javarevisited.blogspot.com/2012/04/java-propertyutils-example-getting-and.html#axzz7hPyjSePO)

## Next

- [POJO](https://baekjungho.github.io/wiki/spring/spring-pojo/)

## 참고 문헌

- 코틀린 완벽 가이드 / Aleksei Sedunov 저 / 길벗
- Kotlin In Action / Dmitry Jemerov, Svetlana Isakova 공저 / 에이콘
- Effective Kotlin / Marcin Moskala 저 / 인사이트