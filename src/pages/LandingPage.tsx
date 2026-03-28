import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Lock, Shield, Users, Timer, Eye, EyeOff, Check, Github,
  ShieldCheck, Fingerprint, ArrowRight, ChevronDown, Star,
  Key, Layers, Zap, FileText, X
} from 'lucide-react'
import { simulateEncrypt, checkPasswordStrength } from '../utils/crypto'
import { useI18n } from '../i18n'
import LanguageSwitcher from '../components/LanguageSwitcher'

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 },
}

export default function LandingPage() {
  const navigate = useNavigate()
  const [showWhitepaper, setShowWhitepaper] = useState(false)

  return (
    <div className="min-h-screen bg-slate-950 overflow-x-hidden">
      <Header onStart={() => navigate('/setup')} onWhitepaper={() => setShowWhitepaper(true)} />
      <HeroSection onStart={() => navigate('/setup')} />
      <FeaturesSection />
      <EncryptDemo />
      <KeyDerivationDemo />
      <BruteForceCalculator />
      <PricingSection />
      <TrustSection />
      <FAQSection />
      <CTASection onStart={() => navigate('/setup')} />
      <Footer />

      {/* Security Whitepaper Modal */}
      <AnimatePresence>
        {showWhitepaper && (
          <SecurityWhitepaper onClose={() => setShowWhitepaper(false)} />
        )}
      </AnimatePresence>
    </div>
  )
}

function Header({ onStart, onWhitepaper }: { onStart: () => void; onWhitepaper: () => void }) {
  const [scrolled, setScrolled] = useState(false)
  const { t } = useI18n()
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', h)
    return () => window.removeEventListener('scroll', h)
  }, [])
  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-slate-950/90 backdrop-blur-xl border-b border-slate-800' : ''}`}>
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Lock className="w-6 h-6 text-emerald-400" />
          <span className="text-xl font-bold text-white">Legacy Vault</span>
        </div>
        <nav className="hidden md:flex items-center gap-8 text-sm text-slate-300">
          <a href="#features" className="hover:text-white transition">{t('landing.features')}</a>
          <a href="#demo" className="hover:text-white transition">{t('landing.encryptDemo')}</a>
          <a href="#pricing" className="hover:text-white transition">{t('landing.pricing')}</a>
          <button onClick={onWhitepaper} className="hover:text-white transition">{t('landing.whitepaper')}</button>
        </nav>
        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <button onClick={onStart} className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-white font-medium rounded-xl text-sm transition-colors">
            {t('landing.startProtecting')}
          </button>
        </div>
      </div>
    </header>
  )
}

function HeroSection({ onStart }: { onStart: () => void }) {
  const { t } = useI18n()
  return (
    <section className="relative min-h-screen flex items-center justify-center px-6 pt-20">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-4xl mx-auto text-center relative z-10">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm mb-8">
          <ShieldCheck className="w-4 h-4" />
          {t('landing.badge')}
        </motion.div>

        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-tight mb-6">
          {t('landing.heroTitle1')}<br /><span className="text-emerald-400">{t('landing.heroTitle2')}</span>{t('landing.heroTitle3')}
        </motion.h1>

        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          {t('landing.heroSub1')}<br /><span className="text-slate-300">{t('landing.heroSub2')}</span>
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center">
          <button onClick={onStart}
            className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold rounded-2xl text-lg transition-all hover:shadow-lg hover:shadow-emerald-500/25 flex items-center justify-center gap-2">
            {t('landing.ctaStart')}<ArrowRight className="w-5 h-5" />
          </button>
          <a href="#demo"
            className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-2xl text-lg transition-colors flex items-center justify-center gap-2">
            <Eye className="w-5 h-5" />{t('landing.ctaDemo')}
          </a>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} className="mt-16 flex justify-center">
          <a href="#features" className="text-slate-500 animate-bounce"><ChevronDown className="w-6 h-6" /></a>
        </motion.div>
      </div>
    </section>
  )
}

