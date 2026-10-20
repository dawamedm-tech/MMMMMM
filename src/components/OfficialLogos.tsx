import React from 'react';

// Official Ministry of Human Resources and Social Development Logo (Vector Replica)
export const MohrsdLogo: React.FC<{ className?: string; customUrl?: string }> = ({
  className = 'h-12 w-auto object-contain',
  customUrl,
}) => {
  if (customUrl) {
    return <img src={customUrl} alt="وزارة الموارد البشرية والتنمية الاجتماعية" className={className} />;
  }

  return (
    <div className={`flex items-center gap-2 select-none ${className}`}>
      {/* Emblem SVG */}
      <svg viewBox="0 0 160 55" className="h-full w-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Palm Tree and Crossing Swords Graphic in Gold and Forest Green */}
        <g transform="translate(118, 5)">
          <path d="M20 2C19 5 17 8 14 10C17 12 19 15 20 18C21 15 23 12 26 10C23 8 21 5 20 2Z" fill="#1b6d38" />
          <path d="M11 9C14 11 16 13 16 16C13 17 10 18 7 17C9 14 10 11 11 9Z" fill="#1b6d38" />
          <path d="M29 9C30 11 31 14 33 17C29 18 26 17 24 16C24 13 26 11 29 9Z" fill="#1b6d38" />
          {/* Trunk */}
          <path d="M18 17H22V30H18V17Z" fill="#a37e2c" />
          {/* Curved Crossing Swords */}
          <path d="M8 33C14 33 22 30 29 25L27 23C21 27 14 30 8 30V33Z" fill="#a37e2c" />
          <path d="M32 33C26 33 18 30 11 25L13 23C19 27 26 30 32 30V33Z" fill="#a37e2c" />
          <circle cx="7" cy="32" r="1.8" fill="#a37e2c" />
          <circle cx="33" cy="32" r="1.8" fill="#a37e2c" />
        </g>
        {/* Ministry Typography */}
        <text x="112" y="19" textAnchor="end" fill="#1b6d38" fontSize="10.5" fontWeight="bold" fontFamily="Arial, 'Noto Naskh Arabic', sans-serif">
          وزارة الموارد البشرية
        </text>
        <text x="112" y="32" textAnchor="end" fill="#a37e2c" fontSize="9.5" fontWeight="bold" fontFamily="Arial, 'Noto Naskh Arabic', sans-serif">
          والتنمية الاجتماعية
        </text>
        <text x="112" y="43" textAnchor="end" fill="#555555" fontSize="6" fontFamily="Arial, sans-serif">
          Ministry of Human Resources
        </text>
      </svg>
    </div>
  );
};

// Official Saudi Vision 2030 Logo (Vector Replica)
export const Vision2030Logo: React.FC<{ className?: string; customUrl?: string }> = ({
  className = 'h-11 w-auto object-contain',
  customUrl,
}) => {
  if (customUrl) {
    return <img src={customUrl} alt="رؤية المملكة 2030" className={className} />;
  }

  return (
    <div className={`flex items-center select-none ${className}`}>
      <svg viewBox="0 0 110 50" className="h-full w-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g transform="translate(5, 5)">
          {/* Palm emblem above 2030 */}
          <path d="M50 3C49 6 47 8 45 9C47 10 49 12 50 14C51 12 53 10 55 9C53 8 51 6 50 3Z" fill="#007a3d" />
          <path d="M49 13H51V20H49V13Z" fill="#b08a3e" />
          <path d="M43 21C47 21 51 19 55 16L54 15C50 17 46 19 43 19V21Z" fill="#b08a3e" />
          <path d="M57 21C53 21 49 19 45 16L46 15C50 17 54 19 57 19V21Z" fill="#b08a3e" />

          {/* Typography VISION 2030 */}
          <text x="50" y="27" textAnchor="middle" fill="#007a3d" fontSize="9" fontWeight="800" letterSpacing="0.8" fontFamily="Arial, sans-serif">
            VISION رؤيـــة
          </text>
          <text x="50" y="38" textAnchor="middle" fill="#2d3748" fontSize="13" fontWeight="900" letterSpacing="1.5" fontFamily="Arial, sans-serif">
            2030
          </text>
          <text x="50" y="44" textAnchor="middle" fill="#718096" fontSize="5" fontWeight="600" fontFamily="'Noto Naskh Arabic', Arial, sans-serif">
            المملكة العربية السعودية
          </text>
        </g>
      </svg>
    </div>
  );
};

// Official Qiwa Platform Logo (Vector Replica)
export const QiwaLogo: React.FC<{ className?: string; customUrl?: string }> = ({
  className = 'h-10 w-auto object-contain',
  customUrl,
}) => {
  if (customUrl) {
    return <img src={customUrl} alt="منصة قوى Qiwa" className={className} />;
  }

  return (
    <div className={`flex items-center select-none ${className}`}>
      <svg viewBox="0 0 100 45" className="h-full w-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g transform="translate(6, 6)">
          {/* Qiwa modern connected dots & lines emblem */}
          <circle cx="14" cy="16" r="10" stroke="#00a859" strokeWidth="2.5" fill="none" />
          <circle cx="14" cy="16" r="4.5" fill="#00a859" />
          <circle cx="27" cy="8" r="2.5" fill="#2db875" />
          <circle cx="27" cy="24" r="2.5" fill="#006633" />
          <path d="M22 12L25 9" stroke="#2db875" strokeWidth="1.5" />
          <path d="M22 20L25 23" stroke="#006633" strokeWidth="1.5" />

          {/* Qiwa Typography */}
          <text x="36" y="19" fill="#1a202c" fontSize="16" fontWeight="900" fontFamily="'Noto Naskh Arabic', Arial, sans-serif">
            قـوى
          </text>
          <text x="37" y="29" fill="#00a859" fontSize="8" fontWeight="800" letterSpacing="1" fontFamily="Arial, sans-serif">
            QIWA
          </text>
        </g>
      </svg>
    </div>
  );
};

// Official Ajeer Logo (Vector Replica)
export const AjeerLogo: React.FC<{ className?: string; customUrl?: string }> = ({
  className = 'h-11 w-auto object-contain',
  customUrl,
}) => {
  if (customUrl) {
    return <img src={customUrl} alt="شعار أجير Ajeer" className={className} />;
  }

  return (
    <div className={`flex items-center select-none ${className}`}>
      <svg viewBox="0 0 110 45" className="h-full w-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Modern geometric green Ajeer brandmark */}
        <g transform="translate(4, 4)">
          {/* Logo Icon */}
          <path d="M8 32V10L19 4L30 10V32L19 38L8 32Z" stroke="#009639" strokeWidth="2.5" fill="none" />
          <path d="M19 4V38" stroke="#009639" strokeWidth="2" strokeDasharray="2 2" />
          <circle cx="19" cy="18" r="4" fill="#009639" />
          {/* Brand Wordmark in Arabic & English */}
          <text x="38" y="24" fill="#009639" fontSize="21" fontWeight="800" fontFamily="Arial, 'Noto Naskh Arabic', sans-serif">
            أجـيـر
          </text>
          <text x="39" y="34" fill="#666666" fontSize="8.5" fontWeight="600" letterSpacing="1" fontFamily="Arial, sans-serif">
            AJEER
          </text>
        </g>
      </svg>
    </div>
  );
};
