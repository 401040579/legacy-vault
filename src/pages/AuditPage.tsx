import { motion } from 'framer-motion'
import {
  AlertTriangle, Check, Copy, KeyRound,
  ShieldCheck, ShieldAlert, Lock, Users, ChevronRight,
  AlertCircle
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

  // Breach detection
  const breachedPasswords = passwords.filter(p => p.breached)

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

  // Detailed scoring
  const strengthScore = passwords.length > 0
    ? Math.round(30 * (strongPasswords.length / passwords.length))
    : 30
  const duplicateScore = duplicates.length === 0 ? 20 : Math.max(0, 20 - duplicates.length * 5)
  const breachScore = breachedPasswords.length === 0 ? 20 : Math.max(0, 20 - breachedPasswords.length * 5)
  const inheritanceScore = Math.round(30 * (coverageRate / 100))

  const score = Math.min(100, strengthScore + duplicateScore + breachScore + inheritanceScore)
  const scoreColor = score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444'
  const scoreLabel = score >= 80 ? '优秀' : score >= 60 ? '良好' : '需要改善'

  // Recommendations
  const recommendations = [
    { done: weakPasswords.length === 0, text: '所有密码都达到强安全级别', action: '/passwords', actionLabel: '管理密码', priority: weakPasswords.length > 0 ? 'high' : 'low' },
    { done: duplicates.length === 0, text: '每个账号使用独立密码', action: '/passwords', actionLabel: '修改密码', priority: duplicates.length > 0 ? 'high' : 'low' },
    { done: breachedPasswords.length === 0, text: '没有密码出现在泄露数据库中', action: '/passwords', actionLabel: '更换密码', priority: breachedPasswords.length > 0 ? 'critical' : 'low' },
    { done: guardians.length >= 2, text: '至少设置两位守护人', action: '/inheritance', actionLabel: '添加守护人', priority: guardians.length < 2 ? 'medium' : 'low' },
    { done: coverageRate >= 80, text: '遗产覆盖率达到80%以上', action: '/inheritance', actionLabel: '分配内容', priority: coverageRate < 50 ? 'medium' : 'low' },
    { done: passwords.length >= 10, text: '保存了足够数量的密码(10+)', action: '/passwords', actionLabel: '添加密码', priority: passwords.length < 10 ? 'low' : 'low' },
  ]

  const scoreCategories = [
    { label: '密码强度', score: strengthScore, max: 30, color: '#10b981' },
    { label: '重复检测', score: duplicateScore, max: 20, color: '#3b82f6' },
    { label: '泄露检测', score: breachScore, max: 20, color: '#f59e0b' },
    { label: '继承覆盖', score: inheritanceScore, max: 30, color: '#8b5cf6' },
  ]

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
        className="p-8 rounded-2xl bg-slate-900/50 border border-slate-800"
      >
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="relative w-32 h-32 shrink-0">
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

          <div className="flex-1 text-center md:text-left">
            <h2 className="text-xl font-bold text-white mb-1">安全评分：{scoreLabel}</h2>
            <p className="text-sm text-slate-400 mb-4">
              {score >= 80 ? '你的保险箱安全状态良好。继续保持！' :
               score >= 60 ? '安全状态还不错，但有改善空间。' :
               '请尽快修复以下安全问题。'}
            </p>

            {/* Score breakdown */}
            <div className="grid grid-cols-2 gap-2">
              {scoreCategories.map((cat) => (
                <div key={cat.label} className="flex items-center gap-2">
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-xs mb-0.5">
                      <span className="text-slate-400">{cat.label}</span>
                      <span style={{ color: cat.color }}>{cat.score}/{cat.max}</span>
                    </div>
                    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(cat.score / cat.max) * 100}%` }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: cat.color }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
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

        {/* Breached passwords */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className={`p-5 rounded-2xl border ${
            breachedPasswords.length > 0
              ? 'bg-red-950/20 border-red-500/20'
              : 'bg-emerald-950/20 border-emerald-500/20'
          }`}
        >
          <div className="flex items-center gap-3 mb-4">
            {breachedPasswords.length > 0 ? (
              <AlertCircle className="w-5 h-5 text-red-400" />
            ) : (
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            )}
            <h3 className="text-white font-medium">泄露检测</h3>
            <span className={`ml-auto text-sm font-medium ${breachedPasswords.length > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
              {breachedPasswords.length > 0 ? `${breachedPasswords.length}个泄露` : '无泄露'}
            </span>
          </div>

          {breachedPasswords.length > 0 ? (
            <div className="space-y-2">
              {breachedPasswords.map(p => (
                <div key={p.id} className="flex items-center gap-3 p-2 rounded-lg bg-slate-900/50">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span className="text-sm text-white flex-1">{p.title}</span>
                  <span className="text-xs text-red-400">已泄露</span>
                </div>
              ))}
              <p className="text-xs text-red-400/70 mt-1">
                这些密码已出现在已知的数据泄露事件中，请立即更换。
              </p>
            </div>
          ) : (
            <p className="text-sm text-slate-400 flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400" />
              没有密码出现在已知泄露数据库中
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

        {/* Password strength distribution - Bar chart */}
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

          {passwords.length > 0 ? (
            <div className="space-y-4">
              {/* Bar chart visualization */}
              <div className="flex items-end gap-3 h-32 px-4">
                {[
                  { label: '强', count: strongPasswords.length, color: 'bg-emerald-500', textColor: 'text-emerald-400' },
                  { label: '中', count: mediumPasswords.length, color: 'bg-amber-500', textColor: 'text-amber-400' },
                  { label: '弱', count: weakPasswords.length, color: 'bg-red-500', textColor: 'text-red-400' },
                ].map(item => {
                  const maxCount = Math.max(strongPasswords.length, mediumPasswords.length, weakPasswords.length, 1)
                  const heightPct = (item.count / maxCount) * 100
                  return (
                    <div key={item.label} className="flex-1 flex flex-col items-center gap-1">
                      <span className={`text-sm font-bold ${item.textColor}`}>{item.count}</span>
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${Math.max(heightPct, 5)}%` }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className={`w-full rounded-t-lg ${item.color} min-h-[4px]`}
                      />
                      <span className="text-xs text-slate-400 mt-1">{item.label}</span>
                    </div>
                  )
                })}
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-800">
                {[
                  { label: '强密码', count: strongPasswords.length, color: '#10b981', bg: 'bg-emerald-500' },
                  { label: '中等密码', count: mediumPasswords.length, color: '#f59e0b', bg: 'bg-amber-500' },
                  { label: '弱密码', count: weakPasswords.length, color: '#ef4444', bg: 'bg-red-500' },
                ].map(item => (
                  <div key={item.label}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-slate-300">{item.label}</span>
                      <span style={{ color: item.color }}>{item.count} ({passwords.length > 0 ? Math.round((item.count / passwords.length) * 100) : 0}%)</span>
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
            </div>
          ) : (
            <p className="text-sm text-slate-500 text-center py-4">暂无密码数据</p>
          )}
        </motion.div>
      </div>

      {/* Inheritance coverage with ring */}
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
        </div>

        <div className="flex items-center gap-6">
          {/* Coverage ring */}
          <div className="relative w-20 h-20 shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" fill="none" stroke="#1e293b" strokeWidth="8" />
              <motion.circle
                cx="50" cy="50" r="40" fill="none"
                stroke={coverageRate >= 50 ? '#10b981' : '#3b82f6'}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${coverageRate * 2.51} 251`}
                initial={{ strokeDasharray: '0 251' }}
                animate={{ strokeDasharray: `${coverageRate * 2.51} 251` }}
                transition={{ duration: 1.2, delay: 0.6 }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`text-lg font-bold ${coverageRate >= 50 ? 'text-emerald-400' : 'text-blue-400'}`}>
                {coverageRate}%
              </span>
            </div>
          </div>

          <div className="flex-1">
            {unallocated.length > 0 ? (
              <div>
                <p className="text-xs text-slate-400 mb-2">{unallocated.length}条内容尚未分配守护人：</p>
                <div className="space-y-1 max-h-24 overflow-y-auto">
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
                  className="mt-3 text-xs text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1"
                >
                  前往分配 <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <p className="text-sm text-slate-400 flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400" />
                所有内容都已安排传承
              </p>
            )}
          </div>
        </div>
      </motion.div>

      {/* Actionable recommendations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800"
      >
        <h3 className="text-white font-medium mb-4 flex items-center gap-2">
          <Lock className="w-5 h-5 text-emerald-400" />
          安全改进建议
        </h3>
        <div className="space-y-3">
          {recommendations
            .sort((a, b) => {
              const priority = { critical: 0, high: 1, medium: 2, low: 3 }
              return (priority[a.priority as keyof typeof priority] || 3) - (priority[b.priority as keyof typeof priority] || 3)
            })
            .map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              {item.done ? (
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <div className={`w-4 h-4 rounded-full border shrink-0 ${
                  item.priority === 'critical' ? 'border-red-500 bg-red-500/20' :
                  item.priority === 'high' ? 'border-amber-500 bg-amber-500/20' :
                  'border-slate-600'
                }`} />
              )}
              <span className={`text-sm flex-1 ${item.done ? 'text-slate-300' : 'text-slate-400'}`}>{item.text}</span>
              {!item.done && (
                <button
                  onClick={() => navigate(item.action)}
                  className="text-xs text-emerald-400 hover:text-emerald-300 px-2 py-1 bg-emerald-500/10 rounded-lg transition-colors flex items-center gap-1 shrink-0"
                >
                  {item.actionLabel}
                  <ChevronRight className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
