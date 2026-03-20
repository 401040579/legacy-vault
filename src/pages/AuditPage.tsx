import { motion } from 'framer-motion'
import {
  AlertTriangle, Check, Copy, KeyRound,
  ShieldCheck, ShieldAlert, Lock, Users
} from 'lucide-react'
import { useStore } from '../store'
import { checkPasswordStrength } from '../utils/crypto'
import { useNavigate } from 'react-router-dom'

export default function AuditPage() {
  const { passwords, guardians, inheritanceAllocations, notes } = useStore()
  const navigate = useNavigate()

  // Analysis
  const weakPasswords = passwords.filter(p => checkPasswordStrength(p.password).score < 40)
  const mediumPasswords = passwords.filter(p => {
    const s = checkPasswordStrength(p.password).score
    return s >= 40 && s < 70
  })
  const strongPasswords = passwords.filter(p => checkPasswordStrength(p.password).score >= 70)

  // Duplicate detection
  const passwordCounts = new Map<string, string[]>()
  passwords.forEach(p => {
    const existing = passwordCounts.get(p.password) || []
    existing.push(p.title)
    passwordCounts.set(p.password, existing)
  })
  const duplicates = Array.from(passwordCounts.entries()).filter(([_, titles]) => titles.length > 1)

  // Coverage
  const totalItems = passwords.length + notes.length
  const allocatedIds = new Set(inheritanceAllocations.map(a => a.itemId))
  const unallocated = [
    ...passwords.filter(p => !allocatedIds.has(p.id)).map(p => ({ title: p.title, type: 'password' as const })),
    ...notes.filter(n => !allocatedIds.has(n.id)).map(n => ({ title: n.title, type: 'note' as const })),
  ]
  const coverageRate = totalItems > 0 ? Math.round(((totalItems - unallocated.length) / totalItems) * 100) : 0

  // Score
  let score = 100
  score -= weakPasswords.length * 8
  score -= duplicates.length * 10
  score -= mediumPasswords.length * 3
  if (coverageRate < 50) score -= 15
  if (guardians.length === 0) score -= 10
  score = Math.max(0, Math.min(100, score))

  const scoreColor = score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444'
  const scoreLabel = score >= 80 ? '优秀' : score >= 60 ? '良好' : '需要改善'

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">安全审计</h1>
        <p className="text-sm text-slate-400 mt-1">检查你的安全状态，找出潜在风险</p>
      </div>

      {/* Overall Score */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-8 rounded-2xl bg-slate-900/50 border border-slate-800 text-center"
      >
        <div className="relative w-32 h-32 mx-auto mb-4">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="42" fill="none" stroke="#1e293b" strokeWidth="8" />
            <motion.circle
              cx="50" cy="50" r="42" fill="none" stroke={scoreColor} strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${score * 2.64} 264`}
              initial={{ strokeDasharray: '0 264' }}
              animate={{ strokeDasharray: `${score * 2.64} 264` }}
              transition={{ duration: 1.5, delay: 0.3 }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-white">{score}</span>
            <span className="text-xs text-slate-400">/ 100</span>
          </div>
        </div>
        <h2 className="text-xl font-bold text-white mb-1">安全评分：{scoreLabel}</h2>
        <p className="text-sm text-slate-400">
          {score >= 80 ? '你的保险箱安全状态良好。继续保持！' :
           score >= 60 ? '安全状态还不错，但有改善空间。' :
           '请尽快修复以下安全问题。'}
        </p>
      </motion.div>

      {/* Issues grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Weak passwords */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`p-5 rounded-2xl border ${
            weakPasswords.length > 0
              ? 'bg-red-950/20 border-red-500/20'
              : 'bg-emerald-950/20 border-emerald-500/20'
          }`}
        >
          <div className="flex items-center gap-3 mb-4">
            {weakPasswords.length > 0 ? (
              <ShieldAlert className="w-5 h-5 text-red-400" />
            ) : (
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            )}
            <h3 className="text-white font-medium">弱密码检测</h3>
            <span className={`ml-auto text-sm font-medium ${weakPasswords.length > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
              {weakPasswords.length > 0 ? `${weakPasswords.length}个问题` : '无问题'}
            </span>
          </div>

          {weakPasswords.length > 0 ? (
            <div className="space-y-2">
              {weakPasswords.map(p => {
                const s = checkPasswordStrength(p.password)
                return (
                  <div key={p.id} className="flex items-center gap-3 p-2 rounded-lg bg-slate-900/50">
                    <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                    <span className="text-sm text-white flex-1">{p.title}</span>
                    <span className="text-xs" style={{ color: s.color }}>{s.label}</span>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-sm text-slate-400 flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400" />
              所有密码都足够安全
            </p>
          )}
        </motion.div>

        {/* Duplicate passwords */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`p-5 rounded-2xl border ${
            duplicates.length > 0
              ? 'bg-amber-950/20 border-amber-500/20'
              : 'bg-emerald-950/20 border-emerald-500/20'
          }`}
        >
          <div className="flex items-center gap-3 mb-4">
            {duplicates.length > 0 ? (
              <Copy className="w-5 h-5 text-amber-400" />
            ) : (
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            )}
            <h3 className="text-white font-medium">重复密码检测</h3>
            <span className={`ml-auto text-sm font-medium ${duplicates.length > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {duplicates.length > 0 ? `${duplicates.length}组重复` : '无重复'}
            </span>
          </div>

          {duplicates.length > 0 ? (
            <div className="space-y-2">
              {duplicates.map(([_, titles], i) => (
                <div key={i} className="p-2 rounded-lg bg-slate-900/50">
                  <p className="text-xs text-amber-400 mb-1">以下账号使用了相同密码：</p>
                  <p className="text-sm text-white">{titles.join('、')}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400 flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400" />
              没有重复使用的密码
            </p>
          )}
        </motion.div>

        {/* Password strength distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800"
        >
          <div className="flex items-center gap-3 mb-4">
            <KeyRound className="w-5 h-5 text-slate-400" />
            <h3 className="text-white font-medium">密码强度分布</h3>
          </div>

          <div className="space-y-3">
            {[
              { label: '强密码', count: strongPasswords.length, color: '#10b981', bg: 'bg-emerald-500' },
              { label: '中等密码', count: mediumPasswords.length, color: '#f59e0b', bg: 'bg-amber-500' },
              { label: '弱密码', count: weakPasswords.length, color: '#ef4444', bg: 'bg-red-500' },
            ].map(item => (
              <div key={item.label}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-slate-300">{item.label}</span>
                  <span style={{ color: item.color }}>{item.count}</span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: passwords.length > 0 ? `${(item.count / passwords.length) * 100}%` : '0%' }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className={`h-full rounded-full ${item.bg}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Inheritance coverage */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className={`p-5 rounded-2xl border ${
            coverageRate < 50
              ? 'bg-blue-950/20 border-blue-500/20'
              : 'bg-emerald-950/20 border-emerald-500/20'
          }`}
        >
          <div className="flex items-center gap-3 mb-4">
            <Users className="w-5 h-5 text-blue-400" />
            <h3 className="text-white font-medium">遗产覆盖率</h3>
            <span className={`ml-auto text-sm font-medium ${coverageRate >= 50 ? 'text-emerald-400' : 'text-blue-400'}`}>
              {coverageRate}%
            </span>
          </div>

          <div className="h-3 bg-slate-800 rounded-full overflow-hidden mb-3">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${coverageRate}%` }}
              transition={{ duration: 1, delay: 0.6 }}
              className={`h-full rounded-full ${coverageRate >= 50 ? 'bg-emerald-500' : 'bg-blue-500'}`}
            />
          </div>

          {unallocated.length > 0 ? (
            <div>
              <p className="text-xs text-slate-400 mb-2">{unallocated.length}条内容尚未分配守护人：</p>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {unallocated.slice(0, 5).map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="w-1 h-1 rounded-full bg-slate-600" />
                    {item.title}
                  </div>
                ))}
                {unallocated.length > 5 && (
                  <p className="text-xs text-slate-600">...还有{unallocated.length - 5}条</p>
                )}
              </div>
              <button
                onClick={() => navigate('/inheritance')}
                className="mt-3 text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                前往分配 →
              </button>
            </div>
          ) : (
            <p className="text-sm text-slate-400 flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400" />
              所有内容都已安排传承
            </p>
          )}
        </motion.div>
      </div>

      {/* Security recommendations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800"
      >
        <h3 className="text-white font-medium mb-4 flex items-center gap-2">
          <Lock className="w-5 h-5 text-emerald-400" />
          安全建议
        </h3>
        <div className="space-y-3">
          {[
            { done: weakPasswords.length === 0, text: '所有密码都达到强安全级别' },
            { done: duplicates.length === 0, text: '每个账号使用独立密码' },
            { done: guardians.length > 0, text: '至少设置一位守护人' },
            { done: coverageRate >= 50, text: '遗产覆盖率达到50%以上' },
            { done: passwords.length >= 5, text: '保存了足够数量的密码' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              {item.done ? (
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <div className="w-4 h-4 rounded-full border border-slate-600 shrink-0" />
              )}
              <span className={`text-sm ${item.done ? 'text-slate-300' : 'text-slate-500'}`}>{item.text}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
