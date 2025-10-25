import React, { useState, useCallback, useRef } from 'react';
import { Camera, Upload, Video, RotateCw, Check } from 'lucide-react';
import Webcam from 'react-webcam';
import ReactCrop, {
  centerCrop,
  makeAspectCrop,
  type Crop as CropType,
  type PixelCrop,
} from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Button } from '../ui/Button';
import { compressImage } from '../../utils/imageCompression';
import type { CompressedImage } from '../../types';

interface PhotoUploadEditorProps {
  onPhotoReady: (compressed: CompressedImage) => void;
  initialPhoto?: string | null;
}

export function PhotoUploadEditor({
  onPhotoReady,
  initialPhoto = null,
}: PhotoUploadEditorProps) {
  const [mode, setMode] = useState<'select' | 'webcam' | 'edit'>('select');
  const [capturedImage, setCapturedImage] = useState<string | null>(
    initialPhoto
  );
  const [crop, setCrop] = useState<CropType>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [rotation, setRotation] = useState(0);
  const [scale] = useState(1);
  const webcamRef = useRef<any>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setCapturedImage(reader.result as string);
      setMode('edit');
    };
    reader.readAsDataURL(file);
  };

  const captureFromWebcam = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setCapturedImage(imageSrc);
      setMode('edit');
    }
  }, [webcamRef]);

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    const crop = centerCrop(
      makeAspectCrop(
        {
          unit: '%',
          width: 90,
        },
        1,
        width,
        height
      ),
      width,
      height
    );
    setCrop(crop);
  };

  const applyEdits = async () => {
    if (!imgRef.current || !canvasRef.current || !capturedImage) return;

    const image = imgRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    let sourceX = 0;
    let sourceY = 0;
    let sourceWidth = image.naturalWidth;
    let sourceHeight = image.naturalHeight;

    if (completedCrop) {
      sourceX = completedCrop.x * scaleX;
      sourceY = completedCrop.y * scaleY;
      sourceWidth = completedCrop.width * scaleX;
      sourceHeight = completedCrop.height * scaleY;
    }

    canvas.width = sourceWidth;
    canvas.height = sourceHeight;

    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(scale, scale);
    ctx.translate(-canvas.width / 2, -canvas.height / 2);

    ctx.drawImage(
      image,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      0,
      0,
      sourceWidth,
      sourceHeight
    );

    ctx.restore();

    canvas.toBlob(
      async (blob) => {
        if (blob) {
          const file = new File([blob], 'photo.jpg', { type: 'image/jpeg' });
          const compressed = await compressImage(file);
          onPhotoReady(compressed);
        }
      },
      'image/jpeg',
      0.9
    );
  };

  const rotateImage = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const resetEdits = () => {
    setRotation(0);
    setCrop(undefined);
    setCompletedCrop(undefined);
  };

  return (
    <div className="space-y-4">
      {mode === 'select' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 transition-colors"
            onClick={() => document.getElementById('file-upload')?.click()}
          >
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload"
            />
            <Upload className="w-12 h-12 mx-auto text-gray-400 mb-2" />
            <p className="text-gray-600 font-medium">Upload from Device</p>
            <p className="text-sm text-gray-500 mt-1">Click to browse files</p>
          </div>

          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 transition-colors"
            onClick={() => setMode('webcam')}
          >
            <Video className="w-12 h-12 mx-auto text-gray-400 mb-2" />
            <p className="text-gray-600 font-medium">Use Webcam</p>
            <p className="text-sm text-gray-500 mt-1">Capture photo directly</p>
          </div>
        </div>
      )}

      {mode === 'webcam' && (
        <div className="space-y-4">
          <div className="relative rounded-lg overflow-hidden bg-black">
            <Webcam
              ref={webcamRef}
              audio={false}
              screenshotFormat="image/jpeg"
              className="w-full"
              videoConstraints={{
                width: 1280,
                height: 720,
                facingMode: 'user',
              }}
            />
          </div>
          <div className="flex gap-2 justify-center">
            <Button onClick={captureFromWebcam}>
              <Camera className="w-4 h-4" />
              Capture Photo
            </Button>
            <Button variant="secondary" onClick={() => setMode('select')}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {mode === 'edit' && capturedImage && (
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="mb-4 flex flex-wrap gap-2">
              <Button size="sm" variant="secondary" onClick={rotateImage}>
                <RotateCw className="w-4 h-4" />
                Rotate 90°
              </Button>
              <Button size="sm" variant="secondary" onClick={resetEdits}>
                Reset
              </Button>
              <div className="flex items-center gap-2 ml-auto">
                <span className="text-sm text-gray-600">
                  Rotation: {rotation}°
                </span>
              </div>
            </div>

            <div className="max-h-96 overflow-auto flex justify-center bg-white rounded-lg p-4">
              <ReactCrop
                crop={crop}
                onChange={(c) => setCrop(c)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={1}
              >
                <img
                  ref={imgRef}
                  src={capturedImage}
                  alt="Edit"
                  onLoad={onImageLoad}
                  style={{
                    transform: `rotate(${rotation}deg) scale(${scale})`,
                    maxWidth: '100%',
                  }}
                />
              </ReactCrop>
            </div>
          </div>

          <canvas ref={canvasRef} className="hidden" />

          <div className="flex gap-2 justify-end">
            <Button
              variant="secondary"
              onClick={() => {
                setCapturedImage(null);
                setMode('select');
                resetEdits();
              }}
            >
              Cancel
            </Button>
            <Button onClick={applyEdits}>
              <Check className="w-4 h-4" />
              Apply & Save
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
