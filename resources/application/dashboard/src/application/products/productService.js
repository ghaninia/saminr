import { productRepository } from '../../infrastructure/products/productRepository.js';

export const productService = {
    listProducts() {
        return productRepository.list();
    },
    getProduct(id) {
        return productRepository.get(id);
    },
    listCategories() {
        return productRepository.listCategories();
    },
    listAttributes() {
        return productRepository.listAttributes();
    },
    createProduct(payload) {
        return productRepository.create(payload);
    },
    updateProduct(id, payload) {
        return productRepository.update(id, payload);
    },
    setProductStatus(id, isActive) {
        return productRepository.setStatus(id, isActive);
    },
    deleteProduct(id) {
        return productRepository.remove(id);
    },
    uploadProductMedia(id, formData, onUploadProgress) {
        return productRepository.upload(id, formData, onUploadProgress);
    },
    deleteProductMedia(id, payload) {
        return productRepository.deleteMedia(id, payload);
    },
};
