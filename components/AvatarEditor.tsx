'use client';

import { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';

interface Point {
    x: number;
    y: number;
}

interface Area {
    x: number;
    y: number;
    width: number;
    height: number;
}

interface AvatarEditorProps {
    imageSrc: string;
    onSave: (croppedImage: Blob) => void;
    onCancel: () => void;
}

export default function AvatarEditor({ imageSrc, onSave, onCancel }: AvatarEditorProps) {
    const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

    const onCropComplete = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const createImage = (url: string): Promise<HTMLImageElement> =>
        new Promise((resolve, reject) => {
            const image = new Image();
            image.addEventListener('load', () => resolve(image));
            image.addEventListener('error', (error) => reject(error));
            image.src = url;
        });

    const getCroppedImg = async (
        imageSrc: string,
        pixelCrop: Area,
        rotation = 0
    ): Promise<Blob> => {
        const image = await createImage(imageSrc);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
            throw new Error('No 2d context');
        }

        const maxSize = Math.max(image.width, image.height);
        const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2));

        canvas.width = safeArea;
        canvas.height = safeArea;

        ctx.translate(safeArea / 2, safeArea / 2);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.translate(-safeArea / 2, -safeArea / 2);

        ctx.drawImage(
            image,
            safeArea / 2 - image.width * 0.5,
            safeArea / 2 - image.height * 0.5
        );

        const data = ctx.getImageData(0, 0, safeArea, safeArea);

        canvas.width = pixelCrop.width;
        canvas.height = pixelCrop.height;

        ctx.putImageData(
            data,
            Math.round(0 - safeArea / 2 + image.width * 0.5 - pixelCrop.x),
            Math.round(0 - safeArea / 2 + image.height * 0.5 - pixelCrop.y)
        );

        return new Promise((resolve) => {
            canvas.toBlob((blob) => {
                if (blob) {
                    resolve(blob);
                }
            }, 'image/jpeg', 0.95);
        });
    };

    const handleSave = async () => {
        if (!croppedAreaPixels) return;

        try {
            const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels, rotation);
            onSave(croppedImage);
        } catch (e) {
            console.error('Error cropping image:', e);
        }
    };

    const handleReset = () => {
        setCrop({ x: 0, y: 0 });
        setZoom(1);
        setRotation(0);
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden">
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-purple-50">
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        Adjust Your Avatar
                    </h2>
                    <p className="text-sm text-slate-600 mt-1">
                        Crop, zoom, and rotate your image to get the perfect profile picture
                    </p>
                </div>

                {/* Cropper Area */}
                <div className="relative h-96 bg-slate-900">
                    <Cropper
                        image={imageSrc}
                        crop={crop}
                        zoom={zoom}
                        rotation={rotation}
                        aspect={1}
                        cropShape="round"
                        showGrid={false}
                        onCropChange={setCrop}
                        onCropComplete={onCropComplete}
                        onZoomChange={setZoom}
                        onRotationChange={setRotation}
                    />
                </div>

                {/* Controls */}
                <div className="px-6 py-4 space-y-4 bg-slate-50">
                    {/* Zoom Control */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                <span>🔍</span>
                                Zoom
                            </label>
                            <span className="text-sm text-slate-600">{Math.round(zoom * 100)}%</span>
                        </div>
                        <input
                            type="range"
                            min={1}
                            max={3}
                            step={0.1}
                            value={zoom}
                            onChange={(e) => setZoom(Number(e.target.value))}
                            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer slider"
                        />
                    </div>

                    {/* Rotation Control */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                <span>🔄</span>
                                Rotation
                            </label>
                            <span className="text-sm text-slate-600">{rotation}°</span>
                        </div>
                        <input
                            type="range"
                            min={0}
                            max={360}
                            step={1}
                            value={rotation}
                            onChange={(e) => setRotation(Number(e.target.value))}
                            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer slider"
                        />
                    </div>

                    {/* Quick Rotation Buttons */}
                    <div className="flex gap-2">
                        <button
                            onClick={() => setRotation((r) => (r - 90 + 360) % 360)}
                            className="flex-1 px-3 py-2 bg-white border-2 border-slate-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all text-sm font-medium text-slate-700"
                        >
                            ↶ Rotate Left
                        </button>
                        <button
                            onClick={() => setRotation((r) => (r + 90) % 360)}
                            className="flex-1 px-3 py-2 bg-white border-2 border-slate-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all text-sm font-medium text-slate-700"
                        >
                            ↷ Rotate Right
                        </button>
                        <button
                            onClick={handleReset}
                            className="px-4 py-2 bg-white border-2 border-slate-200 rounded-lg hover:border-orange-400 hover:bg-orange-50 transition-all text-sm font-medium text-slate-700"
                        >
                            🔄 Reset
                        </button>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="px-6 py-4 bg-white border-t border-slate-200 flex gap-3 justify-end">
                    <button
                        onClick={onCancel}
                        className="px-6 py-2.5 bg-white text-slate-700 border-2 border-slate-200 rounded-xl hover:bg-slate-50 transition-all font-medium"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all font-medium flex items-center gap-2"
                    >
                        <span>✓</span>
                        Save Avatar
                    </button>
                </div>
            </div>

            <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #3b82f6, #a855f7);
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #3b82f6, #a855f7);
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
      `}</style>
        </div>
    );
}
