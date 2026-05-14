import React, { useRef, useState } from 'react';

const DEFAULT_ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
const DEFAULT_ACCEPTED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];
const DEFAULT_MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

function ImageModal({ media, isOpen, onClose, type = 'image' }) {
    if (!isOpen || !media) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={onClose}>
            <div className="relative max-h-[90vh] max-w-4xl overflow-auto rounded-lg bg-[color:var(--dash-surface)]" onClick={(e) => e.stopPropagation()}>
                <button
                    type="button"
                    className="absolute right-4 top-4 rounded-full bg-black/50 p-2 text-white transition hover:bg-black/70"
                    onClick={onClose}
                    aria-label="Close modal"
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-6 w-6" aria-hidden="true">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                </button>

                {type === 'video' ? (
                    <div className="aspect-video bg-black">
                        <video controls className="h-full w-full">
                            <source src={media.original_url} />
                        </video>
                    </div>
                ) : (
                    <img src={media.original_url} alt="Full view" className="h-auto w-full" />
                )}

                <div className="border-t border-[color:var(--dash-border)] px-6 py-4">
                    <div className="text-sm font-medium text-[color:var(--dash-fg)]">{media.file_name}</div>
                </div>
            </div>
        </div>
    );
}

function UploadZone({ onFileSelect, accept, isLoading, title, description, multiple = false }) {
    const fileInputRef = useRef(null);
    const [isDragActive, setIsDragActive] = useState(false);

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(e.type === 'dragenter' || e.type === 'dragover');
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(false);

        const files = Array.from(e.dataTransfer.files ?? []);
        if (files.length > 0) {
            onFileSelect(multiple ? files : files[0]);
        }
    };

    return (
        <div
            className={`relative rounded-2xl border-2 border-dashed px-6 py-10 text-center transition ${
                isDragActive
                    ? 'border-blue-400 bg-blue-500/5'
                    : 'border-[color:var(--dash-border)] bg-[color:var(--dash-surface-2)]'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
        >
            <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept={accept}
                multiple={multiple}
                onChange={(e) => {
                    const files = Array.from(e.target.files ?? []);
                    onFileSelect(multiple ? files : files[0]);
                }}
                disabled={isLoading}
            />

            <div className="mb-3 flex justify-center text-[color:var(--dash-muted)]">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-12 w-12" aria-hidden="true">
                    <path d="M12 2v20M2 12h20" />
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                </svg>
            </div>
            <div className="text-sm font-semibold text-[color:var(--dash-fg)]">{title}</div>
            <div className="mt-1 text-xs text-[color:var(--dash-muted)]">{description}</div>

            <button
                type="button"
                className="mt-4 rounded-lg border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-xs font-semibold text-blue-300 transition hover:bg-blue-500/20 disabled:opacity-50"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
            >
                {isLoading ? 'Uploading...' : 'Select file'}
            </button>
        </div>
    );
}

function MediaItem({ media, onDelete, isLoading, type = 'image', onView }) {
    const [imageError, setImageError] = useState(false);

    if (!media) return null;

    return (
        <div className="flex items-center gap-4 rounded-xl border border-[color:var(--dash-border)] bg-[color:var(--dash-surface-2)] p-3 transition hover:border-[color:var(--dash-border)] hover:bg-[color:var(--dash-surface)]">
            <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border border-[color:var(--dash-border)] bg-[color:var(--dash-surface)]">
                {type === 'video' ? (
                    <div className="flex h-full w-full items-center justify-center bg-black/20 text-[color:var(--dash-muted)]">
                        <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6" aria-hidden="true">
                            <polygon points="23 7 16 12 23 17 23 7" />
                            <rect x="1" y="5" width="15" height="14" rx="2" ry="2" fill="none" stroke="currentColor" strokeWidth="2" />
                        </svg>
                    </div>
                ) : imageError ? (
                    <div className="flex h-full w-full items-center justify-center text-[color:var(--dash-muted)]">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6" aria-hidden="true">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                            <circle cx="8.5" cy="8.5" r="1.5" />
                            <polyline points="21 15 16 10 5 21" />
                        </svg>
                    </div>
                ) : (
                    <img
                        src={media.original_url}
                        alt="media"
                        className="h-full w-full object-cover"
                        onError={() => setImageError(true)}
                    />
                )}
            </div>

            <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium text-[color:var(--dash-fg)]">{media.file_name}</div>
                <div className="mt-1 text-xs text-[color:var(--dash-muted)]">ID: {media.id}</div>
            </div>

            <div className="flex flex-shrink-0 items-center gap-2">
                <button
                    type="button"
                    className="rounded-lg p-2 text-[color:var(--dash-muted)] transition hover:bg-[color:var(--dash-surface)] hover:text-blue-300 disabled:opacity-50"
                    onClick={() => onView()}
                    disabled={isLoading}
                    title="View full image"
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4" aria-hidden="true">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                    </svg>
                </button>
                <button
                    type="button"
                    className="rounded-lg p-2 text-[color:var(--dash-muted)] transition hover:bg-red-500/10 hover:text-red-300 disabled:opacity-50"
                    onClick={() => onDelete()}
                    disabled={isLoading}
                    title="Delete this media"
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4" aria-hidden="true">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        <line x1="10" y1="11" x2="10" y2="17" />
                        <line x1="14" y1="11" x2="14" y2="17" />
                    </svg>
                </button>
            </div>
        </div>
    );
}

function withMediaShape(value) {
    return {
        cover_image: value?.cover_image ?? null,
        intro_video: value?.intro_video ?? null,
        gallery: Array.isArray(value?.gallery) ? value.gallery : [],
    };
}

export function MediaBundleUploader({
    entityId,
    value,
    onChange,
    onUpload,
    onDelete,
    acceptedImageTypes = DEFAULT_ACCEPTED_IMAGE_TYPES,
    acceptedVideoTypes = DEFAULT_ACCEPTED_VIDEO_TYPES,
    maxFileSize = DEFAULT_MAX_FILE_SIZE,
    emptyStateMessage = 'Save first to upload media.',
    labels,
}) {
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState('');
    const [uploadProgress, setUploadProgress] = useState({});
    const [modalOpen, setModalOpen] = useState(false);
    const [modalMedia, setModalMedia] = useState(null);
    const [modalType, setModalType] = useState('image');

    const mergedLabels = {
        coverTitle: 'Main Image',
        coverDescription: 'This image will be displayed as the main thumbnail.',
        coverUploadTitle: 'Upload main image',
        coverUploadDescription: 'Drag and drop your image here, or click to select',
        coverReplace: 'Replace image',
        galleryTitle: 'Gallery',
        galleryDescription: 'Add multiple images to showcase this item from different angles.',
        galleryCountSuffix: 'uploaded',
        galleryAdd: 'Add gallery images',
        galleryAddMore: 'Add more gallery images',
        videoTitle: 'Introduction Video',
        videoDescription: 'Upload a promotional or introduction video.',
        videoUploadTitle: 'Upload introduction video',
        videoUploadDescription: 'Drag and drop your video here, or click to select',
        videoReplace: 'Replace video',
        ...labels,
    };

    if (!entityId) {
        return (
            <div className="rounded-2xl border border-[color:var(--dash-border)] bg-[color:var(--dash-surface-2)] px-6 py-10 text-center">
                <div className="text-sm text-[color:var(--dash-muted)]">{emptyStateMessage}</div>
            </div>
        );
    }

    const mediaValue = withMediaShape(value);

    const updateValue = (nextValue) => {
        onChange(withMediaShape(nextValue));
    };

    const handleUpload = async (file, field) => {
        if (!file || typeof onUpload !== 'function') return;

        const isImage = field !== 'intro_video' && acceptedImageTypes.includes(file.type);
        const isVideo = field === 'intro_video' && acceptedVideoTypes.includes(file.type);

        if (!isImage && !isVideo) {
            setUploadError(`Invalid file type. ${field === 'intro_video' ? 'Please upload a video.' : 'Please upload an image.'}`);
            return;
        }

        if (file.size > maxFileSize) {
            setUploadError(`File size exceeds ${Math.floor(maxFileSize / (1024 * 1024))}MB limit.`);
            return;
        }

        setUploading(true);
        setUploadError('');

        try {
            const nextMediaValue = await onUpload({
                entityId,
                file,
                field,
                onProgress: (progressEvent) => {
                    if (progressEvent?.total > 0) {
                        const percent = Math.round((progressEvent.loaded / progressEvent.total) * 100);
                        setUploadProgress((prev) => ({ ...prev, [field]: percent }));
                    }
                },
            });

            if (nextMediaValue) {
                updateValue(nextMediaValue);
            }

            setUploadProgress((prev) => {
                const nextProgress = { ...prev };
                delete nextProgress[field];
                return nextProgress;
            });
        } catch (error) {
            setUploadError(error?.message ?? 'Upload failed. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const handleBatchUpload = async (files, field) => {
        const selectedFiles = Array.isArray(files) ? files.filter(Boolean) : [];
        if (!selectedFiles.length) return;

        for (const file of selectedFiles) {
            await handleUpload(file, field);
        }
    };

    const handleDeleteMedia = async (field, index = null) => {
        if (typeof onDelete !== 'function') return;

        setUploading(true);
        setUploadError('');

        try {
            const nextMediaValue = await onDelete({ entityId, field, index });
            if (nextMediaValue) {
                updateValue(nextMediaValue);
            }
        } catch (error) {
            setUploadError(error?.message ?? 'Delete failed. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const coverImage = mediaValue.cover_image;
    const galleryImages = mediaValue.gallery;
    const introVideo = mediaValue.intro_video;

    return (
        <div className="space-y-8">
            <ImageModal media={modalMedia} isOpen={modalOpen} onClose={() => setModalOpen(false)} type={modalType} />

            {uploadError && (
                <div className="flex items-center gap-3 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 flex-shrink-0" aria-hidden="true">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 7v5M12 17h.01" fill="white" />
                    </svg>
                    {uploadError}
                </div>
            )}

            <div className="space-y-4">
                <div>
                    <h3 className="text-base font-semibold text-[color:var(--dash-fg)]">{mergedLabels.coverTitle}</h3>
                    <p className="mt-1 text-sm text-[color:var(--dash-muted)]">{mergedLabels.coverDescription}</p>
                </div>

                <div className="space-y-3">
                    {coverImage ? (
                        <div className="space-y-3">
                            <MediaItem
                                media={coverImage}
                                onDelete={() => handleDeleteMedia('cover_image')}
                                isLoading={Boolean(uploading && uploadProgress.cover_image)}
                                type="image"
                                onView={() => {
                                    setModalMedia(coverImage);
                                    setModalType('image');
                                    setModalOpen(true);
                                }}
                            />
                            <UploadZone
                                onFileSelect={(file) => handleUpload(file, 'cover_image')}
                                accept={acceptedImageTypes.join(',')}
                                isLoading={Boolean(uploading && uploadProgress.cover_image)}
                                title={mergedLabels.coverReplace}
                                description={mergedLabels.coverUploadDescription}
                            />
                        </div>
                    ) : (
                        <UploadZone
                            onFileSelect={(file) => handleUpload(file, 'cover_image')}
                            accept={acceptedImageTypes.join(',')}
                            isLoading={Boolean(uploading && uploadProgress.cover_image)}
                            title={mergedLabels.coverUploadTitle}
                            description={mergedLabels.coverUploadDescription}
                        />
                    )}

                    {uploadProgress.cover_image && (
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs text-[color:var(--dash-muted)]">
                                <span>Uploading...</span>
                                <span className="font-medium">{uploadProgress.cover_image}%</span>
                            </div>
                            <div className="h-2 overflow-hidden rounded-full bg-[color:var(--dash-surface-2)]">
                                <div
                                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all"
                                    style={{ width: `${uploadProgress.cover_image}%` }}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="space-y-4">
                <div>
                    <h3 className="text-base font-semibold text-[color:var(--dash-fg)]">{mergedLabels.galleryTitle}</h3>
                    <p className="mt-1 text-sm text-[color:var(--dash-muted)]">{mergedLabels.galleryDescription}</p>
                </div>

                <div className="space-y-3">
                    {galleryImages.length > 0 && (
                        <div className="space-y-2">
                            <div className="text-xs font-semibold uppercase tracking-wide text-[color:var(--dash-muted)]">
                                {galleryImages.length} image{galleryImages.length !== 1 ? 's' : ''} {mergedLabels.galleryCountSuffix}
                            </div>
                            <div className="space-y-2">
                                {galleryImages.map((image, index) => (
                                    <MediaItem
                                        key={index}
                                        media={image}
                                        onDelete={() => handleDeleteMedia('gallery', index)}
                                        isLoading={Boolean(uploading && uploadProgress.gallery)}
                                        type="image"
                                        onView={() => {
                                            setModalMedia(image);
                                            setModalType('image');
                                            setModalOpen(true);
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    <UploadZone
                        onFileSelect={(files) => handleBatchUpload(files, 'gallery')}
                        accept={acceptedImageTypes.join(',')}
                        isLoading={Boolean(uploading && uploadProgress.gallery)}
                        title={galleryImages.length > 0 ? mergedLabels.galleryAddMore : mergedLabels.galleryAdd}
                        description={`Drag and drop images here${galleryImages.length > 0 ? ', or click to add more (multi-select enabled)' : ' (multi-select enabled)'}`}
                        multiple
                    />

                    {uploadProgress.gallery && (
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs text-[color:var(--dash-muted)]">
                                <span>Uploading...</span>
                                <span className="font-medium">{uploadProgress.gallery}%</span>
                            </div>
                            <div className="h-2 overflow-hidden rounded-full bg-[color:var(--dash-surface-2)]">
                                <div
                                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all"
                                    style={{ width: `${uploadProgress.gallery}%` }}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="space-y-4">
                <div>
                    <h3 className="text-base font-semibold text-[color:var(--dash-fg)]">{mergedLabels.videoTitle}</h3>
                    <p className="mt-1 text-sm text-[color:var(--dash-muted)]">{mergedLabels.videoDescription}</p>
                </div>

                <div className="space-y-3">
                    {introVideo ? (
                        <div className="space-y-3">
                            <MediaItem
                                media={introVideo}
                                onDelete={() => handleDeleteMedia('intro_video')}
                                isLoading={Boolean(uploading && uploadProgress.intro_video)}
                                type="video"
                                onView={() => {
                                    setModalMedia(introVideo);
                                    setModalType('video');
                                    setModalOpen(true);
                                }}
                            />
                            <UploadZone
                                onFileSelect={(file) => handleUpload(file, 'intro_video')}
                                accept={acceptedVideoTypes.join(',')}
                                isLoading={Boolean(uploading && uploadProgress.intro_video)}
                                title={mergedLabels.videoReplace}
                                description={mergedLabels.videoUploadDescription}
                            />
                        </div>
                    ) : (
                        <UploadZone
                            onFileSelect={(file) => handleUpload(file, 'intro_video')}
                            accept={acceptedVideoTypes.join(',')}
                            isLoading={Boolean(uploading && uploadProgress.intro_video)}
                            title={mergedLabels.videoUploadTitle}
                            description={mergedLabels.videoUploadDescription}
                        />
                    )}

                    {uploadProgress.intro_video && (
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs text-[color:var(--dash-muted)]">
                                <span>Uploading...</span>
                                <span className="font-medium">{uploadProgress.intro_video}%</span>
                            </div>
                            <div className="h-2 overflow-hidden rounded-full bg-[color:var(--dash-surface-2)]">
                                <div
                                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all"
                                    style={{ width: `${uploadProgress.intro_video}%` }}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
