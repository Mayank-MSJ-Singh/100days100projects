# app.py
import asyncio
import json
import logging
from typing import Optional

from fastapi import FastAPI, HTTPException
from fastapi.responses import HTMLResponse, JSONResponse
from pydantic import BaseModel
from starlette.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from openai import OpenAI
from mcp.client.session import ClientSession
from mcp.client.streamable_http import streamablehttp_client

load_dotenv()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("mcp-web-demo")

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

# Initialize a single OpenAI client (reads OPENAI_API_KEY from env)
openai_client = OpenAI()

class QueryRequest(BaseModel):
    mcp_url: str
    query: str
    max_tokens: Optional[int] = 1000

class WebMCPClient:
    """Small, one-shot adaptation of your MCPClient.process_query.
    For demo purposes: connects, asks once, closes.
    """
    def __init__(self, session: ClientSession):
        self.session = session
        self.openai = openai_client
        self.messages = []

    async def run_once(self, query: str, max_tokens: int = 1000) -> str:
        self.messages.append({"role": "user", "content": query})

        # Get available tools from MCP server
        response = await self.session.list_tools()
        available_tools = [{
            "type": "function",
            "function": {
                "name": tool.name,
                "description": tool.description,
                "parameters": tool.inputSchema,
            }
        } for tool in response.tools]

        # Helper to call OpenAI in a thread (the OpenAI client is blocking in many installs)
        loop = asyncio.get_running_loop()
        def call_openai(messages):
            return self.openai.chat.completions.create(
                model="gpt-4.1-mini-2025-04-14",
                messages=messages,
                max_tokens=max_tokens,
                tools=available_tools,
            )

        # First assistant response
        response = await loop.run_in_executor(None, call_openai, self.messages)

        final_text = []
        message = response.choices[0].message
        if getattr(message, "content", None):
            final_text.append(message.content)

        # If assistant decided to call tools, run them
        if getattr(message, "tool_calls", None):
            for tool_call in message.tool_calls:
                tool_name = tool_call.function.name
                tool_args = json.loads(tool_call.function.arguments)

                # Execute tool via MCP session
                result = await self.session.call_tool(tool_name, tool_args)
                final_text.append(f"[Calling tool {tool_name} with args {tool_args}]")

                # Add assistant/tool messages to history and get follow-up
                self.messages.append({
                    "role": "assistant",
                    "content": message.content,
                    "tool_calls": [{
                        "id": tool_call.id,
                        "type": "function",
                        "function": {
                            "name": tool_name,
                            "arguments": tool_call.function.arguments,
                        }
                    }]
                })

                # Tool result message
                tool_text = str(result.content[0].text)
                self.messages.append({
                    "role": "tool",
                    "tool_call_id": tool_call.id,
                    "content": tool_text,
                })
                final_text.append(f"[Tool call result: {tool_text}]")

                # Ask the model again with the updated history
                response = await loop.run_in_executor(None, call_openai, self.messages)
                final_text.append(response.choices[0].message.content)

        # Save final assistant message into history (optional)
        if response.choices[0].message.content:
            self.messages.append({"role": "assistant", "content": response.choices[0].message.content})

        return "\n".join(final_text)


@app.post("/api/query")
async def api_query(req: QueryRequest):
    try:
        # Open a short-lived streamable HTTP connection to the given MCP url
        async with streamablehttp_client(req.mcp_url) as streams:
            read_stream, write_stream = streams[:2]
            async with ClientSession(read_stream, write_stream) as session:
                await session.initialize()
                client = WebMCPClient(session)
                text = await client.run_once(req.query, req.max_tokens or 1000)
                return JSONResponse({"ok": True, "response": text})

    except Exception as e:
        logger.exception("Error talking to MCP server")
        raise HTTPException(status_code=500, detail=str(e))


# Very small frontend served by the same app for convenience
INDEX_HTML = """
<!doctype html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>MCP Web Demo</title>
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <style>
    body { font-family: Inter, system-ui, -apple-system, Arial, sans-serif; max-width:900px; margin:2rem auto; padding:0 1rem }
    input, textarea { width:100%; padding:8px; font-size:14px; margin-top:6px }
    button { padding:8px 16px; margin-top:10px }
    pre { background:#f7f7f8; padding:12px; border-radius:8px; white-space:pre-wrap }
    label { font-weight:600; margin-top:12px; display:block }
  </style>
</head>
<body>
  <h1>MCP Web Demo</h1>
  <p>Paste your MCP URL and write a query. Each request opens a short-lived connection to the MCP server and returns the final text.</p>
  <label>MCP URL</label>
  <input id="mcp_url" placeholder="https://.../mcp/?instance_id=..." />
  <label>Query</label>
  <textarea id="query" rows="6" placeholder="Ask the assistant or trigger a tool"></textarea>
  <div>
    <button id="send">Send</button>
    <span id="status" style="margin-left:8px"></span>
  </div>
  <h3>Result</h3>
  <pre id="result">(no response yet)</pre>

<script>
const send = document.getElementById('send');
const status = document.getElementById('status');
const result = document.getElementById('result');

send.addEventListener('click', async () => {
  const mcp_url = document.getElementById('mcp_url').value.trim();
  const query = document.getElementById('query').value.trim();
  if (!mcp_url || !query) { alert('Enter both MCP URL and query'); return; }
  status.textContent = 'Sending...';
  result.textContent = '';
  try {
    const res = await fetch('/api/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mcp_url, query })
    });
    if (!res.ok) {
      const text = await res.text();
      status.textContent = 'Error';
      result.textContent = text;
      return;
    }
    const j = await res.json();
    status.textContent = 'Done';
    result.textContent = j.response || '(empty)';
  } catch (err) {
    status.textContent = 'Network error';
    result.textContent = String(err);
  }
});
</script>
</body>
</html>
"""


@app.get('/', response_class=HTMLResponse)
async def index():
    return HTMLResponse(INDEX_HTML)