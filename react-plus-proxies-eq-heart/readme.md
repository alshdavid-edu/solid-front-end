
<h1>React + Proxy = <3</h1>
<b><i>Using React with Proxy to Implement Vue/Angular Style Reactivity</i></b>
</br>

<img width="250px" src="assets/hero.png" align="right"/>

- [Sneak Peek](#sneak-peek)
- [Introduction](#introduction)
- [Objective](#objective)
- [Immutability vs Mutability](#immutability-vs-mutability)
- [Proxies](#proxies)
- [Emitter](#emitter)
- [Proxy + Emitter](#proxy--emitter)
- [React Hook](#react-hook)
- [Getters and Setters (Vue Style)](#getters-and-setters-vue-style)
- [Reaction Wheel library](#reaction-wheel-library)

## Sneak Peek

Final Product - [Stackblitz Sanbox](https://stackblitz.com/edit/react-ts-lcc226)

## Introduction

This article aims to explore the idea of using EcmaScript Proxies and React hooks to write simpler front end applications.

Proxies enable the interception of updates to state. In this article we will take advantage of this characteristic to notify React that something has changed, triggering a re-render. 

This will enable us to write applications which automatically synchronize against changes to state in an way which doesn't require us to change the way we write logic.

We will also construct the same behavior using getters & setters, similarly to Vue's method.

## Objective

Our MVP will look something like the following React application:

```javascript
import { observe, useObserve } from './proxima'

const itemStore$ = observe({
  items: []
})

const App = () => {
  const itemStore = useObserve(itemStore$)

  const add = () => itemStore.items.push(prompt('Add New Item'))
  
  return <div>
    <button onClick={add}>Add New</button>
  </div>
}
```

## Immutability vs Mutability

In the example above you can see that I am mutating the state and still expecting a rerender.

Conventionally when dealing with state in front end we are instructed to avoid mutation. There are many reasons for this, the main reason is facilitating for how React marks components for recalculation.

React determines if a component should be rerendered on the basis of if a value on its state has changed. It does not do deep checks on `object` or `array` types because that is computationally expensive.

This strategy is effective with basic types like `string`s. The challenge is telling React to recalculate when an `array` or `object` has changed.
To do that we must replace and object/array with an identical object/array + our changes.
This will ensure React sees a new reference as the variable value and trigger a recalculation.

Essentially, immutability is our way of talking to React and saying _"hey I have updated something here"_. 

Proxies give us an alternative way to notify React of changes.

This enables mutability in our programming styles. Adhering to immutability practices has other benefits and Developers can still write software adhering to said practices. 
This reactivity engine allows this programming style to be a choice rather than a necessity.

## Proxies

Proxies allow us the capacity to intercept property changes on objects and arrays.

```javascript
const source = {
  a: 'value'
}

const source$ = new Proxy(source, {
  get: (src, prop) => {
    return src[prop]
  },
  set: (src, prop, update) => {
    src[prop] = update
    console.log('Property has updated!') // Secret sauce
    return true
  }
})

source$.a = 'updated'
```
<p align="center"><i>Copy / paste this into your browser's devtools<br/>to see it in action</i></p>
<br/>

When we modify a property on this object through the `Proxy`, the `Proxy` triggers its `set` callback. 

This also works on classes and arrays.

We will harness this interception characteristic to notify React when a property in an object has updated.

## Emitter

Before we patch our objects with proxies, we must first think of a way to talk to React.

The observer / subscriber pattern is an effective way to encapsulate and abstract the dispatching of events.

Redux uses this pattern under the hood with it's `store.subscribe()`

Here is a quick and simple "emitter"

```javascript
class Emitter {
  constructor() {
    this.subscribers = []
  }

  subscribe(cb) {
    this.subscribers.push(cb)
    return {
      unsubscribe: () => {
        const index = this.subscribers.indexOf(cb)
        this.subscribers.splice(index, 1)
      }
    }
  }

  emit(value) {
    for (const cb of this.subscribers) {
      cb(value)
    }
  }
}
```

Which can be consumed with the following syntax

```javascript
const source$ = new Emitter()

const sub1 = source$.subscribe(console.log)
const sub2 = source$.subscribe(console.log)

source$.emit('foo') // Both will log
sub1.unsubscribe()

source$.emit('bar') // One will log
sub2.unsubscribe()

source$.emit('foobar') // None will log
```

## Proxy + Emitter

Now that we have a means to abstract the dispatching of callbacks, let's add it into our proxy and use that to notify watchers when an object has updated.

The expectation is we will have the following API

```javascript
import { observe, useObserve } from './proxima'

const state$ = observe({
  items: []
})

state$.subscribe(() => console.log(state$.items))

state$.items.push('foo')
state$.items.push('bar')
```

To do this we must create a proxy of an object, patch a `subscribe` method onto the top of it and recursively observe objects and arrays, emitting updates on the same `Emiiter`

```javascript
export function observe(source) {
  const update$ = emitter.create()
  source.subscribe = update$.subscribe.bind(update$)
  return createProxy(source, update$)
}

function createProxy(source, update$) {
  return new Proxy(source, {
    get: (s, p) => {
      if (
        isArray(s[p]) || 
        isObject(s[p])
      ) {
        return observe(s[p], update$)
      }
      return s[p]
    },
    set: (s, p, u) => {
      if (s[p] === u) {
        return true
      }
      s[p] = u
      update$.emit()
      return true
    }
  })
}

function isObject (value) {
  return value && typeof value === 'object' && value.constructor === Object;
}

function isArray (value) {
  return Array.isArray(value)
}
```

## React Hook

To consume this "enchanted" object from inside React, we must create a hook.

We want the hook to look something like:

```javascript
const MyComponent = () => {
  const source = useObserve(source$)

  return <div>
    { source.value }
  </div>
}
```

Our hook must subscribe to our emitter and unsubscribe when it leaves. 
We override React's change detection because our Proxy implementation checks for diffs internally.
This means the hook will never trigger unless a property somewhere in the observed object has been modified.

```javascript
import { useState, useEffect } from 'react'

export const useObserve = (source) => {
  const [ _, setValue ] = useState({})
  
  useEffect(() => {
    const sub = source.subscribe(v => setValue({}))
    return () => sub.unsubscribe()
  }, [ source ])

  return source
}
```

## Getters and Setters (Vue Style)

If IE support is paramount, you are unable to use Proxy objects. Thankfully it is possible to traverse an object tree and create getters/setters from all of the properties.

This is, in fact, the strategy which Vue employs. The downside to this is that you can not add new properties to observed objects.

This doesn't seem to be an issue in most cases, but it is something to be weary of.

Here is my implementation using getters/setters - credit to the Vue team, stack overflow and coffee.

Source: [reaction-wheel/getters-setters/create.ts](https://github.com/alshdavid/reaction-wheel/blob/master/packages/reaction-wheel/src/getters-setters/create.ts)

## Reaction Wheel library

I have published the above code to an npm package called `reaction-wheel`
It includes hooks for React and Preact.

It also includes an implementation for getters/setters which it falls back to when `Proxy` is not detected.

Feel free to traverse the codebase and make pull requests. Please star it if you like it.

Thanks for reading my article!

```bash
npm install --save reaction-wheel reaction-wheel-react
```

[Stackblitz Sanbox](https://stackblitz.com/edit/react-ts-lcc226)

[GitHub Repo](https://github.com/alshdavid/reaction-wheel)


<p align="center"><img width="350px" src="assets/rocket.png"/></p>
 