// util to throw an error asynchronously
export const throwAsync = (name: string) => {
    // implementation using Promise
    void new Promise(() => {
        throw new Error(name);
    });

    // implementation using setTimeout
    // setTimeout(() => {
    //     throw new Error(name);
    // });
};
