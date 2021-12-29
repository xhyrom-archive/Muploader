export const bufferToString = (buf) => {
    const view = new Uint8Array( buf );
    return Array.prototype.join.call(view, ",");
}