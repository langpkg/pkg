// src/core/common/index.ts
//
// Made with ❤️ by Maysara.



// ╔════════════════════════════════════════ PACK ════════════════════════════════════════╗

    import { PkgError }    from './types';
    import { print }       from '../utils/ui';
    import * as path       from 'path';
    import * as fs         from 'fs';
    import process         from 'process';
    export *               from './types';

// ╚══════════════════════════════════════════════════════════════════════════════════════╝



// ╔════════════════════════════════════════ FILE ════════════════════════════════════════╗

    export function resolvePath(filePath: string): string {
        return path.isAbsolute(filePath) ? filePath : path.join(process.cwd(), filePath);
    }

    export function isFileExists(filePath: string): boolean {
        try {
            return fs.existsSync(resolvePath(filePath));
        } catch {
            return false;
        }
    }

    export function isDirExists(dirPath: string): boolean {
        try {
            const resolved = resolvePath(dirPath);
            return fs.existsSync(resolved) && fs.statSync(resolved).isDirectory();
        } catch {
            return false;
        }
    }

    export function readFile(filePath: string): string {
        const targetPath = resolvePath(filePath);

        if (!fs.existsSync(targetPath)) {
            throw new PkgError(`File not found: ${targetPath}`, 'FILE_NOT_FOUND', {
                path    : targetPath,
            });
        }

        try {
            return fs.readFileSync(targetPath, 'utf-8');
        } catch (error) {
            throw new PkgError(`Failed to read file: ${targetPath}`, 'FILE_READ_ERROR', {
                path    : targetPath,
                cause   : String(error),
            });
        }
    }

    export function writeFile(filePath: string, content: string): void {
        const targetPath    = resolvePath(filePath);
        const dir           = path.dirname(targetPath);

        try {
            if (!fs.existsSync(dir)) { fs.mkdirSync(dir, { recursive: true }); }
            fs.writeFileSync(targetPath, content, 'utf-8');
        } catch (error) {
            throw new PkgError(`Failed to write file: ${targetPath}`, 'FILE_WRITE_ERROR', {
                path    : targetPath,
                cause   : String(error),
            });
        }
    }

    // Save file with new content (overwrite) always.
    export function saveFile(filepath: string, content: string): boolean {
        try {
            // only write if content changed to avoid unnecessary disk writes
            const currentContent = isFileExists(filepath) ? readFile(filepath) : null;
            if (currentContent === content) return false;
            fs.writeFileSync(filepath, content, 'utf-8');
            return true;
        } catch {
            // Silently ignore write errors
            return false;
        }
    }

// ╚══════════════════════════════════════════════════════════════════════════════════════╝



// ╔════════════════════════════════════════ PROC ════════════════════════════════════════╗

    export function getCwd(): string {
        return process.cwd();
    }

    export function sleep(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    export function createDir(dirPath: string): void {
        const fullPath = path.resolve(getCwd(), dirPath);
        fs.mkdirSync(fullPath, { recursive: true });
    }

    /**
    * Strip ANSI color codes from a string.
    */
    function stripAnsiCodes(str: string): string {
        // eslint-disable-next-line no-control-regex
        return str.replace(/\x1b\[[0-9;]*m/g, '');
    }

    /**
    * Filter out bun version banner line from output.
    * Bun outputs lines like:
    * - "bun v1.3.1 (89fa0f34)"
    * - "bun update v1.3.1 (89fa0f34)"
    * - "bun publish v1.3.1 (89fa0f34)"
    * etc.
    */
    export function isBunBannerLine(line: string): boolean {
        const stripped = stripAnsiCodes(line.trim());
        return /^bun\s+(?:update|publish|add|remove|install|link|unlink|test)?\s*v\d+\.\d+\.\d+\s*\([a-f0-9]+\)$/.test(stripped);
    }
    /**
    * Check if a line is unnecessary bun status output that should be hidden.
    * Keep only error/warning lines and actual output, hide status messages.
    */
    export function isBunStatusMessage(line: string): boolean {
        const trimmed = stripAnsiCodes(line.trim());

        // Hide status/progress messages
        if (/^Resolving/i                           .test(trimmed)) return true;
        if (/^Resolved.*downloaded and extracted/i  .test(trimmed)) return true;
        if (/^Saved lockfile/i                      .test(trimmed)) return true;
        if (/^Checked \d+/i                         .test(trimmed)) return true;
        if (/^Packages moved/i                      .test(trimmed)) return true;
        if (/^copied to node_modules/i              .test(trimmed)) return true;
        if (/^installed in/i                        .test(trimmed)) return true;
        if (/^\d+ packages? installed/i             .test(trimmed)) return true;
        if (/^\[\d+(\.\d+)?(ms|s)?\] done$/i        .test(trimmed)) return true;

        // Hide lines that are just time/number info like "[1354.00ms]" or "[18]"
        if (/^\[\d+(\.\d+)?(ms|s)?\]$/              .test(trimmed)) return true;

        return false;
    }

// ╚══════════════════════════════════════════════════════════════════════════════════════╝



// ╔════════════════════════════════════════ HELP ════════════════════════════════════════╗

    export function cmdCancelled(commandName: string): void {
        print.nl();
        print.info(`The ${commandName} process was cancelled.`);
        print.nl();
    }

// ╚══════════════════════════════════════════════════════════════════════════════════════╝
