import React, { useEffect, useRef, useState } from 'react';
import { Button } from './button.jsx';
import { Field } from './field.jsx';
import { Input } from './input.jsx';
import { isLikelyImageUrl } from '../utils/media.js';

function defaultResolveUrl(response) {
    if (!response) return '';
    if (typeof response === 'string') return response;
    if (typeof response?.url === 'string') return response.url;
    if (typeof response?.data?.url === 'string') return response.data.url;
    return '';
}

function MediaPreviewRow({ title, subtitle, src, previewKind = 'image' }) {
    const [imageError, setImageError] = useState(false);
    const showImage = Boolean(src) && previewKind !== 'video' && isLikelyImageUrl(src);

    return (
        <div className="flex items-center gap-4 rounded-xl border border-[color:var(--dash-border)] bg-[color:var(--dash-surface-2)] p-3 transition hover:border-[color:var(--dash-border)] hover:bg-[color:var(--dash-surface)]">
            <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border border-[color:var(--dash-border)] bg-[color:var(--dash-surface)]">
                {showImage ? (
                    <img src={src} alt={title} className="h-full w-full object-cover" onError={() => setImageError(true)} />
                ) : previewKind === 'avatar' ? (
                    <div className="flex h-full w-full items-center justify-center bg-[color:var(--dash-surface)] text-[color:var(--dash-muted)]">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-6 w-6" aria-hidden="true">
                            <circle cx="12" cy="8" r="3" />
                            <path d="M5 20c1.6-4 4.4-6 7-6s5.4 2 7 6" />
                        </svg>
                    </div>
                ) : previewKind === 'video' ? (
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
                    <div className="flex h-full w-full items-center justify-center text-[color:var(--dash-muted)]">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6" aria-hidden="true">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                            <circle cx="8.5" cy="8.5" r="1.5" />
                            <polyline points="21 15 16 10 5 21" />
                        </svg>
                    </div>
                )}
            </div>

            <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium text-[color:var(--dash-fg)]">{title}</div>
                <div className="mt-1 truncate text-xs text-[color:var(--dash-muted)]">{subtitle}</div>
            </div>
        </div>
    );
}

