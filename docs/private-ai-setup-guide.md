# Nanocoder Private AI Setup: Complete Guide

A comprehensive, all-in-one guide for setting up a fully private, offline AI coding environment with Nanocoder. This document covers everything from hardware requirements to production deployment, specifically optimized for Apple M4 Max with 36GB unified memory.

**No outgoing network connections. Complete data privacy. Local-first AI coding.**

> **⚡ New: Built-in Model Management** - Nanocoder now includes built-in capabilities to install MLX-LM and llama.cpp, download models, and manage inference servers automatically. This guide covers both the new automated approach and manual setup for those who prefer more control.

---

## Table of Contents

1. [Overview](#1-overview)
2. [Hardware & Software Requirements](#2-hardware--software-requirements)
3. [Recommended Local Models](#3-recommended-local-models)
4. [Inference Backend Comparison](#4-inference-backend-comparison)
5. [Phase 1: Prerequisites Setup](#5-phase-1-prerequisites-setup)
6. [Phase 2: Inference Backend Installation](#6-phase-2-inference-backend-installation)
7. [Phase 3: Model Download](#7-phase-3-model-download)
8. [Phase 4: Nanocoder Installation](#8-phase-4-nanocoder-installation)
9. [Phase 5: Configuration](#9-phase-5-configuration)
10. [Phase 6: Validation & Testing](#10-phase-6-validation--testing)
11. [Phase 7: Production Deployment](#11-phase-7-production-deployment)
12. [Memory Management](#12-memory-management)
13. [Framework Template](#13-framework-template)
14. [Troubleshooting](#14-troubleshooting)
15. [Quick Reference](#15-quick-reference)

---

## 1. Overview

### What You'll Build

```
┌─────────────────────────────────────────────────────────────┐
│                     Your Development Machine                 │
│  ┌─────────────┐    ┌──────────────┐    ┌────────────────┐  │
│  │  Nanocoder  │◄──►│  Inference   │◄──►│  Local Model   │  │
│  │    CLI      │    │   Backend    │    │  (e.g. Qwen)   │  │
│  └─────────────┘    └──────────────┘    └────────────────┘  │
│        │                   │                     │           │
│        ▼                   ▼                     ▼           │
│  ┌─────────────────────────────────────────────────────────┐│
│  │              localhost only (no internet)               ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

### Key Architecture Decisions

| Decision | Options | Recommendation |
|----------|---------|----------------|
| **Inference Backend** | MLX-LM, Ollama, llama.cpp, LM Studio | MLX-LM (performance) or Ollama (ease) |
| **Model Size** | 7B, 13B, 16B, 22B, 32B | Based on available RAM |
| **Quantization** | Q4, Q5, Q6, Q8, FP16 | Q4_K_M for large models, Q8_0 for small |
| **Network Mode** | Local-only, Hybrid, Cloud | **Local-only for privacy** |

### Privacy Guarantees

This configuration ensures:
- **Only localhost URLs** - All providers point to `localhost`
- **No cloud providers** - OpenRouter, OpenAI, etc. are excluded
- **No MCP remote servers** - Only local MCP servers if needed
- **No API keys required** - Local models don't need authentication

---

## 2. Hardware & Software Requirements

### Target Hardware: Apple M4 Max 36GB

| Component | Specification |
|-----------|---------------|
| **Chip** | Apple M4 Max |
| **Unified Memory** | 36GB |
| **Architecture** | Apple Silicon (ARM64) |
| **GPU** | Integrated (30-40 core) |

The unified memory architecture allows models to leverage both CPU and GPU memory seamlessly, enabling larger models than traditional discrete GPU setups with similar VRAM.

### Minimum Requirements

- 16GB RAM (8GB+ available for model)
- Apple Silicon M1/M2/M3/M4 or x86_64 with AVX2
- 50GB+ free disk space
- macOS Ventura or later (Sequoia recommended)

### Software Prerequisites

- Node.js 18+
- Homebrew
- Python 3.10+ (for MLX-LM)
- Git

---

## 3. Recommended Local Models

### Tier 1: Best Performance (Fits in 36GB)

| Model | Quantization | Size | Use Case | Notes |
|-------|--------------|------|----------|-------|
| **Qwen2.5-Coder 32B** | Q4_K_M | ~18GB | Production coding | Best overall coding model for your RAM |
| **DeepSeek-Coder-V2-Lite 16B** | Q8_0 | ~16GB | Fast coding | Excellent speed/quality balance |
| **Codestral 22B** | Q5_K_M | ~15GB | Code generation | Mistral's coding specialist |

### Tier 2: Balanced (Leave Room for Context)

| Model | Quantization | Size | Use Case | Notes |
|-------|--------------|------|----------|-------|
| **Llama 3.2 11B** | Q8_0 | ~12GB | General + coding | Versatile, good at both |
| **CodeLlama 13B** | Q8_0 | ~14GB | Code completion | Meta's coding model |
| **Phi-3 Medium 14B** | Q6_K | ~11GB | Reasoning + code | Microsoft's efficient model |

### Tier 3: Lightweight (Maximum Context Window)

| Model | Quantization | Size | Use Case | Notes |
|-------|--------------|------|----------|-------|
| **Qwen2.5-Coder 7B** | Q8_0 | ~8GB | Quick iterations | Fast responses |
| **DeepSeek-Coder 6.7B** | Q8_0 | ~7GB | Code completion | Efficient coding |
| **CodeGemma 7B** | Q8_0 | ~8GB | Code generation | Google's coding model |

### Model Selection by RAM

| RAM Available | Recommended Model | Quantization | Size |
|---------------|-------------------|--------------|------|
| **8-12GB** | Qwen2.5-Coder 7B | Q8_0 | ~8GB |
| **12-16GB** | DeepSeek-Coder 6.7B | Q8_0 | ~7GB |
| **16-24GB** | DeepSeek-Coder-V2-Lite 16B | Q8_0 | ~16GB |
| **24-32GB** | Codestral 22B | Q5_K_M | ~15GB |
| **32GB+** | Qwen2.5-Coder 32B | Q4_K_M | ~18GB |

---

## 4. Inference Backend Comparison

### Decision Matrix

| Factor | MLX-LM | Ollama | llama.cpp | LM Studio |
|--------|--------|--------|-----------|-----------|
| **Performance on Apple Silicon** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Ease of Setup** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Model Management** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐ |
| **Memory Efficiency** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Scriptability** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐ |
| **Open Source** | ✅ | ✅ | ✅ | ❌ |

### MLX-LM (Recommended for M4 Max)

**Rating: ⭐⭐⭐⭐⭐ Best Performance**

MLX is Apple's machine learning framework, specifically optimized for Apple Silicon's unified memory architecture.

**Pros:**
- Native Apple Silicon optimization
- Best inference speed on M4 Max
- Efficient unified memory utilization
- Direct Metal acceleration
- Active development by Apple

**Cons:**
- Requires Python environment
- Smaller model ecosystem than Ollama
- More technical setup

### Ollama (Recommended for Ease of Use)

**Rating: ⭐⭐⭐⭐⭐ Best Developer Experience**

**Pros:**
- Excellent model management
- Easy installation and updates
- Good Metal GPU acceleration
- Large model library
- Active community

**Cons:**
- Slightly slower than MLX on Apple Silicon
- Less memory-efficient than MLX

### llama.cpp

**Rating: ⭐⭐⭐⭐ Excellent Backend**

**Pros:**
- Excellent Metal backend
- Fine-grained control
- GGUF format support
- Active development

**Cons:**
- More manual setup required
- No built-in model management

### LM Studio

**Rating: ⭐⭐⭐⭐ Good GUI Option**

**Pros:**
- User-friendly GUI
- Built-in model browser
- Uses llama.cpp under the hood

**Cons:**
- GUI adds overhead
- Less scriptable
- Closed source

---

## 5. Phase 1: Prerequisites Setup

### 1.1 Check System Requirements

```bash
# Check macOS version
sw_vers

# Check available memory (macOS)
sysctl hw.memsize | awk '{print $2/1024/1024/1024 " GB"}'
# Alternative for Linux: free -h

# Check disk space
df -h /
```

### 1.2 Install Homebrew

```bash
# Install Homebrew (if not installed)
# Review the script at https://brew.sh before running
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

> **Security Note:** Always review shell scripts before executing them. You can inspect the Homebrew installer at https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh

### 1.3 Install Node.js

```bash
# Install Node.js 18+
brew install node@18

# Verify Node.js
node --version  # Should be 18.x or higher
npm --version
```

### 1.4 Setup Python Environment (for MLX-LM)

```bash
# Install Python 3.10+ if needed
brew install python@3.11

# Create virtual environment (recommended)
python3 -m venv ~/.venv/nanocoder
source ~/.venv/nanocoder/bin/activate

# Upgrade pip
pip install --upgrade pip
```

### Checklist - Phase 1

- [ ] Hardware meets minimum requirements
- [ ] macOS/Linux compatible version
- [ ] Homebrew installed
- [ ] Node.js 18+ installed
- [ ] Python 3.10+ installed (if using MLX-LM)
- [ ] Virtual environment created (optional but recommended)

---

## 6. Phase 2: Inference Backend Installation

### Option A: MLX-LM (Recommended for Apple Silicon)

```bash
# Activate virtual environment
source ~/.venv/nanocoder/bin/activate

# Install MLX-LM
pip install mlx-lm

# Verify installation
python -c "import mlx_lm; print('MLX-LM installed successfully')"
```

### Option B: Ollama (Recommended for Ease of Use)

```bash
# Install via Homebrew
brew install ollama

# Verify installation
ollama --version
```

### Option C: llama.cpp

```bash
# Install via Homebrew
brew install llama.cpp

# Verify installation
llama-cli --version
```

### Option D: LM Studio

```bash
# Download from https://lmstudio.ai/
# Or via Homebrew Cask
brew install --cask lm-studio
```

### Checklist - Phase 2

- [ ] Selected inference backend based on requirements
- [ ] Backend installed and verified
- [ ] Understand backend's configuration options

---

## 7. Phase 3: Model Download

### For MLX-LM

```bash
# Models download automatically on first use
# Or pre-download:
python -c "from mlx_lm import load; load('mlx-community/Qwen2.5-Coder-32B-Instruct-4bit')"
```

### For Ollama

```bash
# Pull model
ollama pull qwen2.5-coder:32b-instruct-q4_K_M

# List downloaded models
ollama list
```

### For llama.cpp

```bash
# Download GGUF model from Hugging Face
mkdir -p ~/models
cd ~/models

# Use huggingface-cli or manual download
pip install huggingface_hub
huggingface-cli download TheBloke/Qwen2.5-Coder-32B-Instruct-GGUF \
    qwen2.5-coder-32b-instruct.Q4_K_M.gguf \
    --local-dir .
```

### Checklist - Phase 3

- [ ] Calculated available RAM for model
- [ ] Selected appropriate model and quantization
- [ ] Downloaded model files
- [ ] Verified model file integrity

---

## 8. Phase 4: Nanocoder Installation

### Option A: NPM (Recommended)

```bash
# Install globally
npm install -g @nanocollective/nanocoder

# Verify installation
nanocoder --version
```

### Option B: Homebrew

```bash
# Add tap
brew tap nano-collective/nanocoder https://github.com/Nano-Collective/nanocoder

# Install
brew install nanocoder

# Verify
nanocoder --version
```

### Option C: From Source (Development)

```bash
# Clone repository
git clone https://github.com/Nano-Collective/nanocoder.git
cd nanocoder

# Install dependencies
npm install

# Build
npm run build

# Run
npm run start
```

### Checklist - Phase 4

- [ ] Nanocoder installed
- [ ] Version verified
- [ ] Can run `nanocoder` command

---

## 9. Phase 5: Configuration

### 9.1 Create Configuration Directory

```bash
# Create config directory
mkdir -p ~/.config/nanocoder
```

### 9.2 Create agents.config.json (Local-Only Setup)

Create `~/.config/nanocoder/agents.config.json`:

```json
{
	"nanocoder": {
		"providers": [
			{
				"name": "MLX-LM (Recommended)",
				"baseUrl": "http://localhost:8080/v1",
				"models": [
					"mlx-community/Qwen2.5-Coder-32B-Instruct-4bit",
					"mlx-community/DeepSeek-Coder-V2-Lite-Instruct-8bit"
				],
				"requestTimeout": -1,
				"socketTimeout": -1
			},
			{
				"name": "Ollama",
				"baseUrl": "http://localhost:11434/v1",
				"models": [
					"qwen2.5-coder:32b-instruct-q4_K_M",
					"deepseek-coder-v2:16b-lite-instruct-q8_0",
					"codestral:22b-v0.1-q5_K_M",
					"llama3.2:11b-instruct-q8_0"
				],
				"requestTimeout": -1,
				"socketTimeout": -1
			},
			{
				"name": "llama.cpp",
				"baseUrl": "http://localhost:8081/v1",
				"models": ["local-model"],
				"requestTimeout": -1,
				"socketTimeout": -1
			}
		]
	}
}
```

### 9.3 Optional: Local-Only MCP Servers

If you need MCP functionality, use only local servers:

```json
{
	"nanocoder": {
		"providers": [
			// ... providers from above
		],
		"mcpServers": [
			{
				"name": "filesystem",
				"transport": "stdio",
				"command": "npx",
				"args": [
					"-y",
					"@modelcontextprotocol/server-filesystem",
					"/path/to/your/projects"
				]
			}
		]
	}
}
```

### 9.4 Start Inference Backend

#### For MLX-LM:

```bash
# Start server
mlx_lm.server --model mlx-community/Qwen2.5-Coder-32B-Instruct-4bit --port 8080
```

#### For Ollama:

```bash
# Start Ollama service
ollama serve

# In another terminal, verify
curl http://localhost:11434/v1/models
```

#### For llama.cpp:

```bash
# Start server
llama-server -m ~/models/qwen2.5-coder-32b-instruct.Q4_K_M.gguf \
    --port 8080 \
    --ctx-size 8192 \
    --n-gpu-layers 999
```

### Checklist - Phase 5

- [ ] Configuration directory created
- [ ] agents.config.json created with local-only providers
- [ ] No cloud providers in configuration
- [ ] Inference backend running
- [ ] Backend responding on localhost

---

## 10. Phase 6: Validation & Testing

### 10.1 Verify Backend Connectivity

```bash
# Test MLX-LM or llama.cpp endpoint
curl http://localhost:8080/v1/models

# Test Ollama endpoint
curl http://localhost:11434/v1/models
```

Expected response:
```json
{
  "object": "list",
  "data": [
    {"id": "model-name", "object": "model", ...}
  ]
}
```

### 10.2 Test Nanocoder

```bash
# Navigate to a project directory
cd ~/your-project

# Start Nanocoder
nanocoder
```

### 10.3 Verify Local-Only Operation

```bash
# Inside Nanocoder, check status
/status

# Should show only local providers
/provider

# Test basic prompt
> Hello, can you see this message?
```

### 10.4 Network Verification

```bash
# Monitor network connections (in separate terminal)
lsof -i -n -P | grep -E "(nanocoder|ollama|llama|mlx)"

# Should only show localhost connections
```

### Checklist - Phase 6

- [ ] Backend API responding correctly
- [ ] Nanocoder starts without errors
- [ ] Can select local provider
- [ ] Can send prompts and receive responses
- [ ] No external network connections detected

---

## 11. Phase 7: Production Deployment

### 11.1 Create Startup Script

Create `~/bin/start-ai-coding.sh`:

```bash
#!/bin/bash

# Start inference backend in background
echo "Starting inference backend..."

# Choose ONE of these based on your setup:

# For MLX-LM:
source ~/.venv/nanocoder/bin/activate
mlx_lm.server --model mlx-community/Qwen2.5-Coder-32B-Instruct-4bit --port 8080 &

# For Ollama:
# ollama serve &

# Wait for backend to start
sleep 5

# Verify backend is running
if curl -s http://localhost:8080/v1/models > /dev/null 2>&1; then
    echo "Backend started successfully"
else
    echo "Warning: Backend may not be ready yet"
fi

echo "Ready to run: nanocoder"
```

Make it executable:
```bash
mkdir -p ~/bin
chmod +x ~/bin/start-ai-coding.sh
```

### 11.2 Create Shutdown Script

Create `~/bin/stop-ai-coding.sh`:

```bash
#!/bin/bash

# Stop MLX-LM server
pkill -f "mlx_lm.server" 2>/dev/null

# Stop Ollama (if using)
# pkill -f "ollama serve" 2>/dev/null

# Stop llama.cpp server (if using)
# pkill -f "llama-server" 2>/dev/null

echo "AI coding environment stopped"
```

Make it executable:
```bash
chmod +x ~/bin/stop-ai-coding.sh
```

### 11.3 Optional: LaunchAgent for Auto-Start

First, create a wrapper script at `~/bin/nanocoder-backend.sh`:

```bash
#!/bin/bash
export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"
source "$HOME/.venv/nanocoder/bin/activate"
exec mlx_lm.server --model mlx-community/Qwen2.5-Coder-32B-Instruct-4bit --port 8080
```

Make it executable:
```bash
chmod +x ~/bin/nanocoder-backend.sh
```

Then create `~/Library/LaunchAgents/com.nanocoder.backend.plist`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.nanocoder.backend</string>
    <key>ProgramArguments</key>
    <array>
        <string>/bin/bash</string>
        <string>-l</string>
        <string>-c</string>
        <string>$HOME/bin/nanocoder-backend.sh</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
    <key>StandardOutPath</key>
    <string>/tmp/nanocoder-backend.log</string>
    <key>StandardErrorPath</key>
    <string>/tmp/nanocoder-backend.error.log</string>
</dict>
</plist>
```

Load the LaunchAgent:
```bash
launchctl load ~/Library/LaunchAgents/com.nanocoder.backend.plist
```

### 11.4 Firewall Configuration (Maximum Privacy)

```bash
# Find nanocoder executable path first
NANOCODER_PATH=$(npm root -g)/@nanocollective/nanocoder
# Or if installed via Homebrew:
# NANOCODER_PATH=$(brew --prefix)/bin/nanocoder

# Block application from internet (optional)
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --add "$NANOCODER_PATH"
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --blockapp "$NANOCODER_PATH"
```

Or use Little Snitch/Lulu to monitor and block all outgoing connections.

### Checklist - Phase 7

- [ ] Startup script created and tested
- [ ] Shutdown script created and tested
- [ ] (Optional) LaunchAgent configured
- [ ] (Optional) Firewall configured
- [ ] System runs reliably on restart

---

## 12. Memory Management

### Optimal Model Sizes for 36GB

| Available RAM | Recommended Max Model Size | Example |
|--------------|---------------------------|---------|
| 36GB (full) | ~24GB model | Qwen2.5-Coder 32B Q4 |
| 28GB (with apps) | ~18GB model | DeepSeek-V2-Lite 16B Q8 |
| 20GB (heavy use) | ~12GB model | Llama 3.2 11B Q8 |

### Context Window Recommendations

| Model Size | Recommended Context | Why |
|------------|--------------------| --- |
| 32B Q4 | 8192 tokens | Balance speed/context |
| 16B Q8 | 16384 tokens | Room for larger context |
| 7B Q8 | 32768 tokens | Maximum context possible |

### Monitor Memory Usage

```bash
# Check memory pressure
memory_pressure

# Monitor in real-time
top -o MEM

# Check specific process
ps aux | grep -E "(ollama|mlx|llama)"
```

---

## 13. Framework Template

Use this YAML template to plan your deployment:

```yaml
# Nanocoder Deployment Plan
# Generated: [DATE]

project:
  name: "[PROJECT NAME]"
  description: "[DESCRIPTION]"
  team_size: [NUMBER]

hardware:
  machine: "[e.g., MacBook Pro M4 Max]"
  ram: "[e.g., 36GB Unified Memory]"
  storage: "[e.g., 512GB SSD]"
  os: "[e.g., macOS Sequoia 15.1]"

decisions:
  inference_backend: "[MLX-LM | Ollama | llama.cpp | LM Studio]"
  primary_model: "[e.g., Qwen2.5-Coder 32B Q4_K_M]"
  secondary_model: "[e.g., DeepSeek-Coder 6.7B Q8_0]"
  network_mode: "[local-only | hybrid | cloud]"
  
timeline:
  phase_1_prerequisites: "[DATE]"
  phase_2_backend: "[DATE]"
  phase_3_models: "[DATE]"
  phase_4_nanocoder: "[DATE]"
  phase_5_config: "[DATE]"
  phase_6_testing: "[DATE]"
  phase_7_production: "[DATE]"

team_assignments:
  lead: "[NAME]"
  backend_setup: "[NAME]"
  testing: "[NAME]"
  documentation: "[NAME]"

success_criteria:
  - All phases completed
  - No external network connections
  - Response time under 5 seconds
  - Memory usage within limits
  - Team trained on usage
```

---

## 14. Troubleshooting

### Common Issues

| Problem | Cause | Solution |
|---------|-------|----------|
| "Connection refused" | Backend not running | Start inference backend first |
| Slow responses | Model too large | Use smaller model or Q4 quantization |
| Out of memory | Insufficient RAM | Close apps, use smaller model |
| Model loops/repeats | Context too small | Increase context size (8192+) |
| "Model not found" | Wrong model name | Check model name in backend |

### Context Length Issues

If you experience the model repeating tool calls or getting into loops:

**Solution:** Increase context size in your inference tool:
- **Ollama:** `OLLAMA_NUM_CTX=8192`
- **llama.cpp:** `--ctx-size 8192`
- **MLX-LM:** Model-dependent

### Debug Commands

```bash
# Check if backend is running
lsof -i :8080
lsof -i :11434

# Check memory usage
top -o MEM

# Test API directly
curl http://localhost:8080/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "mlx-community/Qwen2.5-Coder-32B-Instruct-4bit",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

### Getting Help

- **GitHub Issues**: Report bugs and request features
- **Discord**: [Join the community](https://discord.gg/ktPDV6rekE) for real-time help

---

## 15. Quick Reference

### Quick Reference Card

```
┌────────────────────────────────────────────────────────────┐
│              NANOCODER PRIVATE AI QUICK REFERENCE           │
├────────────────────────────────────────────────────────────┤
│ START BACKEND:                                              │
│   MLX-LM:    mlx_lm.server --model [MODEL] --port 8080     │
│   Ollama:    ollama serve                                   │
│   llama.cpp: llama-server -m [MODEL.gguf] --port 8080      │
├────────────────────────────────────────────────────────────┤
│ START NANOCODER:                                            │
│   nanocoder                                                 │
├────────────────────────────────────────────────────────────┤
│ KEY COMMANDS:                                               │
│   /provider  - Switch AI provider                           │
│   /model     - Switch model                                 │
│   /status    - Show current status                          │
│   /help      - Show all commands                            │
│   /exit      - Exit Nanocoder                               │
├────────────────────────────────────────────────────────────┤
│ CONFIG FILE:                                                │
│   ~/.config/nanocoder/agents.config.json                   │
├────────────────────────────────────────────────────────────┤
│ TEST BACKEND:                                               │
│   curl http://localhost:8080/v1/models                     │
├────────────────────────────────────────────────────────────┤
│ RECOMMENDED MODELS (36GB RAM):                              │
│   Best:    Qwen2.5-Coder 32B Q4_K_M (~18GB)                │
│   Fast:    DeepSeek-Coder-V2-Lite 16B Q8_0 (~16GB)         │
│   Light:   Qwen2.5-Coder 7B Q8_0 (~8GB)                    │
└────────────────────────────────────────────────────────────┘
```

### Deployment Checklist

- [ ] Install inference tool (MLX-LM or Ollama recommended)
- [ ] Download appropriate model for your RAM
- [ ] Create local-only `agents.config.json`
- [ ] Verify no cloud providers in configuration
- [ ] Test inference server is running (`curl localhost:8080/v1/models`)
- [ ] Start Nanocoder and select local provider
- [ ] (Optional) Configure firewall for complete isolation
- [ ] (Optional) Set up local-only MCP servers

---

## Version Information

| Field | Value |
|-------|-------|
| **Guide Version** | 1.0 |
| **Last Updated** | November 2025 |
| **Tested On** | M4 Max 36GB, macOS Sequoia |

## Related Documentation

- [MCP Configuration Guide](./mcp-configuration.md)
- [Contributing Guide](../CONTRIBUTING.md)
- [README](../README.md)
