# Nanocoder Installation & Framework Planning Guide

A step-by-step installation guide and framework for setting up Nanocoder with private, local AI models. This document provides a structured plan for developers to deploy Nanocoder from development to production.

## Table of Contents

- [Overview](#overview)
- [Phase 1: Prerequisites & Environment Setup](#phase-1-prerequisites--environment-setup)
- [Phase 2: Inference Backend Selection](#phase-2-inference-backend-selection)
- [Phase 3: Model Selection](#phase-3-model-selection)
- [Phase 4: Nanocoder Installation](#phase-4-nanocoder-installation)
- [Phase 5: Configuration](#phase-5-configuration)
- [Phase 6: Validation & Testing](#phase-6-validation--testing)
- [Phase 7: Production Deployment](#phase-7-production-deployment)
- [Framework Template](#framework-template)
- [Troubleshooting](#troubleshooting)

---

## Overview

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

### Architecture Decisions

| Decision | Options | Recommendation |
|----------|---------|----------------|
| **Inference Backend** | MLX-LM, Ollama, llama.cpp, LM Studio | MLX-LM (performance) or Ollama (ease) |
| **Model Size** | 7B, 13B, 16B, 22B, 32B | Based on available RAM |
| **Quantization** | Q4, Q5, Q6, Q8, FP16 | Q4_K_M for large models, Q8_0 for small |
| **Network Mode** | Local-only, Hybrid, Cloud | Local-only for privacy |

---

## Phase 1: Prerequisites & Environment Setup

### 1.1 Hardware Assessment

**Minimum Requirements:**
- 16GB RAM (8GB+ available for model)
- Apple Silicon M1/M2/M3/M4 or x86_64 with AVX2
- 50GB+ free disk space

**Recommended (M4 Max 36GB):**
- 36GB Unified Memory
- 512GB+ SSD
- macOS Sequoia or later

### 1.2 Software Prerequisites

```bash
# Check macOS version
sw_vers

# Check available memory
sysctl hw.memsize | awk '{print $2/1024/1024/1024 " GB"}'

# Install Homebrew (if not installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Node.js 18+
brew install node@18

# Verify Node.js
node --version  # Should be 18.x or higher
npm --version
```

### 1.3 Python Environment (for MLX-LM)

```bash
# Install Python 3.10+ if needed
brew install python@3.11

# Create virtual environment (recommended)
python3 -m venv ~/.venv/nanocoder
source ~/.venv/nanocoder/bin/activate

# Upgrade pip
pip install --upgrade pip
```

**Checklist - Phase 1:**
- [ ] Hardware meets minimum requirements
- [ ] macOS/Linux compatible version
- [ ] Homebrew installed
- [ ] Node.js 18+ installed
- [ ] Python 3.10+ installed (if using MLX-LM)
- [ ] Virtual environment created (optional but recommended)

---

## Phase 2: Inference Backend Selection

### 2.1 Decision Matrix

| Factor | MLX-LM | Ollama | llama.cpp | LM Studio |
|--------|--------|--------|-----------|-----------|
| **Performance on Apple Silicon** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Ease of Setup** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Model Management** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐ |
| **Memory Efficiency** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Scriptability** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐ |
| **Open Source** | ✅ | ✅ | ✅ | ❌ |

### 2.2 Installation Instructions

#### Option A: MLX-LM (Recommended for Apple Silicon)

```bash
# Activate virtual environment
source ~/.venv/nanocoder/bin/activate

# Install MLX-LM
pip install mlx-lm

# Verify installation
python -c "import mlx_lm; print('MLX-LM installed successfully')"
```

#### Option B: Ollama (Recommended for Ease of Use)

```bash
# Install via Homebrew
brew install ollama

# Verify installation
ollama --version
```

#### Option C: llama.cpp

```bash
# Install via Homebrew
brew install llama.cpp

# Verify installation
llama-cli --version
```

#### Option D: LM Studio

```bash
# Download from https://lmstudio.ai/
# Or via Homebrew Cask
brew install --cask lm-studio
```

**Checklist - Phase 2:**
- [ ] Selected inference backend based on requirements
- [ ] Backend installed and verified
- [ ] Understand backend's configuration options

---

## Phase 3: Model Selection

### 3.1 Model Selection Guide

**By Available RAM:**

| RAM Available | Recommended Model | Quantization | Size |
|---------------|-------------------|--------------|------|
| **8-12GB** | Qwen2.5-Coder 7B | Q8_0 | ~8GB |
| **12-16GB** | DeepSeek-Coder 6.7B | Q8_0 | ~7GB |
| **16-24GB** | DeepSeek-Coder-V2-Lite 16B | Q8_0 | ~16GB |
| **24-32GB** | Codestral 22B | Q5_K_M | ~15GB |
| **32GB+** | Qwen2.5-Coder 32B | Q4_K_M | ~18GB |

### 3.2 Download Models

#### For MLX-LM:

```bash
# Models download automatically on first use
# Or pre-download:
python -c "from mlx_lm import load; load('mlx-community/Qwen2.5-Coder-32B-Instruct-4bit')"
```

#### For Ollama:

```bash
# Pull model
ollama pull qwen2.5-coder:32b-instruct-q4_K_M

# List downloaded models
ollama list
```

#### For llama.cpp:

```bash
# Download GGUF model from Hugging Face
# Example: Download to ~/models/
mkdir -p ~/models
cd ~/models

# Use huggingface-cli or manual download
pip install huggingface_hub
huggingface-cli download TheBloke/Qwen2.5-Coder-32B-Instruct-GGUF \
    qwen2.5-coder-32b-instruct.Q4_K_M.gguf \
    --local-dir .
```

**Checklist - Phase 3:**
- [ ] Calculated available RAM for model
- [ ] Selected appropriate model and quantization
- [ ] Downloaded model files
- [ ] Verified model file integrity

---

## Phase 4: Nanocoder Installation

### 4.1 Install Nanocoder

#### Option A: NPM (Recommended)

```bash
# Install globally
npm install -g @nanocollective/nanocoder

# Verify installation
nanocoder --version
```

#### Option B: Homebrew

```bash
# Add tap
brew tap nano-collective/nanocoder https://github.com/Nano-Collective/nanocoder

# Install
brew install nanocoder

# Verify
nanocoder --version
```

#### Option C: From Source (Development)

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

**Checklist - Phase 4:**
- [ ] Nanocoder installed
- [ ] Version verified
- [ ] Can run `nanocoder` command

---

## Phase 5: Configuration

### 5.1 Create Configuration Directory

```bash
# Create config directory
mkdir -p ~/.config/nanocoder
```

### 5.2 Create agents.config.json

Create `~/.config/nanocoder/agents.config.json`:

```json
{
	"nanocoder": {
		"providers": [
			{
				"name": "Local-MLX",
				"baseUrl": "http://localhost:8080/v1",
				"models": ["mlx-community/Qwen2.5-Coder-32B-Instruct-4bit"],
				"requestTimeout": -1,
				"socketTimeout": -1
			},
			{
				"name": "Local-Ollama",
				"baseUrl": "http://localhost:11434/v1",
				"models": [
					"qwen2.5-coder:32b-instruct-q4_K_M",
					"deepseek-coder-v2:16b-lite-instruct-q8_0"
				],
				"requestTimeout": -1,
				"socketTimeout": -1
			}
		]
	}
}
```

### 5.3 Start Inference Backend

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

**Checklist - Phase 5:**
- [ ] Configuration directory created
- [ ] agents.config.json created with local-only providers
- [ ] No cloud providers in configuration
- [ ] Inference backend running
- [ ] Backend responding on localhost

---

## Phase 6: Validation & Testing

### 6.1 Verify Backend Connectivity

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

### 6.2 Test Nanocoder

```bash
# Navigate to a project directory
cd ~/your-project

# Start Nanocoder
nanocoder
```

### 6.3 Verify Local-Only Operation

```bash
# Inside Nanocoder, check status
/status

# Should show only local providers
/provider

# Test basic prompt
> Hello, can you see this message?
```

### 6.4 Network Verification

```bash
# Monitor network connections (in separate terminal)
lsof -i -n -P | grep -E "(nanocoder|ollama|llama|mlx)"

# Should only show localhost connections
```

**Checklist - Phase 6:**
- [ ] Backend API responding correctly
- [ ] Nanocoder starts without errors
- [ ] Can select local provider
- [ ] Can send prompts and receive responses
- [ ] No external network connections detected

---

## Phase 7: Production Deployment

### 7.1 Create Startup Scripts

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
chmod +x ~/bin/start-ai-coding.sh
```

### 7.2 Create Shutdown Script

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

### 7.3 Optional: LaunchAgent for Auto-Start

Create `~/Library/LaunchAgents/com.nanocoder.backend.plist`:

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
        <string>-c</string>
        <string>source ~/.venv/nanocoder/bin/activate && mlx_lm.server --model mlx-community/Qwen2.5-Coder-32B-Instruct-4bit --port 8080</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
</dict>
</plist>
```

Load the LaunchAgent:
```bash
launchctl load ~/Library/LaunchAgents/com.nanocoder.backend.plist
```

### 7.4 Firewall Configuration (Maximum Privacy)

```bash
# Block application from internet (optional)
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --add $(which nanocoder)
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --blockapp $(which nanocoder)
```

**Checklist - Phase 7:**
- [ ] Startup script created and tested
- [ ] Shutdown script created and tested
- [ ] (Optional) LaunchAgent configured
- [ ] (Optional) Firewall configured
- [ ] System runs reliably on restart

---

## Framework Template

Use this template to plan your deployment:

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

## Troubleshooting

### Common Issues

| Problem | Cause | Solution |
|---------|-------|----------|
| "Connection refused" | Backend not running | Start inference backend first |
| Slow responses | Model too large | Use smaller model or Q4 quantization |
| Out of memory | Insufficient RAM | Close apps, use smaller model |
| Model loops | Context too small | Increase context size (8192+) |
| "Model not found" | Wrong model name | Check model name in backend |

### Debug Commands

```bash
# Check if backend is running
lsof -i :8080
lsof -i :11434

# Check memory usage
top -o MEM

# Check Nanocoder logs
# (Logs are displayed in terminal)

# Test API directly
curl http://localhost:8080/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "mlx-community/Qwen2.5-Coder-32B-Instruct-4bit",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

### Getting Help

- **Documentation**: [docs/m4-max-private-setup.md](./m4-max-private-setup.md)
- **GitHub Issues**: Report bugs and request features
- **Discord**: Join the community for real-time help

---

## Quick Reference Card

```
┌────────────────────────────────────────────────────────────┐
│                 NANOCODER QUICK REFERENCE                   │
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
└────────────────────────────────────────────────────────────┘
```

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | November 2025 | Initial release |

## Related Documentation

- [M4 Max Private Setup Guide](./m4-max-private-setup.md)
- [MCP Configuration Guide](./mcp-configuration.md)
- [Contributing Guide](../CONTRIBUTING.md)
- [README](../README.md)
