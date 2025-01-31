---
layout  : wiki
title   : Decision Making Principles
summary : 
date    : 2025-01-28 12:02:32 +0900
updated : 2025-01-28 13:12:24 +0900
tag     : architecture
toc     : true
comment : true
public  : true
parent  : [[/architecture]]
latex   : true
---
* TOC
{:toc}

## Decision-Making Principles

Design is the process of making decisions.

### Principle1: Use Facts

A fact is something that we believe to be true. Facts, and the evidence for them, are the foundations of logical reasoning.
When we cannot have all the facts, we make assumptions.

### Principle2: Check Assumptions

Explicit assumptions can be checked. Implicit assumptions, by comparison, are more devious.
If Implicit assumptions would not be checked, that might create problems (e.g performance risk) for the systems.

### Principle3: Explore Contexts

Contexts are conditions that influence software decisions. There are many contextual factors, such as
development resources, financial pressures, legal obligations, industry norms, user expectations, and past decisions.
For example, we might want to implement a scalable and highly reliable database systems. but have a limited budget. Even though the budget is not a
system requirement, it affects our decision.

### Principle4: Anticipate Risks

A risk is the possibility of an undesirable outcome. A documented risk contains an estimate of the size of the loss and the probability of the loss.

### Principle5: Assign Priorities

Priorities quantify the relative importance of choices, choices such as which requirement to implement or which solution to use.
Prioritization is required when the things that we desire are competing for the same limited resource(e.g time, money, developer skills, CPU, memory, network bandwidth).

### Principle6: Define Time Horizon

The time horizon defines the time period relevant to decision and its impacts.
Risks, benefits, costs, needs, and impacts can change over time, and we want to anticipate how they might change.
Defining the time horizon allows architects to explicitly state and evaluate the pros and cons of specific actions(and nonactions) in terms of their short and long-term impacts.

### Principle7: Generate Multiple Solution Options

More challenging contexts, considering only a single solution may be risky; the first solution is not necessarily the best one, especially when an architect is inexperienced or faces an unfamiliar situation.

### Principle8: Design Around Constraints

Constraints are limitations that set the boundaries of our design options. Constraints may come from requirements, contexts, technologies, and existing design choices.

### Principle9: Weigh the Pros and Cons

Pros and cons represent the arguments for an against each of the choices in a selection.

## References

- Designing Software Architectures: A Practical Approach SECOND EDITION / Rick Kazman