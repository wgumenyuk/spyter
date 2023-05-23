import fetchMock from "jest-fetch-mock";

// Internal
import { extract, get } from "../src/utils";

describe("utils", () => {
    describe("extract()", () => {
        it("should return the correct substring", () => {
            expect(extract("ABC", "A", "C")).toBe("B");
        });
        
        it("should return `null` if substring is not found", () => {
            expect(extract("ABC", "X", "C")).toBeNull();
            expect(extract("ABC", "A", "X")).toBeNull();
        });
    });

    describe("get()", () => {
        beforeEach(() => {
            fetchMock.resetMocks();
        });

        it("should return a string", async () => {
            fetchMock.mockResponseOnce("Hello world!", {
                status: 200
            });

            const response = await get("https://www.youtube.com");

            expect(response).toBe("Hello world!");
        });

        it("should throw an error if the response is bad", async () => {
            fetchMock.mockResponseOnce("", {
                status: 500
            });

            await expect(get("https://www.youtube.com")).rejects.toThrow();
        });
    });
});