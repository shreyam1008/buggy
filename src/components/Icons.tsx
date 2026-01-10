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
        opacity: 0.05
    }}>
        <RadhaKrishnaIcon size={400} className="floating-icon" style={{position: 'absolute', top: '10%', right: '-10%', transform: 'rotate(15deg)'}} />
        <RadhaKrishnaIcon size={300} className="floating-icon" style={{position: 'absolute', bottom: '-10%', left: '-10%', transform: 'rotate(-45deg)'}} />
    </div>
);
