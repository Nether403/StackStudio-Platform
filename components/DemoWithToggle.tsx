// Demo Dashboard with Intro Toggle - For demo recording flexibility
import React, { useState } from 'react';
import DemoDashboardDark from './DemoDashboardDark';

interface DemoWithToggleProps {
  skipIntro?: boolean;
}

const DemoWithToggle: React.FC<DemoWithToggleProps> = ({ skipIntro = false }) => {
  const [showIntroToggle, setShowIntroToggle] = useState(!skipIntro);

  // Development toggle controls (hidden in production)
  const DemoControls = () => (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      <button
        onClick={() => setShowIntroToggle(!showIntroToggle)}
        className="px-4 py-2 bg-gray-800/90 text-white text-sm rounded-lg border border-gray-600 hover:bg-gray-700 transition-all"
      >
        {showIntroToggle ? 'Skip Intro' : 'Show Intro'}
      </button>
    </div>
  );

  return (
    <>
      {process.env.NODE_ENV === 'development' && <DemoControls />}
      <DemoDashboardDark />
    </>
  );
};

export default DemoWithToggle;
