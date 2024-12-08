// secureFetch
// - redirect to '/' if not authenticated
const secureFetch = async (url, args = {}) => {
    const response = await fetch(url, args);

    if (response.status === 401) {
        window.location.href = '/';
    }

    const ContentType = response.headers.get('Content-Type');
    if (ContentType.includes('text/html')) {
        window.location.href = '/';
    }

    return response;
}

export default secureFetch;