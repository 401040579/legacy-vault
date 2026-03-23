import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { generateId } from '../utils/crypto';

// Types
export interface PasswordEntry {
  id: string;
  title: string;
  username: string;
  password: string;
  url: string;
  category: string;
  notes: string;
  guardianId: string | null;
  guardianNote: string;
  breached?: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface NoteEntry {
  id: string;
  title: string;
  content: string;
  encrypted: boolean;
  guardianId: string | null;
  createdAt: number;
  updatedAt: number;
}

export interface Guardian {
  id: string;
  name: string;
  relationship: string;
  email: string;
  avatar: string;
  trustLevel: 'basic' | 'standard' | 'full';
  verified: boolean;
  createdAt: number;
}

export interface TimeCapsule {
  id: string;
  title: string;
  content: string;
  recipientName: string;
  recipientEmail: string;
  deliveryDate: number;
  contentType: 'text' | 'letter' | 'wish';
  sealed: boolean;
  opened: boolean;
  mood?: string;
  importance?: 'low' | 'medium' | 'high';
  createdAt: number;
}

export interface EmergencyContact {
  id: string;
  name: string;
  email: string;
  phone: string;
  accessLevel: 'basic' | 'standard' | 'full';
  waitPeriod: number; // hours
  createdAt: number;
}

export interface EmergencyLog {
  id: string;
  contactName: string;
  action: string;
  status: 'pending' | 'approved' | 'denied';
  timestamp: number;
}

export interface InheritanceAllocation {
  guardianId: string;
  itemId: string;
  itemType: 'password' | 'note';
}

interface AppState {
  // Auth
  isAuthenticated: boolean;
  isSetupComplete: boolean;
  masterPasswordHash: string;
  recoveryWords: string[];
  userName: string;

  // Onboarding
  onboardingComplete: boolean;
  setOnboardingComplete: (v: boolean) => void;

