import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Lock, ArrowRight, ArrowLeft, Check, Shield, Copy, Download, Eye, EyeOff, AlertTriangle } from 'lucide-react'
import { useStore } from '../store'
import { checkPasswordStrength, generateMnemonic } from '../utils/crypto'

export default function SetupPage() {
  const [step, setStep] = useState(0)
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [mnemonic] = useState(() => generateMnemonic())
  const [savedConfirmed, setSavedConfirmed] = useState(false)
  const [mnemonicCopied, setMnemonicCopied] = useState(false)
  const navigate = useNavigate()
  const { setupAccount, seedDemoData } = useStore()

  const strength = checkPasswordStrength(password)
  const canProceedStep1 = email.trim() && name.trim()
  const canProceedStep2 = password.length >= 8 && password === confirmPassword
  const canProceedStep3 = savedConfirmed

  const handleComplete = () => {
    setupAccount(name, btoa(password), mnemonic)
    seedDemoData()
    navigate('/dashboard')
  }

  const copyMnemonic = () => {
    navigator.clipboard.writeText(mnemonic.join(' '))
    setMnemonicCopied(true)
    setTimeout(() => setMnemonicCopied(false), 2000)
  }

  const steps = [
    { title: '基本信息', icon: '1' },
    { title: '创建主密码', icon: '2' },
    { title: '保存恢复词', icon: '3' },
    { title: '开始使用', icon: '4' },
  ]

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-xl">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <Lock className="w-6 h-6 text-emerald-400" />
            <span className="text-xl font-bold text-white">Legacy Vault</span>
          </div>
          <p className="text-slate-400 text-sm">创建你的安全保险箱</p>
        </div>

        {/* Steps indicator */}
        <div className="flex items-center justify-center gap-2 mb-10">
          {steps.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                i < step ? 'bg-emerald-500 text-white' :
                i === step ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50' :
                'bg-slate-800 text-slate-500'
              }`}>
                {i < step ? <Check className="w-4 h-4" /> : s.icon}
              </div>
              {i < steps.length - 1 && (
                <div className={`w-8 h-0.5 ${i < step ? 'bg-emerald-500' : 'bg-slate-800'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8"
          >
            {step === 0 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">欢迎来到 Legacy Vault</h2>
                  <p className="text-slate-400">我们只用邮箱发送重要通知，不会发送垃圾邮件</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-slate-300 mb-1.5 block">你的名字</label>
                    <input
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="张明"
                      className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-slate-300 mb-1.5 block">邮箱地址</label>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                  </div>
                </div>

                <button
                  disabled={!canProceedStep1}
                  onClick={() => setStep(1)}
                  className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-700 disabled:text-slate-500 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  下一步 <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">创建主密码</h2>
                  <p className="text-slate-400 text-sm">这是打开你保险箱的唯一钥匙。请选择一个你记得住但别人猜不到的密码。</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-slate-300 mb-1.5 block">主密码</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="至少8位，建议12位以上"
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

                    {/* Strength bar */}
                    {password && (
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-slate-400">密码强度</span>
                          <span style={{ color: strength.color }}>{strength.label}</span>
                        </div>
                        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${strength.score}%` }}
                            className="h-full rounded-full transition-colors"
                            style={{ backgroundColor: strength.color }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="text-sm text-slate-300 mb-1.5 block">确认密码</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="再次输入密码"
                      className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                    {confirmPassword && password !== confirmPassword && (
                      <p className="text-red-400 text-xs mt-1">密码不匹配</p>
                    )}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700">
                  <p className="text-xs text-slate-400 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
                    我们使用零知识加密，永远不会存储你的密码。即使是我们的工程师也无法看到。
                  </p>
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setStep(0)} className="px-4 py-3 bg-slate-800 text-white rounded-xl transition-colors hover:bg-slate-700">
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <button
                    disabled={!canProceedStep2}
                    onClick={() => setStep(2)}
                    className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-700 disabled:text-slate-500 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    下一步 <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">保存紧急恢复词</h2>
                  <p className="text-slate-400 text-sm">这是你唯一的备用钥匙，请像保管家门钥匙一样保管它。</p>
                </div>

                <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-500/20">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                    <p className="text-sm text-amber-200/80">
                      请务必保存这些恢复词！如果你忘记主密码，这是唯一的恢复方式。我们无法帮你重置密码。
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2 p-4 rounded-xl bg-slate-800/50 border border-slate-700">
                  {mnemonic.map((word, i) => (
                    <div key={i} className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-slate-900/50 text-sm">
                      <span className="text-slate-500 text-xs w-5 text-right">{i + 1}.</span>
                      <span className="text-white font-mono">{word}</span>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3">
                  <button onClick={copyMnemonic} className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm rounded-xl transition-colors flex items-center justify-center gap-2">
                    <Copy className="w-4 h-4" />
                    {mnemonicCopied ? '已复制' : '复制'}
                  </button>
                  <button className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm rounded-xl transition-colors flex items-center justify-center gap-2">
                    <Download className="w-4 h-4" />
                    下载PDF
                  </button>
                </div>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={savedConfirmed}
                    onChange={e => setSavedConfirmed(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded border-slate-600 text-emerald-500 focus:ring-emerald-500 bg-slate-800"
                  />
                  <span className="text-sm text-slate-300">
                    我已安全保存恢复词，并理解丢失后数据将无法恢复
                  </span>
                </label>

                <div className="flex gap-3">
                  <button onClick={() => setStep(1)} className="px-4 py-3 bg-slate-800 text-white rounded-xl transition-colors hover:bg-slate-700">
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <button
                    disabled={!canProceedStep3}
                    onClick={() => setStep(3)}
                    className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-700 disabled:text-slate-500 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    下一步 <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <div className="text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4"
                  >
                    <Shield className="w-8 h-8 text-emerald-400" />
                  </motion.div>
                  <h2 className="text-2xl font-bold text-white mb-2">保险箱已就绪</h2>
                  <p className="text-slate-400">你的数字保险箱已创建完毕。选择你的第一步：</p>
                </div>

                <div className="grid gap-3">
                  <button
                    onClick={handleComplete}
                    className="p-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-left transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                        <Lock className="w-5 h-5 text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-white font-medium">进入保险箱</p>
                        <p className="text-slate-400 text-sm">查看示例数据，探索所有功能</p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-slate-400 ml-auto group-hover:text-emerald-400 transition-colors" />
                    </div>
                  </button>
                </div>

                <p className="text-center text-xs text-slate-500">
                  已加载演示数据，帮助你快速了解功能
                </p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
