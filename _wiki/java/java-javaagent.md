---
layout  : wiki
title   : javaagent
summary : 
date    : 2022-09-08 11:28:32 +0900
updated : 2022-09-08 12:15:24 +0900
tag     : java
toc     : true
comment : true
public  : true
parent  : [[/java]]
latex   : true
---
* TOC
{:toc}

## java.lang.instrument

- [ClassFileTransformer](https://docs.oracle.com/javase/7/docs/api/java/lang/instrument/ClassFileTransformer.html)
  - An agent provides an implementation of this interface in order to transform class files. 
- [Instrumentation](https://docs.oracle.com/javase/7/docs/api/java/lang/instrument/Instrumentation.html)
  - This class provides services needed to instrument Java programming language code.

### description

Provides services that allow Java programming language agents to instrument programs running on the JVM. The mechanism for instrumentation is modification of the byte-codes of methods.

### specification

An agent is deployed as a JAR file. An attribute in the JAR file manifest specifies the agent class which will be loaded to start the agent. For implementations that support a command-line interface, an agent is started by specifying an option on the command-line. Implementations may also support a mechanism to start agents some time after the VM has started. For example, an implementation may provide a mechanism that allows a tool to attach to a running application, and initiate the loading of the tool's agent into the running application. The details as to how the load is initiated, is implementation dependent.

### Command-Line Interface

An agent is started by adding this option to the command-line:

```
-javaagent:jarpath[=options]
```

The manifest of the agent JAR file must contain the attribute Premain-Class. The value of this attribute is the name of the agent class. The agent class must implement a public static premain method similar in principle to the main application entry point. After the Java Virtual Machine (JVM) has initialized, each premain method will be called in the order the agents were specified, then the real application main method will be called. Each premain method must return in order for the startup sequence to proceed.

### Manifest Attributes

The following manifest attributes are defined for an agent JAR file:

- __Premain-Class__
When an agent is specified at JVM launch time this attribute specifies the agent class. That is, the class containing the premain method. When an agent is specified at JVM launch time this attribute is required. If the attribute is not present the JVM will abort. Note: this is a class name, not a file name or path.
- __Agent-Class__
If an implementation supports a mechanism to start agents sometime after the VM has started then this attribute specifies the agent class. That is, the class containing the agentmain method. This attribute is required, if it is not present the agent will not be started. Note: this is a class name, not a file name or path.
- __Boot-Class-Path__
A list of paths to be searched by the bootstrap class loader. Paths represent directories or libraries (commonly referred to as JAR or zip libraries on many platforms). These paths are searched by the bootstrap class loader after the platform specific mechanisms of locating a class have failed. Paths are searched in the order listed. Paths in the list are separated by one or more spaces. A path takes the syntax of the path component of a hierarchical URI. The path is absolute if it begins with a slash character ('/'), otherwise it is relative. A relative path is resolved against the absolute path of the agent JAR file. Malformed and non-existent paths are ignored. When an agent is started sometime after the VM has started then paths that do not represent a JAR file are ignored. This attribute is optional.
- __Can-Redefine-Classes__
Boolean (true or false, case irrelevant). Is the ability to redefine classes needed by this agent. Values other than true are considered false. This attribute is optional, the default is false.
- __Can-Retransform-Classes__
Boolean (true or false, case irrelevant). Is the ability to retransform classes needed by this agent. Values other than true are considered false. This attribute is optional, the default is false.
- __Can-Set-Native-Method-Prefix__
Boolean (true or false, case irrelevant). Is the ability to set native method prefix needed by this agent. Values other than true are considered false. This attribute is optional, the default is false.
An agent JAR file may have both the Premain-Class and Agent-Class attributes present in the manifest. When the agent is started on the command-line using the -javaagent option then the Premain-Class attribute specifies the name of the agent class and the Agent-Class attribute is ignored. Similarly, if the agent is started sometime after the VM has started, then the Agent-Class attribute specifies the name of the agent class (the value of Premain-Class attribute is ignored).

## javaagent

Java agents are a special type of class which, by using the Java Instrumentation API, can intercept applications running on the JVM, modifying their bytecode. Java agents are extremely powerful and also dangerous.

We only need to implement [classFileTransformer](https://docs.oracle.com/javase/7/docs/api/java/lang/instrument/ClassFileTransformer.html) interface, if we want to write a Java agent.

### static agent

A static agent, which means that we build our agent we package it as a jar file, and when we start our Java application, we pass in a special JVM argument called javaagent. Then we give it the location of the agent jar on disk, and then the JVM does its magic.

```shell
$ java -javaagent:<path of agent jar file> -jar <path of the packaged jar file you want to intecept>
```

### implement a Java Agent

In summary, If you want to implement a Java Agent:

1. You need to create two Java classes. One with the with premain method (JavaAgent) and another class which extends the ClassFileTransformer (CustomTransformer)
2. Inside the body of the premain method, you need to add the object of the class which extends the ClassFileTransformer
3. Then you need to add the logic inside the overridden method transform inside CustomTransformer.
4. When transforming the bytecode inside the transform method you may need to use the bytecode generation libraries according to your purpose.
5. You need to specify the premain class in the Manifest and build the jar.
6. Use the javaagent tag to load the agent with the application you wanted to intercept.

## Links

- [Understanding Java Agents](https://dzone.com/articles/java-agent-1)
- [javaagent usage guide](https://programmer.group/javaagent-usage-guide.html)
- [instrument package-summary](https://docs.oracle.com/javase/7/docs/api/java/lang/instrument/package-summary.html)
- [Instrumentation API 와 Application Performance Monitoring](https://blog.bespinglobal.com/post/java-instrumentation-api/)
