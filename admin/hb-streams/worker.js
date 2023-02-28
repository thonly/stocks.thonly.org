import Streams from "/admin/hb-streams/Streams.mjs"; // NEED absolute path to work else silent error // NOTE: import errors will fail silently!!!
let stream;

self.onmessage = event => {
    switch (event.data.action) {
        case "open":
            stream.openStream();
            break;
        case "close":
            stream.closeStream();
            break;
        default:
            stream = new Streams(event.data.action);
            break;
    }
};