---
layout  : wiki
title   : Iterable
summary : Iterable 과 for-each
date    : 2022-10-04 11:28:32 +0900
updated : 2022-10-04 12:15:24 +0900
tag     : java
toc     : true
comment : true
public  : true
parent  : [[/java]]
latex   : true
---
* TOC
{:toc}

## Iterable

```java
/**
 * Implementing this interface allows an object to be the target of the "for-each loop" statement.
 * 
 * @param <T> the type of elements returned by the iterator
 */
public interface Iterable<T> {

    /**
     * Returns an iterator over elements of type {@code T}
     * 
     * @return an Iterator
     */
    Iterator<T> iterator();
}
```

### for-each

for-each 를 사용할 때 항상 우측 항에 Collection 을 넣었다. 하지만 우측 항에 실제로 와야하는 타입은 Iterable 이다.
List 는 Collection 을 상속 받고 있고 Collection 은 Iterable 을 상속 받고 있다.

```java
List<Item> items = Arrays.asList(1, 2, 3, 4);
for (List list: items) {
    
}
```

```java
public class Ob {
    public static void main(String[] args) {
        Iterable<Integer> iter = Arrays.asList(1, 2, 3, 4);
        for (Integer i: iter) { // for-each
            System.out.println(i);
        }
    }
}
```

- __Iterator 구현__

```java
public class Ob {
    public static void main(String[] args) {
        Iterable<Integer> iter = () -> new Iterator<>() {
            int i = 0;
            final static int MAX = 10;
            
            public boolean hasNext() { 
                return i < MAX;
            }
            
            // 값을 전달 받는 쪽에서 호출: pull
            public Integer next() {
                return ++i;
            }
        };
        
        for (Integer i: iter) {
            System.out.println(i);
        }
    }
}
```

### Java 5 이전에는 어떻게 작성 했을까 ?

```java
public class Ob {
    public static void main(String[] args) {
        for (Iterator<Integer> it = iter.iterator(); it.hasNext();) {
            System.out.println(it.next());
        }
    }
}
```

## Links

- [토비의 봄 TV - Spring Reactive Programming](https://www.youtube.com/watch?v=8fenTR3KOJo&list=LL&index=2&t=3s)

