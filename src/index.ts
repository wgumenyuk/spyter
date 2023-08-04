import { search } from "./search";
import { isPlaylistUrl, getPlaylist } from "./playlist";
import {
    isVideoUrl,
    getVideo,
    getVideoMeta,
    getVideoFormats
} from "./video";

// Default and named exports
export {
    search,
    isPlaylistUrl,
    getPlaylist,
    isVideoUrl,
    getVideo,
    getVideoMeta,
    getVideoFormats
};

export default {
    search,
    isPlaylistUrl,
    getPlaylist,
    isVideoUrl,
    getVideo,
    getVideoMeta,
    getVideoFormats
};

// Types
export type { SearchOptions } from "./search";
export type { Playlist, PlaylistOptions } from "./playlist";
export type {
    Thumbnail,
    Format,
    Video,
    VideoMeta,
    VideoOptions
} from "./video";