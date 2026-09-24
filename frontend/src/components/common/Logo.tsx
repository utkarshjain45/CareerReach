import React from 'react';
import { Link } from 'react-router-dom';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  subtitle?: string;
  className?: string;
  textClassName?: string;
  asLink?: boolean;
  to?: string;
}

export const LogoIcon: React.FC<{ size?: 'sm' | 'md' | 'lg' | 'xl'; className?: string }> = ({
  size = 'md',
  className = '',
}) => {
  const sizeMap = {
    sm: 'w-7 h-7',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
    xl: 'w-12 h-12',
  };

  const dim = sizeMap[size];

  return (
    <div
      className={`relative ${dim} rounded-xl shrink-0 overflow-hidden shadow-card flex items-center justify-center group-hover:scale-105 transition-transform duration-200 ${className}`}
      style={{
        background: 'linear-gradient(135deg, #2563EB 0%, #4F46E5 50%, #F43F5E 100%)',
      }}
    >
      {/* Glossy top-left highlight */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent pointer-events-none rounded-xl" />

      {/* CareerReach Custom Vector Mark */}
      <svg
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-[72%] h-[72%] relative z-10"
      >
        {/* Dynamic soaring outreach wing (Facet 1) */}
        <path
          d="M6 18.5L28 8L18.5 28L15 20.5L6 18.5Z"
          fill="#FFFFFF"
          fillRule="evenodd"
          clipRule="evenodd"
        />
        {/* Shadow / depth facet (Facet 2) */}
        <path
          d="M15 20.5L28 8L19.5 22L15 20.5Z"
          fill="#CBD5E1"
          fillOpacity="0.8"
        />
        {/* Opportunity Sparkle at apex */}
        <path
          d="M27.5 5.5C27.5 7.433 25.933 9 24 9C25.933 9 27.5 10.567 27.5 12.5C27.5 10.567 29.067 9 31 9C29.067 9 27.5 7.433 27.5 5.5Z"
          fill="#FDE047"
        />
      </svg>
    </div>
  );
};

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showText = true,
  subtitle,
  className = '',
  textClassName = '',
  asLink = true,
  to = '/',
}) => {
  const content = (
    <div className={`inline-flex items-center gap-2.5 group select-none ${className}`}>
      <LogoIcon size={size} />

      {showText && (
        <div className="flex flex-col leading-none">
          <span
            className={`font-extrabold tracking-tight text-slate-900 ${
              size === 'sm'
                ? 'text-sm'
                : size === 'md'
                ? 'text-base'
                : size === 'lg'
                ? 'text-lg'
                : 'text-xl'
            } ${textClassName}`}
          >
            Career
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 via-indigo-600 to-coral-500">
              Reach
            </span>
          </span>
          {subtitle && (
            <span className="text-[10px] sm:text-[11px] font-medium text-slate-400 tracking-wide mt-0.5">
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (asLink) {
    return (
      <Link to={to} className="inline-flex focus:outline-none">
        {content}
      </Link>
    );
  }

  return content;
};
