import React, { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../store/appStore';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const InstallBanner: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const { installBannerDismissed, dismissInstallBanner } = useAppStore();

  useEffect(() => {
    // Detect iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);

    // Check if already installed
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;

    // PWA Install Prompt Handler
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);

      // Show banner if not dismissed and not installed
      if (!installBannerDismissed && !isStandalone) {
        setShowBanner(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Show iOS install instructions if on iOS and not installed
    if (isIOSDevice && !isStandalone && !installBannerDismissed) {
      setShowBanner(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [installBannerDismissed]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setShowBanner(false);
    }

    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    dismissInstallBanner();
  };

  if (!showBanner) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="install-banner"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -100, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <div className="install-banner-content">
          <Download size={20} color="var(--primary-color)" />
          <div className="install-banner-text">
            {isIOS ? (
              <>
                <strong>Install App</strong>
                <span>
                  Tap <span style={{ fontSize: '1.2em' }}>⎙</span> then "Add to Home Screen"
                </span>
              </>
            ) : (
              <>
                <strong>Install for offline use</strong>
                <span>Get instant access from your home screen</span>
              </>
            )}
          </div>
          <div className="install-banner-actions">
            {!isIOS && deferredPrompt && (
              <button onClick={handleInstallClick} className="install-btn">
                Install
              </button>
            )}
            <button onClick={handleDismiss} className="dismiss-btn" aria-label="Dismiss">
              <X size={18} />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
