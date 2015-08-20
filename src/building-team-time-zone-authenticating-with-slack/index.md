This is part four of a five part series on building [Team Time Zone][team-time-zone], a set of international clocks for people working in distributed teams.

[team-time-zone]: https://teamtime.zone/

After [creating and refining the user interface with a test version of the Slack API][part-3], all that remained was to hook up to the real data source. And getting real data requires authentication and authorization.

[part-3]: /building-team-time-zone-creating-the-user-interface/

## Authentication and authorization in Ember

One of the most popular Ember add-ons is [ember-simple-auth][ember-simple-auth]. It helps you sort out all the necessary security stuff to hook up your users with their data. It has three main features: session management, authentication, and authorization.

[ember-simple-auth]: http://ember-simple-auth.com

The in-browser **session** is used to store state about the current user, notably including any tokens required to communicate with the API. In Team Time Zone, I also have a single (easter egg!) user setting, which I also use the session to keep track of.

**Authentication** is establishing your identity with a service provider. In some apps, this means logging in with a user name and password. In our case, it's the process of establishing the API token using the OAuth2 protocol ([described in more detail in an earlier post][planning-oauth2]).

[planning-oauth2]: /building-team-time-zone-inception-prototype-and-planning/#using-oauth2-to-authenticate-web-apps

Once authenticated, simple-auth also helps with **authorization**. In this context, this means using the session state to modify API requests, so that the server can check that you're allowed to access some resource.

For many applications, you can use simple-auth with only a little configuration, and get a working system. If your app uses a simple [OAuth2 bearer token][oauth2-bearer-token] for authorization, and authenticates by sending a user name and password to a `/tokens` endpoint, you're covered. There's also native support for Ruby on Rails apps using the [devise authentication framework][devise].

[oauth2-bearer-token]: http://tools.ietf.org/html/draft-ietf-oauth-v2-bearer-04
[devise]: https://github.com/plataformatec/devise

In other situations, simple-auth can still be really helpful. The overall framework of the design supports custom authenticators and authorizers, and the interfaces for these are really well-designed. Many apps can get up and running really quickly just by customising existing plugins.

## Sending Slack the API token

Slack's API, [as we have probably already established][part-2], is a little weird.

Instead of passing the API token in an `Authorization` header, clients are required to pass it as a normal parameter. For `GET` requests, this adding something to your URL, like `/users.list?token=ABC123`, which is nothing like any of the existing simple-auth authorizers.

But the design of simple-auth still allows this to work. The interface for an authorizer is very flexible. The implementation requires only one method, `authorize`. For example, [here's how the OAuth2 bearer token authorizer works][simple-auth-oauth2-bearer]:

```javascript
  authorize: function(jqXHR, requestOptions) {
    var token = this.get('session.secure.access_token');
    if (this.get('session.isAuthenticated') && !Ember.isEmpty(token)) {
      jqXHR.setRequestHeader('Authorization', 'Bearer ' + token);
    }
  }
```

[simple-auth-oauth2-bearer]: https://github.com/simplabs/ember-simple-auth/blob/master/packages/ember-simple-auth-oauth2/lib/simple-auth-oauth2/authorizers/oauth2.js

For Slack, we need to do some fiddling with the URL instead. I don't know of any reliable, easy way to append a parameter to the URL, so I had to write my own function to do it.

This is the Slack authorizer:

```javascript
  authorize(jqXHR, requestOptions) {
    let token = this.get('session.secure.accessToken');

    if (this.get('session.isAuthenticated') && !Ember.isEmpty(token)) {
      let params = { token };
      requestOptions.url = appendUrlParams(requestOptions.url, params);
    }
  }
```

All this does is delegate the work of munging the URL to an external function. The implementation of that function isn't particularly great, but it's good enough for my purposes. Here it is:

```javascript
export default function(url, params) {
  Object.keys(params).sort().forEach(key => {
    let separator = (url.indexOf('?') === -1) ? '?' : '&';
    let param = encodeURIComponent(key);
    let value = encodeURIComponent(params[key]);

    url += `${separator}${param}=${value}`;
  });

  return url;
}
```

This grabs the keys of the passed params object, sorts them (to make sure the params are applied in a deterministic order), then appends each parameter pair to the url in a loop. Both fields and values are URI encoded.

The code itself isn't particularly neat, or efficient. But it's independent of the rest of the authorizer, so it's really easy to write [a comprehensive set of tests][append-url-params-tests].

[append-url-params-tests]: https://github.com/alisdair/team-time-zone/blob/master/tests/unit/utils/append-url-params-test.js

So that's all there is to authorization! Grab the token out of the session, splat it onto the end of the URL, and we're done. The only problem now is getting the token into the session in the first place.

## Establishing an API token using torii

[torii][torii] is an Ember add-on which helps with OAuth2 authentication. It supports the first few stages of [the 7-step protocol I described in an earlier post][part-1], and comes with built-in authenticators for Google, Facebook, Twitter, and GitHub.

Slack is notably not on that list, and there's a little more work to be done to support it. As a reminder, here's how we establish an API token:

1. You click login, my app opens a pop-up and redirects you to Slack, sending three things: the public ID for my app, a unique state variable for your session, and the requested list of permissions.

2. Slack displays a form displaying permissions my app wants, asking if that's okay with you.

3. You click accept, and Slack redirects to my app, including two pieces of data: an authentication code, and the same state variable from before. I double-check that the state matches your session, to prevent forgery attacks.

4. My app sends the authentication code to my back-end server, which combines it with both the public ID and a secret key for my app, and sends it to the Slack servers.

5. Slack servers verify that the public and secret keys match, and that the authentication code is valid, and issues an API token back to my server.

6. My back-end server forwards the API token to the web application, which informs you that you logged in. Hooray!

7. The web application can now request data directly from the Slack API using this token.

The main contribution of torii to this process is opening the pop-up, redirecting to Slack, and catching the return redirect. This is all encapsulated in a chain of promises, which makes implementing the API-specific parts of this flow really pleasant.

### Implementation

I had to write four modules to make this authentication work: a login route, a simple-auth authenticator, a torii provider, and an initializer to set these all up. Here's how they work together to make this happen.

### Login route

The login route has two responsibilities: set up the secure state parameter, and call our authenticator. Here's the action called when you hit the login button:

```javascript
    login: function() {
      let session = this.get('session');
      let state = randomUrlSafe(32);
      session.set('state', state);
      session.authenticate('authenticator:slack-torii', state);
    }
```

This uses [a simple random URL-safe string generator that I wrote for this project][random-url-safe] to set up the session state, then passes it to the authenticator. Simple!

[random-url-safe]:https://github.com/alisdair/team-time-zone/blob/master/app/utils/random.js

### simple-auth-torii Slack authenticator

Of the other three modules, the authenticator was the easiest to get working. [All of the source code is here][slack-authenticator-github], but the interesting part is the `authenticate` method.

```javascript
  authenticate: function(state) {
    return new Ember.RSVP.Promise((resolve, reject) => {
      this.torii.open('slack-oauth2', state).then(data => {
        return Ember.$.ajax({
          type: 'POST',
          url: '/api/tokens',
          data,
          dataType: 'json'
        });
      }).then(data => {
        resolve(data);
      }).catch(error => {
        reject(error);
      });
    });
  }
```

The promise chain matches the authentication flow: hit the Slack API, then hit our token back-end, then return the token. The part dealing with our token back-end is really simple, just an HTTP `POST` to the token endpoint with Slack's data as the request body. More interesting is the Slack API, which goes through the torii provider.

### torii provider for Slack OAuth2

My Slack torii provider is more involved. It's based on [torii's default OAuth2 code provider][oauth-code-torii-github], with a few additions.

