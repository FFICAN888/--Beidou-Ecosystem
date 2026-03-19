import React, { useState, useMemo } from 'react';
import { Search, Globe, FileText, Phone, Mail, ExternalLink, ShieldCheck, Zap, Menu, X, Filter, Map, Satellite, Building2, GraduationCap, Users } from 'lucide-react';

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
  industry: '卫星导航' | '地理信息' | '遥感监测' | '时空大数据' | '终端研发' | '行业应用';
  serviceTags: string[];
  website: string;
  integrationStatus: '已合作' | '对接中' | '技术引领' | '试点项目';
  apiDocsUrl: string;
  mainContact: Contact;
  bgGradient: string;
}

// --- 模拟数据 (北斗时空信息领域) ---
const ECO_COMPANIES: Company[] = [
  {
    id: '1',
    name: '千寻位置 (Chihiro)',
    type: '企业',
    logo: 'https://api.dicebear.com/7.x/initials/svg?seed=CX&backgroundColor=4f46e5',
    description: '提供全球领先的时空智能基础设施，基于北斗地基增强系统提供厘米级定位服务。',
    industry: '卫星导航',
    serviceTags: ['PPP-RTK', '高精度定位', '位置服务'],
    website: 'https://www.qxwz.com',
    integrationStatus: '已合作',
    apiDocsUrl: 'https://docs.qxwz.com',
    mainContact: { name: '张经理', title: '生态合作总监', email: 'zhang.l@qxwz.com', phone: '+86 139-1234-5678' },
    bgGradient: 'from-blue-600/20 to-indigo-600/20',
  },
  {
    id: '2',
    name: '武汉大学测绘遥感工程重点实验室',
    type: '高校/院所',
    logo: 'https://api.dicebear.com/7.x/initials/svg?seed=WHU&backgroundColor=059669',
    description: '国家顶级测绘地理信息研究机构，专注于时空大数据分析与精密定轨技术。',
    industry: '地理信息',
    serviceTags: ['测绘科学', '遥感影像', 'LBS'],
    website: 'http://www.liesmars.whu.edu.cn',
    integrationStatus: '技术引领',
    apiDocsUrl: '#',
    mainContact: { name: '李教授', title: '实验室负责人', email: 'li.prof@whu.edu.cn', phone: '+86 138-0027-8888' },
    bgGradient: 'from-emerald-600/20 to-teal-600/20',
  },
  {
    id: '3',
    name: '国家应急管理部 (甲方需求)',
    type: '甲方单位',
    logo: 'https://api.dicebear.com/7.x/initials/svg?seed=EM&backgroundColor=dc2626',
    description: '通过北斗短报文技术实现灾区通信与应急救援指挥调度。',
    industry: '行业应用',
    serviceTags: ['应急救援', '短报文通信', '减灾减灾'],
    website: 'https://www.mem.gov.cn',
    integrationStatus: '试点项目',
    apiDocsUrl: '#',
    mainContact: { name: '王处长', title: '信息化主管', email: 'wang.cx@mem.gov.cn', phone: '+86 10-6666-8888' },
    bgGradient: 'from-red-600/20 to-rose-600/20',
  },
  {
    id: '4',
    name: '华测导航 (CHCNAV)',
    type: '企业',
    logo: 'https://api.dicebear.com/7.x/initials/svg?seed=HC&backgroundColor=ea580c',
    description: '专注于高精度GNSS接收机生产及农机自动驾驶等北斗终端应用。',
    industry: '终端研发',
    serviceTags: ['GNSS终端', '无人驾驶', '精准农业'],
    website: 'https://www.chcnav.top',
    integrationStatus: '已合作',
    apiDocsUrl: 'https://dev.chcnav.com',
    mainContact: { name: '赵经理', title: '产品线经理', email: 'zhao.f@chcnav.com', phone: '+86 186-5555-1111' },
    bgGradient: 'from-orange-600/20 to-amber-600/20',
  },
  {
    id: '5',
    name: '中科星图 (GEOVIS)',
    type: '生态伙伴',
    logo: 'https://api.dicebear.com/7.x/initials/svg?seed=ZT&backgroundColor=2563eb',
    description: '提供数字地球平台，集成海量时空载荷数据与北斗位置服务。',
    industry: '时空大数据',
    serviceTags: ['数字地球', '可视化看板', '遥感AI'],
    website: 'https://www.geovis.com.cn',
    integrationStatus: '已合作',
    apiDocsUrl: 'https://sdk.geovis.com',
    mainContact: { name: '刘工', title: '技术支撑', email: 'liu.t@geovis.com', phone: '+86 137-2222-3333' },
    bgGradient: 'from-blue-600/20 to-sky-600/20',
  },
];

