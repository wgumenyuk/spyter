import { extract, get } from "./utils";
import {
    YOUTUBE_API_URL,
    YOUTUBE_CHANNEL_URL,
    YOUTUBE_CLIENT_VERSION,
    YOUTUBE_PLAYLIST_URL,
    YOUTUBE_VIDEO_URL,
    YOUTUBE_PLAYLIST_URL_REGEX
} from "./constants";

// Types
import type { Thumbnail, VideoMeta } from "./video";
import type {
    PlaylistHeader,
    PlaylistContinuationItem,
    PlaylistVideoItem
} from "./types";

// #region Types
/**
    Playlist.
*/
export type Playlist = {
    /**
        Playlist ID.
    */
    id: string;

    /**
        `Playlist URL.
    */
    url: string;

    /**
        Playlist title.
    */
    title: string;

    /**
        Channel URL of the playlist owner.
    */
    channelUrl: string;

    /**
        Channel name of the playlist owner.
    */
    channelName: string;

    /**
        List of available thumbnails.
    */
    thumbnails: Thumbnail[];

    /**
        List of videos from the playlist.
    */
    videos: VideoMeta[];
};

/**
    Playlist options.
*/
export type PlaylistOptions = {
    /**
        Maximum number of pages to retrieve.
    */
    maxPages?: number;

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
const _verifyParameters = (url: unknown, options: PlaylistOptions) => {
    if(typeof url !== "string") {
        throw new Error("`url` must be a string");
    }

    if(!isPlaylistUrl(url)) {
        throw new Error("`url` must be a valid playlist URL");
    }

    if(options.maxPages) {
        if(typeof options.maxPages !== "number" || Number.isNaN(options.maxPages)) {
            throw new Error("`maxPages` must be a number");
        }

        if(options.maxPages < 1) {
            throw new Error("`maxPages` must be larger than or equal to 1");
        }
    }

    if(options.maxVideos) {
        if(typeof options.maxVideos !== "number" || Number.isNaN(options.maxVideos)) {
            throw new Error("`maxVideos` must be a number");
        }

        if(options.maxVideos < 1) {
            throw new Error("`maxVideos` must be larger than or equal to 1");
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
    Gathers information about the videos in the playlist.
*/
const _parseItem = (item: PlaylistVideoItem) => {
    const id = item?.videoId || null;

    if(!id) {
        throw new Error("playlist: missing video ID");
    }

    const url = new URL(YOUTUBE_VIDEO_URL);
    url.searchParams.set("v", id);

    const title = item
        ?.title
        ?.runs
        ?.[0]
        ?.text || null;

    const channelId = item
        ?.shortBylineText
        ?.runs
        ?.[0]
        ?.navigationEndpoint
        ?.browseEndpoint
        ?.browseId || null;

    if(!channelId) {
        throw new Error("playlist: missing channel ID");
    }

    const channelUrl = new URL(channelId, YOUTUBE_CHANNEL_URL);

    const channelName = item
        ?.shortBylineText
        ?.runs
        ?.[0]
        .text || null;

    const thumbnails = item
        ?.thumbnail
        ?.thumbnails || [];

    const duration = item?.lengthSeconds || "0";

    const isLive = item
        ?.thumbnailOverlays
        ?.[0]
        ?.thumbnailOverlayTimeStatusRenderer
        ?.style === "LIVE";

    return {
        id,
        url: url.toString(),
        title,
        channelUrl: channelUrl.toString(),
        channelName,
        thumbnails,
        duration: (isLive) ? Infinity : Number(duration),
        isLive
    } as VideoMeta;
};

/**
    Recursively retrieves videos from subsequent pages.
*/
const _getContinuation = async (
    item: PlaylistContinuationItem,
    options: Required<PlaylistOptions>,
    apiKey: string,
    totalVideoAmount: number
) => {
    const token = item
        ?.continuationEndpoint
        ?.continuationCommand
        ?.token || null;

    if(!token) {
        throw new Error("playlist: continuation token not found");
    }

    const url = new URL(YOUTUBE_API_URL);
    url.searchParams.set("key", apiKey);

    const response = await fetch(url, {
        method: "POST",
        body: JSON.stringify({
            context: {
                client: {
                    hl: options.language,
                    gl: options.region,
                    clientName: "WEB",
                    clientVersion: YOUTUBE_CLIENT_VERSION
                },
                user: {},
                request: {}
            },
            continuation: token
        })
    });

    if(!response.ok) {
        throw new Error(`playlist: continuation failed (${response.status})`);
    }

    const data = await response.json();

    const items: Record<string, unknown>[] = data
        ?.onResponseReceivedActions
        ?.[0]
        ?.appendContinuationItemsAction
        ?.continuationItems;

    if(!items) {
        throw new Error("playlist: continuation items not found");
    }

    const videos: VideoMeta[] = [];

    for(const item of items) {
        if(!item.playlistVideoRenderer) {
            continue;
        }

        if(totalVideoAmount + videos.length + 1 > options.maxVideos) {
            return videos;
        }

        videos.push(
            _parseItem(item.playlistVideoRenderer)
        );
    }

    const lastItem = items[items.length - 1];
    const hasContinuation = !!lastItem?.continuationItemRenderer;

    const pages = Math.ceil(totalVideoAmount / 100);

    if(hasContinuation && pages + 1 <= options.maxPages) {
        const continuation = await _getContinuation(
            lastItem,
            options,
            apiKey,
            totalVideoAmount + videos.length
        );

        videos.push(...continuation);
    }

    return videos;
};

/**
    Retrieves videos from the first page of the playlist.
*/
const _getVideos = async (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: Record<string, any>,
    apiKey: string,
    options: Required<PlaylistOptions>
) => {
    const items: Record<string, unknown>[] = data
        ?.contents
        ?.twoColumnBrowseResultsRenderer
        ?.tabs
        ?.[0]
        ?.tabRenderer
        ?.content
        ?.sectionListRenderer
        ?.contents
        ?.[0]
        ?.itemSectionRenderer
        ?.contents
        ?.[0]
        ?.playlistVideoListRenderer
        ?.contents;

    if(!items) {
        throw new Error("playlist: items not found");
    }

    const videos: VideoMeta[] = [];

    for(const item of items) {
        if(!item.playlistVideoRenderer) {
            continue;
        }

        if(videos.length + 1 > options.maxVideos) {
            return videos;
        }

        videos.push(
            _parseItem(item.playlistVideoRenderer)
        );
    }

    const lastItem = items[items.length - 1];
    const hasContinuation = !!lastItem?.continuationItemRenderer;

    if(hasContinuation && options.maxPages > 1) {
        const continuation = await _getContinuation(
            lastItem,
            options,
            apiKey,
            videos.length
        );

        videos.push(...continuation);
    }

    return videos;
};

/**
    Gathers information about the playlist.
*/
const _getMeta = (header?: PlaylistHeader) => {
    if(!header) {
        throw new Error("playlist: meta not found");
    }

    const video = header.playlistHeaderRenderer;

    const id = video?.playlistId || null;

    if(!id) {
        throw new Error("playlist: missing playlist ID");
    }

    const url = new URL(YOUTUBE_PLAYLIST_URL);
    url.searchParams.set("list", id);

    const title = video
        ?.title
        ?.simpleText || null;

    const channelId = video
        ?.ownerText
        ?.runs
        ?.[0]
        ?.navigationEndpoint
        ?.browseEndpoint
        ?.browseId || null;

    if(!channelId) {
        throw new Error("playlist: missing channel ID");
    }

    const channelUrl = new URL(channelId, YOUTUBE_CHANNEL_URL);

    const channelName = video
        ?.ownerText
        ?.runs
        ?.[0]
        ?.text || null;

    const thumbnails = video
        ?.playlistHeaderBanner
        ?.heroPlaylistThumbnailRenderer
        ?.thumbnail
        ?.thumbnails || [];

    return {
        id,
        url: url.toString(),
        title,
        channelUrl: channelUrl.toString(),
        channelName,
        thumbnails
    } as Omit<Playlist, "videos">;
};

/**
    Checks whether a URL matches the format of a playlist URL on YouTube.
*/
export const isPlaylistUrl = (url: unknown) => {
    if(typeof url !== "string") {
        return false;
    }

    return YOUTUBE_PLAYLIST_URL_REGEX.test(url);
};

/**
    Retrieves information about a playlist on YouTube.
*/
export const getPlaylist = async (url: string, options: PlaylistOptions = {}) => {
    _verifyParameters(url, options);

    const maxPages = options.maxPages || 1;
    const maxVideos = options.maxVideos || 100;
    const language = options.language || "en";
    const region = options.region || "US";

    const playlistUrl = new URL(url);

    playlistUrl.searchParams.set("hl", language);
    playlistUrl.searchParams.set("gl", region);

    const html = await get(playlistUrl);

    const apiKey = extract(
        html,
        `"INNERTUBE_API_KEY":"`,
        `"`
    );

    if(!apiKey) {
        throw new Error("playlist: `INNERTUBE_API_KEY` not found");
    }

    const initialData = extract(
        html,
        "var ytInitialData = {",
        "};"
    );

    if(!initialData) {
        throw new Error("playlist: `ytInitialData` not found");
    }

    const data = JSON.parse(`{${initialData}}`);

    const hasError = data
        ?.alerts
        ?.[0]
        ?.alertRenderer
        ?.type === "ERROR";

    if(hasError) {
        throw new Error("playlist: failed to retreive information");
    }

    const meta = _getMeta(data.header);

    const videos = await _getVideos(data, apiKey, {
        maxPages,
        maxVideos,
        language,
        region
    });

    return {
        ...meta,
        videos
    } as Playlist;
};

/**
    Private functions exported for unit testing.
*/
export const _hidden = (process.env.NODE_ENV === "test") ?
    { _getContinuation, _getMeta, _getVideos, _parseItem, _verifyParameters } :
    null;