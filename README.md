<p align="center">
  <img src="https://img.shields.io/badge/Next.js-15-black?logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19-61dafb?logo=react" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5.7-3178c6?logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-06b6d4?logo=tailwindcss" alt="Tailwind" />
  <img src="https://img.shields.io/badge/License-MIT-green" alt="License" />
</p>

# Neuro Dashboard

> [Neuro-Pipeline](https://github.com/teslavia/Neuro-Pipeline) 异构 AI 推理系统的管理平台前端

Neuro-Pipeline 是一套 **Edge (RK3588) + Central (Apple Silicon)** 的视觉推理系统。本仓库是它的管理平台 —— 纯粹作为 API 消费者，零侵入 pipeline 代码。

---

## 系统架构

```
┌─────────────────────────────────────────────────────────────────┐
│                        Neuro Dashboard                          │
│                     (本仓库 · Next.js 15)                        │
└──────────┬──────────────┬──────────────┬────────────────────────┘
           │ REST :8000   │ WebSocket    │ Prometheus :9090
           ▼              ▼              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Neuro-Pipeline Central                        │
│              Mac Mini · Python · MLX LLM/VLM                     │
│              gRPC Server · REST API · SQLite                     │
└──────────────────────────┬──────────────────────────────────────┘
                           │ gRPC + Protobuf (可选 mTLS)
           ┌───────────────┼───────────────┐
           ▼               ▼               ▼
     ┌──────────┐   ┌──────────┐   ┌──────────┐
     │ RK3588   │   │ RK3588   │   │ RK3588   │
     │ Edge #1  │   │ Edge #2  │   │ Edge #N  │
     │ V4L2→NPU │   │ V4L2→NPU │   │ V4L2→NPU │
     └──────────┘   └──────────┘   └──────────┘
```

## 功能概览

### 🖥 前台 (Portal)

| 页面 | 路由 | 说明 |
|------|------|------|
| 实时监控大屏 | `/monitor` | KPI 卡片 · 设备网格 · 实时事件流 · FPS 趋势图 |
| 事件中心 | `/events` | 按设备/级别/类型筛选 · 事件时间线 |
| 告警管理 | `/alerts` | 严重/警告/信息统计 · 确认/静默操作 |
| 报表统计 | `/reports` | 检测趋势 · 设备在线率 · 推理延迟 · 告警分布 |

### ⚙️ 后台 (Admin)

| 页面 | 路由 | 说明 |
|------|------|------|
| 设备管理 | `/admin/devices` | 设备表格 · 状态监控 · 远程控制 (重载模型/关机) |
| 模型管理 | `/admin/models` | 模型列表 · 热加载 · A/B 测试 |
| 系统配置 | `/admin/config` | config.yaml 可视化编辑 · TLS · 限流/熔断 |
| 用户管理 | `/admin/users` | RBAC 角色 · JWT 认证 |
| 可观测性 | `/admin/observability` | gRPC 请求量 · VLM 延迟 · 队列深度 · 连接数 |

## 技术栈

| 层 | 技术 |
|----|------|
| 框架 | Next.js 15 (App Router) · React 19 · TypeScript 5.7 |
| 样式 | Tailwind CSS 4 · shadcn/ui · Radix UI |
| 状态 | Zustand 5 |
| 图表 | Recharts 2.15 |
| 实时 | WebSocket (自动重连 + 指数退避) |
| 指标 | Prometheus `query_range` API |
| 通信契约 | Protobuf (从 Neuro-Pipeline 同步) |

## 快速开始

### 环境要求

- Node.js ≥ 18
- pnpm ≥ 9

### 安装 & 启动

```bash
# 克隆
git clone https://github.com/teslavia/neuro-dashboard.git
cd neuro-dashboard

# 安装依赖
pnpm install

# 使用 Mock 数据启动开发服务器 (无需后端)
NEXT_PUBLIC_USE_MOCK=true pnpm --filter web dev
```

浏览器打开 `http://localhost:3000` 即可看到完整界面。

### 连接真实后端

```bash
# 确保 Neuro-Pipeline Central 已启动
# 默认端口: REST :8000 / WebSocket :8000/ws / Prometheus :9090

pnpm --filter web dev
```

### 环境变量

在 `packages/web/.env.local` 中配置：

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000/ws
NEXT_PUBLIC_PROMETHEUS_URL=http://localhost:9090
NEXT_PUBLIC_USE_MOCK=true
```

### 构建

```bash
pnpm --filter web build
pnpm --filter web start
```

### Proto 同步

从主项目同步 Protobuf 契约：

```bash
bash scripts/sync-proto.sh
```

## 项目结构

```
neuro-dashboard/
├── packages/
│   └── web/                    # Next.js 前端
│       └── src/
│           ├── app/
│           │   ├── (portal)/   # 前台路由 (monitor/events/alerts/reports)
│           │   └── admin/      # 后台路由 (devices/models/config/users/observability)
│           ├── components/     # 共享组件 (nav, sidebar, badges, kpi-card, ui/)
│           ├── hooks/          # WebSocket · API Query · Prometheus
│           ├── stores/         # Zustand (auth, device, event)
│           └── lib/            # API client · types · mock data · constants
├── proto/                      # Protobuf 契约 (从 Neuro-Pipeline 同步)
├── scripts/                    # 工具脚本
└── CLAUDE.md                   # AI 开发指令
```

## 消费的 API

本 Dashboard 消费 Neuro-Pipeline 暴露的三类 API：

| 协议 | 端口 | 用途 |
|------|------|------|
| REST | `:8000` | 系统状态 · 设备列表 · 事件查询 · 控制命令 |
| WebSocket | `:8000/ws` | 实时事件推送 |
| Prometheus | `:9090` | 检测计数 · 推理延迟 · 队列深度 · 连接数 |
| gRPC | `:50051` | 设备注册 · 检测流 · 双向事件 · 健康检查 |

## 设计原则

- **API-first** — 所有数据来自 Pipeline 的 API，不直接访问 SQLite
- **实时优先** — WebSocket 驱动事件流，非轮询
- **渐进增强** — SSR 保证首屏，hydrate 后交互
- **可观测性内建** — Error Boundary + Performance Metrics
- **移动适配** — 响应式设计，支持平板巡检场景

## 相关项目

| 项目 | 说明 |
|------|------|
| [Neuro-Pipeline](https://github.com/teslavia/Neuro-Pipeline) | 主项目 — Edge + Central 异构 AI 推理系统 |
| neuro-dashboard (本仓库) | 管理平台前端 |

## License

MIT

</content>
</invoke>