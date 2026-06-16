'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Cropper from 'react-easy-crop';
import type { Area } from 'react-easy-crop';
import { createCroppedImage } from './createCroppedImage';
import { formatPhotoApiError } from './formatPhotoApiError';
import styles from './ZenformedProfilePhotoModal.module.css';
import {
  ZENFORMED_DEFAULT_AVATAR_SEEDS,
  zenformedDefaultAvatarSrc,
} from '../avatars/defaultAvatarCatalog';

function TrashIcon({ className }: { className?: string }): React.ReactElement {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  );
}

function CameraIcon(): React.ReactElement {
  return (
    <svg className={styles.optionIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}

function UploadIcon(): React.ReactElement {
  return (
    <svg className={styles.optionIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}

function ImageIcon(): React.ReactElement {
  return (
    <svg className={styles.optionIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  );
}

function BackIcon(): React.ReactElement {
  return (
    <svg className={styles.optionIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
  );
}

function getInitials(email: string): string {
  const local = (email || '').split('@')[0] || '';
  if (local.length >= 2) return local.slice(0, 2).toUpperCase();
  return local.slice(0, 1).toUpperCase() || '?';
}

function avatarColor(email: string): string {
  let h = 0;
  for (let i = 0; i < email.length; i++) h = (h * 31 + email.charCodeAt(i)) >>> 0;
  return `hsl(${h % 360}, 55%, 42%)`;
}

type ViewMode = 'main' | 'crop' | 'camera' | 'browse';

function getViewTitle(view: ViewMode): string {
  if (view === 'crop') return 'Crop photo';
  if (view === 'camera') return 'Take photo';
  if (view === 'browse') return 'Browse avatars';
  return 'Change profile picture';
}

export interface ZenformedProfilePhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
  avatarUrl: string | null;
  hasPhoto: boolean;
  onSuccess: () => void;
  /** When true, shows a "Take a picture" action and camera capture flow (Platform). */
  enableCameraCapture?: boolean;
  /** In SaaS mode, pass () => session?.access_token so photo upload/delete are authorized. */
  getAccessToken?: () => string | null;
}

export function ZenformedProfilePhotoModal({
  isOpen,
  onClose,
  userEmail,
  getAccessToken,
  avatarUrl,
  hasPhoto,
  onSuccess,
  enableCameraCapture = false,
}: ZenformedProfilePhotoModalProps): React.ReactElement | null {
  const [view, setView] = useState<ViewMode>('main');
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const resetView = useCallback(() => {
    setView('main');
    setImageToCrop(null);
    setError(null);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, []);

  const handleClose = useCallback(() => {
    resetView();
    onClose();
  }, [resetView, onClose]);

  const stopCameraStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, []);

  const handleHeaderBack = useCallback(() => {
    if (view === 'main') {
      handleClose();
      return;
    }
    if (view === 'crop') {
      if (imageToCrop?.startsWith('blob:')) URL.revokeObjectURL(imageToCrop);
      setImageToCrop(null);
      setCroppedAreaPixels(null);
      setView('main');
      return;
    }
    if (view === 'camera') {
      stopCameraStream();
      setView('main');
      return;
    }
    if (view === 'browse') {
      setView('main');
    }
  }, [view, imageToCrop, handleClose, stopCameraStream]);

  const authHeaders = useCallback((): HeadersInit => {
    const token = getAccessToken?.() ?? null;
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, [getAccessToken]);

  const uploadPhoto = useCallback(async (blob: Blob) => {
    setSaving(true);
    setError(null);
    try {
      if (getAccessToken != null && (getAccessToken() ?? null) == null) {
        throw new Error('Session expired — sign in again and retry.');
      }
      const formData = new FormData();
      formData.set('photo', blob, blob.type === 'image/jpeg' ? 'avatar.jpg' : 'avatar.png');
      const res = await fetch('/api/auth/me/photo', {
        method: 'POST',
        body: formData,
        credentials: 'include',
        headers: authHeaders(),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(formatPhotoApiError(data, 'Failed to save photo'));
      }
      onSuccess();
      resetView();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save photo');
    } finally {
      setSaving(false);
    }
  }, [onSuccess, resetView, authHeaders, getAccessToken]);

  const handleCropComplete = useCallback((_croppedArea: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const handleSaveCrop = useCallback(async () => {
    if (!imageToCrop || !croppedAreaPixels) return;
    setSaving(true);
    setError(null);
    try {
      const blob = await createCroppedImage(imageToCrop, croppedAreaPixels, 'image/jpeg');
      await uploadPhoto(blob);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to crop');
    } finally {
      setSaving(false);
    }
  }, [imageToCrop, croppedAreaPixels, uploadPhoto]);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = '';
      if (!file || !file.type.startsWith('image/')) return;
      const url = URL.createObjectURL(file);
      setImageToCrop(url);
      setView('crop');
      setCrop({ x: 0, y: 0 });
      setZoom(1);
    },
    []
  );

  const startCamera = useCallback(async () => {
    if (!enableCameraCapture) return;
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      streamRef.current = stream;
      setView('camera');
    } catch {
      setError('Camera access denied');
    }
  }, [enableCameraCapture]);

  useEffect(() => {
    if (view !== 'camera' || !streamRef.current || !videoRef.current) return;
    const video = videoRef.current;
    const stream = streamRef.current;
    video.srcObject = stream;
    video.play().catch(() => setError('Could not start video'));
    return () => {
      video.srcObject = null;
    };
  }, [view]);

  const capturePhoto = useCallback(() => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    const url = canvas.toDataURL('image/png');
    stopCameraStream();
    setImageToCrop(url);
    setView('crop');
    setCrop({ x: 0, y: 0 });
    setZoom(1);
  }, [stopCameraStream]);

  const handleAvatarSelect = useCallback(
    async (seed: string) => {
      setSaving(true);
      setError(null);
      try {
        if (getAccessToken != null && (getAccessToken() ?? null) == null) {
          throw new Error('Session expired — sign in again and retry.');
        }
        const postRes = await fetch('/api/auth/me/photo', {
          method: 'POST',
          credentials: 'include',
          headers: {
            ...authHeaders(),
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ dicebearSeed: seed }),
        });
        if (!postRes.ok) {
          const data = await postRes.json().catch(() => ({}));
          throw new Error(formatPhotoApiError(data, 'Failed to save avatar'));
        }
        onSuccess();
        resetView();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to save avatar');
      } finally {
        setSaving(false);
      }
    },
    [onSuccess, resetView, authHeaders, getAccessToken]
  );

  const handleDelete = useCallback(async () => {
    if (!hasPhoto) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/me/photo', {
        method: 'DELETE',
        credentials: 'include',
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error('Failed to remove photo');
      onSuccess();
      resetView();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove photo');
    } finally {
      setSaving(false);
    }
  }, [hasPhoto, onSuccess, resetView, authHeaders]);

  const handleCropCancel = useCallback(() => {
    if (imageToCrop?.startsWith('blob:')) URL.revokeObjectURL(imageToCrop);
    setImageToCrop(null);
    setCroppedAreaPixels(null);
    if (enableCameraCapture) {
      void startCamera();
      return;
    }
    setView('main');
  }, [imageToCrop, enableCameraCapture, startCamera]);

  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} data-zenformed-profile-photo-modal-overlay onClick={handleClose} role="presentation">
      <div
        className={`${styles.container} ${saving ? styles.saving : ''}`}
        data-zenformed-profile-photo-modal-panel
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.header}>
          <button type="button" className={styles.headerBackBtn} onClick={handleHeaderBack} aria-label="Back">
            <BackIcon />
          </button>
          <button type="button" className={styles.closeBtn} onClick={handleClose} aria-label="Close">×</button>
          <h2 className={styles.title}>{getViewTitle(view)}</h2>
        </div>
        <div className={styles.content} data-zenformed-profile-photo-modal-content>
          {view === 'main' && (
            <div className={styles.mainView}>
              <div className={styles.avatarHero}>
                <div className={styles.avatarWrap}>
                  <div
                    className={styles.avatarCircle}
                    style={!avatarUrl ? { backgroundColor: avatarColor(userEmail) } : undefined}
                  >
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="" className={styles.avatarCircleImg} />
                    ) : (
                      <span aria-hidden>{getInitials(userEmail)}</span>
                    )}
                  </div>
                  {hasPhoto && (
                    <button
                      type="button"
                      className={styles.avatarRemoveBtn}
                      onClick={() => void handleDelete()}
                      disabled={saving}
                      title="Remove photo"
                      aria-label="Remove photo"
                    >
                      <TrashIcon />
                    </button>
                  )}
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".png,.jpg,.jpeg,image/png,image/jpeg"
                onChange={handleFileChange}
                style={{ position: 'absolute', width: 0, height: 0, opacity: 0 }}
                aria-hidden
              />
              <div className={styles.optionsList}>
                {hasPhoto && (
                  <button
                    type="button"
                    className={`${styles.optionBtn} ${styles.optionBtnDanger} ${styles.optionBtnDeleteRow}`}
                    onClick={() => void handleDelete()}
                    disabled={saving}
                  >
                    <span className={styles.optionBtnIcon}>
                      <TrashIcon className={styles.optionIcon} />
                    </span>
                    <span className={styles.optionBtnLabel}>Delete Photo</span>
                  </button>
                )}
                <button type="button" className={styles.optionBtn} onClick={() => setView('browse')} disabled={saving}>
                  <span className={styles.optionBtnIcon}>
                    <ImageIcon />
                  </span>
                  <span className={styles.optionBtnLabel}>Browse Avatars</span>
                </button>
                <button
                  type="button"
                  className={styles.optionBtn}
                  onClick={() => fileInputRef.current?.click()}
                  disabled={saving}
                >
                  <span className={styles.optionBtnIcon}>
                    <UploadIcon />
                  </span>
                  <span className={styles.optionBtnLabel}>Upload from Device</span>
                </button>
                {enableCameraCapture ? (
                  <button
                    type="button"
                    className={`${styles.optionBtn} ${styles.optionBtnCameraRow}`}
                    onClick={() => void startCamera()}
                    disabled={saving}
                  >
                    <span className={styles.optionBtnIcon}>
                      <CameraIcon />
                    </span>
                    <span className={styles.optionBtnLabel}>Take a picture</span>
                  </button>
                ) : null}
              </div>
            </div>
          )}

          {view === 'crop' && imageToCrop && (
            <div className={styles.altContent}>
              <div className={styles.cropContainer}>
                <Cropper
                  image={imageToCrop}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  cropShape="round"
                  showGrid={false}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={handleCropComplete}
                />
              </div>
              <div className={styles.cropActions}>
                <button type="button" onClick={handleCropCancel}>
                  {enableCameraCapture ? 'Retake' : 'Cancel'}
                </button>
                <button type="button" onClick={handleSaveCrop} disabled={saving}>
                  {saving ? 'Saving…' : 'Accept'}
                </button>
              </div>
            </div>
          )}

          {enableCameraCapture && view === 'camera' && (
            <div className={styles.altContent}>
              <div className={styles.cameraView}>
                <video ref={videoRef} autoPlay muted playsInline />
                <button type="button" className={styles.cameraCapture} onClick={capturePhoto} aria-label="Capture photo" />
              </div>
              <div className={styles.cameraActions}>
                <button type="button" className={styles.cameraBackBtn} onClick={() => { stopCameraStream(); setView('main'); }}>
                  <BackIcon />
                  Back
                </button>
              </div>
            </div>
          )}

          {view === 'browse' && (
            <div className={styles.browseContent}>
              <div className={styles.browseGrid}>
                {ZENFORMED_DEFAULT_AVATAR_SEEDS.map((seed) => (
                  <button
                    key={seed}
                    type="button"
                    className={styles.browseItem}
                    onClick={() => handleAvatarSelect(seed)}
                    disabled={saving}
                  >
                    <img src={zenformedDefaultAvatarSrc(seed)} alt="" />
                  </button>
                ))}
              </div>
              <div className={styles.browseBackRow}>
                <button type="button" className={styles.optionBtn} onClick={() => setView('main')} disabled={saving}>
                  <span className={styles.optionBtnIcon}>
                    <BackIcon />
                  </span>
                  <span className={styles.optionBtnLabel}>Back</span>
                </button>
              </div>
            </div>
          )}

          {error && <p className={styles.error} role="alert">{error}</p>}
        </div>
      </div>
    </div>
  );
}

/** @deprecated Prefer `ZenformedProfilePhotoModal`. */
export const ProfilePhotoModal = ZenformedProfilePhotoModal;
export type ProfilePhotoModalProps = ZenformedProfilePhotoModalProps;
