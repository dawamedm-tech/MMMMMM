import React from 'react';

// 1. Exact Official Ajeer Logo (مطابق تماماً للصورة المرجعية)
export const AjeerLogo: React.FC<{ className?: string; customUrl?: string }> = ({
  className = 'h-11 w-auto object-contain',
  customUrl,
}) => {
  if (customUrl) {
    return <img src={customUrl} alt="شعار أجير AJEER" className={className} />;
  }

  return (
    <div className={`flex items-center justify-center select-none ${className}`}>
      <svg viewBox="0 0 130 52" className="h-full w-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Arabic wordmark أ جـ يـ ر in dark navy with green accent */}
        <g transform="translate(15, 6)">
          {/* Main letter shapes in navy #13294b */}
          <path
            d="M80 2V25H74V2H80Z"
            fill="#13294b"
          />
          {/* Hamza above Alef */}
          <path
            d="M77 0C78.5 0 79.5 0.8 79.5 2C79.5 2.8 79 3.4 78 3.7L80 5H75L76.5 3.5C75.5 3.2 75 2.5 75 1.8C75 0.8 75.8 0 77 0Z"
            fill="#13294b"
          />

          {/* Letter Jeem & Yaa & Raa */}
          {/* Raa on the left */}
          <path
            d="M3 13H15V19C15 26 11 30 2 31L0 26C6 25 9 22 9 19V17H3V13Z"
            fill="#13294b"
          />
          {/* Yaa connection and baseline */}
          <path
            d="M15 13H42V18H15V13Z"
            fill="#13294b"
          />
          {/* Two dots below Yaa in dark navy */}
          <circle cx="23" cy="23" r="2.2" fill="#13294b" />
          <circle cx="31" cy="23" r="2.2" fill="#13294b" />

          {/* Jeem body with green horizontal bar accent #00a859 */}
          <path
            d="M40 13H68V18H40V13Z"
            fill="#13294b"
          />
          {/* Green accent bar over the word */}
          <path
            d="M37 7H56V11H37V7Z"
            fill="#009639"
          />
          {/* Dot of Jeem below */}
          <circle cx="53" cy="23" r="2.2" fill="#13294b" />

          {/* English Wordmark A J E E R underneath */}
          <text
            x="48"
            y="35"
            textAnchor="middle"
            fill="#009639"
            fontSize="9"
            fontWeight="800"
            letterSpacing="3"
            fontFamily="Arial, -apple-system, sans-serif"
          >
            AJEER
          </text>
        </g>
      </svg>
    </div>
  );
};

// 2. Exact Ministry of Human Resources and Social Development Logo (مطابق للصورة المرجعية - الوردة الرباعية الملونة)
export const MohrsdLogo: React.FC<{ className?: string; customUrl?: string }> = ({
  className = 'h-10 w-auto object-contain',
  customUrl,
}) => {
  if (customUrl) {
    return <img src={customUrl} alt="وزارة الموارد البشرية والتنمية الاجتماعية" className={className} />;
  }

  return (
    <div className={`flex items-center justify-center select-none ${className}`}>
      <svg viewBox="0 0 134 50" className="h-full w-auto max-w-full" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Arabic Typography on the right */}
        <text
          x="88"
          y="22"
          textAnchor="end"
          fill="#165c66"
          fontSize="12.5"
          fontWeight="bold"
          fontFamily="'Cairo', 'Noto Naskh Arabic', Arial, sans-serif"
        >
          الموارد البشرية
        </text>
        <text
          x="88"
          y="36"
          textAnchor="end"
          fill="#165c66"
          fontSize="11"
          fontWeight="bold"
          fontFamily="'Cairo', 'Noto Naskh Arabic', Arial, sans-serif"
        >
          والتنمية الاجتماعية
        </text>

        {/* The 4 Iconic Colorful Petals (orange, gold, green, cyan) */}
        <g transform="translate(108, 25)">
          {/* Top petal: Orange #f26f21 */}
          <path
            d="M0 -22C1.5 -12 7 -4 13 0C7 -2 2 -8 0 -22Z"
            fill="#f26f21"
          />
          <path
            d="M0 -22C-1.5 -12 -7 -4 -13 0C-7 -2 -2 -8 0 -22Z"
            fill="#ff8533"
          />

          {/* Right petal: Golden Yellow #fab915 */}
          <path
            d="M20 0C11 1.5 4 6 0 13C2 7 8 2 20 0Z"
            fill="#fab915"
          />
          <path
            d="M20 0C11 -1.5 4 -6 0 -13C2 -7 8 -2 20 0Z"
            fill="#f5a600"
          />

          {/* Bottom petal: Fresh Green #00a859 */}
          <path
            d="M0 22C-1.5 12 -7 4 -13 0C-7 2 -2 8 0 22Z"
            fill="#00a859"
          />
          <path
            d="M0 22C1.5 12 7 4 13 0C7 2 2 8 0 22Z"
            fill="#1bb366"
          />

          {/* Left / Center petal: Cyan Teal #00a0dd */}
          <path
            d="M-18 -8C-10 -5 -4 -2 0 0C-4 -5 -9 -11 -18 -8Z"
            fill="#009fe3"
          />
          <path
            d="M-18 8C-10 5 -4 2 0 0C-4 5 -9 11 -18 8Z"
            fill="#0083be"
          />
        </g>
      </svg>
    </div>
  );
};

