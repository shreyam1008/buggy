import React, { useEffect } from 'react';
import { Sidebar, MenuButton } from './Sidebar';
import { InstallBanner } from './InstallBanner';
import { FloatingBackground } from './Icons';
import { updateDailyGreeting } from '../store/appStore';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  useEffect(() => {
    // Update daily greeting on mount
    updateDailyGreeting();
  }, []);

  return (
    <div className="app-layout">
      <FloatingBackground />
      <InstallBanner />
      <Sidebar />
      
      <div className="main-content">
        <header className="app-header">
          <MenuButton />
          <div className="app-header-title">
            <h1>Radha Krishna Utilities</h1>
          </div>
        </header>
        
        <main className="app-main">
          {children}
        </main>
      </div>
    </div>
  );
};
