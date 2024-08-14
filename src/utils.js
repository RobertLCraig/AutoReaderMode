function convertUrl(originalUrl) {
    try {
        if (originalUrl.startsWith('read://')) {
            return originalUrl;
        }

        const urlObject = new URL(originalUrl);
        const domain = urlObject.hostname;
        const baseUrl = `read://https_${domain}/?url=`;
        const encodedUrl = encodeURIComponent(originalUrl);
        const readerUrl = baseUrl + encodedUrl;

        console.log(`Converted ${originalUrl} to ${readerUrl}`);

        return readerUrl;
    } catch (e) {
        console.error('Invalid URL:', originalUrl);
        return null;
    }
}
