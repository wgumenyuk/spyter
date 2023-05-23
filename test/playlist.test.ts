import path from "node:path";
import fs from "node:fs/promises";
import fetchMock from "jest-fetch-mock";

// Internal
import {
    isPlaylistUrl,
    getPlaylist,
    _hidden
} from "../src/playlist";

// Types
import type { Playlist, PlaylistOptions } from "../src/playlist";
import type { VideoMeta } from "../src/video";
import type { PlaylistContinuationItem } from "../src/types";

/**
    Playlist URL for unit testing.
*/
const PLAYLIST_URL =
    "https://www.youtube.com/playlist?list=PLT_r_AwlIdMIRGjBygNMJPw5sG522LLTC";

/**
    Continuation item for unit testing.
*/
const CONTINUATION_ITEM: PlaylistContinuationItem = {
    continuationEndpoint: {
        continuationCommand: {
            token: "<token>"
        }
    }
};

const {
    _getContinuation,
    _getMeta,
    _getVideos,
    _parseItem,
    _verifyParameters
} = _hidden!;

describe("playlist", () => {
    describe("_verifyParameters()", () => {
        it("should only accept `url` as a string", () => {
            expect(() => _verifyParameters(null, {}))
                .toThrow("`url` must be a string");
        });

        it("should only accept `url` as a valid playlist URL", () => {
            expect(() => _verifyParameters("https://example.com", {}))
                .toThrow("`url` must be a valid playlist URL");
        });

        it("should only accept `maxPages` as a number", () => {
            expect(() => {
                _verifyParameters(PLAYLIST_URL, {
                    // @ts-expect-error
                    maxPages: "10"
                });
            }).toThrow("`maxPages` must be a number");
        });

        it("should only accept `maxPages` when larger than or equal to 1", () => {
            expect(() => {
                _verifyParameters(PLAYLIST_URL, {
                    maxPages: -1
                });
            }).toThrow("`maxPages` must be larger than or equal to 1");
        });

        it("should only accept `maxVideos` as a number", () => {
            expect(() => {
                _verifyParameters(PLAYLIST_URL, {
                    // @ts-expect-error
                    maxVideos: "10"
                });
            }).toThrow("`maxVideos` must be a number");
        });

        it("should only accept `maxVideos` when larger than or equal to 1", () => {
            expect(() => {
                _verifyParameters(PLAYLIST_URL, {
                    maxVideos: -1
                });
            }).toThrow("`maxVideos` must be larger than or equal to 1");
        });

        it("should only accept `language` along with `region`", () => {
            expect(() => {
                _verifyParameters(PLAYLIST_URL, {
                    language: "de"
                });
            }).toThrow("`language` and `region` must be used together");

            expect(() => {
                _verifyParameters(PLAYLIST_URL, {
                    region: "DE"
                });
            }).toThrow("`language` and `region` must be used together");

            expect(
                _verifyParameters(PLAYLIST_URL, {
                    language: "de",
                    region: "DE"
                })
            ).toBe(void 0);
        });

        it("should only accept `language` when it is a ISO 639-1 code", () => {
            expect(() => {
                _verifyParameters(PLAYLIST_URL, {
                    language: "abc",
                    region: "DE"
                });
            }).toThrow("`language` must be an ISO 639-1 language code");
        });

        it("should only accept `region` when it is a ISO 3166-2 code", () => {
            expect(() => {
                _verifyParameters(PLAYLIST_URL, {
                    language: "de",
                    region: "ABC"
                });
            }).toThrow("`region` must be an ISO 3166-2 region code");
        });
    });

    describe("_parseItem()", () => {
        it("should throw if the video ID is missing", () => {
            expect(() => {
                _parseItem({});
            }).toThrow("playlist: missing video ID");
        });

        it("should throw if the channel ID is missing", () => {
            expect(() => {
                _parseItem({
                    videoId: "abc"
                });
            }).toThrow("playlist: missing channel ID");
        });

        it("should return a parsed video item", () => {
            const video = _parseItem({
                videoId: "ryT-ltTDCko",
                thumbnail: {
                    thumbnails: []
                },
                title: {
                    runs: [{
                        text: "Prince - Purple Rain (Live At Paisley Park, 1999)"
                    }]
                },
                shortBylineText: {
                    runs: [
                        {
                            text: "Prince",
                            navigationEndpoint: {
                                browseEndpoint: {
                                    browseId: "UCv3mNSNjuWldihk1DUdnGtw"
                                }
                            }
                        }
                    ]
                },
                lengthSeconds: "696"
            });

            expect(video).toMatchObject<VideoMeta>({
                id: "ryT-ltTDCko",
                url: "https://www.youtube.com/watch?v=ryT-ltTDCko",
                title: "Prince - Purple Rain (Live At Paisley Park, 1999)",
                channelUrl: "https://www.youtube.com/channel/UCv3mNSNjuWldihk1DUdnGtw",
                channelName: "Prince",
                thumbnails: [],
                duration: 696,
                isLive: false
            });
        });
    });

    describe("_getVideos()", () => {
        const options: Required<PlaylistOptions> = {
            maxPages: 1,
            maxVideos: 100,
            language: "en",
            region: "US"
        };

        it("should throw if items are not found", async () => {
            await expect(
                _getVideos({}, "<API key>", options)
            ).rejects.toThrow("playlist: items not found");
        });

        it("should return a list with videos of the playlist", async () => {
            const data = await fs.readFile(
                path.join(__dirname, "data/json/playlist.txt"),
                "utf-8"
            );

            const videos = await _getVideos(
                JSON.parse(data),
                "<API key>",
                options
            );

            expect(Array.isArray(videos)).toBe(true);
            expect(videos.length).toBe(2);

            expect(videos[0]).toMatchObject<VideoMeta>({
                id: "jfKfPfyJRdk",
                url: "https://www.youtube.com/watch?v=jfKfPfyJRdk",
                title: "lofi hip hop radio 📚 - beats to relax/study to",
                channelUrl: "https://www.youtube.com/channel/UCSJ4gkVC6NrvII8umztf0Ow",
                channelName: "Lofi Girl",
                thumbnails: [],
                duration: Infinity,
                isLive: true
            });

            expect(videos[1]).toMatchObject<VideoMeta>({
                id: "ZhEwD4QQR6E",
                url: "https://www.youtube.com/watch?v=ZhEwD4QQR6E",
                title: "ANIKA K - FOR PLAY (Official Video)",
                channelUrl: "https://www.youtube.com/channel/UCgJwDbenoUf3QjCgQSHvuqw",
                channelName: "AnikaMusic",
                thumbnails: [],
                duration: 137,
                isLive: false
            });
        });
    });

    describe("_getContinuation()", () => {
        const options: Required<PlaylistOptions> = {
            maxPages: 2,
            maxVideos: 101,
            language: "en",
            region: "US"
        };

        beforeEach(() => {
            fetchMock.resetMocks();
        });

        it("should throw if the continuation token is not found", async () => {
            await expect(
                _getContinuation({}, options, "<API key>", 100)
            ).rejects.toThrow("playlist: continuation token not found");
        });

        it("should throw if the continuation request fails", async () => {
            fetchMock.mockResponseOnce("{}", {
                status: 400
            });

            await expect(
                _getContinuation(CONTINUATION_ITEM, options, "<API key>", 100)
            ).rejects.toThrow("playlist: continuation failed (400)");
        });

        it("should throw if continuation items are not found", async () => {
            fetchMock.mockResponseOnce("{}", {
                status: 200
            });

            await expect(
                _getContinuation(CONTINUATION_ITEM, options, "<API key>", 100)
            ).rejects.toThrow("playlist: continuation items not found");
        });

        it("should return a list of videos", async () => {
            const continuation = await fs.readFile(
                path.join(__dirname, "data/json/continuation.txt"),
                "utf-8"
            );

            fetchMock.mockResponseOnce(continuation, {
                status: 200
            });

            const videos = await _getContinuation(
                CONTINUATION_ITEM,
                options,
                "<API key>",
                100
            );

            expect(Array.isArray(videos)).toBe(true);
            expect(videos.length).toBe(1);

            expect(videos[0]).toMatchObject<VideoMeta>({
                id: "xrErQ05Jt5o",
                url: "https://www.youtube.com/watch?v=xrErQ05Jt5o",
                title: "Joey XL - You Deserve",
                channelUrl: "https://www.youtube.com/channel/UCyNJlR7nxAcK2rXNyhBvr2Q",
                channelName: "R&B Lounge",
                thumbnails: [],
                duration: 218,
                isLive: false
            });
        });
    });

    describe("_getMeta()", () => {
        it("should throw if header is not found", () => {
            expect(() => _getMeta()).toThrow("playlist: meta not found");
        });

        it("should throw if the playlist ID is not found", () => {
            expect(() => {
                _getMeta({
                    playlistHeaderRenderer: {}
                });
            }).toThrow("playlist: missing playlist ID");
        });

        it("should throw if the channel ID is not found", () => {
            expect(() => {
                _getMeta({
                    playlistHeaderRenderer: {
                        playlistId: "<playlist ID>"
                    }
                });
            }).toThrow("playlist: missing channel ID");
        });

        it("should return playlist meta", () => {
            const meta = _getMeta({
                playlistHeaderRenderer: {
                    playlistId: "PLT_r_AwlIdMIRGjBygNMJPw5sG522LLTC",
                    title: {
                        simpleText: "R&B"
                    },
                    ownerText: {
                        runs: [
                            {
                                text: "R&B Lounge",
                                navigationEndpoint: {
                                    browseEndpoint: {
                                        browseId: "UCyNJlR7nxAcK2rXNyhBvr2Q"
                                    }
                                }
                            }
                        ]
                    },
                    playlistHeaderBanner: {
                        heroPlaylistThumbnailRenderer: {
                            thumbnail: {
                                thumbnails: []
                            }
                        }
                    }
                }
            });

            expect(meta).toMatchObject<Omit<Playlist, "videos">>({
                id: "PLT_r_AwlIdMIRGjBygNMJPw5sG522LLTC",
                url: "https://www.youtube.com/playlist?list=PLT_r_AwlIdMIRGjBygNMJPw5sG522LLTC",
                title: "R&B",
                channelUrl: "https://www.youtube.com/channel/UCyNJlR7nxAcK2rXNyhBvr2Q",
                channelName: "R&B Lounge",
                thumbnails: []
            });
        });
    });

    describe("isPlaylistUrl()", () => {
        it("should return `false` for invalid playlist URLs", () => {
            expect(
                isPlaylistUrl(null)
            ).toBe(false);

            expect(
                isPlaylistUrl("https://example.org")
            ).toBe(false);
        });

        it("should return `true` for valid playlist URLs", () => {
            expect(
                isPlaylistUrl(PLAYLIST_URL)
            ).toBe(true);
        });
    });

    describe("getPlaylist()", () => {
        const options: PlaylistOptions = {
            maxVideos: 1,
            language: "en",
            region: "US"
        };

        beforeEach(() => {
            fetchMock.resetMocks();
        });

        it("should throw if the API key is not found", async () => {
            fetchMock.mockResponseOnce("{}",{
                status: 200
            });
            
            await expect(
                getPlaylist(PLAYLIST_URL, options)
            ).rejects.toThrow("playlist: `INNERTUBE_API_KEY` not found");
        });

        it("should throw if the initial data is not found", async () => {
            const data = `"INNERTUBE_API_KEY":"<API key>"`;

            fetchMock.mockResponseOnce(data, {
                status: 200
            });
            
            await expect(
                getPlaylist(PLAYLIST_URL, options)
            ).rejects.toThrow("playlist: `ytInitialData` not found");
        });

        it("should throw if an error is found", async () => {
            const data = await fs.readFile(
                path.join(__dirname, "data/html/playlistError.txt"),
                "utf-8"
            );

            fetchMock.mockResponseOnce(data, {
                status: 200
            });
            
            await expect(
                getPlaylist(PLAYLIST_URL, options)
            ).rejects.toThrow("playlist: failed to retreive information");
        });

        it("should return information about the playlist", async () => {
            const data = await fs.readFile(
                path.join(__dirname, "data/html/playlist.txt"),
                "utf-8"
            );

            fetchMock.mockResponseOnce(data, {
                status: 200
            });

            const playlist = await getPlaylist(PLAYLIST_URL, options);
            
            expect(playlist).toMatchObject<Playlist>({
                id: "PLT_r_AwlIdMIRGjBygNMJPw5sG522LLTC",
                url: "https://www.youtube.com/playlist?list=PLT_r_AwlIdMIRGjBygNMJPw5sG522LLTC",
                title: "R&B",
                channelUrl: "https://www.youtube.com/channel/UCyNJlR7nxAcK2rXNyhBvr2Q",
                channelName: "R&B Lounge",
                thumbnails: [],
                videos: [
                    {
                        id: "OFYHuE7vWyk",
                        url: "https://www.youtube.com/watch?v=OFYHuE7vWyk",
                        title: "Brandon Christian - They Ain't You",
                        channelUrl: "https://www.youtube.com/channel/UCyNJlR7nxAcK2rXNyhBvr2Q",
                        channelName: "R&B Lounge",
                        thumbnails: [],
                        duration: 180,
                        isLive: false
                    }
                ]
            });
        });
    });
});