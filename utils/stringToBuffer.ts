export const stringToBuffer = (str) => {
    const arr = str.split(",");
    const view = new Uint8Array( arr );
    
    return view.buffer;
}