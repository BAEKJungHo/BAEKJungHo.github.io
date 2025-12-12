---
layout  : wiki
title   : Functional Architectures
summary : The Essence Of Diverse Architectures, Type Driven Development, Output Based Testing
date    : 2024-08-04 11:02:32 +0900
updated : 2024-08-04 12:12:24 +0900
tag     : architecture fp test
toc     : true
comment : true
public  : true
parent  : [[/architecture]]
latex   : true
favorite: true
---
* TOC
{:toc}

## Functional Architectures

___[Layered Architecture](https://baekjungho.github.io/wiki/architecture/architecture-layered/)___ 는 예산과 일정이 빠듯한 경우나 어떤 아키텍처 스타일이 최선인지 불명확한 경우에 사용할 수 있다.
단점으로는 ___[Dependency Inversion Principle](https://baekjungho.github.io/wiki/oop/oop-solid/#dependency-inversion-principle)___ - _["Abstractions should not depend upon details. Details should depend upon abstractions"](https://baekjungho.github.io/wiki/spring/spring-psa/)_ 을 위반한다.
또한 도메인 복잡도가 높은 서비스의 경우에 (e.g E-Commerce) Layered Architecture 를 사용하면 특정 클래스에 ___[Dynamic Dependency](https://baekjungho.github.io/wiki/spring/spring-di/)___ 가 많이 생기면서 __복잡도(Complexity)__ 가 많이 증가한다.

이러한 단점을 해결하는 아키텍처로 ___[Hexagonal Architecture](https://baekjungho.github.io/wiki/architecture/architecture-hexagonal/)___ 와 ___[Clean Architecture](https://baekjungho.github.io/wiki/architecture/architecture-clean/)___ 가 있다.
두 아키텍처의 본질은 <mark><em><strong>핵심 로직(Domain)을 주변 Infrastructure 영역으로 부터 분리해서 외부의 변경사항으로 부터 Domain 이 변경되지 않게 하기 위함이며, Domain 을 보호하기 위해서는 의존성이 단방향으로 흐를 수 밖에 없다.</strong></em></mark> 
이렇게 경계가 명확한 아키텍처를 사용했을 때의 장점은 __테스트 전략__ 측면에서 이점이 있다. 대부분의 테스트는 쉽게 변경 가능한 프로토콜에 의존하지 않고도 비즈니스 로직을 검증할 수 있다.

___[Functional Architecture](https://blog.ploeh.dk/2016/03/18/functional-architecture-is-ports-and-adapters/)___ 또한 위 본질과 크게 다르지 않다.
Functional Core 에는 도메인, 데이터 처리, 계산 또는 모든 비즈니스 규칙이 들어있다. Functional Core 는 <mark><em><strong>Decisions</strong></em></mark> 을 내린다. 즉, ___[Pure Functions](https://baekjungho.github.io/wiki/kotlin/kotlin-first-citizen/)___ 를 사용해서 SideEffect 가 없는 결과를 반환한다.
![](/resource/wiki/architecture-functional/functional-architecture.png)

__Pure Functions__:

- 동일한 입력에 대해 항상 동일한 출력을 반환
- 함수 외부의 상태를 변경하지 않음 (부수 효과가 없음)
- 외부 상태에 의존하지 않음

따라서 ___[SideEffects](https://baekjungho.github.io/wiki/functional/functional-sideeffect/)___ 가 없고 외부 상태를 변경하거나 의존하지 않는다. 이러한 ___[불변성(Immutability)](https://baekjungho.github.io/wiki/functional/functional-copy-on-write/)___ 을 지키기 위해서 ___[Defensive Copy](https://baekjungho.github.io/wiki/functional/functional-defensive-copy/)___ 기법을 사용해야 한다.

```kotlin
// 주문 상태 변경
fun updateOrderStatus(order: Order, newStatus: OrderStatus): Order {
    return order.copy(status = newStatus) // Defensive Copy
}
```

__Imperative Shell__ (가변 셸, IS) 은 Functional Core 에 Input Data 를 제공하고 데이터베이스와 같은 외부 의존성에 SideEffect 를 적용해 그 결정(decisions)을 해석한다.
즉, IS 는 모든 입력을 수집하고 Decisions 를 SideEffect 로 변환한다. 

좋은 Functional Design 을 적용했을때 함수들은 잘 __격리(Isolation)__ 되어있을 것이고 ___[Intrinsically Testable](https://blog.ploeh.dk/2015/05/07/functional-design-is-intrinsically-testable/)___ 하다는 것을 의미한다.
_[Impureim sandwich](https://blog.ploeh.dk/2020/03/02/impureim-sandwich/)_ 글도 읽어보면 좋다.

Hexagonal Architecture 와 Functional Architecture 의 차이점은 SideEffect 에 대한 처리 방법이다. Hexagonal Architecture 의 경우에는 모든 수정 사항은 도메인 계층 내에 있어야 하며, 상태도 변경할 수 있다. 즉, 도메인 계층으로 인한 SideEffect 도 문제가 없다.
하지만 Functional Architecture 의 경우에는 모든 SideEffect 를 비지니스 연산 가장자리인 Imperative Shell 로 밀어낸다.

모든 서비스에서 Functional Architecture 가 적합할지 생각해보자. ___[No Silver Bullet in Software Test](https://baekjungho.github.io/wiki/test/test-no-silver-bullet/)___ 이런 말이 있듯이, 서비스 별로 적용되어야 하는 아키텍처도 다를 것이다.
Functional Architecture 를 적용하게 되면 Functional Core 와 Imperative Shell 을 명확하게 분리해야 하므로 초기에 작성해야 하는 Codebase 의 크기가 커지게 된다.
모든 서비스가 초기 투자가 타당할 만큼 복잡도가 높은 것은 아니기 때문에 항상 <mark><em><strong>시스템의 복잡도와 생산성을 고려해서 아키텍처를 전략적으로 적용</strong></em></mark> 해야 한다.

## Output Based Testing

출력 기반 테스트(Output Based Test)는 ___[SUT](https://baekjungho.github.io/wiki/test/tdd-sut-doc/)___ 에 입력을 넣고 생성되는 출력을 검증하는 방식이다.

```kotlin
class StringFormatterTest : StringSpec({
    val sut = StringFormatter()

    "formatName should correctly format the name" {
        val output = sut.formatName("John", "Doe")
        output shouldBe "Doe, John"
    }

    "formatAddress should correctly format the address" {
        val output = sut.formatAddress("123 Main St", "Anytown", "12345")
        output shouldBe "123 Main St, Anytown 12345"
    }

    "formatName should handle empty strings" {
        val output = sut.formatName("", "")
        output shouldBe ", "
    }

    "formatAddress should handle empty strings" {
        val output = sut.formatAddress("", "", "")
        output shouldBe ", "
    }
})
```

출력 기반 단위 테스트 스타일을 __함수형(functional)__ 이라고 하며, Functional Programming 에 근간을 두고 있다.

Functional Architecture 가 적용된 예제를 살펴보자.

__Functional Core__:

```java
// 결정(decisions)을 내리기 위한 파일 시스템에 대해 알아야할 모든 것을 포함하는 클래스
public class AuditManager {
    private readonly int _maxEntriesPerFile;
    
    public AuditManager(int maxEntriesPerFile) {
      _maxEntriesPerFile = maxEntriesPerFile
    }
    
    public FileUpdate AddRecord(
            FileContent[] files,
            string visitorName,
            DateTime timeOfVisit
    ) {
        (int index, FileContent file)[] sorted = SortByIndex(files);
        
        string newRecord = visitorName + ';' + timeOfVisit;
        
        if (sorted.Lengh == 0) {
            // 업데이트 명령 반환
            return new FileUpdate("audit_1.txt", newRecord);
        }

        (int currentFileIndex, FileContent currentFile) = sorted.Last();
        List<string> lines = currentFile.Lines.ToList();
        
        if (lines.Count < _maxEntriesPerFile) {
            lines.Add(newRecord);
            string newContent = string.Join("\r\n", lines);
            // 업데이트 명령 반환
            return new FileUpdate(currentFile.FileName, newContent);
        } else {
            int newIndex = currentFileIndex + 1;
            string newName = $"audit_{newIndex}.txt";
            // 업데이트 명령 반환
            return new FileUpdate(newName, newRecord);
        }
    }

}
```

위 클래스는 결정(decisions)을 내리기 위한 파일 시스템에 대해 알아야할 모든 것을 포함하며, 작업 디렉터리의 파일을 변경하는 대신, __SideEffect 에 대한 명령을 반환__ 한다.


```java
public class FileUpdate {
    public readonly string FileName;
    public readonly string NewContent;
    
    public FileUpdate(string fileName, string newContent) {
        FileName = fileName;
        NewContent = newContent;
    }
}
```

__Imperative Shell__:

```java
public class Persister {
    public FileContent[] ReadDirectory(string directoryName) {
        return Directory
                .GetFiles(directoryName)
                .Select(x => new FileContent(Path.GetFileName(x), File.ReadAllLines(x)))
        .ToArray();
    }
    
    public void ApplyUpdate(string directoryName, FileUpdate update) {
        string filePath = Path.Combine(directoryName, update.FileName);
        File.WriteAllText(filePath, update.NewContent);
    }
}
```

Functional Core 와 Imperative Shell 을 붙이기 위해선, Hexagonal Architecture 분류 체계에서 Application Service 라는 클래스가 필요하다.

```java
public class ApplicationService {
    private readonly string _directoryName;
    private readonly AuditManager _auditManager;
    private readonly Persister _persister;
    
    // constructor DI
    
    public void AddRecord(string visitorName, DateTime timeOfVisit) {
        FileContent[] files = _persister.ReadDirectory(_directoryName);
        FileUpdate update = _auditManager.AddRecord(files, visitorName, timeOfVisit);
        _persister.ApplyUpdate(_directoryName, update);
    }
}
```

Functional Core 와 Imperative Shell 을 붙이면서 Application Service 가 외부 클라이언트를 위한 시스템의 진입접을 제공한다.
Hexagonal Architecture 체계에서 AuditManager 는 ___[DomainModel](https://baekjungho.github.io/wiki/architecture/architecture-domain-model/)___ 에 속한다.

__Test Code without Mock__:

```java
public void A_new_file_is_created_when_the_current_file_overflows() {
    var sut = new AuditManager(3);
    var files = new FileContent[] {
            new FileContent("audit_1.txt", new string[0]),
            ...
    }
    
    FileUpdate update = sut.AddRecord(files, "Alice", DateTime.Parse("..."));
    
    AssertEqual(...);
}
```

## Type

Functional Programming 에서는 ___[Types](https://baekjungho.github.io/wiki/ddd/ddd-modeling/#types-and-functions)___ 이 Key Role 이다.
_[Types + Properties = Software](https://blog.ploeh.dk/2016/02/10/types-properties-software/)_ 에서는 Type 을 잘 사용하면 더 적은 테스트를 작성할 수 있다고 한다.

Type 은 함수와 데이터가 준수해야 하는 엄격한 계약(contract) 이며, 이러한 계약을 통해서 책임과 역할을 명확하게 한다는 점에서 ___[Design By Contracts](https://baekjungho.github.io/wiki/test/test-design-by-contract/)___ 와 유사하다.

정적 타입 언어에서 Type 은 Primitive Types 뿐만 아니라 다양한 Type 들이 존재한다. Kotlin 의 경우 _[Sealed classes and interfaces](https://kotlinlang.org/docs/sealed-classes.html)_ 또한 타입으로 볼 수 있다.

_[제어 명령을 수행하는 Application](https://baekjungho.github.io/wiki/realworld/realworld-smarthome-control-command/)_ 에서는 실제로 어떤 제어 명령(Control Commands)을 수행할 수 있는지에 대한 Type 정의가 필요하다.
따라서 타입을 먼저 정의하고 이를 통해 코드를 작성하는 방법론인 ___[Type-Driven Development](https://kciter.so/posts/type-driven-development/)___ 를 적용해볼법 하다.

## CanExecute/Execute

DomainModel ___[Encapsulation](https://baekjungho.github.io/wiki/oop/oop-encapsulation/)___ 을 잘하는 것이 중요하다. 즉, 비지니스 로직과 오케스트레이션(e.g Facade, Application Service) 간의 분리가 잘 되어야 한다.
이에 도움되는 패턴이 CanExecute/Execute 이다.

예를 들어 이메일을 사용자가 확인할 때 까지만 변경가능하다는 Flag 옵션(isEmailConfirmed)이 있다고 해보자.

```kotlin
class Facade {
    fun changeEmail(userId: String, newEmail: String) {
        // ... 데이터 준비 ... 
        val user = UserFactory.create(...)
        val company = CompanyFactory.create(...)

        try {
            user.changeEmail(newEmail, company) // Decisions
        } catch(e: Exception) {
            // ...
        }

        // 결정에 따른 실행
        repository.saveCompany(company)
        repository.saveUser(user)

        // ..
    }
}
```

여기서 오케스트레이션을 담당하는 Facade 는 의사 결정을 하지는 않지만 이메일을 변경할 수 없는 경우에도 Company 를 조회하기 때문에 성능 저하가 발생한다.
사용자 이메일을 변경할지 여부를 Facade 에서 결정하기 위해서는 아래와 같이 변경하면 된다.

```kotlin
class Facade {
    fun changeEmail(userId: String, newEmail: String) {
        // ... 데이터 준비 ... 
        val user = UserFactory.create(...)
        
        // 의사 결정을 Facade 에서 담당
        if (user.isEmailConfirmed) {
            throw new ...
        }

        val company = CompanyFactory.create(...)
        
        user.changeEmail(...)

        // 결정에 따른 실행
        repository.saveCompany(company)
        repository.saveUser(user)

        // ..
    }
}
```

하지만 이 경우에는 DomainModel 에 대한 캡슐화가 떨어지고, 의사 결정 프로세스가 두 부분으로 분리되어 비지니스 로직과 오케스트레이션간의 분리가 방해된다는 단점이 있다.

__CanExecute/Execute__:

```kotlin
class User {
    fun changeEmail(newEmail: String, company: Company) {
        check(canChangeEmail()) { "Can't change a confirmed email" }
        // ...
    }
    
    fun canChangeEmail() {
        return !isEmailConfirmed
    }
}
```

Facade 에서는 경우에 따라서 DomainModel 의 변경사항을 알기 원할 수 있다. 이때 프로세스 외부 의존성을 도메인 모델로 넘기지 않고 해결할 방법은 __[DomainEvent](https://enterprisecraftsmanship.com/posts/merging-domain-events-dispatching/)__ 를 사용하는 것이다.

Spring 에서는 _[@DomainEvents](https://www.baeldung.com/spring-data-ddd)_ 를 사용하여 Event 를 발행할 수 있다.

CanExecute/Execute 패턴만으로는 모든 비지니스 로직을 Domain 에 담지 못하는 상황도 분명 있을 것이다. 
즉, 오케이스트레이션 영역에서 비지니스 로직이 있는 것을 피할 수 없는 상황도 있을텐데 잠재적인 파편화가 일어나더라도 <mark><em><strong>DomainModel 이 프로세스 외부 의존성을 참조하지 않게 설계하는 것이 중요</strong></em></mark> 하다.

DomainModel 의 변경은 데이터 저장소의 향후 수정에 대한 ___[Abstraction](https://en.wikipedia.org/wiki/Abstraction_(computer_science))___ 에 해당한다.

## References

- Unit Testing Principles, Practices, and Patterns: Effective testing styles, patterns, and reliable automation for unit testing, mocking, and integration testing with examples in C# / Vladimir Khorikov
