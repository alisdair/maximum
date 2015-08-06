# Maximum

[![Build Status](https://travis-ci.org/alisdair/maximum.svg)](https://travis-ci.org/alisdair/maximum)

Software for building the weblog I want to write. Supports writing [posts which include interactive demos with SVGs](http://alisdair.mcdiarmid.org/arm-immediate-value-encoding/):

- Per-post CSS and JavaScript, written in separate files

- Embed partials at the end of posts

- Configurable per-post Handlebars layouts

- Arbitrary JSON data for each post, which can be used by the JavaScript or the layout

Also has some other more common features:

- Write in GitHub-flavoured Markdown, with fenced code blocks and decent syntax highlighting

- Sass and autoprefixer for CSS generation

- CSS minified then embedded into the HTML, to reduce render time

- Depends only on Node, with Node scripts for build, local serve, and deploy

## Usage

1. `npm install`
2. `npm start`

## Deployment

1. `npm config set alisdair.mcdiarmid.org:server user@rsynchost:path-with-trailing-slash/`
2. `npm run deploy`

## Todo

- [ ] Add script to generate new posts
- [ ] Add tests for per-post JavaScript, refactoring the ARM post first
- [x] Split build.js into multiple files and refactor
- [ ] Investigate releasing some of the transforms as metalsmith plugin modules
