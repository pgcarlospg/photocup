'use client';

import React, { useState, useCallback } from 'react';
import { Upload, X, CheckCircle2, Image as ImageIcon, Info } from 'lucide-react';
import { extractExif } from '@/lib/exif';
import { ExifData } from '@/types';
import { cn } from '@/lib/utils';

export const PhotoUploader = () => {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [exif, setExif] = useState<ExifData | null>(null);
    const [loading, setLoading] = useState(false);

    const onFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setLoading(true);
            setFile(selectedFile);
            const objectUrl = URL.createObjectURL(selectedFile);
            setPreview(objectUrl);

            // Extract EXIF
            const metadata = await extractExif(selectedFile);
            setExif(metadata);
            setLoading(false);
        }
    }, []);

    const clear = () => {
        setFile(null);
        setPreview(null);
        setExif(null);
    };

    return (
        <div className="w-full max-w-4xl mx-auto p-6">
            {!preview ? (
                <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-white/10 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer group">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <div className="p-4 rounded-full bg-purple-500/10 text-purple-400 group-hover:scale-110 transition-transform mb-4">
                            <Upload className="w-8 h-8" />
                        </div>
                        <p className="mb-2 text-sm text-gray-400">
                            <span className="font-semibold text-white">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">JPG or PNG (MAX. 20MB)</p>
                    </div>
                    <input type="file" className="hidden" accept="image/jpeg,image/png" onChange={onFileChange} />
                </label>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* Preview Image */}
                    <div className="relative aspect-square rounded-2xl overflow-hidden glass">
                        <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                        <button
                            onClick={clear}
                            className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Metadata Display */}
                    <div className="flex flex-col gap-6">
                        <div className="glass p-6 rounded-2xl">
                            <div className="flex items-center gap-2 mb-4 text-purple-400">
                                <Info className="w-5 h-5" />
                                <h3 className="font-bold text-white uppercase tracking-wider text-sm">Technical Metadata</h3>
                            </div>

                            {loading ? (
                                <div className="space-y-4 animate-pulse">
                                    <div className="h-4 bg-white/5 rounded w-3/4"></div>
                                    <div className="h-4 bg-white/5 rounded w-1/2"></div>
                                    <div className="h-4 bg-white/5 rounded w-2/3"></div>
                                </div>
                            ) : exif ? (
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-gray-500 mb-1">Camera</p>
                                        <p className="text-gray-200 font-medium">{exif.cameraMake} {exif.cameraModel}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500 mb-1">ISO</p>
                                        <p className="text-gray-200 font-medium">{exif.iso}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500 mb-1">Aperture</p>
                                        <p className="text-gray-200 font-medium">{exif.aperture}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500 mb-1">Speed</p>
                                        <p className="text-gray-200 font-medium">{exif.shutterSpeed}</p>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-yellow-400/70 text-sm">No EXIF data found. Ensure the image contains metadata.</p>
                            )}
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Title</label>
                                <input
                                    type="text"
                                    placeholder="Enter a descriptive title"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">The Story (Max 100 words)</label>
                                <textarea
                                    rows={3}
                                    placeholder="Tell us the story behind this shot..."
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all resize-none"
                                />
                            </div>
                            <button className="w-full py-4 rounded-xl grad-premium text-white font-bold hover:shadow-[0_0_20px_rgba(168,85,247,0.3)] transition-all flex items-center justify-center gap-2">
                                <CheckCircle2 className="w-5 h-5" />
                                Submit Entry
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
