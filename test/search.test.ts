import path from "node:path";
import fs from "node:fs/promises";
import fetchMock from "jest-fetch-mock";

// Internal
import { search, _hidden } from "../src/search";

// Types
import type { Video } from "../src/video";

const {
    _parseItem,
    _parseDurationTimestamp,
    _verifyParameters
} = _hidden!;

describe("search", () => {
    describe("_verifyParameters()", () => {
        it("should only accept `query` as a string", () => {
            expect(() => _verifyParameters(null, {}))
                .toThrow("`query` must be a string");
        });

        it("should only accept `query` when between 1 and 100 characters long", () => {
            const shortQuery = "";
            const longQuery = "*".repeat(125);
            
            expect(() => _verifyParameters(shortQuery, {}))
                .toThrow("`query` must be between 1 and 100 charachters long");

            expect(() => _verifyParameters(longQuery, {}))
                .toThrow("`query` must be between 1 and 100 charachters long");
        });

        it("should only accept `maxVideos` as a number", () => {
            expect(() => {
                _verifyParameters("Purple Rain", {
                    // @ts-expect-error
                    maxVideos: "10"
                });
            }).toThrow("`maxVideos` must be a number");
        });

        it("should only accept `maxVideos` when between 1 and 50", () => {
            expect(() => {
                _verifyParameters("Purple Rain", {
                    maxVideos: -1
                });
            }).toThrow("`maxVideos` must be larger than or equal to 1");

            expect(() => {
                _verifyParameters("Purple Rain", {
                    maxVideos: 100
                });
            }).toThrow("`maxVideos` must be smaller than or equal to 50");
        });

        it("should only accept `language` along with `region`", () => {
            expect(() => {
                _verifyParameters("Purple Rain", {
                    language: "de"
                });
            }).toThrow("`language` and `region` must be used together");

            expect(() => {
                _verifyParameters("Purple Rain", {
                    region: "DE"
                });
            }).toThrow("`language` and `region` must be used together");

            expect(
                _verifyParameters("Purple Rain", {
                    language: "de",
                    region: "DE"
                })
            ).toBe(void 0);
        });

        it("should only accept `language` when it is a ISO 639-1 code", () => {
            expect(() => {
                _verifyParameters("Purple Rain", {
                    language: "abc",
                    region: "DE"
                });
            }).toThrow("`language` must be an ISO 639-1 language code");
        });

        it("should only accept `region` when it is a ISO 3166-2 code", () => {
            expect(() => {
                _verifyParameters("Purple Rain", {
                    language: "de",
                    region: "ABC"
                });
            }).toThrow("`region` must be an ISO 3166-2 region code");
        });
    });

    describe("_parseDurationTimestamp()", () => {
        it("should return `0` if the duration is `null`", () => {
            expect(_parseDurationTimestamp(null)).toBe(0);
        });

        it("should return the duration in seconds", () => {
            expect(_parseDurationTimestamp("0:30")).toBe(30);
            expect(_parseDurationTimestamp("1:30")).toBe(90);
            expect(_parseDurationTimestamp("01:05:00")).toBe(3900);
        });
    });

    describe("_parseItem()", () => {
        it("should throw if the video ID is missing", () => {
            expect(() => {
                _parseItem({});
            }).toThrow("search: missing video ID");
        });

        it("should throw if the channel ID is missing", () => {
            expect(() => {
                _parseItem({
                    videoId: "abc"
                });
            }).toThrow("search: missing channel ID");
        });

        it("should parse a video item", () => {
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
                lengthText: {
                    simpleText: "11:36"
                },
                ownerText: {
                    runs: [{
                        text: "Prince",
                        navigationEndpoint: {
                            browseEndpoint: {
                                browseId: "UCv3mNSNjuWldihk1DUdnGtw"
                            }
                        }
                    }]
                }
            });

            expect(video).toMatchObject<Video>({
                id: "ryT-ltTDCko",
                url: "https://www.youtube.com/watch?v=ryT-ltTDCko",
                title: "Prince - Purple Rain (Live At Paisley Park, 1999)",
                channelUrl: "https://www.youtube.com/channel/UCv3mNSNjuWldihk1DUdnGtw",
                channelName: "Prince",
                thumbnails: [],
                duration: 696,
                isLive: false,
                formats: []
            });
        });
    });

    describe("search()", () => {
        it("should verify the specified parameters", async () => {
            await expect(
                // @ts-expect-error
                search(null)
            ).rejects.toThrow("`query` must be a string");
        });

        it("should throw if `ytInitialData` is not found", async () => {
            fetchMock.mockResponseOnce(
                "Hello world!",
                { status: 200 }
            );

            await expect(
                search("Purple Rain")
            ).rejects.toThrow("search: `ytInitialData` not found");
        });

        it("should return an array of videos", async () => {
            const html = await fs.readFile(
                path.join(__dirname, "data/html/search.txt"),
                "utf-8"
            );

            fetchMock.mockResponseOnce(html, {
                status: 200
            });

            const videos = await search("Purple Rain");

            expect(Array.isArray(videos)).toBe(true);
            
            expect(videos[0]).toMatchObject<Video>({
                id: "TvnYmWpD_T8",
                url: "https://www.youtube.com/watch?v=TvnYmWpD_T8",
                title: "Prince - Purple Rain (Official Video)",
                channelUrl: "https://www.youtube.com/channel/UCPzbKgAJ6gj0xMVgMHIV2gQ",
                channelName: "The Codfather",
                thumbnails: [],
                duration: 478,
                isLive: false,
                formats: []
            });
        });
    });
});