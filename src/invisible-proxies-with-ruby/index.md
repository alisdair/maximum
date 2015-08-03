One of the coolest aspects of ActiveRecord is its support for associations. You use a domain-specific language to define your associations, and collection methods are defined so that you can access them.

Here's an example:

```ruby
class Student < ActiveRecord::Base
  has_many :exams
end

Student.find(:first).exams # => [#<Exam: @title => 'Maths', ...]
Student.find(:first).exams.class # => Array
```

From this example, `has_many` seems fairly simple to implement. Just add an instance variable called exams for each Student, then add accessor methods.

However, we can also add new records to the database like this:

```ruby
Student.find(:first).exams << Exam.new('Maths')
```

But how does that work? `Student#exams` returns an Array, so how can you add records to the database using `Array#<<`?

The way ActiveRecord does this is using an invisible proxy. In fact, `Student#exams` doesn't return an `Array` object, it returns a `HasManyAssociation` object which dresses up as an `Array` on the weekends.

## Implementing an Invisible Proxy

There are several steps to creating a proxy class. If all this story-telling is getting a bit much, jump ahead and read all the code. Otherwise, read on!

### Clean the Slate!

The first step is to undefine all the instance methods your proxy class has, except those which are definitely needed:

```ruby
class InvisibleProxy
  instance_methods.each do |m|
    undef_method(m) unless m =~ /(^__|^nil\?$|^send$|^object_id$)/
  end
end
```

This stops your proxy responding to all methods except the essentials: `__id__`, `__send__`, `nil?`, `send`, and `object_id`. Note that this includes methods like `class` and `kind_of?`, so the class hierarchy is being subverted: your proxy will masquerade as its target.

### Forward!

Then, you need your proxy implementation. We just forward all calls to `respond_to?` and any missing methods on to the target object:

```ruby
class InvisibleProxy
  def initialize
    @target = [1, 2, 3, 4]
  end

  def respond_to?(symbol, include_priv=false)
    @target.respond_to?(symbol, include_priv)
  end

  private

  def method_missing(method, *args, &block)
    @target.send(method, *args, &block)
  end
end
```

### Override!

Now every instance of `InvisibleProxy` appears to be an `Array` with value `[1, 2, 3, 4]`. You can add instance methods to your proxy class to override or add to those provided by `Array`, and your users need never know.

For example, you might want `Array#<<` to act like `Array#+` when passed an array:

```ruby
class InvisibleProxy
  def <<(object)
    if object.is_a? Array
      @target += object
    else
      @target << object
    end
  end
end
```

## Coda and Code

Invisible proxies are fun. Use them! [Here's a gist with some sample code for you to play with](https://gist.github.com/3550245).

<p class="footnote">Note: this post was originally written in December 2005. I dug it out and updated it a little bit for 2012.</p>
