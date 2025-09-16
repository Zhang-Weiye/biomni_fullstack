"""
File upload tool for handling uploaded files and adding them to the agent's data lake.
"""

import os
from typing import Dict, Any


def add_uploaded_file_to_data_lake(file_path: str, description: str = "Please use it if needed") -> str:
    """
    Add an uploaded file to the agent's data lake.
    
    This function is called when a file is uploaded through the frontend.
    It adds the file to the agent's custom data collection so it can be used
    in subsequent analysis tasks.
    
    Parameters
    ----------
    file_path : str
        The absolute path to the uploaded file
    description : str, optional
        Description of the file (default: "Please use it if needed")
        
    Returns
    -------
    str
        Success message with file information
    """
    try:
        # Check if file exists
        if not os.path.exists(file_path):
            return f"Error: File not found at {file_path}"
        
        # Get file information
        file_size = os.path.getsize(file_path)
        filename = os.path.basename(file_path)
        
        # This function will be called by the agent's add_data method
        # The actual implementation is handled by the agent instance
        
        return f"Successfully added file '{filename}' to data lake. Path: {file_path}, Size: {file_size} bytes, Description: {description}"
        
    except Exception as e:
        return f"Error adding file to data lake: {str(e)}"


def get_uploaded_file_info(file_path: str) -> Dict[str, Any]:
    """
    Get information about an uploaded file.
    
    Parameters
    ----------
    file_path : str
        The absolute path to the uploaded file
        
    Returns
    -------
    Dict[str, Any]
        Dictionary containing file information
    """
    try:
        if not os.path.exists(file_path):
            return {"error": f"File not found at {file_path}"}
        
        stat = os.stat(file_path)
        filename = os.path.basename(file_path)
        
        return {
            "filename": filename,
            "filepath": file_path,
            "size": stat.st_size,
            "modified": stat.st_mtime,
            "exists": True
        }
        
    except Exception as e:
        return {"error": str(e)}

