// ============================================================================
// IMAGE COMPRESSION UTILITY
// ============================================================================

import type { CompressedImage } from '../types';

export function compressImage(
  file: File,
  maxSizeKB: number = 50
): Promise<CompressedImage> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let quality = 0.9;
        let canvas = document.createElement('canvas');
        let ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        // Resize to max 600px
        let width = img.width;
        let height = img.height;
        const maxDim = 600;

        if (width > height && width > maxDim) {
          height = (height / width) * maxDim;
          width = maxDim;
        } else if (height > maxDim) {
          width = (width / height) * maxDim;
          height = maxDim;
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        const compress = () => {
          canvas.toBlob(
            (blob) => {
              if (blob && (blob.size <= maxSizeKB * 1024 || quality <= 0.1)) {
                resolve({
                  blob,
                  size: blob.size,
                  dataURL: canvas.toDataURL('image/jpeg', quality),
                });
              } else {
                quality -= 0.1;
                compress();
              }
            },
            'image/jpeg',
            quality
          );
        };

        compress();
      };
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
