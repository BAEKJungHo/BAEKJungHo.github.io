---
layout  : wiki
title   : TrunkBasedDevelopment
summary : 
date    : 2022-10-17 15:54:32 +0900
updated : 2022-10-17 20:15:24 +0900
tag     : git devops tbd
toc     : true
comment : true
public  : true
parent  : [[/git]]
latex   : true
---
* TOC
{:toc}

## Trunk Based Development

__Smaller Teams__:

![](/resource/wiki/git-trunk-based-development/patch.png)

- Small commits straight into the trunk(or master)

__Scaled Trunk-Based Development__:

With trunk-based development, where developers merge small, frequent updates to a core “__trunk__” 

![](/resource/wiki/git-trunk-based-development/trunk.png)
 
- Committing changes to the master branch triggers the CI/CD pipeline.
- If the pipeline flags up any failures, it is everyone’s responsibility to jump in to try and fix it as soon as possible.
- The aim is to __keep the master branch in a deployable state__, with changes being released frequently.

## Long-Lived Feature Branch

[Feature Flags](https://trunkbaseddevelopment.com/feature-flags/) & [Branch by Abstraction](https://trunkbaseddevelopment.com/branch-by-abstraction/) 은 Long-Lived Feature Branch 를 위한 기술이다.

## Links

- [Trunkbaseddevelopment](https://trunkbaseddevelopment.com/)
- [FeatureBranch - MartinFowler](https://martinfowler.com/bliki/FeatureBranch.html)
- [Branch by Abstraction](https://trunkbaseddevelopment.com/branch-by-abstraction/)