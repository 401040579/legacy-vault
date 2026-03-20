import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShieldAlert, Plus, X, Phone, Mail, Clock, Shield,
  Check, AlertTriangle, FileText, User, ChevronRight
} from 'lucide-react'
import { useStore } from '../store'

const ACCESS_LEVELS = [
  { value: 'basic' as const, label: '基础级', desc: '紧急联系方式、医疗信息', color: 'text-blue-400' },
  { value: 'standard' as const, label: '标准级', desc: '密码、财务信息', color: 'text-amber-400' },
  { value: 'full' as const, label: '完整级', desc: '所有内容', color: 'text-emerald-400' },
]

export default function EmergencyPage() {
  const { emergencyContacts, emergencyLogs, addEmergencyContact, deleteEmergencyContact, addEmergencyLog } = useStore()
  const [showForm, setShowForm] = useState(false)
  const [showDemo, setShowDemo] = useState(false)
  const [demoStep, setDemoStep] = useState(0)

  const [formName, setFormName] = useState('')
  const [formEmail, setFormEmail] = useState('')
  const [formPhone, setFormPhone] = useState('')
  const [formLevel, setFormLevel] = useState<'basic' | 'standard' | 'full'>('basic')
  const [formWait, setFormWait] = useState(48)

  const handleAdd = () => {
    if (!formName) return
    addEmergencyContact({
      name: formName,
      email: formEmail,
      phone: formPhone,
      accessLevel: formLevel,
      waitPeriod: formWait,
    })
    setShowForm(false)
    setFormName('')
    setFormEmail('')
    setFormPhone('')
  }

  const startDemo = () => {
    setShowDemo(true)
    setDemoStep(0)
  }

  const demoSteps = [
    { title: '紧急访问请求已发起', desc: '张丽请求紧急访问你的保险箱', icon: AlertTriangle, color: 'text-amber-400' },
    { title: '等待期：48小时', desc: '系统已通知你本人。你可以在等待期内拒绝此请求。', icon: Clock, color: 'text-blue-400' },
    { title: '等待期结束，无人拒绝', desc: '请求者需要完成身份验证（面容识别 + 短信验证码）', icon: User, color: 'text-purple-400' },
    { title: '身份验证通过', desc: '请求者仅能访问你预先授权的"基础级"内容', icon: Shield, color: 'text-emerald-400' },
    { title: '访问已完成', desc: '完整的审计日志已记录。你将收到所有渠道的通知。', icon: Check, color: 'text-emerald-400' },
  ]

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">紧急传递</h1>
          <p className="text-sm text-slate-400 mt-1">设置紧急联系人，在需要时安全访问你授权的内容</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={startDemo}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-medium transition-colors"
          >
            模拟流程
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl text-sm font-medium transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            添加联系人
          </button>
        </div>
      </div>

      {/* Emergency contacts */}
      <div>
        <h3 className="text-sm font-medium text-slate-400 mb-3">紧急联系人</h3>
        {emergencyContacts.length === 0 ? (
          <div className="p-8 text-center bg-slate-900/50 border border-slate-800 rounded-2xl">
            <ShieldAlert className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-sm text-slate-500">还没有紧急联系人。添加信任的人以备不时之需。</p>
          </div>
        ) : (
          <div className="space-y-3">
            {emergencyContacts.map(contact => {
              const levelInfo = ACCESS_LEVELS.find(l => l.value === contact.accessLevel)
              return (
                <motion.div
                  key={contact.id}
                  layout
                  className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center">
                        <User className="w-6 h-6 text-slate-400" />
                      </div>
                      <div>
                        <p className="text-white font-medium">{contact.name}</p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                          <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {contact.email}</span>
                          <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {contact.phone}</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteEmergencyContact(contact.id)}
                      className="text-slate-600 hover:text-red-400 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <div className="p-3 rounded-xl bg-slate-800/50">
                      <p className="text-xs text-slate-500 mb-1">访问级别</p>
                      <p className={`text-sm font-medium ${levelInfo?.color}`}>{levelInfo?.label}</p>
                      <p className="text-xs text-slate-600 mt-0.5">{levelInfo?.desc}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-800/50">
                      <p className="text-xs text-slate-500 mb-1">等待期</p>
                      <p className="text-sm font-medium text-white">{contact.waitPeriod} 小时</p>
                      <p className="text-xs text-slate-600 mt-0.5">你可以在此期间拒绝</p>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>

      {/* Access logs */}
      <div>
        <h3 className="text-sm font-medium text-slate-400 mb-3">访问日志</h3>
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl divide-y divide-slate-800">
          {emergencyLogs.length === 0 ? (
            <p className="p-6 text-center text-sm text-slate-500">暂无访问记录</p>
          ) : (
            emergencyLogs.map(log => (
              <div key={log.id} className="flex items-center gap-3 px-4 py-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  log.status === 'approved' ? 'bg-emerald-500/10' : log.status === 'denied' ? 'bg-red-500/10' : 'bg-amber-500/10'
                }`}>
                  {log.status === 'approved' ? <Check className="w-4 h-4 text-emerald-400" /> :
                   log.status === 'denied' ? <X className="w-4 h-4 text-red-400" /> :
                   <Clock className="w-4 h-4 text-amber-400" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-white">{log.action}</p>
                  <p className="text-xs text-slate-500">{log.contactName} · {new Date(log.timestamp).toLocaleString('zh-CN')}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  log.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400' :
                  log.status === 'denied' ? 'bg-red-500/10 text-red-400' :
                  'bg-amber-500/10 text-amber-400'
                }`}>
                  {log.status === 'approved' ? '已通过' : log.status === 'denied' ? '已拒绝' : '待处理'}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Protocol explanation */}
      <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800">
        <h3 className="text-sm font-medium text-white mb-4 flex items-center gap-2">
          <FileText className="w-4 h-4 text-emerald-400" />
          紧急访问协议
        </h3>
        <div className="space-y-3">
          {[
            '紧急联系人发起访问请求',
            '系统通知你本人（多渠道：推送+邮件+短信）',
            '等待期内你可一键拒绝（24-168小时可配置）',
            '等待期结束，请求者需完成身份验证',
            '仅能访问你预先授权级别的内容',
            '完整审计日志记录所有操作',
          ].map((step, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-400 text-xs flex items-center justify-center shrink-0 mt-0.5">
                {i + 1}
              </div>
              <p className="text-sm text-slate-300">{step}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Add contact modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowForm(false)}
          >
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
                <h3 className="text-lg font-semibold text-white">添加紧急联系人</h3>
                <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="text-sm text-slate-300 mb-1 block">姓名</label>
                  <input value={formName} onChange={e => setFormName(e.target.value)} placeholder="联系人姓名" className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-emerald-500" />
                </div>
                <div>
                  <label className="text-sm text-slate-300 mb-1 block">邮箱</label>
                  <input value={formEmail} onChange={e => setFormEmail(e.target.value)} placeholder="email@example.com" className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-emerald-500" />
                </div>
                <div>
                  <label className="text-sm text-slate-300 mb-1 block">电话</label>
                  <input value={formPhone} onChange={e => setFormPhone(e.target.value)} placeholder="138****5678" className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-emerald-500" />
                </div>
                <div>
                  <label className="text-sm text-slate-300 mb-2 block">访问级别</label>
                  <div className="space-y-2">
                    {ACCESS_LEVELS.map(l => (
                      <button key={l.value} onClick={() => setFormLevel(l.value)}
                        className={`w-full p-3 rounded-xl border text-left transition-colors ${
                          formLevel === l.value ? 'bg-emerald-950/30 border-emerald-500/30' : 'bg-slate-800/50 border-slate-700'
                        }`}
                      >
                        <p className={`text-sm font-medium ${l.color}`}>{l.label}</p>
                        <p className="text-xs text-slate-400">{l.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm text-slate-300 mb-1 block">等待期（小时）</label>
                  <select value={formWait} onChange={e => setFormWait(Number(e.target.value))}
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500"
                  >
                    {[24, 48, 72, 168].map(h => (
                      <option key={h} value={h}>{h}小时 ({h/24}天)</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="px-6 py-4 border-t border-slate-800 flex justify-end gap-3">
                <button onClick={() => setShowForm(false)} className="px-4 py-2 text-slate-400 text-sm">取消</button>
                <button onClick={handleAdd} disabled={!formName} className="px-6 py-2 bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-700 text-white text-sm font-medium rounded-xl transition-colors">
                  添加
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Demo Modal */}
      <AnimatePresence>
        {showDemo && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowDemo(false)}
          >
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
                <h3 className="text-lg font-semibold text-white">紧急访问流程演示</h3>
                <button onClick={() => setShowDemo(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {demoSteps.map((step, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: i <= demoStep ? 1 : 0.3, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className={`flex items-start gap-3 p-3 rounded-xl transition-colors ${
                        i <= demoStep ? 'bg-slate-800/50' : ''
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        i <= demoStep ? 'bg-emerald-500/10' : 'bg-slate-800'
                      }`}>
                        <step.icon className={`w-4 h-4 ${i <= demoStep ? step.color : 'text-slate-600'}`} />
                      </div>
                      <div>
                        <p className={`text-sm font-medium ${i <= demoStep ? 'text-white' : 'text-slate-600'}`}>{step.title}</p>
                        <p className={`text-xs ${i <= demoStep ? 'text-slate-400' : 'text-slate-700'}`}>{step.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="flex justify-between mt-6">
                  <button
                    onClick={() => setDemoStep(Math.max(0, demoStep - 1))}
                    disabled={demoStep === 0}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white text-sm rounded-xl transition-colors"
                  >
                    上一步
                  </button>
                  {demoStep < demoSteps.length - 1 ? (
                    <button
                      onClick={() => setDemoStep(demoStep + 1)}
                      className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white text-sm rounded-xl transition-colors flex items-center gap-1"
                    >
                      下一步 <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setShowDemo(false)
                        addEmergencyLog({
                          contactName: '演示',
                          action: '模拟紧急访问流程完成',
                          status: 'approved',
                          timestamp: Date.now(),
                        })
                      }}
                      className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white text-sm rounded-xl transition-colors"
                    >
                      完成演示
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
