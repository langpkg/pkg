// src/core/utils/cache.ts
//
// Uses SHA256 content hashing to detect changes (immune to mtime/size variations).
//
// Made with ❤️ by Maysara.



// ╔════════════════════════════════════════ PACK ════════════════════════════════════════╗

    import { readFileSync, writeFileSync, existsSync, mkdirSync }    from 'fs';
    import { join, relative, isAbsolute }                            from 'path';
    import { createHash }                                            from 'crypto';

// ╚══════════════════════════════════════════════════════════════════════════════════════╝



// ╔════════════════════════════════════════ TYPE ════════════════════════════════════════╗

    export interface FileState {
        hash      : string; // SHA256 hash of file content
    }

    export interface CacheState {
        timestamp : number;
        files     : Record<string, FileState>;
    }

// ╚══════════════════════════════════════════════════════════════════════════════════════╝



// ╔════════════════════════════════════════ MAIN ════════════════════════════════════════╗

    export class CacheManager {

        // ┌──────────────────────────────── INIT ──────────────────────────────┐

            private cacheDir        : string;
            private cacheFile       : string;
            private cache           : CacheState | null = null;
            private dirty           = false;
            private initialized     = false;

            constructor() {
                this.cacheDir       = join(process.cwd(), '.pkg');
                this.cacheFile      = join(this.cacheDir, 'cache');
            }

        // └────────────────────────────────────────────────────────────────────┘


        // ┌──────────────────────────────── MAIN ──────────────────────────────┐

            /**
            * Initialize cache system
            * Must be called before using cache
            * Automatically validates and recovers from corrupted state
            */
            public initialize(): void {
                try {
                    // Ensure cache directory exists
                    if (!existsSync(this.cacheDir)) {
                        mkdirSync(this.cacheDir, { recursive: true });
                    }
                    // Try to load existing cache
                    if (existsSync(this.cacheFile)) {
                        try {
                            const content = readFileSync(this.cacheFile, 'utf-8');
                            this.cache = JSON.parse(content);
                        } catch {
                            // Cache corrupted - create new one
                            this.cache = this.createNewCache();
                            this.dirty = true;
                        }
                    } else {
                        // First run - create new cache
                        this.cache = this.createNewCache();
                        this.dirty = true;
                    }
                    this.initialized = true;
                } catch {
                    // Fallback: operate without cache on initialization failure
                    this.cache = this.createNewCache();
                    this.initialized = true;
                }
            }

        // └────────────────────────────────────────────────────────────────────┘


        // ┌──────────────────────────────── CORE ──────────────────────────────┐

            /**
            * Check if file should be formatted based on cache
            * Compares current file content hash with cached hash
            * Returns true if:
            * - File not in cache, OR
            * - File content hash changed
            */
            public shouldFormat(filepath: string): boolean {
                if (!this.initialized || !this.cache) {
                    return true;
                }
                const normalizedPath = this.normalizePath(filepath);
                try {
                    const content = readFileSync(filepath, 'utf-8');
                    const currentHash = this.hashContent(content);
                    const cachedState = this.cache.files[normalizedPath];
                    // Not in cache = needs formatting
                    if (!cachedState) {
                        return true;
                    }
                    // Hash matches = skip formatting
                    if (cachedState.hash === currentHash) {
                        return false;
                    }
                    // Hash changed = needs formatting
                    return true;
                } catch {
                    // If we can't read the file, format it to be safe
                    return true;
                }
            }

            /**
            * Mark file as formatted in cache
            * Records the file's current content hash
            */
            public markFormatted(filepath: string): void {
                if (!this.initialized || !this.cache) {
                    return;
                }
                const normalizedPath = this.normalizePath(filepath);
                try {
                    const content = readFileSync(filepath, 'utf-8');
                    const hash = this.hashContent(content);
                    this.cache.files[normalizedPath] = { hash };
                    this.dirty = true;
                } catch {
                    // Silently ignore if file can't be read
                    // It will be re-formatted next time
                }
            }

            /**
            * Save cache to disk
            * Formats cache as JSON before saving
            */
            public save(): void {
                if (!this.initialized || !this.cache || !this.dirty) {
                    if (!this.dirty) {
                        // ...
                    }
                    return;
                }

                try {
                    // Ensure cache directory exists
                    if (!existsSync(this.cacheDir)) {
                        mkdirSync(this.cacheDir, { recursive: true });
                    }

                    // Update timestamp
                    this.cache.timestamp = Date.now();

                    // Format cache as clean JSON
                    const formattedContent = this.formatCacheJson(this.cache);

                    // Write directly to cache file
                    writeFileSync(this.cacheFile, formattedContent, 'utf-8');
                    this.dirty = false;
                } catch {
                    // Silently fail - cache is optional, formatting continues
                }
            }

            /**
            * Format cache object as clean JSON for output
            */
            private formatCacheJson(cache: CacheState): string {
                const jsonData = {
                    timestamp   : cache.timestamp,
                    files       : cache.files,
                };

                // Format as pretty-printed JSON
                let json = JSON.stringify(jsonData, null, 2);

                // Add trailing newline
                if (!json.endsWith('\n')) {
                    json += '\n';
                }

                return json;
            }

            /**
            * Clear entire cache
            */
            public clear(): void {
                if (!this.initialized) return;
                this.cache = this.createNewCache();
                this.dirty = true;
                this.save();
            }

            /**
            * Cleanup cache: remove entries for files that no longer exist
            * AND merge duplicate entries with different path formats
            * Safe operation - only removes missing files from cache
            * Useful to prevent cache from growing indefinitely
            */
            public cleanup(): void {
                if (!this.initialized || !this.cache) return;

                const filesToRemove: string[] = [];
                const pathMap = new Map<string, string>(); // Maps canonical path to first key found

                for (const filepath of Object.keys(this.cache.files)) {
                    try {
                        // Skip entries for files that don't exist
                        if (!existsSync(filepath)) {
                            // But check if it's an absolute-ish path that should be relative
                            // Try to interpret it as a path and see if it exists
                            let found = false;
                            // If path contains :// or has a drive letter, try converting it
                            if (filepath.includes(':/')) {
                                const relativePath =
                                './' +
                                filepath
                                // eslint-disable-next-line no-useless-escape
                                .split(/[\/\\]/)
                                .slice(-2)
                                .join('/');
                                if (existsSync(relativePath)) {
                                    found = true;
                                }
                            }
                            if (!found) {
                                filesToRemove.push(filepath);
                            }
                        } else {
                            // File exists - check if we have duplicates (same file, different paths)
                            const canonicalPath = this.normalizePath(filepath);
                            if (pathMap.has(canonicalPath)) {
                                // We've seen this file before under a different key - mark old entry for removal
                                const existingKey = pathMap.get(canonicalPath)!;
                                if (existingKey !== filepath) {
                                    filesToRemove.push(filepath);
                                }
                            } else {
                                pathMap.set(canonicalPath, filepath);
                            }
                        }
                    } catch {
                        // On error, keep in cache (better safe than sorry)
                    }
                }

                if (filesToRemove.length > 0) {
                    for (const filepath of filesToRemove) {
                        delete this.cache.files[filepath];
                    }
                    this.dirty = true;
                    this.save();
                }
            }

            /**
            * Load cache from disk and return raw state
            * Used by format checker to ensure we have latest cache state
            * Also cleans up any old path formats
            */
            public loadFromDisk(): void {
                try {
                    if (existsSync(this.cacheFile)) {
                        const content = readFileSync(this.cacheFile, 'utf-8');
                        this.cache = JSON.parse(content);

                        // Clean up any old-format paths (with ./ prefix) to new format
                        if (this.cache && this.cache.files && typeof this.cache.files === 'object') {
                            let hasOldPaths = false;
                            const cleanedFiles: Record<string, FileState> = {};

                            for (const [path, state] of Object.entries(this.cache.files)) {
                                let cleanPath = path;
                                if (cleanPath.startsWith('./')) {
                                    cleanPath = cleanPath.substring(2);
                                    hasOldPaths = true;
                                }
                                cleanedFiles[cleanPath] = state as FileState;
                            }

                            if (hasOldPaths) {
                                this.cache.files = cleanedFiles;
                                this.dirty = true;
                                this.save(); // Save cleaned-up cache
                            }
                        }
                    }
                } catch {
                    // Ignore parse errors, cache stays as-is
                }
            }

        // └────────────────────────────────────────────────────────────────────┘


        // ┌──────────────────────────────── HELP ──────────────────────────────┐

            /**
            * Calculate SHA256 hash of file content
            * Fast content-based change detection
            */
            private hashContent(content: string): string {
                return createHash('sha256').update(content).digest('hex');
            }

            /**
            * Normalize file paths for consistency
            * CRITICAL: Must match prettier.ts file collection logic exactly
            * - Converts absolute paths to relative
            * - Uses forward slashes only
            * - No leading ./  (matches prettier's path.join output)
            */
            private normalizePath(filepath: string): string {
                try {
                    let normalized: string;

                    // Step 1: Convert absolute to relative
                    if (isAbsolute(filepath)) {
                        normalized = relative(process.cwd(), filepath);
                    } else {
                        normalized = filepath;
                    }

                    // Step 2: Normalize backslashes to forward slashes
                    normalized = normalized.replace(/\\/g, '/');

                    // Step 3: Remove leading ./ if present (prettier.ts uses path.join which doesn't add ./)
                    if (normalized.startsWith('./')) {
                        normalized = normalized.substring(2);
                    }

                    // Step 4: Remove any double slashes
                    normalized = normalized.replace(/\/+/g, '/');

                    return normalized;
                } catch {
                    return filepath;
                }
            }

            /**
            * Create new empty cache state
            */
            private createNewCache(): CacheState {
                return {
                    timestamp: Date.now(),
                    files: {},
                };
            }

        // └────────────────────────────────────────────────────────────────────┘

    }

// ╚══════════════════════════════════════════════════════════════════════════════════════╝
