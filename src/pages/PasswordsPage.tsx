import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus, Search, Eye, EyeOff, Copy, Trash2, Edit3, X,
  KeyRound, Globe, Mail, CreditCard, MessageSquare, Wrench,
  Bitcoin, Shield, RefreshCw, Check, AlertTriangle, ShoppingCart
} from 'lucide-react'
import { useStore, type PasswordEntry } from '../store'
import { generatePassword, checkPasswordStrength } from '../utils/crypto'
import { useI18n } from '../i18n'

export default function PasswordsPage() {
  const { passwords, guardians, addPassword, updatePassword, deletePassword } = useStore()
  const { t, locale } = useI18n()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState(locale === 'zh' ? '全部' : 'all')
  const [revealedId, setRevealedId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showGenerator, setShowGenerator] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const CATEGORIES = [
    { value: t('passwords.all'), icon: KeyRound, key: '全部' },
    { value: t('passwords.social'), icon: MessageSquare, key: '社交' },
    { value: t('passwords.banking'), icon: CreditCard, key: '银行' },
    { value: t('passwords.email'), icon: Mail, key: '邮箱' },
    { value: t('passwords.shopping'), icon: ShoppingCart, key: '购物' },
    { value: t('passwords.tools'), icon: Wrench, key: '工具' },
    { value: t('passwords.crypto'), icon: Bitcoin, key: '加密资产' },
  ]

  // Form state
  const [formTitle, setFormTitle] = useState('')
  const [formUsername, setFormUsername] = useState('')
  const [formPassword, setFormPassword] = useState('')
  const [formUrl, setFormUrl] = useState('')
  const [formCategory, setFormCategory] = useState('工具')
  const [formNotes, setFormNotes] = useState('')
  const [formGuardian, setFormGuardian] = useState('')
  const [formGuardianNote, setFormGuardianNote] = useState('')

  // Generator state
  const [genLength, setGenLength] = useState(16)
  const [genUpper, setGenUpper] = useState(true)
  const [genLower, setGenLower] = useState(true)
  const [genNumbers, setGenNumbers] = useState(true)
  const [genSymbols, setGenSymbols] = useState(true)

  const isAllCategory = category === t('passwords.all')

  const filtered = passwords.filter(p => {
    if (!isAllCategory) {
      // Find the internal key for the selected display category
      const selectedCat = CATEGORIES.find(c => c.value === category)
      if (selectedCat && p.category !== selectedCat.key) return false
    }
    if (search && !p.title.toLowerCase().includes(search.toLowerCase()) && !p.username.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const grouped = CATEGORIES.slice(1).reduce((acc, cat) => {
    const items = filtered.filter(p => p.category === cat.key)
    if (items.length > 0) acc[cat.value] = items
    return acc
  }, {} as Record<string, PasswordEntry[]>)

  const openForm = (pw?: PasswordEntry) => {
    if (pw) {
      setEditingId(pw.id)
      setFormTitle(pw.title)
      setFormUsername(pw.username)
      setFormPassword(pw.password)
      setFormUrl(pw.url)
      setFormCategory(pw.category)
      setFormNotes(pw.notes)
      setFormGuardian(pw.guardianId || '')
      setFormGuardianNote(pw.guardianNote)
    } else {
      setEditingId(null)
      setFormTitle('')
      setFormUsername('')
      setFormPassword('')
      setFormUrl('')
      setFormCategory('工具')
      setFormNotes('')
      setFormGuardian('')
      setFormGuardianNote('')
    }
    setShowForm(true)
  }

  const handleSave = () => {
    const data = {
      title: formTitle,
      username: formUsername,
      password: formPassword,
      url: formUrl,
      category: formCategory,
      notes: formNotes,
      guardianId: formGuardian || null,
      guardianNote: formGuardianNote,
    }
    if (editingId) {
      updatePassword(editingId, data)
    } else {
      addPassword(data)
    }
    setShowForm(false)
  }

  const handleGeneratePassword = () => {
    const pw = generatePassword(genLength, {
      uppercase: genUpper,
      lowercase: genLower,
      numbers: genNumbers,
      symbols: genSymbols,
    })
    setFormPassword(pw)
    setShowGenerator(false)
  }

  const copyPassword = (id: string, pw: string) => {
    navigator.clipboard.writeText(pw)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 1500)
  }

  const strength = formPassword ? checkPasswordStrength(formPassword) : null

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">{t('passwords.title')}</h1>
          <p className="text-sm text-slate-400 mt-1">{t('passwords.countLabel', { count: passwords.length })}</p>
        </div>
        <button
          onClick={() => openForm()}
          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl text-sm font-medium transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          {t('passwords.addPassword')}
        </button>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={t('passwords.searchPlaceholder')}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900/50 border border-slate-800 rounded-xl text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {CATEGORIES.map(cat => (
            <button
              key={cat.value}
              onClick={() => setCategory(cat.value)}
              className={`px-3 py-2 rounded-xl text-sm whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                category === cat.value
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                  : 'bg-slate-900/50 text-slate-400 border border-slate-800 hover:border-slate-700'
              }`}
            >
              <cat.icon className="w-3.5 h-3.5" />
              {cat.value}
            </button>
          ))}
        </div>
      </div>

      {/* Password List */}
      {isAllCategory ? (
        Object.entries(grouped).map(([cat, items]) => (
          <div key={cat} className="mb-6">
            <h3 className="text-sm font-medium text-slate-400 mb-2 flex items-center gap-2">
              {cat} <span className="text-slate-600">({items.length})</span>
            </h3>
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl divide-y divide-slate-800">
              {items.map(pw => (
                <PasswordRow
                  key={pw.id}
                  pw={pw}
                  revealed={revealedId === pw.id}
                  copied={copiedId === pw.id}
                  guardians={guardians}
                  onReveal={() => setRevealedId(revealedId === pw.id ? null : pw.id)}
                  onCopy={() => copyPassword(pw.id, pw.password)}
                  onEdit={() => openForm(pw)}
                  onDelete={() => deletePassword(pw.id)}
                />
              ))}
            </div>
          </div>
        ))
      ) : (
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl divide-y divide-slate-800">
          {filtered.length > 0 ? (
            filtered.map(pw => (
              <PasswordRow
                key={pw.id}
                pw={pw}
                revealed={revealedId === pw.id}
                copied={copiedId === pw.id}
                guardians={guardians}
                onReveal={() => setRevealedId(revealedId === pw.id ? null : pw.id)}
                onCopy={() => copyPassword(pw.id, pw.password)}
                onEdit={() => openForm(pw)}
                onDelete={() => deletePassword(pw.id)}
              />
            ))
          ) : (
            <p className="p-8 text-center text-slate-500 text-sm">
              {search ? t('passwords.emptySearch') : t('passwords.emptyVault')}
            </p>
          )}
        </div>
      )}

      {/* Add/Edit Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowForm(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
                <h3 className="text-lg font-semibold text-white">
                  {editingId ? t('passwords.editPassword') : t('passwords.newPassword')}
                </h3>
                <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="text-sm text-slate-300 mb-1 block">{t('passwords.titleLabel')}</label>
                  <input
                    value={formTitle}
                    onChange={e => setFormTitle(e.target.value)}
                    placeholder={t('passwords.titlePlaceholder')}
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-300 mb-1 block">{t('passwords.usernameLabel')}</label>
                  <input
                    value={formUsername}
                    onChange={e => setFormUsername(e.target.value)}
                    placeholder="user@email.com"
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-300 mb-1 block">{t('passwords.passwordLabel')}</label>
                  <div className="flex gap-2">
                    <input
                      value={formPassword}
                      onChange={e => setFormPassword(e.target.value)}
                      placeholder={t('passwords.passwordPlaceholder')}
                      className="flex-1 px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm font-mono placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      onClick={() => setShowGenerator(!showGenerator)}
                      className="px-3 py-2 bg-emerald-500/10 text-emerald-400 rounded-xl hover:bg-emerald-500/20 transition-colors"
                      title={t('passwords.generatePassword')}
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>
                  {strength && (
                    <div className="mt-2">
                      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{ width: `${strength.score}%`, backgroundColor: strength.color }} />
                      </div>
                      <p className="text-xs mt-1" style={{ color: strength.color }}>{strength.label}</p>
                    </div>
                  )}
                </div>

                {/* Password Generator */}
                <AnimatePresence>
                  {showGenerator && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700 space-y-3">
                        <div>
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="text-slate-300">{t('passwords.genLength')}</span>
                            <span className="text-emerald-400">{genLength}</span>
                          </div>
                          <input
                            type="range"
                            min={8}
                            max={32}
                            value={genLength}
                            onChange={e => setGenLength(Number(e.target.value))}
                            className="w-full accent-emerald-500"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { label: t('passwords.genUppercase'), checked: genUpper, set: setGenUpper },
                            { label: t('passwords.genLowercase'), checked: genLower, set: setGenLower },
                            { label: t('passwords.genNumbers'), checked: genNumbers, set: setGenNumbers },
                            { label: t('passwords.genSymbols'), checked: genSymbols, set: setGenSymbols },
                          ].map(opt => (
                            <label key={opt.label} className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={opt.checked}
                                onChange={e => opt.set(e.target.checked)}
                                className="rounded border-slate-600 text-emerald-500 focus:ring-emerald-500 bg-slate-800"
                              />
                              {opt.label}
                            </label>
                          ))}
                        </div>
                        <button
                          onClick={handleGeneratePassword}
                          className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-medium rounded-lg transition-colors"
                        >
                          {t('passwords.genBtn')}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div>
                  <label className="text-sm text-slate-300 mb-1 block">{t('passwords.urlLabel')}</label>
                  <input
                    value={formUrl}
                    onChange={e => setFormUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-300 mb-1 block">{t('passwords.categoryLabel')}</label>
                  <select
                    value={formCategory}
                    onChange={e => setFormCategory(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500"
                  >
                    {CATEGORIES.slice(1).map(c => (
                      <option key={c.key} value={c.key}>{c.value}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm text-slate-300 mb-1 block">{t('passwords.notesLabel')}</label>
                  <textarea
                    value={formNotes}
                    onChange={e => setFormNotes(e.target.value)}
                    placeholder={t('passwords.notesPlaceholder')}
                    rows={2}
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 resize-none"
                  />
                </div>

                {/* Guardian settings */}
                <div className="pt-2 border-t border-slate-800">
                  <label className="text-sm text-slate-300 mb-1 block">{t('passwords.guardianLabel')}</label>
                  <select
                    value={formGuardian}
                    onChange={e => setFormGuardian(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500"
                  >
                    <option value="">{t('passwords.noGuardian')}</option>
                    {guardians.map(g => (
                      <option key={g.id} value={g.id}>{g.avatar} {g.name} ({g.relationship})</option>
                    ))}
                  </select>
                  {formGuardian && (
                    <div className="mt-2">
                      <input
                        value={formGuardianNote}
                        onChange={e => setFormGuardianNote(e.target.value)}
                        placeholder={t('passwords.guardianNotePlaceholder')}
                        className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="px-6 py-4 border-t border-slate-800 flex justify-end gap-3">
                <button onClick={() => setShowForm(false)} className="px-4 py-2 text-slate-400 hover:text-white text-sm transition-colors">
                  {t('common.cancel')}
                </button>
                <button
                  onClick={handleSave}
                  disabled={!formTitle || !formPassword}
                  className="px-6 py-2 bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-700 disabled:text-slate-500 text-white text-sm font-medium rounded-xl transition-colors"
                >
                  {editingId ? t('passwords.saveChanges') : t('passwords.secureStore')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function PasswordRow({ pw, revealed, copied, guardians, onReveal, onCopy, onEdit, onDelete }: {
  pw: PasswordEntry
  revealed: boolean
  copied: boolean
  guardians: { id: string; name: string; avatar: string }[]
  onReveal: () => void
  onCopy: () => void
  onEdit: () => void
  onDelete: () => void
}) {
  const guardian = pw.guardianId ? guardians.find(g => g.id === pw.guardianId) : null
  const strength = checkPasswordStrength(pw.password)
  const { t } = useI18n()

  return (
    <div className="flex items-center gap-3 px-4 py-3 hover:bg-slate-800/30 transition-colors group">
      <div className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center text-lg shrink-0">
        {pw.url ? (
          <Globe className="w-4 h-4 text-slate-400" />
        ) : (
          <KeyRound className="w-4 h-4 text-slate-400" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm text-white font-medium truncate">{pw.title}</p>
          {pw.breached && (
            <span className="text-xs text-red-400 flex items-center gap-0.5 shrink-0 bg-red-500/10 px-1.5 py-0.5 rounded-full">
              <AlertTriangle className="w-3 h-3" />
              {t('passwords.breached')}
            </span>
          )}
          {guardian && (
            <span className="text-xs text-emerald-400/70 flex items-center gap-0.5 shrink-0">
              <Shield className="w-3 h-3" />
              {t('passwords.entrusted')}
            </span>
          )}
        </div>
        <p className="text-xs text-slate-500 truncate">{pw.username}</p>
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="w-1.5 h-1.5 rounded-full mr-1" style={{ backgroundColor: strength.color }} title={strength.label} />
        <button onClick={onReveal} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors" title={revealed ? t('passwords.hide') : t('passwords.show')}>
          {revealed ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
        <button onClick={onCopy} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors" title={t('common.copy')}>
          {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
        </button>
        <button onClick={onEdit} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors" title={t('common.edit')}>
          <Edit3 className="w-4 h-4" />
        </button>
        <button onClick={onDelete} className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-700 transition-colors" title={t('common.delete')}>
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {revealed && (
        <span className="text-xs text-emerald-400 font-mono shrink-0 max-w-32 truncate">{pw.password}</span>
      )}
    </div>
  )
}
