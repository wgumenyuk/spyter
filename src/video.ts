import { extract, get } from "./utils";
import {
    decipherFormatUrl,
    getDecipherScript,
    getNParamScript
} from "./signature";
import {
    LIVESTREAM_FORMATS,
    YOUTUBE_CHANNEL_URL,
    YOUTUBE_URL,
    YOUTUBE_VIDEO_URL,
    YOUTUBE_VIDEO_URL_REGEX
} from "./constants";

// Types
import type { Script } from "node:vm";

// #region Types
/**
    Video thumbnail.
*/
export type Thumbnail = {
    /**
        URL.
    */
    url: string;

    /**
        Width in `px`.
    */
    width: number;

    /**
        Height in `px`.
    */
    height: number;
};

/**
    Audio formats.
*/
export type Format = {
    /**
        URL.
    */
    url: string;

    /**
        Format code. See this
        [gist](https://gist.github.com/AgentOak/34d47c65b1d28829bb17c24c04a0096f)
        for more information.
    */
    itag: number;

    /**
        MIME type.
    */
    mimeType: string;

    /**
        Audio codec.
    */
    codec: string;

    /**
        Audio bitrate.
    */
    bitrate: number;

    /**
        Whether the format is a live format or not.
    */
    isLive?: boolean;
};

/**
    Video.
*/
export type Video = {
    /**
        Video ID.
    */
    id: string;

    /**
        Video URL.
    */
    url: string;

    /**
        Video title.
    */
    title: string;

    /**
        Channel URL.
    */
    channelUrl: string;

    /**
        Channel name.
    */
    channelName: string;

    /**
        List of available thumbnails.
    */
    thumbnails: Thumbnail[];

    /**
        Duration in seconds.
    */
    duration: number;

    /**
        Whether a video is a livestream or not.
    */
    isLive: boolean;

    /**
        List of available audio formats.
    */
    formats: Format[];
};

/**
    Video meta.
*/
export type VideoMeta = Omit<Video, "formats">;