  // Passwords
  passwords: PasswordEntry[];
  addPassword: (entry: Omit<PasswordEntry, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updatePassword: (id: string, entry: Partial<PasswordEntry>) => void;
  deletePassword: (id: string) => void;

  // Notes
  notes: NoteEntry[];
  addNote: (entry: Omit<NoteEntry, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateNote: (id: string, entry: Partial<NoteEntry>) => void;
  deleteNote: (id: string) => void;

  // Guardians
  guardians: Guardian[];
  addGuardian: (entry: Omit<Guardian, 'id' | 'createdAt'>) => void;
  updateGuardian: (id: string, entry: Partial<Guardian>) => void;
  deleteGuardian: (id: string) => void;

  // Time Capsules
  timeCapsules: TimeCapsule[];
  addTimeCapsule: (entry: Omit<TimeCapsule, 'id' | 'createdAt'>) => void;
  updateTimeCapsule: (id: string, entry: Partial<TimeCapsule>) => void;
  deleteTimeCapsule: (id: string) => void;

  // Emergency
  emergencyContacts: EmergencyContact[];
  emergencyLogs: EmergencyLog[];
  addEmergencyContact: (entry: Omit<EmergencyContact, 'id' | 'createdAt'>) => void;
  deleteEmergencyContact: (id: string) => void;
  addEmergencyLog: (log: Omit<EmergencyLog, 'id'>) => void;

  // Inheritance
  inheritanceAllocations: InheritanceAllocation[];
  setAllocations: (allocations: InheritanceAllocation[]) => void;

  // Inheritance Settings
  verificationCycle: number; // days
  confirmationRequired: number; // number of guardians needed
  setVerificationCycle: (days: number) => void;
  setConfirmationRequired: (count: number) => void;

  // Auth actions
  login: (password: string) => boolean;
  logout: () => void;
  setupAccount: (name: string, passwordHash: string, words: string[]) => void;

  // Seed demo data
  seedDemoData: () => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Auth
      isAuthenticated: false,
      isSetupComplete: false,
      masterPasswordHash: '',
      recoveryWords: [],
      userName: '',

      // Onboarding
      onboardingComplete: false,
      setOnboardingComplete: (v) => set({ onboardingComplete: v }),

      // Data
      passwords: [],
      notes: [],
      guardians: [],
      timeCapsules: [],
      emergencyContacts: [],
      emergencyLogs: [],
      inheritanceAllocations: [],
      verificationCycle: 30,
      confirmationRequired: 2,

      // Password CRUD
      addPassword: (entry) => set((state) => ({
        passwords: [...state.passwords, {
          ...entry, id: generateId(), createdAt: Date.now(), updatedAt: Date.now()
        }]
      })),
      updatePassword: (id, entry) => set((state) => ({
        passwords: state.passwords.map(p =>
          p.id === id ? { ...p, ...entry, updatedAt: Date.now() } : p
        )
      })),
      deletePassword: (id) => set((state) => ({
        passwords: state.passwords.filter(p => p.id !== id)
      })),

      // Note CRUD
      addNote: (entry) => set((state) => ({
        notes: [...state.notes, {
          ...entry, id: generateId(), createdAt: Date.now(), updatedAt: Date.now()
        }]
      })),
      updateNote: (id, entry) => set((state) => ({
        notes: state.notes.map(n =>
          n.id === id ? { ...n, ...entry, updatedAt: Date.now() } : n
        )
      })),
      deleteNote: (id) => set((state) => ({
        notes: state.notes.filter(n => n.id !== id)
      })),

      // Guardian CRUD
      addGuardian: (entry) => set((state) => ({
        guardians: [...state.guardians, {
          ...entry, id: generateId(), createdAt: Date.now()
        }]
      })),
      updateGuardian: (id, entry) => set((state) => ({
        guardians: state.guardians.map(g =>
          g.id === id ? { ...g, ...entry } : g
        )
      })),
      deleteGuardian: (id) => set((state) => ({
        guardians: state.guardians.filter(g => g.id !== id),
        inheritanceAllocations: state.inheritanceAllocations.filter(a => a.guardianId !== id)
      })),

      // Time Capsule CRUD
      addTimeCapsule: (entry) => set((state) => ({
        timeCapsules: [...state.timeCapsules, {
          ...entry, id: generateId(), createdAt: Date.now()
        }]
      })),
      updateTimeCapsule: (id, entry) => set((state) => ({
        timeCapsules: state.timeCapsules.map(tc =>
          tc.id === id ? { ...tc, ...entry } : tc
        )
      })),
      deleteTimeCapsule: (id) => set((state) => ({
        timeCapsules: state.timeCapsules.filter(tc => tc.id !== id)
      })),

      // Emergency
      addEmergencyContact: (entry) => set((state) => ({
        emergencyContacts: [...state.emergencyContacts, {
          ...entry, id: generateId(), createdAt: Date.now()
        }]
      })),
      deleteEmergencyContact: (id) => set((state) => ({
        emergencyContacts: state.emergencyContacts.filter(ec => ec.id !== id)
      })),
      addEmergencyLog: (log) => set((state) => ({
        emergencyLogs: [...state.emergencyLogs, { ...log, id: generateId() }]
      })),

      // Inheritance
      setAllocations: (allocations) => set({ inheritanceAllocations: allocations }),
      setVerificationCycle: (days) => set({ verificationCycle: days }),
      setConfirmationRequired: (count) => set({ confirmationRequired: count }),

      // Auth
      login: (password) => {
        const state = get();
        if (password && state.masterPasswordHash === btoa(password)) {
          set({ isAuthenticated: true });
          return true;
        }
        return false;
      },
      logout: () => set({ isAuthenticated: false }),
      setupAccount: (name, passwordHash, words) => set({
        isSetupComplete: true,
        isAuthenticated: true,
        userName: name,
        masterPasswordHash: passwordHash,
        recoveryWords: words,
      }),

      seedDemoData: () => {
        const state = get();
        if (state.passwords.length > 0) return;

        const g1Id = generateId();
        const g2Id = generateId();
        const g3Id = generateId();
        const g4Id = generateId();

        const DAY = 86400000;

        const demoPasswords: PasswordEntry[] = [
          // Social Media
          { id: generateId(), title: '微信', username: 'wxid_ming2024', password: 'WeChat!2024#Msg', url: 'https://weixin.qq.com', category: '社交', notes: '绑定手机号 138****5678', guardianId: g1Id, guardianNote: '有重要聊天记录和工作群', breached: false, createdAt: Date.now() - DAY * 60, updatedAt: Date.now() - DAY * 2 },
          { id: generateId(), title: '微博', username: 'zhangming_blog', password: 'Weibo@2024!Post', url: 'https://weibo.com', category: '社交', notes: '', guardianId: null, guardianNote: '', breached: false, createdAt: Date.now() - DAY * 55, updatedAt: Date.now() - DAY * 10 },
          { id: generateId(), title: '抖音', username: '138****5678', password: 'douyin123', url: 'https://douyin.com', category: '社交', notes: '', guardianId: null, guardianNote: '', breached: true, createdAt: Date.now() - DAY * 50, updatedAt: Date.now() - DAY * 45 },
          { id: generateId(), title: 'Twitter/X', username: 'zhangming_dev', password: 'Tw!tter2024$X', url: 'https://x.com', category: '社交', notes: '技术分享账号', guardianId: null, guardianNote: '', breached: false, createdAt: Date.now() - DAY * 40, updatedAt: Date.now() - DAY * 5 },

          // Banking
          { id: generateId(), title: '工商银行', username: '6222****8901', password: 'ICBC#2024!Bankg', url: 'https://www.icbc.com.cn', category: '银行', notes: '工资卡，每月15日发薪', guardianId: g1Id, guardianNote: '房贷自动扣款账户，月供8500元', breached: false, createdAt: Date.now() - DAY * 90, updatedAt: Date.now() - DAY * 2 },
          { id: generateId(), title: '支付宝', username: '138****5678', password: 'Al1p@y!2024#Strong', url: 'https://www.alipay.com', category: '银行', notes: '绑定工商银行卡', guardianId: g1Id, guardianNote: '余额宝里有应急资金约5万', breached: false, createdAt: Date.now() - DAY * 85, updatedAt: Date.now() - DAY * 3 },
          { id: generateId(), title: '招商银行', username: '6225****3456', password: 'CMB$2024!Save', url: 'https://www.cmbchina.com', category: '银行', notes: '储蓄卡+信用卡', guardianId: g1Id, guardianNote: '孩子教育基金定投账户', breached: false, createdAt: Date.now() - DAY * 80, updatedAt: Date.now() - DAY * 7 },
          { id: generateId(), title: '建设银行', username: '6217****7890', password: 'abc123', url: 'https://www.ccb.com', category: '银行', notes: '旧卡，很少使用', guardianId: null, guardianNote: '', breached: true, createdAt: Date.now() - DAY * 200, updatedAt: Date.now() - DAY * 180 },

          // Email
          { id: generateId(), title: 'Gmail', username: 'zhangming@gmail.com', password: 'Gm@il2024!Secure', url: 'https://mail.google.com', category: '邮箱', notes: '主邮箱，所有重要服务注册用', guardianId: g1Id, guardianNote: '包含所有重要邮件和服务注册信息', breached: false, createdAt: Date.now() - DAY * 120, updatedAt: Date.now() - DAY * 1 },
          { id: generateId(), title: 'QQ邮箱', username: '123456789@qq.com', password: 'Qq!M@il2024', url: 'https://mail.qq.com', category: '邮箱', notes: '旧邮箱，部分老服务绑定', guardianId: null, guardianNote: '', breached: false, createdAt: Date.now() - DAY * 300, updatedAt: Date.now() - DAY * 60 },
          { id: generateId(), title: 'Outlook', username: 'zhangming@outlook.com', password: 'password123', url: 'https://outlook.com', category: '邮箱', notes: '工作邮箱备用', guardianId: null, guardianNote: '', breached: true, createdAt: Date.now() - DAY * 250, updatedAt: Date.now() - DAY * 200 },

          // Shopping
          { id: generateId(), title: '淘宝', username: 'taobao_ming', password: '123456', url: 'https://taobao.com', category: '工具', notes: '', guardianId: null, guardianNote: '', breached: true, createdAt: Date.now() - DAY * 100, updatedAt: Date.now() - DAY * 90 },
          { id: generateId(), title: '京东', username: 'jd_zhangming', password: 'JD#2024!Shop', url: 'https://jd.com', category: '工具', notes: 'Plus会员到2025年6月', guardianId: null, guardianNote: '', breached: false, createdAt: Date.now() - DAY * 70, updatedAt: Date.now() - DAY * 15 },
          { id: generateId(), title: '拼多多', username: '138****5678', password: 'pdd2024', url: 'https://pinduoduo.com', category: '工具', notes: '', guardianId: null, guardianNote: '', breached: false, createdAt: Date.now() - DAY * 30, updatedAt: Date.now() - DAY * 20 },

          // Tools
          { id: generateId(), title: 'GitHub', username: 'zhangming-dev', password: 'GitH@b2024!Dev$Str0ng', url: 'https://github.com', category: '工具', notes: '开源项目和私有仓库', guardianId: g2Id, guardianNote: '有几个重要的私有项目', breached: false, createdAt: Date.now() - DAY * 150, updatedAt: Date.now() - DAY * 1 },
          { id: generateId(), title: 'Netflix', username: 'zhangming@gmail.com', password: 'netflix123', url: 'https://netflix.com', category: '工具', notes: '家庭套餐4人共享', guardianId: null, guardianNote: '', breached: false, createdAt: Date.now() - DAY * 45, updatedAt: Date.now() - DAY * 8 },
          { id: generateId(), title: 'Notion', username: 'zhangming@gmail.com', password: 'N0t!on2024#Work', url: 'https://notion.so', category: '工具', notes: '工作笔记和项目管理', guardianId: null, guardianNote: '', breached: false, createdAt: Date.now() - DAY * 60, updatedAt: Date.now() - DAY * 1 },
          { id: generateId(), title: 'iCloud', username: 'zhangming@icloud.com', password: 'iCl0ud!2024$Apple', url: 'https://icloud.com', category: '工具', notes: '照片和备份', guardianId: g1Id, guardianNote: '全家照片都在这里', breached: false, createdAt: Date.now() - DAY * 200, updatedAt: Date.now() - DAY * 1 },
          { id: generateId(), title: 'Spotify', username: 'zhangming@gmail.com', password: 'spotify2024', url: 'https://spotify.com', category: '工具', notes: '', guardianId: null, guardianNote: '', breached: false, createdAt: Date.now() - DAY * 35, updatedAt: Date.now() - DAY * 20 },

          // Crypto
          { id: generateId(), title: 'Binance', username: 'ming_crypto', password: 'B!n@nce2024$Crypto#Safe', url: 'https://binance.com', category: '加密资产', notes: 'BTC 0.5个, ETH 8个', guardianId: g3Id, guardianNote: '不要轻易操作，联系王律师协助处理', breached: false, createdAt: Date.now() - DAY * 180, updatedAt: Date.now() - DAY * 5 },
          { id: generateId(), title: 'MetaMask', username: '0x7a3B...9f2E', password: 'M3t@M@sk!2024$W@llet', url: 'https://metamask.io', category: '加密资产', notes: '助记词另外保存在保险柜中', guardianId: g3Id, guardianNote: '助记词在书房保险柜，密码198206', breached: false, createdAt: Date.now() - DAY * 160, updatedAt: Date.now() - DAY * 10 },
          { id: generateId(), title: 'OKX', username: 'zhangming_okx', password: '0KX2024!Tr@de', url: 'https://okx.com', category: '加密资产', notes: 'USDT储备', guardianId: g3Id, guardianNote: '', breached: false, createdAt: Date.now() - DAY * 120, updatedAt: Date.now() - DAY * 15 },
        ];

        const demoNotes: NoteEntry[] = [
          {
            id: generateId(),
            title: '家庭保险信息整理',
            content: `# 家庭保险信息汇总

## 保险清单

| 险种 | 保险公司 | 保单号 | 年缴保费 | 到期日 |
|------|---------|--------|---------|--------|
| 重疾险 | 中国平安 | PA2020****01 | 12,000元 | 2045年 |
| 定期寿险 | 太平洋保险 | TP2021****02 | 3,600元 | 2051年 |
| 意外险 | 中国人寿 | RL2022****03 | 800元 | 每年续 |
| 医疗险 | 众安保险 | ZA2023****04 | 1,200元 | 每年续 |
| 车险 | 人保财险 | RB2024****05 | 5,800元 | 2025/03 |
| 房屋险 | 平安财险 | PF2023****06 | 600元 | 2028年 |

## 报案流程
1. 拨打保险公司客服电话
2. 提供保单号和身份证号
3. 保单原件在书房文件柜第二层

## 重要提醒
- 重疾险有90天等待期
- 寿险受益人：张丽(60%)、张小明(40%)
- 保费从工商银行自动扣款`,
            encrypted: true,
            guardianId: g1Id,
            createdAt: Date.now() - DAY * 90,
            updatedAt: Date.now() - DAY * 10,
          },
          {
            id: generateId(),
            title: '写给女儿18岁的一封信',
            content: `# 亲爱的小雨

当你读到这封信的时候，你已经18岁了。

爸爸在你6岁的时候写下这封信。此刻你正在客厅里画画，画了一家三口牵手的画。你说"爸爸是最高的那个，妈妈是最漂亮的那个，我是中间笑得最开心的那个"。

18年过得很快吧？不知道你现在长成了什么样子，是不是还像小时候一样爱笑？

爸爸想告诉你几件事：

**关于勇气**
不要害怕犯错。爸爸这一路走来，做过很多错误的决定，但每一个错误都教会了我一些东西。勇敢去尝试，勇敢去爱，勇敢去做你觉得对的事。

**关于善良**
世界有时候很冷，但你的善良可以温暖别人。不要因为受过伤就把心门关上。

**关于独立**
经济独立和精神独立同样重要。学会理财，学会照顾自己，但也不要拒绝别人的帮助。

**关于爱情**
值得你爱的人，会让你成为更好的自己，而不是让你变小。

不管发生什么，爸爸永远爱你。

你的爸爸
写于你6岁的那个夏天`,
            encrypted: true,
            guardianId: g1Id,
            createdAt: Date.now() - DAY * 365,
            updatedAt: Date.now() - DAY * 30,
          },
          {
            id: generateId(),
            title: '投资账户汇总',
            content: `# 投资账户信息

## 股票账户
- **券商**: 华泰证券
- **账号**: 6886****1234
- **当前持仓**: 约35万
- **主要持仓**: 贵州茅台(10股)、宁德时代(100股)、ETF基金

## 基金定投
- **平台**: 招商银行App
- **月定投**: 5,000元
  - 沪深300指数基金: 2,000元/月
  - 中证500指数基金: 1,500元/月
  - 纳斯达克100: 1,500元/月

## 理财产品
- 招商银行-安心系列: 20万 (到期日2025/06)
- 工商银行-稳利: 10万 (到期日2025/09)

## 加密资产
- BTC: 0.5个 (Binance)
- ETH: 8个 (MetaMask)
- USDT: 约5,000 (OKX)

> 注意：加密资产的助记词在书房保险柜里，密码198206`,
            encrypted: true,
            guardianId: g3Id,
            createdAt: Date.now() - DAY * 60,
            updatedAt: Date.now() - DAY * 5,
          },
          {
            id: generateId(),
            title: '房产证和车辆信息',
            content: `# 房产与车辆信息

## 房产
### 自住房 - 阳光花园3栋2单元1801
- **产权人**: 张明、张丽（共同共有）
- **房产证号**: 沪(2018)字第****号
- **面积**: 128平方米
- **购入价**: 380万 (2018年)
- **贷款**: 工商银行，剩余约180万，月供8,500元
- **房产证原件**: 书房文件柜保险箱

### 父母住房 - 幸福小区8栋
- **产权人**: 张建国（父亲）
- **面积**: 85平方米
- **已还清贷款**

## 车辆
### 特斯拉 Model Y 2023款
- **车牌号**: 沪A·D****
- **购入价**: 28.9万
- **保险到期**: 2025年3月
- **停车位**: 阳光花园地下B2-088（已购）

## 重要文件位置
- 房产证、购房合同：书房保险柜
- 车辆登记证：客厅电视柜第三个抽屉
- 车钥匙备用：玄关鞋柜顶层盒子里`,
            encrypted: true,
            guardianId: g1Id,
            createdAt: Date.now() - DAY * 120,
            updatedAt: Date.now() - DAY * 15,
          },
          {
            id: generateId(),
            title: '密码恢复问题答案',
            content: `# 各平台密码恢复问题答案

> 注意：为安全起见，答案都不是真实信息，是我自己编的

## 常用安全问题
- **你的出生城市？** → "星辰大海"
- **你母亲的姓名？** → "春暖花开"
- **你的第一只宠物名字？** → "量子纠缠"
- **你的小学名称？** → "银河小学"
- **你最喜欢的电影？** → "时光机器"
- **你的童年昵称？** → "北极星"

## 特殊平台
- **Apple ID恢复**: 生日设为1990-01-01（非真实生日）
- **Google恢复邮箱**: zhangming_backup@proton.me
- **银行预留手机**: 138****5678

## 提醒
- 永远不要用真实信息作为安全问题答案
- 这些答案本身也是一种密码，请妥善保管`,
            encrypted: true,
            guardianId: null,
            createdAt: Date.now() - DAY * 45,
            updatedAt: Date.now() - DAY * 3,
          },
          {
            id: generateId(),
            title: '给妻子的紧急指南',
            content: `# 丽，如果你需要处理这些事

## 第一步：不要慌
深呼吸。你不需要一个人面对，王律师（电话：139****8888）可以帮你处理法律和财务问题。

## 财务优先级
1. **房贷** - 工商银行自动扣款，确保账户有余额
2. **保险** - 检查上面"家庭保险信息"笔记
3. **孩子教育基金** - 招商银行定投，不建议中断

## 急需的钱从哪来
- 支付宝余额宝：约5万（随时可取）
- 招商银行理财：20万（需等到期或提前赎回）
- 工商银行活期：约3万

## 重要联系人
- **王律师**: 139****8888（法律事务）
- **刘会计**: 137****6666（税务问题）
- **李叔**: 136****3333（父亲的老朋友，可以帮忙）
- **公司HR张姐**: 135****2222（工作相关事宜）

## 密码和账户
- 所有密码都在这个保险箱里
- 加密资产请一定联系王律师，不要自己操作
- iCloud里有我们所有的家庭照片

## 最重要的
照顾好自己和孩子们。你比你想象的更坚强。

爱你的，明`,
            encrypted: true,
            guardianId: g1Id,
            createdAt: Date.now() - DAY * 180,
            updatedAt: Date.now() - DAY * 7,
          },
          {
            id: generateId(),
            title: '医疗信息和过敏记录',
            content: `# 家庭医疗信息

## 张明（本人）
- **血型**: A型
- **过敏**: 青霉素过敏（严重）、花粉轻微过敏
- **慢性病**: 无
- **既往手术**: 2019年阑尾炎手术（仁济医院）
- **体检报告**: 每年在瑞金医院体检，报告在邮箱里
- **常用药物**: 氯雷他定（春季花粉季）
- **主治医生**: 瑞金医院 陈主任（消化内科）

## 张丽（妻子）
- **血型**: O型
- **过敏**: 海鲜（轻微）
- **近视**: 500度

## 张小明（儿子）
- **血型**: A型
- **过敏**: 无已知过敏
- **疫苗**: 全部按时接种，接种本在书房

## 张小雨（女儿）
- **血型**: O型
- **过敏**: 芒果过敏（皮肤反应）
- **疫苗**: 全部按时接种

## 紧急医疗信息
- **家庭医保卡**: 都在客厅抽屉里
- **商业保险**: 见"家庭保险信息"笔记
- **急救电话**: 120
- **最近医院**: 仁济医院（车程10分钟）`,
            encrypted: true,
            guardianId: g1Id,
            createdAt: Date.now() - DAY * 75,
            updatedAt: Date.now() - DAY * 20,
          },
          {
            id: generateId(),
            title: '数字资产清单',
            content: `# 数字资产完整清单

## 加密货币钱包

### Binance（中心化交易所）
- **账号**: ming_crypto
- **资产**: BTC 0.5 / ETH 8 / 若干altcoin
- **2FA**: Google Authenticator（手机上）
- **备用2FA**: 备用码在书房保险柜信封里

### MetaMask（去中心化钱包）
- **地址**: 0x7a3B...9f2E
- **链**: Ethereum / Polygon / Arbitrum
- **资产**: ETH + 各种DeFi仓位
- **助记词**: 书房保险柜，密码198206
- **重要**: 助记词是唯一恢复方式，千万保管好

### OKX
- **账号**: zhangming_okx
- **资产**: USDT ~5,000
- **用途**: 法币出入金通道

## 域名
- zhangming.dev (Cloudflare, 2026年到期)
- minglab.io (Namecheap, 2025年到期, 需续费)

## 数字订阅
- GitHub Pro: $4/月
- Notion: $10/月
- Netflix: 家庭版 $15/月
- iCloud: 200GB $2.99/月
- Spotify: 家庭版 $14.99/月

## 社交媒体账号
- 微信: wxid_ming2024（有8000+联系人）
- 微博: zhangming_blog（12万粉丝）
- Twitter: zhangming_dev（技术社区）
- GitHub: zhangming-dev（开源项目）

> **总数字资产估值**: 约80万人民币（加密资产波动较大）`,
            encrypted: true,
            guardianId: g3Id,
            createdAt: Date.now() - DAY * 30,
            updatedAt: Date.now() - DAY * 2,
          },
        ];

        const demoGuardians: Guardian[] = [
          { id: g1Id, name: '张丽', relationship: '妻子', email: 'zhangli@email.com', avatar: '👩', trustLevel: 'full', verified: true, createdAt: Date.now() - DAY * 180 },
          { id: g2Id, name: '张小明', relationship: '儿子', email: 'xiaoming@email.com', avatar: '👦', trustLevel: 'standard', verified: true, createdAt: Date.now() - DAY * 120 },
          { id: g3Id, name: '王律师', relationship: '法律顾问', email: 'wanglawyer@firm.com', avatar: '👨‍💼', trustLevel: 'basic', verified: true, createdAt: Date.now() - DAY * 90 },
          { id: g4Id, name: '李刚', relationship: '挚友', email: 'ligang@email.com', avatar: '👨', trustLevel: 'standard', verified: true, createdAt: Date.now() - DAY * 60 },
        ];

        const demoCapsules: TimeCapsule[] = [
          { id: generateId(), title: '写给10年后的自己', content: '未来的自己，你好。\n\n现在的你35岁，孩子们还小，每天忙忙碌碌。\n\n10年后你45岁了。希望你还记得现在的梦想：\n1. 带全家去一次北欧看极光\n2. 写一本关于技术创业的书\n3. 学会弹钢琴\n4. 每天运动30分钟\n\n不知道这些愿望实现了几个？不管怎样，希望你健康，家人平安，内心平静。\n\n不要忘记生活中的小美好。', recipientName: '自己', recipientEmail: 'zhangming@gmail.com', deliveryDate: Date.now() + DAY * 3652, contentType: 'letter', sealed: true, opened: false, mood: 'reflective', importance: 'high', createdAt: Date.now() - DAY * 100 },
          { id: generateId(), title: '给女儿的18岁生日信', content: '小雨宝贝，生日快乐！\n\n你18岁了！爸爸在你还是个小豆丁的时候就开始给你写这封信了。\n\n爸爸把这些年拍的你的照片、视频都整理好了，在iCloud的"小雨成长"相册里。从你出生到现在，每一个重要时刻爸爸都没有错过。\n\n18岁意味着你可以为自己做更多决定了。爸爸相信你会做出正确的选择。\n\n但不管你做了什么选择，爸爸永远站在你身后。\n\n希望你的18岁充满惊喜和快乐！\n\n永远爱你的爸爸', recipientName: '张小雨', recipientEmail: 'xiaoming@email.com', deliveryDate: Date.now() + DAY * 2000, contentType: 'letter', sealed: true, opened: false, mood: 'loving', importance: 'high', createdAt: Date.now() - DAY * 200 },
          { id: generateId(), title: '给妻子的结婚纪念日惊喜', content: '亲爱的丽，结婚纪念日快乐！\n\n又一年了。感谢你这一年来的付出和包容。\n\n记得我们约定的吗？每年纪念日重新写一次婚礼誓言。\n\n今年我的誓言是：\n我承诺，在接下来的一年里，每周至少有一天准时回家吃晚饭。我承诺，每个月至少带你出去看一次电影或散一次步。我承诺，不在你说话的时候看手机。\n\n对了，给你订了你一直想去的那家日料店，周六晚上7点，别忘了。\n\n爱你的，明', recipientName: '张丽', recipientEmail: 'zhangli@email.com', deliveryDate: Date.now() + DAY * 30, contentType: 'letter', sealed: true, opened: false, mood: 'romantic', importance: 'high', createdAt: Date.now() - DAY * 5 },
          { id: generateId(), title: '新年愿望2027', content: '2027年新年愿望清单：\n\n1. 身体健康，全家平安\n2. 完成马拉松半程\n3. 学会做10道新菜\n4. 读完20本书\n5. 带孩子们去一次海边露营\n6. 把投资组合优化一下\n7. 每天冥想10分钟\n\n加油！', recipientName: '自己', recipientEmail: 'zhangming@gmail.com', deliveryDate: Date.now() + DAY * 280, contentType: 'wish', sealed: true, opened: false, mood: 'hopeful', importance: 'medium', createdAt: Date.now() - DAY * 10 },
          { id: generateId(), title: '去年写给今天的自己', content: '嘿，一年后的自己：\n\n希望你实现了去年的目标。\n\n去年这个时候，你刚开始用Legacy Vault。一年过去了，希望你的数字生活变得更有序了。\n\n最重要的是：希望你还在坚持每天锻炼，希望你对家人多了一些耐心。\n\n无论这一年发生了什么，你都走过来了。为自己鼓个掌。\n\n一年前的你', recipientName: '自己', recipientEmail: 'zhangming@gmail.com', deliveryDate: Date.now() - DAY * 5, contentType: 'letter', sealed: false, opened: true, mood: 'reflective', importance: 'medium', createdAt: Date.now() - DAY * 370 },
          { id: generateId(), title: '上个月的心愿', content: '这个月的小目标：\n\n- 把阳台的花重新种一下 (done!)\n- 给爸妈打视频电话，至少每周一次\n- 整理书房的旧书，捐给社区图书馆\n- 试试那个新的咖啡馆\n\n一个月后来检查完成情况。\n\n更新：完成了3个，打电话那个做得还不够，下个月继续。', recipientName: '自己', recipientEmail: 'zhangming@gmail.com', deliveryDate: Date.now() - DAY * 2, contentType: 'text', sealed: false, opened: true, mood: 'motivated', importance: 'low', createdAt: Date.now() - DAY * 32 },
        ];

        const demoEmergencyContacts: EmergencyContact[] = [
          { id: generateId(), name: '张丽', email: 'zhangli@email.com', phone: '138****5678', accessLevel: 'full', waitPeriod: 48, createdAt: Date.now() - DAY * 90 },
          { id: generateId(), name: '李刚', email: 'ligang@email.com', phone: '139****1234', accessLevel: 'basic', waitPeriod: 72, createdAt: Date.now() - DAY * 60 },
        ];

        const demoLogs: EmergencyLog[] = [
          { id: generateId(), contactName: '张丽', action: '查看了紧急访问设置', status: 'approved', timestamp: Date.now() - DAY * 14 },
          { id: generateId(), contactName: '系统', action: '安心确认已完成', status: 'approved', timestamp: Date.now() - DAY * 7 },
          { id: generateId(), contactName: '系统', action: '安全审计：发现4个弱密码、3个泄露密码', status: 'pending', timestamp: Date.now() - DAY * 3 },
          { id: generateId(), contactName: '系统', action: '每月安全报告已生成', status: 'approved', timestamp: Date.now() - DAY * 1 },
        ];

        const allocations: InheritanceAllocation[] = [];
        demoPasswords.forEach(p => {
          if (p.guardianId) {
            allocations.push({ guardianId: p.guardianId, itemId: p.id, itemType: 'password' });
          }
        });
        demoNotes.forEach(n => {
          if (n.guardianId) {
            allocations.push({ guardianId: n.guardianId, itemId: n.id, itemType: 'note' });
          }
        });

        set({
          passwords: demoPasswords,
          notes: demoNotes,
          guardians: demoGuardians,
          timeCapsules: demoCapsules,
          emergencyContacts: demoEmergencyContacts,
          emergencyLogs: demoLogs,
          inheritanceAllocations: allocations,
        });
      },
    }),
    {
      name: 'legacy-vault-storage',
      partialize: (state) => ({
        isSetupComplete: state.isSetupComplete,
        masterPasswordHash: state.masterPasswordHash,
        recoveryWords: state.recoveryWords,
        userName: state.userName,
        passwords: state.passwords,
        notes: state.notes,
        guardians: state.guardians,
        timeCapsules: state.timeCapsules,
        emergencyContacts: state.emergencyContacts,
        emergencyLogs: state.emergencyLogs,
        inheritanceAllocations: state.inheritanceAllocations,
        verificationCycle: state.verificationCycle,
        confirmationRequired: state.confirmationRequired,
        onboardingComplete: state.onboardingComplete,
      }),
    }
  )
);
