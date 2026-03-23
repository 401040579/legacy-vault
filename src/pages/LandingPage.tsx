import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Lock, Shield, Users, Timer, Eye, EyeOff, Check, Github,
  ShieldCheck, Fingerprint, ArrowRight, ChevronDown, Star,
  Key, Layers, Zap, FileText, X
} from 'lucide-react'
import { simulateEncrypt, checkPasswordStrength } from '../utils/crypto'

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
          <a href="#features" className="hover:text-white transition">功能</a>
          <a href="#demo" className="hover:text-white transition">加密演示</a>
          <a href="#pricing" className="hover:text-white transition">定价</a>
          <button onClick={onWhitepaper} className="hover:text-white transition">安全白皮书</button>
        </nav>
        <button onClick={onStart} className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-white font-medium rounded-xl text-sm transition-colors">
          开始保护
        </button>
      </div>
    </header>
  )
}

function HeroSection({ onStart }: { onStart: () => void }) {
  return (
    <section className="relative min-h-screen flex items-center justify-center px-6 pt-20">
      {/* Glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-4xl mx-auto text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm mb-8"
        >
          <ShieldCheck className="w-4 h-4" />
          零知识加密 · 端到端保护
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-tight mb-6"
        >
          你最珍贵的一切
          <br />
          <span className="text-emerald-400">安全传递</span>给你最爱的人
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          军事级加密保险箱 · 智能遗产传承 · 只有你能打开
          <br />
          <span className="text-slate-300">连我们也看不到你的内容</span>
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <button
            onClick={onStart}
            className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold rounded-2xl text-lg transition-all hover:shadow-lg hover:shadow-emerald-500/25 flex items-center justify-center gap-2"
          >
            免费开始守护
            <ArrowRight className="w-5 h-5" />
          </button>
          <a
            href="#demo"
            className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-2xl text-lg transition-colors flex items-center justify-center gap-2"
          >
            <Eye className="w-5 h-5" />
            查看加密演示
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-16 flex justify-center"
        >
          <a href="#features" className="text-slate-500 animate-bounce">
            <ChevronDown className="w-6 h-6" />
          </a>
        </motion.div>
      </div>
    </section>
  )
}

function FeaturesSection() {
  const features = [
    { icon: Lock, title: '安全存储', desc: '密码、文件、照片、视频...AES-256军事级加密，只有你能打开', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { icon: Users, title: '智能传承', desc: '设定谁在什么时候收到什么内容。为你爱的人做好安排', color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { icon: Timer, title: '时间胶囊', desc: '给未来的自己或他人写信。在你指定的时间安全送达', color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { icon: Fingerprint, title: '零知识架构', desc: '你的数据在设备上加密后再上传。连我们的工程师也看不到', color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { icon: ShieldCheck, title: '生存验证', desc: '智能安心确认机制。多阶段渐进式，31天内不会误触发', color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
    { icon: Shield, title: '紧急传递', desc: '设置紧急联系人，在需要时安全访问你授权的内容', color: 'text-rose-400', bg: 'bg-rose-500/10' },
  ]

  return (
    <section id="features" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div {...fadeUp} className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">你的数字生活，值得最好的保护</h2>
          <p className="text-slate-400 text-lg">一个保险箱，守护一切</p>
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
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">亲眼见证加密过程</h2>
          <p className="text-slate-400 text-lg">输入任何文字，看它如何被军事级加密保护</p>
        </motion.div>

        <motion.div
          {...fadeUp}
          className="p-8 rounded-2xl bg-slate-900 border border-slate-800"
        >
          <div className="space-y-6">
            <div>
              <label className="text-sm text-slate-400 mb-2 block">输入你想加密的文字</label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={input}
                  onChange={e => { setInput(e.target.value); setEncrypted(''); setShowDecrypted(false); setChars([]); }}
                  placeholder="例如：这是我最重要的秘密..."
                  className="flex-1 px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                />
                <button
                  onClick={handleEncrypt}
                  disabled={!input.trim() || isEncrypting}
                  className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-700 disabled:text-slate-500 text-white font-medium rounded-xl transition-colors flex items-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  加密
                </button>
              </div>
            </div>

            {/* Encryption animation */}
            {chars.length > 0 && !encrypted && (
              <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
                <p className="text-xs text-slate-500 mb-2">AES-256-GCM 加密中...</p>
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
                      已加密 (AES-256-GCM)
                    </div>
                    <p className="font-mono text-sm text-emerald-300/70 break-all">{encrypted}</p>
                  </div>

                  <div className="flex items-center gap-4">
                    <button
                      onClick={handleDecrypt}
                      className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm transition-colors flex items-center gap-2"
                    >
                      {showDecrypted ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      {showDecrypted ? '隐藏明文' : '用密钥解密'}
                    </button>
                  </div>

                  {showDecrypted && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="p-4 rounded-xl bg-slate-800/50 border border-slate-700"
                    >
                      <p className="text-xs text-slate-500 mb-1">解密结果：</p>
                      <p className="text-white">{input}</p>
                    </motion.div>
                  )}

                  <p className="text-center text-slate-500 text-sm mt-4">
                    这就是 Legacy Vault 保护你数据的方式。即使是我们也看不到。
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
  const [started, setStarted] = useState(false)
  const [step, setStep] = useState(0)
  const [animDone, setAnimDone] = useState(false)
  const timeoutsRef = useRef<number[]>([])

  const steps = [
    { label: '主密码', value: 'MyP@ssw0rd!2024', icon: Key, color: 'text-amber-400', bg: 'bg-amber-500/10', desc: '你记忆的密码' },
    { label: 'Argon2id 密钥派生', value: '迭代 65536 次 + 盐值 + 内存硬化', icon: Zap, color: 'text-purple-400', bg: 'bg-purple-500/10', desc: '防暴力破解' },
    { label: '主密钥 (256位)', value: 'a7f3...9e2b (256-bit master key)', icon: Shield, color: 'text-blue-400', bg: 'bg-blue-500/10', desc: '设备上生成' },
    { label: '加密密钥 (AES-256)', value: 'HKDF 派生每个条目独立密钥', icon: Layers, color: 'text-emerald-400', bg: 'bg-emerald-500/10', desc: '每条数据独立加密' },
    { label: '密文存储', value: 'IV + 认证标签 + 密文', icon: Lock, color: 'text-cyan-400', bg: 'bg-cyan-500/10', desc: '只有你能解密' },
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
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">密钥派生过程</h2>
          <p className="text-slate-400 text-lg">从你的密码到不可破解的加密密钥，每一步都精心设计</p>
        </motion.div>

        <motion.div {...fadeUp} className="p-8 rounded-2xl bg-slate-900 border border-slate-800">
          {!started ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                <Key className="w-8 h-8 text-emerald-400" />
              </div>
              <p className="text-slate-400 mb-6">点击按钮，观看密码如何变成加密密钥</p>
              <button
                onClick={handleStart}
                className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-white font-medium rounded-xl transition-colors"
              >
                开始演示
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
                  <p className="text-emerald-400 text-sm">密钥派生完成。你的每一条数据都使用独立密钥加密。</p>
                  <button
                    onClick={handleStart}
                    className="mt-3 text-xs text-emerald-400/70 hover:text-emerald-400 transition-colors"
                  >
                    重新演示
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

    if (seconds < 1) return '不到1秒'
    if (seconds < 60) return `${Math.round(seconds)}秒`
    if (seconds < 3600) return `${Math.round(seconds / 60)}分钟`
    if (seconds < 86400) return `${Math.round(seconds / 3600)}小时`
    if (seconds < 86400 * 365) return `${Math.round(seconds / 86400)}天`
    if (seconds < 86400 * 365 * 1e3) return `${Math.round(seconds / (86400 * 365))}年`
    if (seconds < 86400 * 365 * 1e6) return `${(seconds / (86400 * 365 * 1e3)).toFixed(0)}千年`
    if (seconds < 86400 * 365 * 1e9) return `${(seconds / (86400 * 365 * 1e6)).toFixed(0)}百万年`
    if (seconds < 86400 * 365 * 1e12) return `${(seconds / (86400 * 365 * 1e9)).toFixed(0)}十亿年`
    return '超过宇宙年龄'
  }

  const bruteForceTime = pw ? calcBruteForceTime(pw) : null

  return (
    <section className="py-24 px-6 bg-slate-900/30">
      <div className="max-w-3xl mx-auto">
        <motion.div {...fadeUp} className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">暴力破解需要多久?</h2>
          <p className="text-slate-400 text-lg">输入一个密码，看看黑客需要多长时间才能破解</p>
        </motion.div>

        <motion.div {...fadeUp} className="p-8 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="space-y-6">
            <div>
              <label className="text-sm text-slate-400 mb-2 block">测试密码</label>
              <input
                type="text"
                value={pw}
                onChange={e => setPw(e.target.value)}
                placeholder="输入密码测试强度..."
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>

            {strength && (
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-400">强度</span>
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
                  <p className="text-xs text-slate-500 mb-2">暴力破解所需时间（假设每秒1万亿次猜测）</p>
                  <p className="text-3xl font-bold text-white">{bruteForceTime}</p>
                  <div className="mt-3 flex items-center justify-center gap-4 text-xs text-slate-500">
                    <span>密码长度: {pw.length}位</span>
                    <span>|</span>
                    <span>加上Argon2id: 时间x 65,536</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="p-3 rounded-lg bg-slate-800/50 text-center">
                    <p className="text-slate-500 text-xs mb-1">密码长度</p>
                    <p className="text-white font-medium">{pw.length} 个字符</p>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-800/50 text-center">
                    <p className="text-slate-500 text-xs mb-1">字符集大小</p>
                    <p className="text-white font-medium">
                      {(/[a-z]/.test(pw) ? 26 : 0) + (/[A-Z]/.test(pw) ? 26 : 0) + (/[0-9]/.test(pw) ? 10 : 0) + (/[^a-zA-Z0-9]/.test(pw) ? 33 : 0)} 种
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
  const plans = [
    {
      name: 'Free',
      price: '免费',
      period: '',
      desc: '个人基础使用',
      features: ['20条加密笔记', '10个密码存储', '1个守护人', '本地存储', '基础密码生成器'],
      cta: '免费开始',
      popular: false,
    },
    {
      name: 'Personal',
      price: '$4.99',
      period: '/月',
      desc: '个人全面保护',
      features: ['无限笔记和密码', '5个守护人', '1GB文件存储', '云端加密同步', '5个时间胶囊', '密码安全审计'],
      cta: '开始保护',
      popular: true,
    },
    {
      name: 'Family',
      price: '$9.99',
      period: '/月',
      desc: '家庭全面保护',
      features: ['Personal全部功能', '5个家庭成员', '10GB文件存储', '无限时间胶囊', '紧急访问', '法律文档模板'],
      cta: '保护家人',
      popular: false,
    },
    {
      name: 'Legacy',
      price: '$19.99',
      period: '/月',
      desc: '终极安全方案',
      features: ['Family全部功能', '无限守护人', '无限存储', '律师公证服务', '24小时优先支持', '数字遗产顾问'],
      cta: '终极保护',
      popular: false,
    },
  ]

  return (
    <section id="pricing" className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div {...fadeUp} className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">选择你的保护方案</h2>
          <p className="text-slate-400 text-lg">永远免费起步，按需升级</p>
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
                  最受欢迎
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
  const items = [
    { icon: Github, title: '开源透明', desc: '核心加密代码开源，接受社区审查' },
    { icon: ShieldCheck, title: '安全审计', desc: '第三方独立安全审计，报告公开可查' },
    { icon: Fingerprint, title: '零知识架构', desc: '我们永远看不到你的数据，即使被迫也无法交出' },
  ]

  return (
    <section id="trust" className="py-24 px-6 bg-slate-900/30">
      <div className="max-w-4xl mx-auto">
        <motion.div {...fadeUp} className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">为什么信任 Legacy Vault</h2>
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
  const [open, setOpen] = useState<number | null>(null)
  const faqs = [
    { q: '如果 Legacy Vault 公司倒闭了怎么办？', a: '你的数据始终用你自己的密码加密。我们会提前公开源码和数据导出工具，确保你永远可以访问自己的数据。本地存储的数据不受影响。' },
    { q: '你们能看到我的数据吗？', a: '不能。Legacy Vault 采用零知识架构，你的数据在你的设备上加密后再存储。我们只存储密文，即使整个数据库泄露，也无法解读任何内容。' },
    { q: '忘记密码怎么办？', a: '注册时会生成24个恢复词。用恢复词可以重置密码。但如果你同时丢失了密码和恢复词，数据将永久无法恢复——这是零知识架构的代价，也是安全的保证。' },
    { q: '遗产传承如何防止误触发？', a: '采用5阶段渐进式确认，总时长不少于31天：定期确认 -> 多渠道提醒 -> 联系提醒人 -> 紧急联系人确认 -> 冷却等待期。任何阶段你重新响应都会立即取消流程。' },
  ]

  return (
    <section className="py-24 px-6">
      <div className="max-w-3xl mx-auto">
        <motion.div {...fadeUp} className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">常见问题</h2>
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
  return (
    <section className="py-24 px-6">
      <motion.div
        {...fadeUp}
        className="max-w-4xl mx-auto text-center p-12 rounded-3xl bg-gradient-to-br from-emerald-950/50 to-slate-900/50 border border-emerald-500/20"
      >
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">现在开始，永远免费起步</h2>
        <p className="text-slate-400 text-lg mb-8">为你最珍贵的一切，建立最安全的守护</p>
        <button
          onClick={onStart}
          className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold rounded-2xl text-lg transition-all hover:shadow-lg hover:shadow-emerald-500/25 inline-flex items-center gap-2"
        >
          开始保护
          <ArrowRight className="w-5 h-5" />
        </button>
        <div className="mt-6 flex items-center justify-center gap-4 text-sm text-slate-500">
          <span className="flex items-center gap-1"><Star className="w-3 h-3" /> 无需信用卡</span>
          <span>|</span>
          <span>5分钟完成设置</span>
          <span>|</span>
          <span>免费版永不过期</span>
        </div>
      </motion.div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="border-t border-slate-800 py-8 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-slate-400">
          <Lock className="w-4 h-4 text-emerald-400" />
          <span className="text-sm">Legacy Vault</span>
          <span className="text-slate-600 text-sm">|</span>
          <span className="text-xs text-slate-500">AES-256 零知识加密</span>
        </div>
        <p className="text-xs text-slate-600">
          你的数据，你的密钥，你的控制。
        </p>
      </div>
    </footer>
  )
}

function SecurityWhitepaper({ onClose }: { onClose: () => void }) {
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
            <h3 className="text-lg font-semibold text-white">安全白皮书</h3>
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
              加密层级架构
            </h4>
            <div className="space-y-3">
              {[
                { layer: '第1层', title: '主密码 + Argon2id', desc: '你的密码经过内存硬化算法处理，防止GPU暴力破解。65,536次迭代，256MB内存需求。', color: 'border-amber-500/30 bg-amber-950/20' },
                { layer: '第2层', title: 'HKDF 密钥派生', desc: '从主密钥派生出多个子密钥，每个用途使用独立密钥。密钥之间数学独立。', color: 'border-blue-500/30 bg-blue-950/20' },
                { layer: '第3层', title: 'AES-256-GCM 加密', desc: '每条数据使用独立密钥和随机IV加密。GCM模式提供认证加密，防篡改。', color: 'border-emerald-500/30 bg-emerald-950/20' },
                { layer: '第4层', title: 'Shamir 秘密共享', desc: '主密钥可拆分为N份碎片，需要M份才能恢复。用于遗产传承的安全密钥分发。', color: 'border-purple-500/30 bg-purple-950/20' },
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
              零知识架构
            </h4>
            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
              <p className="text-sm text-slate-300 leading-relaxed mb-3">
                <strong>通俗解释：</strong>想象你把日记锁在一个保险箱里，然后把保险箱存放在银行。银行保管保险箱，但没有钥匙——只有你有钥匙。即使银行被抢劫，劫匪拿到的也只是一个打不开的铁盒子。
              </p>
              <p className="text-sm text-slate-300 leading-relaxed">
                Legacy Vault的工作方式完全一样：你的数据在你的设备上用你的密码加密后，我们才接收和存储。我们永远只看到一堆无意义的密文。即使法院传唤、政府要求，我们也无法提供你的明文数据——因为我们从来就没有过。
              </p>
            </div>
          </div>

          {/* Shamir Secret Sharing */}
          <div>
            <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-400" />
              Shamir 秘密共享
            </h4>
            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
              <p className="text-sm text-slate-300 leading-relaxed mb-3">
                <strong>通俗解释：</strong>假设你有一张藏宝图，你把它撕成5份分给5个人。但你设定的规则是"任何3个人把碎片拼在一起就能看到完整的图"，少于3个碎片则完全无法还原——不是看到一部分，而是什么都看不到。
              </p>
              <p className="text-sm text-slate-300 leading-relaxed">
                这就是Shamir秘密共享的数学魔法。Legacy Vault用它来实现遗产传承：你的加密密钥被拆分给多个守护人，只有足够数量的守护人联合才能恢复密钥，解密你的数据。
              </p>
            </div>
          </div>

          {/* Why we can't see data */}
          <div>
            <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-emerald-400" />
              为什么连我们也看不到你的数据
            </h4>
            <div className="space-y-3">
              <div className="flex gap-4 items-start">
                <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center shrink-0 text-emerald-400 text-sm font-bold">1</div>
                <div>
                  <p className="text-sm text-white">你输入密码</p>
                  <p className="text-xs text-slate-400">密码只存在于你的设备内存中，不会发送到任何服务器</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center shrink-0 text-emerald-400 text-sm font-bold">2</div>
                <div>
                  <p className="text-sm text-white">设备本地加密</p>
                  <p className="text-xs text-slate-400">你的数据在设备上用AES-256加密，变成密文</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center shrink-0 text-emerald-400 text-sm font-bold">3</div>
                <div>
                  <p className="text-sm text-white">密文上传服务器</p>
                  <p className="text-xs text-slate-400">服务器只收到密文，没有密码，没有密钥</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center shrink-0 text-emerald-400 text-sm font-bold">4</div>
                <div>
                  <p className="text-sm text-white">解密只在你的设备</p>
                  <p className="text-xs text-slate-400">下载密文后在本地解密。整个过程，服务器零参与</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/20 text-center">
            <p className="text-sm text-emerald-400">Legacy Vault: 你的数据，你的密钥，你的控制。</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
