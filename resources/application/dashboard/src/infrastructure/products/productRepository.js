import { adminApi } from '../http/adminApi.js';

export const productRepository = {
    async list() {
        const res = await adminApi.get('/products');
        return res.data?.data ?? [];
    },
    async get(id) {
        const res = await adminApi.get(`/products/${id}`);
        return res.data?.data ?? res.data;
    },
    async listCategories() {
        const res = await adminApi.get('/categories');
        return res.data?.data ?? [];
    },
    async listAttributes() {
        const res = await adminApi.get('/product-attributes');
        return res.data?.data ?? [];
    },
    async create(payload) {
        const res = await adminApi.post('/products', payload);
        return res.data?.data ?? res.data;
    },
    async update(id, payload) {
        const res = await adminApi.patch(`/products/${id}`, payload);
        return res.data?.data ?? res.data;
    },
    async remove(id) {
        await adminApi.delete(`/products/${id}`);
    },
    async upload(id, formData, onUploadProgress) {
        const res = await adminApi.post(`/products/${id}/upload`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            onUploadProgress,
        });
        return res.data ?? {};
    },
};
