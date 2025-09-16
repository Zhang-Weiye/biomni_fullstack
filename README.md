## 项目概览

本仓库包含 Biomni 生物信息学智能体后端与基于 LangGraph 的聊天前端（agent-chat-ui）。你可以使用统一的开发环境快速启动与调试，进行数据分析与可视化。

- 后端：`Biomni/`（LangGraph 工作流，工具集与数据湖）
- 前端：`agent-chat-ui/`（Next.js，基于 LangGraph SDK 的会话界面）

参考上游项目：
- Biomni（后端参考）：[https://github.com/snap-stanford/Biomni](https://github.com/snap-stanford/Biomni)
- agent-chat-ui（前端参考）：[https://github.com/langchain-ai/agent-chat-ui](https://github.com/langchain-ai/agent-chat-ui)

---

## 先决条件

- 操作系统：macOS / Linux（Windows 需 WSL）
- 包管理：Conda，Node.js（≥ 18），pnpm（≥ 9）
- Python：3.11（由环境脚本自动配置）

---

## 快速开始

1) 安装前端依赖

```bash
cd agent-chat-ui
pnpm install
```

2) 初始化后端环境（时间较长）

```bash
cd ../Biomni/biomni_env
bash setup.sh
```

3) 激活后端环境并安装工具

```bash
conda activate biomni_e1
cd ../
pip install -U "langgraph-cli[inmem]"
```

4) 启动后端（LangGraph 开发模式）

```bash
cd Biomni
langgraph dev
```

5) 启动前端

```bash
cd ../agent-chat-ui
pnpm dev
```

6) 打开浏览器访问 `http://localhost:3000`

---

## 详细说明

### 1. 配置与环境

请分别在前端与后端目录中准备 `.env` 文件：

1) 前端（agent-chat-ui）

```bash
cd agent-chat-ui
cp .env.example .env
```

需要配置的参数：LANGSMITH_API_KEY

2) 后端（Biomni）

```bash
cd Biomni
cp .env.example .env
```

需要配置的参数:LANGSMITH_API_KEY, CUSTOM_MODEL_NAME, CUSTOM_MODEL_BASE_URL, CUSTOM_MODEL_API_KEY

其他说明：
- matplotlib绘图：已在 `biomni/setup_matplotlib.py` 配置 Matplotlib 的无头后端，工作流启动时自动应用。
- 图片输出：所有由 Matplotlib 生成的图片会被自动保存至 `./saved_pictures`，避免零散目录。

### 2. 数据准备

为避免在 `langgraph dev` 启动过程中并发下载导致报错，建议先在 notebook 中单独拉取数据：

```bash
cd Biomni/biomni/tutorials
open biomni_101.ipynb   # 或使用 VSCode/Jupyter 打开
```

在 `biomni_101.ipynb` 中运行第一个单元格（已包含数据检查/下载逻辑），这会将必要数据下载到默认目录 `./data/biomni_data/`。

说明：
- 默认数据目录：`./data/biomni_data/`，A1 也会在首次启动时检查并按需下载（若你已通过 notebook 预下载，则启动更快更稳）。
- 如需添加自定义数据，可在运行时通过 A1 的 `add_data({"/abs/path/to/file": "Please use it if needed"})` 注入到数据湖索引（不会复制文件）。

### 3. 运行后端

```bash
conda activate biomni_e1
cd Biomni
langgraph dev
```

启动后控制台将显示 LangGraph 服务信息。若使用自定义模型服务，请确保 `.env` 中的地址与密钥有效。

### 4. 运行前端

```bash
cd agent-chat-ui
pnpm dev
```



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