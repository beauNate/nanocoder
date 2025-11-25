# M4 Max Private AI Coding Setup Guide

A comprehensive guide for setting up a fully private, offline AI coding environment on Apple M4 Max with 36GB unified memory. This configuration ensures complete data privacy with no outgoing network connections.

## Hardware Specifications

| Component | Specification |
|-----------|---------------|
| **Chip** | Apple M4 Max |
| **Unified Memory** | 36GB |
| **Architecture** | Apple Silicon (ARM64) |
| **GPU** | Integrated (30-40 core) |

The unified memory architecture allows models to leverage both CPU and GPU memory seamlessly, enabling larger models than traditional discrete GPU setups with similar VRAM.

## Recommended Local Models (November 2025)

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

## Local Inference Tool Comparison

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

**Installation:**
```bash
pip install mlx-lm
```

**Usage with Nanocoder:**
MLX-LM can be exposed via an OpenAI-compatible server:
```bash
mlx_lm.server --model mlx-community/Qwen2.5-Coder-32B-Instruct-4bit --port 8080
```

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

**Installation:**
```bash
brew install ollama
```

**Usage:**
```bash
ollama pull qwen2.5-coder:32b-instruct-q4_K_M
ollama serve
```

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

**Installation:**
```bash
brew install llama.cpp
```

**Usage:**
```bash
llama-server -m /path/to/model.gguf --port 8080 --ctx-size 8192
```

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

## Nanocoder Configuration for Complete Privacy

### agents.config.json (Local-Only Setup)

Create this file in your project directory or `~/.config/nanocoder/`:

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

### Network Isolation (Complete Privacy)

To ensure no outgoing connections, this configuration:

1. **Only uses localhost URLs** - All providers point to `localhost`
2. **No cloud providers** - OpenRouter, OpenAI, etc. are excluded
3. **No MCP remote servers** - Only local MCP servers if needed
4. **No API keys required** - Local models don't need authentication

### Optional: Local-Only MCP Servers

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

## Quick Start Guide

### Step 1: Choose Your Inference Tool

**For Maximum Performance (MLX-LM):**
```bash
# Install MLX-LM
pip install mlx-lm

# Download and run Qwen2.5-Coder 32B
mlx_lm.server --model mlx-community/Qwen2.5-Coder-32B-Instruct-4bit --port 8080
```

**For Ease of Use (Ollama):**
```bash
# Install Ollama
brew install ollama

# Start Ollama service
ollama serve

# In another terminal, pull the model
ollama pull qwen2.5-coder:32b-instruct-q4_K_M
```

### Step 2: Configure Nanocoder

Create `~/.config/nanocoder/agents.config.json` with the local-only configuration above.

### Step 3: Start Coding

```bash
# Navigate to your project
cd /path/to/your/project

# Start Nanocoder
nanocoder
```

### Step 4: Select Local Provider

Use `/provider` command to select your local inference tool, then `/model` to choose your model.

## Memory Management Tips

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
```

## Firewall Configuration (Optional)

For absolute network isolation, configure macOS firewall:

```bash
# Block Nanocoder from internet access
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --add /path/to/nanocoder
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --blockapp /path/to/nanocoder
```

Or use Little Snitch/Lulu to monitor and block all outgoing connections.

## Troubleshooting

### Model Repeating Tool Calls

**Cause:** Insufficient context length
**Solution:** Increase context size in your inference tool:
- Ollama: `OLLAMA_NUM_CTX=8192`
- llama.cpp: `--ctx-size 8192`
- MLX-LM: Model-dependent

### Slow Inference

**Cause:** Memory pressure from other apps
**Solution:** Close memory-heavy applications, use smaller quantization

### Out of Memory

**Cause:** Model too large
**Solution:** Use Q4 instead of Q8, or choose smaller model

## Deployment Checklist

- [ ] Install inference tool (MLX-LM or Ollama recommended)
- [ ] Download appropriate model for your RAM
- [ ] Create local-only `agents.config.json`
- [ ] Verify no cloud providers in configuration
- [ ] Test inference server is running (`curl localhost:8080/v1/models`)
- [ ] Start Nanocoder and select local provider
- [ ] (Optional) Configure firewall for complete isolation
- [ ] (Optional) Set up local-only MCP servers

## Version Information

- **Guide Version:** 1.0
- **Last Updated:** November 2025
- **Tested On:** M4 Max 36GB, macOS Sequoia

## Related Documentation

- [MCP Configuration Guide](./mcp-configuration.md)
- [README - AI Provider Setup](../README.md#ai-provider-setup)
- [README - User Preferences](../README.md#user-preferences)
