# Setup matplotlib for headless operation before any imports
import os
from biomni.setup_matplotlib import setup_matplotlib
setup_matplotlib()

from biomni.agent.a1 import A1
from biomni.agent.react import react
from langgraph.graph import StateGraph, END, START
from typing import TypedDict, Annotated, Sequence
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage
from langgraph.graph.message import add_messages



class AgentState(TypedDict):
    messages: Annotated[Sequence[BaseMessage], add_messages]
    uploaded_files: list[str]  # 存储上传的文件路径


def handle_file_upload(state: AgentState) -> AgentState:
    """
    处理文件上传的节点
    """
    # 检查消息中是否包含文件上传信息
    last_message = state["messages"][-1] if state["messages"] else None
    
    if isinstance(last_message, HumanMessage):
        content = last_message.content
        if isinstance(content, str) and "UPLOADED_FILE:" in content:
            # 解析文件路径
            lines = content.split('\n')
            file_paths = []
            for line in lines:
                if line.startswith("UPLOADED_FILE:"):
                    file_path = line.replace("UPLOADED_FILE:", "").strip()
                    file_paths.append(file_path)
            
            for file_path in file_paths:
            # 将文件添加到 agent 的数据湖
                try:
                    agent_claude.add_data({file_path: "Please use it if needed"})
                except Exception as e:
                    print(f"Error adding file {file_path} to data lake: {e}")
            
            # 更新状态
            state["uploaded_files"] = file_paths
            
            # 从消息内容中移除文件上传信息，只保留用户的实际问题
            clean_content = '\n'.join([line for line in lines if not line.startswith("UPLOADED_FILE:")])
            if clean_content.strip():
                # 创建新的消息，不包含文件上传信息
                new_message = HumanMessage(content=clean_content.strip())
                state["messages"] = state["messages"][:-1] + [new_message]
    
    return state


# 创建 agent 实例
try:
    from dotenv import load_dotenv
    dotenv_path = os.path.join(os.path.dirname(__file__), "../../.env")
    if os.path.exists(dotenv_path):
        load_dotenv(dotenv_path, override=False)
except Exception:
    pass

CUSTOM_MODEL_NAME = os.getenv("CUSTOM_MODEL_NAME")
CUSTOM_MODEL_BASE_URL = os.getenv("CUSTOM_MODEL_BASE_URL")
CUSTOM_MODEL_API_KEY = os.getenv("CUSTOM_MODEL_API_KEY")
print(CUSTOM_MODEL_NAME,"\n", CUSTOM_MODEL_BASE_URL,"\n",CUSTOM_MODEL_API_KEY)


agent_claude = A1(
    path="./data",
    llm=CUSTOM_MODEL_NAME,
    source="Custom",
    base_url=CUSTOM_MODEL_BASE_URL,
    api_key=CUSTOM_MODEL_API_KEY,
    verify_ssl=False,
)


def create_custom_workflow():

    original_workflow = agent_claude.app
    

    workflow = StateGraph(AgentState)
    
    workflow.add_node("handle_file_upload", handle_file_upload)
    workflow.add_edge(START, "handle_file_upload")
    workflow.add_edge("handle_file_upload", END)
    
    return workflow.compile()


workflow = agent_claude.app



