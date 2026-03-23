import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Timer, Plus, X, Lock, Unlock, Mail, Calendar, Gift, Clock, Sparkles, Heart, Star, Smile } from 'lucide-react'
import { useStore, type TimeCapsule } from '../store'

const MOODS = [
  { value: 'reflective', label: '沉思', emoji: '🤔' },
  { value: 'loving', label: '温暖', emoji: '🥰' },
  { value: 'hopeful', label: '希望', emoji: '🌟' },
  { value: 'romantic', label: '浪漫', emoji: '💕' },
  { value: 'motivated', label: '激励', emoji: '💪' },
  { value: 'grateful', label: '感恩', emoji: '🙏' },
]

const IMPORTANCE_LEVELS = [
  { value: 'low' as const, label: '普通', color: 'text-slate-400', bg: 'bg-slate-500/10' },
  { value: 'medium' as const, label: '重要', color: 'text-amber-400', bg: 'bg-amber-500/10' },
  { value: 'high' as const, label: '非常重要', color: 'text-rose-400', bg: 'bg-rose-500/10' },
]

export default function TimeCapsulePage() {
  const { timeCapsules, addTimeCapsule, updateTimeCapsule, deleteTimeCapsule } = useStore()
  const [showForm, setShowForm] = useState(false)
  const [openingId, setOpeningId] = useState<string | null>(null)
  const [openedCapsule, setOpenedCapsule] = useState<TimeCapsule | null>(null)
  const [openStage, setOpenStage] = useState(0) // 0: envelope, 1: paper, 2: content

  const [formTitle, setFormTitle] = useState('')
  const [formContent, setFormContent] = useState('')
  const [formRecipient, setFormRecipient] = useState('')
  const [formEmail, setFormEmail] = useState('')
  const [formDate, setFormDate] = useState('')
  const [formType, setFormType] = useState<'text' | 'letter' | 'wish'>('letter')
  const [formMood, setFormMood] = useState('loving')
  const [formImportance, setFormImportance] = useState<'low' | 'medium' | 'high'>('medium')

  const handleCreate = () => {
    if (!formTitle || !formContent || !formDate) return
    addTimeCapsule({
      title: formTitle,
      content: formContent,
      recipientName: formRecipient,
      recipientEmail: formEmail,
      deliveryDate: new Date(formDate).getTime(),
      contentType: formType,
      sealed: true,
      opened: false,
      mood: formMood,
      importance: formImportance,
    })
    setShowForm(false)
    setFormTitle('')
    setFormContent('')
    setFormRecipient('')
    setFormEmail('')
    setFormDate('')
    setFormMood('loving')
    setFormImportance('medium')
  }

  const handleOpen = (capsule: TimeCapsule) => {
    setOpeningId(capsule.id)
    setOpenStage(0)
    // Stage 1: envelope opening after 1.5s
    setTimeout(() => setOpenStage(1), 1500)
    // Stage 2: paper unfold after 3s
    setTimeout(() => setOpenStage(2), 3000)
    // Final: show content after 4s
    setTimeout(() => {
      setOpeningId(null)
      setOpenedCapsule(capsule)
      setOpenStage(0)
      updateTimeCapsule(capsule.id, { opened: true, sealed: false })
    }, 4000)
  }

  const getDaysUntil = (date: number) => {
    const diff = date - Date.now()
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
  }

  const typeIcons = { text: Mail, letter: Mail, wish: Gift }
  const moodEmoji = (mood?: string) => MOODS.find(m => m.value === mood)?.emoji || ''

  const activeCapsules = timeCapsules.filter(c => !c.opened)
  const openedCapsules = timeCapsules.filter(c => c.opened)

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">时间胶囊</h1>
          <p className="text-sm text-slate-400 mt-1">给未来的某个人写一封信吧。它会在你指定的时间安全送达。</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl text-sm font-medium transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          创建胶囊
        </button>
      </div>

      {/* Active capsules */}
      {activeCapsules.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-slate-400 mb-3 flex items-center gap-2">
            <Lock className="w-4 h-4" />
            等待中的胶囊 ({activeCapsules.length})
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {activeCapsules.map(capsule => (
              <CapsuleCard
                key={capsule.id}
                capsule={capsule}
                openingId={openingId}
                openStage={openStage}
                getDaysUntil={getDaysUntil}
                typeIcons={typeIcons}
                moodEmoji={moodEmoji}
                onOpen={handleOpen}
                onView={setOpenedCapsule}
                onDelete={deleteTimeCapsule}
              />
            ))}
          </div>
        </div>
      )}

      {/* Opened capsules */}
      {openedCapsules.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-slate-400 mb-3 flex items-center gap-2">
            <Unlock className="w-4 h-4" />
            已开启的胶囊 ({openedCapsules.length})
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {openedCapsules.map(capsule => (
              <CapsuleCard
                key={capsule.id}
                capsule={capsule}
                openingId={openingId}
                openStage={openStage}
                getDaysUntil={getDaysUntil}
                typeIcons={typeIcons}
                moodEmoji={moodEmoji}
                onOpen={handleOpen}
                onView={setOpenedCapsule}
                onDelete={deleteTimeCapsule}
              />
            ))}
          </div>
        </div>
      )}

      {timeCapsules.length === 0 && (
        <div className="p-12 text-center bg-slate-900/50 border border-slate-800 rounded-2xl">
          <Timer className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-500">给未来的某个人写一封信吧。它会在你指定的时间安全送达。</p>
        </div>
      )}

      {/* Create Form Modal */}
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
                <h3 className="text-lg font-semibold text-white">创建时间胶囊</h3>
                <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="text-sm text-slate-300 mb-1 block">胶囊标题</label>
                  <input value={formTitle} onChange={e => setFormTitle(e.target.value)} placeholder="例如：给小明的18岁生日" className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-emerald-500" />
                </div>

                <div>
                  <label className="text-sm text-slate-300 mb-2 block">内容类型</label>
                  <div className="flex gap-2">
                    {[
                      { value: 'letter' as const, label: '信件', icon: Mail },
                      { value: 'wish' as const, label: '祝福', icon: Gift },
                      { value: 'text' as const, label: '文字', icon: Mail },
                    ].map(t => (
                      <button
                        key={t.value}
                        onClick={() => setFormType(t.value)}
                        className={`flex-1 py-2 rounded-xl text-sm flex items-center justify-center gap-1.5 transition-colors ${
                          formType === t.value
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}
                      >
                        <t.icon className="w-3.5 h-3.5" />
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Mood tags */}
                <div>
                  <label className="text-sm text-slate-300 mb-2 block flex items-center gap-1">
                    <Smile className="w-3.5 h-3.5" />
                    心情标签
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {MOODS.map(m => (
                      <button
                        key={m.value}
                        onClick={() => setFormMood(m.value)}
                        className={`px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 transition-colors ${
                          formMood === m.value
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}
                      >
                        {m.emoji} {m.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Importance */}
                <div>
                  <label className="text-sm text-slate-300 mb-2 block flex items-center gap-1">
                    <Star className="w-3.5 h-3.5" />
                    重要程度
                  </label>
                  <div className="flex gap-2">
                    {IMPORTANCE_LEVELS.map(imp => (
                      <button
                        key={imp.value}
                        onClick={() => setFormImportance(imp.value)}
                        className={`flex-1 py-2 rounded-xl text-xs flex items-center justify-center gap-1 transition-colors ${
                          formImportance === imp.value
                            ? `${imp.bg} ${imp.color} border border-current/30`
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}
                      >
                        {imp.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm text-slate-300 mb-1 block">收件人</label>
                  <input value={formRecipient} onChange={e => setFormRecipient(e.target.value)} placeholder="收件人姓名" className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-emerald-500" />
                </div>

                <div>
                  <label className="text-sm text-slate-300 mb-1 block">收件人邮箱</label>
                  <input value={formEmail} onChange={e => setFormEmail(e.target.value)} placeholder="recipient@email.com" className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-emerald-500" />
                </div>

                <div>
                  <label className="text-sm text-slate-300 mb-1 block">送达日期</label>
                  <input type="date" value={formDate} onChange={e => setFormDate(e.target.value)} className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500" />
                </div>

                <div>
                  <label className="text-sm text-slate-300 mb-1 block">内容</label>
                  <textarea
                    value={formContent}
                    onChange={e => setFormContent(e.target.value)}
                    placeholder="写下你想说的话..."
                    rows={5}
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 resize-none"
                  />
                </div>
              </div>

              <div className="px-6 py-4 border-t border-slate-800 flex justify-end gap-3">
                <button onClick={() => setShowForm(false)} className="px-4 py-2 text-slate-400 text-sm">取消</button>
                <button
                  onClick={handleCreate}
                  disabled={!formTitle || !formContent || !formDate}
                  className="px-6 py-2 bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-700 disabled:text-slate-500 text-white text-sm font-medium rounded-xl transition-colors flex items-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  密封胶囊
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Opened Capsule Modal - Ceremony */}
      <AnimatePresence>
        {openedCapsule && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setOpenedCapsule(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-lg bg-slate-900 border border-emerald-500/20 rounded-2xl overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              {/* Header with gradient */}
              <div className="bg-gradient-to-br from-emerald-950/50 to-purple-950/30 p-8 text-center relative overflow-hidden">
                {/* Floating particles */}
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-1 bg-emerald-400/30 rounded-full"
                    initial={{ x: Math.random() * 400, y: Math.random() * 200, opacity: 0 }}
                    animate={{
                      y: [Math.random() * 200, Math.random() * 50],
                      opacity: [0, 0.6, 0],
                    }}
                    transition={{ repeat: Infinity, duration: 3 + Math.random() * 2, delay: i * 0.5 }}
                  />
                ))}

                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', delay: 0.2 }}
                >
                  <Sparkles className="w-12 h-12 text-amber-400 mx-auto mb-3" />
                </motion.div>
                <motion.h3
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-xl font-bold text-white mb-1"
                >
                  {openedCapsule.title}
                </motion.h3>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="text-sm text-slate-400"
                >
                  创建于 {new Date(openedCapsule.createdAt).toLocaleDateString('zh-CN')}
                  {openedCapsule.recipientName && ` · 致 ${openedCapsule.recipientName}`}
                </motion.p>
                {openedCapsule.mood && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="mt-2 inline-flex items-center gap-1 text-xs text-slate-400 bg-slate-800/50 px-2 py-1 rounded-full"
                  >
                    {moodEmoji(openedCapsule.mood)} {MOODS.find(m => m.value === openedCapsule.mood)?.label}
                  </motion.div>
                )}
              </div>

              {/* Content with fade-in */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.6 }}
                className="p-6"
              >
                <div className="p-5 rounded-xl bg-slate-800/50 border border-slate-700">
                  <p className="text-white leading-relaxed whitespace-pre-wrap text-sm">{openedCapsule.content}</p>
                </div>
              </motion.div>
              <div className="px-6 py-4 border-t border-slate-800 flex justify-end">
                <button onClick={() => setOpenedCapsule(null)} className="px-6 py-2 bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-medium rounded-xl transition-colors">
                  关闭
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function CapsuleCard({
  capsule, openingId, openStage, getDaysUntil, typeIcons, moodEmoji,
  onOpen, onView, onDelete,
}: {
  capsule: TimeCapsule
  openingId: string | null
  openStage: number
  getDaysUntil: (d: number) => number
  typeIcons: Record<string, typeof Mail>
  moodEmoji: (mood?: string) => string
  onOpen: (c: TimeCapsule) => void
  onView: (c: TimeCapsule) => void
  onDelete: (id: string) => void
}) {
  const daysLeft = getDaysUntil(capsule.deliveryDate)
  const isOpening = openingId === capsule.id
  const canOpen = daysLeft <= 0 || !capsule.sealed
  const Icon = typeIcons[capsule.contentType]

  const importanceInfo = IMPORTANCE_LEVELS.find(i => i.value === capsule.importance)

  return (
    <motion.div
      layout
      className={`relative p-6 rounded-2xl border overflow-hidden transition-colors ${
        capsule.opened
          ? 'bg-emerald-950/20 border-emerald-500/20'
          : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
      }`}
    >
      {/* Ceremonial opening animation */}
      <AnimatePresence>
        {isOpening && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-10 bg-slate-900/98 flex items-center justify-center rounded-2xl"
          >
            <div className="text-center px-4">
              {openStage === 0 && (
                <motion.div
                  initial={{ scale: 1 }}
                  animate={{ scale: [1, 1.1, 1], rotateY: [0, 180, 360] }}
                  transition={{ duration: 1.5 }}
                >
                  <Mail className="w-16 h-16 text-amber-400 mx-auto" />
                  <p className="text-amber-400 mt-3 text-sm">信封正在打开...</p>
                </motion.div>
              )}
              {openStage === 1 && (
                <motion.div
                  initial={{ opacity: 0, scaleY: 0 }}
                  animate={{ opacity: 1, scaleY: 1 }}
                  transition={{ duration: 0.8 }}
                >
                  <div className="w-32 h-40 bg-gradient-to-b from-amber-900/30 to-amber-950/50 border border-amber-500/20 rounded-lg mx-auto flex items-center justify-center">
                    <motion.div
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                      className="text-3xl"
                    >
                      {moodEmoji(capsule.mood) || '✉️'}
                    </motion.div>
                  </div>
                  <p className="text-amber-400 mt-3 text-sm">信纸展开中...</p>
                </motion.div>
              )}
              {openStage === 2 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <Sparkles className="w-12 h-12 text-amber-400 mx-auto" />
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-amber-400 mt-3 font-medium"
                  >
                    即将呈现...
                  </motion.p>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 1, ease: 'linear' }}
                    className="h-1 bg-amber-400 rounded-full mt-3 mx-auto max-w-48"
                  />
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            capsule.sealed ? 'bg-purple-500/10' : 'bg-emerald-500/10'
          }`}>
            {capsule.sealed ? <Lock className="w-5 h-5 text-purple-400" /> : <Unlock className="w-5 h-5 text-emerald-400" />}
          </div>
          <div>
            <p className="text-white font-medium">{capsule.title}</p>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="flex items-center gap-0.5">
                <Icon className="w-3 h-3" />
                {capsule.contentType === 'letter' ? '信件' : capsule.contentType === 'wish' ? '祝福' : '文字'}
              </span>
              {capsule.mood && (
                <span>{moodEmoji(capsule.mood)}</span>
              )}
              {importanceInfo && (
                <span className={`${importanceInfo.color}`}>
                  {importanceInfo.value === 'high' && <Heart className="w-3 h-3 inline" />}
                  {importanceInfo.label}
                </span>
              )}
            </div>
          </div>
        </div>
        <button
          onClick={() => onDelete(capsule.id)}
          className="text-slate-600 hover:text-red-400 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm">
          <Mail className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-slate-400">收件人：</span>
          <span className="text-white">{capsule.recipientName || '自己'}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-slate-400">送达日期：</span>
          <span className="text-white">{new Date(capsule.deliveryDate).toLocaleDateString('zh-CN')}</span>
        </div>
      </div>

      {capsule.sealed && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-800/50 border border-slate-700 mb-4">
          <Clock className="w-4 h-4 text-purple-400 shrink-0" />
          {daysLeft > 0 ? (
            <div className="flex-1">
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-slate-300">倒计时</span>
                <span className="text-purple-400 font-medium">{daysLeft} 天</span>
              </div>
              <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-400 rounded-full"
                  style={{
                    width: `${Math.max(5, 100 - (daysLeft / 365 * 100))}%`,
                  }}
                />
              </div>
            </div>
          ) : (
            <span className="text-amber-400 text-sm font-medium">可以开启了！</span>
          )}
        </div>
      )}

      {capsule.opened ? (
        <button
          onClick={() => onView(capsule)}
          className="w-full py-2.5 bg-emerald-500/10 text-emerald-400 text-sm font-medium rounded-xl transition-colors hover:bg-emerald-500/20"
        >
          查看内容
        </button>
      ) : canOpen ? (
        <button
          onClick={() => onOpen(capsule)}
          className="w-full py-2.5 bg-amber-500/10 text-amber-400 text-sm font-medium rounded-xl transition-colors hover:bg-amber-500/20 flex items-center justify-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          开启胶囊
        </button>
      ) : (
        <div className="w-full py-2.5 bg-slate-800/50 text-slate-500 text-sm text-center rounded-xl flex items-center justify-center gap-2">
          <Lock className="w-3.5 h-3.5" />
          已密封
        </div>
      )}
    </motion.div>
  )
}
