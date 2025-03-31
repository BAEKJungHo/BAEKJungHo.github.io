---
layout  : wiki
title   : COMPOSITE
summary : 
date    : 2025-03-31 11:28:32 +0900
updated : 2025-03-31 12:15:24 +0900
tag     : designpattern
toc     : true
comment : true
public  : true
parent  : [[/designpattern]]
latex   : true
---
* TOC
{:toc}

## COMPOSITE

![](/resource/wiki/designpattern-composite/composite-meaning.png)

컴포지트 패턴을 이용하면 객체들을 트리 구조로 구성하여 부분과 전체를 나타내는 계층구조로 만들 수 있다. 이 패턴을 이용하면 클라이언트에서 개별 객체와 다른 객체들로 구성된 복합 객체(composite)를 똑같은 방법으로 다룰 수 있다.

컴포지트 패턴이 적용되는 데이터는 __트리 구조__ 로 표현되어야 하기 때문에 흔히 사용되는 패턴은 아니다. 그러나 일단 데이터가 트리 구조로 표현되기만 한다면,
복합체 패턴은 매우 유용할 수 있고 코드도 간결하게 만들 수 있다.

컴포지트 패턴은 비지니스 시나리오 기반의 데이터 구조와 알고리즘을 추상화한 것에 가깝다.

### Design Principles

컴포지트 패턴은 단일 역할 원칙을 깨면서 대신에 투명성(transparency)을 확보하기 위한 패턴이다. Component 클래스에는 두 종류의 기능이 모두 들어있다 보니까 안정성은 약간 떨어진다. 하지만, 컴포지트 패턴을 배움으로써 가이드라인을 항상 따를 필요는 없고 상황에 따라 원칙을 적절하게 사용해야한다는것을 보여준다.

![](/resource/wiki/designpattern-composite/composite.png)

- Component (그래픽 요소): 객체의 공통 인터페이스를 정의하고, 기본 동작 및 자식 관리 기능을 제공할 수 있다.
- Leaf (단일 요소: 사각형, 선, 텍스트 등): 자식이 없는 개별 객체로, 기본 구성 요소의 동작을 정의한다.
- Composite (복합 요소: 그림 등): 자식을 포함하는 구성 요소로, 자식 관리 및 관련 동작을 구현한다.
- Client (클라이언트): Component 인터페이스를 통해 객체들을 조작한다.

### HumanResource

회사의 조직 구조에는 부서와 직원의 두 가지 유형의 데이터가 있고 부서에는 하위 부서와 직원이 포함될 수 있다.
회사 전체에 대한 조직도를 기억하고, 부서별로 부서에 속한 모든 직원의 급여 합계를 계산할 수 있는 인터페이스를 제공해야 한다.

이러한 비지니스 요구 사항의 데이터는 트리로 표현될 수 있고, 트리의 순회 알고리즘을 통해 달성할 수 있다.

```java
public abstract class HumanResource {
    protected long id;
    protected double salary;

    public HumanResource(long id) {
        this.id = id;
    }

    public long getId() {
        return id;
    }

    public abstract double calculateSalary();
}

public class Employee extends HumanResource {
    public Employee(long id, double salary) {
        super(id);
        this.salary = salary;
    }

    @java.lang.Override
    public double calculateSalary() {
        return salary;
    }
}

public class Department extends HumanResource {
    private List<HumanResource> subNodes = new ArrayList<>();

    public Department(long id) {
        super(id);
    }

    @java.lang.Override
    public double calculateSalary() {
        double totalSalary = 0;
        for (HumanResource hr : subNodes) {
            totalSalary += hr.calculateSalary();
        }
        this.salary = totalSalary;
        return totalSalary;
    }
    
    public void addSubNode(HumanResource hr) {
        subNodes.add(hr);
    }
}

// 조직도를 작성하는 코드
public class OrganizationChart {
    private static final long ORGANIZATION_ROOT_ID = 1001;
    private DepartmentRepo departmentRepo; // DI
    private EmployeeRepo employeeRepo; // DI
    
    public void buildOrganization() {
        Department rootDepartment = new Department(ORGANIZATION_ROOT_ID);
        buildOrganization(rootDepartment);
    }
    
    private void buildOrganization(Department department) {
        List<Long> subDepartmentIds = departmentRepo.getSubDepartmentIds(department.getId());
        for (Long subDepartmentId : subDepartmentIds) {
            Department subDepartment = new Department(subDepartmentId);
            department.addSubNode(subDepartment);
            buildOrganization(subDepartment);
        }
        
        List<Long> employeeIds = employeeRepo.getDepartmentEmployeeIds(department.getId());
        for (Long employeeId : employeeIds) {
            double salary = employeeRepo.getEmployeeSalary(employeeId);
            department.addSubNode(new Employee(employeeId, salary));
        }
    }
}
```

## References

- Gangs of Four Design Patterns
- 设计模式之美 / 王争