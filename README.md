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
│   │   │   ├── create/                  # 创建绘本流程 (3步)
│   │   │   └── brushing/                # 沉浸式刷牙页面
│   │   ├── api/
│   │   │   └── backend.ts               # 后端 API 集成
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
| **首页** | 新用户/老用户状态切换，视频自动播放 | ✅ |
| **创建绘本** | 3步流程 (照片信息→主题选择→预览确认) | ✅ |
| **刷牙页面** | 2分钟计时，每30秒切换区域 | ✅ |
| **AI接口** | 角色生成 + 故事生成 (API预留) | ✅ |
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
cp .env.example .env  # 配置 API Key
npm run dev
```

---

## 🎨 UI设计

- **容器尺寸**: 390×844px (移动端标准)
- **设计资源**: PNG + CSS (不使用SVG)
- **首页**: 3张背景图轮播 + 视频自动播放
- **创建页**: 分步骤表单 + 预览功能

---

## 💳 支付接口 (已预留)

### PayPal
- `POST /api/payments/paypal/create` - 创建支付
- `POST /api/payments/paypal/execute` - 执行支付

### Apple IAP
- `POST /api/payments/apple-iap/verify` - 验证收据

> 注：支付接口已预留，等待后续实现

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
- Vercel / Netlify (前端)
- AWS (后端)

---

## 第一个开发账号

wotlos@moddv.com
