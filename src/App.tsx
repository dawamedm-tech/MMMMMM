import React, { useState, useEffect } from 'react';
import {
  WorkPermit,
  Worker,
  Establishment,
  InspectionRecord,
  SystemSettings,
  AjeerApiConfig,
  UserRole,
} from './types';
import {
  INITIAL_ESTABLISHMENTS,
  INITIAL_WORKERS,
  INITIAL_PERMITS,
  INITIAL_INSPECTIONS,
  INITIAL_SETTINGS,
  INITIAL_AJEER_CONFIG,
} from './data/initialData';
import { AjeerOfficialDocument } from './components/AjeerOfficialDocument';
import { AjeerMobileVerifyView } from './components/AjeerMobileVerifyView';
import { DocumentToolbar } from './components/DocumentToolbar';
import { AjeerDocumentEditorModal } from './components/AjeerDocumentEditorModal';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { Dashboard } from './components/Dashboard';
import { PermitsList } from './components/PermitsList';
import { PermitModal } from './components/PermitModal';
import { WorkersList } from './components/WorkersList';
import { WorkerModal } from './components/WorkerModal';
import { EstablishmentsList } from './components/EstablishmentsList';
import { VerificationPortal } from './components/VerificationPortal';
import { FieldInspection } from './components/FieldInspection';
import { AdminSettings } from './components/AdminSettings';
import { AjeerIntegration } from './components/AjeerIntegration';
import { AuditReport } from './components/AuditReport';
import { AdminLogin } from './components/AdminLogin';
import { getDaysRemaining } from './utils/helpers';