const INDUSTRIES = ['全部', '卫星导航', '地理信息', '遥感监测', '时空大数据', '终端研发', '行业应用'];
const ENTITY_TYPES: EntityType[] = ['企业', '高校/院所', '甲方单位', '生态伙伴'];

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

export default function CompanyEcoSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('全部');
  const [selectedType, setSelectedType] = useState<EntityType | '全部'>('全部');
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [pendingSubmissions] = useState([
    {
      id: 'sub_1',
      name: '北斗聚心科技有限公司',
      type: '企业',
      contact: '张三 (技术专家)',
      industries: ['卫星导航', '核心芯片'],
      description: '专注于北斗三号接收机基带芯片研发，期望与天线模组厂商合作。',
      date: '2026-03-19'
    },
    {
      id: 'sub_2',
      name: '华南测绘装备学院',
      type: '高校/院所',
      contact: '李教授',
      industries: ['遥感监测', '地理信息'],
      description: '拥有多项LiDAR点云处理专利，可提供高密度三维重建算法支持。',
      date: '2026-03-18'
    }
  ]);

  const filteredCompanies = useMemo(() => {
    return ECO_COMPANIES.filter(c => {
      const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.serviceTags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesIndustry = selectedIndustry === '全部' || c.industry === selectedIndustry;
      const matchesType = selectedType === '全部' || c.type === selectedType;
      return matchesSearch && matchesIndustry && matchesType;
    });
  }, [searchQuery, selectedIndustry, selectedType]);

  const getStatusVariant = (status: string) => {
    switch (status) {
      case '已合作': return 'success';
      case '技术引领': return 'info';
      case '试点项目': return 'danger';
      case '对接中': return 'warning';
      default: return 'default';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setIsSubmitModalOpen(false);
    }, 2000);
  };

  const getTypeIcon = (type: EntityType) => {
    switch (type) {
      case '企业': return <Building2 className="w-4 h-4" />;
      case '高校/院所': return <GraduationCap className="w-4 h-4" />;
      case '甲方单位': return <Users className="w-4 h-4" />;
      case '生态伙伴': return <Satellite className="w-4 h-4" />;
    }
  };

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
                onClick={() => setIsAdminMode(!isAdminMode)}
                className={`text-sm font-bold transition-all px-3 py-1.5 rounded-lg border-2 ${
                  isAdminMode 
                  ? 'text-amber-600 bg-amber-50 border-amber-200 shadow-sm' 
                  : 'text-slate-500 hover:text-indigo-600 border-transparent'
                }`}
              >
                {isAdminMode ? '退出管理' : '管理控制台'}
              </button>
              <button 
                onClick={() => setIsSubmitModalOpen(true)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-500/10"
              >
                资源提报
              </button>
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

      {/* 资源提报弹窗 */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[40px] p-10 relative shadow-2xl animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setIsSubmitModalOpen(false)}
              className="absolute top-8 right-8 p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-500 hover:text-white transition-all transform active:scale-95"
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

                <form onSubmit={handleSubmit} className="space-y-6">
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
                          type="text" 
                          placeholder="例如：某某时空科技" 
                          className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">实体类型 *</label>
                        <select required className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all appearance-none">
                          {ENTITY_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">主要服务对象 (选填)</label>
                        <input 
                          type="text" 
                          placeholder="例如：应急管理部, 测绘单位, 车联企业..." 
                          className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">业务覆盖区域 (选填)</label>
                        <input 
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
                          type="url" 
                          placeholder="https://..." 
                          className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">产品/方案资料链接 (选填)</label>
                        <input 
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
                      <div className="flex flex-wrap gap-2 pt-2">
                        {INDUSTRIES.filter(i => i !== '全部').map(industry => (
                          <button 
                            key={industry}
                            type="button"
                            className="px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold hover:border-indigo-500 transition-all active:bg-indigo-50"
                          >
                            {industry}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">业务简介与合作诉求 *</label>
                      <textarea 
                        required
                        rows={3}
                        placeholder="请简要描述单位在北斗时空领域的技术优势、核心产品及期望在生态圈内达成什么样的合作..." 
                        className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
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
                          <input required type="text" placeholder="技术负责人姓名" className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm" />
                          <input required type="text" placeholder="手机/邮箱 (技术对接)" className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm" />
                        </div>
                      </div>
                      
                      <div className="bg-slate-50/50 dark:bg-slate-800/20 p-6 rounded-[24px] space-y-4 border border-slate-100 dark:border-slate-800">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">商务/销售负责人 (选填)</span>
                        <div className="space-y-3">
                          <input type="text" placeholder="商务负责人姓名" className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm" />
                          <input type="text" placeholder="商务联系电话" className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6">
                    <button 
                      type="submit"
                      className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase text-sm tracking-widest hover:bg-indigo-700 shadow-xl shadow-indigo-500/20 active:scale-95 transition-all flex items-center justify-center gap-3"
                    >
                      提交审核
                      <ShieldCheck className="w-5 h-5" />
                    </button>
                    <p className="mt-4 text-[10px] text-center text-slate-400 uppercase font-black tracking-widest">
                      提交即表示同意北斗生态合作伙伴合规性声明
                    </p>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {/* 管理控制台面板 */}
      {isAdminMode && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in slide-in-from-top-4 duration-500">
          <div className="bg-amber-50 dark:bg-amber-900/10 border-2 border-amber-200 dark:border-amber-800/50 rounded-[32px] p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
              <div>
                <h2 className="text-2xl font-black text-amber-900 dark:text-amber-100 flex items-center gap-3">
                  <ShieldCheck className="w-8 h-8 text-amber-600" />
                  待审资源队列
                </h2>
                <p className="text-amber-700/70 dark:text-amber-400/70 font-medium">当前有 {pendingSubmissions.length} 项资源提报等待接入生态图谱</p>
              </div>
              <div className="flex gap-3">
                <button className="px-6 py-3 bg-white dark:bg-amber-900/30 text-amber-900 dark:text-amber-100 rounded-2xl text-sm font-black border border-amber-200 dark:border-amber-800 hover:shadow-lg transition-all">全量导出</button>
                <button className="px-6 py-3 bg-amber-600 text-white rounded-2xl text-sm font-black hover:bg-amber-700 shadow-xl shadow-amber-600/20 transition-all">批量入库</button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {pendingSubmissions.map(sub => (
                <div key={sub.id} className="bg-white dark:bg-slate-900 rounded-[24px] p-6 border border-amber-100 dark:border-amber-800 shadow-sm hover:shadow-md transition-all">
                  <div className="flex justify-between items-start mb-4">
                    <span className="px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full text-[10px] font-black uppercase tracking-widest">{sub.type}</span>
                    <span className="text-[10px] font-bold text-slate-400">{sub.date}</span>
                  </div>
                  <h3 className="text-lg font-black mb-3">{sub.name}</h3>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {sub.industries.map(i => <span key={i} className="text-[10px] font-bold text-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-1 rounded-md">{i}</span>)}
                  </div>
                  <p className="text-sm text-slate-500 line-clamp-2 mb-6 pt-4 border-t border-slate-50 dark:border-slate-800 italic">“{sub.description}”</p>
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-bold text-slate-400 flex items-center gap-1.5"><Users className="w-3.5 h-3.5" />{sub.contact}</div>
                    <div className="flex gap-2">
                       <button className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"><X className="w-5 h-5" /></button>
                       <button className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-lg transition-colors"><ShieldCheck className="w-5 h-5" /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
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

                <div className="w-full bg-slate-50 dark:bg-slate-800/20 p-8 rounded-[32px] mb-8 border border-slate-100 dark:border-slate-800/50">
                  <h4 className="text-xs font-black text-indigo-500 uppercase tracking-widest mb-4">核心研究/业务方向</h4>
                  <p className="text-xl text-slate-700 dark:text-slate-300 leading-relaxed font-medium italic">
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
               <h5 className="font-black text-xs uppercase tracking-widest mb-6">© 2026</h5>
               <p className="text-[10px] font-bold text-slate-400 leading-relaxed uppercase tracking-widest">
                北斗时空大数据联合实验室 <br/>
                技术驱动 · 生态协同
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
