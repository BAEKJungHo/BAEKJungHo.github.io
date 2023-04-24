# Vimwiki + Jekyll + Github.io

## 시작하기

블로그 스켈레톤을 fork 하세요.

- https://github.com/johngrib/johngrib-jekyll-skeleton
- https://johngrib.github.io/wiki/my-wiki/

## 설치하기

- https://github.com/johngrib/johngrib-jekyll-skeleton

```
# See also https://rvm.io/rvm/install
$ gpg --keyserver hkp://pool.sks-keyservers.net --recv-keys 409B6B1796C275462A1703113804BB82D39DC0E3 7D2BAF1CF37B13E2069D6956105BD0E739499BDB
$ curl -sSL https://get.rvm.io | bash
$ rvm install 2.7.4
$ rvm use 2.7.4
```

그다음 bundle install 을 실행하여 의존성들을 설치합니다.

```
$ bundle install
```

### Git hooks 추가하기 

새로운 글을 등록하면 메타 데이터를 업데이트해 주어야 합니다. 커밋하기 전에 이를 자동으로 될 수 있도록 Git Hooks 를 추가해야 합니다.

```
$ cp tool/pre-commit ./.git/hooks
```

추가하고 `.git > hooks > pre-commit` 들어가서 save-images.sh 안쓸거면 지우기

```
#!/bin/sh

./generateData.js
git add data
```

동작 안하면 `ls -al` 로 권한 확인하고 실행 권한 부여하기

### 노드 모듈 설치하기

메타 데이터 생성을 위해서 generateData.js 를 실행해야 합니다. 이를 실행하기 위해서 yamljs 의존성을 설치해야 합니다.

```
$ npm install
```

## 실행하기

```
$ jekyll serve
```

동작 안할 시 루트 아래에 있는 `sh start.sh` 실행하면 됨

