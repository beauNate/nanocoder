/**
 * Model Backend Management System
 *
 * Provides built-in support for installing, downloading, and managing
 * local AI model backends (MLX-LM, llama.cpp, Ollama) without requiring
 * external tools or manual setup.
 *
 * This makes Nanocoder a complete, IDE-agnostic AI coding solution that
 * can run entirely offline with local models.
 */

export * from './types.js';
export * from './installer.js';
export * from './server-manager.js';

export {checkBackendInstallation, installBackend, downloadModel, getInstallationInstructions} from './installer.js';
export {startServer, stopServer, getRunningServers, stopAllServers, getRecommendedConfig, getDefaultPort} from './server-manager.js';