function UploadZone({
    onPickFile,
    accept,
    isLoading,
    title,
    description,
    buttonLabel = 'Select file',
    multiple = false,
    disabled = false,
    fileInputRef,
}) {
    const [isDragActive, setIsDragActive] = useState(false);

    const handleDrag = (event) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDragActive(event.type === 'dragenter' || event.type === 'dragover');
    };

    const handleDrop = (event) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDragActive(false);

        const files = Array.from(event.dataTransfer.files ?? []);
        if (files.length > 0) {
            onPickFile(multiple ? files : files[0]);
        }
    };

    return (
        <div
            className={`relative rounded-2xl border-2 border-dashed px-6 py-10 text-center transition ${
                isDragActive ? 'border-blue-400 bg-blue-500/5' : 'border-[color:var(--dash-border)] bg-[color:var(--dash-surface-2)]'
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
                onChange={(event) => {
                    const files = Array.from(event.target.files ?? []);
                    onPickFile(multiple ? files : files[0]);
                }}
                disabled={disabled || isLoading}
            />

            <div className="mb-3 flex justify-center text-[color:var(--dash-muted)]">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-12 w-12" aria-hidden="true">
                    <path d="M12 2v20M2 12h20" />
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                </svg>
            </div>
            <div className="text-sm font-semibold text-[color:var(--dash-fg)]">{title}</div>
            <div className="mt-1 text-xs text-[color:var(--dash-muted)]">{description}</div>

            <Button
                type="button"
                variant="subtle"
                size="sm"
                className="mt-4 border border-blue-500/30 bg-blue-500/10 text-blue-300 hover:bg-blue-500/20"
                disabled={disabled || isLoading}
                onClick={() => fileInputRef.current?.click()}
            >
                {isLoading ? 'Uploading…' : buttonLabel}
            </Button>
        </div>
    );
}

export function EntitySingleMediaUploader({
    entityId,
    value,
    onValueChange,
    onUpload,
    onUploaded,
    label = 'Value',
    hint = '',
    valueLabel = 'Value',
    accept = '.png,.jpg,.jpeg,.webp,.svg,.ico,image/*',
    disabled = false,
    previewKind = 'image',
    uploadTitle = 'Choose file',
    uploadHint = 'Upload a file and the value will be updated automatically.',
    selectedPreviewLabel = 'Selected file preview',
    storedPreviewLabel = 'Stored file preview',
    previewSourceLabel = 'Preview',
    showValueField = true,
    readOnlyValue = true,
}) {
    const fileInputRef = useRef(null);
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState('');
    const [uploadProgress, setUploadProgress] = useState(0);
    const [selectedPreviewUrl, setSelectedPreviewUrl] = useState('');

    useEffect(() => {
        return () => {
            if (selectedPreviewUrl) {
                URL.revokeObjectURL(selectedPreviewUrl);
            }
        };
    }, [selectedPreviewUrl]);

    const handleUpload = async (file) => {
        if (!file || typeof onUpload !== 'function') return;

        setUploading(true);
        setUploadError('');

        try {
            if (selectedPreviewUrl) {
                URL.revokeObjectURL(selectedPreviewUrl);
            }
            const previewUrl = URL.createObjectURL(file);
            setSelectedPreviewUrl(previewUrl);

            const response = await onUpload({
                entityId,
                file,
                onProgress: (progressEvent) => {
                    if (!progressEvent?.total) return;
                    const percent = Math.min(100, Math.max(0, Math.round((progressEvent.loaded / progressEvent.total) * 100)));
                    setUploadProgress(percent);
                },
            });

            const nextValue = defaultResolveUrl(response);
            if (nextValue && typeof onValueChange === 'function') {
                onValueChange(nextValue);
            }

            if (typeof onUploaded === 'function') {
                onUploaded(response, nextValue);
            }
        } catch (error) {
            setUploadError(error?.message ?? 'Upload failed. Please try again.');
        } finally {
            setUploading(false);
            setUploadProgress(0);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const storedValue = String(value ?? '').trim();
    const showStoredPreview = Boolean(storedValue) && (previewKind !== 'image' || isLikelyImageUrl(storedValue));
    return (
        <div className="space-y-3">
            <UploadZone
                fileInputRef={fileInputRef}
                accept={accept}
                disabled={disabled}
                isLoading={uploading}
                title={entityId ? uploadTitle : 'Save first'}
                description={uploadHint || hint}
                buttonLabel={uploadTitle}
                onPickFile={(file) => {
                    if (!file || !entityId) return;
                    handleUpload(file);
                }}
            />

            {showValueField ? (
                <Field label={label} hint={hint}>
                    <Input value={value ?? ''} onChange={(e) => onValueChange?.(e.target.value)} readOnly={readOnlyValue} />
                </Field>
            ) : null}

            {uploading && uploadProgress > 0 ? (
                <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs text-[color:var(--dash-muted-2)]">
                        <div>Uploading</div>
                        <div>{uploadProgress}%</div>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full border border-[color:var(--dash-border)] bg-[color:var(--dash-surface-3)]">
                        <div className="h-full bg-indigo-500/70" style={{ width: `${uploadProgress}%` }} />
                    </div>
                </div>
            ) : null}

            {uploadError ? <div className="text-sm text-red-400">{uploadError}</div> : null}

            {selectedPreviewUrl ? (
                <MediaPreviewRow
                    title={selectedPreviewLabel}
                    subtitle={uploadHint || hint || 'Selected file ready to upload.'}
                    src={selectedPreviewUrl}
                    previewKind={previewKind}
                />
            ) : null}

            {showStoredPreview ? (
                <MediaPreviewRow
                    title={storedPreviewLabel}
                    subtitle={storedValue}
                    src={storedValue}
                    previewKind={previewKind}
                />
            ) : null}
        </div>
    );
}
