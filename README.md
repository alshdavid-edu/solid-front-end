
## SOLID Front End: Less frameworks, more engineering patterns

### Your mind is the best front-end framework.

![Your masterpiece](https://cdn-images-1.medium.com/max/2000/0*rGdoIzi2u3vXF1qC)

## What to expect from this article

This article series aims to explore the idea of focusing on software engineering patterns over frameworks in an effort to produce better single page web applications.

There will be a focus on React and TypeScript — though there is no preference towards any library or framework.

TypeScript is preferred as it offloads the responsibility of verifying contracts to the compiler, enabling us to write less code and attain more robust outcomes.

In the first part, we’ll dive progressively deeper into the concepts from a high level. In the following parts we will create an application demonstrating the benefits of the concepts discussed.

## Introduction

JavaScript/TypeScript is part of an exclusive group of languages which present engineers with a unique and wonderful problem; freedom.

Often applications grow informally and organically from immediate requirements. This process presents questions around where code belongs, questions that often remain unanswered long after the project has been rewritten.

Different frameworks address this challenge in different ways.

Angular assumes an opinionated approach where it takes the responsibility of software design out of the hands of the developers.

While effective, this is not without its drawbacks. This approach results in business logic that is highly coupled to Angular specific implementations.

Conversely, libraries like React, Vue and Svelte offer a solution to a much smaller portion of the problem. They only solve view rendering leaving the challenge of dependency management and data flow entirely up to the developers.

Many tools have appeared to solve the remaining challenges. Redux, MobX, VueX to name a few.

If we look to the server side, we’ll see that front end software faces the same challenges as real-time event-driven servers because front end is also real-time and event-driven.

## SOLID

This is an acronym for five design principles intended to make software designs more understandable, flexible and maintainable.

The summary is that S is about encapsulation and OLID is about abstraction.

* **Single responsibility principle**

* **Open–closed principle**

* **Liskov substitution principle**

* **Interface segregation principle**

* **Dependency inversion principle**

### **Single responsibility principle**
>  A [class, package] should only have a single responsibility, that is, only changes to one part of the software’s specification should be able to affect the specification of the class.

This describes the notion of creating dependable APIs for consumers to use by strategically limiting the responsibilities of units.

In JavaScript/TypeScript, developers have the freedom to express units as object literals, collections of functions, classes or modules.

The single responsibility principle in essence encompases the ideas central to the UNIX philosophy. Single units responsible for one thing, composed together to achieve a task.

For JavaScript/TypeScript, the single responsibility principle begins at the module level and extends down into functions and classes.

This strategy allows developers to isolate concerns by creating packages, leveraging a philosophy known as “package oriented design”.

A package looks like a self contained concern grouped in such a way that it could be published to npm without any changes:

    /image
        index.ts
        image.ts
        to-base64.ts
        from-base64.ts
        compress.ts

The index would look like

    import { toBase64 } from './to-base64.ts'
    import { fromBase64 }from './from-base64.ts'
    import { compress }from './compress.ts'
    import { Image as OGImage } from './image'

    export const image = {
      Image: OGImage,
      toBase64,
      fromBase64,
      compress,
    }

    export default image

    export declare module image {
      export type Image = OGImage
    }

A consumer would use the package like:

    import image from './packages/image'

    const img = image.fromBase64(base64image)
    image.compress(img, { ...options })
    const smallImg = image.toBase64(img)

Here we are encapsulating a single idea and exposing a considered API strategically.

*This topic is expanded upon in the “Package Oriented Design” section below.*

### **Open–closed principle**
>  Software entities should be open for extension, but closed for modification.

The open closed principle has evolved over time but at its core is aimed at improving reliability by preventing modification to the APIs inside dependencies.

The modern interpretation, “polymorphic open-closed principle”, encourages the use of interfaces to protect depency consumers from changes to APIs.

If the clients themselves describe the expected behaviour of their own dependencies rather than relying on concrete implementations, API changes will result in errors we can catch at compile time.

This is connected to the following Liskov substitution principle.

### **Liskov substitution principle**
>  “Objects in a program should be replaceable with instances of their subtypes without altering the correctness of that program.”

This describes the idea that two types are substitutable if they exhibit behaviour such the caller is unable to tell the difference.

In class based languages LSP is often expressed as a specification for having an abstract base class with various concrete subtypes.

With TypeScript, we can use interfaces to achieve this behaviour.

Consider the following class

 <iframe src="https://medium.com/media/29e93ab07b066f89ba6b0bb611b30065" frameborder=0></iframe>

We can write a getPosts function which directly depends on the HTTPClient implementation:

 <iframe src="https://medium.com/media/9d700132fb171c89ecbb08cd83e1707a" frameborder=0></iframe>

Referencing HTTPClient in this way creates a concrete dependency on it. This tightly couples thegetPosts function to the implementation of the HTTPClient.

To alleviate this tight coupling, we change the client argument type from HTTPClient to an interface.

 <iframe src="https://medium.com/media/2e62de418ea7345b10c9d4434ff286d0" frameborder=0></iframe>

Now the getPosts function looks like

 <iframe src="https://medium.com/media/a33b6916b6ff123ff975fc38d1f8db88" frameborder=0></iframe>

The HTTPClient matches the signature of the HTTPGetter interface, there for it is an acceptable value to use as an argument.

The getPosts function is now loosely coupled to the implementation of HTTPClient, however it maintains high cohesion by matching the expected types signature.

Testability is improved as the client supplies the exact signature that needs to be satisfied in order effectively mock the dependency.

 <iframe src="https://medium.com/media/2f6e5dda5677062a72cb2e53ab6f3b6f" frameborder=0></iframe>

Additionally, there is an improvement to code glanceability. When skimming through this file, a reader will be able to get a comprehensive understanding of the behaviour this function will exhibit without requiring additional context.

### **Interface segregation principle**
>  “Clients should not be made to depend on methods they do not use […] many client-specific interfaces are better than one general-purpose interface.”

This describes the idea that interfaces should not provide methods to a client that the client does not use.

Consider the following snippet

 <iframe src="https://medium.com/media/e5a6d141ef2daabb27f26a68ff8d64ef" frameborder=0></iframe>

The getPosts function is asking for a dependency which has both a get and post method on it, while it is only using the get

This introduces ambiguity surrounding the behaviour of the function. While a developer could use documentation to describe that this function only “gets posts”, it’s perhaps simpler to enable to code to clearly document itself.

The interface segregation principle states that it’s more valuable to have many small client-specific interfaces which describe the immediate requirements of their consumer.

 <iframe src="https://medium.com/media/9be7b8dc7ad6cded57169e324a624265" frameborder=0></iframe>

Strategically limiting the behaviour exposed to a function eliminates any ambiguity surrounding its expected result.

This improves both the glanceability of the function and its testability. During testing, the task of mocking dependencies is reduced.

In addition, small interfaces make for powerful abstractions, facilitating for sharing when they are well designed.

Often a consumer requires multiple interfaces, when the need arises, a developer would “compose” multiple interfaces into a single, client-specific interface.

 <iframe src="https://medium.com/media/a09cb46c7bb7de69cd1aa0973a2e34c8" frameborder=0></iframe>

This strategy enables developers to assemble their applications deliberately from small pieces.

### **Dependency inversion principle**
>  One should “depend upon abstractions, [not] concretions.”

Broadly, this describes that developers should ensure that their dependency consumers depend on interfaces, rather than absolute types such as classes.

Consumers rely on the contracts asserted by those interfaces for their internal logic. This obscures the implementation details and allows for the values used to satisfy the interface contracts to be generic.

When following the advice in this article, a project should already be split into discrete packages with well defined package boundaries. There for, the dependency inversion principle merges with the Liskov substitution principle.

Dependency inversion works in conjunction with **inversion of control**, and in the absence of a dependency injection framework. Developers should avoid accessing instances directly from the module scope.

Consider the following example:

 <iframe src="https://medium.com/media/8a556a20d086b4b7b6ee1f42b7f881f2" frameborder=0></iframe>

A consumer of this utility would import and use the instance directly.

    import client from './http-client'

    function getThings() {
      client.get('[http://myurl.com/things'](http://myurl.com/things'))
        .then(result => console.log(result))
    }

    getThings()

This is known as the service locator pattern which JavaScript’s module system enables without requiring additional machinery.

Obtaining dependencies this way leads to tight coupling and introduces significant challenges to testing.

Developers would have to stub the global module implementation and reset it before each test. This forces tests run sequentially as they depend on the same instance.

Ensuring that dependencies are created and shared through dependency injection while also leveraging dependency inversion eliminates this issue.

Example:

    import http from './http-client'

    function getThings(client: HTTPGetter) {
      client.get('[http://myurl.com/things'](http://myurl.com/things'))
        .then(result => console.log(result))
    }

    const client = http.createClient()
    getThings(client)

## Package Oriented Design
>  “Even though you may know the language, you know the syntax; how you organize and structure your projects can sometimes be confusing” 
 *— William Kennedy*

Package oriented design is a strategy that aims to address the questions surrounding where to put things when creating an application.

It’s an organisational philosophy which comes with a recommended folder structure, drawing inspiration from the UNIX philosophy of composing functionality from small focused utilities.

    src
    ├── gui
    |   └── main.tsx
    |
    └── platform
    |   └── post
    |
    └── npm (node_modules)
        └── http-client

Package oriented design centers around 3 main folders. gui, platform, and npm.

platform and npm hold discrete packages which are assembled within gui.
folders can only import from a folder at the same level or higher.

![](https://cdn-images-1.medium.com/max/2000/1*QOKoJRSDOKxHAbXDxRoyAA.png)

/gui can import from /gui, /platform and npm 
/platform can only import packages from /platform, and npm

Theoretically, one should be able to boot an entire application inside node using the packages contained within /platform, npm and orchestration logic.

/gui is simply an application entry point which consumes and orchestrates the packages to enable an end user to complete objectives. If the entry point is a library rather than an application, the folder can be called /sdk.

/gui strictly holds presentational logic which includes a rendering framework, initializing dependencies and dependency injection.

If an entity inside /gui begins to feel like it does not relate directly to rendering logic, it’s promoted to platform.

/platform defines a directory which houses packages that hold project specific logic.

It’s important that each folder inside platform is written as though it were its own npm package; completely isolated from the others and importable from an index file.

If a package in /platform is required in another project then the package is promoted to npm, or alternatively as /kit. More broadly, general packages which are required between projects are stored in npm.

If storing dependencies in an npm registry is inappropriate, an alternative is to have a /kit folder which is made available to the shared projects.

## Package Naming

It’s important to write packages which read ergonomically upon consumption.

Developers will spend time reading through project code so it’s vital to ensure it’s as glaceable as possible.

### Stutter

Stutter is the repetition of words within code.
An example would be something like:

    import users from 'users-package'

    const usersStore = new users.Users()
    const amy = new users.User('Amy')
    userStore.addUser(amy)

It’s important to avoid code stutter as it is distracting and introduces an additional layer of mental processing on the reader.

Instead strive to pack as much description as possible in a form which is readable similarly to natural language.

Namespacing exports, using function constructors and singular words to describe package names helps to facilitate this:

 <iframe src="https://medium.com/media/c760c4a2016f25e3b98bbe8fd73a7691" frameborder=0></iframe>

## Thank you

Thank you for reading my article, I appreciate you taking the time to get to the end.

Truely, this was really just a summary on the topics. I tried to keep it brief and high level.

If you’d like to see me dive further into the topics — let me know and please feel free to contribute your thoughts and ideas.

— Dave

![](https://cdn-images-1.medium.com/max/2048/0*V2xHx5zxDF-O834b)

## Let’s Build an SPA (Part 2)

In part 2 we will be putting together an SPA using the concepts discussed above.

The application aims to demonstrate how it’s possible to write an application which will take full advantage of a framework, yet remain agnostic to it.
