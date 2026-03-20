# Legacy Vault - 开发规范

## 项目概述
军事级加密数字保险箱，支持安全存储和智能遗产传承。

## 技术栈
- 前端：React + TypeScript + Vite
- 跨平台：React Native (移动) + Tauri (桌面)
- 加密：Web Crypto API + libsodium
- 本地数据：SQLCipher (加密SQLite)
- 认证：WebAuthn / FIDO2
- 后端：Rust (安全关键) + Node.js (业务逻辑)
- 部署：GitHub Pages (PWA) → 自托管 (安全考虑)

## 开发规范
- 使用 TypeScript strict mode
- **安全第一**：所有数据操作必须经过加密层
- **零知识**：服务端永远不接触明文数据
- 密码学代码必须有单元测试
- 组件使用函数式组件 + Hooks
- 状态管理：Zustand
- 样式：Tailwind CSS
- 测试：Vitest + React Testing Library
- 提交信息：Conventional Commits (中文描述)

## 目录结构
```
src/
  crypto/        # 加密引擎
  vault/         # 保险箱核心
  inheritance/   # 继承系统
  auth/          # 认证系统
  passwords/     # 密码管理
  timecapsule/   # 时间胶囊
  ui/            # 界面组件
  utils/         # 工具函数
docs/            # 文档
public/          # 静态资源
```