/**
    Video retrieval options.
*/
export type VideoOptions = {
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
    Cache for audio format decipher functions.
*/
const cache = new Map<"decipher" | "nParam", Script>();

/**
    Verifies the parameters.
*/
const _verifyParameters = (url: unknown, options: VideoOptions) => {
    if(typeof url !== "string") {
        throw new Error("`url` must be a string");
    }

    if(!isVideoUrl(url)) {
        throw new Error("`url` must be a valid video URL");
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
    Gets the player file and extracts the format decoding functions.
*/
const _getPlayer = async (html: string) => {
    const playerUrl = extract(
        html,
        `"PLAYER_JS_URL":"`,
        `"`
    );

    if(!playerUrl) {
        throw new Error("video: `PLAYER_JS_URL` not found");
    }

    const url = new URL(playerUrl, YOUTUBE_URL);

    const player = await get(url);

    cache.set("decipher", getDecipherScript(player));
    cache.set("nParam", getNParamScript(player));
};

/**
    Gets the initial player data.
*/
const _getData = async (url: string, options: VideoOptions = {}) => {
    const language = options.language || "en";
    const region = options.region || "US";

    const videoUrl = new URL(url);

    videoUrl.searchParams.set("hl", language);
    videoUrl.searchParams.set("gl", region);

    const html = await get(url);

    const playerResponse = extract(
        html,
        "var ytInitialPlayerResponse = {",
        "};"
    );

    if(!playerResponse) {
        throw new Error("video: `playerResponse` not found");
    }

    // Get player and extract decipher functions
    if(!cache.has("decipher") || !cache.has("nParam")) {
        await _getPlayer(html);
    }

    const data = JSON.parse(`{${playerResponse}}`);

    return data;
};

/**
    Gets additional `.m3u8` audio streams.
*/
const _getM3u8Formats = async (url: string) => {
    const data = await get(url);

    const lines = data.split("\n");
    const formats: Format[] = [];

    for(const line of lines) {
        if(!line.startsWith("https://")) {
            continue;
        }

        const itag = extract(line, "/itag/", "/");

        if(!itag) {
            continue;
        }

        const format = {
            url: line,
            ...LIVESTREAM_FORMATS[itag]
        } as Format;

        formats.push(format);
    }

    return formats;
};

/**
    Extracts and deciphers audio formats.
*/
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const _getFormats = async (data: Record<string, any>) => {
    const streamingData = data.streamingData;

    if(!streamingData) {
        throw new Error("video: `streamingData` not found");
    }

    const staticFormats = streamingData?.formats || [];
    const adaptiveFormats = streamingData?.adaptiveFormats || [];

    const hlsUrl = streamingData?.hlsManifestUrl || null;

    const formats = [ ...staticFormats, ...adaptiveFormats ];
    const audioFormats: Format[] = [];

    /* eslint-disable @typescript-eslint/no-non-null-assertion */
    const decipherScript = cache.get("decipher")!;
    const nParamScript = cache.get("nParam")!;
    /* eslint-enable @typescript-eslint/no-non-null-assertion */

    for(const format of formats) {
        if(!format.mimeType.startsWith("audio")) {
            continue;
        }

        const url = decipherFormatUrl(
            format,
            decipherScript,
            nParamScript
        );

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const codec = extract(format.mimeType, `codecs="`, `"`)!;

        audioFormats.push({
            url,
            itag: Number(format.itag),
            mimeType: format.mimeType,
            codec,
            bitrate: format.bitrate
        });
    }

    if(hlsUrl) {
        const m3u8Formats = await _getM3u8Formats(hlsUrl);
        audioFormats.push(...m3u8Formats);
    }

    return audioFormats;
};

/**
    Extracts video metadata.
*/
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const _getMeta = (data: Record<string, any>) => {
    const video = data?.videoDetails;

    if(!video) {
        throw new Error("video: `videoDetails` not found");
    }

    const id = video?.videoId || null;

    if(!id) {
        throw new Error("video: missing video ID");
    }

    const url = new URL(YOUTUBE_VIDEO_URL);
    url.searchParams.set("v", id);

    const title = video?.title || null;

    const channelId = video?.channelId || null;

    if(!channelId) {
        throw new Error("video: missing channel ID");
    }

    const channelUrl = new URL(channelId, YOUTUBE_CHANNEL_URL);
    const channelName = video?.author || null;

    const thumbnails = video
        ?.thumbnail
        ?.thumbnails || [];

    const duration = video?.lengthSeconds || "0";
    const isLive = !!video?.isLiveContent;

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
    Checks whether a URL matches the format of a video URL on YouTube.
*/
export const isVideoUrl = (url: unknown) => {
    if(typeof url !== "string") {
        return false;
    }

    return YOUTUBE_VIDEO_URL_REGEX.test(url);
};

/**
    Gets the metadata of a video.
*/
export const getVideoMeta = async (url: string, options: VideoOptions = {}) => {
    _verifyParameters(url, options);

    const data = await _getData(url, options);

    return _getMeta(data);
};

/**
    Gets the audio formats of a video.
*/
export const getVideoFormats = async (url: string, options: VideoOptions = {}) => {
    _verifyParameters(url, options);

    const data = await _getData(url, options);

    return _getFormats(data);
};

/**
    Gets the metadata and audio formats of a video.
*/
export const getVideo = async (url: string, options: VideoOptions = {}) => {
    _verifyParameters(url, options);

    const data = await _getData(url, options);

    const meta = _getMeta(data);
    const formats = await _getFormats(data);

    return {
        ...meta,
        formats
    } as Video;
};

/**
    Private functions exported for unit testing.
*/
export const _hidden = (process.env.NODE_ENV === "test") ?
    { _getData, _getFormats, _getM3u8Formats, _getMeta, _getPlayer, _verifyParameters } :
    null;