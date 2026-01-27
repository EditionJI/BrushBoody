# 🦷 BrushBuddy - 儿童AI刷牙绘本H5

> 为美国市场开发的儿童刷牙AI绘本应用

---

## 🌐 访问地址

### 前端 (H5)
```
本地: http://localhost:5173/
局域网: http://192.168.29.225:5173/
局域网: http://10.1.14.175:5173/
```

### 后端 (API)
```
本地: http://localhost:3000/
局域网: http://192.168.29.225:3000/
局域网: http://10.1.14.175:3000/
```

---

## 📁 项目结构

```
brushbuddy-h5/
├── frontend/                 # Vue3 前端
│   ├── src/
│   │   ├── pages/
│   │   │   ├── home/                    # 首页 (新/老用户状态)
│   │   │   ├── create-story/            # 创建绘本流程 (5步)
│   │   │   └── brushing/                # 沉浸式刷牙页面
│   │   ├── api/
│   │   │   └── gemini.ts                # Gemini API 集成
│   │   └── router/
│   └── package.json
│
└── backend/                  # Node.js 后端
    ├── src/
    │   └── server.js                      # Express 服务器
    ├── .env.example                       # 环境变量模板
    └── package.json
```

---

## ✅ 已实现功能

| 模块 | 功能 | 状态 |
|------|------|------|
| **首页** | 新用户/老用户状态切换 | ✅ |
| **创建绘本** | 5步流程 (角色→照片→信息→预览→隐私) | ✅ |
| **刷牙页面** | 2分钟计时，每30秒切换区域 | ✅ |
| **Gemini AI** | 角色生成 + 故事生成 | ✅ (需API Key) |
| **支付接口** | PayPal + Apple IAP 预留 | ✅ |

---

## 🚀 快速开始

### 前端
```bash
cd frontend
npm install
npm run dev
```

### 后端
```bash
cd backend
npm install
cp .env.example .env  # 配置 Gemini API Key
npm run dev
```

---

## 🔑 配置 Gemini API

1. 访问 [Google AI Studio](https://makersuite.google.com/app/apikey) 获取 API Key
2. 在 `backend/.env` 中配置:
   ```
   GEMINI_API_KEY=你的API密钥
   ```
3. 重启后端服务器

---

## 💳 支付接口 (已预留)

### PayPal
- `POST /api/payments/paypal/create` - 创建支付
- `POST /api/payments/paypal/execute` - 执行支付

### Apple IAP
- `POST /api/payments/apple-iap/verify` - 验证收据

> 注：支付接口已预留，等待后续实现

---

## 📱 页面对应关系 (严格按照PRD)

| PRD章节 | 页面 | 文件 |
|---------|------|------|
| 3.2 | 首页 | `pages/home/HomeView.vue` |
| 3.3 | 创建绘本流程 | `pages/create-story/CreateStoryView.vue` |
| 3.5 | 沉浸式刷牙页面 | `pages/brushing/BrushingView.vue` |

---

## 🎨 UI规范

- **背景色**: `#FFF9F0` → `#FFF5E6` (渐变)
- **主色调**: `#FF6B6B` (珊瑚红)
- **字体**: Comic Sans MS / Chalkboard SE
- **圆角**: 16-24px

---

## 📝 后续开发

- [ ] 引导页 (9页)
- [ ] 绘本广场
- [ ] 父母看板 (数据统计)
- [ ] 付费引导页UI
- [ ] PayPal支付集成
- [ ] Apple IAP集成
- [ ] AWS部署配置

---

## 🛠 技术栈

**前端**
- Vue 3 + TypeScript
- Vite
- Vue Router
- Pinia

**后端**
- Node.js + Express
- Google Gemini AI
- CORS支持

**部署目标**
- AWS (CloudFront + S3 + ECS)

## 第一个开发 账号是  wotlos@moddv.com