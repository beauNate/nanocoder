import {spawn, exec} from 'node:child_process';
import {promisify} from 'node:util';
import type {ServerConfig, ServerProcess, BackendType} from './types.js';

const execAsync = promisify(exec);

const runningServers = new Map<number, ServerProcess>();

/**
 * Start a model server for the specified backend
 */
export async function startServer(
	config: ServerConfig,
	onOutput?: (message: string) => void,
): Promise<{success: boolean; message: string; process?: ServerProcess}> {
	try {
		const {backend, modelPath, port, contextSize = 8192, gpuLayers = 999} = config;

		// Check if port is already in use
		const portInUse = await isPortInUse(port);
		if (portInUse) {
			return {
				success: false,
				message: `Port ${port} is already in use. Please choose a different port or stop the existing server.`,
			};
		}

		let command: string;
		let args: string[];

		switch (backend) {
			case 'mlx-lm': {
				command = 'python3';
				args = [
					'-m',
					'mlx_lm.server',
					'--model',
					modelPath,
					'--port',
					String(port),
				];
				break;
			}

			case 'llama-cpp': {
				command = 'llama-server';
				args = [
					'-m',
					modelPath,
					'--port',
					String(port),
					'--ctx-size',
					String(contextSize),
					'--n-gpu-layers',
					String(gpuLayers),
				];
				break;
			}

			case 'ollama': {
				// Ollama runs as a service, we just need to ensure it's started
				try {
					await execAsync('ollama serve &');
					const serverProcess: ServerProcess = {
						backend: 'ollama',
						pid: -1, // Service doesn't have a specific PID we manage
						port: 11434,
						modelPath,
						status: 'running',
					};
					runningServers.set(-1, serverProcess);
					return {
						success: true,
						message: 'Ollama service is running',
						process: serverProcess,
					};
				} catch (error) {
					return {
						success: false,
						message: `Failed to start Ollama: ${error instanceof Error ? error.message : String(error)}`,
					};
				}
			}

			default:
				return {
					success: false,
					message: `Unknown backend: ${backend}`,
				};
		}

		onOutput?.(`Starting ${backend} server on port ${port}...`);

		const childProcess = spawn(command, args, {
			detached: false,
			stdio: ['ignore', 'pipe', 'pipe'],
		});

		const serverProcess: ServerProcess = {
			backend,
			pid: childProcess.pid!,
			port,
			modelPath,
			status: 'starting',
		};

		runningServers.set(childProcess.pid!, serverProcess);

		// Handle process output
		childProcess.stdout?.on('data', data => {
			const message = data.toString();
			onOutput?.(message);
			if (message.includes('ready') || message.includes('listening')) {
				serverProcess.status = 'running';
			}
		});

		childProcess.stderr?.on('data', data => {
			const message = data.toString();
			onOutput?.(message);
			if (message.toLowerCase().includes('error')) {
				serverProcess.status = 'error';
			}
		});

		childProcess.on('exit', code => {
			serverProcess.status = 'stopped';
			runningServers.delete(childProcess.pid!);
			onOutput?.(
				`Server exited with code ${code}${code === 0 ? '' : ' (error)'}`,
			);
		});

		// Wait a bit for the server to start
		await new Promise(resolve => setTimeout(resolve, 2000));

		// Verify server is running
		const isRunning = await isPortInUse(port);
		if (isRunning) {
			serverProcess.status = 'running';
			return {
				success: true,
				message: `${backend} server started successfully on port ${port}`,
				process: serverProcess,
			};
		} else {
			serverProcess.status = 'error';
			return {
				success: false,
				message: `Server failed to start. Check the logs for details.`,
			};
		}
	} catch (error) {
		return {
			success: false,
			message: `Failed to start server: ${error instanceof Error ? error.message : String(error)}`,
		};
	}
}

/**
 * Stop a running server
 */
export async function stopServer(
	pid: number,
): Promise<{success: boolean; message: string}> {
	try {
		const serverProcess = runningServers.get(pid);
		if (!serverProcess) {
			return {
				success: false,
				message: `No server found with PID ${pid}`,
			};
		}

		serverProcess.status = 'stopping';

		if (serverProcess.backend === 'ollama' && pid === -1) {
			// Don't stop Ollama service as it might be used by other applications
			return {
				success: true,
				message:
					'Ollama service is system-wide. Use "ollama stop" manually if needed.',
			};
		}

		// Try graceful shutdown first
		process.kill(pid, 'SIGTERM');

		// Wait a bit for graceful shutdown
		await new Promise(resolve => setTimeout(resolve, 2000));

		// Force kill if still running
		try {
			process.kill(pid, 'SIGKILL');
		} catch {
			// Process already stopped
		}

		runningServers.delete(pid);

		return {
			success: true,
			message: 'Server stopped successfully',
		};
	} catch (error) {
		return {
			success: false,
			message: `Failed to stop server: ${error instanceof Error ? error.message : String(error)}`,
		};
	}
}

/**
 * Get all running servers
 */
export function getRunningServers(): ServerProcess[] {
	return Array.from(runningServers.values());
}

/**
 * Stop all running servers
 */
export async function stopAllServers(): Promise<void> {
	const pids = Array.from(runningServers.keys());
	await Promise.all(pids.map(pid => stopServer(pid)));
}

/**
 * Check if a port is in use
 */
async function isPortInUse(port: number): Promise<boolean> {
	try {
		const {stdout} = await execAsync(
			`lsof -i :${port} -t || netstat -an | grep ${port} | grep LISTEN`,
		);
		return stdout.trim().length > 0;
	} catch {
		return false;
	}
}

/**
 * Get recommended server configuration for a backend
 */
export function getRecommendedConfig(
	backend: BackendType,
	modelPath: string,
): ServerConfig {
	const basePort = getDefaultPort(backend);

	return {
		backend,
		modelPath,
		port: basePort,
		contextSize: 8192,
		gpuLayers: 999,
	};
}

/**
 * Get default port for a backend
 */
export function getDefaultPort(backend: BackendType): number {
	switch (backend) {
		case 'mlx-lm':
			return 8080;
		case 'llama-cpp':
			return 8080;
		case 'ollama':
			return 11434;
		default:
			return 8080;
	}
}
