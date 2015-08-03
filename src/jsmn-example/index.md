I recently had to parse [JSON](http://www.json.org/) on a very small embedded system. When looking for tools to help with this, I found and loved Serge Zaitsev's [jsmn](http://zserge.com/jsmn.html).

The philosophy behind jsmn is to be as simple as possible: no dynamic memory allocation, no callbacks, and absolutely no dependences. It's a great piece of software, but there are no examples, so it took a couple of hours to get going.

To fix this, I've put together [some jsmn examples](https://github.com/alisdair/jsmn-example) written in C99, using [libcurl](http://curl.haxx.se/libcurl/) and consuming the GitHub and Twitter JSON APIs. 

These examples were intended to be concise. Unfortunately this is C programming, so there's over 350 lines of code to understand. This post describes some of the ideas behind the examples.

## GitHub User API

This is the simplest use of JSON I could think of: displaying some fields from [my GitHub profile](https://github.com/alisdair) using the [GitHub Developer API](http://developer.github.com/v3/users/#get-a-single-user). The resource returns one JSON object, which makes it very easy to process. Take a look at [the JSON for my profile](https://api.github.com/users/alisdair) if you want an example.

[The github.c program](https://github.com/alisdair/jsmn-example/blob/master/github.c) fetches the JSON into a string, then parses it, and prints out the keys and values for the fields specified. To start, two functions from [the json.c module](https://github.com/alisdair/jsmn-example/blob/master/json.c) are used to interface with libcurl, and to tokenise the JSON, allocating memory appropriately.

```c
char *js = json_fetch(URL);
jsmntok_t *tokens = json_tokenise(js);

typedef enum { START, KEY, PRINT, SKIP, STOP } parse_state;
parse_state state = START;

size_t object_tokens = 0;
```

At the centre of the JSON processing code is a `switch`-based state machine. There are five states, which correspond to positions in the JSON object tree. One other state variable is used to track how many tokens within the object remain.

```c
for (size_t i = 0, j = 1; j > 0; i++, j--)
{
    jsmntok_t *t = &tokens[i];

    // Should never reach uninitialized tokens
    log_assert(t->start != -1 && t->end != -1);

    if (t->type == JSMN_ARRAY || t->type == JSMN_OBJECT)
        j += t->size;

    switch (state)
    {
```

The core loop for processing the JSON tokens is simpler than it looks. `i` is the index into the `tokens` buffer, and `j` is the number of tokens left to process. If parsing has succeeded, we know for certain that there is at least one token in the list, so `j` is initialised to 1.

Each iteration of the loop increments `i` to move to the next token, and decrements `j` to indicate that a token has been processed. When there are no tokens left to process, the loop exits.

When we find an array or an object, we add its child count (`size`) to the number of tokens left to parse. Because all JSON documents are required to have a root object or array, this will always work, and we don't need to know how many tokens there are in the array to safely process it.

```c
case START:
    if (t->type != JSMN_OBJECT)
        log_die("Root element must be an object.");

    state = KEY;
    object_tokens = t->size;

    if (object_tokens == 0)
        state = STOP;

    if (object_tokens % 2 != 0)
        log_die("Object must have even number of children.");

    break;
```

The `START` state checks that the first token is an object, sets up the transition to the next state, and notes the number of tokens to be parsed from the object.

```c
case KEY:
    object_tokens--;

    if (t->type != JSMN_STRING)
        log_die("Object keys must be strings.");

    state = SKIP;

    for (size_t i = 0; i < sizeof(KEYS)/sizeof(char *); i++)
    {
        if (json_token_streq(js, t, KEYS[i]))
        {
            printf("%s: ", KEYS[i]);
            state = PRINT;
            break;
        }
    }

    break;
```

The `KEY` state defaults to skipping the corresponding value, unless the token matches one of the desired keys. If it does match, we print the key and transition to `PRINT` instead of `SKIP`.

```c
case SKIP:
    if (t->type != JSMN_STRING && t->type != JSMN_PRIMITIVE)
        log_die("Object values must be strings or primitives.");

    object_tokens--;
    state = KEY;

    if (object_tokens == 0)
        state = STOP;

    break;
```

`SKIP` is straightforward: decrement the number of tokens and transition back to `KEY`; unless we've exhausted all the `object_tokens`, in which case `STOP`.

```c
case PRINT:
    if (t->type != JSMN_STRING && t->type != JSMN_PRIMITIVE)
        log_die("Object values must be strings or primitives.");

    char *str = json_token_tostr(js, t);
    puts(str);

    object_tokens--;
    state = KEY;

    if (object_tokens == 0)
        state = STOP;

    break;
```

Finally, `PRINT` uses the destructive `json_token_tostr` function to insert a NUL byte at the end of the string, then prints it out followed by a newline. Like `SKIP`, it moves to either `KEY` or `STOP` depending on how many tokens are left.

The result is:

```terminal
jsmn-example $ ./github
hireable: true
public_repos: 7
name: Alisdair McDiarmid
location: Glasgow
```

## Twitter Trends API

The first jsmn example I wrote was this one, fetching and displaying the current trends from [Twitter](https://twitter.com/):

```text
jsmn-example $ ./twitter
#MentionADateYouWillNeverForget
#20ThingsIDontLike
#excellentwords
Joseph Morgan Is A Sweetheart
We Are Never Ever Getting Back Together
Alex Russo
YouTube
Gamescom
Miley Cyrus
Vita
```

[The Twitter trends JSON output](https://api.twitter.com/1/trends/1.json) has a more complex object graph. As a result, [the twitter.c program](https://github.com/alisdair/jsmn-example/blob/master/twitter.c) has a more complex state machine. Even though it collapses the key-value states into one per object type, it has twice the number of states and four additional state variables.

Additionally, it uses a second level `parse_state`, awkwardly called `stack`. This allows the parser to cope gracefully with reaching the end of an object branch, by "popping the stack" and moving back to a previous state. The main use of this is within the `SKIP` state.

```c
case SKIP:
    skip_tokens--;

    if (t->type == JSMN_ARRAY || t->type == JSMN_OBJECT)
        skip_tokens += t->size;

    if (skip_tokens == 0)
        state = stack;

    break;
```

The `SKIP` state in this machine is used to ignore any object values that we don't care about, even if they're entire object trees. The state has its own `skip_tokens` count, which mirrors the `j` loop variable in use: increasing when new child-bearing tokens are found, and decrementing each iteration through the `tokens` buffer.

This pattern reflects how I ended up using jsmn in my embedded systems project. It's robust to backwards-compatible changes in the JSON output, while remaining efficient and relatively easy to understand.

## Bugs and Testing

None of these examples handle string unescaping at all, and neither does jsmn. As a result, UTF-8 entities and control characters will remain escaped in the output strings. For my project's use of JSON, this isn't a problem, so solving it is an exercise for the reader.

Also, I've been lazy and haven't written any unit tests for these examples. Pull requests are welcome.

[The jsmn example code is on GitHub](https://github.com/alisdair/jsmn-example). If you have any comments, [let me know via Twitter](https://twitter.com/alisdair).
