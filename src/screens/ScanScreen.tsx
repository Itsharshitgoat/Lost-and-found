import { useRef, useState, useEffect, useCallback } from 'react';
import { CameraPreview } from '../components/CameraPreview';
import { CameraControls } from '../components/CameraControls';

export function ScanScreen() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const trackRef = useRef<MediaStreamTrack | null>(null);

  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isFlashOn, setIsFlashOn] = useState(false);
  const [isFlashSupported, setIsFlashSupported] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
      trackRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const startCamera = async () => {
    setCameraError(null);
    setHasPermission(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false,
      });

      setHasPermission(true);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      // Check for torch support
      const track = stream.getVideoTracks()[0];
      trackRef.current = track;

      const capabilities = track.getCapabilities?.() as any;
      if (capabilities && capabilities.torch) {
        setIsFlashSupported(true);
      } else {
        setIsFlashSupported(false);
      }

    } catch (err: any) {
      console.error("Camera access error:", err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setHasPermission(false);
      } else {
        setHasPermission(false);
        setCameraError(err.message || "Camera not available");
      }
    }
  };

  useEffect(() => {
    // Only start camera if not showing a captured image
    if (!capturedImage) {
      startCamera();
    }

    return () => {
      stopCamera();
    };
  }, [capturedImage, stopCamera]);

  const handleRequestPermission = () => {
    startCamera();
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setIsFlashOn(false); // Reset flash state on retake
  };

  const handleCaptureClick = () => {
    if (!videoRef.current || !hasPermission || cameraError || capturedImage) return;

    const video = videoRef.current;
    const canvas = document.createElement('canvas');

    // Set canvas dimensions to match video stream natural dimensions
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext('2d');
    if (context) {
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      setCapturedImage(dataUrl);

      // Stop camera when photo is captured to save resources
      stopCamera();
      setIsFlashOn(false);
    }
  };

  const handleFlashToggle = async () => {
    if (!trackRef.current || !isFlashSupported) return;

    try {
      const newFlashState = !isFlashOn;
      await trackRef.current.applyConstraints({
        advanced: [{ torch: newFlashState } as any]
      });
      setIsFlashOn(newFlashState);
    } catch (err) {
      console.error("Failed to toggle flash:", err);
      // Re-evaluate flash support if it failed unexpectedly
      setIsFlashSupported(false);
    }
  };

  const handleGalleryClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setCapturedImage(event.target.result as string);
          stopCamera(); // Stop camera since we selected an image
        }
      };
      reader.readAsDataURL(file);
    }
    // Reset input value so same file can be selected again
    if (e.target) {
        e.target.value = '';
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-brand-bg relative pb-28">
      <header className="pt-8 pb-4">
        <h1 className="text-center text-[26px] font-semibold text-brand-text">Scan an item</h1>
      </header>

      <main className="flex-1 flex flex-col items-center px-4 w-full">
        <div className="w-[90%] max-w-[340px] flex flex-col items-center w-full">
          <CameraPreview
            videoRef={videoRef}
            capturedImage={capturedImage}
            cameraError={cameraError}
            hasPermission={hasPermission}
            onRequestPermission={handleRequestPermission}
            onRetake={handleRetake}
          />

          <div className="mt-8 mb-4 w-full">
            <CameraControls
              onGalleryClick={handleGalleryClick}
              onCaptureClick={handleCaptureClick}
              onFlashToggle={handleFlashToggle}
              isFlashOn={isFlashOn}
              isFlashSupported={isFlashSupported}
            />
          </div>

          {/* Hidden file input for gallery selection */}
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            aria-hidden="true"
          />
        </div>
      </main>
    </div>
  )
}
