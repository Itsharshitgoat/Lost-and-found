import { Image as ImageIcon, Camera, Zap, ZapOff } from 'lucide-react';

interface CameraControlsProps {
  onGalleryClick: () => void;
  onCaptureClick: () => void;
  onFlashToggle: () => void;
  isFlashOn: boolean;
  isFlashSupported: boolean;
}

export function CameraControls({
  onGalleryClick,
  onCaptureClick,
  onFlashToggle,
  isFlashOn,
  isFlashSupported
}: CameraControlsProps) {
  return (
    <div className="w-full flex items-center justify-between px-4">
      {/* Gallery Button */}
      <button
        onClick={onGalleryClick}
        className="w-[58px] h-[58px] rounded-full bg-white flex items-center justify-center shadow-sm text-gray-700 active:scale-95 transition-transform"
        aria-label="Choose from gallery"
      >
        <ImageIcon size={24} strokeWidth={1.5} />
      </button>

      {/* Capture Button */}
      <button
        onClick={onCaptureClick}
        className="w-[84px] h-[84px] rounded-full bg-brand-primary flex items-center justify-center shadow-md active:scale-95 transition-transform"
        aria-label="Take photo"
      >
        <div className="w-[72px] h-[72px] rounded-full border-[2px] border-white/40 flex items-center justify-center">
          <Camera size={32} color="white" strokeWidth={1.5} />
        </div>
      </button>

      {/* Flash Button */}
      <button
        onClick={onFlashToggle}
        disabled={!isFlashSupported}
        className={`w-[58px] h-[58px] rounded-full bg-white flex items-center justify-center shadow-sm active:scale-95 transition-transform ${!isFlashSupported ? 'opacity-50 cursor-not-allowed' : 'text-gray-700'}`}
        aria-label={isFlashOn ? "Turn flash off" : "Turn flash on"}
      >
        {isFlashOn ? (
          <Zap size={24} strokeWidth={1.5} className="fill-current text-yellow-500" />
        ) : (
          <ZapOff size={24} strokeWidth={1.5} />
        )}
      </button>
    </div>
  );
}
