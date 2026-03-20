import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Lock, Shield, Users, Timer, Eye, EyeOff, Check, Github,
  ShieldCheck, Fingerprint, ArrowRight, ChevronDown, Star
} from 'lucide-react'
import { simulateEncrypt } from '../utils/crypto'

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 },
}

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-slate-950 overflow-x-hidden">
      <Header onStart={() => navigate('/setup')} />
      <HeroSection onStart={() => navigate('/setup')} />
      <FeaturesSection />
      <EncryptDemo />
      <PricingSection />
      <TrustSection />
      <FAQSection />
      <CTASection onStart={() => navigate('/setup')} />
      <Footer />
    </div>
  )
}

function Header({ onStart }: { onStart: () => void }) {
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
          <a href="#trust" className="hover:text-white transition">安全</a>
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
