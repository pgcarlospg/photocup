import exifr from 'exifr';
import { ExifData } from '@/types';

export async function extractExif(file: File): Promise<ExifData | null> {
    try {
        const data = await exifr.parse(file, {
            pick: [
                'Make', 'Model', 'LensModel', 'ISO',
                'FNumber', 'ExposureTime', 'FocalLength', 'DateTimeOriginal'
            ]
        });

        if (!data) return null;

        return {
            cameraMake: data.Make,
            cameraModel: data.Model,
            lens: data.LensModel,
            iso: data.ISO,
            aperture: data.FNumber ? `f/${data.FNumber}` : undefined,
            shutterSpeed: formatShutterSpeed(data.ExposureTime),
            focalLength: data.FocalLength ? `${data.FocalLength}mm` : undefined,
            capturedAt: data.DateTimeOriginal?.toISOString(),
        };
    } catch (error) {
        console.error('Error extracting EXIF:', error);
        return null;
    }
}

function formatShutterSpeed(exposureTime: number | undefined): string | undefined {
    if (!exposureTime) return undefined;
    if (exposureTime >= 1) return `${exposureTime}s`;
    const reciprocal = Math.round(1 / exposureTime);
    return `1/${reciprocal}s`;
}
