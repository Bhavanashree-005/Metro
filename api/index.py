import sys
import os
from pathlib import Path

# Add the server directory to the Python path so we can import the app and its modules
# This bridges Vercel's serverless runtime to the existing project structure
current_dir = Path(__file__).parent
project_root = current_dir.parent / "chennai_metro_did" / "server"
sys.path.append(str(project_root))

from main import app as handler

# Entry point for Vercel
app = handler
