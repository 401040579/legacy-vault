import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users, Plus, X, Edit3, Trash2, Check, Eye,
  KeyRound, StickyNote, Heart, Settings, Timer,
  Shield, Clock, ChevronRight, Lock, Unlock, CheckCircle2
} from 'lucide-react'
import { useStore, type Guardian } from '../store'

const AVATARS = ['👤', '👩', '👦', '👧', '👨', '👩‍💼', '👨‍💼', '👴', '👵', '🧑']
const TRUST_LEVELS = [
  { value: 'basic' as const, label: '基础', desc: '紧急联系方式、医疗信息', color: 'text-blue-400' },
  { value: 'standard' as const, label: '标准', desc: '密码、财务信息', color: 'text-amber-400' },
  { value: 'full' as const, label: '完整', desc: '所有内容', color: 'text-emerald-400' },
]

export default function InheritancePage() {
  const {
    guardians, passwords, notes, timeCapsules, inheritanceAllocations,
    addGuardian, updateGuardian, deleteGuardian, setAllocations,
    verificationCycle, confirmationRequired,
    setVerificationCycle, setConfirmationRequired,
  } = useStore()

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [previewGuardian, setPreviewGuardian] = useState<Guardian | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [showAllocation, setShowAllocation] = useState(false)
  const [allocGuardian, setAllocGuardian] = useState<string>('')
  const [showVerificationDemo, setShowVerificationDemo] = useState(false)
  const [verifyStep, setVerifyStep] = useState(0)

  // Form
  const [formName, setFormName] = useState('')
  const [formRelation, setFormRelation] = useState('')
  const [formEmail, setFormEmail] = useState('')
  const [formAvatar, setFormAvatar] = useState('👤')
  const [formTrust, setFormTrust] = useState<'basic' | 'standard' | 'full'>('standard')

  const totalItems = passwords.length + notes.length
  const allocatedItems = new Set(inheritanceAllocations.map(a => a.itemId)).size
  const coverageRate = totalItems > 0 ? Math.round((allocatedItems / totalItems) * 100) : 0

  const openForm = (g?: Guardian) => {
    if (g) {
      setEditingId(g.id)
      setFormName(g.name)
      setFormRelation(g.relationship)
      setFormEmail(g.email)
      setFormAvatar(g.avatar)
      setFormTrust(g.trustLevel)
    } else {
      setEditingId(null)
      setFormName('')
      setFormRelation('')
      setFormEmail('')
      setFormAvatar('👤')
      setFormTrust('standard')
    }
    setShowForm(true)
  }

  const handleSave = () => {
    const data = { name: formName, relationship: formRelation, email: formEmail, avatar: formAvatar, trustLevel: formTrust, verified: true }
    if (editingId) {
      updateGuardian(editingId, data)
    } else {
      addGuardian(data)
    }
    setShowForm(false)
  }

  const getGuardianItems = (gId: string) => {
    const allocs = inheritanceAllocations.filter(a => a.guardianId === gId)
    return {
      passwords: allocs.filter(a => a.itemType === 'password').map(a => passwords.find(p => p.id === a.itemId)).filter(Boolean),
      notes: allocs.filter(a => a.itemType === 'note').map(a => notes.find(n => n.id === a.itemId)).filter(Boolean),
    }
  }

  const toggleAllocation = (guardianId: string, itemId: string, itemType: 'password' | 'note') => {
    const existing = inheritanceAllocations.find(a => a.guardianId === guardianId && a.itemId === itemId)
    if (existing) {
      setAllocations(inheritanceAllocations.filter(a => !(a.guardianId === guardianId && a.itemId === itemId)))
    } else {
      setAllocations([...inheritanceAllocations, { guardianId, itemId, itemType }])
    }
  }

  const openPreview = (g: Guardian) => {
    setPreviewGuardian(g)
    setShowPreview(true)
  }

  const verificationSteps = [
    { title: '定期安心确认', desc: `每${verificationCycle}天发送一次确认请求`, days: '第1天', icon: Clock, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { title: '多渠道提醒', desc: '推送通知 + 邮件 + 短信，持续提醒', days: '第3-7天', icon: Shield, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { title: '联系提醒人', desc: '通知你指定的提醒联系人确认你的状态', days: '第7-14天', icon: Users, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { title: '紧急联系人确认', desc: `需要${confirmationRequired}位守护人确认启动传承`, days: '第14-24天', icon: CheckCircle2, color: 'text-rose-400', bg: 'bg-rose-500/10' },
    { title: '冷却等待期', desc: '最终7天等待期，你仍可随时取消', days: '第24-31天', icon: Timer, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  ]

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">传承计划</h1>
          <p className="text-sm text-slate-400 mt-1">为你爱的人做好安排</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowSettings(true)}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-medium transition-colors flex items-center gap-2"
          >
            <Settings className="w-4 h-4" />
            设置
          </button>
          <button
            onClick={() => openForm()}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl text-sm font-medium transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            添加守护人
          </button>
        </div>
      </div>

      {/* Guardians grid */}
      <div>
        <h3 className="text-sm font-medium text-slate-400 mb-3">你的守护人</h3>
        {guardians.length === 0 ? (
          <div className="p-8 text-center bg-slate-900/50 border border-slate-800 rounded-2xl">
            <Users className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-sm text-slate-500">还没有守护人。添加你信任的人，为重要的事做好安排。</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {guardians.map(g => {
              const items = getGuardianItems(g.id)
              const pwCount = items.passwords.length
              const noteCount = items.notes.length
              const capsuleCount = timeCapsules.filter(tc => tc.recipientName === g.name).length
              return (
                <motion.div
                  key={g.id}
                  layout
                  className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-2xl">
                        {g.avatar}
                      </div>
                      <div>
                        <p className="text-white font-medium">{g.name}</p>
                        <p className="text-xs text-slate-500">{g.relationship}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {g.verified && (
                        <span className="text-xs text-emerald-400 flex items-center gap-0.5 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                          <Check className="w-3 h-3" /> 已验证
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2 mb-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">信任等级</span>
                      <span className={TRUST_LEVELS.find(t => t.value === g.trustLevel)?.color}>
                        {TRUST_LEVELS.find(t => t.value === g.trustLevel)?.label}
                      </span>
                    </div>
                  </div>

                  {/* Allocation summary */}
                  <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700 mb-3">
                    <p className="text-xs text-slate-500 mb-2">
                      {useStore.getState().userName || '你'}的{g.relationship}{g.name}将看到：
                    </p>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="flex items-center gap-1 text-emerald-400">
                        <KeyRound className="w-3 h-3" />
                        {pwCount}条密码
                      </span>
                      <span className="flex items-center gap-1 text-blue-400">
                        <StickyNote className="w-3 h-3" />
                        {noteCount}篇笔记
                      </span>
                      {capsuleCount > 0 && (
                        <span className="flex items-center gap-1 text-purple-400">
                          <Timer className="w-3 h-3" />
                          {capsuleCount}个胶囊
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => { setAllocGuardian(g.id); setShowAllocation(true); }}
                      className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs rounded-lg transition-colors"
                    >
                      分配内容
                    </button>
                    <button
                      onClick={() => openPreview(g)}
                      className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-white text-xs rounded-lg transition-colors"
                      title="预览"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => openForm(g)}
                      className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-white text-xs rounded-lg transition-colors"
                      title="编辑"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteGuardian(g.id)}
                      className="py-2 px-3 bg-slate-800 hover:bg-red-900/50 text-slate-400 hover:text-red-400 text-xs rounded-lg transition-colors"
                      title="移除"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>

      {/* Coverage */}
      <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800">
        <h3 className="text-sm font-medium text-slate-400 mb-4">传承覆盖率</h3>
        <div className="flex items-center gap-6">
          {/* Coverage ring */}
          <div className="relative w-24 h-24 shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" fill="none" stroke="#1e293b" strokeWidth="8" />
              <motion.circle
                cx="50" cy="50" r="40" fill="none"
                stroke={coverageRate >= 80 ? '#10b981' : coverageRate >= 50 ? '#f59e0b' : '#3b82f6'}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${coverageRate * 2.51} 251`}
                initial={{ strokeDasharray: '0 251' }}
                animate={{ strokeDasharray: `${coverageRate * 2.51} 251` }}
                transition={{ duration: 1.2 }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-bold text-white">{coverageRate}%</span>
            </div>
          </div>
          <div className="flex-1">
            <p className="text-white font-medium mb-1">
              {totalItems}条内容中有{allocatedItems}条已安排传承
            </p>
            <p className="text-xs text-slate-500 mb-3">
              {coverageRate < 50 ? '建议将重要内容分配给守护人' : '覆盖率良好'}
            </p>
            {coverageRate >= 50 && (
              <p className="text-sm text-emerald-400/70 flex items-center gap-1">
                <Heart className="w-4 h-4" />
                你已经为最爱的人做好了安排
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Verification Timeline */}
      <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-slate-400">生存验证协议 - 5阶段流程</h3>
          <button
            onClick={() => { setShowVerificationDemo(true); setVerifyStep(0); }}
            className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            模拟演示
          </button>
        </div>
        <div className="space-y-3">
          {verificationSteps.map((vs, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-lg ${vs.bg} flex items-center justify-center`}>
                  <vs.icon className={`w-4 h-4 ${vs.color}`} />
                </div>
                {i < verificationSteps.length - 1 && (
                  <div className="w-0.5 h-6 bg-slate-800 mt-1" />
                )}
              </div>
              <div className="flex-1 pb-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-white font-medium">{vs.title}</p>
                  <span className="text-xs text-slate-500">{vs.days}</span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">{vs.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/10">
          <p className="text-xs text-emerald-400/80 text-center">
            任何阶段你重新响应都会立即取消流程。总计不少于31天的安全保障期。
          </p>
        </div>
      </div>

      {/* Verification settings */}
      <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800">
        <h3 className="text-sm font-medium text-slate-400 mb-3">传递设置</h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/50">
            <span className="text-slate-300">安心确认周期</span>
            <span className="text-white font-medium">每{verificationCycle}天</span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/50">
            <span className="text-slate-300">确认人数要求</span>
            <span className="text-white font-medium">{confirmationRequired}人确认</span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/50">
            <span className="text-slate-300">安全碎片设置</span>
            <span className="text-white font-medium">{guardians.length}份中的{confirmationRequired}份</span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/50">
            <span className="text-slate-300">上次安心确认</span>
            <span className="text-emerald-400 font-medium">今天</span>
          </div>
        </div>
      </div>

      {/* Add/Edit Guardian Modal */}
      <AnimatePresence>
        {showForm && (
          <Modal onClose={() => setShowForm(false)} title={editingId ? '编辑守护人' : '添加守护人'}>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-slate-300 mb-2 block">选择头像</label>
                <div className="flex gap-2 flex-wrap">
                  {AVATARS.map(a => (
                    <button
                      key={a}
                      onClick={() => setFormAvatar(a)}
                      className={`w-10 h-10 rounded-full text-xl flex items-center justify-center transition-all ${
                        formAvatar === a ? 'bg-emerald-500/20 ring-2 ring-emerald-500' : 'bg-slate-800 hover:bg-slate-700'
                      }`}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm text-slate-300 mb-1 block">姓名</label>
                <input value={formName} onChange={e => setFormName(e.target.value)} placeholder="守护人姓名" className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-emerald-500" />
              </div>
              <div>
                <label className="text-sm text-slate-300 mb-1 block">关系</label>
                <input value={formRelation} onChange={e => setFormRelation(e.target.value)} placeholder="例如：妻子、儿子、律师" className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-emerald-500" />
              </div>
              <div>
                <label className="text-sm text-slate-300 mb-1 block">邮箱</label>
                <input value={formEmail} onChange={e => setFormEmail(e.target.value)} placeholder="guardian@email.com" className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-emerald-500" />
              </div>
              <div>
                <label className="text-sm text-slate-300 mb-2 block">信任等级</label>
                <div className="space-y-2">
                  {TRUST_LEVELS.map(t => (
                    <button
                      key={t.value}
                      onClick={() => setFormTrust(t.value)}
                      className={`w-full p-3 rounded-xl border text-left transition-colors ${
                        formTrust === t.value ? 'bg-emerald-950/30 border-emerald-500/30' : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
                      }`}
                    >
                      <p className={`text-sm font-medium ${t.color}`}>{t.label}</p>
                      <p className="text-xs text-slate-400">{t.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 text-slate-400 text-sm">取消</button>
              <button onClick={handleSave} disabled={!formName} className="px-6 py-2 bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-700 text-white text-sm font-medium rounded-xl transition-colors">
                {editingId ? '保存' : '添加守护人'}
              </button>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* Allocation Modal */}
      <AnimatePresence>
        {showAllocation && (
          <Modal onClose={() => setShowAllocation(false)} title="分配内容">
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {passwords.length > 0 && (
                <div>
                  <h4 className="text-sm text-slate-400 mb-2">密码</h4>
                  <div className="space-y-1">
                    {passwords.map(p => {
                      const allocated = inheritanceAllocations.some(a => a.guardianId === allocGuardian && a.itemId === p.id)
                      return (
                        <button
                          key={p.id}
                          onClick={() => toggleAllocation(allocGuardian, p.id, 'password')}
                          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                            allocated ? 'bg-emerald-950/30 border border-emerald-500/30' : 'hover:bg-slate-800 border border-transparent'
                          }`}
                        >
                          <KeyRound className="w-4 h-4 text-slate-400" />
                          <span className="text-sm text-white flex-1 text-left">{p.title}</span>
                          {allocated && <Check className="w-4 h-4 text-emerald-400" />}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
              {notes.length > 0 && (
                <div>
                  <h4 className="text-sm text-slate-400 mb-2">笔记</h4>
                  <div className="space-y-1">
                    {notes.map(n => {
                      const allocated = inheritanceAllocations.some(a => a.guardianId === allocGuardian && a.itemId === n.id)
                      return (
                        <button
                          key={n.id}
                          onClick={() => toggleAllocation(allocGuardian, n.id, 'note')}
                          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                            allocated ? 'bg-emerald-950/30 border border-emerald-500/30' : 'hover:bg-slate-800 border border-transparent'
                          }`}
                        >
                          <StickyNote className="w-4 h-4 text-slate-400" />
                          <span className="text-sm text-white flex-1 text-left">{n.title}</span>
                          {allocated && <Check className="w-4 h-4 text-emerald-400" />}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <Modal onClose={() => setShowSettings(false)} title="传递设置">
            <div className="space-y-4">
              <div>
                <label className="text-sm text-slate-300 mb-1 block">安心确认周期（天）</label>
                <select
                  value={verificationCycle}
                  onChange={e => setVerificationCycle(Number(e.target.value))}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500"
                >
                  {[7, 14, 30, 60, 90].map(d => (
                    <option key={d} value={d}>每{d}天</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm text-slate-300 mb-1 block">确认人数要求</label>
                <select
                  value={confirmationRequired}
                  onChange={e => setConfirmationRequired(Number(e.target.value))}
                  className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500"
                >
                  {[1, 2, 3, 4, 5].map(n => (
                    <option key={n} value={n}>{n}人确认</option>
                  ))}
                </select>
              </div>
              <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700">
                <p className="text-xs text-slate-400">
                  生存验证协议：5阶段渐进式确认，总时长不少于31天。任何阶段你重新响应都会立即取消流程。
                </p>
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <button onClick={() => setShowSettings(false)} className="px-6 py-2 bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-medium rounded-xl transition-colors">
                保存设置
              </button>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* Preview Modal - Enhanced Guardian View */}
      <AnimatePresence>
        {showPreview && previewGuardian && (
          <Modal onClose={() => setShowPreview(false)} title="以守护人身份预览">
            <div className="space-y-6">
              {/* Guardian login simulation */}
              <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <Lock className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm text-white font-medium">Legacy Vault - 守护人入口</p>
                    <p className="text-xs text-slate-400">身份已验证: {previewGuardian.name} ({previewGuardian.relationship})</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-emerald-400">
                  <Unlock className="w-3 h-3" />
                  <span>密钥碎片已验证，正在解密...</span>
                </div>
              </div>

              {/* Header */}
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center text-3xl mx-auto mb-3">
                  {previewGuardian.avatar}
                </div>
                <p className="text-white font-medium">{useStore.getState().userName || '用户'} 留给你的内容</p>
                <p className="text-sm text-slate-400 mt-1 italic">
                  "这些是我想要安全传递给你的重要内容"
                </p>
              </div>

              {/* Allocated content */}
              <div className="space-y-2">
                {(() => {
                  const items = getGuardianItems(previewGuardian.id)
                  const capsules = timeCapsules.filter(tc => tc.recipientName === previewGuardian.name)
                  const allItems = [
                    ...items.passwords.map(p => ({ type: 'password' as const, title: p!.title, sub: p!.username, icon: KeyRound })),
                    ...items.notes.map(n => ({ type: 'note' as const, title: n!.title, sub: '安全笔记', icon: StickyNote })),
                    ...capsules.map(c => ({ type: 'capsule' as const, title: c.title, sub: '时间胶囊', icon: Timer })),
                  ]
                  if (allItems.length === 0) {
                    return <p className="text-center text-slate-500 text-sm py-4">尚未分配任何内容</p>
                  }
                  return (
                    <>
                      <div className="flex items-center gap-3 text-xs text-slate-500 mb-2">
                        <span>共 {allItems.length} 条内容</span>
                        <span>|</span>
                        <span>{items.passwords.length} 条密码</span>
                        <span>{items.notes.length} 篇笔记</span>
                        {capsules.length > 0 && <span>{capsules.length} 个胶囊</span>}
                      </div>
                      {allItems.map((item, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700">
                          <item.icon className="w-4 h-4 text-emerald-400" />
                          <div className="flex-1 min-w-0">
                            <span className="text-sm text-white block truncate">{item.title}</span>
                            <span className="text-xs text-slate-500">{item.sub}</span>
                          </div>
                          <button className="text-xs text-emerald-400 px-2 py-1 bg-emerald-500/10 rounded-lg shrink-0">查看</button>
                        </div>
                      ))}
                    </>
                  )
                })()}
              </div>

              <p className="text-center text-xs text-slate-600 mt-4">
                此为模拟预览。实际接收时需要身份验证和密钥碎片联合解密。
              </p>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* Verification Demo Modal */}
      <AnimatePresence>
        {showVerificationDemo && (
          <Modal onClose={() => setShowVerificationDemo(false)} title="生存验证流程模拟">
            <div className="space-y-4">
              {verificationSteps.map((vs, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: i <= verifyStep ? 1 : 0.3, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`flex items-start gap-3 p-3 rounded-xl transition-colors ${
                    i <= verifyStep ? 'bg-slate-800/50' : ''
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg ${i <= verifyStep ? vs.bg : 'bg-slate-800'} flex items-center justify-center shrink-0`}>
                    <vs.icon className={`w-4 h-4 ${i <= verifyStep ? vs.color : 'text-slate-600'}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className={`text-sm font-medium ${i <= verifyStep ? 'text-white' : 'text-slate-600'}`}>{vs.title}</p>
                      <span className={`text-xs ${i <= verifyStep ? 'text-slate-400' : 'text-slate-700'}`}>{vs.days}</span>
                    </div>
                    <p className={`text-xs ${i <= verifyStep ? 'text-slate-400' : 'text-slate-700'}`}>{vs.desc}</p>
                  </div>
                  {i < verifyStep && <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-2" />}
                </motion.div>
              ))}

              {verifyStep === 2 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/20 text-center"
                >
                  <button
                    onClick={() => { setVerifyStep(0); setShowVerificationDemo(false); }}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    确认存活 (取消流程)
                  </button>
                  <p className="text-xs text-emerald-400/70 mt-2">点击后流程立即终止</p>
                </motion.div>
              )}

              <div className="flex justify-between mt-4">
                <button
                  onClick={() => setVerifyStep(Math.max(0, verifyStep - 1))}
                  disabled={verifyStep === 0}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white text-sm rounded-xl transition-colors"
                >
                  上一步
                </button>
                {verifyStep < verificationSteps.length - 1 ? (
                  <button
                    onClick={() => setVerifyStep(verifyStep + 1)}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white text-sm rounded-xl transition-colors flex items-center gap-1"
                  >
                    下一步 <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={() => setShowVerificationDemo(false)}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white text-sm rounded-xl transition-colors"
                  >
                    完成演示
                  </button>
                )}
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  )
}

function Modal({ children, onClose, title }: { children: React.ReactNode; onClose: () => void; title: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6">{children}</div>
      </motion.div>
    </motion.div>
  )
}
