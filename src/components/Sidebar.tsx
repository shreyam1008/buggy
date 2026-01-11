import { Link, useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  Image,
  FileText,
  StickyNote,
  Lock,
  Box,
  Zap,
  Flower2,
  Menu,
  X,
} from 'lucide-react';
import { useAppStore } from '../store/appStore';

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { path: '/', label: 'Date Converter', icon: <Home size={20} /> },
  { path: '/image-compressor', label: 'Image Tools', icon: <Image size={20} /> },
  { path: '/pdf-merger', label: 'PDF Merger', icon: <FileText size={20} /> },
  { path: '/notes', label: 'Notes', icon: <StickyNote size={20} /> },
  { path: '/bcrypt', label: 'Bcrypt', icon: <Lock size={20} /> },
  { path: '/3d-showcase', label: '3D Showcase', icon: <Box size={20} /> },
  { path: '/wasm-benchmark', label: 'WASM Benchmark', icon: <Zap size={20} /> },
  { path: '/radha-krishna', label: 'Radha Krishna', icon: <Flower2 size={20} /> },
];

const sidebarVariants = {
  open: {
    x: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 300,
      damping: 30,
    },
  },
  closed: {
    x: '-100%',
    transition: {
      type: 'spring' as const,
      stiffness: 300,
      damping: 30,
    },
  },
};

const overlayVariants = {
  open: { opacity: 1, pointerEvents: 'auto' as const },
  closed: { opacity: 0, pointerEvents: 'none' as const },
};

export const Sidebar: React.FC = () => {
  const [location] = useLocation();
  const { sidebarOpen, setSidebarOpen, currentGreeting } = useAppStore();

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            className="sidebar-overlay"
            variants={overlayVariants}
            initial="closed"
            animate="open"
            exit="closed"
            onClick={closeSidebar}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        className="sidebar"
        variants={sidebarVariants}
        initial={false}
        animate={sidebarOpen ? 'open' : 'closed'}
      >
        {/* Header */}
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <Flower2 size={32} color="var(--primary-color)" />
            <div>
              <h2 className="sidebar-title">RK Utilities</h2>
              <p className="sidebar-greeting">{currentGreeting}</p>
            </div>
          </div>
          <button className="sidebar-close" onClick={closeSidebar} aria-label="Close sidebar">
            <X size={24} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const isActive = location === item.path;
            return (
              <Link key={item.path} href={item.path} onClick={closeSidebar}>
                <motion.div
                  className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                >
                  <span className="sidebar-nav-icon">{item.icon}</span>
                  <span className="sidebar-nav-label">{item.label}</span>
                  {isActive && (
                    <motion.div
                      className="sidebar-nav-indicator"
                      layoutId="activeIndicator"
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                </motion.div>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <p className="sidebar-footer-text">
            Made with 💜 for<br />
            Radha Krishna
          </p>
        </div>
      </motion.aside>
    </>
  );
};

// Mobile Menu Button
export const MenuButton: React.FC = () => {
  const { toggleSidebar } = useAppStore();

  return (
    <motion.button
      className="menu-button"
      onClick={toggleSidebar}
      whileTap={{ scale: 0.9 }}
      aria-label="Toggle menu"
    >
      <Menu size={24} />
    </motion.button>
  );
};
