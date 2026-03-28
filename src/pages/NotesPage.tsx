import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X, StickyNote, Lock, Unlock, Shield, Trash2, Eye, Edit3 } from 'lucide-react'
import { useStore, type NoteEntry } from '../store'
import Markdown from 'react-markdown'
import { useI18n, getLocaleForDate } from '../i18n'

export default function NotesPage() {
  const { notes, guardians, addNote, updateNote, deleteNote } = useStore()
  const { t, locale } = useI18n()
  const [selectedNote, setSelectedNote] = useState<NoteEntry | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [editContent, setEditContent] = useState('')
  const [editTitle, setEditTitle] = useState('')
  const [editGuardian, setEditGuardian] = useState('')
  const [showPreview, setShowPreview] = useState(false)
  const [encryptAnim, setEncryptAnim] = useState(false)
  const [decryptAnim, setDecryptAnim] = useState<string | null>(null)

  const openNote = (note: NoteEntry) => {
    setDecryptAnim(note.id)
    setTimeout(() => {
      setSelectedNote(note)
      setEditContent(note.content)
      setEditTitle(note.title)
      setEditGuardian(note.guardianId || '')
      setIsEditing(false)
      setShowPreview(false)
      setDecryptAnim(null)
    }, 600)
  }

  const handleSave = () => {
    if (selectedNote) {
      setEncryptAnim(true)
      setTimeout(() => {
        updateNote(selectedNote.id, {
          title: editTitle,
          content: editContent,
          guardianId: editGuardian || null,
        })
        setSelectedNote({ ...selectedNote, title: editTitle, content: editContent, guardianId: editGuardian || null })
        setIsEditing(false)
        setEncryptAnim(false)
      }, 500)
    }
  }

  const handleCreate = () => {
    if (!editTitle.trim()) return
    setEncryptAnim(true)
    setTimeout(() => {
      addNote({
        title: editTitle,
        content: editContent,
        encrypted: true,
        guardianId: editGuardian || null,
      })
      setShowNew(false)
      setEditTitle('')
      setEditContent('')
      setEditGuardian('')
      setEncryptAnim(false)
    }, 500)
  }

  const startNew = () => {
    setSelectedNote(null)
    setEditTitle('')
    setEditContent('')
    setEditGuardian('')
    setShowNew(true)
    setIsEditing(true)
    setShowPreview(false)
  }

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">{t('notes.title')}</h1>
          <p className="text-sm text-slate-400 mt-1">{t('notes.subtitle')}</p>
        </div>
        <button
          onClick={startNew}
          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl text-sm font-medium transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          {t('notes.newNote')}
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Note list */}
        <div className="lg:w-80 shrink-0 space-y-2">
          {notes.length === 0 ? (
            <div className="p-8 text-center bg-slate-900/50 border border-slate-800 rounded-2xl">
              <StickyNote className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <p className="text-sm text-slate-500">{t('notes.emptyState')}</p>
            </div>
          ) : (
            notes.map(note => {
              const guardian = note.guardianId ? guardians.find(g => g.id === note.guardianId) : null
              return (
                <motion.button
                  key={note.id}
                  layout
                  onClick={() => openNote(note)}
                  className={`w-full p-4 rounded-xl border text-left transition-colors relative ${
                    selectedNote?.id === note.id
                      ? 'bg-emerald-950/30 border-emerald-500/30'
                      : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {decryptAnim === note.id && (
                    <motion.div
                      initial={{ opacity: 1 }}
                      animate={{ opacity: 0 }}
                      transition={{ duration: 0.6 }}
                      className="absolute inset-0 bg-emerald-500/10 rounded-xl flex items-center justify-center"
                    >
                      <Unlock className="w-5 h-5 text-emerald-400 animate-pulse" />
                    </motion.div>
                  )}
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white font-medium truncate">{note.title}</p>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                        {note.content.replace(/[#*>`\-]/g, '').slice(0, 80)}...
                      </p>
                    </div>
                    <Lock className="w-3.5 h-3.5 text-emerald-500/50 shrink-0 mt-0.5" />
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-slate-600">{new Date(note.updatedAt).toLocaleDateString(getLocaleForDate(locale))}</span>
                    {guardian && (
                      <span className="text-xs text-emerald-500/60 flex items-center gap-0.5">
                        <Shield className="w-3 h-3" /> {guardian.name}
                      </span>
                    )}
                  </div>
                </motion.button>
              )
            })
          )}
        </div>

        {/* Note editor/viewer */}
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            {(selectedNote || showNew) ? (
              <motion.div
                key={selectedNote?.id || 'new'}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden"
              >
                {/* Encrypt animation overlay */}
                <AnimatePresence>
                  {encryptAnim && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 z-10 bg-slate-900/80 flex items-center justify-center rounded-2xl"
                    >
                      <div className="text-center">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
                        >
                          <Lock className="w-8 h-8 text-emerald-400 mx-auto" />
                        </motion.div>
                        <p className="text-emerald-400 text-sm mt-2">{t('notes.encrypting')}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
                  {isEditing ? (
                    <input
                      value={editTitle}
                      onChange={e => setEditTitle(e.target.value)}
                      placeholder={t('notes.titlePlaceholder')}
                      className="text-lg font-semibold text-white bg-transparent outline-none flex-1 placeholder:text-slate-500"
                    />
                  ) : (
                    <h3 className="text-lg font-semibold text-white">{selectedNote?.title}</h3>
                  )}
                  <div className="flex items-center gap-2">
                    {isEditing && (
                      <button
                        onClick={() => setShowPreview(!showPreview)}
                        className={`p-2 rounded-lg text-sm transition-colors ${showPreview ? 'bg-emerald-500/10 text-emerald-400' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    )}
                    {!isEditing && selectedNote && (
                      <>
                        <button onClick={() => { setIsEditing(true); setShowPreview(false); }} className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button onClick={() => { deleteNote(selectedNote.id); setSelectedNote(null); }} className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => { setSelectedNote(null); setShowNew(false); setIsEditing(false); }}
                      className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 relative" style={{ minHeight: 300 }}>
                  {isEditing ? (
                    <div className="flex gap-4 h-full">
                      <textarea
                        value={editContent}
                        onChange={e => setEditContent(e.target.value)}
                        placeholder={t('notes.contentPlaceholder')}
                        className={`bg-transparent text-white text-sm leading-relaxed outline-none resize-none placeholder:text-slate-500 ${showPreview ? 'w-1/2' : 'w-full'}`}
                        style={{ minHeight: 280 }}
                      />
                      {showPreview && (
                        <div className="w-1/2 border-l border-slate-800 pl-4 markdown-body text-slate-300 text-sm overflow-y-auto">
                          <Markdown>{editContent}</Markdown>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="markdown-body text-slate-300 text-sm">
                      <Markdown>{selectedNote?.content || ''}</Markdown>
                    </div>
                  )}
                </div>

                {/* Footer */}
                {isEditing && (
                  <div className="px-6 py-4 border-t border-slate-800 flex items-center justify-between">
                    <select
                      value={editGuardian}
                      onChange={e => setEditGuardian(e.target.value)}
                      className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="">{t('notes.noGuardian')}</option>
                      {guardians.map(g => (
                        <option key={g.id} value={g.id}>{g.avatar} {g.name}</option>
                      ))}
                    </select>
                    <div className="flex gap-2">
                      <button
                        onClick={() => { setIsEditing(false); if (showNew) setShowNew(false); }}
                        className="px-4 py-2 text-slate-400 text-sm hover:text-white transition-colors"
                      >
                        {t('common.cancel')}
                      </button>
                      <button
                        onClick={showNew ? handleCreate : handleSave}
                        disabled={!editTitle.trim()}
                        className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-700 disabled:text-slate-500 text-white text-sm font-medium rounded-xl transition-colors flex items-center gap-1.5"
                      >
                        <Lock className="w-3.5 h-3.5" />
                        {t('notes.secureStore')}
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-center h-64 bg-slate-900/30 border border-slate-800 rounded-2xl border-dashed"
              >
                <div className="text-center">
                  <StickyNote className="w-10 h-10 text-slate-700 mx-auto mb-3" />
                  <p className="text-slate-500 text-sm">{t('notes.selectNote')}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
