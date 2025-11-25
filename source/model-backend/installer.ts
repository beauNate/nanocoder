import {exec} from 'node:child_process';
import {promisify} from 'node:util';
import type {BackendInstallation, BackendType} from './types.js';

const execAsync = promisify(exec);

/**
 * Check if a backend is installed on the system
 */
export async function checkBackendInstallation(
	backend: BackendType,
): Promise<BackendInstallation> {
	try {
		switch (backend) {
			case 'mlx-lm': {
				try {
					const {stdout} = await execAsync('python3 -m pip show mlx-lm');
					const versionMatch = stdout.match(/Version: (.+)/);
					return {
						type: 'mlx-lm',
						installed: true,
						version: versionMatch?.[1],
					};
				} catch {
					return {
						type: 'mlx-lm',
						installed: false,
					};
				}
			}

			case 'llama-cpp': {
				try {
					const {stdout} = await execAsync('which llama-server');
					const path = stdout.trim();
					let version: string | undefined;
					try {
						const {stdout: versionOutput} =
							await execAsync('llama-server --version');
						version = versionOutput.trim();
					} catch {
						// Version command might not be available
					}
					return {
						type: 'llama-cpp',
						installed: true,
						version,
						path,
					};
				} catch {
					return {
						type: 'llama-cpp',
						installed: false,
					};
				}
			}

			case 'ollama': {
				try {
					const {stdout} = await execAsync('ollama --version');
					const version = stdout.trim();
					return {
						type: 'ollama',
						installed: true,
						version,
					};
				} catch {
					return {
						type: 'ollama',
						installed: false,
					};
				}
			}

			default:
				throw new Error(`Unknown backend type: ${backend}`);
		}
	} catch (error) {
		return {
			type: backend,
			installed: false,
		};
	}
}

/**
 * Get installation instructions for a backend
 */
export function getInstallationInstructions(backend: BackendType): string {
	switch (backend) {
		case 'mlx-lm':
			return `
To install MLX-LM (optimized for Apple Silicon):

1. Create a virtual environment (recommended):
   python3 -m venv ~/.venv/nanocoder
   source ~/.venv/nanocoder/bin/activate

2. Install MLX-LM:
   pip install mlx-lm

3. Verify installation:
   python3 -c "import mlx_lm; print('MLX-LM installed successfully')"

MLX-LM provides the best performance on Apple Silicon devices.
		`.trim();

		case 'llama-cpp':
			return `
To install llama.cpp server:

Using Homebrew (macOS/Linux):
   brew install llama.cpp

Or build from source:
   git clone https://github.com/ggerganov/llama.cpp
   cd llama.cpp
   make

llama.cpp provides excellent performance with GGUF models.
		`.trim();

		case 'ollama':
			return `
To install Ollama:

Using Homebrew (macOS/Linux):
   brew install ollama

Or download from: https://ollama.ai

Ollama provides the easiest model management experience.
		`.trim();

		default:
			return `Unknown backend: ${backend}`;
	}
}

/**
 * Attempt to install a backend automatically
 */
export async function installBackend(
	backend: BackendType,
	onProgress?: (message: string) => void,
): Promise<{success: boolean; message: string}> {
	try {
		onProgress?.(`Installing ${backend}...`);

		switch (backend) {
			case 'mlx-lm': {
				onProgress?.('Installing MLX-LM via pip...');
				const {stdout, stderr} = await execAsync('pip install mlx-lm');
				if (stderr && !stderr.includes('Successfully installed')) {
					return {
						success: false,
						message: `Installation failed: ${stderr}`,
					};
				}
				onProgress?.('MLX-LM installed successfully!');
				return {
					success: true,
					message: 'MLX-LM installed successfully',
				};
			}

			case 'llama-cpp': {
				// Try Homebrew first
				onProgress?.('Checking for Homebrew...');
				try {
					await execAsync('which brew');
					onProgress?.('Installing llama.cpp via Homebrew...');
					const {stdout, stderr} = await execAsync('brew install llama.cpp');
					if (stderr && !stderr.toLowerCase().includes('success')) {
						return {
							success: false,
							message: `Installation failed: ${stderr}`,
						};
					}
					onProgress?.('llama.cpp installed successfully!');
					return {
						success: true,
						message: 'llama.cpp installed successfully',
					};
				} catch {
					return {
						success: false,
						message:
							'Homebrew not found. Please install llama.cpp manually or install Homebrew first.',
					};
				}
			}

			case 'ollama': {
				// Try Homebrew first
				onProgress?.('Checking for Homebrew...');
				try {
					await execAsync('which brew');
					onProgress?.('Installing Ollama via Homebrew...');
					const {stdout, stderr} = await execAsync('brew install ollama');
					if (stderr && !stderr.toLowerCase().includes('success')) {
						return {
							success: false,
							message: `Installation failed: ${stderr}`,
						};
					}
					onProgress?.('Ollama installed successfully!');
					return {
						success: true,
						message: 'Ollama installed successfully',
					};
				} catch {
					return {
						success: false,
						message:
							'Homebrew not found. Please install Ollama manually from https://ollama.ai',
					};
				}
			}

			default:
				return {
					success: false,
					message: `Unknown backend: ${backend}`,
				};
		}
	} catch (error) {
		return {
			success: false,
			message: `Installation failed: ${error instanceof Error ? error.message : String(error)}`,
		};
	}
}

/**
 * Download a model for a specific backend
 */
export async function downloadModel(
	backend: BackendType,
	modelName: string,
	onProgress?: (message: string) => void,
): Promise<{success: boolean; message: string; modelPath?: string}> {
	try {
		switch (backend) {
			case 'mlx-lm': {
				onProgress?.(`Downloading MLX model: ${modelName}...`);
				// MLX models are downloaded automatically on first use
				// We can pre-download by loading the model
				const command = `python3 -c "from mlx_lm import load; load('${modelName}')"`;
				const {stdout, stderr} = await execAsync(command);
				if (stderr && !stderr.includes('Loading')) {
					return {
						success: false,
						message: `Download failed: ${stderr}`,
					};
				}
				onProgress?.('Model downloaded successfully!');
				return {
					success: true,
					message: `MLX model ${modelName} is ready`,
					modelPath: modelName,
				};
			}

			case 'ollama': {
				onProgress?.(`Downloading Ollama model: ${modelName}...`);
				const {stdout, stderr} = await execAsync(`ollama pull ${modelName}`);
				if (stderr && stderr.toLowerCase().includes('error')) {
					return {
						success: false,
						message: `Download failed: ${stderr}`,
					};
				}
				onProgress?.('Model downloaded successfully!');
				return {
					success: true,
					message: `Ollama model ${modelName} is ready`,
					modelPath: modelName,
				};
			}

			case 'llama-cpp': {
				return {
					success: false,
					message:
						'llama.cpp requires manual model download. Please download GGUF models from Hugging Face.',
				};
			}

			default:
				return {
					success: false,
					message: `Unknown backend: ${backend}`,
				};
		}
	} catch (error) {
		return {
			success: false,
			message: `Download failed: ${error instanceof Error ? error.message : String(error)}`,
		};
	}
}
