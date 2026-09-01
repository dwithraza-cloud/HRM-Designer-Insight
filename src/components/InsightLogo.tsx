import React from 'react';

interface InsightLogoProps {
  className?: string;
  size?: number | string;
  variant?: 'square' | 'rounded' | 'icon-only';
  rounded?: string;
}

export const InsightLogo: React.FC<InsightLogoProps> = ({
  className = 'w-10 h-10',
  variant = 'rounded',
  rounded = 'rounded-xl'
}) => {
  const isIconOnly = variant === 'icon-only';

  return (
    <div 
      className={`inline-flex items-center justify-center shrink-0 overflow-hidden ${
        isIconOnly ? '' : `bg-[#FF4E00] ${rounded} shadow-lg shadow-orange-600/30 ring-1 ring-white/20`
      } ${className}`}
    >
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {!isIconOnly && (
          <rect width="100" height="100" fill="#FF4E00" />
        )}
        <g fill="#FFFFFF">
          {/* Outer Right Arc */}
          <path d="M 50,14 A 36 36 0 0 1 50,86 L 50,78 A 28 28 0 0 0 50,22 Z" />
          {/* Middle Left Arc */}
          <path d="M 50,22 A 28 28 0 0 0 50,78 L 50,70 A 20 20 0 0 1 50,30 Z" />
          {/* Inner Right Arc */}
          <path d="M 50,30 A 20 20 0 0 1 50,70 L 50,62 A 12 12 0 0 0 50,38 Z" />
          {/* Center Left Solid Disk */}
          <path d="M 50,38 A 12 12 0 0 0 50,62 Z" />
        </g>
      </svg>
    </div>
  );
};
