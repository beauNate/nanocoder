export type BackendType = 'mlx-lm' | 'llama-cpp' | 'ollama';

export interface BackendInstallation {
	type: BackendType;
	installed: boolean;
	version?: string;
	path?: string;
}

export interface ModelDownloadOptions {
	backend: BackendType;
	modelName: string;
	quantization?: string;
	outputPath?: string;
}

export interface ServerConfig {
	backend: BackendType;
	modelPath: string;
	port: number;
	contextSize?: number;
	gpuLayers?: number;
}

export interface ServerProcess {
	backend: BackendType;
	pid: number;
	port: number;
	modelPath: string;
	status: 'starting' | 'running' | 'stopping' | 'stopped' | 'error';
}
