# Spyter
[![npm version](https://img.shields.io/github/package-json/v/wgumenyuk/spyter?label=Version&style=flat-square)](https://npmjs.com/package/spyter)
[![npm downloads](https://img.shields.io/npm/dt/spyter?label=Downloads&style=flat-square)](https://npmjs.com/package/spyter)
[![build](https://img.shields.io/github/actions/workflow/status/wgumenyuk/spyter/build.yml?label=Build&logo=github&style=flat-square)](https://github.com/wgumenyuk/spyter/actions)
[![coverage](https://img.shields.io/codecov/c/github/wgumenyuk/spyter?label=Coverage&logo=codecov&style=flat-square)](https://app.codecov.io/gh/wgumenyuk/spyter)

## Overview
- [About](#about)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Links](#links)
- [License](#license)

## About
Spyter is a modern, audio-focused YouTube crawler for Node.js. It allows you to easily search YouTube and retrieve information about playlists and videos.

- Modern and consistent API
- TypeScript support
- Performant
- No dependencies

## Installation
> ⚠️ **Node.js v18.0.0 or newer is required.**

```sh-session
$ npm install spyter
```

## Quick Start
```ts
import spyter from "spyter";

const video = await spyter.getVideo(
    "https://www.youtube.com/watch?v=ryT-ltTDCko"
);

/*
    {
        id: "ryT-ltTDCko",
        url: "https://www.youtube.com/watch?v=ryT-ltTDCko",
        title: "Prince - Purple Rain (Live At Paisley Park, 1999)",
        channelUrl: "https://www.youtube.com/channel/UCk3ZjUeo6rwtXVdvelevVag",
        channelName: "princevevo",
        thumbnails: [ ... ],
        duration: 696,
        isLive: false,
        formats: [ ... ]
    }
*/
```

### Usage with CommonJS
```js
const spyter = require("spyter");
```

Read more about Spyter's API on the [official wiki](https://github.com/wgumenyuk/spyter/wiki/API).

## Links
- [Documentation](https://github.com/wgumenyuk/spyter/wiki)
- [Frequently Asked Questions](https://github.com/wgumenyuk/spyter/wiki/Frequently-Asked-Questions)
- [GitHub](https://github.com/wgumenyuk/spyter)
- [NPM](https://npmjs.com/package/spyter)

## License
[![license](https://img.shields.io/github/license/wgumenyuk/spyter?label=License&style=flat-square)](./LICENSE)