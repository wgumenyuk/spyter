# Examples
Here are some examples to inspire you and get you started.
All examples use ESM-style imports, but Spyter is fully compatible with ESM and CommonJS. Simply import for your module system.

## Usage with *discord.js*
Unlike other packages, Spyter **does not** create readable streams that can be directly passed to *discord.js*.
The recommended way to use Spyter with *discord.js* is to use a custom `FFmpeg` stream from [`prism-media`](https://npmjs.com/package/prism-media).

> For livestreams, it is necessary to use formats that have the `isLive` property, otherwise you will only get a small portion of the audio.

```ts
import spyter from "spyter";
import {
    joinVoiceChannel,
    createAudioPlayer,
    createAudioResource
} from "@discordjs/voice";
import { FFmpeg } from "prism-media";

const connection = joinVoiceChannel(/* ... */);

const audioPlayer = createAudioPlayer();
connection.subscribe(audioPlayer);

// Prince - Purple Rain (Live At Paisley Park, 1999)
const formats = await spyter.getVideoFormats(
    "https://www.youtube.com/watch?v=ryT-ltTDCko"
);

// In case of livestreams, find live audio formats
const format =
    formats.find((format) => format.isLive) ||
    formats[formats.length - 1];

const stream = new FFmpeg({
    args: [
        "-i", format.url,
        "-analyzeduration", "0",
        "-loglevel", "0",
        "-f", "opus",
        "-acodec", "libopus",
        "-ar", "48000",
        "-ac", "2",
        "-reconnect", "1"
        "-reconnect_streamed", "1",
        "-reconnect_delay_max", "5"
    ],
    shell: false
});

const resource = createAudioResource(stream);
audioPlayer.play(resource);
```

Learn more about `prism-media` in the [official documentation](https://amishshah.github.io/prism-media).