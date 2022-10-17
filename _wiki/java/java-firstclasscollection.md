---
layout  : wiki
title   : First Class Collection
summary : 일급 컬렉션
date    : 2022-10-15 11:28:32 +0900
updated : 2022-10-15 12:15:24 +0900
tag     : java kotlin
toc     : true
comment : true
public  : true
parent  : [[/java]]
latex   : true
---
* TOC
{:toc}

## From: The Thoughtworks Anthology

> 이 규칙의 적용은 간단하다.
콜렉션을 포함한 클래스는 반드시 다른 멤버 변수가 없어야 한다.
각 콜렉션은 그 자체로 포장돼 있으므로 이제 콜렉션과 관련된 동작은 근거지가 마련된셈이다.
필터가 이 새 클래스의 일부가 됨을 알 수 있다.
필터는 또한 스스로 함수 객체가 될 수 있다.
또한 새 클래스는 두 그룹을 같이 묶는다든가 그룹의 각 원소에 규칙을 적용하는 등의 동작을 처리할 수 있다.
이는 인스턴스 변수에 대한 규칙의 확실한 확장이지만 그 자체를 위해서도 중요하다.
콜렉션은 실로 매우 유용한 원시 타입이다.
많은 동작이 있지만 후임 프로그래머나 유지보수 담당자에 의미적 의도나 단초는 거의 없다.

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

## Links

- [일급 컬렉션의 소개와 써야할 이유 - jojoldu](https://jojoldu.tistory.com/m/412)

## References

- The Thoughtworks Anthology / Martinfowler 저 / 위키북스