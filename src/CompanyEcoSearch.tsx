import React, { useState, useMemo, useEffect } from 'react';
import { Search, Globe, FileText, Phone, Mail, ExternalLink, ShieldCheck, Zap, Info, Menu, X, Filter, Map, Satellite, Building2, GraduationCap, Users, Loader2 } from 'lucide-react';
import { supabase } from './lib/supabase';

// --- 类型定义 ---
type EntityType = '企业' | '高校/院所' | '甲方单位' | '生态伙伴';

interface Contact {
  name: string;
  title: string;
  email: string;
  phone: string;
}

interface Company {
  id: string;
  name: string;
  type: EntityType;
  logo: string;
  description: string;
  target_clients?: string;
  region?: string;
  sales_contact_name?: string;
  sales_contact_phone?: string;
  industry: '卫星导航' | '地理信息' | '遥感监测' | '时空大数据' | '终端研发' | '行业应用';
  serviceTags: string[];
  website: string;
  integrationStatus: '已合作' | '对接中' | '技术引领' | '试点项目';
  apiDocsUrl: string;
  mainContact: Contact;
  bgGradient: string;
}



const INDUSTRIES = ['全部', '卫星导航', '地理信息', '遥感监测', '时空大数据', '终端研发', '行业应用'];
const ENTITY_TYPES: EntityType[] = ['甲方单位', '高校/院所', '生态伙伴'];

// --- 组件定义 ---

