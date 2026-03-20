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

        const demoPasswords: PasswordEntry[] = [
          { id: generateId(), title: 'Gmail', username: 'zhangming@gmail.com', password: 'Gm@il2024!Secure', url: 'https://mail.google.com', category: '邮箱', notes: '', guardianId: g1Id, guardianNote: '包含重要工作邮件', createdAt: Date.now() - 86400000 * 30, updatedAt: Date.now() - 86400000 * 5 },
          { id: generateId(), title: '支付宝', username: '138****5678', password: 'Al1p@y!2024#Strong', url: 'https://www.alipay.com', category: '银行', notes: '绑定工商银行卡', guardianId: g1Id, guardianNote: '余额宝里有应急资金', createdAt: Date.now() - 86400000 * 25, updatedAt: Date.now() - 86400000 * 3 },
          { id: generateId(), title: '工商银行', username: '6222****8901', password: 'ICBC#2024!Bankg', url: 'https://www.icbc.com.cn', category: '银行', notes: '工资卡，每月15日发薪', guardianId: g1Id, guardianNote: '房贷自动扣款账户', createdAt: Date.now() - 86400000 * 20, updatedAt: Date.now() - 86400000 * 2 },
          { id: generateId(), title: 'GitHub', username: 'zhangming-dev', password: 'GitH@b2024!Dev', url: 'https://github.com', category: '工具', notes: '开源项目', guardianId: null, guardianNote: '', createdAt: Date.now() - 86400000 * 15, updatedAt: Date.now() - 86400000 },
          { id: generateId(), title: '微信', username: 'wxid_ming2024', password: 'WeChat!2024#Msg', url: 'https://weixin.qq.com', category: '社交', notes: '', guardianId: g1Id, guardianNote: '有重要聊天记录', createdAt: Date.now() - 86400000 * 10, updatedAt: Date.now() },
          { id: generateId(), title: 'Netflix', username: 'zhangming@gmail.com', password: 'netflix123', url: 'https://netflix.com', category: '工具', notes: '家庭套餐', guardianId: null, guardianNote: '', createdAt: Date.now() - 86400000 * 8, updatedAt: Date.now() },
          { id: generateId(), title: '淘宝', username: 'taobao_ming', password: '123456', url: 'https://taobao.com', category: '工具', notes: '', guardianId: null, guardianNote: '', createdAt: Date.now() - 86400000 * 5, updatedAt: Date.now() },
          { id: generateId(), title: 'Binance', username: 'ming_crypto', password: 'B!n@nce2024$Crypto#Safe', url: 'https://binance.com', category: '加密资产', notes: 'BTC和ETH存储', guardianId: g2Id, guardianNote: '不要轻易操作，联系专业人士', createdAt: Date.now() - 86400000 * 3, updatedAt: Date.now() },
        ];

        const demoNotes: NoteEntry[] = [
          { id: generateId(), title: '给妻子的信', content: '# 亲爱的丽\n\n如果你看到这封信，说明我已经无法亲自告诉你这些话了。\n\n感谢你这些年来的陪伴，你是我生命中最美好的存在。\n\n## 重要事项\n\n1. 房贷还有15年，每月从工商银行自动扣款\n2. 保险单在书房第二个抽屉\n3. 孩子们的教育基金在招商银行\n\n永远爱你的，明', encrypted: true, guardianId: g1Id, createdAt: Date.now() - 86400000 * 20, updatedAt: Date.now() - 86400000 * 5 },
          { id: generateId(), title: '家庭密码汇总', content: '# 家庭重要信息\n\n## WiFi密码\n- 家庭网络: MyHome2024!\n\n## 门锁密码\n- 大门: 198206\n\n## 保险柜\n- 密码: 左3-右7-左2-右9', encrypted: true, guardianId: g1Id, createdAt: Date.now() - 86400000 * 15, updatedAt: Date.now() - 86400000 * 3 },
          { id: generateId(), title: '人生感悟', content: '# 写给自己\n\n人生不过三万天，要把每一天都过得有意义。\n\n> 真正的安全感不是来自于锁住一切，而是来自于知道你所珍惜的一切都被妥善安排。', encrypted: true, guardianId: null, createdAt: Date.now() - 86400000 * 10, updatedAt: Date.now() },
        ];

        const demoGuardians: Guardian[] = [
          { id: g1Id, name: '张丽', relationship: '妻子', email: 'zhangli@email.com', avatar: '👩', trustLevel: 'full', verified: true, createdAt: Date.now() - 86400000 * 60 },
          { id: g2Id, name: '张小明', relationship: '儿子', email: 'xiaoming@email.com', avatar: '👦', trustLevel: 'standard', verified: true, createdAt: Date.now() - 86400000 * 45 },
          { id: g3Id, name: '王律师', relationship: '法律顾问', email: 'wanglawyer@email.com', avatar: '👨‍💼', trustLevel: 'basic', verified: true, createdAt: Date.now() - 86400000 * 30 },
        ];

        const demoCapsules: TimeCapsule[] = [
          { id: generateId(), title: '给小明的18岁生日', content: '儿子，当你看到这封信的时候，你已经18岁了。爸爸想对你说：做一个正直的人，勇敢追求你的梦想，不要害怕犯错。人生的每一个选择都值得尊重。生日快乐！', recipientName: '张小明', recipientEmail: 'xiaoming@email.com', deliveryDate: Date.now() + 86400000 * 365 * 5, contentType: 'letter', sealed: true, opened: false, createdAt: Date.now() - 86400000 * 30 },
          { id: generateId(), title: '结婚20周年纪念', content: '亲爱的丽，转眼我们已经走过20年了。感谢你一路相伴。', recipientName: '张丽', recipientEmail: 'zhangli@email.com', deliveryDate: Date.now() + 86400000 * 365 * 2, contentType: 'letter', sealed: true, opened: false, createdAt: Date.now() - 86400000 * 15 },
        ];

        const demoEmergencyContacts: EmergencyContact[] = [
          { id: generateId(), name: '张丽', email: 'zhangli@email.com', phone: '138****5678', accessLevel: 'full', waitPeriod: 48, createdAt: Date.now() - 86400000 * 30 },
          { id: generateId(), name: '李刚', email: 'ligang@email.com', phone: '139****1234', accessLevel: 'basic', waitPeriod: 72, createdAt: Date.now() - 86400000 * 20 },
        ];

        const demoLogs: EmergencyLog[] = [
          { id: generateId(), contactName: '张丽', action: '查看了紧急访问设置', status: 'approved', timestamp: Date.now() - 86400000 * 7 },
          { id: generateId(), contactName: '系统', action: '安心确认已完成', status: 'approved', timestamp: Date.now() - 86400000 * 3 },
          { id: generateId(), contactName: '系统', action: '安全审计：发现2个弱密码', status: 'pending', timestamp: Date.now() - 86400000 },
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
      }),
    }
  )
);
