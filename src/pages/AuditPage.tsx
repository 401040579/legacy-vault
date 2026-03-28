import { motion } from 'framer-motion'
import {
  AlertTriangle, Check, Copy, KeyRound,
  ShieldCheck, ShieldAlert, Lock, Users, ChevronRight,
  AlertCircle
} from 'lucide-react'
import { useStore } from '../store'
import { checkPasswordStrength } from '../utils/crypto'
import { useNavigate } from 'react-router-dom'
import { useI18n } from '../i18n'

export default function AuditPage() {
  const { passwords, guardians, inheritanceAllocations, notes } = useStore()
  const navigate = useNavigate()
  const { t } = useI18n()

  const weakPasswords = passwords.filter(p => checkPasswordStrength(p.password).score < 40)
  const mediumPasswords = passwords.filter(p => { const s = checkPasswordStrength(p.password).score; return s >= 40 && s < 70 })
  const strongPasswords = passwords.filter(p => checkPasswordStrength(p.password).score >= 70)
  const breachedPasswords = passwords.filter(p => p.breached)

  const passwordCounts = new Map<string, string[]>()
  passwords.forEach(p => { const existing = passwordCounts.get(p.password) || []; existing.push(p.title); passwordCounts.set(p.password, existing) })
  const duplicates = Array.from(passwordCounts.entries()).filter(([_, titles]) => titles.length > 1)

  const totalItems = passwords.length + notes.length
  const allocatedIds = new Set(inheritanceAllocations.map(a => a.itemId))
  const unallocated = [
    ...passwords.filter(p => !allocatedIds.has(p.id)).map(p => ({ title: p.title, type: 'password' as const })),
    ...notes.filter(n => !allocatedIds.has(n.id)).map(n => ({ title: n.title, type: 'note' as const })),
  ]
  const coverageRate = totalItems > 0 ? Math.round(((totalItems - unallocated.length) / totalItems) * 100) : 0

  const strengthScore = passwords.length > 0 ? Math.round(30 * (strongPasswords.length / passwords.length)) : 30
  const duplicateScore = duplicates.length === 0 ? 20 : Math.max(0, 20 - duplicates.length * 5)
  const breachScore = breachedPasswords.length === 0 ? 20 : Math.max(0, 20 - breachedPasswords.length * 5)
  const inheritanceScore = Math.round(30 * (coverageRate / 100))
  const score = Math.min(100, strengthScore + duplicateScore + breachScore + inheritanceScore)
  const scoreColor = score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444'
  const scoreLabel = score >= 80 ? t('audit.scoreExcellent') : score >= 60 ? t('audit.scoreGood') : t('audit.scoreNeedsImprovement')
  const scoreMsg = score >= 80 ? t('audit.scoreExcellentMsg') : score >= 60 ? t('audit.scoreGoodMsg') : t('audit.scoreNeedsImprovementMsg')

  const recommendations = [
    { done: weakPasswords.length === 0, text: t('audit.recAllStrong'), action: '/passwords', actionLabel: t('audit.recManagePasswords'), priority: weakPasswords.length > 0 ? 'high' : 'low' },
    { done: duplicates.length === 0, text: t('audit.recUniquePasswords'), action: '/passwords', actionLabel: t('audit.recChangePasswords'), priority: duplicates.length > 0 ? 'high' : 'low' },
    { done: breachedPasswords.length === 0, text: t('audit.recNoBreaches'), action: '/passwords', actionLabel: t('audit.recChangeBreached'), priority: breachedPasswords.length > 0 ? 'critical' : 'low' },
    { done: guardians.length >= 2, text: t('audit.recTwoGuardians'), action: '/inheritance', actionLabel: t('audit.recAddGuardians'), priority: guardians.length < 2 ? 'medium' : 'low' },
    { done: coverageRate >= 80, text: t('audit.recCoverage80'), action: '/inheritance', actionLabel: t('audit.recAllocateContent'), priority: coverageRate < 50 ? 'medium' : 'low' },
    { done: passwords.length >= 10, text: t('audit.recEnoughPasswords'), action: '/passwords', actionLabel: t('audit.recAddPasswords'), priority: passwords.length < 10 ? 'low' : 'low' },
  ]

  const scoreCategories = [
    { label: t('audit.catPasswordStrength'), score: strengthScore, max: 30, color: '#10b981' },
    { label: t('audit.catDuplicate'), score: duplicateScore, max: 20, color: '#3b82f6' },
    { label: t('audit.catBreach'), score: breachScore, max: 20, color: '#f59e0b' },
    { label: t('audit.catInheritance'), score: inheritanceScore, max: 30, color: '#8b5cf6' },
  ]

  const sep = (a: string[]) => a.join(', ')

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">{t('audit.title')}</h1>
        <p className="text-sm text-slate-400 mt-1">{t('audit.subtitle')}</p>
      </div>

      {/* Overall Score */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-8 rounded-2xl bg-slate-900/50 border border-slate-800">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="relative w-32 h-32 shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="none" stroke="#1e293b" strokeWidth="8" />
              <motion.circle cx="50" cy="50" r="42" fill="none" stroke={scoreColor} strokeWidth="8" strokeLinecap="round"
                strokeDasharray={`${score * 2.64} 264`} initial={{ strokeDasharray: '0 264' }} animate={{ strokeDasharray: `${score * 2.64} 264` }} transition={{ duration: 1.5, delay: 0.3 }} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-white">{score}</span>
              <span className="text-xs text-slate-400">/ 100</span>
            </div>
          </div>
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-xl font-bold text-white mb-1">{t('audit.scoreLabel', { label: scoreLabel })}</h2>
            <p className="text-sm text-slate-400 mb-4">{scoreMsg}</p>
            <div className="grid grid-cols-2 gap-2">
              {scoreCategories.map((cat) => (
                <div key={cat.label} className="flex items-center gap-2">
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-xs mb-0.5">
                      <span className="text-slate-400">{cat.label}</span>
                      <span style={{ color: cat.color }}>{cat.score}/{cat.max}</span>
                    </div>
                    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${(cat.score / cat.max) * 100}%` }} transition={{ duration: 1, delay: 0.5 }} className="h-full rounded-full" style={{ backgroundColor: cat.color }} />
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
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className={`p-5 rounded-2xl border ${weakPasswords.length > 0 ? 'bg-red-950/20 border-red-500/20' : 'bg-emerald-950/20 border-emerald-500/20'}`}>
          <div className="flex items-center gap-3 mb-4">
            {weakPasswords.length > 0 ? <ShieldAlert className="w-5 h-5 text-red-400" /> : <ShieldCheck className="w-5 h-5 text-emerald-400" />}
            <h3 className="text-white font-medium">{t('audit.weakPasswordTitle')}</h3>
            <span className={`ml-auto text-sm font-medium ${weakPasswords.length > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
              {weakPasswords.length > 0 ? t('audit.issues', { count: weakPasswords.length }) : t('audit.noIssues')}
            </span>
          </div>
          {weakPasswords.length > 0 ? (
            <div className="space-y-2">
              {weakPasswords.map(p => { const s = checkPasswordStrength(p.password); return (
                <div key={p.id} className="flex items-center gap-3 p-2 rounded-lg bg-slate-900/50"><AlertTriangle className="w-4 h-4 text-red-400 shrink-0" /><span className="text-sm text-white flex-1">{p.title}</span><span className="text-xs" style={{ color: s.color }}>{s.label}</span></div>
              )})}
            </div>
          ) : (<p className="text-sm text-slate-400 flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" />{t('audit.allPasswordsSecure')}</p>)}
        </motion.div>

        {/* Breached passwords */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className={`p-5 rounded-2xl border ${breachedPasswords.length > 0 ? 'bg-red-950/20 border-red-500/20' : 'bg-emerald-950/20 border-emerald-500/20'}`}>
          <div className="flex items-center gap-3 mb-4">
            {breachedPasswords.length > 0 ? <AlertCircle className="w-5 h-5 text-red-400" /> : <ShieldCheck className="w-5 h-5 text-emerald-400" />}
            <h3 className="text-white font-medium">{t('audit.breachTitle')}</h3>
            <span className={`ml-auto text-sm font-medium ${breachedPasswords.length > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
              {breachedPasswords.length > 0 ? t('audit.breachCount', { count: breachedPasswords.length }) : t('audit.noBreach')}
            </span>
          </div>
          {breachedPasswords.length > 0 ? (
            <div className="space-y-2">
              {breachedPasswords.map(p => (<div key={p.id} className="flex items-center gap-3 p-2 rounded-lg bg-slate-900/50"><AlertCircle className="w-4 h-4 text-red-400 shrink-0" /><span className="text-sm text-white flex-1">{p.title}</span><span className="text-xs text-red-400">{t('audit.breached')}</span></div>))}
              <p className="text-xs text-red-400/70 mt-1">{t('audit.breachWarning')}</p>
            </div>
          ) : (<p className="text-sm text-slate-400 flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" />{t('audit.noBreachDetected')}</p>)}
        </motion.div>

        {/* Duplicate passwords */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className={`p-5 rounded-2xl border ${duplicates.length > 0 ? 'bg-amber-950/20 border-amber-500/20' : 'bg-emerald-950/20 border-emerald-500/20'}`}>
          <div className="flex items-center gap-3 mb-4">
            {duplicates.length > 0 ? <Copy className="w-5 h-5 text-amber-400" /> : <ShieldCheck className="w-5 h-5 text-emerald-400" />}
            <h3 className="text-white font-medium">{t('audit.duplicateTitle')}</h3>
            <span className={`ml-auto text-sm font-medium ${duplicates.length > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {duplicates.length > 0 ? t('audit.duplicateCount', { count: duplicates.length }) : t('audit.noDuplicate')}
            </span>
          </div>
          {duplicates.length > 0 ? (
            <div className="space-y-2">
              {duplicates.map(([_, titles], i) => (<div key={i} className="p-2 rounded-lg bg-slate-900/50"><p className="text-xs text-amber-400 mb-1">{t('audit.duplicateNote')}</p><p className="text-sm text-white">{sep(titles)}</p></div>))}
            </div>
          ) : (<p className="text-sm text-slate-400 flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" />{t('audit.noDuplicateDetected')}</p>)}
        </motion.div>

        {/* Password strength distribution */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800">
          <div className="flex items-center gap-3 mb-4"><KeyRound className="w-5 h-5 text-slate-400" /><h3 className="text-white font-medium">{t('audit.strengthDistribution')}</h3></div>
          {passwords.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-end gap-3 h-32 px-4">
                {[{ label: t('audit.strong'), count: strongPasswords.length, color: 'bg-emerald-500', textColor: 'text-emerald-400' },
                  { label: t('audit.medium'), count: mediumPasswords.length, color: 'bg-amber-500', textColor: 'text-amber-400' },
                  { label: t('audit.weak'), count: weakPasswords.length, color: 'bg-red-500', textColor: 'text-red-400' },
                ].map(item => {
                  const maxCount = Math.max(strongPasswords.length, mediumPasswords.length, weakPasswords.length, 1)
                  const heightPct = (item.count / maxCount) * 100
                  return (
                    <div key={item.label} className="flex-1 flex flex-col items-center gap-1">
                      <span className={`text-sm font-bold ${item.textColor}`}>{item.count}</span>
                      <motion.div initial={{ height: 0 }} animate={{ height: `${Math.max(heightPct, 5)}%` }} transition={{ duration: 1, delay: 0.5 }} className={`w-full rounded-t-lg ${item.color} min-h-[4px]`} />
                      <span className="text-xs text-slate-400 mt-1">{item.label}</span>
                    </div>
                  )
                })}
              </div>
              <div className="space-y-2 pt-2 border-t border-slate-800">
                {[{ label: t('audit.strongPasswords'), count: strongPasswords.length, color: '#10b981', bg: 'bg-emerald-500' },
                  { label: t('audit.mediumPasswords'), count: mediumPasswords.length, color: '#f59e0b', bg: 'bg-amber-500' },
                  { label: t('audit.weakPasswords'), count: weakPasswords.length, color: '#ef4444', bg: 'bg-red-500' },
                ].map(item => (
                  <div key={item.label}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-slate-300">{item.label}</span>
                      <span style={{ color: item.color }}>{item.count} ({passwords.length > 0 ? Math.round((item.count / passwords.length) * 100) : 0}%)</span>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: passwords.length > 0 ? `${(item.count / passwords.length) * 100}%` : '0%' }} transition={{ duration: 1, delay: 0.5 }} className={`h-full rounded-full ${item.bg}`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (<p className="text-sm text-slate-500 text-center py-4">{t('audit.noPasswordData')}</p>)}
        </motion.div>
      </div>

      {/* Inheritance coverage */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        className={`p-5 rounded-2xl border ${coverageRate < 50 ? 'bg-blue-950/20 border-blue-500/20' : 'bg-emerald-950/20 border-emerald-500/20'}`}>
        <div className="flex items-center gap-3 mb-4"><Users className="w-5 h-5 text-blue-400" /><h3 className="text-white font-medium">{t('audit.coverageTitle')}</h3></div>
        <div className="flex items-center gap-6">
          <div className="relative w-20 h-20 shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" fill="none" stroke="#1e293b" strokeWidth="8" />
              <motion.circle cx="50" cy="50" r="40" fill="none" stroke={coverageRate >= 50 ? '#10b981' : '#3b82f6'} strokeWidth="8" strokeLinecap="round"
                strokeDasharray={`${coverageRate * 2.51} 251`} initial={{ strokeDasharray: '0 251' }} animate={{ strokeDasharray: `${coverageRate * 2.51} 251` }} transition={{ duration: 1.2, delay: 0.6 }} />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center"><span className={`text-lg font-bold ${coverageRate >= 50 ? 'text-emerald-400' : 'text-blue-400'}`}>{coverageRate}%</span></div>
          </div>
          <div className="flex-1">
            {unallocated.length > 0 ? (
              <div>
                <p className="text-xs text-slate-400 mb-2">{t('audit.unallocatedNote', { count: unallocated.length })}</p>
                <div className="space-y-1 max-h-24 overflow-y-auto">
                  {unallocated.slice(0, 5).map((item, i) => (<div key={i} className="flex items-center gap-2 text-xs text-slate-500"><span className="w-1 h-1 rounded-full bg-slate-600" />{item.title}</div>))}
                  {unallocated.length > 5 && <p className="text-xs text-slate-600">{t('audit.andMore', { count: unallocated.length - 5 })}</p>}
                </div>
                <button onClick={() => navigate('/inheritance')} className="mt-3 text-xs text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1">{t('audit.goAllocate')} <ChevronRight className="w-3 h-3" /></button>
              </div>
            ) : (<p className="text-sm text-slate-400 flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" />{t('audit.allAllocated')}</p>)}
          </div>
        </div>
      </motion.div>

      {/* Recommendations */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800">
        <h3 className="text-white font-medium mb-4 flex items-center gap-2"><Lock className="w-5 h-5 text-emerald-400" />{t('audit.recommendationsTitle')}</h3>
        <div className="space-y-3">
          {recommendations.sort((a, b) => { const priority = { critical: 0, high: 1, medium: 2, low: 3 }; return (priority[a.priority as keyof typeof priority] || 3) - (priority[b.priority as keyof typeof priority] || 3) }).map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              {item.done ? <Check className="w-4 h-4 text-emerald-400 shrink-0" /> : <div className={`w-4 h-4 rounded-full border shrink-0 ${item.priority === 'critical' ? 'border-red-500 bg-red-500/20' : item.priority === 'high' ? 'border-amber-500 bg-amber-500/20' : 'border-slate-600'}`} />}
              <span className={`text-sm flex-1 ${item.done ? 'text-slate-300' : 'text-slate-400'}`}>{item.text}</span>
              {!item.done && (
                <button onClick={() => navigate(item.action)} className="text-xs text-emerald-400 hover:text-emerald-300 px-2 py-1 bg-emerald-500/10 rounded-lg transition-colors flex items-center gap-1 shrink-0">{item.actionLabel}<ChevronRight className="w-3 h-3" /></button>
              )}
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
