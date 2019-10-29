
<h1>SOLID TypeScript</h1>
<b><i>Less about frameworks, more about engineering</i></b>
</br>

<img width="500px" src="assets/pilars.png" align="right"/>

- [Introduction](#introduction)
- [Single responsibility principle](#single-responsibility-principle)
- [Open Closed principle (Polymorphic)](#open-closed-principle-polymorphic)
- [Liskov substitution principle](#liskov-substitution-principle)
- [Interface segregation principle](#interface-segregation-principle)
- [Dependency inversion principle](#dependency-inversion-principle)
- [Conclusion](#conclusion)

## Introduction

This article aims to explore the idea of focusing on software engineering patterns to produce higher quality TypeScript applications.

With the goal of writing high quality applications, it's important to define what "high quality" means.

How does one analyse code for it's quality? 

It's fine to appreciate it for it's beauty or perhaps it's brevity - Saying things like "Wow, this code is very beautiful" or "This code is very concise"

Using such attributes to assess code quality is perhaps too subjective and it might not be very useful in contributing towards building a quality application.

Wouldn't it be more useful to have some more objective terms to describe properties of good or bad code?

*So what are some properties of bad code?*

**Rigidity**
  * Is the code inflexible? 
  * Does it feature over-bearing types that make it difficult to modify?

**Fragility**
  * Does the slightest change wreak havoc throughout the codebase?

**Immobility**
  * Is the code hard to refactor? 
  * Does it feel like the code is always a step away from an import loop?

**Complexity**
  * Is it overly complex for seemingly no reason, other than to just be complex?

**Verbosity**
  * Is it simply exhausting to use the code?
  * When you look at it, is it difficult to decipher what it aims to achieve?

</br>

It's likely that these are statements which most developers would prefer to avoid having their work described as.
The good thing about these statements however, is that they provide developers with an objective target to avoid. 

<p align="center">
  The question is, what if developers had similar, positive, statements to describe good code?
</p>

</br>

<p align="center"><img src="assets/solid-book.jpg"/></p>
<p align="center"><i>Agile Software Development - Robert C. Martin</i></p>

</br>

In 2003, Robert Martin wrote a book titled "Agile Software Development" and in it, he described the 5 properties of reusable software which he called the SOLID principles, named after the first letters in their names.

In the context of development today, Robert Martin's book might seem a bit dated as the languages described in the book were in use around a decade ago.

However, perhaps there are aspects of the SOLID principles which will give us a clue on how to write well designed front end applications.

## Single responsibility principle

>  A [class, package] should only have a single responsibility, that is, only changes to one part of the software’s specification should be able to affect the specification of the class.

The single responsibility principle in essence encompasses the idea of multiple single units, each responsible for one thing, composed together to achieve a task.

This is not dissimilar to the UNIX philosophy, where utilities pipe their output into the following utility of a chain. 

```bash
cat foo.txt | grep "bar" | tee results.txt | wc -l
```

It's vital for this to work that each utility knows nothing about the other. Amazingly, decades after the creation of UNIX, the core utilities are still used prolifically and in seemingly endless arrangements.

This in fact highlights the single biggest advantage of the single responsibility principle. 

When planning units, developers are encouraged to think about interactions between units in abstract. This results in code which at its inception is flexible and uncoupled.

Developers plan an API from the perspective of it's consumer, ignoring the context of the application it's being written in.

This code, without planning, is agile.

For TypeScript, I believe the single responsibility principle begins at the package level and extends down into the modules, functions and classes contained within that package.

Using a barrel (`index.ts`), developers can bundle concerns into a "package", carefully considering what will be publicly accessible from that package.

One could think of a "package" as an externally installable package obtained from npm, where its internal implementation is not a concern to its caller.

An example is the following `person` package

```
/person
  index.ts
  person.ts
  store.ts
```

The package would export its public API from its `index.ts` and the consumer would access/interact with that through its exported namespace.

```typescript
import person from './packages/person'

// Create a store
const personStore = person.createStore()

// Asynchronously listen for changes on the store
personStore.onAdd(() => {
  const people = personStore.getAllPeople()
  console.log(people)
})

// Create and add a new person
const lilly = person.create('Lilly')
personStore.add(lilly)
```

## Open Closed principle (Polymorphic)

>  Software entities should be open for extension, but closed for modification.

The open closed principle has evolved over time but at its core is aimed at improving software reliability by preventing modification to depending APIs.

The modern interpretation, “polymorphic open-closed principle”, encourages the use of interfaces to protect dependency consumers from changes to APIs.

Interfaces are essentially API contracts for objects.

```typescript
// foo.ts
import http from './http'

export function foo(httpClient: http.Client): Promise<RainbowResponse> {
  return httpClient.get('https://somewhere.over/the/rainbow')
}
```

The `http.Client` interface looks like:

```typescript
export interface HttpClient {
  get<T>(url: string): Promise<T>
  post<T>(url: string, body: any): Promise<T>
  ...
}
```

Where the caller must supply a dependency that satisfies the contract which the `foo` function's `HttpClient` interface describes.

```typescript
import http from './http'
import { foo } from './foo'

void async function main(){
  const httpClient = new http.FetchClient(fetch)
  const response = await foo(httpClient)
  console.log(response)
}()
```

In this way, the implementation of the `http.FetchClient` is open for extension as enabled by the dependency consumer depending on an API contract (interface) rather than the class itself.

Developers are able to add methods or even change the underlying implementations however modification such as the implementation no longer matches the contract will result in a compiler error.

## Liskov substitution principle

>  “Objects in a program should be replaceable with instances of their subtypes without altering the correctness of that program.”

This describes the idea that two types are substitutable if they exhibit behavior such the caller is unable to tell the difference.

In essence, if class `A` and class `B` both contain the same method signatures, the consumer should be able to accept either and function as expected.

Say we have the following two classes

```typescript
// ConsoleLogger outputs logs to the console
class ConsoleLogger {
  log(...values: any[]) {
    console.log(...values)  
  }
}

// FileLogger outputs logs to a file
class FileLogger {
  log(...values: any[]) {
    fs.appendFileSync('logs.txt', JSON.stringify(values))
  }
}
```

Both `ConsoleLogger` and `FileLogger` contain the `log` method. The Liskov substitution principle describes that a consumer shouldn't care what kind of "logger" is supplied to it. 

To achieve this, the consumer must depend on a contract which is defined as an interface type.

```typescript
// Logger is a type which describes a contract
interface Logger {
  log(...values: any[]): void
}

function foo(logger: Logger): void {
  logger.log('Hello World!')
}
```

Now either object is acceptable as a dependency for `foo`

```typescript
const consoleLogger = new ConsoleLogger()
const fileLogger = new FileLogger()


// Both ConsoleLogger and FileLogger satisfy 
// the Logger contract
foo(consoleLogger)
foo(fileLogger)
```

This can also help developers write mock classes, such as a `MockLogger` which can be used as a substitute during testing.

## Interface segregation principle

> “Clients should not be made to depend on methods they do not use […] many client-specific interfaces are better than one general-purpose interface.”

In essence, the interface segregation principle describes the idea that consumers should describe dependencies which only contain methods they use, omitting those they do not.

In the following example, we can see that `foo` only uses the `log` method from `Logger`.

```typescript
interface Logger {
  log(...values: any[]): void
  error(...values: any[]): void
}

function foo(logger: Logger) {
  logger.log('Hello world')
}
```

The interface segregation principle states that we should strip away unused methods from the interface contract.

```typescript
interface GeneralLogger {
  log(...values: any[]): void
}

function foo(logger: GeneralLogger) {
  logger.log('Hello world')
}
```

This brings into question how best to deal with types which contain multiple methods, after all, we do expect `Logger` types to also have an `error` method.

To solve this, we use interface composition. This is expressed in TypeScript as intersection types.

```typescript
// Small interfaces
export interface GeneralLogger {
  log(...values: any[]): void
}

export interface ErrorLogger {
  error(...values: any[]): void
}

// Composed interface
export type Logger = (
  GeneralLogger &
  ErrorLogger
)
```

When consuming the dependency contracts, developers need only to pick the interface that satisfies their use case.

```typescript
import { Logger, ErrorLogger } from 'logger'

function foo(logger: Logger) {
  logger.log('Hello world')
  logger.error('End of ze world')
}

function bar(logger: ErrorLogger) {
  logger.error('End of ze world')
}
```

The philosophy is that developers should aspire to design small interfaces with single methods. Logically, this extends to the notion of small interfaces leading to simple implementations. 

The desired outcome being packages with simple implementations which are connected by common behavior.

Consumers are able to be more specific in how they describe behavior through their call signatures. This specificity reduces ambiguity and by extension the need for documentation - in effect, helping to contribute to the notion of self documenting code.

Interface segregation also reduces the burden of mocking dependencies during testing scenarios as mocks can be more specific and simpler.

## Dependency inversion principle


> One should “depend upon abstractions, [not] concretions.”

Another powerful (but not perfect) idiom here is that developers should aspire to 

> Accept interfaces and return objects

Broadly, this tenant stands to re-enforce the notion that developers should ensure that their dependency consumers depend on interfaces, rather than absolute types.

If the principles mentioned up until this point are properly applied, then the code within a project should already be factored out into discrete packages. Each package with a single well defined responsibility or purpose.

Code should describe its dependencies as interfaces, and those interfaces should be factored to provide only the behavior that the consumers using them actually require.

## Conclusion

Interfaces let you apply the SOLID principles to TypeScript applications.

Interfaces make this possible because they let developers describe what their packages provide, but not how their packages do it.

In a sense, this is all really just another way to describe "decoupling". In actuality, decoupling really is the goal here. After all, software which is loosely coupled is software that is going to be easier to change.

> Design is the art of arranging code that needs to work today, and be easy to change forever

Developers should aspire to produce software which is responsive to change, readable, reusable, testable and loosely coupled but maintains high cohesion within its components.

I recommend reading my next piece describing the concept of "package oriented design" - which puts the SOLID principles into a project structure.

Engineers can leverage this structure to produce software which utilizes any framework and satisfies the requirements of modern full stack applications with multiple entry points (backend, front end, web workers).

[Package Oriented Design](/package-oriented-design/readme.md)