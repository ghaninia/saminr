import axios from 'axios';

export const adminApi = axios.create({
    baseURL: '/api/admin',
    withCredentials: true,
    headers: {
        'X-Requested-With': 'XMLHttpRequest',
        Accept: 'application/json',
    },
});

export function getApiErrorMessage(error, fallback = 'Something went wrong.') {
    return error?.response?.data?.message ?? fallback;
}

