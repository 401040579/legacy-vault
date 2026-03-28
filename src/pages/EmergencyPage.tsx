import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShieldAlert, Plus, X, Phone, Mail, Clock, Shield,
  Check, AlertTriangle, FileText, User, ChevronRight
} from 'lucide-react'
import { useStore } from '../store'
import { useI18n, getLocaleForDate } from '../i18n'

export default function EmergencyPage() {
  const { emergencyContacts, emergencyLogs, addEmergencyContact, deleteEmergencyContact, addEmergencyLog } = useStore()
  const { t, locale } = useI18n()
  const [showForm, setShowForm] = useState(false)
  const [showDemo, setShowDemo] = useState(false)
  const [demoStep, setDemoStep] = useState(0)

  const [formName, setFormName] = useState('')
  const [formEmail, setFormEmail] = useState('')
  const [formPhone, setFormPhone] = useState('')
  const [formLevel, setFormLevel] = useState<'basic' | 'standard' | 'full'>('basic')
  const [formWait, setFormWait] = useState(48)

  const ACCESS_LEVELS = [
    { value: 'basic' as const, label: t('emergency.accessLevelBasic'), desc: t('emergency.accessLevelBasicDesc'), color: 'text-blue-400' },
    { value: 'standard' as const, label: t('emergency.accessLevelStandard'), desc: t('emergency.accessLevelStandardDesc'), color: 'text-amber-400' },
    { value: 'full' as const, label: t('emergency.accessLevelFull'), desc: t('emergency.accessLevelFullDesc'), color: 'text-emerald-400' },
  ]

  const handleAdd = () => {
    if (!formName) return
    addEmergencyContact({ name: formName, email: formEmail, phone: formPhone, accessLevel: formLevel, waitPeriod: formWait })
    setShowForm(false); setFormName(''); setFormEmail(''); setFormPhone('')
  }

  const demoSteps = [
    { title: t('emergency.demoStep1Title'), desc: t('emergency.demoStep1Desc'), icon: AlertTriangle, color: 'text-amber-400' },
    { title: t('emergency.demoStep2Title'), desc: t('emergency.demoStep2Desc'), icon: Clock, color: 'text-blue-400' },
    { title: t('emergency.demoStep3Title'), desc: t('emergency.demoStep3Desc'), icon: User, color: 'text-purple-400' },
    { title: t('emergency.demoStep4Title'), desc: t('emergency.demoStep4Desc'), icon: Shield, color: 'text-emerald-400' },
    { title: t('emergency.demoStep5Title'), desc: t('emergency.demoStep5Desc'), icon: Check, color: 'text-emerald-400' },
  ]

  const protocolSteps = [
    t('emergency.protocolSteps.0'), t('emergency.protocolSteps.1'), t('emergency.protocolSteps.2'),
    t('emergency.protocolSteps.3'), t('emergency.protocolSteps.4'), t('emergency.protocolSteps.5'),
  ]

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">{t('emergency.title')}</h1>
          <p className="text-sm text-slate-400 mt-1">{t('emergency.subtitle')}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => { setShowDemo(true); setDemoStep(0); }} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-medium transition-colors">{t('emergency.simulateFlow')}</button>
          <button onClick={() => setShowForm(true)} className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl text-sm font-medium transition-colors flex items-center gap-2"><Plus className="w-4 h-4" />{t('emergency.addContact')}</button>
        </div>
      </div>

      {/* Emergency contacts */}
      <div>
        <h3 className="text-sm font-medium text-slate-400 mb-3">{t('emergency.contactsTitle')}</h3>
        {emergencyContacts.length === 0 ? (
          <div className="p-8 text-center bg-slate-900/50 border border-slate-800 rounded-2xl">
            <ShieldAlert className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-sm text-slate-500">{t('emergency.noContacts')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {emergencyContacts.map(contact => {
              const levelInfo = ACCESS_LEVELS.find(l => l.value === contact.accessLevel)
              return (
                <motion.div key={contact.id} layout className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-slate-700 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center"><User className="w-6 h-6 text-slate-400" /></div>
                      <div>
                        <p className="text-white font-medium">{contact.name}</p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                          <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {contact.email}</span>
                          <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {contact.phone}</span>
                        </div>
                      </div>
                    </div>
                    <button onClick={() => deleteEmergencyContact(contact.id)} className="text-slate-600 hover:text-red-400 transition-colors"><X className="w-4 h-4" /></button>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <div className="p-3 rounded-xl bg-slate-800/50">
                      <p className="text-xs text-slate-500 mb-1">{t('emergency.accessLevel')}</p>
                      <p className={`text-sm font-medium ${levelInfo?.color}`}>{levelInfo?.label}</p>
                      <p className="text-xs text-slate-600 mt-0.5">{levelInfo?.desc}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-800/50">
                      <p className="text-xs text-slate-500 mb-1">{t('emergency.waitPeriod')}</p>
                      <p className="text-sm font-medium text-white">{t('emergency.waitPeriodHours', { hours: contact.waitPeriod })}</p>
                      <p className="text-xs text-slate-600 mt-0.5">{t('emergency.waitPeriodNote')}</p>
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
        <h3 className="text-sm font-medium text-slate-400 mb-3">{t('emergency.accessLogs')}</h3>
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl divide-y divide-slate-800">
          {emergencyLogs.length === 0 ? (
            <p className="p-6 text-center text-sm text-slate-500">{t('emergency.noLogs')}</p>
          ) : (
            emergencyLogs.map(log => (
              <div key={log.id} className="flex items-center gap-3 px-4 py-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${log.status === 'approved' ? 'bg-emerald-500/10' : log.status === 'denied' ? 'bg-red-500/10' : 'bg-amber-500/10'}`}>
                  {log.status === 'approved' ? <Check className="w-4 h-4 text-emerald-400" /> : log.status === 'denied' ? <X className="w-4 h-4 text-red-400" /> : <Clock className="w-4 h-4 text-amber-400" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-white">{log.action}</p>
                  <p className="text-xs text-slate-500">{log.contactName} · {new Date(log.timestamp).toLocaleString(getLocaleForDate(locale))}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${log.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400' : log.status === 'denied' ? 'bg-red-500/10 text-red-400' : 'bg-amber-500/10 text-amber-400'}`}>
                  {log.status === 'approved' ? t('emergency.statusApproved') : log.status === 'denied' ? t('emergency.statusDenied') : t('emergency.statusPending')}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Protocol explanation */}
      <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800">
        <h3 className="text-sm font-medium text-white mb-4 flex items-center gap-2"><FileText className="w-4 h-4 text-emerald-400" />{t('emergency.protocolTitle')}</h3>
        <div className="space-y-3">
          {protocolSteps.map((step, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-400 text-xs flex items-center justify-center shrink-0 mt-0.5">{i + 1}</div>
              <p className="text-sm text-slate-300">{step}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Add contact modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
                <h3 className="text-lg font-semibold text-white">{t('emergency.addContactTitle')}</h3>
                <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-6 space-y-4">
                <div><label className="text-sm text-slate-300 mb-1 block">{t('emergency.nameLabel')}</label><input value={formName} onChange={e => setFormName(e.target.value)} placeholder={t('emergency.namePlaceholder')} className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-emerald-500" /></div>
                <div><label className="text-sm text-slate-300 mb-1 block">{t('emergency.emailLabel')}</label><input value={formEmail} onChange={e => setFormEmail(e.target.value)} placeholder="email@example.com" className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-emerald-500" /></div>
                <div><label className="text-sm text-slate-300 mb-1 block">{t('emergency.phoneLabel')}</label><input value={formPhone} onChange={e => setFormPhone(e.target.value)} placeholder={t('emergency.phonePlaceholder')} className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-emerald-500" /></div>
                <div>
                  <label className="text-sm text-slate-300 mb-2 block">{t('emergency.accessLevelLabel')}</label>
                  <div className="space-y-2">
                    {ACCESS_LEVELS.map(l => (
                      <button key={l.value} onClick={() => setFormLevel(l.value)} className={`w-full p-3 rounded-xl border text-left transition-colors ${formLevel === l.value ? 'bg-emerald-950/30 border-emerald-500/30' : 'bg-slate-800/50 border-slate-700'}`}>
                        <p className={`text-sm font-medium ${l.color}`}>{l.label}</p>
                        <p className="text-xs text-slate-400">{l.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm text-slate-300 mb-1 block">{t('emergency.waitPeriodLabel')}</label>
                  <select value={formWait} onChange={e => setFormWait(Number(e.target.value))} className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500">
                    {[24, 48, 72, 168].map(h => (<option key={h} value={h}>{t('emergency.waitOption', { hours: h, days: h / 24 })}</option>))}
                  </select>
                </div>
              </div>
              <div className="px-6 py-4 border-t border-slate-800 flex justify-end gap-3">
                <button onClick={() => setShowForm(false)} className="px-4 py-2 text-slate-400 text-sm">{t('common.cancel')}</button>
                <button onClick={handleAdd} disabled={!formName} className="px-6 py-2 bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-700 text-white text-sm font-medium rounded-xl transition-colors">{t('common.add')}</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Demo Modal */}
      <AnimatePresence>
        {showDemo && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowDemo(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
                <h3 className="text-lg font-semibold text-white">{t('emergency.demoTitle')}</h3>
                <button onClick={() => setShowDemo(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {demoSteps.map((step, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: i <= demoStep ? 1 : 0.3, x: 0 }} transition={{ delay: i * 0.1 }}
                      className={`flex items-start gap-3 p-3 rounded-xl transition-colors ${i <= demoStep ? 'bg-slate-800/50' : ''}`}>
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${i <= demoStep ? 'bg-emerald-500/10' : 'bg-slate-800'}`}>
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
                  <button onClick={() => setDemoStep(Math.max(0, demoStep - 1))} disabled={demoStep === 0} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white text-sm rounded-xl transition-colors">{t('emergency.prevStep')}</button>
                  {demoStep < demoSteps.length - 1 ? (
                    <button onClick={() => setDemoStep(demoStep + 1)} className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white text-sm rounded-xl transition-colors flex items-center gap-1">{t('emergency.nextStep')} <ChevronRight className="w-4 h-4" /></button>
                  ) : (
                    <button onClick={() => { setShowDemo(false); addEmergencyLog({ contactName: t('emergency.demoLogContact'), action: t('emergency.demoLogAction'), status: 'approved', timestamp: Date.now() }); }}
                      className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white text-sm rounded-xl transition-colors">{t('emergency.finishDemo')}</button>
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
