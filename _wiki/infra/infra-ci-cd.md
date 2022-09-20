---
layout  : wiki
title   : cicd devops
summary : Continuous Integration/Delivery/Deployment
date    : 2022-09-05 15:54:32 +0900
updated : 2022-09-05 20:15:24 +0900
tag     : infra devops ci/cd
toc     : true
comment : true
public  : true
parent  : [[/infra]]
latex   : true
---
* TOC
{:toc}
 
## Continuous Integration

You can create a set of scripts to __build and test__ your application __automatically.__

## Continuous Delivery

Not only is your application built and tested each time a code change is pushed to the codebase, the application is also __deployed continuously.__ However, with continuous delivery, __you trigger the deployments manually.__

## Continuous Deployment

Similar to Continuous Delivery. The difference is … __human intervention is not required. deployments automatically.__

## Workflow

![](/resource/wiki/infra-ci-cd/cicd.png)

## A deeper look into the CI/CD workflow

![](/resource/wiki/infra-ci-cd/cicd-devops.png)

- __Verify__
  - Continuous Integration
- __Package__
- __Release__
  - Continuous Delivery, Continuous Deployment

## Links

- [ContinuousIntegration](https://martinfowler.com/articles/continuousIntegration.html)
- [ContinuousDelivery](https://martinfowler.com/bliki/ContinuousDelivery.html)
- [What is Continuous Integration? - AWS](https://aws.amazon.com/ko/devops/continuous-integration/)
- [Software Delivery Guide](https://martinfowler.com/delivery.html)
- [GitLab CI/CD](https://docs.gitlab.com/ee/ci/)
- [GitLab CI/CD pipelines](https://docs.gitlab.com/ee/ci/pipelines/)
- [CI/CD: The what, why and how - Github](https://resources.github.com/ci-cd/)
- [Integrating with GitHub Actions – CI/CD pipeline to deploy a Web App to Amazon EC2](https://aws.amazon.com/ko/blogs/devops/integrating-with-github-actions-ci-cd-pipeline-to-deploy-a-web-app-to-amazon-ec2/)