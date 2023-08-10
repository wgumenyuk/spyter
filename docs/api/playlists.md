# Playlists
Get information about YouTube playlists.

## Methods
### `.isPlaylistUrl(url)`
Checks whether a URL matches the format of a playlist URL on YouTube.

| Parameter | Type | Optional | Default | Description |
|---|---|---|---|---|
| `url` | `unknown` | ❌ |  | Playlist URL. |

**Returns:**
<pre>boolean</pre>

### `.getPlaylist(url, [options])`
Retrieves information about a playlist on YouTube.

| Parameter | Type | Optional | Default | Description |
|---|---|---|---|---|
| `url` | `string` | ❌ |  | Playlist URL. |
| `options` | [`PlaylistOptions`](#playlistoptions) | ✔️ | See [`PlaylistOptions`](#playlistoptions). | Playlist retrieval options. |

**Returns:**
<pre>Promise&lt;<a href="#/api/playlists?id=playlist">Playlist</a>&gt;</pre>

## Types
### `PlaylistOptions`
Playlist retrieval options.

| Property | Type | Default | Description |
|---|---|---|---|
|`maxPages?`|`number`|`1`|Maximum number of pages to retrieve.|
|`maxVideos?`|`number`|`100`|Maximum number of videos to retrieve.|
|`language?`|`string`|`en`|[ISO 639-1](https://en.wikipedia.org/wiki/ISO_639-1_codes) language code (e.g., `en`, `de`).|
|`region?`|`string`|`US`|[ISO 3166-2](https://en.wikipedia.org/wiki/ISO_3166-2) region code (e.g., `US`, `DE`).|

### `Playlist`
Playlist.

| Property | Type | Description |
|---|---|---|
|`id`|`string`|Playlist ID.|
|`url`|`string`|Playlist URL.|
|`title`|`string`|Playlist title.|
|`channelUrl`|`string`|Channel URL of the playlist owner.|
|`channelName`|`string`|Channel name of the playlist owner.|
|`thumbnails`|[`Thumbnail[]`](api/videos?id=thumbnail)|List of available thumbnails.|
|`videos`|[`VideoMeta[]`](api/videos?id=videometa)|List of videos from the playlist.|