const Badge = ({ children, variant = 'default' }: { children: React.ReactNode, variant?: 'default' | 'success' | 'warning' | 'info' | 'danger' }) => {
  const styles = {
    default: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    success: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-500/20',
    warning: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-500/20',
    info: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400 border border-sky-500/20',
    danger: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 border border-rose-500/20',
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${styles[variant]}`}>
      {children}
    </span>
  );
};

// --- 登录验证密钥 (from env vars) ---
const PARTNER_CREDS = {
  user: import.meta.env.VITE_PARTNER_USER || 'partner',
  pass: import.meta.env.VITE_PARTNER_PASS || 'eco2026',
};
const ADMIN_CREDS = {
  user: import.meta.env.VITE_ADMIN_USER || 'admin',
  pass: import.meta.env.VITE_ADMIN_PASS || 'beidou@2026',
};

// --- 登录弹窗组件 ---
function LoginModal({ title, subtitle, onSuccess, onCancel, correctUser, correctPass }: {
  title: string;
  subtitle: string;
  onSuccess: () => void;
  onCancel: () => void;
  correctUser: string;
  correctPass: string;
}) {
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [shake, setShake] = React.useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === correctUser && password === correctPass) {
      setError('');
      onSuccess();
    } else {
      setError('账号或密码错误，请重试');
      setShake(true);
      setTimeout(() => setShake(false), 600);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
      <div
        className={`w-full max-w-sm bg-white dark:bg-slate-900 rounded-[32px] p-10 shadow-2xl border border-slate-200 dark:border-slate-800 ${
          shake ? 'animate-[shake_0.5s_ease-in-out]' : ''
        }`}
        style={shake ? { animation: 'shake 0.5s ease-in-out' } : {}}
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-indigo-600 rounded-[20px] flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-500/30">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">{title}</h2>
          <p className="text-sm text-slate-500">{subtitle}</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">账号</label>
            <input
              type="text"
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="请输入账号"
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm font-medium"
            />
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">密码</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="请输入密码"
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm font-medium"
            />
          </div>
          {error && (
            <div className="flex items-center gap-2 text-rose-500 text-xs font-bold bg-rose-50 dark:bg-rose-900/20 px-4 py-3 rounded-xl">
              <X className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-xl text-sm font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
            >
              取消
            </button>
            <button
              type="submit"
              className="flex-1 py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 transition-all"
            >
              登录
            </button>
          </div>
        </form>

        <p className="mt-6 text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest">
          内部系统 · 授权访问
        </p>
      </div>
    </div>
  );
}

export default function CompanyEcoSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('全部');
  const [selectedType, setSelectedType] = useState<EntityType | '全部'>('全部');
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [adminActiveTab, setAdminActiveTab] = useState<'overview' | 'submissions' | 'directory' | 'settings'>('overview');
  const [adminSearchQuery, setAdminSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [pendingSubmissions, setPendingSubmissions] = useState<any[]>([]);

  // --- 登录验证状态 (sessionStorage 跨刷新持久) ---
  const [isSubmissionAuthed, setIsSubmissionAuthed] = useState(
    () => sessionStorage.getItem('eco_partner_authed') === 'true'
  );
  const [isAdminAuthed, setIsAdminAuthed] = useState(
    () => sessionStorage.getItem('eco_admin_authed') === 'true'
  );
  const [loginGate, setLoginGate] = useState<'submission' | 'admin' | null>(null);

  const [settings, setSettings] = useState({
    allowSubmissions: true,
    autoApprove: false
  });
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);

  // --- Supabase 数据初始化 ---
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      
      // 1. 获取正式目录
      const { data: companiesData, error: companiesError } = await supabase
        .from('companies')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (companiesError) throw companiesError;

      // 只显示数据库中的真实数据，移除自动种子导入以防重复
      setCompanies(companiesData.map(c => {
        let extra = { core_biz: c.description, target_clients: '', region: '', doc_link: '', sales_contact_name: '', sales_contact_phone: '' };
        try {
          if (c.description && c.description.trim().startsWith('{')) {
            extra = JSON.parse(c.description);
          }
        } catch(e) {}
        
        return {
          ...c,
          logo: c.logo_url || `https://api.dicebear.com/7.x/initials/svg?seed=${c.name}&backgroundColor=6366f1`,
          serviceTags: c.service_tags || [],
          integrationStatus: c.integration_status as any,
          bgGradient: c.bg_gradient || 'from-indigo-600/20 to-blue-600/20',
          mainContact: c.main_contact || { name: '未知', title: '联系人', email: '', phone: '' },
          description: extra.core_biz || c.description,
          target_clients: extra.target_clients || '',
          region: extra.region || '',
          sales_contact_name: extra.sales_contact_name || '',
          sales_contact_phone: extra.sales_contact_phone || '',
          apiDocsUrl: c.apiDocsUrl || extra.doc_link || '#'
        };
      }));

      // 2. 获取待审核提报
      const { data: subsData, error: subsError } = await supabase
        .from('submissions')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });
      
      if (subsError) throw subsError;
      setPendingSubmissions(subsData.map(s => {
        let extra = { core_biz: s.description, target_clients: '', region: '', website: '', doc_link: '', sales_contact_name: '', sales_contact_phone: '' };
        try {
          if (s.description && s.description.trim().startsWith('{')) {
            extra = JSON.parse(s.description);
          }
        } catch(e) {}
        
        return {
          id: s.id,
          name: s.name,
          type: s.type,
          contact: `${s.contact_name} (${s.contact_phone})`,
          contact_name: s.contact_name,
          contact_phone: s.contact_phone,
          industries: s.industries || [],
          description: extra.core_biz || s.description,
          target_clients: extra.target_clients || '-',
          region: extra.region || '-',
          website: extra.website || '-',
          doc_link: extra.doc_link || '-',
          sales_contact_name: extra.sales_contact_name || '-',
          sales_contact_phone: extra.sales_contact_phone || '-',
          date: new Date(s.created_at).toISOString().split('T')[0]
        };
      }));

      // 3. 获取系统设置
      const { data: settingsData } = await supabase
        .from('system_settings')
        .select('*')
        .eq('key', 'portal_config')
        .single();
      
      if (settingsData) {
        setSettings(settingsData.value);
      }

    } catch (err) {
      console.error('Failed to fetch data from Supabase:', err);
    } finally {
      setLoading(false);
    }
  };



  // --- 提交按钮处理 ---
  const handleSubmitNewResource = async (formData: any) => {
    try {
      const extraData = {
        core_biz: formData.core_biz,
        target_clients: formData.target_clients || '',
        region: formData.region || '',
        website: formData.website || '',
        doc_link: formData.doc_link || '',
        sales_contact_name: formData.sales_contact_name || '',
        sales_contact_phone: formData.sales_contact_phone || ''
      };

      const newSubmission = {
        name: formData.unit_name,
        type: formData.entity_type,
        industries: formData.industries || [],
        description: JSON.stringify(extraData),
        contact_name: formData.biz_contact_name,
        contact_phone: formData.biz_contact_phone,
        status: 'pending'
      };
      
      const { error } = await supabase.from('submissions').insert([newSubmission]);
      if (error) throw error;

      setIsSubmitted(true);
      fetchInitialData();
      setTimeout(() => {
        setIsSubmitModalOpen(false);
        setIsSubmitted(false);
      }, 2000);
    } catch (err) {
      console.error('Submission failed:', err);
      alert('提交失败，请检查网络或配置');
    }
  };

  // --- 审批逻辑 ---
  const handleApprove = async (sub: any) => {
    try {
      const parsedDesc = {
        core_biz: sub.description,
        target_clients: sub.target_clients,
        region: sub.region,
        sales_contact_name: sub.sales_contact_name,
        sales_contact_phone: sub.sales_contact_phone,
        doc_link: sub.doc_link
      };

      const newCompany = {
        name: sub.name,
        type: sub.type,
        industry: sub.industries[0] || '卫星导航',
        service_tags: sub.industries,
        website: sub.website !== '-' ? sub.website : '',
        description: JSON.stringify(parsedDesc),
        integration_status: '对接中', // Updated default status to something more realistic
        logo_url: `https://api.dicebear.com/7.x/initials/svg?seed=${sub.name}&backgroundColor=6366f1`,
        main_contact: { 
          name: sub.contact_name, 
          title: '生态接口人', 
          email: '', 
          phone: sub.contact_phone 
        }
      };

      const { error: insertError } = await supabase.from('companies').insert([newCompany]);
      if (insertError) throw insertError;

      const { error: updateError } = await supabase
        .from('submissions')
        .update({ status: 'approved' })
        .eq('id', sub.id);
      
      if (updateError) throw updateError;

      fetchInitialData();
      setIsAdminMode(false); // 审批通过后跳回生态全景页
    } catch (err) {
      console.error('Approval failed:', err);
    }
  };

  const handleReject = async (id: string) => {
    try {
      const { error } = await supabase
        .from('submissions')
        .update({ status: 'rejected' })
        .eq('id', id);
      
      if (error) throw error;
      fetchInitialData();
    } catch (err) {
      console.error('Rejection failed:', err);
    }
  };

  // --- 统计数据 ---
  const stats = useMemo(() => [
    { label: '入库公司', val: companies.length, sub: '实时同步', color: 'text-indigo-600' }
  ], [companies]);

  const filteredCompanies = useMemo(() => {
    return companies.filter(c => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = c.name.toLowerCase().includes(q) || 
                          c.description.toLowerCase().includes(q) ||
                          c.industry.toLowerCase().includes(q) ||
                          c.type.toLowerCase().includes(q) ||
                          (c.website && c.website.toLowerCase().includes(q)) ||
                          (c.mainContact && c.mainContact.name.toLowerCase().includes(q)) ||
                          c.serviceTags.some(tag => tag.toLowerCase().includes(q));
      const matchesIndustry = selectedIndustry === '全部' || c.industry === selectedIndustry;
      const matchesType = selectedType === '全部' || c.type === selectedType;
      return matchesSearch && matchesIndustry && matchesType;
    });
  }, [searchQuery, selectedIndustry, selectedType, companies]);

  const getStatusVariant = (status: string) => {
    switch (status) {
      case '已合作': return 'success';
      case '技术引领': return 'info';
      case '试点项目': return 'danger';
      case '对接中': return 'warning';
      default: return 'default';
    }
  };

  const getTypeIcon = (type: EntityType) => {
    switch (type) {
      case '企业': return <Building2 className="w-4 h-4" />;
      case '高校/院所': return <GraduationCap className="w-4 h-4" />;
      case '甲方单位': return <Users className="w-4 h-4" />;
      case '生态伙伴': return <Satellite className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
        <p className="text-slate-500 font-bold animate-pulse">正在连接北斗时空云服务...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-blue-500/30">
      {/* 导航栏 */}
      <nav className="sticky top-0 z-40 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <Satellite className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight">北斗 <span className="text-indigo-600 italic">时空态势门户</span></span>
            </div>
            
            <div className="hidden md:flex items-center gap-8">
              <a href="#" className="text-sm font-medium hover:text-indigo-600 transition-colors flex items-center gap-1.5"><Map className="w-4 h-4" />生态全景</a>
              <button 
                onClick={() => {
                  if (isAdminMode) {
                    setIsAdminMode(false);
                  } else if (isAdminAuthed) {
                    setIsAdminMode(true);
                  } else {
                    setLoginGate('admin');
                  }
                }}
                className={`text-sm font-bold transition-all px-3 py-1.5 rounded-lg border-2 ${
                  isAdminMode 
                  ? 'text-amber-600 bg-amber-50 border-amber-200 shadow-sm' 
                  : 'text-slate-500 hover:text-indigo-600 border-transparent'
                }`}
              >
                {isAdminMode ? '退出管理' : '管理控制台'}
              </button>
              {settings.allowSubmissions && (
                <button 
                  onClick={() => {
                    if (isSubmissionAuthed) {
                      setIsSubmitModalOpen(true);
                    } else {
                      setLoginGate('submission');
                    }
                  }}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-500/10"
                >
                  资源提报
                </button>
              )}
            </div>

            <button 
              className="md:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </nav>

      {/* 登录验证弹窗 */}
      {loginGate === 'submission' && (
        <LoginModal
          title="资源提报登录"
          subtitle="请输入授权账号和密码以提交生态资源"
          correctUser={PARTNER_CREDS.user}
          correctPass={PARTNER_CREDS.pass}
          onCancel={() => setLoginGate(null)}
          onSuccess={() => {
            sessionStorage.setItem('eco_partner_authed', 'true');
            setIsSubmissionAuthed(true);
            setLoginGate(null);
            setIsSubmitModalOpen(true);
          }}
        />
      )}
      {loginGate === 'admin' && (
        <LoginModal
          title="管理控制台登录"
          subtitle="内部系统 · 仅授权管理员访问"
          correctUser={ADMIN_CREDS.user}
          correctPass={ADMIN_CREDS.pass}
          onCancel={() => setLoginGate(null)}
          onSuccess={() => {
            sessionStorage.setItem('eco_admin_authed', 'true');
            setIsAdminAuthed(true);
            setLoginGate(null);
            setIsAdminMode(true);
          }}
        />
      )}

      {/* 资源提报页面 (全屏布局) */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-[60] bg-slate-50 dark:bg-slate-950 overflow-y-auto animate-in slide-in-from-bottom duration-300">
          <div className="w-full max-w-4xl mx-auto py-12 px-4 sm:px-6 relative">
            <button 
              type="button"
              onClick={() => setIsSubmitModalOpen(false)}
              className="absolute top-4 right-4 sm:top-8 sm:right-8 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:bg-rose-500 hover:text-white hover:border-rose-500 transition-all transform active:scale-95 z-10"
            >
              <X className="w-6 h-6" />
            </button>

            {isSubmitted ? (
              <div className="py-20 text-center animate-in fade-in duration-500">
                <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-8 border-4 border-emerald-50 shadow-xl">
                  <ShieldCheck className="w-12 h-12 text-emerald-600" />
                </div>
                <h2 className="text-3xl font-black mb-4">提报已成功提交!</h2>
                <p className="text-slate-500 text-lg">您的资源已进入后台审核队列，我们将在24小时内联系您。</p>
              </div>
            ) : (
              <>
                <div className="mb-10 text-center md:text-left">
                  <h2 className="text-3xl font-black tracking-tight mb-2 text-indigo-900 dark:text-white">生态资源提报</h2>
                  <p className="text-slate-500">
                    请提供单位的核心技术与协作意向，通过审核后将正式录入“北斗时空信息生态图谱”。
                  </p>
                </div>

                <form onSubmit={(e) => {
                  e.preventDefault();
                  const fd = new FormData(e.currentTarget);
                  const data = Object.fromEntries(fd.entries());
                  handleSubmitNewResource({
                    ...data,
                    industries: Array.from(fd.getAll('industries'))
                  });
                }} className="space-y-6">
                  {/* 基本信息 */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-black text-indigo-500 uppercase tracking-widest flex items-center gap-2">
                       <Building2 className="w-4 h-4" /> 基本情报
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">单位名称 *</label>
                        <input 
                          required
                          name="unit_name"
                          type="text" 
                          placeholder="例如：某某时空科技" 
                          className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">实体类型 *</label>
                        <select name="entity_type" required className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all appearance-none">
                          {ENTITY_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">主要服务对象 (选填)</label>
                        <input 
                          name="target_clients"
                          type="text" 
                          placeholder="例如：应急管理部, 测绘单位, 车联企业..." 
                          className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">业务覆盖区域 (选填)</label>
                        <input 
                          name="region"
                          type="text" 
                          placeholder="例如：全国、长三角、亚太地区..." 
                          className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">单位官网 (选填)</label>
                        <input 
                          name="website"
                          type="url" 
                          placeholder="https://..." 
                          className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">产品/方案资料链接 (选填)</label>
                        <input 
                          name="doc_link"
                          type="url" 
                          placeholder="网盘或在线文档链接" 
                          className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 核心能力 */}
                  <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <h3 className="text-sm font-black text-indigo-500 uppercase tracking-widest flex items-center gap-2">
                       <Zap className="w-4 h-4" /> 核心业务
                    </h3>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">专业领域 (多选) *</label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2">
                        {INDUSTRIES.filter(i => i !== '全部').map(industry => (
                          <label key={industry} className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                            <input name="industries" type="checkbox" value={industry} className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                            <span className="text-xs font-bold">{industry}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">业务简介与合作诉求 *</label>
                      <textarea 
                        name="core_biz"
                        required
                        rows={8}
                        placeholder="支持多行文本，请详细描述单位在北斗时空领域的技术优势、核心产品及期望在生态圈内达成什么样的合作...\n（支持分段）" 
                        className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-y"
                      ></textarea>
                    </div>
                  </div>

                  {/* 联系人信息 */}
                  <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <h3 className="text-sm font-black text-indigo-500 uppercase tracking-widest flex items-center gap-2">
                       <Users className="w-4 h-4" /> 联系窗口
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-slate-50/50 dark:bg-slate-800/20 p-6 rounded-[24px] space-y-4 border border-slate-100 dark:border-slate-800">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">技术专家/接口人 *</span>
                        <div className="space-y-3">
                          <input name="biz_contact_name" required type="text" placeholder="技术负责人姓名" className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm" />
                          <input name="biz_contact_phone" required type="text" placeholder="手机/邮箱 (技术对接)" className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm" />
                        </div>
                      </div>
                      
                      <div className="bg-slate-50/50 dark:bg-slate-800/20 p-6 rounded-[24px] space-y-4 border border-slate-100 dark:border-slate-800">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">商务/销售负责人 (选填)</span>
                        <div className="space-y-3">
                          <input name="sales_contact_name" type="text" placeholder="商务负责人姓名" className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm" />
                          <input name="sales_contact_phone" type="text" placeholder="商务联系电话" className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 flex flex-col sm:flex-row gap-4">
                    <button 
                      type="button"
                      onClick={() => setIsSubmitModalOpen(false)}
                      className="w-full sm:w-1/3 py-5 bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl font-black uppercase text-sm tracking-widest hover:bg-slate-300 dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-2"
                    >
                      <X className="w-5 h-5" /> 取消提交
                    </button>
                    <button 
                      type="submit"
                      className="w-full sm:w-2/3 py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase text-sm tracking-widest hover:bg-indigo-700 shadow-xl shadow-indigo-500/20 active:scale-95 transition-all flex items-center justify-center gap-3"
                    >
                      提交审核
                      <ShieldCheck className="w-5 h-5" />
                    </button>
                  </div>
                  <p className="mt-4 text-[10px] text-center text-slate-400 uppercase font-black tracking-widest">
                    提交即表示同意北斗生态合作伙伴合规性声明
                  </p>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {/* 管理控制台面板 (全功能设计) */}
      {isAdminMode && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in slide-in-from-top-4 duration-500">
          <div className="bg-white dark:bg-slate-900 border-2 border-amber-200 dark:border-amber-800/50 rounded-[40px] shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[600px]">
            {/* 侧边导航 */}
            <aside className="w-full md:w-64 bg-slate-50 dark:bg-slate-950/50 border-r border-slate-200 dark:border-slate-800 p-6 flex flex-col gap-2">
              <div className="mb-8 px-2">
                <h2 className="text-xl font-black text-amber-600 flex items-center gap-2">
                  <ShieldCheck className="w-6 h-6" /> 管理后台
                </h2>
              </div>
              
              {[
                { id: 'overview', label: '概览指标', icon: <Zap className="w-4 h-4" /> },
                { id: 'submissions', label: '提报审核', icon: <FileText className="w-4 h-4" />, count: pendingSubmissions.length },
                { id: 'directory', label: '资源目录', icon: <Map className="w-4 h-4" /> },
                { id: 'settings', label: '系统设置', icon: <Menu className="w-4 h-4" /> },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setAdminActiveTab(tab.id as any)}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                    adminActiveTab === tab.id 
                    ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-900 dark:text-amber-100 shadow-sm' 
                    : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {tab.icon}
                    {tab.label}
                  </div>
                  {tab.count !== undefined && (
                    <span className="bg-amber-600 text-white text-[10px] px-2 py-0.5 rounded-full">{tab.count}</span>
                  )}
                </button>
              ))}
              
              <div className="mt-auto pt-6 border-t border-slate-200 dark:border-slate-800 px-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">当前节点</p>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Cluster-01 / Normal
                </div>
              </div>
            </aside>

            {/* 主内容区 */}
            <main className="flex-grow p-8 overflow-y-auto">
              {/* --- 概览指标 --- */}
              {adminActiveTab === 'overview' && (
                <div className="animate-in fade-in duration-500">
                  <h3 className="text-2xl font-black mb-8 flex items-center gap-3">数据实时概览</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                     {stats.map((stat, i) => (
                       <div key={i} className="p-6 bg-slate-50 dark:bg-slate-950/30 rounded-3xl border border-slate-100 dark:border-slate-800">
                         <div className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">{stat.label}</div>
                         <div className={`text-3xl font-black mb-1 ${stat.color}`}>{stat.val}</div>
                         <div className="text-[10px] font-bold text-slate-500">{stat.sub}</div>
                       </div>
                     ))}
                  </div>
                  
                  <div className="bg-slate-50 dark:bg-slate-950/30 rounded-3xl p-8 border border-slate-100 dark:border-slate-800">
                    <h4 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-6">生态入库增长趋势</h4>
                    <div className="h-48 w-full flex items-end gap-2 px-2">
                      {/* Calculate trend based on total companies for logical consistency */}
                      {[0.1, 0.25, 0.2, 0.4, 0.3, 0.5, 0.6, 0.55, 0.7, 0.85, 0.9, 1.0].map((ratio, i) => {
                        const val = Math.max(1, Math.round(companies.length * ratio));
                        return (
                          <div key={i} className="flex-grow bg-indigo-500/20 hover:bg-indigo-500/40 rounded-t-lg transition-all relative group" style={{ height: `${ratio * 100}%` }}>
                             <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">节点:{val}</div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex justify-between mt-4 text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">
                      <span>2025 Q1</span>
                      <span>2025 Q2</span>
                      <span>2025 Q3</span>
                      <span>2025 Q4</span>
                      <span>2026 Q1</span>
                    </div>
                  </div>
                </div>
              )}

              {/* --- 提报审核 --- */}
              {adminActiveTab === 'submissions' && (
                <div className="animate-in fade-in duration-500">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-2xl font-black flex items-center gap-3">资源提报审核</h3>
                    <div className="flex gap-2">
                      <button className="px-4 py-2 bg-amber-50 dark:bg-amber-900/20 text-amber-600 text-xs font-black rounded-xl border border-amber-200">批量驳回</button>
                      <button className="px-4 py-2 bg-amber-600 text-white text-xs font-black rounded-xl hover:bg-amber-700 shadow-lg">一键采纳</button>
                    </div>
                  </div>
                  <div className="space-y-6">
                    {pendingSubmissions.map(sub => (
                      <div key={sub.id} className="bg-white dark:bg-slate-900 rounded-[24px] p-6 border border-slate-200 dark:border-slate-800 hover:shadow-xl transition-all group">
                        <div className="flex flex-col md:flex-row justify-between gap-6">
                           <div className="flex-grow">
                             <div className="flex items-center gap-3 mb-3">
                               <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-black rounded uppercase">{sub.type}</span>
                               <span className="text-[10px] font-bold text-slate-400">{sub.date}</span>
                             </div>
                             <h4 className="text-xl font-black mb-4 group-hover:text-amber-600 transition-colors">{sub.name}</h4>
                             
                             <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                               <div><span className="text-[10px] font-black uppercase text-slate-400 block mb-1">主要服务对象</span><span className="text-xs font-bold text-slate-700 dark:text-slate-300">{sub.target_clients !== '-' ? sub.target_clients : '未填'}</span></div>
                               <div><span className="text-[10px] font-black uppercase text-slate-400 block mb-1">业务覆盖区域</span><span className="text-xs font-bold text-slate-700 dark:text-slate-300">{sub.region !== '-' ? sub.region : '未填'}</span></div>
                               <div><span className="text-[10px] font-black uppercase text-slate-400 block mb-1">官网</span>{sub.website !== '-' ? <a href={sub.website} target="_blank" rel="noreferrer" className="text-xs font-bold text-indigo-600 hover:underline truncate block">{sub.website}</a> : <span className="text-xs text-slate-400">未填</span>}</div>
                               <div><span className="text-[10px] font-black uppercase text-slate-400 block mb-1">产品/资料链接</span>{sub.doc_link !== '-' ? <a href={sub.doc_link} target="_blank" rel="noreferrer" className="text-xs font-bold text-indigo-600 hover:underline truncate block">{sub.doc_link}</a> : <span className="text-xs text-slate-400">未填</span>}</div>
                             </div>

                             <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl mb-4 border border-slate-100 dark:border-slate-800/50">
                               <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">“{sub.description}”</p>
                             </div>
                             
                             <div className="flex flex-wrap gap-2">
                               {sub.industries.map((tag: string) => <span key={tag} className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-[10px] font-bold rounded-lg text-slate-500"># {tag}</span>)}
                             </div>
                           </div>
                           <div className="md:w-56 flex flex-col justify-between border-l border-slate-100 dark:border-slate-800 pl-6">
                              <div className="space-y-4 mb-4">
                                <div>
                                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1 flex items-center gap-1"><Zap className="w-3 h-3"/> 高级技术对接</span>
                                  <div className="text-xs font-bold text-slate-700 dark:text-slate-300">{sub.contact_name}</div>
                                  <div className="text-xs text-slate-500">{sub.contact_phone}</div>
                                </div>
                                {(sub.sales_contact_name !== '-' || sub.sales_contact_phone !== '-') && (
                                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1 flex items-center gap-1"><Users className="w-3 h-3"/> 商务/销售</span>
                                    <div className="text-xs font-bold text-slate-700 dark:text-slate-300">{sub.sales_contact_name !== '-' ? sub.sales_contact_name : '未填'}</div>
                                    <div className="text-xs text-slate-500">{sub.sales_contact_phone !== '-' ? sub.sales_contact_phone : '未填'}</div>
                                  </div>
                                )}
                              </div>
                              <div className="flex gap-3 mt-4">
                                <button 
                                  onClick={() => handleReject(sub.id)}
                                  className="flex-grow py-3 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-xl text-xs font-black hover:bg-rose-500 hover:text-white transition-all"
                                >
                                  驳回
                                </button>
                                <button 
                                  onClick={() => handleApprove(sub)}
                                  className="flex-grow py-3 bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded-xl text-xs font-black hover:bg-amber-600 hover:text-white transition-all"
                                >
                                  采纳
                                </button>
                              </div>
                           </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* --- 资源目录管理 --- */}
              {adminActiveTab === 'directory' && (
                <div className="animate-in fade-in duration-500">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <h3 className="text-2xl font-black">正式目录管理</h3>
                    <div className="relative">
                       <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                       <input 
                         type="text" 
                         placeholder="过滤目录条目..." 
                         className="pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-xl text-sm outline-none w-64 focus:ring-2 focus:ring-amber-500"
                         value={adminSearchQuery}
                         onChange={(e) => setAdminSearchQuery(e.target.value)}
                       />
                    </div>
                  </div>
                  
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[28px] overflow-hidden">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-slate-950/50 border-b border-slate-100 dark:border-slate-800">
                          <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">单位名称</th>
                          <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">类型</th>
                          <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">行业</th>
                          <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">状态</th>
                          <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">操作</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {companies.filter(c => c.name.toLowerCase().includes(adminSearchQuery.toLowerCase())).map(company => (
                          <tr key={company.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                            <td className="px-6 py-4 font-bold text-sm">{company.name}</td>
                            <td className="px-6 py-4"><span className="text-[10px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">{company.type}</span></td>
                            <td className="px-6 py-4 text-xs font-medium text-slate-600 dark:text-slate-400">{company.industry}</td>
                            <td className="px-6 py-4">
                              <select 
                                value={company.integrationStatus}
                                onChange={async (e) => {
                                  const newStatus = e.target.value;
                                  try {
                                    const { error } = await supabase
                                      .from('companies')
                                      .update({ integration_status: newStatus })
                                      .eq('id', company.id);
                                    if (error) throw error;
                                    fetchInitialData();
                                  } catch (err) {
                                    console.error('Update status failed:', err);
                                  }
                                }}
                                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-[10px] font-black px-2 py-1 outline-none focus:ring-1 focus:ring-amber-500 transition-all cursor-pointer"
                              >
                                {['已合作', '技术引领', '试点项目', '对接中'].map(s => (
                                  <option key={s} value={s}>{s}</option>
                                ))}
                              </select>
                            </td>
                            <td className="px-6 py-4">
                              <button 
                                onClick={() => setEditingCompany(company)}
                                className="text-amber-600 hover:text-amber-700 font-bold text-xs uppercase tracking-widest"
                              >
                                编辑
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* --- 系统设置 --- */}
              {adminActiveTab === 'settings' && (
                <div className="animate-in fade-in duration-500">
                  <h3 className="text-2xl font-black mb-8">门户系统配置</h3>
                  <div className="space-y-8 max-w-2xl">
                    <div className="flex items-center justify-between p-6 bg-slate-50 dark:bg-slate-950/30 rounded-3xl border border-slate-100 dark:border-slate-800">
                      <div>
                        <div className="font-black text-sm mb-1 uppercase tracking-tight">对外资源提报开关</div>
                        <div className="text-xs text-slate-400">关闭后前端提报入口将临时隐藏</div>
                      </div>
                      <button 
                        onClick={async () => {
                          const newSettings = { ...settings, allowSubmissions: !settings.allowSubmissions };
                          try {
                            const { error } = await supabase
                              .from('system_settings')
                              .upsert({ key: 'portal_config', value: newSettings });
                            if (error) throw error;
                            fetchInitialData();
                          } catch (err) {
                            console.error('Update settings failed:', err);
                          }
                        }}
                        className={`w-12 h-6 rounded-full relative transition-all duration-300 ${settings.allowSubmissions ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-800'}`}
                      >
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${settings.allowSubmissions ? 'right-1' : 'left-1'}`} />
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between p-6 bg-slate-50 dark:bg-slate-950/30 rounded-3xl border border-slate-100 dark:border-slate-800">
                      <div>
                        <div className="font-black text-sm mb-1 uppercase tracking-tight">自动入库模式</div>
                        <div className="text-xs text-slate-400">开启后提报资源将跳过审核直接发布 (不推荐)</div>
                      </div>
                      <button 
                        onClick={async () => {
                          const newSettings = { ...settings, autoApprove: !settings.autoApprove };
                          try {
                            const { error } = await supabase
                              .from('system_settings')
                              .upsert({ key: 'portal_config', value: newSettings });
                            if (error) throw error;
                            fetchInitialData();
                          } catch (err) {
                            console.error('Update settings failed:', err);
                          }
                        }}
                        className={`w-12 h-6 rounded-full relative transition-all duration-300 ${settings.autoApprove ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-800'}`}
                      >
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${settings.autoApprove ? 'right-1' : 'left-1'}`} />
                      </button>
                    </div>

                    <div className="p-8 bg-amber-50 dark:bg-amber-900/10 rounded-3xl border-2 border-dashed border-amber-200 dark:border-amber-800">
                      <div className="flex items-center gap-3 mb-4">
                        <Info className="w-5 h-5 text-amber-600" />
                        <h4 className="font-black text-sm uppercase text-amber-900 dark:text-amber-100">数据备份提请</h4>
                      </div>
                      <p className="text-xs text-amber-700/80 dark:text-amber-400/80 mb-6 leading-relaxed">
                        管理员可以定期导出全量生态数据。包含脱敏后的联系人信息与合作意向。
                      </p>
                      <button className="px-6 py-3 bg-amber-600 text-white rounded-xl text-xs font-black hover:bg-amber-700 shadow-xl shadow-amber-600/20 transition-all w-full md:w-auto">
                        导出全量数据 (.XLSX)
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </main>
          </div>
        </div>
      )}

      {/* 头部区域 */}
      <header className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="mb-10 text-center md:text-left animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 text-xs font-bold mb-6 uppercase tracking-widest">
            专业的时空信息生态系统
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-900 via-indigo-600 to-slate-900 dark:from-white dark:via-indigo-400 dark:to-slate-400">
            北斗时空信息生态图谱
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl">
            汇聚行业领军企业、顶尖高校实验室、高价值甲方单位及核心生态伙伴。
            构建涵盖卫星定位、GIS、遥感、时空大数据的全产业链协同网络。
          </p>
        </div>

        {/* 综合过滤区域 */}
        <div className="space-y-6 mb-12">
          {/* 搜索框 */}
          <div className="relative group max-w-3xl">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            <input 
              type="text" 
              placeholder="搜索单位名称、研究领域、产品或技术标签..." 
              className="w-full pl-14 pr-4 py-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[24px] shadow-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 text-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            {/* 实体类型切换 */}
            <div className="flex-shrink-0">
              <span className="block text-xs font-bold text-slate-400 uppercase mb-3 ml-1">实体类型</span>
              <div className="flex p-1 bg-slate-100 dark:bg-slate-900 rounded-xl gap-1">
                <button 
                  onClick={() => setSelectedType('全部')}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${selectedType === '全部' ? 'bg-white dark:bg-slate-800 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:text-indigo-500'}`}
                >
                  全部
                </button>
                {ENTITY_TYPES.map(type => (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type)}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${selectedType === type ? 'bg-white dark:bg-slate-800 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:text-indigo-500'}`}
                  >
                    {getTypeIcon(type)}
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* 行业分类横向滚动 */}
            <div className="overflow-hidden">
              <span className="block text-xs font-bold text-slate-400 uppercase mb-3 ml-1">专业领域</span>
              <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                {INDUSTRIES.map(industry => (
                  <button
                    key={industry}
                    onClick={() => setSelectedIndustry(industry)}
                    className={`px-5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
                      selectedIndustry === industry 
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' 
                      : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-indigo-300 dark:hover:border-indigo-700'
                    }`}
                  >
                    {industry}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 列表页脚 */}
        <div className="flex items-center justify-between mb-8 border-b border-slate-200 dark:border-slate-800 pb-4">
          <p className="text-sm font-medium text-slate-500">
            为您匹配到 <span className="text-indigo-600 dark:text-indigo-400 font-bold">{filteredCompanies.length}</span> 个关键节点
          </p>
          <div className="flex items-center gap-2 text-sm text-indigo-600 font-semibold cursor-pointer hover:underline">
            <Filter className="w-4 h-4" />
            高级地理围栏筛选
          </div>
        </div>

        {/* 结果显示网格 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCompanies.map(company => (
            <div 
              key={company.id}
              onClick={() => setSelectedCompany(company)}
              className="group relative overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[32px] p-7 transition-all hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-1.5 cursor-pointer animate-in fade-in zoom-in-95 duration-500"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${company.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity`} />
              
              <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-start justify-between mb-6">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-xl border border-white/50 bg-white p-1">
                    <img src={company.logo} alt={company.name} className="w-full h-full object-contain" />
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge variant={getStatusVariant(company.integrationStatus)}>
                      {company.integrationStatus}
                    </Badge>
                    <span className="flex items-center gap-1.5 text-[10px] font-black uppercase text-slate-400 tracking-tighter">
                      {getTypeIcon(company.type)}
                      {company.type}
                    </span>
                  </div>
                </div>
                
                <h3 className="text-lg font-extrabold mb-3 group-hover:text-indigo-600 transition-colors tracking-tight leading-tight line-clamp-2">
                  {company.name}
                </h3>
                
                <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-2 mb-6 leading-relaxed flex-grow">
                  {company.description}
                </p>
                
                <div className="flex flex-wrap gap-2 mb-6">
                  {company.serviceTags.map(tag => (
                    <span key={tag} className="px-2.5 py-1 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100/50 dark:border-indigo-800/10 rounded-lg text-[10px] font-bold text-indigo-500 uppercase tracking-wide">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-sm font-bold text-indigo-600 group-hover:underline">
                  查看技术脉络
                  <ExternalLink className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 空状态 */}
        {filteredCompanies.length === 0 && (
          <div className="py-24 text-center bg-white dark:bg-slate-900 rounded-[40px] border-2 border-dashed border-slate-200 dark:border-slate-800 transform transition-all">
            <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Map className="w-10 h-10 text-indigo-400" />
            </div>
            <h3 className="text-2xl font-black mb-3 text-slate-800 dark:text-white uppercase tracking-tight">未探测到库内节点</h3>
            <p className="text-slate-500 max-w-sm mx-auto">请调整您的波段筛选或搜索词，或联系管理员录入新单位。</p>
          </div>
        )}
      </header>

      {/* 详情浮窗 */}
      {selectedCompany && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md">
          <div className="w-full max-w-4xl max-h-[95vh] overflow-y-auto bg-white dark:bg-slate-900 rounded-[40px] p-10 relative shadow-2xl animate-in fade-in zoom-in-95 duration-300">
            <button 
              onClick={() => setSelectedCompany(null)}
              className="absolute top-8 right-8 p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-500 hover:text-white transition-all transform active:scale-95 z-10"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pt-6">
              {/* 基本情报 (8 columns on lg) */}
              <div className="lg:col-span-12 xl:col-span-7 flex flex-col items-center md:items-start text-center md:text-left">
                <div className="flex flex-col md:flex-row items-center gap-6 mb-8">
                  <div className="w-24 h-24 rounded-3xl overflow-hidden shadow-2xl border-4 border-indigo-50 bg-white p-2">
                    <img src={selectedCompany.logo} alt="" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-3">
                      <Badge variant="success">{selectedCompany.type}</Badge>
                      <Badge variant="info">{selectedCompany.industry}</Badge>
                    </div>
                    <h2 className="text-4xl font-black uppercase tracking-tight text-slate-900 dark:text-white leading-[1.1]">{selectedCompany.name}</h2>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full mb-6">
                   <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-[24px] border border-slate-100 dark:border-slate-800/50">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5"><Map className="w-3 h-3"/> 业务覆盖区域</h4>
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{selectedCompany.region || '—'}</p>
                   </div>
                   <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-[24px] border border-slate-100 dark:border-slate-800/50">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5"><Users className="w-3 h-3"/> 主要服务对象</h4>
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{selectedCompany.target_clients || '—'}</p>
                   </div>
                </div>

                <div className="w-full bg-slate-50 dark:bg-slate-800/20 p-8 rounded-[32px] mb-8 border border-slate-100 dark:border-slate-800/50">
                  <h4 className="text-xs font-black text-indigo-500 uppercase tracking-widest mb-4">核心研究/业务方向</h4>
                  <p className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed font-medium italic">
                    “{selectedCompany.description}”
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                  <a href={selectedCompany.website} target="_blank" className="flex items-center justify-between p-4 bg-indigo-50 dark:bg-indigo-900/10 rounded-2xl border border-indigo-100 dark:border-indigo-800/50 group hover:bg-indigo-600 hover:text-white transition-all">
                    <div className="flex items-center gap-3">
                      <Globe className="w-5 h-5" />
                      <span className="font-bold text-sm">官方入口</span>
                    </div>
                    <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100" />
                  </a>
                  <a href={selectedCompany.apiDocsUrl} target="_blank" className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-800 group hover:bg-slate-900 dark:hover:bg-white dark:hover:text-slate-900 transition-all">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5" />
                      <span className="font-bold text-sm">技术规范/SDK</span>
                    </div>
                    <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100" />
                  </a>
                </div>
              </div>

              {/* 核心枢纽 (5 columns on lg) */}
              <div className="lg:col-span-12 xl:col-span-5 bg-slate-900 dark:bg-slate-800/50 text-white rounded-[40px] p-10 flex flex-col shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                   <Satellite className="w-32 h-32" />
                </div>
                
                <div className="flex items-center gap-3 mb-10 relative">
                  <Zap className="w-5 h-5 text-amber-400 fill-amber-400" />
                  <h3 className="font-black uppercase tracking-[0.2em] text-xs text-slate-400">战略对话窗口</h3>
                </div>

                <div className="mb-10 relative">
                  <div className="text-3xl font-black mb-1">{selectedCompany.mainContact.name}</div>
                  <div className="text-indigo-400 text-sm font-bold uppercase mb-8 tracking-widest">{selectedCompany.mainContact.title}</div>
                  
                  <div className="space-y-5">
                    <div className="flex items-center gap-4 group cursor-pointer">
                      <div className="w-10 h-10 rounded-full bg-slate-800 dark:bg-slate-700 flex items-center justify-center group-hover:bg-indigo-600 transition-colors">
                        <Mail className="w-5 h-5" />
                      </div>
                      <span className="font-bold text-sm text-slate-300 group-hover:text-white">{selectedCompany.mainContact.email}</span>
                    </div>
                    <div className="flex items-center gap-4 group cursor-pointer">
                      <div className="w-10 h-10 rounded-full bg-slate-800 dark:bg-slate-700 flex items-center justify-center group-hover:bg-indigo-600 transition-colors">
                        <Phone className="w-5 h-5" />
                      </div>
                      <span className="font-bold text-sm text-slate-300 group-hover:text-white">{selectedCompany.mainContact.phone}</span>
                    </div>
                  </div>
                  
                  {(selectedCompany.sales_contact_name || selectedCompany.sales_contact_phone) && (
                    <div className="mt-8 pt-6 border-t border-slate-700/50">
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-4">商务/销售对接人</div>
                      <div className="flex items-center justify-between bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50">
                         <span className="font-bold text-sm text-slate-200">{selectedCompany.sales_contact_name || '—'}</span>
                         <span className="font-bold text-sm text-indigo-300 flex items-center gap-2"><Phone className="w-3 h-3"/> {selectedCompany.sales_contact_phone || '—'}</span>
                      </div>
                    </div>
                  )}
                </div>

                <button className="w-full mt-auto py-5 bg-white text-slate-950 rounded-2xl font-black uppercase text-sm tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-xl">
                  发起业务协作
                </button>
                
                <p className="mt-8 text-[9px] text-center text-slate-500 uppercase font-bold tracking-[0.3em] leading-relaxed">
                  本系统所载信息遵循北斗生态合作保密协议
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 页脚 */}
      <footer className="mt-20 py-20 px-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="flex flex-col gap-4 items-center md:items-start">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-8 h-8 text-indigo-600" />
              <div className="flex flex-col">
                <span className="text-lg font-black uppercase tracking-tighter">EcoLink.BEIDOU</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">时空时空生态管理系统</span>
              </div>
            </div>
            <p className="text-xs text-slate-400 max-w-xs text-center md:text-left leading-relaxed">
              立足时空位置，赋能全行业智能应用。数字化连接北斗产业链上下游每一处关键节点。
            </p>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-12">
            <div>
              <h5 className="font-black text-xs uppercase tracking-widest mb-6">资源库</h5>
              <div className="flex flex-col gap-3 text-sm font-bold text-slate-400">
                <a href="#" className="hover:text-indigo-600">合作企业</a>
                <a href="#" className="hover:text-indigo-600">高校人才</a>
                <a href="#" className="hover:text-indigo-600">部委项目</a>
              </div>
            </div>
            <div>
              <h5 className="font-black text-xs uppercase tracking-widest mb-6">服务支持</h5>
              <div className="flex flex-col gap-3 text-sm font-bold text-slate-400">
                <a href="#" className="hover:text-indigo-600">技术对接</a>
                <a href="#" className="hover:text-indigo-600">合规咨询</a>
                <a href="#" className="hover:text-indigo-600">入库指南</a>
              </div>
            </div>
            <div className="col-span-2 sm:col-span-1">
               <h5 className="font-black text-xs uppercase tracking-widest mb-6">联络我们</h5>
               <p className="text-[10px] font-bold text-slate-400 leading-relaxed uppercase tracking-widest">
                北斗时空大数据联合实验室 <br/>
                生态合作: eco@beidou-lab.com <br/>
                © 2026 技术驱动 · 生态协同
              </p>
            </div>
          </div>
        </div>
      </footer>
      {/* 资源编辑弹窗 */}
      {editingCompany && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-950/60 backdrop-blur-xl">
          <div className="absolute inset-0" onClick={() => setEditingCompany(null)} />
          <div className="relative bg-white dark:bg-slate-900 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[40px] shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-300 p-8 md:p-12">
            <div className="flex justify-between items-start mb-10">
              <div>
                <h2 className="text-3xl font-black mb-2 flex items-center gap-3 italic">
                  <FileText className="w-10 h-10 text-amber-600" />
                  修改资源详情
                </h2>
                <p className="text-slate-500 font-medium font-mono text-sm uppercase tracking-wider">{editingCompany.id} // 系统管理员编辑模式</p>
              </div>
              <button onClick={() => setEditingCompany(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-400">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={async (e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              
              const parsedDesc = {
                core_biz: fd.get('description') as string,
                target_clients: fd.get('target_clients') as string || '',
                region: fd.get('region') as string || '',
                sales_contact_name: fd.get('sales_contact_name') as string || '',
                sales_contact_phone: fd.get('sales_contact_phone') as string || '',
                doc_link: fd.get('doc_link') as string || ''
              };

              const updatedData = {
                name: fd.get('name') as string,
                type: fd.get('type') as any,
                industry: fd.get('industry') as any,
                description: JSON.stringify(parsedDesc),
                website: fd.get('website') as string,
                service_tags: Array.from(fd.getAll('tags')) as string[],
              };
              
              try {
                const { error } = await supabase
                  .from('companies')
                  .update(updatedData)
                  .eq('id', editingCompany.id);
                if (error) throw error;
                fetchInitialData();
                setEditingCompany(null);
              } catch (err) {
                console.error('Update failed:', err);
              }
            }} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">单位名称</label>
                    <input name="name" defaultValue={editingCompany.name} required className="w-full bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 rounded-2xl p-4 outline-none focus:border-amber-500 transition-colors font-bold" />
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">实体类型</label>
                      <select name="type" defaultValue={editingCompany.type} className="w-full bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 rounded-2xl p-4 outline-none focus:border-amber-500 transition-colors font-bold appearance-none">
                        {ENTITY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div className="flex-1">
                      <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">所属细分领域</label>
                      <select name="industry" defaultValue={editingCompany.industry} className="w-full bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 rounded-2xl p-4 outline-none focus:border-amber-500 transition-colors font-bold appearance-none">
                        {INDUSTRIES.filter(i => i !== '全部').map(i => <option key={i} value={i}>{i}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">服务对象与业务区域</label>
                    <div className="flex flex-col sm:flex-row gap-4">
                       <input name="target_clients" defaultValue={editingCompany.target_clients} placeholder="主要服务对象" className="w-full bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 rounded-2xl p-4 outline-none focus:border-amber-500 transition-colors font-bold text-sm" />
                       <input name="region" defaultValue={editingCompany.region} placeholder="业务覆盖区域" className="w-full bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 rounded-2xl p-4 outline-none focus:border-amber-500 transition-colors font-bold text-sm" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">官网与资料链接</label>
                    <div className="flex flex-col sm:flex-row gap-4">
                       <input name="website" defaultValue={editingCompany.website} placeholder="官方网站" className="w-full bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 rounded-2xl p-4 outline-none focus:border-amber-500 transition-colors font-bold text-sm" />
                       <input name="doc_link" defaultValue={editingCompany.apiDocsUrl} placeholder="产品/资料链接" className="w-full bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 rounded-2xl p-4 outline-none focus:border-amber-500 transition-colors font-bold text-sm" />
                    </div>
                  </div>
                </div>
                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">资源简介</label>
                    <textarea name="description" defaultValue={editingCompany.description} required rows={5} className="w-full bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 rounded-2xl p-4 outline-none focus:border-amber-500 transition-colors text-sm leading-relaxed" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">商务/销售对接人 (选填)</label>
                    <div className="flex flex-col sm:flex-row gap-4">
                       <input name="sales_contact_name" defaultValue={editingCompany.sales_contact_name} placeholder="姓名" className="w-full bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 rounded-2xl p-4 outline-none focus:border-amber-500 transition-colors font-bold text-sm" />
                       <input name="sales_contact_phone" defaultValue={editingCompany.sales_contact_phone} placeholder="电话" className="w-full bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 rounded-2xl p-4 outline-none focus:border-amber-500 transition-colors font-bold text-sm" />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">能力标签 (多选)</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {INDUSTRIES.filter(i => i !== '全部').map(tag => (
                    <label key={tag} className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl cursor-pointer hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors">
                      <input name="tags" type="checkbox" value={tag} defaultChecked={editingCompany.serviceTags.includes(tag)} className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500" />
                      <span className="text-[10px] font-black uppercase">{tag}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-8 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-4">
                <button type="button" onClick={() => setEditingCompany(null)} className="px-8 py-4 text-slate-400 font-black text-xs uppercase tracking-widest">取消修改</button>
                <button type="submit" className="px-10 py-4 bg-amber-600 text-white rounded-[20px] text-xs font-black uppercase tracking-widest hover:bg-amber-700 shadow-xl shadow-amber-600/20 transition-all">保存变更</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
