---
layout  : wiki
title   : First Citizen
summary : 일급 시민과 고차 함수
date    : 2022-09-24 15:54:32 +0900
updated : 2022-09-24 20:15:24 +0900
tag     : kotlin java fp
toc     : true
comment : true
public  : true
parent  : [[/kotlin]]
latex   : true
---
* TOC
{:toc}

## First Citizen

One of the core values of functional programming is that functions should be first-class. A language that considers procedures to be "first-class" allows functions to be passed around just like any other value.

__First-class be used as a parameter to another function or used as the return value from another function.__

- Function can be assigned to a variable
- Function can be stored in a data structure
- Function can be passed around as an argument to other functions
- Function can be returned from the functions

## Benefits of First-class Citizen

The advantages of a first-class citizen class are:
- __Code Reusability__: By treating classes as first-class citizens, they can be reused and shared across different parts of the code, making it more modular and easier to maintain.
- __Abstraction__: First-class classes can be abstracted away behind interfaces, allowing developers to use the same class with different implementations.
- __Simplification__: Using first-class collections can simplify code by reducing the need for explicit loops and other control structures when working with large amounts of data.
- __Flexibility__: First-class collections can be used as arguments or return types in functions, making it easy to pass collections around and work with them in different parts of the code.

### Code Reusability

Here is an example of a class in Java that is considered a first-class citizen:

```java
class Point {
    private double x;
    private double y;

    public Point(double x, double y) {
        this.x = x;
        this.y = y;
    }

    public double getX() {
        return x;
    }

    public double getY() {
        return y;
    }

    public void setX(double x) {
        this.x = x;
    }

    public void setY(double y) {
        this.y = y;
    }
}
```

Let's say we have a class called Geometry with a function distance that calculates the distance between two points

```java
class Geometry{
    public static double distance(Point p1, Point p2) {
        double dx = p1.getX() - p2.getX();
        double dy = p1.getY() - p2.getY();
        return Math.sqrt(dx * dx + dy * dy);
    }
}
```

We can reuse the Point class to create two points and pass them as an argument to the distance function as follows:

```java
Point p1 = new Point(3.5, 5.0);
Point p2 = new Point(6.0, 8.0);
double dist = Geometry.distance(p1, p2);
```

Also, we can reuse the same Point class to create two more points and pass them as an argument to another function called midpoint:

```java
class Geometry2{
    public Point midpoint(Point p1, Point p2) {
        double x = (p1.getX() + p2.getX()) / 2;
        double y = (p1.getY() + p2.getY()) / 2;
        return new Point(x, y);
    }
}
Point p3 = new Point(1.0, 2.0);
Point p4 = new Point(4.0, 5.0);
Point midpoint = Geometry2.midpoint(p3, p4);
```

As you can see, the Point class can be reused in multiple places in the code, in different classes and different functions. This makes the code more modular and easier to maintain.

In addition, if we want to change the implementation of Point class, we don't need to change all the code, we just need to update the class and all places that are using it will be updated automatically.

### Abstraction

One of the benefits of first-class citizens is that they can be abstracted behind an interface, which allows for flexibility and code reuse. By defining an interface that specifies a set of methods that a class must implement, different implementations of the class can be used interchangeably, as long as they adhere to the interface.

```java
// Define the interface
interface Shape {
    double getArea();
}

// Implement the interface in the first-class citizen class
class Square implements Shape {
    private double side;
    public Square(double side) { this.side = side; }
    public double getArea() { return side * side; }
}

class Circle implements Shape {
    private double radius;
    public Circle(double radius) { this.radius = radius; }
    public double getArea() { return Math.PI * radius * radius; }
}

// Use the first-class citizen class in other class
class AreaCalculator {
    public double calculateTotalArea(Shape[] shapes) {
        double totalArea = 0;
        for (Shape shape : shapes) {
            totalArea += shape.getArea();
        }
        return totalArea;
    }
}

// usage
Shape[] shapes = {new Square(2), new Circle(3)};
AreaCalculator calculator = new AreaCalculator();
double totalArea = calculator.calculateTotalArea(shapes);
System.out.println("Total area: " + totalArea);
```

In this example, the Shape interface defines a single method getArea() which returns the area of the shape. Two classes Square and Circle that implement this interface. The Square class has a private field side and its getArea method returns the area of the square by sideside. The Circle class has a private field radius and its getArea method returns the area of the circle by PIradius*radius.

