---
layout  : wiki
title   : SSM - AWS Systems Manager
summary : 
date    : 2024-09-14 15:54:32 +0900
updated : 2024-09-14 20:15:24 +0900
tag     : aws ssm
toc     : true
comment : true
public  : true
parent  : [[/aws]]
latex   : true
---
* TOC
{:toc}

## AWS Systems Manager

AWS Free-Tier 를 사용하는 경우 아래와 같은 아키텍처로 EC2 & RDS 가 구성된다.

![](/resource/wiki/aws-ssm/ec2-rds.png)

이때, RDS 는 private ___[subnet](https://baekjungho.github.io/wiki/network/network-subnet/)___ 에 위치하게되어, ___[pem](https://baekjungho.github.io/wiki/auth/auth-certificate-authority/)___ key 가 위치한 곳에서 ___[ssh](https://baekjungho.github.io/wiki/linux/linux-ssh/)___ 를 통해 EC2 로 접속한 후 RDS 로 접속할 수 있게 된다.

Production 환경에서 개발이 필요한 경우 DBeaver 와 같은 Tool 로 DB 에 직접 붙어야 하는데, 이때 AWS SSM 을 사용하면 Bastion Host 를 통하지 않더라도 RDS 에 접속할 수 있다.

__Step 1 - AmazonSSMManagedInstanceCore 정책을 가진 IAM Role 생성__:
- Menu: IAM > Role 

__Step 2 - IAM Policy 생성__:
- Menu: IAM > Policy

```json
{
	"Version": "2012-10-17",
	"Statement": [
		{
			"Effect": "Allow",
			"Action": [
				"ssm:StartSession"
			],
			"Resource": [
				"arn:aws:ec2:ap-northeast-2:{계정 ID}:instance/{EC2 Instance Id}", // EC2 에 접속하기 위함
				"arn:aws:ssm:ap-northeast-2:{계정 ID}:document/SSM-SessionManagerRunShell", // EC2 에 접속하기 위함
				"arn:aws:ssm:ap-northeast-2::document/AWS-StartPortForwardingSessionToRemoteHost" // RDS 에 접속하기 위함
			]
		},
		{
			"Effect": "Allow",
			"Action": [
				"ssm:TerminateSession"
			],
			"Resource": [
				"arn:aws:ssm:*:*:session/${aws:username}-*"
			]
		}
	]
}
```

__STEP 3 - IAM User 생성 및 Policy 연결__:
- Menu: IAM > User
- Access Key 생성 후 csv 저장

__STEP 4 - EC2 Instance 에 IAM 연결__:
- EC2 > 보안

__STEP 5 - EC2 에 ssh 로 들어가서 ssm agent 실행 및 확인__:
- 실행: sudo snap start amazon-ssm-agent
- 상태 확인: sudo snap services amazon-ssm-agent

__STEP 6 - AWS Cli 설치__:

```
brew install awscli
brew tap dkanejs/aws-session-manager-plugin
brew install aws-session-manager-plugin
```

__STEP 7 - AWS Configure__:

```
> aws configure --profile {프로젝트명 등 적절한 이름}
AWS Access Key ID []: {access key}
AWS Secret Access Key []: {secret access key}
Default region name []: ap-northeast-2
Default output format []: json

> aws configure list --profile {프로젝트명 등 적절한 이름}
```

__STEP 8 - EC2 접속 확인__

```
aws --profile {프로젝트명 등 적절한 이름} ssm start-session --target {EC2 Instance Id}
```

__STEP 8 - RDS Session 연결 후 DBeaver 연결__

```
aws --profile {프로젝트명 등 적절한 이름} ssm start-session --target {EC2 Instance Id} --document-name AWS-StartPortForwardingSessionToRemoteHost --parameters '{"portNumber" : ["3306"], "localPortNumber" : ["3306"], "host" : ["{RDS Instance Id}"]}'
```

```
- host : localhost
- port : 3306
- database : {DB Name}
- driver : mysql
- username : {User Name}
- password : {PW}
```

## Links

- [AWS SSM 으로 하는 프라이빗 리소스 접근 제어 및 보안 감사 로깅](https://southouse.tistory.com/27)