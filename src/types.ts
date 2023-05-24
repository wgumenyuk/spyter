import type { Thumbnail } from "./video";

/**
    Video item from the search results. For internal use only.
*/
export type VideoItem = {
    videoId?: string;
    thumbnail?: {
        thumbnails?: Thumbnail[];
    };
    badges?: {
        metadataBadgeRenderer?: {
            icon?: {
                iconType?: string;
            };
        };
    }[];
    title?: {
        runs?: {
            text?: string;
        }[];
    };
    ownerText?: {
        runs?: {
            text?: string;
            navigationEndpoint?: {
                browseEndpoint?: {
                    browseId?: string;
                };
            };
        }[];
    };
    lengthText?: {
        simpleText?: string;
    };
};

/**
    Playlist header. For internal use only.
*/
export type PlaylistHeader = {
    playlistHeaderRenderer?: {
        playlistId?: string;
        title?: {
            simpleText?: string;
        };
        ownerText?: {
            runs: {
                text?: string;
                navigationEndpoint?: {
                    browseEndpoint?: {
                        browseId?: string;
                    };
                };
            }[];
        };
        playlistHeaderBanner?: {
            heroPlaylistThumbnailRenderer?: {
                thumbnail?: {
                    thumbnails?: Thumbnail[];
                };
            };
        };
    };
};

/**
    Playlist video item. For internal use only.
*/
export type PlaylistVideoItem = {
    videoId?: string;
    thumbnail?: {
        thumbnails?: Thumbnail[];
    };
    thumbnailOverlays?: {
        thumbnailOverlayTimeStatusRenderer?: {
            style?: string;
        };
    }[];
    title?: {
        runs?: {
            text?: string;
        }[];
    };
    shortBylineText?: {
        runs?: {
            text?: string;
            navigationEndpoint?: {
                browseEndpoint?: {
                    browseId?: string;
                };
            };
        }[];
    };
    lengthSeconds?: string;
};

/**
    Playlist continuation item. For internal use only.
*/
export type PlaylistContinuationItem = {
    continuationEndpoint?: {
        continuationCommand?: {
            token?: string;
        }
    };
};