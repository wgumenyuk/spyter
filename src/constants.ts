import type { Format } from "./video";

/**
    YouTube base URL.
*/
export const YOUTUBE_URL = "https://www.youtube.com";

/**
    YouTube video URL.
*/
export const YOUTUBE_VIDEO_URL = "https://www.youtube.com/watch";

/**
    YouTube playlist URL.
*/
export const YOUTUBE_PLAYLIST_URL = "https://www.youtube.com/playlist";

/**
    YouTube search URL.
*/
export const YOUTUBE_SEARCH_URL = "https://www.youtube.com/results";

/**
    YouTube channel URL.
*/
// Note: the trailing slash is important for the URL API
export const YOUTUBE_CHANNEL_URL = "https://www.youtube.com/channel/";

/**
    YouTube internal API URL.
*/
export const YOUTUBE_API_URL = "https:///www.youtube.com/youtubei/v1/browse";

/**
    YouTube client name.
*/
export const YOUTUBE_CLIENT_NAME = "1";

/**
    YouTube client version.
*/
export const YOUTUBE_CLIENT_VERSION = "2.20230508.00.00";

/**
    Regular expression for matching the URLs of YouTube videos.
*/
export const YOUTUBE_VIDEO_URL_REGEX =
    /https?:\/\/(www\.|m\.)?youtu(be)?\.(be|com)\/watch\?v=[A-Z-a-z0-9_-]{11}(&.*)?/;

/**
    Regular expression for matching the URLs of YouTube playlists.
*/
export const YOUTUBE_PLAYLIST_URL_REGEX =
    /https?:\/\/(www\.|m\.)?youtube\.com\/playlist\?list=[A-Za-z0-9_-]{34}/;

/**
    Metadata about livestream formats.
*/
export const LIVESTREAM_FORMATS: Record<string, Partial<Format>> = {
    91: {
        itag: 91,
        mimeType: "application/x-mpegURL, codecs=\"H.264, aac\"",
        codec: "aac",
        bitrate: 48000,
        isLive: true
    },
    92: {
        itag: 92,
        mimeType: "application/x-mpegURL, codecs=\"H.264, aac\"",
        codec: "aac",
        bitrate: 48000,
        isLive: true
    },
    93: {
        itag: 93,
        mimeType: "application/x-mpegURL, codecs=\"H.264, aac\"",
        codec: "aac",
        bitrate: 128000,
        isLive: true
    },
    94: {
        itag: 94,
        mimeType: "application/x-mpegURL, codecs=\"H.264, aac\"",
        codec: "aac",
        bitrate: 128000,
        isLive: true
    },
    95: {
        itag: 95,
        mimeType: "application/x-mpegURL, codecs=\"H.264, aac\"",
        codec: "aac",
        bitrate: 256000,
        isLive: true
    },
    96: {
        itag: 96,
        mimeType: "application/x-mpegURL, codecs=\"H.264, aac\"",
        codec: "aac",
        bitrate: 256000,
        isLive: true
    }
};