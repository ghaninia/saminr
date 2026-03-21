import { adminApi } from '../http/adminApi.js';

export const authRepository = {
    async me() {
        const res = await adminApi.get('/auth/me');
        return res.data?.user ?? null;
    },
    async login(email, password) {
        const res = await adminApi.post('/auth/login', { email, password });
        return res.data?.user ?? null;
    },
    async logout() {
        await adminApi.post('/auth/logout');
    },
    async forgotPassword(email) {
        const res = await adminApi.post('/auth/forgot-password', { email });
        return res.data?.message ?? 'If that email address exists, a password reset link has been sent.';
    },
};