The AreaCalculator class has a method calculateTotalArea(Shape[] shapes) that takes an array of Shape objects as an argument and calculates the total area of all the shapes by calling the getArea() method on each shape.

In this way, any new shape class that implements the Shape interface can be used with the AreaCalculator class without any modification, making the code more reusable.

### Simplification

First-class collections can simplify code by reducing the need for explicit loops and other control structures when processing large amounts of data. This is possible because many programming languages, including Java, provide built-in methods for common operations on collections, such as filtering, mapping, and reducing.

For example, in Java, the Stream interface, introduced in Java 8, provides a set of methods for working with collections in a functional way. These methods allow for chaining operations on a stream, without the need for explicit loops.

Here's an example of how the Stream interface can be used to filter and map a collection of integers, and then reduce the result to a single value:

```java
List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);

int evenSum = numbers.stream()
    .filter(n -> n % 2 == 0)  // filter out odd numbers
    .map(n -> n * n)         // square the even numbers
    .reduce(0, (a, b) -> a + b); // add up the squares

System.out.println("Sum of squares of even numbers: " + evenSum);
```

Here, the filter method is used to filter out the odd numbers, the map method is used to square the even numbers and the reduce method is used to add up the squares. This code is equivalent to the following imperative code:

```java
List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);

int evenSum = 0;
for (int n : numbers) {
    if (n % 2 == 0) {
        evenSum += n * n;
    }
}

System.out.println("Sum of squares of even numbers: " + evenSum);
```

The functional approach using Stream's methods is more readable, maintainable and easier to understand, because it separates the logic of what to do from the logic of how to do it. The imperative approach using explicit loops and if statement is harder to understand as it combines both logic of what to do and how to do it.

There are many other functional methods available in the Stream interface, such as sorted, distinct, count, min, max, etc, which can be used to perform common operations on collections without the need for explicit loops and control structures.

### Flexibility

first-class collections can be used as arguments or return values in a function, making it easy to pass collections through different parts of the code and work with them.

In Java, collections are objects, and as such, they can be passed as arguments to methods and returned as the result of a method. Here's an example of a method that takes a list of integers as an argument and returns a new list containing the squares of the integers in the original list:

```java
List<Integer> squareNumbers(List<Integer> numbers) {
    return numbers.stream()
        .map(n -> n * n)
        .collect(Collectors.toList());
}
```

In this example, the method squareNumbers takes a `List<Integer>` as an argument and returns a `List<Integer>`. The method uses the map method from the Stream interface to square each element in the list, and the collect method to collect the result into a new list.

Here's an example of how this method can be used to square a list of integers and print the result:

```java
List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5);
List<Integer> squaredNumbers = squareNumbers(numbers);
System.out.println(squaredNumbers);  // [1, 4, 9, 16, 25]
```

In this way, the method squareNumbers is a reusable function which can be used to square any list of integers passed to it, this is one of the advantages of the first-class citizen, it can be passed as an argument or returned as a form in a function, making it easy to pass through the collection and work in other parts of the code.

Also, it's worth noting that any collection interface class, such as List, Set, Queue, etc. can be passed as an argument, so long as the actual object passed is an instance of a class that implements that interface, this allows for maximum flexibility in your code, and it's one of the key features of the Java's polymorphism and abstraction.

## Higher-Order Functions

__Functions that accept other functions as parameters and/or use functions as return values are known as higher-order functions.__ 

- __Most famous higher-order functions__
  - map()
    - The map() higher-order function takes a function parameter and uses it to convert one or more items to a new value and/or type.
    - ![](/resource/wiki/kotlin-first-citizen/map.png)
  - reduce()
    - The reduce() higher-order function takes a function parameter and uses it to reduce a collection of multiple items down to a single item.
    - ![](/resource/wiki/kotlin-first-citizen/reduce.png)
- __Benefits__
  - One of the benefits of using higher-order functions to work with data is that the actual how of processing the data is left as an implementation detail to the framework that has the higher-order function.

## Links

- [First-Class Functions - O'REILLY](https://www.oreilly.com/library/view/learning-scala/9781449368814/ch05.html#:%7E:text=A%20first%2Dclass%20function%20may,return%20value%20from%20another%20function.)
- [First-class citizen - wikipedia](https://en.wikipedia.org/wiki/First-class_citizen)
- [What is a first-class-citizen function?](https://stackoverflow.com/questions/5178068/what-is-a-first-class-citizen-function)
- [ProjectReactor API Docs](https://projectreactor.io/docs/core/release/api/reactor/core/publisher/Flux.html)