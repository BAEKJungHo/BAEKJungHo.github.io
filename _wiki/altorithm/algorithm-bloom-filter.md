---
layout  : wiki
title   : Aggregate Massive Data With Bloom Filters
summary : Bloom filters used in variety cases. AdPlacement, Fraud Detection in Finance
date    : 2023-09-10 15:54:32 +0900
updated : 2023-09-10 20:15:24 +0900
tag     : algorithm datastructures
toc     : true
comment : true
public  : true
parent  : [[/algorithm]]
latex   : true
---
* TOC
{:toc}

## Probabilistic Data Structure

확률적 자료 구조(Probabilistic Data Structure)란 정확성을 일부 희생하고 메모리 또는 시간 효율성을 개선하기 위해 설계된 자료 구조이다.

대량의 데이터를 처리하고 대용량 데이터베이스나 분산 시스템에서 성능을 향상시키는 데 유용하다. Disk I/O 최적화 하는데도 사용된다고 한다.

## Bloom Filter

블룸 필터(bloom filter) 는 __요소 멤버쉽 검사(element membership check) 알고리즘__ 이다. 
쉽게 말해, 특정 집합안에 요소가 들어있는지 검사하는 알고리즘이다.

특징으로는 완벽한 정확성은 아니지만 __Fast & Memory Efficient__ 이며 대용량 데이터 처리에 유용하다. 또한, 집합에 속한 원소를 속하지 않았다고 말하는 일(__False Negative__)은 절대 없다. 대신 집합에 속하지 않은 원소를 속했다(__False Positive__)고 말할 수는 있다.

### How it works

You can try [Bloom Filter](https://llimllib.github.io/bloomfilter-tutorial/) Tutorial.

저장하려는 요소(element) 를 N 개의 [Hash Function](https://baekjungho.github.io/wiki/altorithm/algorithm-hash/) 을 거쳐 나온 결과(bit)를 bitmap 으로 저장한다.
모든 요소를 다 저장하고 나면 __dictionary__ 가 만들어 진다.

![](/resource/wiki/algorithm-bloom-filter/hash-function.png)

멤버쉽 검사는, 똑같이 hash function 을 거쳐서 bitmap 을 만들고, 앞서 만든 dictionary 를 `&` 연산하여 자신의 bitmap 이 나오면 dictionary 에 포함되어 있다라고 판단한다.

![](/resource/wiki/algorithm-bloom-filter/how-many-hash-function.png)

따라서, 적절한 Hash Function 개수를 설정해야 한다. [Bloom Filter Calculator](https://hur.st/bloomfilter/) 에서 적절한 Hash Function 개수를 계산할 수 있다.

### Implementation

```java
import org.apache.hadoop.util.bloom.BloomFilter;
import org.apache.hadoop.util.bloom.Key;
import org.apache.hadoop.util.hash.Hash;

public class DTLFilter {

    private BloomFilter BF = null;

    public DTLFilter(int RecordNum) {
        int vector_size = getOptimalVectorSize(RecordNum, 0.01f);
        int function_size = getOptimalFunctionSize(RecordNum, vector_size);

        BF = new BloomFilter(vector_size, function_size, Hash.MURMUR_HASH);
    }

    public int getOptimalVectorSize(int numRecords, float falsePosRate) {
        int size = (int) (-numRecords * (float) Math.log(falsePosRate) / Math.pow(Math.log(2), 2));
        return size;
    }

    public int getOptimalFunctionSize(float numMembers, float vectorSize) {
        return (int) Math.round(vectorSize / numMembers * Math.log(2));
    }

    public void add(String key) {
        BF.add(new Key(key.getBytes()));

    }

    public boolean contain(String key) {
        return BF.membershipTest(new Key(key.getBytes()));
    }
}
```

### Massive History Data Processing

> __[NHN Cloud MeetUp Bloom Filter](https://meetup.nhncloud.com/posts/192)__ 에 내용이 자세히 나와있다.
>
> 위 글에서 한가지 실전 사례중 하나가 __1년 치 사용자 별 이력을 뽑는데 페이코 사용자만 뽑아줘!__ 라는 요구사항이다.
>
> ![](/resource/wiki/algorithm-bloom-filter/nhn-bloom-filter.png)
> 
> 1. 페이코 사용자 데이터를 이용하여 블룸필터를 만들고, 200Kbytes 미만의 필터가 만들어 집니다.
> 2. 이 필터를 각 Worker 에 broadcast 한 후 1년치 데이터를 처리하기 전 이 필터를 거치게 하여 페이코 유저가 확실히 아닌 사람을 1차적으로 추스립니다. 이 작업을 통해 6~80%의 쓰지 않는 데이터가 걸러 집니다.
> 3. 필터를 거친 데이터에 한해서 집계 작업을 진행 합니다.
> 4. (3) 에서 만들어진 데이터는 false positive 성격에 의해 페이코 회원일 수도 아닐 수도 있습니다. 지정한 오차률 정도 데이터가 더 만들어 질텐데 이를 회원정보 data 와 join 하여 최종 결과물(5)을 산출 합니다. 이전 과정을 통해 사이즈가 많이 작아진 데이터들의 작업이라 적은 시간내에 수행이 완료 됩니다.

이러한 과정을 통해 48시간 걸리던 것을 5시간으로 줄였다고 한다.

### AdPlacement

> [Redis Bloom Filter](https://redis.io/docs/data-types/probabilistic/bloom-filter/)
>
> 이 애플리케이션은 다음 질문에 답합니다.
>
> - 사용자가 이미 이 광고를 본 적이 있나요?
> - 사용자가 이미 이 제품을 구매했습니까?
> 
> 모든 사용자에 대해 Bloom 필터를 사용하여 구매한 모든 제품을 저장합니다. 추천 엔진은 새로운 상품을 추천하고 해당 상품이 사용자의 Bloom 필터에 있는지 확인합니다.
>
> - 그렇지 않은 경우 광고가 사용자에게 표시되고 Bloom 필터에 추가됩니다.
> - 그렇다면 프로세스가 다시 시작되고 필터에 없는 제품을 찾을 때까지 반복됩니다.
>
> 이러한 유형의 애플리케이션에 Redis Stack 의 Bloom Filter 를 사용하면 다음과 같은 이점을 얻을 수 있습니다.
>
> - 실시간에 가까운 맞춤형 경험을 제공하는 비용 효율적인 방법
> - 값비싼 인프라에 투자할 필요가 없습니다.

### Cuckoo Filter

[Cuckoo filters](https://brilliant.org/wiki/cuckoo-filter/) improve upon the design of the bloom filter by offering deletion.

## Links

- [NHN Cloud MeetUp Bloom Filter](https://meetup.nhncloud.com/posts/192)
- [Redis Bloom Filter](https://redis.io/docs/data-types/probabilistic/bloom-filter/)
