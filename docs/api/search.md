# Search
Perform searches on the YouTube platform.

## Methods
### `.search(query, [options])`
Performs a search on YouTube.

| Parameter | Type | Optional | Default | Description |
|---|---|---|---|---|
| `query` | `string` | ❌ |  | Query. |
| `options` | [`SearchOptions`](#searchoptions) | ✔️ | See [`SearchOptions`](#searchoptions). | Search options. |

**Returns:**
<pre>Promise&lt;<a href="#/api/videos?id=videometa">VideoMeta</a>[]&gt;</pre>

## Types
### `SearchOptions`
Search options.

| Property | Type | Default | Description |
|---|---|---|---|
|`maxVideos?`|`number`|`1`|Maximum number of videos to retrieve.|
|`language?`|`string`|`en`|[ISO 639-1](https://en.wikipedia.org/wiki/ISO_639-1_codes) language code (e.g., `en`, `de`).|
|`region?`|`string`|`US`|[ISO 3166-2](https://en.wikipedia.org/wiki/ISO_3166-2) region code (e.g., `US`, `DE`).|