[oauth-code-torii-github]: https://github.com/Vestorly/torii/blob/master/lib/torii/providers/oauth2-code.js

There's a lot of code, so I want to highlight the basic structure of what is going on here by trimming out the less essential parts. [See GitHub for the unabridged source][slack-torii-github].

[slack-torii-github]: https://github.com/alisdair/team-time-zone/blob/master/app/torii-providers/slack-oauth2.js

Here's the `open` method, as called above in the authenticator:

```javascript
  open: function(state) {
    this.set('state', state);

    let url = this.buildUrl();
    let responseParams = ['code', 'state'];

    return this.get('popup').open(url, responseParams).then(function(response) {
      if (response.state !== state) {
        throw new Error(`The response from the provider has an
                        incorrect session state param: should be "${state}",
                        but is "${response.state}"`);
      }

      return { authorizationCode: response.code, };
    });
```

First we set our provider's `state` property, which is used by `buildURL` to create the Slack API request URL. Then we use torii to open the popup, passing our list of expected response parameters.

This returns a promise which will eventually resolve (or reject) when the authentication procedure completes. If it resolves, it should include both `code` and `state`.

First we check that the `state` parameter matches our expected random state, to protect against forgery attacks. And finally, we return the auth code to our authenticator above, which sends it to our back end.

### Initializing torii

The final piece of the puzzle was working out how to hook up the authenticator and the provider. I finally worked this out by reading tons of torii and simple-auth source code. [Here's the initializer that makes it happen][initializer]:

[initializer]: https://github.com/alisdair/team-time-zone/blob/master/app/initializers/slack-torii.js

```javascript
import Authenticator from 'ttz/authenticators/slack';

export default {
  name: 'slack-torii',
  before: 'simple-auth',
  after: 'torii',
  initialize: function(container, application) {
    let torii         = container.lookup('torii:main');
    let authenticator = Authenticator.create({ torii });
    application.register('authenticator:slack-torii', authenticator,
                         { instantiate: false });
  }
};
```

There are a couple of things to note here. First is that the order of these initializers is important: we need this one to run before simple-auth (so that it sets up our authenticator in the registry for simple-auth to find), but after torii (so that we can look up torii in the registry).

Next is how we register our authenticator. We initialize the authenticator by calling `create`, passing in a direct reference to `torii` as a property in the constructor. Then we register it into the registry, setting the `instantiate` option to `false`. I didn't know that you could register instances into an Ember container, I thought it was only classes. But this solves the problem!

## Token back-end

All that's left is taking the Slack authentication data, and finishing off the last few stages of the protocol. This needed a back end server to send an API request to Slack.

Node.js seemed like the perfect choice for this, so I built the server in express. [It's fifty lines of JavaScript, most of which is error handling](https://github.com/alisdair/team-time-zone-backend/blob/master/routes.js).

## Testing

Unfortunately, I haven't figured out a decent testing strategy for any of this code, so it's all only manually tested. I'd love [suggestions on how to improve that](https://github.com/alisdair/team-time-zone/pulls) if you have them!

## Next steps

Having hooked up all this code, I booted up the app, logged into my Slack account, and everything just worked. Despite the complete test coverage and all the preparation, this was still really surprising.

All that was left now was the release process. I had to work out how to deploy the application, make sure it was secure, check it out in production, and let people know about it.
