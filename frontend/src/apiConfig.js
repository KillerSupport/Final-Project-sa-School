import axios from 'axios';

const LOCAL_API_ORIGIN = 'http://localhost:5000';

export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || LOCAL_API_ORIGIN).replace(/\/$/, '');

export const toApiUrl = (url) => {
    if (typeof url !== 'string') return url;
    return url.startsWith(LOCAL_API_ORIGIN) ? `${API_BASE_URL}${url.slice(LOCAL_API_ORIGIN.length)}` : url;
};

axios.interceptors.request.use((config) => ({
    ...config,
    url: toApiUrl(config.url)
}));

const nativeOpen = window.open.bind(window);
window.open = (url, ...args) => nativeOpen(toApiUrl(url), ...args);
