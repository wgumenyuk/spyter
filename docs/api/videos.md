# Videos
Get information about YouTube videos and access the audio.

## Methods
### `.isVideoUrl(url)`
Checks whether a URL matches the format of a video URL on YouTube.

| Parameter | Type | Optional | Default | Description |
|---|---|---|---|---|
| `url` | `unknown` | ❌ |  | Video URL. |

**Returns:**
<pre>boolean</pre>

### `.getVideo(url, [options])`
Gets the metadata and audio formats of a video.

| Parameter | Type | Optional | Default | Description |
|---|---|---|---|---|
| `url` | `string` | ❌ |  | Video URL. |
| `options` | [`VideoOptions`](#videooptions) | ✔️ | See [`VideoOptions`](#videooptions). | Video retrieval options. |

**Returns:**
<pre>Promise&lt;<a href="#/api/videos?id=video">Video</a>&gt;</pre>

### `.getVideoMeta(url, [options])`
Gets the metadata of a video.

| Parameter | Type | Optional | Default | Description |
|---|---|---|---|---|
| `url` | `string` | ❌ |  | Video URL. |
| `options` | [`VideoOptions`](#videooptions) | ✔️ | See [`VideoOptions`](#videooptions). | Video retrieval options. |

**Returns:**
<pre>Promise&lt;<a href="#/api/videos?id=videometa">VideoMeta</a>&gt;</pre>

### `.getVideoFormats(url, [options])`
Gets the audio formats of a video.

| Parameter | Type | Optional | Default | Description |
|---|---|---|---|---|
| `url` | `string` | ❌ |  | Video URL. |
| `options` | [`VideoOptions`](#videooptions) | ✔️ | See [`VideoOptions`](#videooptions). | Video retrieval options. |

**Returns:**
<pre>Promise&lt;<a href="#/api/videos?id=format">Format</a>[]&gt;</pre>

## Types
### `VideoOptions`
Video retrieval options.

| Property | Type | Default | Description |
|---|---|---|---|
|`language?`|`string`|`en`|[ISO 639-1](https://en.wikipedia.org/wiki/ISO_639-1_codes) language code (e.g., `en`, `de`).|
|`region?`|`string`|`US`|[ISO 3166-2](https://en.wikipedia.org/wiki/ISO_3166-2) region code (e.g., `US`, `DE`).|

### `Video`
Video.

| Property | Type | Description |
|---|---|---|
| `id` | `string` | Video ID. |
| `url` | `string` | Video URL. |
| `title` | `string` | Video title. |
| `channelUrl` | `string` | Channel URL. |
| `channelName` | `string` | Channel name. |
| `thumbnails` | [`Thumbnail[]`](#thumbnail) | List of available thumbnails. |
| `duration` | `number` | Duration in seconds. If the video is live, `duration` will be `Infinity`. |
| `isLive` | `boolean` | Whether a video is a livestream or not. |
| `formats` | [`Format[]`](#format) | List of available audio formats. |

### `VideoMeta`
See [`Video`](#video), except without `formats`.

### `Format`
Audio format.

| Property | Type | Description |
|---|---|---|
| `url` | `string` | Audio format URL. |
| `itag` | `number` | Format code. See this [gist](https://gist.github.com/AgentOak/34d47c65b1d28829bb17c24c04a0096f) for more information. |
| `mimeType` | `string` | MIME type. |
| `codec` | `string` | Audio codec. |
| `bitrate` | `number` | Audio bitrate. |
| `isLive?` | `boolean` | Whether the format is a live format or not. |

### `Thumbnail`
Video thumbnail.

| Property | Type | Description |
|---|---|---|
| `url` | `string` | Thumbnail URL. |
| `width` | `number` | Width in `px`. |
| `height` | `number` | Height in `px`. |