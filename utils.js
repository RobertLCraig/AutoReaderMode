function convertUrl(originalUrl) {
    try {
        if (originalUrl.startsWith('read://')) {
            return originalUrl;  // Avoid converting if it's already a reader mode URL
        }

        const urlObject = new URL(originalUrl);
        const domain = urlObject.hostname;
        const baseUrl = `read://https_${domain}/?url=`;
        const encodedUrl = encodeURIComponent(originalUrl);
        const readerUrl = baseUrl + encodedUrl;

        console.log(`Converted ${originalUrl} to ${readerUrl}`);  // Log the conversion result

        return readerUrl;
    } catch (e) {
        console.error('Invalid URL:', originalUrl);
        return null;
    }
}

// Ensure that convertUrl is accessible when imported
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { convertUrl };
}
