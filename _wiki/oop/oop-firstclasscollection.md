---
layout  : wiki
title   : First Class Collection
summary : 
date    : 2022-10-15 11:28:32 +0900
updated : 2022-10-15 12:15:24 +0900
tag     : java kotlin fp oop
toc     : true
comment : true
public  : true
parent  : [[/oop]]
latex   : true
---
* TOC
{:toc}

## The Thoughtworks Anthology

> 이 규칙의 적용은 간단하다.
> 
> - 컬렉션을 포함한 클래스는 반드시 다른 멤버 변수가 없어야 한다.
> - 각 콜렉션은 그 자체로 포장돼 있으므로 이제 콜렉션과 관련된 동작은 근거지가 마련된셈이다.
> - 필터가 이 새 클래스의 일부가 됨을 알 수 있다.
> - 필터는 또한 스스로 함수 객체가 될 수 있다.
> - 또한 새 클래스는 두 그룹을 같이 묶는다든가 그룹의 각 원소에 규칙을 적용하는 등의 동작을 처리할 수 있다.
> - 이는 인스턴스 변수에 대한 규칙의 확실한 확장이지만 그 자체를 위해서도 중요하다.
> - 콜렉션은 실로 매우 유용한 원시 타입이다.
> - 많은 동작이 있지만 후임 프로그래머나 유지보수 담당자에 의미적 의도나 단초는 거의 없다.

## First Class Collection

Collection 을 Wrapping 하면서, 컬렉션 외에 다른 멤버 변수가 없는 상태를 일급 컬렉션이라고 한다. Wrapping 함으로써 다음과 같은 이점을 가지게 된다.

1. 비지니스에 종속적인 자료구조
2. Collection 의 불변성을 보장
3. 상태와 행위를 한 곳에서 관리
4. 이름이 있는 컬렉션

- __AS-IS__

```java
@Entity
public class Line {
    private List<Section> sections = new ArrayList<>();
    // ...
}
```

- __TO-BE__

```java
@Embeddable
public class Sections {
    @OneToMany(mappedBy = "line", cascade = {CascadeType.PERSIST, CascadeType.MERGE}, orphanRemoval = true)
    private List<Section> sections = new ArrayList<>();

    public Sections() {
    }

    public Sections(List<Section> sections) {
        this.sections = sections;
    }

    public List<Section> getSections() {
        return sections;
    }

    public void add(Section section) {
        if (this.sections.isEmpty()) {
            this.sections.add(section);
            return;
        }

        checkDuplicateSection(section);

        rearrangeSectionWithUpStation(section);
        rearrangeSectionWithDownStation(section);

        sections.add(section);
    }

    public void delete(Station station) {
        // something
    }
}
```

## Coupling and Reusability

일급 컬렉션(First-class Collection) 에서 컬렉션 외에 다른 멤버변수를 갖는다면, 해당 멤버 변수에 대해 Coupling 이 생기며, 추가된 멤버 변수가 필요없는 다른 곳에서
일급 컬렉션을 재사용하기가 힘들다.

When a class has other member variables besides the collection, it becomes less reusable and more tightly coupled to the specific use case it was designed for. This can make it harder to use the class in other parts of the code or in other projects.

For example, let's say you have a class Person that has a collection of PhoneNumber objects as well as other member variables, like name and address.

```java
class Person {
    private List<PhoneNumber> phoneNumbers;
    private String name;
    private String address;

    public Person(String name, String address) {
        this.name = name;
        this.address = address;
        this.phoneNumbers = new ArrayList<>();
    }

    // other methods ...
}
```

In this case, the Person class is tightly coupled to the specific use case of representing a person with a name, address, and phone numbers.
If you want to use the class in another context, like a company that only needs the phone numbers of their employees but doesn't need their names or addresses, you will have to throw away the unnecessary fields or write a specific class that only holds what you need.

On the other hand, if the Person class only has a collection of PhoneNumber objects and no other member variables, it becomes much more reusable.

```java
class PhoneNumbers {
    private List<PhoneNumber> phoneNumbers;

    public PhoneNumbers() {
        this.phoneNumbers = new ArrayList<>();
    }

    // other methods ...
}
```

In this way, you can use the class in many different contexts, like representing a person's phone numbers or a company's phone numbers.

In summary, when a class has other member variables besides the collection, it becomes less reusable and more tightly coupled to the specific use case it was designed for, making it harder to use the class in other parts of the code or in other projects.

## Links

- [First class citizen](https://baekjungho.github.io/wiki/kotlin/kotlin-first-citizen/)
- [일급 컬렉션의 소개와 써야할 이유 - jojoldu](https://jojoldu.tistory.com/m/412)

## References

- The Thoughtworks Anthology / Martinfowler 저 / 위키북스