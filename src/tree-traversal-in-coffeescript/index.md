Last year, [Tom Moertel][tom] wrote about [beautiful tree traversal using function composition in Haskell][post]. To help me understand it better, I translated his code into CoffeeScript.

[tom]: http://blog.moertel.com/about.html
[post]: http://blog.moertel.com/posts/2012-01-26-the-inner-beauty-of-tree-traversals.html

This article is quite lengthy. My key point is this: any language supporting first-class functions lets you implement a beautiful pattern for data structure traversal. This pattern uses partially-applied functions, composed in the order you want to traverse.

No idea what partial application or function composition are? Read on.

## Preamble

[CoffeeScript][coffeescript] is not particularly similar to [Haskell][haskell], and it's [not well-suited to recursive algorithms][tco]. This translation might help you understand some basic Haskell a little better, and will hopefully explain this function composition pattern, but that's all it's good for. Don't use it in practice.

[coffeescript]: http://coffeescript.org/
[haskell]: http://www.haskell.org/haskellwiki/Haskell
[tco]: http://lambda-the-ultimate.org/node/3047

All of the Haskell code here is taken directly from Moertel's original article. Any mistakes are probably mine.

## Describing binary trees

The first step is to define a tree data structure and instantiate some trees:

```haskell
data Tree a = Empty
            | Node a (Tree a) (Tree a)
            deriving (Eq, Show)

-- some binary trees

t0 = Empty
t1 = Node 1 Empty Empty
t3 = Node 2 (Node 1 Empty Empty) (Node 3 Empty Empty)
```

A tree can either be empty, or have a node and two sub-trees. In CoffeeScript, the most succinct way to represent this structure is with nested arrays:

```coffeescript
t0 = []
t1 = [1]
t3 = [2, [1], [3]]
```

## Traversal: Pre-Order

First, we'll traverse the tree in pre-order. This means considering first the root node, then its left sub-tree, then its right sub-tree. The Haskell, intentionally verbose:

```haskell
preorder_traversal f z tree = go tree z
  where
    go Empty        z = z
    go (Node v l r) z = let z'   = f v z
                            z''  = go l z'
                            z''' = go r z''
                        in z'''
```

This function takes three parameters: a binary operator `f`, which is folded through the `tree`, with an initial value of `z`. The final accumulated value of z is returned.

The function defines another function, `go`, which takes two parameters: the tree, and the accumulator. This is pattern matched for two inputs. An empty tree returns the accumulator value, and any other tree applies the function according to the traversal rules, returning the accumulated result.

An equivalent in CoffeeScript:

```coffeescript
preorder_traversal = (f, z, tree) ->
  do go = (tree, z) ->
    return z unless tree?
    [v, l, r] = tree
    z1 = f(v, z)
    z2 = go(l, z1)
    z3 = go(r, z2)
```

This uses the `do` operator to create an [Immediately-Invoked Function Expression][iife]. We define the internal function `go`, which calls itself recursively, then immediately call it.

