import React from 'react';
import { productService } from '../../../../application/products/productService.js';
import { getApiErrorMessage } from '../../../../infrastructure/http/adminApi.js';
import { MediaBundleUploader } from '../../../../shared/ui/mediaBundleUploader.jsx';

function extractProductMediaBundle(payload) {
    const fullProduct = payload?.product ?? payload ?? {};

    return {
        cover_image: fullProduct.cover_image ?? null,
        intro_video: fullProduct.intro_video ?? null,
        gallery: Array.isArray(fullProduct.gallery) ? fullProduct.gallery : [],
    };
}

export function ProductGalleryManager({ productId, draft, onDraftChange }) {
    return (
        <MediaBundleUploader
            entityId={productId}
            value={{
                cover_image: draft?.cover_image ?? null,
                intro_video: draft?.intro_video ?? null,
                gallery: Array.isArray(draft?.gallery) ? draft.gallery : [],
            }}
            onChange={(nextMedia) => {
                onDraftChange({
                    ...draft,
                    cover_image: nextMedia.cover_image,
                    intro_video: nextMedia.intro_video,
                    gallery: nextMedia.gallery,
                });
            }}
            emptyStateMessage="Save the product first to upload media."
            labels={{
                coverTitle: 'Main Product Image',
                coverDescription: 'This image will be displayed as the main product thumbnail.',
                galleryTitle: 'Product Gallery',
                galleryDescription: 'Add multiple images to showcase your product from different angles. You can add up to 20 images.',
                videoTitle: 'Introduction Video',
                videoDescription: 'Upload a promotional or introduction video for your product.',
            }}
            onUpload={async ({ entityId, file, field, onProgress }) => {
                const form = new FormData();
                form.append('file', file);
                form.append('field', field);

                try {
                    const response = await productService.uploadProductMedia(entityId, form, onProgress);
                    return extractProductMediaBundle(response);
                } catch (error) {
                    throw new Error(getApiErrorMessage(error, 'Upload failed. Please try again.'));
                }
            }}
            onDelete={async ({ entityId, field, index }) => {
                try {
                    const response = await productService.deleteProductMedia(entityId, {
                        field,
                        index: index ?? null,
                    });
                    return extractProductMediaBundle(response);
                } catch (error) {
                    throw new Error(getApiErrorMessage(error, 'Delete failed. Please try again.'));
                }
            }}
        />
    );
}