// 3. Exact Takamol Logo (مطابق للصورة المرجعية - تكامل Takamol)
export const TakamolLogo: React.FC<{ className?: string; customUrl?: string }> = ({
  className = 'h-10 w-auto object-contain',
  customUrl,
}) => {
  if (customUrl) {
    return <img src={customUrl} alt="تكامل Takamol" className={className} />;
  }

  return (
    <div className={`flex items-center justify-center select-none ${className}`}>
      <svg viewBox="0 0 100 48" className="h-full w-auto max-w-full" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g transform="translate(10, 4)">
          {/* Wordmark تـكـامـل in modern clean charcoal font */}
          <text
            x="40"
            y="25"
            textAnchor="middle"
            fill="#2c3e50"
            fontSize="18"
            fontWeight="bold"
            letterSpacing="-0.5"
            fontFamily="'Cairo', 'Noto Naskh Arabic', Arial, sans-serif"
          >
            تـكـامـل
          </text>
          {/* Subtext Takamol in crisp sans-serif */}
          <text
            x="40"
            y="37"
            textAnchor="middle"
            fill="#5a6b7c"
            fontSize="8"
            fontWeight="600"
            letterSpacing="0.8"
            fontFamily="Arial, sans-serif"
          >
            Takamol
          </text>
        </g>
      </svg>
    </div>
  );
};

// 4. Exact Saudi Vision 2030 Logo
export const Vision2030Logo: React.FC<{ className?: string; customUrl?: string }> = ({
  className = 'h-10 w-auto object-contain',
  customUrl,
}) => {
  if (customUrl) {
    return <img src={customUrl} alt="رؤية المملكة 2030" className={className} />;
  }

  return (
    <div className={`flex items-center justify-center select-none ${className}`}>
      <svg viewBox="0 0 100 48" className="h-full w-auto max-w-full" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g transform="translate(10, 4)">
          {/* Emblem palm */}
          <path d="M40 2C39 5 37 7 35 8C37 9 39 11 40 13C41 11 43 9 45 8C43 7 41 5 40 2Z" fill="#007a3d" />
          <path d="M39 11H41V16H39V11Z" fill="#a07d32" />
          <path d="M34 17C37 17 40 15 44 13L43 12C39 14 36 15 34 15V17Z" fill="#a07d32" />
          <path d="M46 17C43 17 40 15 36 13L37 12C41 14 44 15 46 15V17Z" fill="#a07d32" />

          {/* Typography */}
          <text x="40" y="24" textAnchor="middle" fill="#007a3d" fontSize="7.5" fontWeight="800" letterSpacing="0.5" fontFamily="Arial, sans-serif">
            VISION رؤيـــة
          </text>
          <text x="40" y="34" textAnchor="middle" fill="#1f2937" fontSize="12" fontWeight="900" letterSpacing="1" fontFamily="Arial, sans-serif">
            2030
          </text>
        </g>
      </svg>
    </div>
  );
};

// 5. Official Qiwa Platform Logo
export const QiwaLogo: React.FC<{ className?: string; customUrl?: string }> = ({
  className = 'h-9 w-auto object-contain',
  customUrl,
}) => {
  if (customUrl) {
    return <img src={customUrl} alt="منصة قوى Qiwa" className={className} />;
  }

  return (
    <div className={`flex items-center justify-center select-none ${className}`}>
      <svg viewBox="0 0 90 45" className="h-full w-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g transform="translate(6, 6)">
          <circle cx="12" cy="16" r="9" stroke="#00a859" strokeWidth="2.2" fill="none" />
          <circle cx="12" cy="16" r="4" fill="#00a859" />
          <circle cx="24" cy="9" r="2.2" fill="#2db875" />
          <circle cx="24" cy="23" r="2.2" fill="#006633" />
          <text x="32" y="19" fill="#1a202c" fontSize="15" fontWeight="900" fontFamily="'Cairo', 'Noto Naskh Arabic', Arial, sans-serif">
            قـوى
          </text>
          <text x="33" y="28" fill="#00a859" fontSize="7.5" fontWeight="800" letterSpacing="1" fontFamily="Arial, sans-serif">
            QIWA
          </text>
        </g>
      </svg>
    </div>
  );
};
