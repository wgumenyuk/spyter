import { extract, get } from "./utils";
import {
    YOUTUBE_SEARCH_URL,
    YOUTUBE_CHANNEL_URL,
    YOUTUBE_VIDEO_URL
} from "./constants";

// Types
import type { VideoMeta } from "./video";
import type { VideoItem } from "./types";

// #region Types
/**
    Search options.
*/
export type SearchOptions = {
    /**
        Maximum number of videos to retrieve.
    */
    maxVideos?: number;

    /**
        [ISO 639-1](https://en.wikipedia.org/wiki/ISO_639-1_codes) language code
        (e.g., `en`, `de`).
    */
    language?: string;

    /**
        [ISO 3166-2](https://en.wikipedia.org/wiki/ISO_3166-2) region code
        (e.g., `US`, `DE`).
    */
    region?: string;
};
// #endregion

/**
    Verifies the parameters.
*/
const _verifyParameters = (query: unknown, options: SearchOptions) => {
    if(typeof query !== "string") {
        throw new Error("`query` must be a string");
    }

    if(query.length === 0 || query.length > 100) {
        throw new Error("`query` must be between 1 and 100 charachters long");
    }

    if(options.maxVideos) {
        if(typeof options.maxVideos !== "number" || Number.isNaN(options.maxVideos)) {
            throw new Error("`maxVideos` must be a number");
        }

        if(options.maxVideos < 1) {
            throw new Error("`maxVideos` must be larger than or equal to 1");
        }

        if(options.maxVideos >= 50) {
            throw new Error("`maxVideos` must be smaller than or equal to 50");
        }
    }

    if(!!options.language !== !!options.region) {
        throw new Error("`language` and `region` must be used together");
    }

    if(options.language && options.language.length > 2) {
        throw new Error("`language` must be an ISO 639-1 language code");
    }

    if(options.region && options.region.length > 2) {
        throw new Error("`region` must be an ISO 3166-2 region code");
    }
};

/**
    Converts a duration timestamp into seconds.
*/
const _parseDurationTimestamp = (duration: string | null) => {
    if(!duration) {
        return 0;
    }

    const components = duration
        .split(":")
        .map(Number);

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const hh = (components.length === 3) ? components.shift()! : 0;
    const mm = components[0];
    const ss = components[1];

    return (hh * 3600) + (mm * 60) + ss;
};

/**
    Gathers information about the videos from the search results.
*/
const _parseItem = (item: VideoItem) => {
    const id = item?.videoId || null;

    if(!id) {
        throw new Error("search: missing video ID");
    }

    const url = new URL(YOUTUBE_VIDEO_URL);
    url.searchParams.set("v", id);

    const title = item
        ?.title
        ?.runs
        ?.[0]
        ?.text || null;

    const channelId = item
        ?.ownerText
        ?.runs
        ?.[0]
        ?.navigationEndpoint
        ?.browseEndpoint
        ?.browseId || null;

    if(!channelId) {
        throw new Error("search: missing channel ID");
    }

    const channelUrl = new URL(channelId, YOUTUBE_CHANNEL_URL);

    const channelName = item
        ?.ownerText
        ?.runs
        ?.[0]
        ?.text || null;

    const thumbnails = item
        ?.thumbnail
        ?.thumbnails || [];

    const duration = item
        ?.lengthText
        ?.simpleText || null;

    const isLive = item
        ?.badges
        ?.[0]
        ?.metadataBadgeRenderer
        ?.icon
        ?.iconType === "LIVE";

    return {
        id,
        url: url.toString(),
        title,
        channelUrl: channelUrl.toString(),
        channelName,
        thumbnails,
        duration: (isLive) ? Infinity : _parseDurationTimestamp(duration),
        isLive,
        formats: []
    } as VideoMeta;
};

/**
    Performs a search on YouTube.
*/
export const search = async (query: string, options: SearchOptions = {}) => {
    _verifyParameters(query, options);

    const maxVideos = options.maxVideos || 1;
    const language = options.language || "en";
    const region = options.region || "US";

    const htmlUrl = new URL(YOUTUBE_SEARCH_URL);

    htmlUrl.searchParams.set("hl", language);
    htmlUrl.searchParams.set("gl", region);
    htmlUrl.searchParams.set("search_query", query);

    const html = await get(htmlUrl);

    const initialData = extract(
        html,
        "var ytInitialData = {",
        "};"
    );

    if(!initialData) {
        throw new Error("search: `ytInitialData` not found");
    }

    const data = JSON.parse(`{${initialData}}`);

    const items: Record<string, VideoItem>[] = data
        ?.contents
        ?.twoColumnSearchResultsRenderer
        ?.primaryContents
        ?.sectionListRenderer
        ?.contents[0]
        ?.itemSectionRenderer
        ?.contents || [];

    const videos: VideoMeta[] = [];

    for(const item of items) {
        if(!item.videoRenderer) {
            continue;
        }

        if(videos.length + 1 > maxVideos) {
            break;
        }

        videos.push(
            _parseItem(item.videoRenderer)
        );
    }

    return videos;
};

/**
    Private functions exported for unit testing.
*/
export const _hidden = (process.env.NODE_ENV === "test") ?
    { _parseItem, _parseDurationTimestamp, _verifyParameters } :
    null;