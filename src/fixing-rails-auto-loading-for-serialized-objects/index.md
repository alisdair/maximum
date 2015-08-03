ActiveRecord's `serialize` method doesn't auto-load custom classes when Rails is in development mode. This means that sometimes your serialised columns will remain as serialised YAML strings instead of the objects you want. This is not documented, isn't really a Rails bug, and is quite confusing. But it can be fixed!

## Symptoms

Your model serialises some value object, or a collection of objects. Creating and saving the model instance works fine, but if you modify some code and try to view the saved model, it doesn't work. Instead of giving you the objects you expected, the serialised field gives you a YAML string. Reloading your application fixes it. You are puzzled.

## Problem and solution

The source of the problem is that classes are lazy-loaded in development mode, and the YAML unmarshalling process doesn't trigger this loading. Your classes aren't loaded when you try to deserialise the field, and so it fails.

To fix it, you will need to configure Rails to eager load your custom classes, and reload them on each request if they've changed. This same solution is used by [Draper](https://github.com/drapergem/draper) to force decorator loading; specifically thanks to [Ryan Cook's pull request for a similar issue](https://github.com/drapergem/draper/pull/188).

Add lines like these to your `config/application.rb` initialiser:

```ruby
# Eager load all value objects, as they may be instantiated from
# YAML before the symbol is referenced
config.before_initialize do |app|
	app.config.paths.add 'app/values', :eager_load => true
end

# Reload cached/serialized classes before every request (in development
# mode) or on startup (in production mode)
config.to_prepare do
	Dir[ File.expand_path(Rails.root.join("app/values/*.rb")) ].each do |file|
		require_dependency file
	end
	require_dependency 'article_cache'
end
```

In this case, I've set up a directory for my value object classes&mdash;`app/values`&mdash; and I also have a serialised cache of all articles in another class, `article_cache`.

The first configuration stanza eager-loads the classes I'm serialising, even before they're referenced. The second one ensures that they are always reloaded on every request in development mode. The problem isn't solved, but the symptoms go away.

My main reason for writing this post is to document this workaround. But if you want to know more about about what's going on and why, read on.

## Digging deeper

There are a lot of components of Rails combining to cause this problem. Understanding what's really happening takes you on a trip all the way from the database to Ruby core itself.

### Class auto loading

In development mode, [Rails's dependency manager auto loads classes](https://github.com/rails/rails/blob/master/activesupport/lib/active_support/dependencies.rb) when a symbol fails to resolve. This amazing feature is what allows live coding in development mode: no need to restart the server every time you change a file.

This works by using Ruby's [`const_missing`/`const_defined?`](http://www.ruby-doc.org/core-1.9.3/Module.html#method-i-const_defined-3F) hook, which is triggered whenever an unknown constant is used. Rails searches its configured auto-load paths&mdash;by default, everything in `app`&mdash;and loads any file matching the constant. So you didn't have to explicitly load your value classes in order to instantiate them and serialise those objects, because just using the name of the class in your code did this for you.

### Loading serialised objects

ActiveRecord's [`serialize`](https://github.com/rails/rails/blob/master/activerecord/lib/active_record/attribute_methods/serialization.rb) allows you to serialise objects using any coding scheme you want. If your serialised class responds to `load` and `dump`, those methods will be used for serialisation. If not, the default [YAMLColumn](https://github.com/rails/rails/blob/master/activerecord/lib/active_record/coders/yaml_column.rb) coder will be used. This is a thin wrapper around Ruby's YAML marshalling code.

When the Ruby object marshaller loads serialised objects, it doesn't use the normal Ruby mechanism for resolving missing symbols. The `const_missing` hook is not called, and as a result, the Rails auto loader doesn't run. So if you try to use `YAML.load` to instantiate an object of an unloaded class, it will fail with an `ArgumentError` exception even if the class exists in your source tree somewhere.

```ruby
>> YAML.load "---\n- !ruby/object:UnknownClass {}"
ArgumentError: undefined class/module UnknownClass
```

An aside: note that `YAMLColumn` catches this exception, so that failures result in a raw YAML string being returned instead. Because of this, you will have to defensively code and check for this if you want your application to be robust.

### Write-only objects

The code path that writes your serialised objects probably refers to the classes by symbol to instantiate them. For example:

```ruby
a = Article.new(:title => "Lorem")
a.sections = [Lede.new("Ipsum"), Section.new("Dolor"), Section.new("Sit amet")]
a.save
```

But if the code that reads the object doesn't refer to the symbols before inspecting the column, it can fail:

```ruby
class Article
  def ledes
    self.sections.select {|s| s.class == Lede }
  end
end
```

If the classes haven't been loaded, this method will result in a `NoMethodError` due to calling `select` on a `String`&mdash;the serialised YAML. So you can write your serialised objects, but you can't read them.

### Auto load flushing

This problem only occurs in two circumstances. The first is understandable: you write a serialised object, restart the server, then try to read it. Obviously the class hasn't been loaded, so it fails.

But the second is more confusing. If you write a serialised object, then change some other file, reading the object fails. You haven't restarted the server, so the class should still be loaded. Why does it fail?

This is because changing code in your application triggers an `ActiveSupport::Dependency` clear event. This unloads all auto loaded constants, so that they will be loaded again only if necessary. If your serialised class was auto loaded, it won't load after this process happens. And this is the root cause of the problem.

## Fixing the problem: patching Rails or Ruby?

Having diagnosed the problem and come up with a workaround, I tried patching the `YAMLColumn` marshaller class in Rails. Even with the best solution I could come up with, the [cure was worse than the disease](https://github.com/alisdair/rails/commit/83805568af9c7b1250fed1a4ccf69f622de8e784):

```ruby
rescue ArgumentError => e
  # Invoke the autoloader and try again if object's class is undefined
  if e.message =~ /undefined class\/module (.*)$/
    $1.constantize rescue return yaml
  end
  return load(yaml)
```

Applying a regexp to an exception message to find which constant failed to load is fragile and obviously completely unnacceptable, so I didn't even bother submitting this to Rails core. I don't think there's anything else that can be done from within Rails itself.

The correct solution to this issue would be to change the marshalling code in Ruby to allow Rails's autoloader to work. [Aaron Patterson filed a Ruby core bug about this two years ago](https://bugs.ruby-lang.org/issues/3511), including a patch with a proposed implementation. Hopefully this is accepted, so that auto-loading and serialisation can be friends.
