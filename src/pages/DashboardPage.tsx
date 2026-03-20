import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Shield, KeyRound, StickyNote, Users, Timer,
  AlertTriangle, Copy, Eye, EyeOff
} from 'lucide-react'
import { useStore } from '../store'
import { useState } from 'react'
import { checkPasswordStrength } from '../utils/crypto'

export default function DashboardPage() {
  const navigate = useNavigate()
  const { userName, passwords, notes, guardians, timeCapsules, inheritanceAllocations } = useStore()
  const [revealedPw, setRevealedPw] = useState<string | null>(null)

  // Compute security score
  const totalItems = passwords.length + notes.length
  const allocatedItems = inheritanceAllocations.length
  const coverageRate = totalItems > 0 ? Math.round((allocatedItems / totalItems) * 100) : 0

  const weakPasswords = passwords.filter(p => checkPasswordStrength(p.password).score < 40)
  const duplicatePasswords = passwords.filter((p, i) =>
    passwords.findIndex(q => q.password === p.password) !== i
  )

  let securityScore = 90
  if (weakPasswords.length > 0) securityScore -= weakPasswords.length * 5
  if (duplicatePasswords.length > 0) securityScore -= duplicatePasswords.length * 5
  if (coverageRate < 50) securityScore -= 10
  if (guardians.length === 0) securityScore -= 15
  securityScore = Math.max(0, Math.min(100, securityScore))

  const greetHour = new Date().getHours()
  const greeting = greetHour < 12 ? '早上好' : greetHour < 18 ? '下午好' : '晚上好'

  const recentItems = [
    ...passwords.map(p => ({ type: 'password' as const, id: p.id, title: p.title, sub: p.username, time: p.updatedAt, password: p.password })),
    ...notes.map(n => ({ type: 'note' as const, id: n.id, title: n.title, sub: '安全笔记', time: n.updatedAt, password: '' })),
  ].sort((a, b) => b.time - a.time).slice(0, 5)

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
      {/* Greeting */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-white">{greeting}，{userName || '用户'}</h1>
        <p className="text-slate-400 text-sm mt-1">你的保险箱一切安全</p>
      </motion.div>

      {/* Security Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="p-6 rounded-2xl bg-gradient-to-br from-emerald-950/40 to-slate-900/40 border border-emerald-500/20"
      >
        <div className="flex items-center gap-3 mb-4">
          <Shield className="w-6 h-6 text-emerald-400" />
          <div>
            <h2 className="text-white font-semibold">安全等级：{securityScore >= 80 ? '优秀' : securityScore >= 60 ? '良好' : '需要改善'}</h2>
          </div>
        </div>

        <div className="h-3 bg-slate-800 rounded-full overflow-hidden mb-4">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${securityScore}%` }}
            transition={{ delay: 0.5, duration: 1 }}
            className="h-full rounded-full"
            style={{
              backgroundColor: securityScore >= 80 ? '#10b981' : securityScore >= 60 ? '#f59e0b' : '#ef4444'
            }}
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-white">{passwords.length}</p>
            <p className="text-xs text-slate-400">密码</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{notes.length}</p>
            <p className="text-xs text-slate-400">笔记</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{guardians.length}</p>
            <p className="text-xs text-slate-400">守护人</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{coverageRate}%</p>
            <p className="text-xs text-slate-400">遗产覆盖率</p>
          </div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h3 className="text-sm font-medium text-slate-400 mb-3">快速操作</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: KeyRound, label: '新增密码', color: 'text-emerald-400', bg: 'bg-emerald-500/10', to: '/passwords' },
            { icon: StickyNote, label: '新增笔记', color: 'text-blue-400', bg: 'bg-blue-500/10', to: '/notes' },
            { icon: Users, label: '管理守护人', color: 'text-purple-400', bg: 'bg-purple-500/10', to: '/inheritance' },
            { icon: Timer, label: '新建胶囊', color: 'text-amber-400', bg: 'bg-amber-500/10', to: '/capsules' },
          ].map((item, i) => (
            <button
              key={i}
              onClick={() => navigate(item.to)}
              className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 hover:border-slate-700 transition-colors flex flex-col items-center gap-2 group"
            >
              <div className={`w-10 h-10 rounded-lg ${item.bg} flex items-center justify-center`}>
                <item.icon className={`w-5 h-5 ${item.color}`} />
              </div>
              <span className="text-sm text-slate-300 group-hover:text-white transition-colors">{item.label}</span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Recent Items */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h3 className="text-sm font-medium text-slate-400 mb-3">最近访问</h3>
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl divide-y divide-slate-800">
          {recentItems.map(item => (
            <div key={item.id} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-800/30 transition-colors">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                item.type === 'password' ? 'bg-emerald-500/10' : 'bg-blue-500/10'
              }`}>
                {item.type === 'password' ? (
                  <KeyRound className="w-4 h-4 text-emerald-400" />
                ) : (
                  <StickyNote className="w-4 h-4 text-blue-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white truncate">{item.title}</p>
                <p className="text-xs text-slate-500 truncate">{item.sub}</p>
              </div>
              {item.type === 'password' && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setRevealedPw(revealedPw === item.id ? null : item.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                  >
                    {revealedPw === item.id ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => copyToClipboard(item.password)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              )}
              {revealedPw === item.id && (
                <span className="text-xs text-emerald-400 font-mono">{item.password}</span>
              )}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Alerts */}
      {(weakPasswords.length > 0 || coverageRate < 50) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="text-sm font-medium text-slate-400 mb-3">待办提醒</h3>
          <div className="space-y-2">
            {weakPasswords.length > 0 && (
              <button
                onClick={() => navigate('/audit')}
                className="w-full p-3 rounded-xl bg-amber-950/30 border border-amber-500/20 flex items-center gap-3 text-left hover:bg-amber-950/40 transition-colors"
              >
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
                <span className="text-sm text-amber-200/80">
                  {weakPasswords.length}个密码安全性较弱，建议更新
                </span>
              </button>
            )}
            {coverageRate < 50 && (
              <button
                onClick={() => navigate('/inheritance')}
                className="w-full p-3 rounded-xl bg-blue-950/30 border border-blue-500/20 flex items-center gap-3 text-left hover:bg-blue-950/40 transition-colors"
              >
                <Users className="w-5 h-5 text-blue-400 shrink-0" />
                <span className="text-sm text-blue-200/80">
                  还有{totalItems - allocatedItems}条内容未设置守护人
                </span>
              </button>
            )}
            {timeCapsules.length > 0 && (
              <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-500/20 flex items-center gap-3">
                <Timer className="w-5 h-5 text-purple-400 shrink-0" />
                <span className="text-sm text-purple-200/80">
                  时间胶囊"{timeCapsules[0].title}" 将在{' '}
                  {new Date(timeCapsules[0].deliveryDate).toLocaleDateString('zh-CN')} 送达
                </span>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Security footer */}
      <div className="pt-4 text-center">
        <p className="text-xs text-slate-600 flex items-center justify-center gap-1">
          <Shield className="w-3 h-3 text-emerald-600" />
          安全连接 · 零知识加密 · 数据已加密存储
        </p>
      </div>
    </div>
  )
}
