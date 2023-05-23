import path from "node:path";
import fs from "node:fs/promises";
import { Script } from "node:vm";

// Internal
import {
    getDecipherScript,
    getNParamScript
} from "../src/signature";

describe("signature", () => {
    describe("getDecipherScript()", () => {
        it("should throw if the decipher function name is not found", () => {
            const data = "";

            expect(() => {
                getDecipherScript(data)
            }).toThrow("signature: decipher function name not found");
        });

        it("should throw if the decipher function name is not found", () => {            
            const data = `
                a.set("alr","yes");c&&(c=decipher(decodeURI
                decipher=function(a){};
            `;

            expect(() => {
                getDecipherScript(data)
            }).toThrow("signature: decipher function not found");
        });

        it("should throw if the manipulations object name is not found", () => {
            const data = `
                a.set("alr","yes");c&&(c=decipher(decodeURI
                decipher=function(a){""};
            `;
            
            expect(() => {
                getDecipherScript(data)
            }).toThrow("signature: manipulations object name not found");
        });

        it("should throw if the manipulations object is not found", () => {
            const data = `
                a.set("alr","yes");c&&(c=decipher(decodeURI
                decipher=function(a){a=a.split("");manipulations.a()};
            `;
            
            expect(() => {
                getDecipherScript(data)
            }).toThrow("signature: manipulations object not found");
        });

        it("should return a script", async () => {
            const data = `
                a.set("alr","yes");c&&(c=decipher(decodeURI
                decipher=function(a){a=a.split("");manipulations.a()};
                var manipulations={a(){}};
            `;
            
            const script = getDecipherScript(data);

            expect(script).toBeInstanceOf(Script);
        });
    });

    describe("getNParamScript()", () => {
        it("should throw if the `n` parameter function alias is not found", () => {
            const data = "";

            expect(() => {
                getNParamScript(data)
            }).toThrow("signature: `n` parameter function alias not found");
        });

        it("should throw if the `n` parameter function name is not found", () => {
            const data = `
                '&&(b=a.get("n"))&&(b=alias[0](b)';
            `;

            expect(() => {
                getNParamScript(data)
            }).toThrow("signature: `n` parameter function name not found");
        });

        it("should throw if the `n` parameter function is not found", () => {
            const data = `
                '&&(b=a.get("n"))&&(b=alias[0](b)';
                var alias=[name];
            `;

            expect(() => {
                getNParamScript(data)
            }).toThrow("signature: `n` parameter function not found");
        });

        it("should return a script", () => {
            const data = `
                '&&(b=a.get("n"))&&(b=alias[0](b)';
                var alias=[name];
                name=function(a){""};
            `;

            const script = getNParamScript(data);

            expect(script).toBeInstanceOf(Script);
        });
    });
});