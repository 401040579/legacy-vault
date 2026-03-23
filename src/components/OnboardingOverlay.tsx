import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { KeyRound, Users, Timer, ArrowRight, X, Shield } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store'

const steps = [
  {
    title: '欢迎来到 Legacy Vault',
    desc: '你的军事级加密保险箱已就绪。让我们用3步快速了解核心功能。',
    icon: Shield,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    highlight: null,
    action: null,
  },
  {
    title: '试试添加你的第一条密码',
    desc: '密码管理器支持自动生成强密码、泄露检测、分类管理。所有密码都使用AES-256加密存储。',
    icon: KeyRound,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    highlight: '/passwords',
    action: '前往密码管理',
  },
  {
    title: '设置你的第一个守护人',
    desc: '守护人是你信任的人。你可以决定每位守护人能看到哪些内容，以及在什么条件下传递给他们。',
    icon: Users,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    highlight: '/inheritance',
    action: '前往传承计划',
  },
  {
    title: '写你的第一个时间胶囊',
    desc: '给未来的自己或你爱的人写一封信。它会在你指定的时间安全送达。加密保存，只有到了时间才能打开。',
    icon: Timer,
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    highlight: '/capsules',
    action: '前往时间胶囊',
  },
]

export default function OnboardingOverlay() {
  const [step, setStep] = useState(0)
  const navigate = useNavigate()
  const { setOnboardingComplete } = useStore()

  const handleSkip = () => {
    setOnboardingComplete(true)
  }

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1)
    } else {
      setOnboardingComplete(true)
    }
  }

  const handleAction = () => {
    const s = steps[step]
    if (s.highlight) {
      navigate(s.highlight)
    }
    setOnboardingComplete(true)
  }

  const current = steps[step]

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
      >
        <motion.div
          key={step}
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden"
        >
          {/* Progress */}
          <div className="px-6 pt-4 flex items-center justify-between">
            <div className="flex gap-1.5">
              {steps.map((_, i) => (
                <div
                  key={i}
                  className={`h-1 rounded-full transition-all ${
                    i <= step ? 'bg-emerald-500 w-6' : 'bg-slate-700 w-3'
                  }`}
                />
              ))}
            </div>
            <button onClick={handleSkip} className="text-slate-500 hover:text-white transition-colors text-xs flex items-center gap-1">
              跳过 <X className="w-3 h-3" />
            </button>
          </div>

          {/* Content */}
          <div className="p-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.1 }}
              className={`w-16 h-16 rounded-2xl ${current.bg} flex items-center justify-center mx-auto mb-5`}
            >
              <current.icon className={`w-8 h-8 ${current.color}`} />
            </motion.div>

            <h3 className="text-xl font-bold text-white mb-3">{current.title}</h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">{current.desc}</p>

            <div className="flex flex-col gap-3">
              {current.action && (
                <button
                  onClick={handleAction}
                  className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  {current.action}
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={handleNext}
                className={`w-full py-3 ${current.action ? 'bg-slate-800 hover:bg-slate-700' : 'bg-emerald-500 hover:bg-emerald-400'} text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2`}
              >
                {step < steps.length - 1 ? (
                  <>下一步 <ArrowRight className="w-4 h-4" /></>
                ) : (
                  '开始使用'
                )}
              </button>
            </div>
          </div>

          {/* Step counter */}
          <div className="px-6 pb-4 text-center">
            <p className="text-xs text-slate-600">{step + 1} / {steps.length}</p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