function FeaturesSection() {
  const { t } = useI18n()
  const features = [
    { icon: Lock, title: t('landing.featureSecureStorage'), desc: t('landing.featureSecureStorageDesc'), color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { icon: Users, title: t('landing.featureInheritance'), desc: t('landing.featureInheritanceDesc'), color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { icon: Timer, title: t('landing.featureTimeCapsule'), desc: t('landing.featureTimeCapsuleDesc'), color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { icon: Fingerprint, title: t('landing.featureZeroKnowledge'), desc: t('landing.featureZeroKnowledgeDesc'), color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { icon: ShieldCheck, title: t('landing.featureSurvival'), desc: t('landing.featureSurvivalDesc'), color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
    { icon: Shield, title: t('landing.featureEmergency'), desc: t('landing.featureEmergencyDesc'), color: 'text-rose-400', bg: 'bg-rose-500/10' },
  ]

  return (
    <section id="features" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div {...fadeUp} className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{t('landing.featuresTitle')}</h2>
          <p className="text-slate-400 text-lg">{t('landing.featuresSub')}</p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-slate-700 transition-colors group"
            >
              <div className={`w-12 h-12 rounded-xl ${f.bg} flex items-center justify-center mb-4`}>
                <f.icon className={`w-6 h-6 ${f.color}`} />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{f.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function EncryptDemo() {
  const { t } = useI18n()
  const [input, setInput] = useState('')
  const [encrypted, setEncrypted] = useState('')
  const [isEncrypting, setIsEncrypting] = useState(false)
  const [showDecrypted, setShowDecrypted] = useState(false)
  const [chars, setChars] = useState<{ char: string; encrypted: boolean }[]>([])
  const timeoutsRef = useRef<number[]>([])

  const handleEncrypt = () => {
    if (!input.trim() || isEncrypting) return
    setIsEncrypting(true)
    setShowDecrypted(false)
    setEncrypted('')

    // Clear previous timeouts
    timeoutsRef.current.forEach(clearTimeout)
    timeoutsRef.current = []

    const newChars = input.split('').map(c => ({ char: c, encrypted: false }))
    setChars(newChars)

    // Animate each char
    newChars.forEach((_, i) => {
      const t = window.setTimeout(() => {
        setChars(prev => prev.map((c, j) => j === i ? { ...c, encrypted: true } : c))
      }, i * 80)
      timeoutsRef.current.push(t)
    })

    const t = window.setTimeout(() => {
      const enc = simulateEncrypt(input)
      setEncrypted(enc)
      setIsEncrypting(false)
    }, newChars.length * 80 + 300)
    timeoutsRef.current.push(t)
  }

  const handleDecrypt = () => {
    setShowDecrypted(true)
  }

  return (
    <section id="demo" className="py-24 px-6 bg-slate-900/30">
      <div className="max-w-3xl mx-auto">
        <motion.div {...fadeUp} className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{t('landing.encryptTitle')}</h2>
          <p className="text-slate-400 text-lg">{t('landing.encryptSub')}</p>
        </motion.div>

        <motion.div
          {...fadeUp}
          className="p-8 rounded-2xl bg-slate-900 border border-slate-800"
        >
          <div className="space-y-6">
            <div>
              <label className="text-sm text-slate-400 mb-2 block">{t('landing.encryptLabel')}</label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={input}
                  onChange={e => { setInput(e.target.value); setEncrypted(''); setShowDecrypted(false); setChars([]); }}
                  placeholder={t('landing.encryptPlaceholder')}
                  className="flex-1 px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                />
                <button
                  onClick={handleEncrypt}
                  disabled={!input.trim() || isEncrypting}
                  className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-700 disabled:text-slate-500 text-white font-medium rounded-xl transition-colors flex items-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  {t('landing.encryptBtn')}
                </button>
              </div>
            </div>

            {/* Encryption animation */}
            {chars.length > 0 && !encrypted && (
              <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
                <p className="text-xs text-slate-500 mb-2">{t('landing.encryptingLabel')}</p>
                <div className="font-mono text-lg flex flex-wrap gap-0.5">
                  {chars.map((c, i) => (
                    <span
                      key={i}
                      className={`inline-block transition-all duration-300 ${
                        c.encrypted
                          ? 'text-emerald-400 scale-110'
                          : 'text-white'
                      }`}
                    >
                      {c.encrypted
                        ? String.fromCharCode(33 + Math.floor(Math.random() * 93))
                        : c.char}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Encrypted result */}
            <AnimatePresence>
              {encrypted && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/20">
                    <div className="flex items-center gap-2 text-emerald-400 text-sm mb-2">
                      <ShieldCheck className="w-4 h-4" />
                      {t('landing.encryptedLabel')}
                    </div>
                    <p className="font-mono text-sm text-emerald-300/70 break-all">{encrypted}</p>
                  </div>

                  <div className="flex items-center gap-4">
                    <button
                      onClick={handleDecrypt}
                      className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm transition-colors flex items-center gap-2"
                    >
                      {showDecrypted ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      {showDecrypted ? t('landing.hideDecrypted') : t('landing.decryptBtn')}
                    </button>
                  </div>

                  {showDecrypted && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="p-4 rounded-xl bg-slate-800/50 border border-slate-700"
                    >
                      <p className="text-xs text-slate-500 mb-1">{t('landing.decryptResult')}</p>
                      <p className="text-white">{input}</p>
                    </motion.div>
                  )}

                  <p className="text-center text-slate-500 text-sm mt-4">
                    {t('landing.encryptFooter')}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

function KeyDerivationDemo() {
  const { t } = useI18n()
  const [started, setStarted] = useState(false)
  const [step, setStep] = useState(0)
  const [animDone, setAnimDone] = useState(false)
  const timeoutsRef = useRef<number[]>([])

  const steps = [
    { label: t('landing.kdStep1Label'), value: t('landing.kdStep1Value'), icon: Key, color: 'text-amber-400', bg: 'bg-amber-500/10', desc: t('landing.kdStep1Desc') },
    { label: t('landing.kdStep2Label'), value: t('landing.kdStep2Value'), icon: Zap, color: 'text-purple-400', bg: 'bg-purple-500/10', desc: t('landing.kdStep2Desc') },
    { label: t('landing.kdStep3Label'), value: t('landing.kdStep3Value'), icon: Shield, color: 'text-blue-400', bg: 'bg-blue-500/10', desc: t('landing.kdStep3Desc') },
    { label: t('landing.kdStep4Label'), value: t('landing.kdStep4Value'), icon: Layers, color: 'text-emerald-400', bg: 'bg-emerald-500/10', desc: t('landing.kdStep4Desc') },
    { label: t('landing.kdStep5Label'), value: t('landing.kdStep5Value'), icon: Lock, color: 'text-cyan-400', bg: 'bg-cyan-500/10', desc: t('landing.kdStep5Desc') },
  ]

  const handleStart = () => {
    setStarted(true)
    setStep(0)
    setAnimDone(false)
    timeoutsRef.current.forEach(clearTimeout)
    timeoutsRef.current = []

    steps.forEach((_, i) => {
      const t = window.setTimeout(() => {
        setStep(i)
        if (i === steps.length - 1) {
          window.setTimeout(() => setAnimDone(true), 500)
        }
      }, i * 1200)
      timeoutsRef.current.push(t)
    })
  }

  return (
    <section className="py-24 px-6">
      <div className="max-w-3xl mx-auto">
        <motion.div {...fadeUp} className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{t('landing.keyDerivationTitle')}</h2>
          <p className="text-slate-400 text-lg">{t('landing.keyDerivationSub')}</p>
        </motion.div>

        <motion.div {...fadeUp} className="p-8 rounded-2xl bg-slate-900 border border-slate-800">
          {!started ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                <Key className="w-8 h-8 text-emerald-400" />
              </div>
              <p className="text-slate-400 mb-6">{t('landing.kdDemoPrompt')}</p>
              <button
                onClick={handleStart}
                className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-white font-medium rounded-xl transition-colors"
              >
                {t('landing.keyDerivationStart')}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {steps.map((s, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: i <= step ? 1 : 0.2, x: 0 }}
                  transition={{ delay: 0.1, duration: 0.4 }}
                  className="relative"
                >
                  <div className={`flex items-start gap-4 p-4 rounded-xl border transition-colors ${
                    i <= step ? 'bg-slate-800/50 border-slate-700' : 'border-transparent'
                  }`}>
                    <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center shrink-0`}>
                      <s.icon className={`w-5 h-5 ${i <= step ? s.color : 'text-slate-600'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={`text-sm font-medium ${i <= step ? 'text-white' : 'text-slate-600'}`}>{s.label}</p>
                        <span className={`text-xs ${i <= step ? s.color : 'text-slate-700'}`}>{s.desc}</span>
                      </div>
                      <p className={`text-xs font-mono mt-1 ${i <= step ? 'text-slate-400' : 'text-slate-700'}`}>
                        {i <= step ? s.value : '...'}
                      </p>
                    </div>
                    {i < step && <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-3" />}
                    {i === step && !animDone && (
                      <motion.div
                        animate={{ opacity: [1, 0.3, 1] }}
                        transition={{ repeat: Infinity, duration: 1 }}
                        className="w-2 h-2 rounded-full bg-emerald-400 shrink-0 mt-4"
                      />
                    )}
                  </div>
                  {i < steps.length - 1 && i <= step && (
                    <div className="ml-9 h-4 border-l-2 border-dashed border-slate-700" />
                  )}
                </motion.div>
              ))}

              {animDone && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-4 p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/20 text-center"
                >
                  <p className="text-emerald-400 text-sm">{t('landing.keyDerivationDone')}</p>
                  <button
                    onClick={handleStart}
                    className="mt-3 text-xs text-emerald-400/70 hover:text-emerald-400 transition-colors"
                  >
                    {t('landing.keyDerivationReplay')}
                  </button>
                </motion.div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </section>
  )
}

function BruteForceCalculator() {
  const { t } = useI18n()
  const [pw, setPw] = useState('')
  const strength = pw ? checkPasswordStrength(pw) : null

  const calcBruteForceTime = (password: string): string => {
    let charsetSize = 0
    if (/[a-z]/.test(password)) charsetSize += 26
    if (/[A-Z]/.test(password)) charsetSize += 26
    if (/[0-9]/.test(password)) charsetSize += 10
    if (/[^a-zA-Z0-9]/.test(password)) charsetSize += 33
    if (charsetSize === 0) return '---'

    const combinations = Math.pow(charsetSize, password.length)
    const guessesPerSecond = 1e12 // 1 trillion guesses/sec (modern GPU cluster)
    const seconds = combinations / guessesPerSecond

    if (seconds < 1) return t('landing.bruteForceInstant')
    if (seconds < 60) return `${Math.round(seconds)} ${t('landing.bruteForceSeconds')}`
    if (seconds < 3600) return `${Math.round(seconds / 60)} ${t('landing.bruteForceMinutes')}`
    if (seconds < 86400) return `${Math.round(seconds / 3600)} ${t('landing.bruteForceHours')}`
    if (seconds < 86400 * 365) return `${Math.round(seconds / 86400)} ${t('landing.bruteForceDays')}`
    if (seconds < 86400 * 365 * 1e3) return `${Math.round(seconds / (86400 * 365))} ${t('landing.bruteForceYears')}`
    if (seconds < 86400 * 365 * 1e6) return `${(seconds / (86400 * 365 * 1e3)).toFixed(0)} ${t('landing.bruteForceThousandYears')}`
    if (seconds < 86400 * 365 * 1e9) return `${(seconds / (86400 * 365 * 1e6)).toFixed(0)} ${t('landing.bruteForceMillionYears')}`
    if (seconds < 86400 * 365 * 1e12) return `${(seconds / (86400 * 365 * 1e9)).toFixed(0)} ${t('landing.bruteForceBillionYears')}`
    return t('landing.bruteForceBeyond')
  }

  const bruteForceTime = pw ? calcBruteForceTime(pw) : null

  return (
    <section className="py-24 px-6 bg-slate-900/30">
      <div className="max-w-3xl mx-auto">
        <motion.div {...fadeUp} className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{t('landing.bruteForceTitle')}</h2>
          <p className="text-slate-400 text-lg">{t('landing.bruteForceSub')}</p>
        </motion.div>

        <motion.div {...fadeUp} className="p-8 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="space-y-6">
            <div>
              <label className="text-sm text-slate-400 mb-2 block">{t('landing.bruteForceLabel')}</label>
              <input
                type="text"
                value={pw}
                onChange={e => setPw(e.target.value)}
                placeholder={t('landing.bruteForcePlaceholder')}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>

            {strength && (
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-400">{t('landing.bruteForceStrength')}</span>
                    <span style={{ color: strength.color }}>{strength.label}</span>
                  </div>
                  <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${strength.score}%` }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: strength.color }}
                    />
                  </div>
                </div>

                <div className="p-6 rounded-xl bg-slate-800/50 border border-slate-700 text-center">
                  <p className="text-xs text-slate-500 mb-2">{t('landing.bruteForceTime')}</p>
                  <p className="text-3xl font-bold text-white">{bruteForceTime}</p>
                  <div className="mt-3 flex items-center justify-center gap-4 text-xs text-slate-500">
                    <span>{t('landing.bruteForceLength')}: {pw.length}</span>
                    <span>|</span>
                    <span>{t('landing.bruteForceArgon')}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="p-3 rounded-lg bg-slate-800/50 text-center">
                    <p className="text-slate-500 text-xs mb-1">{t('landing.bruteForceLength')}</p>
                    <p className="text-white font-medium">{pw.length} {t('landing.bruteForceChars')}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-800/50 text-center">
                    <p className="text-slate-500 text-xs mb-1">{t('landing.bruteForceCharset')}</p>
                    <p className="text-white font-medium">
                      {(/[a-z]/.test(pw) ? 26 : 0) + (/[A-Z]/.test(pw) ? 26 : 0) + (/[0-9]/.test(pw) ? 10 : 0) + (/[^a-zA-Z0-9]/.test(pw) ? 33 : 0)} {t('landing.bruteForceTypes')}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

function PricingSection() {
  const { t, tArray } = useI18n()
  const plans = [
    {
      name: 'Free',
      price: t('landing.pricingFree'),
      period: '',
      desc: t('landing.pricingFreeDesc'),
      features: tArray('landing.pricingFreeFeatures'),
      cta: t('landing.pricingFreeCta'),
      popular: false,
    },
    {
      name: 'Personal',
      price: '$4.99',
      period: '/mo',
      desc: t('landing.pricingPersonalDesc'),
      features: tArray('landing.pricingPersonalFeatures'),
      cta: t('landing.pricingPersonalCta'),
      popular: true,
    },
    {
      name: 'Family',
      price: '$9.99',
      period: '/mo',
      desc: t('landing.pricingFamilyDesc'),
      features: tArray('landing.pricingFamilyFeatures'),
      cta: t('landing.pricingFamilyCta'),
      popular: false,
    },
    {
      name: 'Legacy',
      price: '$19.99',
      period: '/mo',
      desc: t('landing.pricingLegacyDesc'),
      features: tArray('landing.pricingLegacyFeatures'),
      cta: t('landing.pricingLegacyCta'),
      popular: false,
    },
  ]

  return (
    <section id="pricing" className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div {...fadeUp} className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{t('landing.pricingTitle')}</h2>
          <p className="text-slate-400 text-lg">{t('landing.pricingSub')}</p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`relative p-6 rounded-2xl border transition-colors ${
                plan.popular
                  ? 'bg-emerald-950/30 border-emerald-500/30 shadow-lg shadow-emerald-500/10'
                  : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-emerald-500 text-white text-xs font-medium rounded-full">
                  {t('landing.pricingPopular')}
                </div>
              )}
              <h3 className="text-lg font-semibold text-white mb-1">{plan.name}</h3>
              <p className="text-sm text-slate-400 mb-4">{plan.desc}</p>
              <div className="mb-6">
                <span className="text-3xl font-bold text-white">{plan.price}</span>
                <span className="text-slate-400">{plan.period}</span>
              </div>
              <ul className="space-y-3 mb-6">
                {plan.features.map((f, j) => (
                  <li key={j} className="flex items-center gap-2 text-sm text-slate-300">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <button className={`w-full py-3 rounded-xl font-medium transition-colors ${
                plan.popular
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-white'
                  : 'bg-slate-800 hover:bg-slate-700 text-white'
              }`}>
                {plan.cta}
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function TrustSection() {
  const { t } = useI18n()
  const items = [
    { icon: Github, title: t('landing.trustOpenSource'), desc: t('landing.trustOpenSourceDesc') },
    { icon: ShieldCheck, title: t('landing.trustAudit'), desc: t('landing.trustAuditDesc') },
    { icon: Fingerprint, title: t('landing.trustZeroKnowledge'), desc: t('landing.trustZeroKnowledgeDesc') },
  ]

  return (
    <section id="trust" className="py-24 px-6 bg-slate-900/30">
      <div className="max-w-4xl mx-auto">
        <motion.div {...fadeUp} className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{t('landing.trustTitle')}</h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {items.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                <item.icon className="w-7 h-7 text-emerald-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
              <p className="text-slate-400 text-sm">{item.desc}</p>
            </motion.div>
          ))}
        </div>

        <motion.div {...fadeUp} className="mt-16 flex justify-center gap-8 flex-wrap">
          {['AES-256-GCM', 'Argon2id', 'Shamir SSS', 'E2E Encryption', 'OWASP'].map(badge => (
            <span key={badge} className="px-4 py-2 rounded-full bg-slate-800/50 border border-slate-700 text-slate-400 text-sm">
              {badge}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

function FAQSection() {
  const { t } = useI18n()
  const [open, setOpen] = useState<number | null>(null)
  const faqs = [
    { q: t('landing.faq1q'), a: t('landing.faq1a') },
    { q: t('landing.faq2q'), a: t('landing.faq2a') },
    { q: t('landing.faq3q'), a: t('landing.faq3a') },
    { q: t('landing.faq4q'), a: t('landing.faq4a') },
  ]

  return (
    <section className="py-24 px-6">
      <div className="max-w-3xl mx-auto">
        <motion.div {...fadeUp} className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{t('landing.faqTitle')}</h2>
        </motion.div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="rounded-xl bg-slate-900/50 border border-slate-800 overflow-hidden"
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full px-6 py-4 flex items-center justify-between text-left"
              >
                <span className="text-white font-medium">{faq.q}</span>
                <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${open === i ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {open === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <p className="px-6 pb-4 text-slate-400 text-sm leading-relaxed">{faq.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function CTASection({ onStart }: { onStart: () => void }) {
  const { t } = useI18n()
  return (
    <section className="py-24 px-6">
      <motion.div
        {...fadeUp}
        className="max-w-4xl mx-auto text-center p-12 rounded-3xl bg-gradient-to-br from-emerald-950/50 to-slate-900/50 border border-emerald-500/20"
      >
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{t('landing.ctaTitle')}</h2>
        <p className="text-slate-400 text-lg mb-8">{t('landing.ctaSub')}</p>
        <button
          onClick={onStart}
          className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold rounded-2xl text-lg transition-all hover:shadow-lg hover:shadow-emerald-500/25 inline-flex items-center gap-2"
        >
          {t('landing.ctaBtn')}
          <ArrowRight className="w-5 h-5" />
        </button>
        <div className="mt-6 flex items-center justify-center gap-4 text-sm text-slate-500">
          <span className="flex items-center gap-1"><Star className="w-3 h-3" /> {t('landing.ctaNoCard')}</span>
          <span>|</span>
          <span>{t('landing.ctaSetupTime')}</span>
          <span>|</span>
          <span>{t('landing.ctaForever')}</span>
        </div>
      </motion.div>
    </section>
  )
}

function Footer() {
  const { t } = useI18n()
  return (
    <footer className="border-t border-slate-800 py-8 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-slate-400">
          <Lock className="w-4 h-4 text-emerald-400" />
          <span className="text-sm">Legacy Vault</span>
          <span className="text-slate-600 text-sm">|</span>
          <span className="text-xs text-slate-500">{t('landing.footerEncryption')}</span>
        </div>
        <p className="text-xs text-slate-600">
          {t('landing.footerSlogan')}
        </p>
      </div>
    </footer>
  )
}

function SecurityWhitepaper({ onClose }: { onClose: () => void }) {
  const { t } = useI18n()
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 sticky top-0 bg-slate-900 z-10">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-400" />
            <h3 className="text-lg font-semibold text-white">{t('landing.whitepaperTitle')}</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Encryption layers */}
          <div>
            <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-400" />
              {t('landing.wpEncryptionTitle')}
            </h4>
            <div className="space-y-3">
              {[
                { layer: t('landing.wpLayer1'), title: t('landing.wpLayer1Title'), desc: t('landing.wpLayer1Desc'), color: 'border-amber-500/30 bg-amber-950/20' },
                { layer: t('landing.wpLayer2'), title: t('landing.wpLayer2Title'), desc: t('landing.wpLayer2Desc'), color: 'border-blue-500/30 bg-blue-950/20' },
                { layer: t('landing.wpLayer3'), title: t('landing.wpLayer3Title'), desc: t('landing.wpLayer3Desc'), color: 'border-emerald-500/30 bg-emerald-950/20' },
                { layer: t('landing.wpLayer4'), title: t('landing.wpLayer4Title'), desc: t('landing.wpLayer4Desc'), color: 'border-purple-500/30 bg-purple-950/20' },
              ].map((item, i) => (
                <div key={i} className={`p-4 rounded-xl border ${item.color}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-slate-500">{item.layer}</span>
                    <span className="text-sm font-medium text-white">{item.title}</span>
                  </div>
                  <p className="text-xs text-slate-400">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Zero knowledge */}
          <div>
            <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Fingerprint className="w-5 h-5 text-emerald-400" />
              {t('landing.wpZeroKnowledgeTitle')}
            </h4>
            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
              <p className="text-sm text-slate-300 leading-relaxed mb-3">
                {t('landing.wpZeroKnowledgeP1')}
              </p>
              <p className="text-sm text-slate-300 leading-relaxed">
                {t('landing.wpZeroKnowledgeP2')}
              </p>
            </div>
          </div>

          {/* Shamir Secret Sharing */}
          <div>
            <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-400" />
              {t('landing.wpShamirTitle')}
            </h4>
            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
              <p className="text-sm text-slate-300 leading-relaxed mb-3">
                {t('landing.wpShamirP1')}
              </p>
              <p className="text-sm text-slate-300 leading-relaxed">
                {t('landing.wpShamirP2')}
              </p>
            </div>
          </div>

          {/* Why we can't see data */}
          <div>
            <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-emerald-400" />
              {t('landing.wpWhyCantSeeTitle')}
            </h4>
            <div className="space-y-3">
              <div className="flex gap-4 items-start">
                <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center shrink-0 text-emerald-400 text-sm font-bold">1</div>
                <div>
                  <p className="text-sm text-white">{t('landing.wpStep1Title')}</p>
                  <p className="text-xs text-slate-400">{t('landing.wpStep1Desc')}</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center shrink-0 text-emerald-400 text-sm font-bold">2</div>
                <div>
                  <p className="text-sm text-white">{t('landing.wpStep2Title')}</p>
                  <p className="text-xs text-slate-400">{t('landing.wpStep2Desc')}</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center shrink-0 text-emerald-400 text-sm font-bold">3</div>
                <div>
                  <p className="text-sm text-white">{t('landing.wpStep3Title')}</p>
                  <p className="text-xs text-slate-400">{t('landing.wpStep3Desc')}</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center shrink-0 text-emerald-400 text-sm font-bold">4</div>
                <div>
                  <p className="text-sm text-white">{t('landing.wpStep4Title')}</p>
                  <p className="text-xs text-slate-400">{t('landing.wpStep4Desc')}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/20 text-center">
            <p className="text-sm text-emerald-400">{t('landing.wpFooter')}</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
