import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useStore } from '../store'
import {
  LayoutDashboard, KeyRound, StickyNote, Users, Timer,
  ShieldAlert, Shield, LogOut, Lock, Search
} from 'lucide-react'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import OnboardingOverlay from './OnboardingOverlay'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: '首页' },
  { to: '/passwords', icon: KeyRound, label: '密码' },
  { to: '/notes', icon: StickyNote, label: '笔记' },
  { to: '/inheritance', icon: Users, label: '传承' },
  { to: '/capsules', icon: Timer, label: '胶囊' },
  { to: '/emergency', icon: ShieldAlert, label: '紧急' },
  { to: '/audit', icon: Shield, label: '审计' },
]

export default function AppLayout() {
  const { logout, userName, onboardingComplete } = useStore()
  const navigate = useNavigate()
  const [showSearch, setShowSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const passwords = useStore(s => s.passwords)
  const notes = useStore(s => s.notes)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const searchResults = searchQuery.trim() ? [
    ...passwords.filter(p =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.username.toLowerCase().includes(searchQuery.toLowerCase())
    ).map(p => ({ type: 'password' as const, title: p.title, sub: p.username })),
    ...notes.filter(n =>
      n.title.toLowerCase().includes(searchQuery.toLowerCase())
    ).map(n => ({ type: 'note' as const, title: n.title, sub: '安全笔记' })),
  ] : []

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Sidebar - desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900/50 border-r border-slate-800 fixed h-full z-20">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <Lock className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h1 className="font-bold text-white text-lg">Legacy Vault</h1>
              <p className="text-xs text-slate-400">零知识加密</p>
            </div>
          </div>
        </div>

        <div className="p-4">
          <button
            onClick={() => setShowSearch(true)}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800/50 text-slate-400 text-sm hover:bg-slate-800 transition-colors"
          >
            <Search className="w-4 h-4" />
            搜索...
          </button>
        </div>

        <nav className="flex-1 px-3 space-y-1">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-emerald-500/10 text-emerald-400 shadow-lg shadow-emerald-500/5'
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 px-4 py-2">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-sm">
              {userName ? userName[0] : 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white truncate">{userName || '用户'}</p>
              <p className="text-xs text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block"></span>
                已加密
              </p>
            </div>
            <button onClick={handleLogout} className="text-slate-400 hover:text-white transition-colors">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 md:ml-64 pb-20 md:pb-0">
        {/* Mobile header */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800 sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-emerald-400" />
            <span className="font-bold text-white">Legacy Vault</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setShowSearch(true)} className="text-slate-400">
              <Search className="w-5 h-5" />
            </button>
            <button onClick={handleLogout} className="text-slate-400">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>

        <Outlet />
      </main>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-xl border-t border-slate-800 z-20">
        <div className="flex justify-around py-2">
          {navItems.slice(0, 5).map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 px-3 py-1 text-xs ${
                  isActive ? 'text-emerald-400' : 'text-slate-500'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Onboarding overlay */}
      {!onboardingComplete && <OnboardingOverlay />}

      {/* Search overlay */}
      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center pt-[15vh]"
            onClick={() => { setShowSearch(false); setSearchQuery(''); }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="w-full max-w-lg mx-4 bg-slate-900 rounded-2xl border border-slate-700 shadow-2xl overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-800">
                <Search className="w-5 h-5 text-slate-400" />
                <input
                  autoFocus
                  type="text"
                  placeholder="搜索密码、笔记..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent text-white outline-none placeholder:text-slate-500"
                />
              </div>
              {searchResults.length > 0 && (
                <div className="max-h-80 overflow-y-auto p-2">
                  {searchResults.map((r, i) => (
                    <button
                      key={i}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-800 text-left"
                      onClick={() => {
                        navigate(r.type === 'password' ? '/passwords' : '/notes')
                        setShowSearch(false)
                        setSearchQuery('')
                      }}
                    >
                      {r.type === 'password' ? <KeyRound className="w-4 h-4 text-emerald-400" /> : <StickyNote className="w-4 h-4 text-blue-400" />}
                      <div>
                        <p className="text-sm text-white">{r.title}</p>
                        <p className="text-xs text-slate-400">{r.sub}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              {searchQuery && searchResults.length === 0 && (
                <p className="p-4 text-center text-slate-400 text-sm">未找到匹配结果</p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
