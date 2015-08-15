This is part four of a five part series on building [Team Time Zone][team-time-zone], a set of international clocks for people working in distributed teams.

[team-time-zone]: https://teamtime.zone/

After [creating and refining the user interface with a test version of the Slack API][part-3], all that remained was to hook up to the real data source. Right at the start of the project, I had [planned how this was going to happen][part-1]. I [implemented an Ember Data adapter for the API][part-2], and I would use [the torii authentication framework][torii] to create the API token.

[part-1]: /building-team-time-zone-inception-prototype-and-planning/
[part-2]: /building-team-time-zone-ember-data-and-the-slack-api/
[part-3]: /building-team-time-zone-inception-creating-the-user-interface/
[torii]: https://github.com/Vestorly/torii

## Authentication and authorization in Ember

One of the most popular Ember add-ons is [ember-simple-auth][ember-simple-auth]. It helps you sort out all the necessary security stuff to hook up your users with their data. It has three main features: session management, authentication, and authorization.

[ember-simple-auth]: http://ember-simple-auth.com

The in-browser **session** is used to store state about the current user, notably including any tokens required to communicate with the API. In Team Time Zone, I also have a single (easter egg!) user setting, which I also use the session to keep track of.

**Authentication** is establishing your identity with a service provider. In some apps, this means logging in with a user name and password. In our case, it's the process of establishing the API token using the OAuth2 protocol ([described in more detail in an earlier post][part-2]).

Once authenticated, simple-auth also helps with **authorization**. In this context, this means using the session state to modify API requests, so that the server can check that you're allowed to access some resource.

For many applications, you can use simple-auth with only a little configuration, and get a working system. If your app uses a simple [OAuth2 bearer token][oauth2-bearer-token] for authorization, and authenticates by sending a user name and password to a `/tokens` endpoint, you're covered. There's also native support for Ruby on Rails apps using the [devise authentication framework][devise].

[oauth2-bearer-token]: http://tools.ietf.org/html/draft-ietf-oauth-v2-bearer-04
[devise]: https://github.com/plataformatec/devise

In other situations, simple-auth can still be really helpful. The overall framework of the design supports custom authenticators and authorizers, and the interfaces for these are really well-designed. Many apps can get up and running really quickly just by customising existing plugins.

## Sending Slack the API token

Slack's API, [as we have probably already established][part-2], is a little weird. In particular, its authorization mechanism is not standard at all.

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

## torii, state, and man-in-the-middle attacks

## Next steps
