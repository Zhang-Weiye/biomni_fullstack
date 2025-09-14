# 激活conda环境
if [ -f "$HOME/miniconda3/etc/profile.d/conda.sh" ]; then
    source "$HOME/miniconda3/etc/profile.d/conda.sh"
elif [ -f "$HOME/anaconda3/etc/profile.d/conda.sh" ]; then
    source "$HOME/anaconda3/etc/profile.d/conda.sh"
else
    echo "conda.sh not found!"
    exit 1
fi
conda activate biomni_e1

cd ./Biomni

# 启动langgraph开发服务
langgraph dev &

cd ../agent-chat-ui

# 启动前端服务
pnpm dev &

# 等待服务启动
sleep 5

# 自动检测端口并打开浏览器
for port in {3000..3010}; do
    if lsof -iTCP:$port -sTCP:LISTEN -t >/dev/null; then
        open "http://localhost:$port"
        break
    fi
done