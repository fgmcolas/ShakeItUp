const API_URL = import.meta.env.VITE_API_URL;

export const get = async (path) => {
    const res = await fetch(`${API_URL}${path}`);
    if (!res.ok) throw new Error('GET failed');
    return res.json();
};

export const post = async (path, data) => {
    const res = await fetch(`${API_URL}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('POST failed');
    return res.json();
};
