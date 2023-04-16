---
layout  : wiki
title   : Decision Algorithm and Parametric Search
summary : 
date    : 2023-04-12 15:54:32 +0900
updated : 2023-04-12 20:15:24 +0900
tag     : algorithm
toc     : true
comment : true
public  : true
parent  : [[/algorithm]]
latex   : true
---
* TOC
{:toc}

## Decision Algorithm and Parametric Search

파라메트릭 서치(Parametric Search)는 Parametric 이라는 단어를 보면 알 수 있듯이 매개 변수를 이용한 탐색 기법이라는 것을 알 수 있다. 파라메트릭 서치(Parametric Search) 는 최적화 문제 를 결정 문제 로 바꾸어 해결하는 기법이다. 즉, 결정 알고리즘(Decision Algorithm)을 사용한다. 결정 알고리즘은 이진 탐색(Binary Search)을 사용하는데 구하고자하는 답이, 원소의 나열 안(배열)에(`<-startPoint---------------endPoint->`) 존재하는 경우에 사용한다. 문제의 풀이 아이디어는 구하고자하는 답(answer)을 반복해서 조정한다.

즉, __파라메트릭 서치(Parametric Search)는 매개변수를 이용한 탐색 기법이며 최적화된 답을 구하기 위해 결정 알고리즘을 사용한다.__

구하고자하는 답(answer)은 반복문안에서 계속해서 변경되는 중간점(middlePoint)를 의미한다. 즉, 결정 알고리즘에서는 최종적으로 middlePoint 가 answer 가 된다.

__Binary Search 와의 차이점__
- 함수를 사용한다.
- 결정 알고리즘에서 시작점(startPoint) : 입력 값 n 의 시작 범위 (1 <= n <= 10000 이므로 1)
- 결정 알고리즘에서 끝점(endPoint) : 배열의 마지막 원소 값(arr[n-1])
- 반복문이 끝난 middlePoint 가 answer 가 된다.

__문제를 읽고 파라메트릭 서치(Parametric Search) 사용해야하는지 안하는지에 대한 판단 기준__
- 최적화된 값을 요구한다.
- 구하고자 하는 값의 범위가 상당히 큰 경우
- 이분 검색을 사용해야 하는 경우

위 세개와 비슷한 느낌을 받으며, 문제에서 다음과 같은 문구가 주어진다. 최댓값 혹은 최솟값 을 구하세요. 출력하세요. 이러면 거의 결정 알고리즘(Decision Algorithm) 문제일 가능성이 높다.
- e.g 첫 줄에 ~ 최대 거리를 출력하세요.
- e.g 첫 줄에 ~ 최솟값을 출력하세요.

### Function

결정 알고리즘은 함수를 사용한다. 

__구하고자하는 답(answer)을 반복해서 조정하기 위한 판단을 내려주는 함수__ 를 만드는 것이다. 즉, __최적화된 값을 구하기 위해 판단을 내려주는 함수(e.g decisionToFindTheOptimizedValue)__ 라고 생각하면 된다. 문제 마다 조건이 다르기 때문에 함수의 내부 구현 방식이 당연히 달라진다.

그리고 해당 함수의 파라미터로 __입력 값을 가지고 있는 배열__ 과 __구하고자하는 답(answer)__ 을 파라미터로 넘겨준다.

__최댓값을 구하는 경우__

```java
if(decisionToFindTheOptimizedValue(arr, middlePoint) >= m) {
    answer = middlePoint;
    startPoint = middlePoint + 1;
} else {
    endPoint = middlePoint - 1;
}
```

__최솟값을 구하는 경우__

```java
if(decisionToFindTheOptimizedValue(arr, middlePoint) <= m) {
    answer = middlePoint;
    endPoint = middlePoint - 1;
} else {
    startPoint = middlePoint + 1;
}
```

### Examples

"이것이 코딩 테스트다" 책에서 나와있는 "떡볶이 떡 만들기" 문제이다.

```java
public class Main {

    private static int n; // 입력 데이터 개수 
    private static int m; // 조건(condition) : 손님이 얻고자 하는 떡의 길이
    private static int[] arr; // 배열

    public static void main(String[] args) {
        initializeInputData();
        System.out.println(decisionAlgorithm());
    }

    private static void initializeInputData() {
        Scanner sc = new Scanner(System.in);
        n = sc.nextInt();
        m = sc.nextInt();
        arr = new int[n];
        for (int i = 0; i < n; i++) {
            arr[i] = sc.nextInt();
        }
    }

    // 결정 알고리즘(Decision Algorithm)
    private static int decisionAlgorithm() {
        // 문제에 따라서, 오름차순 정렬을 해야할 수도 있고, 안할 수도 있다.
        // 해당 문제에서는 필요 없는 코드이다.
        // ascendingSort(riceCakes);  

        int answer = 0; // 구하고자하는 답
        int startPoint = 1; // 입력 값 n 의 시작 범위 (1 <= n <= 1000000 이므로 1)
        int endPoint = arr[n - 1]; // 배열의 마지막 원소 값

        while(startPoint <= endPoint) {
            int middlePoint = (startPoint + endPoint) / 2;
            if(decisionToFindTheOptimizedValue(middlePoint) >= m) {
                answer = middlePoint; // 구하고자하는 답(answer)을 반복해서 조정
                startPoint = middlePoint + 1;
            } else {
                endPoint = middlePoint - 1;
            }
        }

        return answer;
    }

    private static void ascendingSort(int[] arr) {
        Arrays.sort(arr);
    }

    private static int decisionToFindTheOptimizedValue(int middlePoint) {
        int sum = 0;
        for(int element : arr) {
            if(element > middlePoint) {
                sum += element - middlePoint;
            }
        }
        return sum;
    }
}
```

결정 알고리즘을 구현하는 메서드 안은 이진 탐색 코드가 적용되어 있으며, 이진 탐색 코드에서는 최적화된 값을 구하기 위해 판단을 내려주는 함수를 만들어서 사용한다.
실제로 이와 비슷하거나 조금 어려운 수준의 결정 알고리즘을 사용하는 문제들의 풀이 형식을 보면 달라지는 곳은 딱 정해져있다. 최댓값을 구하는지 최솟값을 구하는지에 따라 while 문 내부가 달라지며,
문제의 조건에 맞는 최적화된 값을 구하기 위해 decisionToFindTheOptimizedValue() 함수의 내부 구현이 달라진다.

```
func decisionAlgorithm() {
   Binary Search Algorithm code {
        func decisionToFindTheOptimizedValue();
   }
}
```

단, 결정 알고리즘을 사용하는 모든 문제가 이렇다라는것은 아니다.(맞을 수도 있고 아닐 수도 있고), 하지만 몇몇 문제를 분석해본 결과 떡볶이 문제랑 비슷하거나 조금 더 어려운 수준의 문제는 위와 같은 스타일로 해결할 수 있는 것 같다.