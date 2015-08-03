Standard hashes in Ruby return `nil` for unknown keys, but you can change the default value. I ran into an "eww! ugly code!" problem earlier today, and the solution was an auto-vivifying hash: one which has a default value of a new empty hash.

It's clearer why this is useful with an example application. Here's some naive Ruby code for counting word frequencies:

```ruby
corpus = {}
for word in document.split
  corpus[word] = 0 if corpus[word].nil?
  corpus[word]++
end
```

We can do better than that! Let's set the default value for any key in corpus to 0. Look how much nicer that is:

```ruby
corpus = Hash.new(0)
document.split.each {|word| corpus[word]++ }
```

Less code! So much less that we can fit the loop onto one line. But when your hash contents get more complicated, `Hash.new(value)` is no use. Say you wanted to write code like this:

```ruby
pages = ['AccountController#show',
         'TrackController#show',
         'TrackController#dashboard',
         'AccountController#show']

def count_hits(pages)
  for controller, action in pages.map {|p| p.split /#/ }
    @hits[controller][action] += 1
  end
end
```

In this case, you want the default value of the hash to be another hash, which itself has a default value of 0. So, you might try this:

```ruby
>> @hits = Hash.new(Hash.new(0))
=> {}
>> @hits[:foo]
=> {}
>> @hits[:foo][:bar]
=> 0
```

Looks good so far. What about after we call `count_hits(pages)`?

```ruby
>> count_hits(pages);
>> @hits
=> {}
```

Wait! Why is the hash empty?

```ruby
>> @hits["AccountController"]
=> {"dashboard"=>1, "show"=>3}
>> @hits["TrackController"]
=> {"dashboard"=>1, "show"=>3}
```

Disaster! The problem here is that `@hits = Hash.new(Hash.new(0))` returns the same empty hash object to every access, and never stores the key. And as you can see, the "show" actions of the Account and Track controllers have been counted together.

Instead, you really want the default value to be a new hash, so that every key gets a different one. And here's how to do it:

```ruby
>> @hits = Hash.new {|h, k| h[k] = Hash.new(0) };
>> count_hits(pages);
>> @hits
=> {"AccountController"=>{"show"=>2},
 "TrackController"=>{"show"=>1, "dashboard"=>1}}
```

Passing a block to `Hash.new` causes that code to be executed when a new key is accessed. Note here that we create a new `Hash` with default value 0, and also store it in the original `Hash` at the key position. Problem solved!

More generally, you can go n-deep with hash default values, by overriding the default method in a sub-class:

```ruby
class HashHash < Hash
  def default(key = nil)
    self[key] = self.class.new
  end
end
```

This allows you to do all sorts of magic:

```ruby
>> hash = HashHash.new
=> {}
>> hash[1][2][3] = 4
=> 4
>> hash[1][2]
=> {3=>4}
>> hash[1]
=> {2=>{3=>4}}
>> hash
=> {1=>{2=>{3=>4}}}
```

It's [hashes all the way down](http://en.wikipedia.org/wiki/Turtles_all_the_way_down)!

<p class="footnote">Original post from 2006. Inspired by <a href="http://blade.nagaokaut.ac.jp/cgi-bin/scat.rb/ruby/ruby-talk/154010">a post on ruby-talk by Dave Burt</a>. Retrieved and updated slightly in 2012.</p>
