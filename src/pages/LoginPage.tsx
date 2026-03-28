import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Lock, Eye, EyeOff, Shield, ArrowRight } from 'lucide-react'
import { useStore } from '../store'
import { useI18n } from '../i18n'
import LanguageSwitcher from '../components/LanguageSwitcher'

export default function LoginPage() {
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isUnlocking, setIsUnlocking] = useState(false)
  const navigate = useNavigate()
  const { login, loginWithBackend, userName, userEmail } = useStore()
  const { t } = useI18n()

  const handleLogin = async () => {
    setError('')
    setIsUnlocking(true)

    // Try local login first
    if (login(password)) {
      // Also try backend login (non-blocking, for token refresh)
      if (userEmail) {
        loginWithBackend(userEmail, password).catch(() => {})
      }
      navigate('/dashboard')
      return
    }

    // If local login fails, try backend
    if (userEmail) {
      try {
        const backendOk = await loginWithBackend(userEmail, password)
        if (backendOk) {
          navigate('/dashboard')
          return
        }
      } catch {
        // Backend unavailable
      }
    }

    setError(t('login.wrongPassword'))
    setIsUnlocking(false)
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <motion.div
            animate={isUnlocking ? { rotateY: 180 } : {}}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 mb-4"
          >
            {isUnlocking ? (
              <Shield className="w-10 h-10 text-emerald-400" />
            ) : (
              <Lock className="w-10 h-10 text-emerald-400" />
            )}
          </motion.div>
          <h1 className="text-2xl font-bold text-white mb-1">{t('login.welcomeBack')}{userName ? `${userName.match(/^[a-zA-Z]/) ? ', ' : '\uff0c'}${userName}` : ''}</h1>
          <p className="text-slate-400 text-sm">{t('login.enterMasterPw')}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8"
        >
          <div className="space-y-4">
            <div>
              <label className="text-sm text-slate-300 mb-1.5 block">{t('login.masterPwLabel')}</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  onKeyDown={e => e.key === 'Enter' && password && handleLogin()}
                  placeholder={t('login.masterPwPlaceholder')}
                  autoFocus
                  className="w-full px-4 py-3 pr-12 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {error && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-red-400 text-sm mt-2"
                >
                  {error}
                </motion.p>
              )}
            </div>

            <button
              onClick={handleLogin}
              disabled={!password || isUnlocking}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-700 disabled:text-slate-500 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {isUnlocking ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                  />
                  {t('login.unlocking')}
                </>
              ) : (
                <>
                  {t('login.unlock')} <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-800">
            <p className="text-xs text-slate-500 text-center flex items-center justify-center gap-1">
              <Shield className="w-3 h-3 text-emerald-500" />
              {t('login.footer')}
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
