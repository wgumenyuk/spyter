# Quick Start
## Installation
With PNPM:
```bash
$ pnpm install spyter
```

With NPM:
```bash
$ npm install spyter
```

## Usage with ESM / CommonJS
Spyter is fully compatible with both ESM and CommonJS. Simply import for your module system.

### ESM
```ts
import spyter from "spyter";
```

### CommonJS
```ts
const spyter = require("spyter");
```

## Video Retrieval
To retreive metadata about a video and its audio formats you need to use the [`.getVideo()`](/api/videos?id=getvideourl-options) method.

```ts
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

If found, you will get a [`Video`](api/videos?id=video) object containing the video's metadata and an array of available audio formats ([`Format`](api/videos?id=format)).

## Further Reading

Spyter's API offers more features related to YouTube playlists and search. Learn more about the [API](api.md).