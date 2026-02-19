# Neuro-Dashboard — 智能视觉 Pipeline 管理平台

## Role
你是 BAT/硅谷大厂级别的全栈架构师，负责从零搭建一个生产级管理平台。

## Background

Neuro-Pipeline 是一个异构 AI 推理系统：
- **Edge 端**：RK3588 (ARM64, C++17) — V4L2 摄像头 → NPU 推理 → gRPC 上报
- **Central 端**：Mac Mini Apple Silicon (Python) — gRPC 接收 → MLX LLM/VLM 语义分析 → SQLite 持久化
- **通信**：gRPC + Protobuf，可选 mTLS

本仓库是 Neuro-Pipeline 的管理平台前端，纯粹作为 API 消费者，零侵入 pipeline 代码。

### Proto 契约同步
`proto/neuro_pipeline.proto` 从 neuro-pipeline 仓库复制而来。
同步方式：`bash scripts/sync-proto.sh`（从 ../repo/proto/ 复制）

## 现有 API 面（本 dashboard 需要消费的）

### gRPC API (port 50051)
| RPC | 类型 | 用途 |
|-----|------|------|
| StreamDetectionResults | Client Streaming | Edge 推送检测帧流 |
| SendControlCommand | Unary | 下发控制命令 (SET_FPS, CHANGE_MODEL, RELOAD_MODEL, SHUTDOWN 等) |
| BidirectionalEventStream | Bidirectional | 双向事件流 |
| HealthCheck | Unary | 健康检查 + 版本 |
| RegisterDevice | Unary | 设备注册 (device_id, capabilities) |

### REST API (port 8000)
| 端点 | 用途 |
|------|------|
| GET /api/status | 系统状态 (edge FPS/NPU/温度, central 模型/uptime) |
| GET /api/events?limit=N&device_id=X | 最近事件 |
| GET /api/events/history?hours=N | SQLite 历史查询 |
| GET /api/devices | 已注册设备列表 |
| GET /api/devices/{id}/events | 单设备事件 |
| WS /ws | WebSocket 实时事件推送 |

### Prometheus Metrics (port 9090)
- `np_detections_total` — 检测计数 (by class_name)
- `np_vlm_requests_total` — VLM 请求 (by status)
- `np_grpc_requests_total` — gRPC 请求 (by method)
- `np_vlm_latency_seconds` — VLM 推理延迟
- `np_grpc_latency_seconds` — gRPC 延迟
- `np_vlm_queue_depth` — VLM 队列深度
- `np_edge_connections` — 活跃连接数
- `np_edge_fps` — 各设备 FPS (by device_id)
- `np_edge_device_status` — 设备在线状态 (by device_id)
- `np_edge_inference_latency_avg_ms` — 推理延迟 (by device_id)

### Protobuf 关键消息
- DetectionResult: frame_id, device_id, boxes[], frame_data(JPEG), metrics
- BoundingBox: class_id, class_name, confidence, x/y_min/max (归一化 0-1)
- DeviceMetrics: cpu_usage, npu_usage, memory_used_mb, temperature_c, fps
- ControlCommand: type(enum), parameters(map), command_id
- EdgeEvent: type(DETECTION_ALERT/SYSTEM_ERROR/MODEL_LOADED/HEALTH_UPDATE)

### 配置结构 (pipeline config.yaml 关键字段)
- edge: device_id, video_source, model_path, fps, confidence_threshold, send_frame_data(bool), jpeg_quality(1-100)
- central: port, model_path, inference_mode(llm/vlm)
- tls: enabled, ca_cert, server_cert, server_key
- sessions: max_devices(16), heartbeat_interval, expiry_timeout
- alerting: webhook routes by severity (critical/warning/info)
- circuit_breaker: failure_threshold, recovery_timeout
- rate_limiting: max_rps, burst (per-device token bucket)

## 需求

### 前台（客户/运营人员）
1. **实时监控大屏** — 设备地图/拓扑、实时检测流、关键 KPI 卡片
2. **事件中心** — 检测事件时间线、按设备/类别/置信度筛选、图片预览
3. **告警管理** — 告警列表、确认/静默、严重级别过滤
4. **报表** — 日/周/月检测统计、设备在线率、推理性能趋势

