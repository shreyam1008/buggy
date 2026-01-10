export const RadhaKrishnaIcon = ({ size = 24, color = "currentColor", className = "", style = {} }: { size?: number, color?: string, className?: string, style?: React.CSSProperties }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 100 100" 
    fill="none" 
    stroke={color} 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
    style={style}
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Flute */}
    <path d="M20 80 L80 20" strokeWidth="4" />
    <circle cx="35" cy="65" r="3" fill="none" />
    <circle cx="45" cy="55" r="3" fill="none" />
    <circle cx="55" cy="45" r="3" fill="none" />
    
    {/* Peacock Feather (Stylized) */}
    <path d="M80 20 Q 95 10 90 30 Q 80 50 60 60" stroke={color} fill="none"/>
    <path d="M80 20 Q 65 10 70 5" stroke={color} fill="none"/>
    
    {/* Feather Eye */}
    <ellipse cx="85" cy="25" rx="5" ry="8" stroke={color} />
    <circle cx="85" cy="28" r="2" fill={color} />
  </svg>
);

export const LotusIcon = ({ size = 24, color = "currentColor", className = "", style = {} }: { size?: number, color?: string, className?: string, style?: React.CSSProperties }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
    <path d="M12 3C12 3 7 8 7 13C7 16 10 17 12 21C14 17 17 16 17 13C17 8 12 3 12 3Z" />
    <path d="M7 13C4 13 2 11 2 9C2 6 5 4 5 4" />
    <path d="M17 13C20 13 22 11 22 9C22 6 19 4 19 4" />
    <path d="M12 21C12 21 8 20 5 18" />
    <path d="M12 21C12 21 16 20 19 18" />
  </svg>
);

export const OmIcon = ({ size = 24, color = "currentColor", className = "", style = {} }: { size?: number, color?: string, className?: string, style?: React.CSSProperties }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
     <path d="M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z" strokeOpacity="0.3" />
     <path d="M10 9C10 9 12 8 12 10C12 12 10 13 10 13C10 13 13 13 13 10" />
     <path d="M10 13C10 13 10 16 13 16" />
     <path d="M14.5 10C14.5 10 16 10 16 13C16 15 14.5 15 14.5 15" />
     <path d="M16 8C16 7 17 7 17 7" />
  </svg>
);

export const TilakIcon = ({ size = 24, color = "currentColor", className = "", style = {} }: { size?: number, color?: string, className?: string, style?: React.CSSProperties }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
        <path d="M12 4V16" />
        <path d="M12 20C12.55 20 13 19.55 13 19C13 18.45 12.55 18 12 18C11.45 18 11 18.45 11 19C11 19.55 11.45 20 12 20Z" fill={color} />
        <path d="M9 8C9 8 9 16 12 18" />
        <path d="M15 8C15 8 15 16 12 18" />
    </svg>
);


export const FloatingBackground = () => (
    <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        zIndex: -1,
        pointerEvents: 'none',
        opacity: 0.04
    }}>
        {/* Main Background Icons */}
        <RadhaKrishnaIcon size={400} className="floating-icon" style={{position: 'absolute', top: '5%', right: '-15%', transform: 'rotate(15deg)'}} />
        <RadhaKrishnaIcon size={300} className="floating-icon" style={{position: 'absolute', bottom: '-10%', left: '-10%', transform: 'rotate(-45deg)'}} />
        
        {/* Scattered Holy Symbols */}
        <LotusIcon size={64} style={{position: 'absolute', top: '15%', left: '10%', opacity: 0.6, transform: 'rotate(-10deg)'}} />
        <OmIcon size={80} style={{position: 'absolute', top: '40%', right: '20%', opacity: 0.4}} />
        <TilakIcon size={56} style={{position: 'absolute', bottom: '20%', right: '10%', opacity: 0.5, transform: 'rotate(5deg)'}} />
        <LotusIcon size={48} style={{position: 'absolute', bottom: '10%', left: '30%', opacity: 0.4, transform: 'rotate(20deg)'}} />
        <OmIcon size={120} style={{position: 'absolute', top: '-5%', left: '40%', opacity: 0.15}} />
    </div>
);
