---
layout  : wiki
title   : Binary Search
summary : 
date    : 2023-04-11 15:54:32 +0900
updated : 2023-04-11 20:15:24 +0900
tag     : algorithm
toc     : true
comment : true
public  : true
parent  : [[/algorithm]]
latex   : true
---
* TOC
{:toc}

## Binary Search

이진 탐색(binary search)은 반으로 쪼개서 찾고자 하는 값이 해당되지 않는 범위는 날리고, 다시 쪼개진 반에서 이분 검색을 실시한다. 이분 검색을 실시하기전에 오름차순 정렬이 되어있어야 한다.

__Time complexity__

O(logN)

__Characteristics__

- Search by narrowing the search in half.
- It should be sorted in ascending order before conducting the search.
- It the number of input data exceeds 10 million, you should think of an algorithm that needs to speed up binary search O(longN)
- Using Three variables (point is index of array)
  - 시작점(startPoint = 0)
  - 끝점(endPoint = n-1)
  - 중간점(middlePoint)

__Implementation Procedures__

- If not sorted then sort by ascending. (Arrays.sort(arr))
- Initialize startPoint, endPoint
- MiddlePoint calculations: (startPoint + endPoint) / 2;
  - If the middle point is a real number, discard the decimal point (Ex. (0 + 3) / 2-> middlepoint = 1)
- Compare the middlePoint with the target you want to find.
- 찾고자 하는 데이터가 더 작은 쪽에 속하면 끝점 index 를 감소 : endPoint = middlePoint - 1;
- 찾고자 하는 데이터가 더 큰 쪽에 속하면 시작점 index 를 증가 : startPoint = middlePoint + 1;

__찾으려는 데이터와 중간점(Middle) 위치에 있는 데이터를 반복적으로 비교 해서 원하는 데이터를 찾는 과정__

### Using loop

```java
private static int n; // 입력 데이터 개수
private static int[] arr; // 탐색 대상인 배열
private static int target; // 찾고자 하는 값

public static int solution() {
  // 찾고자 하는 값의 위치
  int targetIndex = 0;

  // 시작점, 끝점 초기화
  int startPoint = 0;
  int endPoint = n - 1;

  // 배열 오름차순 정렬
  Arrays.sort(arr);

  // endPoint 의 index 가 더 크거나 같을 때 까지 반복
  while(startPoint <= endPoint) {
        // 중간점 계산
        // while 문 안에 선언하는 이유는 아래에서 startPoint 와 endPoint 의 인덱스 변화가 있을때 다시 계산하기 위함이다.
        int middlePoint = (startPoint + endPoint) / 2;

        // 중간점이 target 값과 동일한 경우    
        if(arr[middlePoint] == target) { 
           targetIndex = middlePoint; // 문제에 따라서 위치 번호를 출력하라고 하면 middlePoint + 1 이 될 수도 있음.
           break;
        }

        // 찾고자 하는 데이터가 더 작은 쪽에 속하면 끝점 index 를 감소
        if(arr[middlePoint] > target) {  
           endPoint = middlePoint - 1;
        } 
        // 찾고자 하는 데이터가 더 큰 쪽에 속하면 시작점 index 를 증가
        else {
           startPoint = middlePoint + 1;
        }
  }

  return targetIndex;
}
```

### Using Recursive

```java
public static int binarySearch(int[] arr, int target, int start, int end) {
    if (start > end) return -1;
    int mid = (start + end) / 2;

    // 찾은 경우 중간점 인덱스 반환
    if (arr[mid] == target) return mid;

    // 중간점의 값보다 찾고자 하는 값이 작은 경우 왼쪽 확인
    else if (arr[mid] > target) return binarySearch(arr, target, start, mid - 1);

    // 중간점의 값보다 찾고자 하는 값이 큰 경우 오른쪽 확인
    else return binarySearch(arr, target, mid + 1, end);
}
```