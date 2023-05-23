import path from "node:path";
import fs from "node:fs/promises";
import fetchMock from "jest-fetch-mock";

// Internal
import {
    isVideoUrl,
    getVideo,
    getVideoFormats,
    getVideoMeta,
    _hidden
} from "../src/video";

// Types
import type { VideoMeta } from "../src/video";

/**
    Video URL for unit testing.
*/
const VIDEO_URL = "https://www.youtube.com/watch?v=ryT-ltTDCko";

const {
    _getData,
    _getFormats,
    _getM3u8Formats,
    _getMeta,
    _getPlayer,
    _verifyParameters
} = _hidden!;

describe("video", () => {
    describe("_verifyParameters", () => {
        it("should only accept `url` as a string", () => {
            expect(() => _verifyParameters(null, {}))
                .toThrow("`url` must be a string");
        });

        it("should only accept `url` as a valid playlist URL", () => {
            expect(() => _verifyParameters("https://example.com", {}))
                .toThrow("`url` must be a valid video URL");
        });

        it("should only accept `language` along with `region`", () => {
            expect(() => {
                _verifyParameters(VIDEO_URL, {
                    language: "de"
                });
            }).toThrow("`language` and `region` must be used together");

            expect(() => {
                _verifyParameters(VIDEO_URL, {
                    region: "DE"
                });
            }).toThrow("`language` and `region` must be used together");

            expect(
                _verifyParameters(VIDEO_URL, {
                    language: "de",
                    region: "DE"
                })
            ).toBe(void 0);
        });

        it("should only accept `language` when it is a ISO 639-1 code", () => {
            expect(() => {
                _verifyParameters(VIDEO_URL, {
                    language: "abc",
                    region: "DE"
                });
            }).toThrow("`language` must be an ISO 639-1 language code");
        });

        it("should only accept `region` when it is a ISO 3166-2 code", () => {
            expect(() => {
                _verifyParameters(VIDEO_URL, {
                    language: "de",
                    region: "ABC"
                });
            }).toThrow("`region` must be an ISO 3166-2 region code");
        });
    });

    describe("_getPlayer()", () => {
        beforeEach(() => {
            fetchMock.resetMocks();
        });

        it("should throw if `PLAYER_JS_URL` is not found", async () => {
            fetchMock.mockResponseOnce("", {
                status: 200
            });

            await expect(_getPlayer(VIDEO_URL))
                .rejects
                .toThrow("video: `PLAYER_JS_URL` not found");
        });
    });

    describe("_getData()", () => {
        beforeEach(() => {
            fetchMock.resetMocks();
        });

        it("should throw if `playerResponse` is not found", async () => {
            fetchMock.mockResponseOnce("", {
                status: 200
            });

            await expect(_getData(VIDEO_URL))
                .rejects
                .toThrow("video: `playerResponse` not found");
        });
    });

    describe("_getM3u8Formats()", () => {
        beforeEach(() => {
            fetchMock.resetMocks();
        });

        it("should return an array of formats", async () => {
            fetchMock.mockResponseOnce("", {
                status: 200
            });

            const formats = await _getM3u8Formats("");

            expect(Array.isArray(formats)).toBe(true);
        });
    });

    describe("_getFormats()", () => {
        it("should throw if `streamingData` is not found", async () => {
            await expect(_getFormats({}))
                .rejects
                .toThrow("video: `streamingData` not found");
        });
    });

    describe("_getMeta()", () => {
        it("should throw if `videoDetails` is not found", () => {
            expect(() => _getMeta({}))
                .toThrow("video: `videoDetails` not found");
        });

        it("should throw if the video ID is not found", () => {
            const data = {
                videoDetails: {}
            };

            expect(() => _getMeta(data))
                .toThrow("video: missing video ID");
        });

        it("should throw if the channel ID is not found", () => {
            const data = {
                videoDetails: {
                    videoId: "<video ID>"
                }
            };

            expect(() => _getMeta(data))
                .toThrow("video: missing channel ID");
        });

        it("should return video meta", () => {
            const data = {
                videoDetails: {
                    videoId: "ryT-ltTDCko",
                    title: "Prince - Purple Rain (Live At Paisley Park, 1999)",
                    lengthSeconds: "696",
                    channelId: "UCk3ZjUeo6rwtXVdvelevVag",
                    thumbnail: {
                        thumbnails: []
                    },
                    author: "princevevo",
                    isLiveContent: false
                }
            };

            const meta = _getMeta(data);

            expect(meta).toMatchObject<VideoMeta>({
                id: "ryT-ltTDCko",
                url: "https://www.youtube.com/watch?v=ryT-ltTDCko",
                title: "Prince - Purple Rain (Live At Paisley Park, 1999)",
                channelUrl: "https://www.youtube.com/channel/UCk3ZjUeo6rwtXVdvelevVag",
                channelName: "princevevo",
                thumbnails: [],
                duration: 696,
                isLive: false
            });
        });
    });

    describe("isVideoUrl()", () => {
        it("should return `false` for invalid video URLs", () => {
            expect(
                isVideoUrl(null)
            ).toBe(false);

            expect(
                isVideoUrl("https://example.org")
            ).toBe(false);
        });

        it("should return `true` for valid video URLs", () => {
            expect(
                isVideoUrl(VIDEO_URL)
            ).toBe(true);
        });
    });
});