## 项目概览

本仓库包含 Biomni 生物信息学智能体后端与基于 LangGraph 的聊天前端（agent-chat-ui）。你可以使用统一的开发环境快速启动与调试，进行数据分析与可视化。

- 后端：`Biomni/`（LangGraph 工作流，工具集与数据湖）
- 前端：`agent-chat-ui/`（Next.js，基于 LangGraph SDK 的会话界面）

参考上游项目：
- Biomni（后端参考）：[https://github.com/snap-stanford/Biomni](https://github.com/snap-stanford/Biomni)
- agent-chat-ui（前端参考）：[https://github.com/langchain-ai/agent-chat-ui](https://github.com/langchain-ai/agent-chat-ui)

---

## 环境准备

- 操作系统：macOS / Linux（Windows 需 WSL）
- 包管理：Conda，Node.js（≥ 18），pnpm（≥ 9）
- Python：3.11（由环境脚本自动配置）

---

## 安装与使用教程（完整）

### 1) 安装依赖

- 前端：
```bash
cd agent-chat-ui
pnpm install
```

- 后端（初始化 Conda 环境，时间较长）：
```bash
cd ../Biomni/biomni_env
bash setup.sh
```

### 2) 环境与配置（.env）

请分别在前端与后端目录中复制示例环境文件，并按需填写：

- 前端（agent-chat-ui）：
```bash
cd agent-chat-ui
cp .env.example .env
```
必填/常用参数：
- `LANGSMITH_API_KEY`（如使用 LangSmith 日志/监控）

- 后端（Biomni）：
```bash
cd Biomni
cp .env.example .env
```
必填/常用参数：
- `LANGSMITH_API_KEY`（可选）
- `CUSTOM_MODEL_NAME`（例如 `claude-sonnet-4-20250514` 或自定义别名）
- `CUSTOM_MODEL_BASE_URL`（如 `https://your.model.host/v1`）
- `CUSTOM_MODEL_API_KEY`

说明：
- matplotlib 绘图：已在 `biomni/setup_matplotlib.py` 配置无头后端，工作流启动时自动生效。
- 图片输出：Matplotlib 生成图片统一保存到 `./saved_pictures`。

### 3) 数据准备（推荐先于后端启动执行）

为避免在 `langgraph dev` 启动时并发下载导致报错，建议先在 notebook 中独立拉取数据：
```bash
cd Biomni/biomni/tutorials
open biomni_101.ipynb   # 或用 VSCode/Jupyter 打开
```
运行第一个单元格（包含数据检查/下载逻辑），将必要数据下载到 `./data/biomni_data/`。

补充：
- 默认数据目录：`./data/biomni_data/`；若已预下载，后端启动更快更稳。
- 自定义数据：运行时可通过 A1 的 `add_data({"/abs/path/to/file": "Please use it if needed"})` 注入数据湖索引（不复制文件）。

### 4) 激活后端环境并安装工具

```bash
conda activate biomni_e1
cd Biomni
pip install -U "langgraph-cli[inmem]"
```

### 5) 启动后端（LangGraph 开发模式）

```bash
langgraph dev
```
控制台将显示 LangGraph 服务信息。若使用自定义模型服务，请确认 `.env` 的 Base URL 与 API Key 有效。

### 6) 启动前端

```bash
cd ../agent-chat-ui
pnpm dev
```
打开浏览器访问 `http://localhost:3000`。



## 常见问题（Troubleshooting）

1) 后端递归上限错误（GraphRecursionError）
- 原因：工作流没有及时命中结束条件。
- 修复：确保使用 `Biomni/biomni/workflow.py` 中的默认 `workflow = agent_claude.app`，不要引入不完整的自定义图；必要时提升 `recursion_limit`。

2) 图片保存到多余目录
- 说明：已在 A1 内部统一重定向 Matplotlib 的 `savefig`，最终图片都会落在 `./saved_pictures`。
- 如仍有旧目录（如 `visualizations/`），可手动清理历史产物。

3) 前端代码字体不一致
- 已将代码块字体优先设置为 `Consolas`，若系统未安装将回退到常见等宽字体。


## 免责声明

- 本项目用于科研与内部测试，可能涉及第三方接口与模型服务，请遵守对应的服务条款与合规要求。
- 运行过程中产生的大体量下载与缓存，请确保磁盘配额（至少30G）与网络（可能需要科学上网）允许。