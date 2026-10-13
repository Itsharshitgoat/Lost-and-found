import { Compass, Camera, User } from 'lucide-react';

interface BottomNavigationProps {
  activeTab: 'explore' | 'scan' | 'profile';
  onTabChange: (tab: 'explore' | 'scan' | 'profile') => void;
}

export function BottomNavigation({ activeTab, onTabChange }: BottomNavigationProps) {
  return (
    <div className="absolute bottom-6 left-6 right-6 bg-[#F3F4F1] rounded-[24px] h-[72px] flex items-center justify-around px-4 z-50">
      <button
        onClick={() => onTabChange('explore')}
        className={`w-14 h-14 flex items-center justify-center rounded-full transition-colors ${activeTab === 'explore' ? 'bg-brand-primary text-white' : 'text-gray-800'}`}
        aria-label="Explore"
      >
        <Compass size={24} />
      </button>

      <button
        onClick={() => onTabChange('scan')}
        className={`w-14 h-14 flex items-center justify-center rounded-full transition-colors ${activeTab === 'scan' ? 'bg-brand-primary text-white' : 'text-gray-800'}`}
        aria-label="Scan"
      >
        <Camera size={24} className={activeTab === 'scan' ? 'text-white' : 'text-gray-800'} />
      </button>

      <button
        onClick={() => onTabChange('profile')}
        className={`w-14 h-14 flex items-center justify-center rounded-full transition-colors ${activeTab === 'profile' ? 'bg-brand-primary text-white' : 'text-gray-800'}`}
        aria-label="Profile"
      >
        <User size={24} />
      </button>
    </div>
  );
}
