import React, { useState } from 'react';
import { Lock, User, ShieldCheck, KeyRound, AlertCircle, CheckCircle2 } from 'lucide-react';
import { AjeerLogo, MohrsdLogo } from './OfficialLogos';

interface AdminLoginProps {
  hasInitializedAdmin: boolean;
  onLogin: (username: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  onSetupFirstAdmin: (username: string, pass: string, fullName: string) => Promise<{ success: boolean; error?: string }>;
  onSuccess: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({
  hasInitializedAdmin,
  onLogin,
  onSetupFirstAdmin,
  onSuccess,
}) => {
  const [isSetupMode, setIsSetupMode] = useState(!hasInitializedAdmin);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (isSetupMode) {
      if (!username.trim() || !password || !fullName.trim()) {
        setError('يرجى ملء جميع الحقول المطلوبة');
        return;
      }
      if (password.length < 6) {
        setError('كلمة المرور يجب أن لا تقل عن 6 خانات');
        return;
      }
      if (password !== confirmPassword) {
        setError('كلمة المرور وتأكيدها غير متطابقين');
        return;
      }

      setLoading(true);
      try {
        const res = await onSetupFirstAdmin(username.trim(), password, fullName.trim());
        if (res.success) {
          setSuccessMsg('تم تهيئة حساب المسؤول بنجاح! جاري الدخول للوحة الإدارة...');
          setTimeout(() => {
            onSuccess();
          }, 800);
        } else {
          setError(res.error || 'فشل إعداد الحساب');
        }
      } catch (err: any) {
        setError(err.message || 'حدث خطأ أثناء إعداد الحساب');
      } finally {
        setLoading(false);
      }
    } else {
      if (!username.trim() || !password) {
        setError('يرجى إدخال اسم المستخدم وكلمة المرور');
        return;
      }

      setLoading(true);
      try {
        const res = await onLogin(username.trim(), password);
        if (res.success) {
          setSuccessMsg('تم تسجيل الدخول بنجاح! جاري التوجيه...');
          setTimeout(() => {
            onSuccess();
          }, 600);
        } else {
          setError(res.error || 'اسم المستخدم أو كلمة المرور غير صحيحة');
        }
      } catch (err: any) {
        setError(err.message || 'فشل الاتصال بخدمة التحقق');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4" dir="rtl">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
        {/* Header with official branding */}
        <div className="bg-slate-50 border-b border-slate-100 p-6 text-center">
          <div className="flex items-center justify-center gap-4 mb-3">
            <AjeerLogo className="h-9 w-auto object-contain" />
          </div>
          <h1 className="text-base font-bold text-slate-900">
            {isSetupMode ? 'تهيئة حساب المسؤول الرئيسي للمنظومة' : 'تسجيل دخول لوحة الإدارة المشفرة'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {isSetupMode
              ? 'يرجى تحديد بيانات المسؤول الأول بأمان. لن يسمح بالتسجيل الذاتي بعد هذه الخطوة.'
              : 'نظام إدارة تصاريح العمل والعمالة للمؤسسة'}
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {isSetupMode && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                اسم المسؤول الكامل:
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="مثال: مدير الموارد البشرية"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-3 pr-9 py-2.5 text-xs border border-slate-300 rounded-xl focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                />
                <ShieldCheck className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              اسم المستخدم أو البريد الإلكتروني:
            </label>
            <div className="relative">
              <input
                type="text"
                required
                autoComplete="username"
                placeholder={isSetupMode ? 'اختر اسم مستخدم خاص بالمسؤول' : 'اسم المستخدم'}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-3 pr-9 py-2.5 text-xs border border-slate-300 rounded-xl focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600 text-right"
              />
              <User className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              كلمة المرور:
            </label>
            <div className="relative">
              <input
                type="password"
                required
                autoComplete={isSetupMode ? 'new-password' : 'current-password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-3 pr-9 py-2.5 text-xs border border-slate-300 rounded-xl focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600 font-mono"
              />
              <KeyRound className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
            </div>
          </div>

          {isSetupMode && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                تأكيد كلمة المرور:
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-3 pr-9 py-2.5 text-xs border border-slate-300 rounded-xl focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600 font-mono"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold rounded-xl shadow-md transition-colors text-xs flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="inline-block animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
            ) : (
              <Lock className="w-4 h-4" />
            )}
            <span>
              {isSetupMode
                ? 'حفظ وتثبيت حساب المسؤول'
                : 'تسجيل الدخول إلى لوحة الإدارة'}
            </span>
          </button>
        </form>

        {/* Security Notice Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 text-center text-[11px] text-slate-500 space-y-1">
          <p className="font-semibold text-slate-700 flex items-center justify-center gap-1">
            <Lock className="w-3 h-3 text-slate-500" />
            <span>نظام محمي ومشفر — مخصص للموظفين المصرح لهم فقط</span>
          </p>
          <p className="text-[10px] text-slate-400">
            جميع محاولات الدخول غير المصرح بها مراقبة ومسجلة في سجل التدقيق الأمني (Audit Logs).
          </p>
        </div>
      </div>
    </div>
  );
};