### 后台（开发工程师/管理员）
1. **设备管理** — 设备列表 CRUD、在线状态、固件版本、远程控制命令下发
2. **模型管理** — 模型列表、一键热加载 (RELOAD_MODEL)、A/B 测试
3. **服务管理** — Central/Edge 启停、配置热更新、日志查看
4. **系统配置** — config.yaml 可视化编辑、TLS 证书管理、限流/熔断参数调整
5. **用户管理** — RBAC (admin/operator/viewer)、JWT 认证
6. **可观测性** — Prometheus 指标图表 (Grafana 风格)、gRPC 调用链、VLM 队列监控

## 技术栈

- 前端：React/Next.js + TypeScript + TailwindCSS + shadcn/ui
- 状态管理：Zustand 或 TanStack Query
- 实时：WebSocket (已有 /ws 端点) + Server-Sent Events
- 图表：Recharts 或 ECharts (Prometheus 数据可视化)
- gRPC-Web：通过 Envoy 或 grpc-web proxy 消费 gRPC API
- BFF 层（可选）：轻量 Node.js/Python 中间层聚合 REST + gRPC
- 认证：JWT + refresh token
- 部署：Docker Compose (dev) / Kubernetes (prod)
- Proto 共享：从 neuro-pipeline 仓库复制 + sync 脚本

## 项目结构

```
neuro-dashboard/
├── CLAUDE.md              # 本文件
├── proto/                 # Protobuf 契约 (从 neuro-pipeline 同步)
│   └── neuro_pipeline.proto
├── scripts/               # 工具脚本
│   └── sync-proto.sh      # Proto 同步脚本
├── packages/
│   ├── web/               # Next.js 前端
│   │   ├── src/
│   │   │   ├── app/       # App Router (Next.js 14+)
│   │   │   │   ├── (portal)/    # 前台路由组
│   │   │   │   │   ├── monitor/ # 实时监控大屏
│   │   │   │   │   ├── events/  # 事件中心
│   │   │   │   │   ├── alerts/  # 告警管理
│   │   │   │   │   └── reports/ # 报表
│   │   │   │   └── (admin)/     # 后台路由组
│   │   │   │       ├── devices/ # 设备管理
│   │   │   │       ├── models/  # 模型管理
│   │   │   │       ├── config/  # 系统配置
│   │   │   │       └── users/   # 用户管理
│   │   │   ├── components/      # 共享组件
│   │   │   ├── hooks/           # 自定义 hooks (WebSocket, auth, etc.)
│   │   │   ├── lib/             # 工具函数、API client
│   │   │   ├── stores/          # Zustand stores
│   │   │   └── generated/       # Proto 生成的 TS 类型
│   │   ├── public/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── tailwind.config.ts
│   │   └── next.config.ts
│   └── api/               # BFF 层 (可选)
│       ├── src/
│       └── package.json
├── docker-compose.yml     # 开发环境
├── .gitignore
└── package.json           # Monorepo root (pnpm workspace)
```

## 路由结构

### 前台 (portal)
- `/` — 重定向到 /monitor
- `/monitor` — 实时监控大屏
- `/events` — 事件中心
- `/alerts` — 告警管理
- `/reports` — 报表统计

### 后台 (admin)
- `/admin` — 重定向到 /admin/devices
- `/admin/devices` — 设备管理
- `/admin/models` — 模型管理
- `/admin/config` — 系统配置
- `/admin/users` — 用户管理
- `/admin/observability` — 可观测性面板

## 关键设计原则
- API-first：所有数据来自 Neuro-Pipeline 的 gRPC/REST/Prometheus API，不直接访问 SQLite
- 实时优先：WebSocket 驱动的事件流，非轮询
- 渐进增强：先 SSR 保证首屏，再 hydrate 交互
- 可观测性内建：前端也要有 error boundary + performance metrics
- 移动适配：响应式设计，运营人员可能用平板巡检

## Build & Dev

```bash
# 安装依赖
pnpm install

# 开发
pnpm --filter web dev

# Proto 同步
bash scripts/sync-proto.sh

# 构建
pnpm --filter web build

# Docker
docker compose up
```
