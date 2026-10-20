import React, { useState } from 'react';
import { WorkPermit, Worker, Establishment, SystemSettings, PermitStatus } from '../types';
import { formatDateAr, getDaysRemaining, getPermitStatusBadge, getPermitTypeLabel, maskId } from '../utils/helpers';
import QRCode from 'qrcode';
import {
  Search,
  Filter,
  PlusCircle,
  Printer,
  QrCode,
  Edit3,
  Trash2,
  AlertTriangle,
  RotateCw,
  FileSpreadsheet,
  Download,
  ExternalLink,
  ShieldAlert,
  ShieldCheck,
  Eye,
  Copy,
  Check,
  X,
  PowerOff,
} from 'lucide-react';

interface PermitsListProps {
  permits: WorkPermit[];
  workers: Worker[];
  establishments: Establishment[];
  settings: SystemSettings;
  onOpenNewPermit: () => void;
  onSelectPermitForPrint: (permit: WorkPermit) => void;
  onSelectPermitForVerify: (permit: WorkPermit) => void;
  onEditPermit: (permit: WorkPermit) => void;
  onDeletePermit: (permitId: string) => void;
  onRenewPermit: (permitId: string) => void;
  onRevokePermit: (permitId: string) => void;
  onToggleDisableVerification?: (permitId: string) => void;
}

