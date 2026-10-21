import React, { useState } from 'react';
import { SystemSettings } from '../types';
import {
  Settings,
  Sliders,
  FileText,
  Shield,
  Download,
  Upload,
  RefreshCcw,
  CheckCircle2,
  Trash2,
  Plus,
  Save,
  Image as ImageIcon,
  ArrowRight,
  ArrowLeft,
  Eye,
  Info,
} from 'lucide-react';
import { AjeerLogo } from './OfficialLogos';

interface AdminSettingsProps {
  settings: SystemSettings;
  onUpdateSettings: (newSettings: SystemSettings) => void;
  onExportAllData: () => void;
  onImportData: (jsonStr: string) => void;
  onResetToDefaults: () => void;
  customAjeerLogoUrl?: string;
}

export const AdminSettings: React.FC<AdminSettingsProps> = ({
  settings,
  onUpdateSettings,
  onExportAllData,
  onImportData,
  onResetToDefaults,
  customAjeerLogoUrl,
}) => {
  // Ensure footerLogos is an array of 3 strings
  const initialLogos: [string, string, string] = [
    settings.footerLogos?.[0] || settings.footerLogo1 || '',
    settings.footerLogos?.[1] || settings.footerLogo2 || '',
    settings.footerLogos?.[2] || settings.footerLogo3 || '',
  ];

  const [formData, setFormData] = useState<SystemSettings>({
    ...settings,
    footerLogos: initialLogos,
    footerLogo1: initialLogos[0],
    footerLogo2: initialLogos[1],
    footerLogo3: initialLogos[2],
  });

  const [logos, setLogos] = useState<[string, string, string]>(initialLogos);

  // Which logo slots are still empty (shown to the admin; no substitute logo is used)
  const missingSlotNumbers = logos
    .map((logo, idx) => (logo && logo.trim() ? null : idx + 1))
    .filter((idx): idx is number => idx !== null)
    .map((idx) => `#${idx}`);
  const allLogosUploaded = missingSlotNumbers.length === 0;
  const [newTermInput, setNewTermInput] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedSettings: SystemSettings = {
      ...formData,
      footerLogos: logos,
      footerLogo1: logos[0],
      footerLogo2: logos[1],
      footerLogo3: logos[2],
    };
    onUpdateSettings(updatedSettings);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleLogoUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('يرجى اختيار ملف صورة صالح (PNG, JPEG, SVG, WebP)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      const nextLogos: [string, string, string] = [...logos];
      nextLogos[index] = dataUrl;
      setLogos(nextLogos);
      setFormData((prev) => ({
        ...prev,
        footerLogos: nextLogos,
        footerLogo1: nextLogos[0],
        footerLogo2: nextLogos[1],
        footerLogo3: nextLogos[2],
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = (index: number) => {
    const nextLogos: [string, string, string] = [...logos];
    nextLogos[index] = '';
    setLogos(nextLogos);
    setFormData((prev) => ({
      ...prev,
      footerLogos: nextLogos,
      footerLogo1: nextLogos[0],
      footerLogo2: nextLogos[1],
      footerLogo3: nextLogos[2],
    }));
  };

  const handleSwapLogos = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex > 2) return;
    const nextLogos: [string, string, string] = [...logos];
    const temp = nextLogos[fromIndex];
    nextLogos[fromIndex] = nextLogos[toIndex];
    nextLogos[toIndex] = temp;
    setLogos(nextLogos);
    setFormData((prev) => ({
      ...prev,
      footerLogos: nextLogos,
      footerLogo1: nextLogos[0],
      footerLogo2: nextLogos[1],
      footerLogo3: nextLogos[2],
    }));
  };

  const handleAddTerm = () => {
    if (!newTermInput.trim()) return;
    setFormData({
      ...formData,
      defaultTerms: [...formData.defaultTerms, newTermInput.trim()],
    });
    setNewTermInput('');
  };

  const handleRemoveTerm = (index: number) => {
    setFormData({
      ...formData,
      defaultTerms: formData.defaultTerms.filter((_, i) => i !== index),
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        onImportData(text);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } catch (err: any) {
        setImportError('فشل استيراد الملف: تنسيق JSON غير صالح');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">لوحة الإدارة، تخصيص القوالب والشعارات الرسمية</h2>
          <p className="text-xs text-slate-500">
            إدارة الشعارات الثلاثة السفلية لصفحة التحقق، نصوص التصاريح، الهوية البصرية، وضوابط حماية البيانات
          </p>
        </div>

        {saveSuccess && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 text-emerald-800 rounded-lg text-xs font-bold border border-emerald-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>تم حفظ التعديلات والشعارات بنجاح</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section: Dedicated 3 Footer Logos Management */}
        <div className="bg-white rounded-xl border-2 border-emerald-600/30 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-emerald-600" />
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  إدارة الشعارات الثلاثة السفلية لصفحة التحقق (QR Footer Logos)
                </h3>
                <p className="text-[11.5px] text-slate-500">
                  تظهر هذه الشعارات الثلاثة حصراً في المساحة السفلية لتذييل صفحة التحقق بعد مسح QR، مع الحفاظ على نسب أبعادها الأصلية.
                </p>
              </div>
            </div>
            <span className="text-[11px] font-bold px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
              3 مواضع مخصصة
            </span>
          </div>

          <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 flex items-start gap-2 text-xs text-amber-800">
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="font-semibold">تنبيهات مهمة بشأن الشعارات:</p>
              <ul className="list-disc list-inside text-[11px] space-y-0.5 text-amber-700">
                <li>الموضع الذي لا يُرفع له شعار يبقى فارغاً تماماً في صفحة التحقق دون أي صور عشوائية أو نصوص بديلة.</li>
                <li>يتم عرض الصور بنسب أبعادها الأصلية مع خاصية الاحتواء (object-fit: contain) وبأعلى جودة.</li>
                <li>يمكنك رفع أو استبدال أو حذف أي شعار والتحكم في ترتيب المواضع (يمين / وسط / يسار).</li>
              </ul>
              <p
                className={`text-[11px] font-bold pt-1 ${
                  allLogosUploaded ? 'text-emerald-700' : 'text-rose-700'
                }`}
              >
                {allLogosUploaded
                  ? '✓ الشعارات الثلاثة مرفوعة وستظهر في صفحة التصريح بالترتيب المحفوظ.'
                  : `تنبيه النقص: الموضع(ات) غير المرفوعة ${missingSlotNumbers.join('، ')} — لن يعرض أي شعار بديل فيها في صفحة التصريح، وتبقى مساحتها محجوزة بترتيبها.`}
              </p>
            </div>
          </div>

          {/* 3 Logo Slots */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[0, 1, 2].map((idx) => {
              const currentUrl = logos[idx];
              const slotLabels = ['الشعار الأول (الأيمن)', 'الشعار الثاني (الأوسط)', 'الشعار الثالث (الأيسر)'];

              return (
                <div
                  key={idx}
                  className="bg-slate-50 rounded-xl border border-slate-200 p-4 flex flex-col justify-between space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">{slotLabels[idx]}</span>
                    <span className="text-[10px] text-slate-400 font-mono">موضع #{idx + 1}</span>
                  </div>

                  {/* Logo Preview Container */}
                  <div className="h-28 bg-white rounded-lg border-2 border-dashed border-slate-200 flex items-center justify-center p-2 overflow-hidden relative group">
                    {currentUrl ? (
                      <img
                        src={currentUrl}
                        alt={`شعار ${idx + 1}`}
                        className="max-h-full max-w-full object-contain"
                      />
                    ) : (
                      <div className="text-center p-3 text-slate-400">
                        <ImageIcon className="w-7 h-7 mx-auto mb-1 text-slate-300" />
                        <span className="text-[10.5px] block">الموضع فارغ</span>
                        <span className="text-[9.5px] text-slate-400 block mt-0.5">(لن يظهر شيء بالتحقق)</span>
                      </div>
                    )}
                  </div>

                  {/* Slot Actions */}
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center gap-1.5">
                      <label className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold cursor-pointer transition-colors shadow-xs">
                        <Upload className="w-3.5 h-3.5" />
                        <span>{currentUrl ? 'استبدال الشعار' : 'رفع الشعار'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleLogoUpload(idx, e)}
                          className="hidden"
                        />
                      </label>

                      {currentUrl && (
                        <button
                          type="button"
                          onClick={() => handleRemoveLogo(idx)}
                          title="حذف الشعار من هذا الموضع"
                          className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Reorder Buttons */}
                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => handleSwapLogos(idx, idx - 1)}
                        className={`flex items-center gap-1 px-2 py-1 rounded border ${
                          idx === 0
                            ? 'opacity-40 cursor-not-allowed bg-slate-100 border-slate-200 text-slate-400'
                            : 'bg-white border-slate-200 hover:bg-slate-100 text-slate-700 cursor-pointer'
                        }`}
                      >
                        <ArrowRight className="w-3 h-3" />
                        <span>تحريك يمين</span>
                      </button>

                      <button
                        type="button"
                        disabled={idx === 2}
                        onClick={() => handleSwapLogos(idx, idx + 1)}
                        className={`flex items-center gap-1 px-2 py-1 rounded border ${
                          idx === 2
                            ? 'opacity-40 cursor-not-allowed bg-slate-100 border-slate-200 text-slate-400'
                            : 'bg-white border-slate-200 hover:bg-slate-100 text-slate-700 cursor-pointer'
                        }`}
                      >
                        <span>تحريك يسار</span>
                        <ArrowLeft className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Live Preview of QR Footer */}
          <div className="mt-4 pt-4 border-t border-slate-200">
            <div className="flex items-center gap-1.5 mb-2 text-xs font-bold text-slate-700">
              <Eye className="w-3.5 h-3.5 text-emerald-600" />
              <span>معاينة حية لتذييل صفحة التحقق (كما يراها الزائر بعد مسح الرمز):</span>
            </div>

            <div className="bg-[#ede8f5] p-4 rounded-xl flex justify-center">
              <div className="w-full max-w-[380px] bg-white rounded-xl shadow-xs border border-purple-100/50 p-4 text-center">
                <div className="flex justify-center items-center mb-2">
                  <AjeerLogo className="h-7 w-auto object-contain" customUrl={customAjeerLogoUrl} />
                </div>
                <div className="flex items-center justify-center gap-2 text-slate-500 text-[11px] font-medium mb-1">
                  <span>سياسات الخصوصية</span>
                  <span className="text-slate-300">•</span>
                  <span>الشروط والأحكام</span>
                </div>
                <div className="text-[10px] text-slate-400 mb-2">
                  © هـ ١٤٤٦ / أُجْرِ لحلول الموارد البشرية
                </div>

                <div className="pt-2.5 border-t border-slate-100 flex items-center justify-center gap-1 sm:gap-3">
                  <div className="h-8 w-20 flex items-center justify-center">
                    {logos[0] ? (
                      <img src={logos[0]} alt="شعار 1" className="max-h-8 max-w-full object-contain" />
                    ) : (
                      <span className="text-[9px] font-bold text-rose-500">فارغ — لن يظهر</span>
                    )}
                  </div>
                  <div className="h-8 w-20 flex items-center justify-center">
                    {logos[1] ? (
                      <img src={logos[1]} alt="شعار 2" className="max-h-8 max-w-full object-contain" />
                    ) : (
                      <span className="text-[9px] font-bold text-rose-500">فارغ — لن يظهر</span>
                    )}
                  </div>
                  <div className="h-8 w-20 flex items-center justify-center">
                    {logos[2] ? (
                      <img src={logos[2]} alt="شعار 3" className="max-h-8 max-w-full object-contain" />
                    ) : (
                      <span className="text-[9px] font-bold text-rose-500">فارغ — لن يظهر</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 1: Official Header & Platform Text */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-2">
            <Sliders className="w-4 h-4 text-emerald-600" />
            <span>النصوص الرسمية وهوية المستندات الحكومية</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">اسم المنصة الرسمي:</label>
              <input
                type="text"
                value={formData.platformName}
                onChange={(e) => setFormData({ ...formData, platformName: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-lg focus:border-emerald-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">اسم الوزارة المصرحة:</label>
              <input
                type="text"
                value={formData.ministryName}
                onChange={(e) => setFormData({ ...formData, ministryName: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-lg focus:border-emerald-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">شارة رأس التصريح (Header Badge):</label>
              <input
                type="text"
                value={formData.headerBadgeText}
                onChange={(e) => setFormData({ ...formData, headerBadgeText: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-lg focus:border-emerald-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">شعار وهوية رؤية 2030:</label>
              <input
                type="text"
                value={formData.vision2030Text}
                onChange={(e) => setFormData({ ...formData, vision2030Text: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-lg focus:border-emerald-600 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1 text-xs">تذييل التحذير والمخالفات في أسفل المستند:</label>
            <textarea
              rows={2}
              value={formData.footerNoticeText}
              onChange={(e) => setFormData({ ...formData, footerNoticeText: e.target.value })}
              className="w-full p-2 border border-slate-300 rounded-lg text-xs focus:border-emerald-600 focus:outline-none"
            />
          </div>
        </div>

        {/* Section 2: Visual Watermark & Colors */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-2">
            <FileText className="w-4 h-4 text-emerald-600" />
            <span>العلامة المائية وضبط خلفية الطباعة الرسمية</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
              <input
                type="checkbox"
                id="showWatermark"
                checked={formData.showWatermark}
                onChange={(e) => setFormData({ ...formData, showWatermark: e.target.checked })}
                className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
              />
              <label htmlFor="showWatermark" className="font-semibold text-slate-800 cursor-pointer">
                تفعيل العلامة المائية في خلفية التصريح المطبوع لمنع التزوير
              </label>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">نص العلامة المائية:</label>
              <input
                type="text"
                value={formData.watermarkText}
                onChange={(e) => setFormData({ ...formData, watermarkText: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-lg focus:border-emerald-600 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Default Terms & Conditions */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-2">
            <FileText className="w-4 h-4 text-emerald-600" />
            <span>الشروط والأحكام الافتراضية للتصاريح</span>
          </h3>

          <div className="space-y-2">
            {formData.defaultTerms.map((term, index) => (
              <div key={index} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                <span className="text-slate-800">{term}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveTerm(index)}
                  className="p-1 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="text"
              placeholder="إضافة بند أو شرط جديد..."
              value={newTermInput}
              onChange={(e) => setNewTermInput(e.target.value)}
              className="flex-1 p-2 border border-slate-300 rounded-lg text-xs focus:border-emerald-600 focus:outline-none"
            />
            <button
              type="button"
              onClick={handleAddTerm}
              className="flex items-center gap-1 px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة شرط</span>
            </button>
          </div>
        </div>

        {/* Section 4: Privacy & Data Masking */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-2">
            <Shield className="w-4 h-4 text-emerald-600" />
            <span>سياسات حماية البيانات الحساسة (Data Masking)</span>
          </h3>
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
            <input
              type="checkbox"
              id="maskSensitiveData"
              checked={formData.maskSensitiveData}
              onChange={(e) => setFormData({ ...formData, maskSensitiveData: e.target.checked })}
              className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
            />
            <div>
              <label htmlFor="maskSensitiveData" className="font-semibold text-slate-800 cursor-pointer block">
                تفعيل الإخفاء التلقائي لأرقام الإقامات والجوازات وأرقام الهواتف
              </label>
              <p className="text-[11px] text-slate-500">
                عند التفعيل، يتم عرض أرقام الهويات بالصيغة المقنعة (مثال: 248****374) لحماية خصوصية العمال والمفتشين غير المصرح لهم.
              </p>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center justify-end gap-3">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg shadow-sm transition-colors text-xs"
          >
            <Save className="w-4 h-4" />
            <span>حفظ جميع إعدادات المنصة والشعارات</span>
          </button>
        </div>
      </form>

      {/* Section 5: Data Backup, Restore & Reset */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
        <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-2">
          <Download className="w-4 h-4 text-slate-600" />
          <span>النسخ الاحتياطي واستعادة قاعدة البيانات</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          {/* Export */}
          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 flex flex-col justify-between">
            <div>
              <h4 className="font-bold text-slate-800">تصدير نسخة احتياطية كاملة</h4>
              <p className="text-[11px] text-slate-500 mt-1">
                تنزيل جميع العمال، التصاريح، المنشآت والشعارات كملف JSON.
              </p>
            </div>
            <button
              onClick={onExportAllData}
              className="mt-3 flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-semibold transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>تنزيل النسخة الاحتياطية (JSON)</span>
            </button>
          </div>

          {/* Import */}
          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 flex flex-col justify-between">
            <div>
              <h4 className="font-bold text-slate-800">استعادة بيانات من ملف</h4>
              <p className="text-[11px] text-slate-500 mt-1">
                استرجاع بيانات سابقة من ملف JSON تم تصديره من المنصة.
              </p>
            </div>
            <label className="mt-3 flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-lg font-semibold cursor-pointer transition-colors">
              <Upload className="w-3.5 h-3.5" />
              <span>رفع واستعادة ملف (JSON)</span>
              <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>

          {/* Reset */}
          <div className="p-3.5 bg-rose-50/50 rounded-lg border border-rose-200 flex flex-col justify-between">
            <div>
              <h4 className="font-bold text-rose-900">إعادة تعيين البيانات للوضع الافتراضي</h4>
              <p className="text-[11px] text-rose-700 mt-1">
                استرجاع البيانات النموذجية الأولية ومسح أي سجلات تجريبية غير متوافقة.
              </p>
            </div>
            <button
              onClick={() => {
                if (window.confirm('هل أنت متأكد من إعادة تعيين قاعدة البيانات للحالة النموذجية الأولية؟')) {
                  onResetToDefaults();
                }
              }}
              className="mt-3 flex items-center justify-center gap-1.5 px-3 py-2 bg-rose-700 hover:bg-rose-800 text-white rounded-lg font-semibold transition-colors"
            >
              <RefreshCcw className="w-3.5 h-3.5" />
              <span>إعادة تعيين البيانات</span>
            </button>
          </div>
        </div>

        {importError && (
          <div className="p-2.5 bg-rose-100 text-rose-800 text-xs rounded-lg font-semibold">
            {importError}
          </div>
        )}
      </div>
    </div>
  );
};