// SHA-256 helper for client-side password hashing
async function hashPassword(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

interface AdminSession {
  token: string;
  user: string;
  fullName?: string;
  expiresAt: number;
}

export default function App() {
  // Database states with LocalStorage persistence
  const [establishments, setEstablishments] = useState<Establishment[]>(() => {
    const saved = localStorage.getItem('ajeer_establishments');
    return saved ? JSON.parse(saved) : INITIAL_ESTABLISHMENTS;
  });

  const [workers, setWorkers] = useState<Worker[]>(() => {
    const saved = localStorage.getItem('ajeer_workers');
    return saved ? JSON.parse(saved) : INITIAL_WORKERS;
  });

  const [permits, setPermits] = useState<WorkPermit[]>(() => {
    const saved = localStorage.getItem('ajeer_permits');
    return saved ? JSON.parse(saved) : INITIAL_PERMITS;
  });

  const [inspections, setInspections] = useState<InspectionRecord[]>(() => {
    const saved = localStorage.getItem('ajeer_inspections');
    return saved ? JSON.parse(saved) : INITIAL_INSPECTIONS;
  });

  const [settings, setSettings] = useState<SystemSettings>(() => {
    const saved = localStorage.getItem('ajeer_settings');
    const parsed = saved ? JSON.parse(saved) : INITIAL_SETTINGS;
    // Ensure footerLogos array is populated with at least 3 elements
    const footerLogos: [string, string, string] = [
      parsed.footerLogos?.[0] || parsed.footerLogo1 || '',
      parsed.footerLogos?.[1] || parsed.footerLogo2 || '',
      parsed.footerLogos?.[2] || parsed.footerLogo3 || '',
    ];
    return { ...parsed, footerLogos };
  });

  const [ajeerConfig, setAjeerConfig] = useState<AjeerApiConfig>(() => {
    const saved = localStorage.getItem('ajeer_config');
    return saved ? JSON.parse(saved) : INITIAL_AJEER_CONFIG;
  });

  // Admin Authentication State
  const [adminSession, setAdminSession] = useState<AdminSession | null>(() => {
    const saved = localStorage.getItem('ajeer_admin_session');
    if (!saved) return null;
    try {
      const parsed: AdminSession = JSON.parse(saved);
      if (parsed.expiresAt && parsed.expiresAt < Date.now()) {
        localStorage.removeItem('ajeer_admin_session');
        return null;
      }
      return parsed;
    } catch {
      return null;
    }
  });

  const [adminUserExists, setAdminUserExists] = useState<boolean>(() => {
    return !!localStorage.getItem('ajeer_admin_account');
  });

  // Check auth status from backend server on mount
  useEffect(() => {
    fetch('/api/auth/status', {
      headers: adminSession?.token ? { Authorization: `Bearer ${adminSession.token}` } : {},
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.hasAdmin !== undefined) {
          setAdminUserExists(data.hasAdmin);
        }
        if (data.isAuthenticated && adminSession) {
          setAdminSession((prev) =>
            prev ? { ...prev, user: data.user, fullName: data.adminFullName } : null
          );
        }
      })
      .catch(() => {
        // Fallback gracefully to localStorage
      });
  }, []);

  // Custom Logos uploaded by user
  const [mohrsdLogoUrl, setMohrsdLogoUrl] = useState<string>(() => {
    return localStorage.getItem('ajeer_custom_mohrsd_logo') || '';
  });

  const [ajeerLogoUrl, setAjeerLogoUrl] = useState<string>(() => {
    return localStorage.getItem('ajeer_custom_ajeer_logo') || '';
  });

  // Selected Permit for Document View
  const [selectedPermitId, setSelectedPermitId] = useState<string>(() => {
    return permits[0]?.id || 'pmt-1';
  });

  // Contract Brief and Declarations customization
  const [contractBrief, setContractBrief] = useState<string>(() => {
    return (
      localStorage.getItem('ajeer_contract_brief') ||
      'تقديم خدمات مساندة وتشغيلية وإعارة عمالة بموجب عقد الخدمات المشترك المبرم بين الطرفين.'
    );
  });

  const [declarationsList, setDeclarationsList] = useState<string[]>(() => {
    const saved = localStorage.getItem('ajeer_declarations_list');
    return saved
      ? JSON.parse(saved)
      : [
          'صحة جميع البيانات المسجلة في هذا التصريح ومطابقتها للعقد المبرم بين الطرفين.',
          'أن العامل المصرح له يعمل تحت إشراف المنشأة المستفيدة وفق المهنة المحددة في التصريح فقط.',
          'التزام المنشأة بصرف أجور العامل وتوفير الرعاية الصحية والتأمين الطبي وإصابات العمل طوال فترة سريان العقد والتصريح.',
          'عدم تمكين العامل من العمل لدى أي طرف ثالث غير المنشأة المستفيدة المذكورة في هذا التصريح.',
          'تقديم هذا التصريح للجهات المختصة عند طلبه لإثبات نظامية تواجد العامل في موقع العمل وعدم مخالفته لنظام العمل.',
        ];
  });

  // Modal State for editing document
  const [isDocEditorOpen, setIsDocEditorOpen] = useState(false);

  // App Routing:
  // - /verify/:token: Public isolated verification page (no toolbar, no admin buttons, read-only)
  // - /login: Dedicated Administrator authentication screen
  // - /admin: Management dashboard and administrative tools (Protected)
  // - /document/:id: Official printable A4 document view
  interface AppRoute {
    view: 'verify' | 'document' | 'admin' | 'login';
    param: string;
  }

  const parseAppRoute = (): AppRoute => {
    if (typeof window === 'undefined') {
      return { view: 'document', param: '' };
    }
    const pathname = window.location.pathname;
    const searchParams = new URLSearchParams(window.location.search);

    // 1. Verify route (/verify/:token or ?verify=... or ?token=...)
    if (pathname.startsWith('/verify') || searchParams.has('verify') || searchParams.has('token')) {
      let token = '';
      const match = pathname.match(/^\/verify\/?(.*)/);
      if (match && match[1]) {
        token = decodeURIComponent(match[1]);
      } else {
        token = searchParams.get('verify') || searchParams.get('token') || '';
      }
      return { view: 'verify', param: token };
    }

    // 2. Login route (/login or ?view=login)
    if (pathname.startsWith('/login') || searchParams.get('view') === 'login') {
      return { view: 'login', param: '' };
    }

    // 3. Admin route (/admin or ?view=admin)
    if (pathname.startsWith('/admin') || searchParams.get('view') === 'admin') {
      return { view: 'admin', param: '' };
    }

    // 4. Document route (/document/:id or ?view=document)
    if (pathname.startsWith('/document') || searchParams.get('view') === 'document') {
      let docId = '';
      const match = pathname.match(/^\/document\/?(.*)/);
      if (match && match[1]) {
        docId = decodeURIComponent(match[1]);
      } else {
        docId = searchParams.get('id') || searchParams.get('doc') || '';
      }
      return { view: 'document', param: docId };
    }

    // Root route: default to document
    return { view: 'document', param: '' };
  };

  const [route, setRoute] = useState<AppRoute>(parseAppRoute);

  const navigate = (view: 'verify' | 'document' | 'admin' | 'login', param: string = '') => {
    let url = '/';
    if (view === 'verify') {
      url = param ? `/verify/${encodeURIComponent(param)}` : '/verify';
    } else if (view === 'document') {
      url = param ? `/document/${encodeURIComponent(param)}` : '/document';
    } else if (view === 'admin') {
      url = '/admin';
    } else if (view === 'login') {
      url = '/login';
    }
    try {
      window.history.pushState({}, '', url);
    } catch (e) {
      console.error(e);
    }
    setRoute({ view, param });
  };

  useEffect(() => {
    const handlePopState = () => {
      setRoute(parseAppRoute());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // The 3 footer logos of the public verification page are stored on the server
  // (uploaded by the admin). Visitors who open the QR link have no session and an
  // empty localStorage, so fetch them from the public, read-only verify endpoint.
  const [publicFooterLogos, setPublicFooterLogos] = useState<[string, string, string] | null>(null);

  useEffect(() => {
    if (route.view !== 'verify' || !route.param) {
      setPublicFooterLogos(null);
      return;
    }

    let cancelled = false;
    fetch(`/api/public/verify/${encodeURIComponent(route.param.trim())}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data: any) => {
        if (cancelled || !data || !Array.isArray(data.footerLogos)) return;
        setPublicFooterLogos([
          data.footerLogos[0] || '',
          data.footerLogos[1] || '',
          data.footerLogos[2] || '',
        ]);
      })
      .catch(() => {
        // Keep the locally stored settings as a graceful fallback
      });

    return () => {
      cancelled = true;
    };
  }, [route.view, route.param]);

  // Sync selected permit when document route specifies an id
  useEffect(() => {
    if (route.view === 'document' && route.param) {
      const found = permits.find(
        (p) =>
          p.id.toLowerCase() === route.param.toLowerCase() ||
          p.permitNumber.trim().toLowerCase() === route.param.trim().toLowerCase()
      );
      if (found) {
        setSelectedPermitId(found.id);
      }
    }
  }, [route, permits]);

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedVerifyPermitNumber, setSelectedVerifyPermitNumber] = useState<string>('');

  const [isPermitModalOpen, setIsPermitModalOpen] = useState(false);
  const [editingPermit, setEditingPermit] = useState<WorkPermit | null>(null);

  const [isWorkerModalOpen, setIsWorkerModalOpen] = useState(false);
  const [editingWorker, setEditingWorker] = useState<Worker | null>(null);

  // Save changes to localStorage & backend
  useEffect(() => {
    localStorage.setItem('ajeer_establishments', JSON.stringify(establishments));
  }, [establishments]);

  useEffect(() => {
    localStorage.setItem('ajeer_workers', JSON.stringify(workers));
  }, [workers]);

  useEffect(() => {
    localStorage.setItem('ajeer_permits', JSON.stringify(permits));
  }, [permits]);

  useEffect(() => {
    localStorage.setItem('ajeer_inspections', JSON.stringify(inspections));
  }, [inspections]);

  useEffect(() => {
    localStorage.setItem('ajeer_settings', JSON.stringify(settings));
    if (adminSession?.token) {
      fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminSession.token}`,
        },
        body: JSON.stringify(settings),
      }).catch(() => {});
    }
  }, [settings, adminSession]);

  useEffect(() => {
    localStorage.setItem('ajeer_config', JSON.stringify(ajeerConfig));
  }, [ajeerConfig]);

  useEffect(() => {
    if (mohrsdLogoUrl) {
      localStorage.setItem('ajeer_custom_mohrsd_logo', mohrsdLogoUrl);
    } else {
      localStorage.removeItem('ajeer_custom_mohrsd_logo');
    }
  }, [mohrsdLogoUrl]);

  useEffect(() => {
    if (ajeerLogoUrl) {
      localStorage.setItem('ajeer_custom_ajeer_logo', ajeerLogoUrl);
    } else {
      localStorage.removeItem('ajeer_custom_ajeer_logo');
    }
  }, [ajeerLogoUrl]);

  useEffect(() => {
    localStorage.setItem('ajeer_contract_brief', contractBrief);
  }, [contractBrief]);

  useEffect(() => {
    localStorage.setItem('ajeer_declarations_list', JSON.stringify(declarationsList));
  }, [declarationsList]);

  // Current selected Permit & Entities for Document Rendering
  const currentPermit = permits.find((p) => p.id === selectedPermitId) || permits[0];
  const currentWorker =
    workers.find((w) => w.id === currentPermit?.workerId) ||
    workers[0] || {
      id: 'wrk-default',
      fullNameAr: 'محمد طارق العبدالله',
      fullNameEn: 'Mohammed Tariq',
      iqamaNumber: '2481928374',
      nationality: 'سوداني',
      profession: 'مهندس موقع',
      healthInsuranceStatus: 'active',
      phone: '0568912340',
      photoUrl: '',
      primaryEstablishmentId: 'est-1',
      birthDate: '1990-01-01',
      gender: 'male',
      status: 'active',
    };

  const currentIssuingEst =
    establishments.find((e) => e.id === currentPermit?.issuingEstablishmentId) ||
    establishments[0] || {
      id: 'est-1',
      nameAr: 'شركة الفنار للمقاولات العامة',
      nameEn: 'Al-Fanar Co.',
      crNumber: '1010294819',
      unifiedNumber700: '7001827364',
      activity: 'المقاولات العامة',
      city: 'الرياض',
      address: 'الرياض',
      phone: '0114920192',
      email: 'info@alfanar.sa',
      managerName: 'م. فهد العتيبي',
    };

  const currentHostEst =
    establishments.find((e) => e.id === currentPermit?.hostEstablishmentId) ||
    establishments[1] ||
    establishments[0] || {
      id: 'est-2',
      nameAr: 'شركة البحر الأحمر للتطوير العمراني',
      nameEn: 'Red Sea Dev.',
      crNumber: '4030192837',
      unifiedNumber700: '7002938475',
      activity: 'إدارة وتطوير المشاريع',
      city: 'جدة',
      address: 'جدة',
      phone: '0126938471',
      email: 'contact@redsea.sa',
      managerName: 'أ. سامي الزهراني',
    };

  const handlePrint = () => {
    window.print();
  };

  const handleResetLogos = () => {
    setMohrsdLogoUrl('');
    setAjeerLogoUrl('');
  };

  const [verifyPageTitle, setVerifyPageTitle] = useState(() => {
    return localStorage.getItem('ajeer_verify_title') || 'التصريح أُجْرِ لحلول الموارد البشرية';
  });

  const [verifyPageSubtitle, setVerifyPageSubtitle] = useState(() => {
    return localStorage.getItem('ajeer_verify_subtitle') || 'تم تحميل البيانات بنجاح';
  });

  const handleSaveDocEditor = (data: {
    workerName: string;
    iqamaNumber: string;
    profession: string;
    nationality: string;
    issuingEstName: string;
    issuingEst700: string;
    hostEstName: string;
    hostEst700: string;
    contractBrief: string;
    issueDate: string;
    expiryDate: string;
    workLocation: string;
    referenceNumber: string;
    declarationsList: string[];
    status: 'active' | 'expired' | 'revoked';
    pageHeaderTitle: string;
    pageHeaderSubtitle: string;
  }) => {
    // Update worker
    const updatedWorkers = workers.map((w) =>
      w.id === currentWorker.id
        ? {
            ...w,
            fullNameAr: data.workerName,
            iqamaNumber: data.iqamaNumber,
            profession: data.profession,
            nationality: data.nationality,
          }
        : w
    );
    setWorkers(updatedWorkers);

    // Update issuing establishment
    const updatedEstablishments = establishments.map((e) => {
      if (e.id === currentIssuingEst.id) {
        return {
          ...e,
          nameAr: data.issuingEstName,
          unifiedNumber700: data.issuingEst700,
        };
      }
      if (e.id === currentHostEst.id) {
        return {
          ...e,
          nameAr: data.hostEstName,
          unifiedNumber700: data.hostEst700,
        };
      }
      return e;
    });
    setEstablishments(updatedEstablishments);

    // Update permit
    const updatedPermits = permits.map((p) =>
      p.id === currentPermit.id
        ? {
            ...p,
            permitNumber: data.referenceNumber,
            authorizedProfession: data.profession,
            issueDate: data.issueDate,
            expiryDate: data.expiryDate,
            workLocations: [data.workLocation],
            status: data.status,
          }
        : p
    );
    setPermits(updatedPermits);

    // Update brief & declarations & titles
    setContractBrief(data.contractBrief);
    setDeclarationsList(data.declarationsList);
    setVerifyPageTitle(data.pageHeaderTitle);
    setVerifyPageSubtitle(data.pageHeaderSubtitle);
    localStorage.setItem('ajeer_verify_title', data.pageHeaderTitle);
    localStorage.setItem('ajeer_verify_subtitle', data.pageHeaderSubtitle);
  };

  // Auth Operations
  const handleAdminLogin = async (username: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const passHash = await hashPassword(pass);

      // Attempt server login
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, passwordHash: passHash }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        const session: AdminSession = {
          token: data.token,
          user: data.user,
          fullName: data.fullName,
          expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
        };
        setAdminSession(session);
        localStorage.setItem('ajeer_admin_session', JSON.stringify(session));
        return { success: true };
      }

      // LocalStorage fallback validation
      const localAccount = localStorage.getItem('ajeer_admin_account');
      if (localAccount) {
        const acc = JSON.parse(localAccount);
        if (acc.username.toLowerCase() === username.toLowerCase() && acc.passwordHash === passHash) {
          const session: AdminSession = {
            token: `adm_${Date.now()}`,
            user: acc.username,
            fullName: acc.fullName,
            expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
          };
          setAdminSession(session);
          localStorage.setItem('ajeer_admin_session', JSON.stringify(session));
          return { success: true };
        }
      }

      return { success: false, error: data.error || 'اسم المستخدم أو كلمة المرور غير صحيحة' };
    } catch (e: any) {
      return { success: false, error: e.message || 'فشل الاتصال بخدمة التحقق' };
    }
  };

  const handleSetupFirstAdmin = async (
    username: string,
    pass: string,
    fullName: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const passHash = await hashPassword(pass);

      // Server-side registration
      const res = await fetch('/api/auth/setup-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, passwordHash: passHash, fullName }),
      });
      const data = await res.json();

      const accountObj = {
        username,
        passwordHash: passHash,
        fullName,
        createdAt: new Date().toISOString(),
      };
      localStorage.setItem('ajeer_admin_account', JSON.stringify(accountObj));
      setAdminUserExists(true);

      const session: AdminSession = {
        token: data.token || `adm_${Date.now()}`,
        user: username,
        fullName,
        expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
      };
      setAdminSession(session);
      localStorage.setItem('ajeer_admin_session', JSON.stringify(session));

      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || 'حدث خطأ أثناء إعداد الحساب' };
    }
  };

  const handleLogout = () => {
    if (adminSession?.token) {
      fetch('/api/auth/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${adminSession.token}` },
      }).catch(() => {});
    }
    setAdminSession(null);
    localStorage.removeItem('ajeer_admin_session');
    navigate('login');
  };

  // Full CRUD operations for System View
  const handleSavePermit = (permit: WorkPermit) => {
    const exists = permits.some((p) => p.id === permit.id);
    let next: WorkPermit[];
    if (exists) {
      next = permits.map((p) => (p.id === permit.id ? permit : p));
    } else {
      next = [permit, ...permits];
    }
    setPermits(next);
    setIsPermitModalOpen(false);
    setEditingPermit(null);

    if (adminSession?.token) {
      fetch('/api/admin/permits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminSession.token}`,
        },
        body: JSON.stringify(permit),
      }).catch(() => {});
    }
  };

  const handleDeletePermit = (permitId: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا التصريح؟')) {
      setPermits(permits.filter((p) => p.id !== permitId));
      if (selectedPermitId === permitId && permits.length > 1) {
        const next = permits.find((p) => p.id !== permitId);
        if (next) setSelectedPermitId(next.id);
      }
      if (adminSession?.token) {
        fetch(`/api/admin/permits/${permitId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${adminSession.token}` },
        }).catch(() => {});
      }
    }
  };

  const handleToggleDisableVerification = (permitId: string) => {
    const pmt = permits.find((p) => p.id === permitId);
    if (!pmt) return;
    const updated = {
      ...pmt,
      verificationDisabled: !pmt.verificationDisabled,
    };
    handleSavePermit(updated);
  };

  const handleRenewPermit = (permitId: string) => {
    const pmt = permits.find((p) => p.id === permitId);
    if (!pmt) return;
    const currentExpiry = new Date(pmt.expiryDate);
    const newExpiry = new Date(currentExpiry.getTime() + 180 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];
    const updated = {
      ...pmt,
      expiryDate: newExpiry,
      status: 'active' as const,
    };
    handleSavePermit(updated);
  };

  const handleRevokePermit = (permitId: string) => {
    const pmt = permits.find((p) => p.id === permitId);
    if (!pmt) return;
    const updated = {
      ...pmt,
      status: 'revoked' as const,
    };
    handleSavePermit(updated);
  };

  const handleSaveWorker = (worker: Worker) => {
    const exists = workers.some((w) => w.id === worker.id);
    let next: Worker[];
    if (exists) {
      next = workers.map((w) => (w.id === worker.id ? worker : w));
    } else {
      next = [worker, ...workers];
    }
    setWorkers(next);
    setIsWorkerModalOpen(false);
    setEditingWorker(null);

    if (adminSession?.token) {
      fetch('/api/admin/workers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminSession.token}`,
        },
        body: JSON.stringify(worker),
      }).catch(() => {});
    }
  };

  const handleArchiveWorker = (workerId: string) => {
    const worker = workers.find((w) => w.id === workerId);
    if (!worker) return;
    const nextStatus = worker.status === 'archived' ? 'active' : 'archived';
    const updated = { ...worker, status: nextStatus as 'active' | 'archived' };
    handleSaveWorker(updated);
  };

  const handleDeleteWorker = (workerId: string) => {
    const hasPermits = permits.some((p) => p.workerId === workerId);
    if (hasPermits) {
      if (
        !window.confirm(
          'تنبيه: هذا العامل مرتبط بتصاريح عمل نشطة أو مسجلة. نوصي بأرشفة العامل بدلاً من حذفه. هل ترغب بحذفه نهائياً على أي حال؟'
        )
      ) {
        return;
      }
    } else if (!window.confirm('هل أنت متأكد من حذف بيانات هذا العامل؟')) {
      return;
    }

    setWorkers(workers.filter((w) => w.id !== workerId));
    if (adminSession?.token) {
      fetch(`/api/admin/workers/${workerId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminSession.token}` },
      }).catch(() => {});
    }
  };

  const handleSaveEstablishment = (est: Establishment) => {
    const exists = establishments.some((e) => e.id === est.id);
    if (exists) {
      setEstablishments(establishments.map((e) => (e.id === est.id ? est : e)));
    } else {
      setEstablishments([est, ...establishments]);
    }
  };

  const handleDeleteEstablishment = (estId: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذه المنشأة؟')) {
      setEstablishments(establishments.filter((e) => e.id !== estId));
    }
  };

  const handleAddInspection = (inspection: Omit<InspectionRecord, 'id'> | InspectionRecord) => {
    const full: InspectionRecord = {
      ...inspection,
      id: 'id' in inspection && inspection.id ? inspection.id : `insp-${Date.now()}`,
    };
    setInspections([full, ...inspections]);
  };

  const handleExportAllData = () => {
    const fullBackup = {
      establishments,
      workers,
      permits,
      inspections,
      settings,
      ajeerConfig,
      exportTimestamp: new Date().toISOString(),
    };
    const jsonStr = JSON.stringify(fullBackup, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ajeer_system_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportData = (jsonStr: string) => {
    const data = JSON.parse(jsonStr);
    if (data.establishments) setEstablishments(data.establishments);
    if (data.workers) setWorkers(data.workers);
    if (data.permits) setPermits(data.permits);
    if (data.inspections) setInspections(data.inspections);
    if (data.settings) setSettings(data.settings);
    if (data.ajeerConfig) setAjeerConfig(data.ajeerConfig);
  };

  const handleResetToDefaults = () => {
    setEstablishments(INITIAL_ESTABLISHMENTS);
    setWorkers(INITIAL_WORKERS);
    setPermits(INITIAL_PERMITS);
    setInspections(INITIAL_INSPECTIONS);
    setSettings(INITIAL_SETTINGS);
    setAjeerConfig(INITIAL_AJEER_CONFIG);
    setMohrsdLogoUrl('');
    setAjeerLogoUrl('');
    localStorage.clear();
  };

  const expiringPermitsCount = permits.filter((p) => {
    const d = getDaysRemaining(p.expiryDate);
    return p.status === 'active' && d > 0 && d <= 30;
  }).length;

  // 1. ISOLATED PUBLIC VERIFICATION PAGE (Read-Only)
  // When scanned via QR code or opened via /verify/:token:
  // - ZERO black toolbar or administrative controls in React component tree
  // - ZERO empty placeholder spaces at the top
  // - Starts directly from the top header card:
  //   «التصريح أُجْرِ لحلول الموارد البشرية»
  //   «تم تحميل البيانات بنجاح»
  // - Followed by «معلومات التصريح»، «المنشأة المستفيدة»، «المنشأة المقدمة للخدمة»، and the 3 footer logos
  if (route.view === 'verify') {
    // Logos uploaded by the admin (server-side) take priority so every visitor
    // sees the same 3 logos; local settings remain the fallback.
    const localFooterLogos = settings.footerLogos || [
      settings.footerLogo1 || '',
      settings.footerLogo2 || '',
      settings.footerLogo3 || '',
    ];
    const effectiveFooterLogos = publicFooterLogos || localFooterLogos;

    const targetPermit =
      (route.param
        ? permits.find(
            (p) =>
              (p.verificationToken && p.verificationToken.trim().toLowerCase() === route.param.trim().toLowerCase()) ||
              p.permitNumber.trim().toLowerCase() === route.param.trim().toLowerCase() ||
              p.id.toLowerCase() === route.param.trim().toLowerCase()
          )
        : null) || (route.param ? null : currentPermit);

    if (!targetPermit || targetPermit.verificationDisabled) {
      return (
        <AjeerMobileVerifyView
          isInvalidOrDisabled={true}
          errorMessage={
            targetPermit?.verificationDisabled
              ? 'تم تعطيل رابط التحقق لهذا التصريح من قبل إدارة المنشأة'
              : 'عذراً، التصريح غير موجود أو أن رابط التحقق غير صالح أو غير معتمد'
          }
          pageHeaderTitle={verifyPageTitle}
          pageHeaderSubtitle={verifyPageSubtitle}
          customAjeerLogoUrl={ajeerLogoUrl}
          footerLogos={effectiveFooterLogos}
        />
      );
    }

    const targetWorker =
      workers.find((w) => w.id === targetPermit.workerId) || currentWorker;

    const targetIssuingEst =
      establishments.find((e) => e.id === targetPermit.issuingEstablishmentId) ||
      currentIssuingEst;

    const targetHostEst =
      establishments.find((e) => e.id === targetPermit.hostEstablishmentId) ||
      currentHostEst;

    return (
      <AjeerMobileVerifyView
        permit={targetPermit}
        worker={targetWorker}
        issuingEst={targetIssuingEst}
        hostEst={targetHostEst}
        pageHeaderTitle={verifyPageTitle}
        pageHeaderSubtitle={verifyPageSubtitle}
        maskIdEnabled={settings.maskSensitiveData}
        customAjeerLogoUrl={ajeerLogoUrl}
        footerLogos={effectiveFooterLogos}
      />
    );
  }

  // 2. ADMIN LOGIN PAGE (/login)
  if (route.view === 'login') {
    return (
      <AdminLogin
        hasInitializedAdmin={adminUserExists}
        onLogin={handleAdminLogin}
        onSetupFirstAdmin={handleSetupFirstAdmin}
        onSuccess={() => navigate('admin')}
      />
    );
  }

  // 3. OFFICIAL PRINTABLE A4 DOCUMENT PAGE
  // Displays the exact 1:1 authentic A4 contract document with administrative toolbar for printing & editing
  if (route.view === 'document') {
    return (
      <div className="min-h-screen bg-[#d8d8d8] text-black">
        <DocumentToolbar
          permits={permits}
          selectedPermitId={selectedPermitId}
          onSelectPermit={(id) => {
            setSelectedPermitId(id);
            navigate('document', id);
          }}
          onOpenEditModal={() => setIsDocEditorOpen(true)}
          onPrint={handlePrint}
          onUploadMohrsdLogo={(url) => setMohrsdLogoUrl(url)}
          onUploadAjeerLogo={(url) => setAjeerLogoUrl(url)}
          onResetLogos={handleResetLogos}
          hasCustomLogos={!!mohrsdLogoUrl || !!ajeerLogoUrl}
          viewMode="document"
          onChangeViewMode={(mode) => {
            if (mode === 'mobile_verify') {
              navigate('verify', currentPermit?.permitNumber || currentPermit?.id);
            } else if (mode === 'admin') {
              navigate('admin');
            } else {
              navigate('document', selectedPermitId);
            }
          }}
        />

        <div className="py-4 md:py-8 px-2 flex justify-center">
          <div className="bg-white shadow-xl print:shadow-none">
            <AjeerOfficialDocument
              permit={currentPermit}
              worker={currentWorker}
              issuingEst={currentIssuingEst}
              hostEst={currentHostEst}
              mohrsdLogoUrl={mohrsdLogoUrl}
              ajeerLogoUrl={ajeerLogoUrl}
              contractBrief={contractBrief}
              declarationsList={declarationsList}
              referenceNumber={currentPermit?.permitNumber}
            />
          </div>
        </div>

        {/* Quick Document Editor Modal */}
        {isDocEditorOpen && (
          <AjeerDocumentEditorModal
            permit={currentPermit}
            worker={currentWorker}
            issuingEst={currentIssuingEst}
            hostEst={currentHostEst}
            contractBrief={contractBrief}
            declarationsList={declarationsList}
            referenceNumber={currentPermit?.permitNumber}
            pageHeaderTitle={verifyPageTitle}
            pageHeaderSubtitle={verifyPageSubtitle}
            onSave={handleSaveDocEditor}
            onClose={() => setIsDocEditorOpen(false)}
          />
        )}
      </div>
    );
  }

  // 4. FULL ADMINISTRATIVE PORTAL (/admin) - PROTECTED
  // If not authenticated, redirect to /login
  if (route.view === 'admin' && !adminSession) {
    return (
      <AdminLogin
        hasInitializedAdmin={adminUserExists}
        onLogin={handleAdminLogin}
        onSetupFirstAdmin={handleSetupFirstAdmin}
        onSuccess={() => navigate('admin')}
      />
    );
  }

  return (
    <div className="bg-slate-100 min-h-screen">
      <Header
        settings={settings}
        onUpdateRole={(role: UserRole) => setSettings({ ...settings, currentRole: role })}
        onToggleMask={() => setSettings({ ...settings, maskSensitiveData: !settings.maskSensitiveData })}
        activeTab={activeTab}
        onOpenPublicVerify={() => navigate('verify', currentPermit?.permitNumber || currentPermit?.id)}
        onOpenDocument={() => navigate('document', selectedPermitId)}
        onLogout={handleLogout}
        adminUsername={adminSession?.user}
      />
      <Navigation
        activeTab={activeTab}
        onSelectTab={(tab) => setActiveTab(tab)}
        counts={{
          permits: permits.length,
          workers: workers.length,
          expiringPermits: expiringPermitsCount,
          inspections: inspections.length,
        }}
      />
      <main className="max-w-7xl mx-auto p-4 sm:p-6">
        {activeTab === 'dashboard' && (
          <Dashboard
            permits={permits}
            workers={workers}
            establishments={establishments}
            inspections={inspections}
            settings={settings}
            onOpenNewPermit={() => {
              setEditingPermit(null);
              setIsPermitModalOpen(true);
            }}
            onOpenNewWorker={() => {
              setEditingWorker(null);
              setIsWorkerModalOpen(true);
            }}
            onSelectPermitForPrint={(pmt) => {
              setSelectedPermitId(pmt.id);
              navigate('document', pmt.id);
            }}
            onSelectPermitForVerify={(pmt) => {
              navigate('verify', pmt.permitNumber);
            }}
            onNavigateTab={(tab) => setActiveTab(tab)}
          />
        )}
        {activeTab === 'permits' && (
          <PermitsList
            permits={permits}
            workers={workers}
            establishments={establishments}
            settings={settings}
            onOpenNewPermit={() => {
              setEditingPermit(null);
              setIsPermitModalOpen(true);
            }}
            onSelectPermitForPrint={(pmt) => {
              setSelectedPermitId(pmt.id);
              navigate('document', pmt.id);
            }}
            onSelectPermitForVerify={(pmt) => {
              navigate('verify', pmt.permitNumber);
            }}
            onEditPermit={(pmt) => {
              setEditingPermit(pmt);
              setIsPermitModalOpen(true);
            }}
            onDeletePermit={handleDeletePermit}
            onRenewPermit={handleRenewPermit}
            onRevokePermit={handleRevokePermit}
            onToggleDisableVerification={handleToggleDisableVerification}
          />
        )}
        {activeTab === 'workers' && (
          <WorkersList
            workers={workers}
            establishments={establishments}
            permits={permits}
            settings={settings}
            onOpenNewWorker={() => {
              setEditingWorker(null);
              setIsWorkerModalOpen(true);
            }}
            onEditWorker={(worker) => {
              setEditingWorker(worker);
              setIsWorkerModalOpen(true);
            }}
            onDeleteWorker={handleDeleteWorker}
            onArchiveWorker={handleArchiveWorker}
            onIssuePermitForWorker={(workerId) => {
              setEditingPermit({
                id: `pmt-${Date.now()}`,
                permitNumber: `AJR-2026-${Math.floor(10000 + Math.random() * 90000)}`,
                permitType: 'contractual',
                workerId,
                issuingEstablishmentId: establishments[0]?.id || '',
                hostEstablishmentId: establishments[1]?.id || establishments[0]?.id || '',
                authorizedProfession: workers.find((w) => w.id === workerId)?.profession || '',
                issueDate: new Date().toISOString().split('T')[0],
                expiryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000)
                  .toISOString()
                  .split('T')[0],
                status: 'active',
                verificationToken: `tok_${Math.random().toString(36).substring(2, 12)}`,
                verificationDisabled: false,
                workLocations: ['موقع العمل الميداني الرئيسي'],
                contractNumber: `CTR-SA-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
                securityHash: `SHA256:${Math.random().toString(36).slice(2, 12)}`,
                qrVerificationCode: '',
                conditionsAndTerms: settings.defaultTerms,
                createdAt: new Date().toISOString(),
              });
              setIsPermitModalOpen(true);
            }}
          />
        )}
        {activeTab === 'establishments' && (
          <EstablishmentsList
            establishments={establishments}
            permits={permits}
            settings={settings}
            onSaveEstablishment={handleSaveEstablishment}
            onDeleteEstablishment={handleDeleteEstablishment}
          />
        )}
        {activeTab === 'verify' && (
          <VerificationPortal
            permits={permits}
            workers={workers}
            establishments={establishments}
            settings={settings}
            selectedPermitNumber={selectedVerifyPermitNumber}
            onPrintPermit={(pmt) => {
              setSelectedPermitId(pmt.id);
              navigate('document', pmt.id);
            }}
            onAddInspection={handleAddInspection}
          />
        )}
        {activeTab === 'inspection' && (
          <FieldInspection
            inspections={inspections}
            permits={permits}
            workers={workers}
            settings={settings}
            onAddInspection={handleAddInspection}
            onSelectPermitForVerify={(pmt) => {
              setSelectedVerifyPermitNumber(pmt.permitNumber);
              setActiveTab('verify');
            }}
          />
        )}
        {activeTab === 'settings' && (
          <AdminSettings
            settings={settings}
            onUpdateSettings={(newSettings) => setSettings(newSettings)}
            onExportAllData={handleExportAllData}
            onImportData={handleImportData}
            onResetToDefaults={handleResetToDefaults}
            customAjeerLogoUrl={ajeerLogoUrl}
          />
        )}
        {activeTab === 'ajeer-api' && (
          <AjeerIntegration
            config={ajeerConfig}
            permits={permits}
            workers={workers}
            onUpdateConfig={(newConfig) => setAjeerConfig(newConfig)}
          />
        )}
        {activeTab === 'audit-report' && (
          <AuditReport onNavigateTab={(tab) => setActiveTab(tab)} />
        )}
      </main>

      {/* Global Modals for Full System Management */}
      {isPermitModalOpen && (
        <PermitModal
          permit={editingPermit}
          workers={workers}
          establishments={establishments}
          onSave={handleSavePermit}
          onClose={() => {
            setIsPermitModalOpen(false);
            setEditingPermit(null);
          }}
        />
      )}

      {isWorkerModalOpen && (
        <WorkerModal
          worker={editingWorker}
          establishments={establishments}
          onSave={handleSaveWorker}
          onClose={() => {
            setIsWorkerModalOpen(false);
            setEditingWorker(null);
          }}
        />
      )}
    </div>
  );
}
