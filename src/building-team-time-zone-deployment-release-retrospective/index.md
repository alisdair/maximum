This is the final part of a five part series on building [Team Time Zone][team-time-zone], an app for figuring out what time it is for everyone on your Slack team.

[team-time-zone]: https://teamtime.zone/

## Getting to Production

Having built an app that worked on my MacBook, all that was left was putting it into production. [I bought a domain name from Hover](https://www.hover.com/), and then tried to work out where to point it.

There were basically three requirements for hosting:

1. I needed to serve the Ember app index page and its assets;
2. The `/api/tokens` path of the same host had to point to my Node.js app;
3. Everything had to be protected via HTTPS.

The first requirement could have been solved by many hosts: S3, GitHub pages, Divshot, anything. Unfortunately, needing a tiny API restricted me to needing some sort of a server with the ability to run code.

I decided to go with [Linode][linode], as I'm already using it for my [TrackChair][trackchair] side project. I've heard both good and bad things about Linode, but my experience has been entirely positive. If you have fairly simple hosting requirements and no need to rapidly scale up to meet load, I think a VPS provider is a pretty good choice. And Linode is consistently rated fairly highly.

[linode]: https://www.linode.com/
[trackchair]: https://www.trackchair.com/

While I wasn't asking for usernames or passwords, the app is sending a Slack access token over the wire. Sending this over plaintext was unacceptably risky, so I needed to cough up for an SSL certificate, and set up the server accordingly.

I don't have any real experience with deployment automation, like Chef, ansible, or Docker. And now wasn't the best time to learn, so my server is a beautiful hand crafted unicorn. I'm fine with this, I suppose.

I wish it was easier to deploy small Ember apps which need a supporting back-end API. If you're working on solving this problem already, get in touch, I'd love to help.

## Deployment: Linode, nginx, Ember, and Node.js

My Linode is running Debian 8.1, with the packaged version of nginx 1.6. My configuration uses [Mozilla's recommended settings for SSL](https://wiki.mozilla.org/Security/Server_Side_TLS#Nginx), which gets me [an A+ rating on Qualys' SSL Labs report](https://www.ssllabs.com/ssltest/analyze.html?d=teamtime.zone&latest).

The server configuration took a while to get right, so it's worth going over briefly. Here's an abbreviated version, with some inline comments explaining what each section is for.

```nginxconf
server {
    listen 443 ssl;
    server_name teamtime.zone;

    # I deploy the Ember app to this directory
    root /home/deploy/team-time-zone;
    index index.html;

    # This allows nginx to serve my app's routes (e.g. /about)
    # by loading the index.html file directly
    location / {
        # First attempt to serve request as file, then
        # serve the index page instead.
        try_files $uri /index.html;
    }       

    # The backend runs on a local port of 4300, so proxy all API
    # requests to that address
    location /api/ {
        proxy_pass http://localhost:4300;
    }       

    # Cache all assets for a month
    location /assets/ {
        expires 1M;
        add_header Cache-Control "public";
    }       
}
```

### Deploying the Ember app: rsync

To actually deploy my app, I looked at using [ember-cli-deploy][ember-cli-deploy], which is the defacto standard way of deploying Ember apps. There are currently no adapters that suit my needs, so instead of blocking the release, I just decided to do the simplest thing that works.

[ember-cli-deploy]: https://github.com/ember-cli/ember-cli-deploy

So my deployment task consists of `rsync`ing my build directory up to the server, which I access over ssh. This might not work particularly well for an app with more traffic&mdash;you'd need to be careful to sync all the assets before the index file, for a start&mdash;but it's good enough for now.

### Deploying the back end: runit

I was puzzled for a long time about how to effectively deploy the Node app. I eventually settled on using [runit][runit] to keep it alive, and again rsync to update to new builds. I don't anticipate deploying a new version ever again, so I'm hoping that will be fine for now.

[runit]: http://smarden.org/runit/index.html

After asking for help on this topic on Twitter, [Craig Morrison recommended ShipIt for deploying Node apps](https://twitter.com/craigmorrison/status/630028029297852417). This looks like a good choice, but I haven't got around to trying it yet.

## Performance

With everything deployed, I was almost ready to announce the app to my half-dozen non-robot Twitter followers. But first, I wanted to try it out with a larger team. [The Ember.js community Slack](https://ember-community-slackin.herokuapp.com) seemed like a good choice.

It turns out that loading over 2,500 users into the app didn't go particularly well. On first attempt, nothing rendered at all. I eventually tracked this down to [Ember.computed.min](http://emberjs.com/api/classes/Ember.computed.html#method_min) completely exploding with over a few hundred items. This was surprising, but again I didn't want to block my release, [so I just patched it out with a manual replacement](https://github.com/alisdair/team-time-zone/commit/7390bc0120c24674863a5829556a0ca209294a65).

The app itself also wasn't particularly useful when showing thousands of users, so I also added a hard cap of 100 people. Then you can at least search for the people that are relevant to you without your browser exploding.

These performance problems were before the introduction of [the Glimmer rendering engine](https://github.com/emberjs/ember.js/pull/10501). Looking again after an upgrade to 1.13 showed that render performance was much better, so I increased the limit to 250 users. Something smarter would be needed to cope with thousands of users, perhaps using something like [list-view](https://github.com/emberjs/list-view).

## Lessons learned

Team Time Zone took way longer to build than I expected. I'm (purposefully) not tracking user stats, so I don't know if anyone else is using it. If you are using the app, please tweet at me to let me know!

But even if I'm the only user, I still think it was worth doing.

I learned a lot about the internals of Ember Data adapters and serializers, and how simple-auth and torii work. Both of these things are likely to be useful in my day job at some point. I also finally used flexbox in a real application, so I'm almost up to date with CSS from 2012 now.

This is also the first Node.js-backed application I've built. While the back-end is super simple, I had to pick up a lot of small things about how express.js worked, and also learned how to deploy Node apps. This directly led to me building a few Node modules recently.

I've also enjoyed writing this series of retrospective articles. It's been fun to braindump the process, and hopefully someone will find something useful from Googling later.

## Shipping is fun

But the main thing I learned is about shipping side projects. This is the first reasonable-sized hobby project that I've actually finished for a couple of years now. And the reason I was able to do that was by fixing a basic part of my approach.

Instead of trying to build things properly, I started off purposefully building sloppy code, without tests, and knowing that it was a mess. Without learning to do this, I would never have been able to finish this project.

I also learned that sometimes it's okay to leave the boring or difficult stuff until last. I've always tried to force myself to fix the hard problems first, so that I can then enjoy the easy ones. This time I realised that sometimes I need the motivation to fix those problems, and it really helped.

And something else really important I learned from my friend [Jason Frame](http://jasonframe.co.uk): just because it's not finished doesn't mean you shouldn't ship it. I had lots of ambitious ideas for Team Time Zone that I wanted to get done before releasing anything to the world.

But after talking with him about side projects and coder's block, I've learned to start my side projects as public by default, even when incomplete. So Team Time Zone was on GitHub from the first commit. Knowing that it was up there was a little more motivation to finish it and ship.

## Future

Team Time Zone works pretty well for me. There are only a few things I'd like to do next.

I want to upgrade to Ember 2.0 as soon as possible. I'm waiting for [the new version of ember-simple-auth][simple-auth-jjabrams]. Right now, it's the source of all my 1.13 deprecations, so the rest of the upgrade should go well. Looking forward to seeing how it works with torii.

[simple-auth-jjabrams]: https://github.com/simplabs/ember-simple-auth/pull/602

It would be nice if the deployment process wasn't such a disaster. It would be great to be able to use [ember-cli-deploy][ember-cli-deploy], but I'd have to do a lot of work to get there. I need an ssh adapter for assets, which doesn't exist yet. I also need to work out how to deploy the index, ideally without adding a dependency on Redis. It's low priority, considering how rarely I'll release.

I'd also like to look into the performance problems with large teams. There's not so much data going through the app that this should be insurmountable, but it's going to have to be much smarter about not rendering off-screen profiles.

## Thanks

There are lots of people and projects to thank. Number one is probably [Sam Selikoff][sam-selikoff]. I couldn't have built this project without [ember-cli-mirage][mirage]. I would never have been able to get my app authenticated with Slack if I hadn't already built something worthwhile first, and only mirage let me do that.

[sam-selikoff]: https://github.com/samselikoff
[mirage]: https://github.com/samselikoff/ember-cli-mirage

If you're building Ember apps against JSON APIs, and you're not already using mirage to develop or test them, you should really look into it.

[torii][torii] has also been really valuable, as has [simple-auth][simple-auth]. My very next project is to try to contribute something back to at least one of these projects.

[torii]: https://github.com/Vestorly/torii
[simple-auth]: https://github.com/simplabs/ember-simple-auth

Of course, this would not have been possible without Slack. For all my kvetching about it being a bit weird, the Slack web API is amazing. I hope to see many more little apps like mine using it to do even cooler stuff.

And finally, eternal thanks to my partner Vic, who put up with me frowning at my MacBook and typing furiously when I should have been feeding the cats or doing the dishes. I'm just about to do both right now, I promise.
