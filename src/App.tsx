import { useState } from 'react';
import { BottomNavigation } from './components/BottomNavigation';
import { ExploreScreen } from './screens/ExploreScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { ScanScreen } from './screens/ScanScreen';

function App() {
  const [activeTab, setActiveTab] = useState<'explore' | 'scan' | 'profile'>('scan');

  return (
    <div className="w-full max-w-[400px] h-[800px] max-h-screen bg-brand-bg relative overflow-hidden flex flex-col md:rounded-[40px] md:shadow-2xl">
      {/* Dynamic Screen Content */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        {activeTab === 'explore' && <ExploreScreen />}
        {activeTab === 'scan' && <ScanScreen />}
        {activeTab === 'profile' && <ProfileScreen />}
      </div>

      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}

export default App;
