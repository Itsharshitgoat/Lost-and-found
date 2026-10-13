import type { RefObject } from 'react';
import { Camera } from 'lucide-react';

interface CameraPreviewProps {
  videoRef: RefObject<HTMLVideoElement | null>;
  capturedImage: string | null;
  cameraError: string | null;
  hasPermission: boolean | null;
  onRequestPermission: () => void;
  onRetake: () => void;
}

export function CameraPreview({
  videoRef,
  capturedImage,
  cameraError,
  hasPermission,
  onRequestPermission,
  onRetake
}: CameraPreviewProps) {

  return (
    <div className="w-full aspect-[3/4] max-h-[60vh] bg-black rounded-[28px] overflow-hidden shadow-md relative flex flex-col items-center justify-center">

      {/* Captured Image View */}
      {capturedImage && (
        <>
          <img
            src={capturedImage}
            alt="Captured"
            className="w-full h-full object-cover"
          />
          <button
            onClick={onRetake}
            className="absolute top-4 right-4 bg-black/60 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm"
          >
            Retake
          </button>
        </>
      )}

      {/* Live Camera View */}
      {!capturedImage && (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-full object-cover ${hasPermission && !cameraError ? 'opacity-100' : 'opacity-0'}`}
        />
      )}

      {/* States Overlays */}
      {!capturedImage && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-white bg-[#2A2A2A]">
          {cameraError ? (
            <>
              <Camera size={48} className="text-gray-400 mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">Camera Unavailable</p>
              <p className="text-sm text-gray-400 mb-4">{cameraError}</p>
              <button
                onClick={onRequestPermission}
                className="px-6 py-2 bg-brand-primary rounded-full font-medium"
              >
                Try Again
              </button>
            </>
          ) : hasPermission === false ? (
            <>
              <Camera size={48} className="text-gray-400 mb-4" />
              <p className="text-lg font-medium mb-2">Camera access is needed</p>
              <p className="text-sm text-gray-400 mb-6">Please allow camera access to scan items.</p>
              <button
                onClick={onRequestPermission}
                className="px-6 py-2 bg-brand-primary rounded-full font-medium"
              >
                Enable camera
              </button>
            </>
          ) : hasPermission === null ? (
            // Loading state (optional spinner could go here)
            <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin opacity-50"></div>
          ) : null}
        </div>
      )}
    </div>
  );
}
