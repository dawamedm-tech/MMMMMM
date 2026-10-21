import React from 'react';
import { WorkPermit, Worker, Establishment } from '../types';
import { getDaysRemaining } from '../utils/helpers';
import { AjeerLogo, MohrsdLogo, Vision2030Logo, QiwaLogo } from './OfficialLogos';
import { Globe, AlertCircle } from 'lucide-react';

interface AjeerMobileVerifyViewProps {
  permit?: WorkPermit | null;
  worker?: Worker | null;
  issuingEst?: Establishment | null;
  hostEst?: Establishment | null;
  pageHeaderTitle?: string;
  pageHeaderSubtitle?: string;
  maskIdEnabled?: boolean;
  footerLogos?: [string, string, string] | string[];
  customAjeerLogoUrl?: string;
  isInvalidOrDisabled?: boolean;
  errorMessage?: string;
}

export const AjeerMobileVerifyView: React.FC<AjeerMobileVerifyViewProps> = ({
  permit,
  worker,
  issuingEst,
  hostEst,
  pageHeaderTitle = 'التصريح أُجْرِ لحلول الموارد البشرية',
  pageHeaderSubtitle = 'تم تحميل البيانات بنجاح',
  maskIdEnabled = false,
  footerLogos,
  customAjeerLogoUrl,
  isInvalidOrDisabled = false,
  errorMessage,
}) => {
  // Safe extract of the 3 footer logos
  const logosList = Array.isArray(footerLogos) ? footerLogos : [];

  // Footer 3 logos component
  const renderThreeFooterLogos = () => (
    <div className="pt-3.5 border-t border-slate-100 flex items-center justify-around gap-1 sm:gap-3 select-none">
      {/* Logo 1: Ministry of Human Resources (or custom uploaded logo 1) */}
      <div className="flex items-center justify-center h-[54px] max-w-[134px] min-w-0">
        {logosList[0] && typeof logosList[0] === 'string' && logosList[0].trim() ? (
          <img
            src={logosList[0]}
            alt="وزارة الموارد البشرية والتنمية الاجتماعية"
            className="max-h-[54px] w-auto max-w-full object-contain"
          />
        ) : (
          <MohrsdLogo className="h-[49px] w-auto object-contain" />
        )}
      </div>

      {/* Logo 2: Saudi Vision 2030 (or custom uploaded logo 2) */}
      <div className="flex items-center justify-center h-[54px] max-w-[122px] min-w-0">
        {logosList[1] && typeof logosList[1] === 'string' && logosList[1].trim() ? (
          <img
            src={logosList[1]}
            alt="رؤية المملكة 2030"
            className="max-h-[54px] w-auto max-w-full object-contain"
          />
        ) : (
          <Vision2030Logo className="h-[44px] w-auto object-contain" />
        )}
      </div>

      {/* Logo 3: Qiwa Platform (or custom uploaded logo 3) */}
      <div className="flex items-center justify-center h-[54px] max-w-[122px] min-w-0">
        {logosList[2] && typeof logosList[2] === 'string' && logosList[2].trim() ? (
          <img
            src={logosList[2]}
            alt="منصة قوى"
            className="max-h-[54px] w-auto max-w-full object-contain"
          />
        ) : (
          <QiwaLogo className="h-[39px] w-auto object-contain" />
        )}
      </div>
    </div>
  );

  // If invalid token, disabled, or permit missing
  if (isInvalidOrDisabled || !permit || !worker || !issuingEst || !hostEst) {
    return (
      <div className="min-h-screen bg-[#ede8f5] text-slate-800 font-['Cairo',Arial,sans-serif] py-10 px-4 flex flex-col items-center justify-start select-none" dir="rtl">
        <div className="w-full max-w-[440px] space-y-4">
          <div className="bg-white rounded-xl shadow-xs py-3.5 px-4 text-center border border-purple-100/50">
            <h1 className="text-[16px] font-bold text-slate-900 leading-tight">
              {pageHeaderTitle}
            </h1>
            <p className="text-[12.5px] text-rose-600 font-medium mt-0.5">
              فشل التحقق من التصريح
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-xs border border-purple-100/50 p-6 text-center space-y-3">
            <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h2 className="text-[15px] font-bold text-slate-900">
              {errorMessage || 'عذراً، التصريح غير موجود أو أن رابط التحقق غير صالح أو تم إلغاؤه'}
            </h2>
            <p className="text-[12px] text-slate-500 leading-relaxed">
              يرجى التأكد من مسح الرمز الأصلي الصادر من بوابة التصاريح أو التواصل مع المنشأة المصرحة للتحقق من سريان التصريح.
            </p>
          </div>

          {/* Footer */}
          <footer className="bg-white rounded-xl shadow-xs border border-purple-100/50 p-5 text-center text-slate-500 text-[11px] leading-[1.6]">
            <div className="flex justify-center items-center mb-2.5">
              <AjeerLogo className="h-8 w-auto object-contain" customUrl={customAjeerLogoUrl} />
            </div>
            <div className="flex items-center justify-center gap-2.5 text-slate-500 text-[11.5px] font-medium mb-1.5">
              <span className="hover:text-slate-800 transition-colors">سياسات الخصوصية</span>
              <span className="text-slate-300">•</span>
              <span className="hover:text-slate-800 transition-colors">الشروط والأحكام</span>
            </div>
            <div className="text-[11px] text-slate-400 font-sans mb-3">
              © هـ ١٤٤٦ / أُجْرِ لحلول الموارد البشرية
            </div>
            {renderThreeFooterLogos()}
          </footer>
        </div>
      </div>
    );
  }

  const daysLeft = getDaysRemaining(permit.expiryDate);
  const isDraft = permit.status === 'draft';
  const isRevoked = permit.status === 'revoked';
  const isExpired = permit.status === 'expired' || daysLeft <= 0;
  const isActive = permit.status === 'active' && daysLeft > 0 && !permit.verificationDisabled;

  // Format ID according to privacy
  const displayIqama = maskIdEnabled
    ? `${worker.iqamaNumber.slice(0, 3)}****${worker.iqamaNumber.slice(-3)}`
    : worker.iqamaNumber;

  return (
    <div className="min-h-screen bg-[#ede8f5] text-slate-800 font-['Cairo',Arial,sans-serif] py-6 px-4 flex flex-col items-center justify-start select-none" dir="rtl">
      <div className="w-full max-w-[440px] space-y-4">
        {/* Top Header Box */}
        <div className="bg-white rounded-xl shadow-xs py-3.5 px-4 text-center border border-purple-100/50">
          <h1 className="text-[16px] font-bold text-slate-900 leading-tight">
            {pageHeaderTitle}
          </h1>
          <p className="text-[12.5px] text-slate-500 mt-0.5">
            {pageHeaderSubtitle}
          </p>
        </div>

        {/* Card 1: Permit Information (معلومات التصريح) */}
        <div className="bg-white rounded-xl shadow-xs border border-purple-100/50 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100">
            <h2 className="text-[14px] font-bold text-slate-900">
              معلومات التصريح
            </h2>
          </div>

          <div className="divide-y divide-slate-100 text-right">
            {/* 1. اسم الموظف */}
            <div className="px-4 py-2.5">
              <div className="text-[11.5px] text-slate-400 font-medium mb-0.5">
                اسم الموظف
              </div>
              <div className="text-[13.5px] font-bold text-slate-900">
                {worker.fullNameAr}
              </div>
            </div>

            {/* 2. حالة التصريح */}
            <div className="px-4 py-2.5 flex items-center justify-between">
              <div>
                <div className="text-[11.5px] text-slate-400 font-medium mb-0.5">
                  حالة التصريح
                </div>
                <div className="mt-0.5">
                  {isActive ? (
                    <span className="inline-flex items-center px-3 py-0.5 rounded-full text-[11px] font-bold bg-[#d1f4e0] text-[#008744] border border-[#a6e8c1]">
                      ساري
                    </span>
                  ) : isRevoked ? (
                    <span className="inline-flex items-center px-3 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-700 border border-rose-200">
                      ملغى
                    </span>
                  ) : isDraft ? (
                    <span className="inline-flex items-center px-3 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                      مسودة
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-3 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-700 border border-rose-200">
                      منتهي
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* 3. تاريخ بداية التصريح */}
            <div className="px-4 py-2.5">
              <div className="text-[11.5px] text-slate-400 font-medium mb-0.5">
                تاريخ بداية التصريح
              </div>
              <div className="text-[13px] font-semibold text-slate-800 font-mono">
                {permit.issueDate}
              </div>
            </div>

            {/* 4. تاريخ انتهاء التصريح */}
            <div className="px-4 py-2.5">
              <div className="text-[11.5px] text-slate-400 font-medium mb-0.5">
                تاريخ انتهاء التصريح
              </div>
              <div className="text-[13px] font-semibold text-slate-800 font-mono">
                {permit.expiryDate}
              </div>
            </div>

            {/* 5. رقم التصريح */}
            <div className="px-4 py-2.5">
              <div className="text-[11.5px] text-slate-400 font-medium mb-0.5">
                رقم التصريح
              </div>
              <div className="text-[13.5px] font-bold text-slate-900 font-mono">
                {permit.permitNumber}
              </div>
            </div>

            {/* 6. رقم الهوية */}
            <div className="px-4 py-2.5">
              <div className="text-[11.5px] text-slate-400 font-medium mb-0.5">
                رقم الهوية
              </div>
              <div className="text-[13.5px] font-bold text-slate-900 font-mono">
                {displayIqama}
              </div>
            </div>

            {/* 7. المهنة */}
            <div className="px-4 py-2.5">
              <div className="text-[11.5px] text-slate-400 font-medium mb-0.5">
                المهنة
              </div>
              <div className="text-[13px] font-semibold text-slate-900">
                {permit.authorizedProfession || worker.profession}
              </div>
            </div>

            {/* 8. الجنسية */}
            <div className="px-4 py-2.5">
              <div className="text-[11.5px] text-slate-400 font-medium mb-0.5">
                الجنسية
              </div>
              <div className="text-[13px] font-semibold text-slate-900">
                {worker.nationality}
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Beneficiary Establishment (المنشأة المستفيدة) */}
        <div className="bg-white rounded-xl shadow-xs border border-purple-100/50 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100">
            <h2 className="text-[14px] font-bold text-slate-900">
              المنشأة المستفيدة
            </h2>
          </div>

          <div className="divide-y divide-slate-100 text-right">
            <div className="px-4 py-2.5">
              <div className="text-[11.5px] text-slate-400 font-medium mb-0.5">
                اسم المنشأة
              </div>
              <div className="text-[13.5px] font-bold text-slate-900">
                {hostEst.nameAr}
              </div>
            </div>

            <div className="px-4 py-2.5">
              <div className="text-[11.5px] text-slate-400 font-medium mb-0.5">
                رقم المنشأة
              </div>
              <div className="text-[13px] font-bold text-slate-800 font-mono">
                {hostEst.unifiedNumber700}
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Service Provider Establishment (المنشأة المقدمة للخدمة) */}
        <div className="bg-white rounded-xl shadow-xs border border-purple-100/50 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100">
            <h2 className="text-[14px] font-bold text-slate-900">
              المنشأة المقدمة للخدمة
            </h2>
          </div>

          <div className="divide-y divide-slate-100 text-right">
            <div className="px-4 py-2.5">
              <div className="text-[11.5px] text-slate-400 font-medium mb-0.5">
                اسم المنشأة
              </div>
              <div className="text-[13.5px] font-bold text-slate-900">
                {issuingEst.nameAr}
              </div>
            </div>

            <div className="px-4 py-2.5">
              <div className="text-[11.5px] text-slate-400 font-medium mb-0.5">
                رقم المنشأة
              </div>
              <div className="text-[13px] font-bold text-slate-800 font-mono">
                {issuingEst.unifiedNumber700}
              </div>
            </div>
          </div>
        </div>

        {/* Footer (التذييل الأبيض المرجعي مع الثلاثة شعارات) */}
        <footer className="bg-white rounded-xl shadow-xs border border-purple-100/50 p-5 text-center text-slate-500 text-[11px] leading-[1.6]">
          {/* 1. شعار أجير في منتصف الجزء العلوي من التذييل */}
          <div className="flex justify-center items-center mb-2.5">
            <AjeerLogo className="h-8 w-auto object-contain" customUrl={customAjeerLogoUrl} />
          </div>

          {/* 2. روابط «سياسات الخصوصية» و«الشروط والأحكام» تحت الشعار */}
          <div className="flex items-center justify-center gap-2.5 text-slate-500 text-[11.5px] font-medium mb-1.5">
            <span className="hover:text-slate-800 transition-colors cursor-pointer">سياسات الخصوصية</span>
            <span className="text-slate-300">•</span>
            <span className="hover:text-slate-800 transition-colors cursor-pointer">الشروط والأحكام</span>
          </div>

          {/* 3. النص «© هـ ١٤٤٦ / أُجْرِ لحلول الموارد البشرية» */}
          <div className="text-[11px] text-slate-400 font-sans mb-2.5">
            © هـ ١٤٤٦ / أُجْرِ لحلول الموارد البشرية
          </div>

          {/* 4. خيار اللغة «English» وأيقونة الكرة الأرضية */}
          <div className="flex items-center justify-center gap-1.5 text-slate-500 text-[11.5px] mb-3">
            <Globe className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-medium cursor-pointer hover:text-slate-700 transition-colors">English</span>
          </div>

          {/* 5. المساحة السفلية: ثلاثة شعارات دائماً متناسقة ومتجاورة */}
          {renderThreeFooterLogos()}
        </footer>
      </div>
    </div>
  );
};