export const PermitsList: React.FC<PermitsListProps> = ({
  permits,
  workers,
  establishments,
  settings,
  onOpenNewPermit,
  onSelectPermitForPrint,
  onSelectPermitForVerify,
  onEditPermit,
  onDeletePermit,
  onRenewPermit,
  onRevokePermit,
  onToggleDisableVerification,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'draft' | 'expiring' | 'expired' | 'revoked'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  // QR Code Modal State
  const [selectedQrPermit, setSelectedQrPermit] = useState<WorkPermit | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState(false);

  const filteredPermits = permits.filter((p) => {
    const worker = workers.find((w) => w.id === p.workerId);
    const issuingEst = establishments.find((e) => e.id === p.issuingEstablishmentId);
    const hostEst = establishments.find((e) => e.id === p.hostEstablishmentId);

    const matchesSearch =
      p.permitNumber.toLowerCase().includes(search.toLowerCase()) ||
      (worker && worker.fullNameAr.toLowerCase().includes(search.toLowerCase())) ||
      (worker && worker.iqamaNumber.includes(search)) ||
      (p.verificationToken && p.verificationToken.toLowerCase().includes(search.toLowerCase())) ||
      (issuingEst && issuingEst.nameAr.toLowerCase().includes(search.toLowerCase())) ||
      (hostEst && hostEst.nameAr.toLowerCase().includes(search.toLowerCase())) ||
      p.workLocations.some((loc) => loc.toLowerCase().includes(search.toLowerCase()));

    if (!matchesSearch) return false;

    if (typeFilter !== 'all' && p.permitType !== typeFilter) return false;

    const daysLeft = getDaysRemaining(p.expiryDate);
    if (statusFilter === 'active') {
      return p.status === 'active' && daysLeft > 0;
    }
    if (statusFilter === 'draft') {
      return p.status === 'draft';
    }
    if (statusFilter === 'expiring') {
      return p.status === 'active' && daysLeft > 0 && daysLeft <= 30;
    }
    if (statusFilter === 'expired') {
      return p.status === 'expired' || daysLeft <= 0;
    }
    if (statusFilter === 'revoked') {
      return p.status === 'revoked';
    }

    return true;
  });

  const handleOpenQrModal = async (pmt: WorkPermit) => {
    setSelectedQrPermit(pmt);
    const token = pmt.verificationToken || pmt.id;
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const verifyUrl = `${origin}/verify/${encodeURIComponent(token)}`;

    try {
      const url = await QRCode.toDataURL(verifyUrl, {
        width: 320,
        margin: 2,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
      });
      setQrDataUrl(url);
    } catch (e) {
      console.error('Failed to generate QR code', e);
    }
  };

  const handleDownloadQr = () => {
    if (!qrDataUrl || !selectedQrPermit) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `QR-${selectedQrPermit.permitNumber}.png`;
    a.click();
  };

  const handleCopyLink = () => {
    if (!selectedQrPermit) return;
    const token = selectedQrPermit.verificationToken || selectedQrPermit.id;
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const verifyUrl = `${origin}/verify/${encodeURIComponent(token)}`;
    navigator.clipboard.writeText(verifyUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleExportCSV = () => {
    const headers = ['رقم التصريح', 'نوع التصريح', 'العامل', 'رقم الإقامة', 'المنشأة المصرحة', 'تاريخ الانتهاء', 'الحالة'];
    const rows = filteredPermits.map((p) => {
      const worker = workers.find((w) => w.id === p.workerId);
      const est = establishments.find((e) => e.id === p.issuingEstablishmentId);
      return [
        p.permitNumber,
        getPermitTypeLabel(p.permitType),
        worker?.fullNameAr || '',
        worker?.iqamaNumber || '',
        est?.nameAr || '',
        p.expiryDate,
        p.status,
      ];
    });

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ajeer_permits_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isReadOnly = settings.currentRole === 'auditor';

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">إدارة تصاريح العمل وأجير المؤقتة</h2>
          <p className="text-xs text-slate-500">
            متابعة حالة التصاريح، التجديد، الطباعة، ورموز QR للتحقق الميداني الفوري
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <Download className="w-4 h-4 text-slate-600" />
            <span>تصدير Excel (CSV)</span>
          </button>

          {!isReadOnly && (
            <button
              onClick={onOpenNewPermit}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              <span>إصدار تصريح جديد</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Search */}
        <div className="relative flex-1 min-w-[260px]">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
          <input
            type="text"
            placeholder="بحث برقم التصريح، اسم العامل، رقم الهوية، الموقع..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pr-9 pl-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-600 bg-slate-50/50"
          />
        </div>

        {/* Status Filters */}
        <div className="flex flex-wrap items-center gap-1 bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
              statusFilter === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            الكل ({permits.length})
          </button>
          <button
            onClick={() => setStatusFilter('active')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
              statusFilter === 'active' ? 'bg-white text-emerald-800 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ساري (
            {
              permits.filter((p) => {
                const d = getDaysRemaining(p.expiryDate);
                return p.status === 'active' && d > 0;
              }).length
            }
            )
          </button>
          <button
            onClick={() => setStatusFilter('draft')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
              statusFilter === 'draft' ? 'bg-white text-slate-800 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            مسودة ({permits.filter((p) => p.status === 'draft').length})
          </button>
          <button
            onClick={() => setStatusFilter('expiring')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
              statusFilter === 'expiring' ? 'bg-white text-amber-800 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ينتهي قريباً (
            {
              permits.filter((p) => {
                const d = getDaysRemaining(p.expiryDate);
                return p.status === 'active' && d > 0 && d <= 30;
              }).length
            }
            )
          </button>
          <button
            onClick={() => setStatusFilter('expired')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
              statusFilter === 'expired' ? 'bg-white text-rose-800 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            منتهي
          </button>
          <button
            onClick={() => setStatusFilter('revoked')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
              statusFilter === 'revoked' ? 'bg-white text-red-800 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ملغى
          </button>
        </div>

        {/* Type Filter */}
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="border border-slate-300 rounded-lg px-3 py-2 bg-white focus:outline-none"
        >
          <option value="all">كافة أنواع التصاريح</option>
          <option value="contractual">تصريح تعاقدي (إعارة)</option>
          <option value="temporary">تصريح مؤقت (أجير مباشر)</option>
          <option value="seasonal">تصريح موسمي</option>
          <option value="accompanier">تصريح مرافق</option>
        </select>
      </div>

      {/* Permits Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3">رقم التصريح والنوع</th>
                <th className="p-3">العامل المصرح له</th>
                <th className="p-3">المنشأة المصرحة</th>
                <th className="p-3">مواقع العمل المعتمدة</th>
                <th className="p-3">سريان التصريح</th>
                <th className="p-3">الحالة النظامية</th>
                <th className="p-3 text-center">الإجراءات والتحقق</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPermits.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    لا توجد تصاريح مطابقة لمعايير البحث الحالية
                  </td>
                </tr>
              ) : (
                filteredPermits.map((pmt) => {
                  const worker = workers.find((w) => w.id === pmt.workerId);
                  const issuingEst = establishments.find((e) => e.id === pmt.issuingEstablishmentId);
                  const badge = getPermitStatusBadge(pmt.status, pmt.expiryDate);

                  return (
                    <tr key={pmt.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3">
                        <div className="font-mono font-bold text-slate-900 text-sm flex items-center gap-1.5">
                          <span>{pmt.permitNumber}</span>
                          {pmt.verificationDisabled && (
                            <span className="px-1.5 py-0.5 rounded text-[9.5px] font-bold bg-rose-100 text-rose-700 border border-rose-200">
                              رابط QR معطل
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 font-medium">{getPermitTypeLabel(pmt.permitType)}</div>
                      </td>

                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <img
                            src={worker?.photoUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250'}
                            alt={worker?.fullNameAr}
                            className="w-7 h-7 rounded-full object-cover border border-slate-200"
                          />
                          <div>
                            <div className="font-bold text-slate-900">{worker?.fullNameAr || 'عامل غير محدد'}</div>
                            <div className="text-[11px] text-slate-500 font-mono">
                              إقامة: {maskId(worker?.iqamaNumber || '', settings.maskSensitiveData)}
                            </div>
                            <div className="text-[10px] text-emerald-800 font-medium">
                              {pmt.authorizedProfession || worker?.profession}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="p-3 text-slate-700">
                        <div className="font-semibold">{issuingEst?.nameAr || '-'}</div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          700: {issuingEst?.unifiedNumber700}
                        </div>
                      </td>

                      <td className="p-3 text-slate-600 max-w-[200px]">
                        <div className="truncate font-medium">{pmt.workLocations[0]}</div>
                        {pmt.workLocations.length > 1 && (
                          <span className="text-[10px] text-slate-400">
                            +{pmt.workLocations.length - 1} موقع إضافي
                          </span>
                        )}
                      </td>

                      <td className="p-3 font-mono">
                        <div className="text-slate-800 font-semibold">{formatDateAr(pmt.expiryDate)}</div>
                        <div className="text-[10px] text-slate-400">بدأ: {formatDateAr(pmt.issueDate)}</div>
                      </td>

                      <td className="p-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold border ${badge.color}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${badge.dotColor}`}></span>
                          {badge.label}
                        </span>
                      </td>

                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {/* QR Code generator & download modal trigger */}
                          <button
                            onClick={() => handleOpenQrModal(pmt)}
                            className="p-1.5 text-purple-700 hover:bg-purple-50 rounded transition-colors"
                            title="عرض وتنزيل رمز QR للطباعة"
                          >
                            <QrCode className="w-4 h-4" />
                          </button>

                          {/* Instant Verify preview in public verify view */}
                          <button
                            onClick={() => onSelectPermitForVerify(pmt)}
                            className="p-1.5 text-blue-700 hover:bg-blue-50 rounded transition-colors"
                            title="معاينة صفحة التحقق العامة"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Print / PDF view */}
                          <button
                            onClick={() => onSelectPermitForPrint(pmt)}
                            className="p-1.5 text-emerald-700 hover:bg-emerald-50 rounded transition-colors"
                            title="طباعة وتحميل المستند الرسمي (A4)"
                          >
                            <Printer className="w-4 h-4" />
                          </button>

                          {!isReadOnly && (
                            <>
                              {/* Edit */}
                              <button
                                onClick={() => onEditPermit(pmt)}
                                className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"
                                title="تعديل بيانات التصريح"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>

                              {/* Toggle Disable Verification */}
                              {onToggleDisableVerification && (
                                <button
                                  onClick={() => onToggleDisableVerification(pmt.id)}
                                  className={`p-1.5 rounded transition-colors ${
                                    pmt.verificationDisabled
                                      ? 'text-rose-600 hover:bg-rose-50'
                                      : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                                  }`}
                                  title={pmt.verificationDisabled ? 'تفعيل رابط التحقق' : 'تعطيل رابط التحقق'}
                                >
                                  <PowerOff className="w-4 h-4" />
                                </button>
                              )}

                              {/* Renew */}
                              {pmt.status === 'active' && (
                                <button
                                  onClick={() => onRenewPermit(pmt.id)}
                                  className="p-1.5 text-amber-600 hover:bg-amber-50 rounded transition-colors"
                                  title="تمديد وتجديد التصريح 6 أشهر"
                                >
                                  <RotateCw className="w-4 h-4" />
                                </button>
                              )}

                              {/* Delete */}
                              <button
                                onClick={() => onDeletePermit(pmt.id)}
                                className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded transition-colors"
                                title="حذف التصريح"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* QR Code Modal for Printable & Downloadable QR */}
      {selectedQrPermit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-sm overflow-hidden text-center p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="text-right">
                <h3 className="font-bold text-slate-900 text-sm">رمز الاستجابة السريعة (QR) المعتمد</h3>
                <p className="text-[11px] text-slate-500">تصريح رقم: {selectedQrPermit.permitNumber}</p>
              </div>
              <button
                onClick={() => setSelectedQrPermit(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* QR Image Box */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col items-center justify-center">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt="QR Code"
                  className="w-48 h-48 rounded-lg shadow-xs bg-white p-2 border border-slate-200"
                />
              ) : (
                <div className="w-48 h-48 flex items-center justify-center text-slate-400">
                  جاري إنشاء الرمز...
                </div>
              )}
              <span className="text-[11px] text-slate-500 mt-2 font-mono">
                Token: {selectedQrPermit.verificationToken || selectedQrPermit.id}
              </span>
            </div>

            {/* Status indicator */}
            {selectedQrPermit.verificationDisabled && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs font-semibold">
                تنبيه: رابط التحقق معطل حالياً لهذا التصريح
              </div>
            )}

            {/* Action buttons */}
            <div className="space-y-2">
              <button
                onClick={handleDownloadQr}
                className="w-full py-2.5 px-4 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-xs"
              >
                <Download className="w-4 h-4" />
                <span>تنزيل صورة QR (PNG عالية الدقة)</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleCopyLink}
                  className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'تم النسخ!' : 'نسخ الرابط'}</span>
                </button>

                <button
                  onClick={() => {
                    const pmt = selectedQrPermit;
                    setSelectedQrPermit(null);
                    onSelectPermitForVerify(pmt);
                  }}
                  className="py-2 px-3 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>معاينة التحقق</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