CoffeeScript has no equivalent to [Haskell's pattern matching][patterns]. Instead, we short-cut return from the function unless the tree exists.

[iife]: http://benalman.com/news/2010/11/immediately-invoked-function-expression/
[patterns]: http://learnyouahaskell.com/syntax-in-functions

We then deconstruct the tree array into its three components: the value `v`, and the left and right sub-trees `l` and `r`. We then apply the operator `f` to the value and the accumulator, then call the traversal function on the left sub-tree, and then on the right.

## Traversal: In-Order

Let's say you want to write an in-order traversal too. This processes first the left sub-tree, then the current node, then the right sub-tree. The Haskell:

```haskell
inorder_traversal f z tree = go tree z
  where
    go Empty        z = z
    go (Node v l r) z = let z'   = go l z
                            z''  = f v z'
                            z''' = go r z''
                        in z'''
```

And the CoffeeScript:

```coffeescript
inorder_traversal = (f, z, tree) ->
  do go = (tree, z) ->
    return z unless tree?
    [v, l, r] = tree
    z1 = go(l, z)
    z2 = f(v, z1)
    z3 = go(r, z2)
```

The only difference is the order of accumulation.

We can compare the two traversals by defining some binary operator and applying it. The Haskell:

```haskell
flatten traversal = reverse . traversal (:) []

test0i = flatten inorder_traversal t3   -- [1,2,3]
test0p = flatten preorder_traversal t3  -- [2,1,3]
```

This code defines a function `flatten`, taking a parameter `traversal`. It then applies the function composition operator `.` to the built-in `reverse` function and `traversal`. This is basically equivalent to calling `traversal`, then `reverse` on its results.

This composed function is then called with the `(:)` list constructor operator, and an empty list. The result is a list of values, which read left to right in the order of the traversal.

In CoffeeScript:

```coffeescript
flatten = (traversal, tree) ->
  append = (i, a) -> a.concat(i)
  traversal append, [], tree

console.log flatten inorder_traversal, t3  # [ 1, 2, 3 ]
console.log flatten preorder_traversal, t3 # [ 2, 1, 3 ]
```

The flatten function defines an `append` binary operator using array concatenation, analagous to the list constructor in Haskell. It then applies it to the `tree` using the specified `traversal` with an initial value of an empty array `[]`. The results are identical.

## A more generic traversal function

These two traversals are quite similar, and there's still post-order traversal to be implemented. So we try to write a neater, more general function:

```haskell
traverse step f z tree = go tree z
  where
    go Empty        z = z
    go (Node v l r) z = step (f v) (go l) (go r) z
```

This `traverse` function takes an additional parameter, the `step` function. Its parameters are three [partially-applied][partial] functions and the accumulator value. Its definition controls the order in which these functions are evaluated.

[partial]: http://en.wikipedia.org/wiki/Partial_application

Partial application is a simple concept once you understand it. For any function with `n` variable parameters, you can fix some of those parameters to create a new function. So for a binary multiply function, `multiply(a, b)`, you can fix the `a` parameter to `2`, and you have a function for doubling.

Here's some equivalent CoffeeScript:

```coffeescript
curry = (f, a) -> (x) -> f(a, x)
traverse = (step, f, z, tree) ->
  do go = (tree, z) ->
    return z unless tree?
    [v, l, r] = tree
    step curry(f, v), curry(go, l), curry(go, r), z
```

CoffeeScript does not have built-in partial application, so we define a `curry` function to do this for us. This is used to fix all the non-accumulator parameters of the functions, so that they can be fed into each other by the `step` function.

## The clever bit

This doesn't really make any sense without a `step` function, of course. So here we go:

```haskell
preorder   = traverse $ \n l r -> r . l . n
inorder    = traverse $ \n l r -> r . n . l
postorder  = traverse $ \n l r -> n . r . l

test1p = flatten preorder t3   -- [2,1,3]
test1i = flatten inorder t3    -- [1,2,3]
test1o = flatten postorder t3  -- [1,3,2]
```

This defines three traversal functions, using a couple of new pieces of syntax. First, the `$` operator is used to apply the function on its left to the expression on its right. This just saves a set of parenthesis, and the first expression could be rewritten as:

```haskell
preorder   = traverse (\n l r -> r . l . n)
```

Next, the parameter to `traverse` is a lambda function. This is an anonymous function, defined using the `\` keyword followed by a parameter list, the `->` keyword, and the function body.

In this case, the lambdas all use the function composition operator `.` as described before. So, the `preorder` function composes the functions as if written `r(l(n))`. As before, this is all partial application: only the step parameter is applied to `traverse`.

Here's the most awkward CoffeeScript yet:

```coffeescript
preorder  = (f, z, tree) -> traverse(((n, l, r, x) -> r l n x), f, z, tree)
inorder   = (f, z, tree) -> traverse(((n, l, r, x) -> r n l x), f, z, tree)
postorder = (f, z, tree) -> traverse(((n, l, r, x) -> n r l x), f, z, tree)

console.log flatten preorder, t3  # [ 2, 1, 3 ]
console.log flatten inorder, t3   # [ 1, 2, 3 ]
console.log flatten postorder, t3 # [ 1, 3, 2 ]
```

This works in much the same way: we define three traversal functions, each of which calls the `traverse` function, passing a lambda. The only real difference is that CoffeeScript requires us to name and pass all of the parameters, which makes this much more verbose.

## Simpler traversals

Moertel finishes by describing another use for this traversal function: finding the minimum and maximum values in the tree, assuming it's a binary search tree. The Haskell:

```haskell
leftorder  = traverse $ \n l r -> l . n
rightorder = traverse $ \n l r -> r . n

treemin = leftorder min maxBound
treemax = rightorder max minBound

test2l = treemin t3 :: Int  -- 1
test2r = treemax t3 :: Int  -- 3
```

And the CoffeeScript is as you would expect:

```coffeescript
leftorder  = (f, z, tree) -> traverse(((n, l, r, x) -> l n x), f, z, tree)
rightorder = (f, z, tree) -> traverse(((n, l, r, x) -> r n x), f, z, tree)

treemin = (tree) -> leftorder Math.min, Number.MAX_VALUE, tree
treemax = (tree) -> rightorder Math.max, -Number.MAX_VALUE, tree

console.log treemin t3 # 1
console.log treemax t3 # 3
```

## Highlighting some differences between CoffeeScript and Haskell

Haskell is clearly better suited to this task. Most notably, its built in support for partial application reduces the complexity of the code significantly.

In practice, CoffeeScript cannot really be used to implement this algorithm in this way. Highly recursive functions will lead to a stack overflow, as there is no support for tail-call optimisation in any current JavaScript run-time.

But I find it interesting how similar the implementations can be in these two very different languages. And I think this algorithm pattern is a beautiful expression of code, even in CoffeeScript.

## Coda

I hope this has been a fun read. You can [take a look at the code][code] and run it at the command-line using `coffee traversal.coffee`.

[code]: https://gist.github.com/alisdair/5092116

If this sort of programming interests you, you should read [Reg Braithwaite's books][raganwald], most especially [Kestrels, Quirky Birds, and Hopeless Egocentricity][kestrels]. His work is the most accessible introduction to functional programming I know of.

More specifically, [Learn You a Haskell for Great Good][learnyou] is my favourite book on Haskell, with [Real World Haskell][realworldhaskell] a close second. It's definitely [a language worth learning][beating-the-averages].

[raganwald]: https://leanpub.com/u/raganwald
[kestrels]: https://leanpub.com/combinators
[learnyou]: http://learnyouahaskell.com/
[realworldhaskell]: http://book.realworldhaskell.org/
[beating-the-averages]: http://www.paulgraham.com/avg.html
