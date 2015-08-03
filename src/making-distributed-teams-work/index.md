As I write this, I'm half-way through a 3-month client project which has been almost entirely remote. We're in the same time zone, but there are three different teams working together, all hours away from each other.

This has been challenging at times, but I've learned some useful lessons. The main advice I'd give is simple:

* Spend as much as you can afford on your network connection;
* Don't argue about tools, and expect to compromise;
* Prioritise communication over everything else.

## Networking

Network connectivity should be your highest priority. This means having a high quality internet connection, with a fast uplink and low latency, and ideally with a redundant backup connection. It also means you can't work out of a coffee shop or on your 4G connection in the park.

Less obviously, it also means that ethernet is really important. WiFi is amazing technology, but it's so widely adopted now that there is interference everywhere. Our experience on this project is that the majority of our connection reliability problems weren't due to internet connections, but were caused by a saturated WiFi network. Buy an ethernet cable and plug your laptop in.

## Remote pairing

Pair programming is one of the best things about working in a team. But remote pairing can be really challenging.

My best experiences with remote pairing have been using [tmux and Vim][tmux-vim] with voice over Skype or similar. This is still my preferred option. If you're working as part of a team that doesn't use terminal-based editors, [TeamViewer][teamviewer] is probably the best option. It's the best tool we've found for reducing latency and getting through firewalls.

[tmux-vim]: http://pivotallabs.com/how-we-use-tmux-for-remote-pair-programming/
[teamviewer]: http://www.teamviewer.com/

While pairing is great, it's not without cost. Some team members will find it exhausting and frustrating. Trying to work at the pace of another developer can be difficult, and having to constantly communicate makes it impossible to spend time quietly thinking.

Don't try to pair all of the time. Instead, schedule time for pairing, for solo work, and for show & tell sessions to share lessons learned.

## Development environment

Some of my co-workers on this project like using [RubyMine][rubymine]. I like using [Vim][vim]. It's hard to imagine two more different development environments for working on the same codebase.

[rubymine]: http://www.jetbrains.com/ruby/
[vim]: https://github.com/tpope

I've tried to learn RubyMine and have found it impossible to work with. My colleagues have tried using Vim and almost accidentally deleted my home directory. So as a compromise, we're using [SublimeText][sublimetext] most of the time. This isn't ideal for anyone, but it's the best outcome.

[sublimetext]: http://www.sublimetext.com

The general lesson here is to try to meet in the middle. If everyone on the project can agree on the same tools and settings, that's great! But if not, find some set of compromises that lets everyone work well enough to get things done, even if that means both parts of the pair go slightly slower.

## Community

When your whole team is in one building, it's easy to chat and socialise in downtime. If you're in multiple locations, this is much harder. But it's still vital. People need to build relationships with their teammates to work well together.

I've found that the easiest way to do this is a group chat tool. We use [Slack][slack], which is incredible for the job. We have a few channels, one of which is exclusively for off-topic nonsense. In there, people post [cat GIFs][cat-gif], [stupid jokes][stupid-joke], [YouTube videos][youtube-video], and argue about [tabs vs spaces][fuck-tabs].

[slack]: http://www.teamviewer.com/en/index.aspx
[cat-gif]: http://i.imgur.com/NwcK2Rb.gif
[stupid-joke]: http://i.imgur.com/E2LDACb.png
[youtube-video]: https://www.youtube.com/watch?v=5I_QzPLEjM4
[fuck-tabs]: http://i.imgur.com/8CoTSMF.gif

It's important to be aware that Slack (and HipChat, and Campfire, and IRC) aren't the most inclusive of tools. They're biased towards particular types of people: those happy to task switch rapidly when someone posts a message, fast readers, efficient typists, and especially those who are used to text-based chat of some kind. Be aware that this may isolate remote workers who don't fit this profile.

## Communication

Everyone needs to be in touch with each other throughout the day. Chat tools are a great way of doing this. Having everyone on the same voice/video chat system is great as well. We're using Skype, which works perfectly for this.

In a remote team, it's more important than ever that someone is able to get in touch with you with various levels of urgency. Multiple communication channels can allow this.

The solution we're using is straightforward. If it's not time sensitive, we use email. If it's urgent, we use Skype. If it's time sensitive but not urgent, we use Slack.

Everyone is expected to read email daily or so, answer Skype calls as soon as possible, and pay casual attention to Slack. This allows us to get in touch with each other without interrupting too much.

## Feedback

The final lesson I've learned from remote work is how important feedback sessions are. Without casual face-to-face chats, it can be really hard to deal with minor problems that are too insignificant to send email about.

On this project, we have fortnightly feedback and review meetings, where everyone chips in with things that are going well, things that are going poorly, and puzzles. This is a great chance to make the project work better for everyone.

So far we've found that everyone has the same minor complaints: internet problems, concerns about planning, specific technical concerns. We air them in these meetings and discuss solutions, then work around them.

I'm sure without pre-scheduled feedback sessions, these problems would fester and never be fixed. Having a process really helps everyone here, and it's well worth the hour every fortnight.

## Final thoughts

Remote work is difficult but can be really fun. I find it much more productive than being on-site in working conditions that don't suit me. There are problems&mdash;but there are also thousands of people working remotely now, so there are also solutions. Sort out your networking, choose the right tools, and come up with a good process, and it'll work out fine.
