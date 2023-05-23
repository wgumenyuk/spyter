/**
    Extracts a substring from a larger string.
*/
export const extract = (input: string, left: string, right: string) => {
    let indexLeft = input.indexOf(left);

    if(indexLeft < 0) {
        return null;
    }

    indexLeft += left.length;

    const indexRight = input.indexOf(right, indexLeft);

    if(indexRight < 0) {
        return null;
    }

    return input.slice(indexLeft, indexRight);
};

/**
    Fetches the content of the specified URL and returns it as text.
*/
export const get = async (url: URL | string) => {
    const response = await fetch(url, {
        method: "GET"
    });

    if(!response.ok) {
        throw new Error(`get: bad request (${response.status})`);
    }

    return response.text();
};