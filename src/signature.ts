import { Script } from "node:vm";

// Internal
import { extract } from "./utils";

/**
    Applies the decipher script to an audio format URL.
*/
const _applyDecipherScript = (urlOrSignature: string, decipherScript: Script) => {
    const search = new URLSearchParams(urlOrSignature);

    const url = search.get("url");
    const signature = search.get("s");
    const signatureParam = search.get("sp") || "signature";

    if(!url) {
        throw new Error("signature: audio format URL not found");
    }

    if(!signature) {
        return url;
    }

    const components = new URL(decodeURIComponent(url));

    components.searchParams.set(
        signatureParam,
        decipherScript.runInNewContext({ signature })
    );

    return components.toString();
};

/**
    Applies the `n` parameter script to an audio format URL.
*/
const _applyNParamScript = (url: string, nParamScript: Script) => {
    const components = new URL(decodeURIComponent(url));
    const n = components.searchParams.get("n");

    if(!n) {
        return url;
    }

    components.searchParams.set(
        "n",
        nParamScript.runInNewContext({ n })
    );

    return components.toString();
};

/**
    Extracts the decipher function from the player and
    returns it as a `Script`.
*/
export const getDecipherScript = (player: string) => {
    const fnName = extract(
        player,
        `a.set("alr","yes");c&&(c=`,
        "(decodeURI"
    );

    if(!fnName) {
        throw new Error("signature: decipher function name not found");
    }

    const fnContent = extract(
        player,
        `${fnName}=function(a){`,
        "};"
    );

    if(!fnContent) {
        throw new Error("signature: decipher function not found");
    }

    // Extract manipulations object
    const objName = extract(
        fnContent,
        `a=a.split("");`,
        "."
    );

    if(!objName) {
        throw new Error("signature: manipulations object name not found");
    }

    const objContent = extract(
        player,
        `var ${objName}={`,
        "};"
    );

    if(!objContent) {
        throw new Error("signature: manipulations object not found");
    }

    return new Script(
        `const ${objName} = { ${objContent} };` +
        `const decipher = (a) => { ${fnContent} };` +
        "decipher(signature);"
    );
};

/**
    Extracts the `n` parameter function from the player and
    returns it as a `Script`.
*/
export const getNParamScript = (player: string) => {
    const fnAlias = extract(
        player,
        `&&(b=a.get("n"))&&(b=`,
        "(b)"
    );

    if(!fnAlias) {
        throw new Error("signature: `n` parameter function alias not found");
    }

    const fnName = extract(
        player,
        `var ${fnAlias.slice(0, -3)}=[`,
        "]"
    );

    if(!fnName) {
        throw new Error("signature: `n` parameter function name not found");
    }

    const fnContent = extract(
        player,
        `${fnName}=function(a){`,
        "};"
    );

    if(!fnContent) {
        throw new Error("signature: `n` parameter function not found");
    }

    return new Script(
        `const nParam = (a) => { ${fnContent} };` +
        "nParam(n);"
    );
};

/**
    Deciphers an audio format URL or signature.
*/
export const decipherFormatUrl = (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    format: Record<string, any>,
    decipherScript: Script,
    nParamScript: Script
) => {
    const hasUrl = !!format.url;
    const url = format.url || format.signatureCipher;

    if(hasUrl) {
        return _applyNParamScript(url, nParamScript);
    }

    return _applyNParamScript(
        _applyDecipherScript(url, decipherScript),
        nParamScript
    );
};