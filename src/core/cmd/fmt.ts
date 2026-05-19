// src/core/cmd/fmt.ts
//
// Made with ❤️ by Maysara.



// ╔════════════════════════════════════════ PACK ════════════════════════════════════════╗

    import { isFileExists, isDirExists, readFile, saveFile,
             CommandParams, cmdCancelled }                    from '../common';

    import { print, createSpinner, theme }                    from '../utils/ui';
    import { CacheManager }                                   from '../utils/cache';
    import { formatTS, formatJSON, formatMD, FormatIssue }    from '@langpkg/mcs_fmt';
    import { resolve, isAbsolute, join }                      from 'path';
    import { readdirSync }                                    from 'fs';
    import { glob }                                           from 'glob';

// ╚══════════════════════════════════════════════════════════════════════════════════════╝



// ╔════════════════════════════════════════ TYPE ════════════════════════════════════════╗

    export interface FmtCommandParams extends CommandParams {
        args       : {
            path?  : string; // file, directory, or empty for current dir
        };
        options    : {
            clean? : boolean;
        };
    }

// ╚══════════════════════════════════════════════════════════════════════════════════════╝



// ╔════════════════════════════════════════ CORE ════════════════════════════════════════╗

    export class FmtCommand {

        // ┌──────────────────────────────── INIT ──────────────────────────────┐

            constructor(public params: FmtCommandParams) { }

        // └────────────────────────────────────────────────────────────────────┘


        // ┌──────────────────────────────── MAIN ──────────────────────────────┐

            async run() {
                try {
                    print.nl();

                    // ╭── Initialize cache ──────────────────────────────────────╮

                        const cache = new CacheManager();
                        cache.initialize();

                        if (this.params.options?.clean) {
                            cache.clear();
                        }

                    // ╰──────────────────────────────────────────────────────────╯


                    // ╭── Validate target path ──────────────────────────────────╮

                        const targetPath = resolve(
                            isAbsolute(this.params.args.path || '.')
                            ? this.params.args.path || '.'
                            : this.params.args.path || '.'
                        );

                        if (!isFileExists(targetPath) && !isDirExists(targetPath)) {
                            print.error(`Path not found: ${targetPath}`);
                            print.nl();
                            return;
                        }

                    // ╰──────────────────────────────────────────────────────────╯


                    // ╭── Start spinner ─────────────────────────────────────────╮

                        const spinner = createSpinner(theme.muted('Formatting files...'));
                        spinner.start();

                    // ╰──────────────────────────────────────────────────────────╯


                    // ╭── Collect files to format ───────────────────────────────╮

                        const tsFiles: string[] = [];
                        const jsonFiles: string[] = [];
                        const mdFiles: string[] = [];

                        // Collect TypeScript files from src/, test/, bench/
                        for (const dir of ['src', 'test', 'bench']) {
                            if (isDirExists(dir)) {
                                this.collectTsFiles(dir, tsFiles);
                            }
                        }

                        // Also include root-level TypeScript config files
                        if (isFileExists('eslint.config.mjs')) tsFiles.push('eslint.config.mjs');
                        if (isFileExists('tsup.config.ts')) tsFiles.push('tsup.config.ts');

                        // Collect Markdown files: README and docs/ tree
                        if (isFileExists('README.md')) mdFiles.push('README.md');
                        if (isDirExists('docs')) collectMdFiles('docs', mdFiles);

                    // ╰──────────────────────────────────────────────────────────╯


                    // ╭── SINGLE PHASE: Scan → Fix → Cache ──────────────────────╮

                        let fixedCount = 0;
                        const formattedFiles = new Set<string>();

                        // Process TypeScript files
                        for (const tsFile of tsFiles) {
                            if (!isFileExists(tsFile)) continue;

                            try {
                                // Skip if unchanged
                                if (!cache.shouldFormat(tsFile)) continue;
                                const content  = readFile(tsFile);

                                // format
                                const result = formatTS(content, tsFile);
                                if (result.errors?.length === 0) {
                                    cache.markFormatted(tsFile);
                                    if(saveFile(tsFile, result.formatted)) {
                                        formattedFiles.add(tsFile);
                                        fixedCount += result.count;
                                    }
                                    continue;
                                } else {
                                    // print table of errors with file:line and message
                                    // print.warn(`Warning: ${tsFile} has formatting issues that cannot be auto-fixed.`);
                                    result.errors?.forEach((error) => {
                                        print.warn(`  ${tsFile}:${error.line}:${error.column ?? 0} - ${error.message}`);
                                    });
                                    print.nl();
                                }

                            } catch {
                                // Silently skip unreadable files
                            }
                        }

                        // Process JSON files
                        for (const jsonFile of jsonFiles) {
                            if (!isFileExists(jsonFile)) continue;

                            try {
                                const content = readFile(jsonFile);
                                if (!cache.shouldFormat(jsonFile)) continue;

                                // format
                                const result = formatJSON(content, jsonFile);
                                if (result.errors?.length === 0) {
                                    cache.markFormatted(jsonFile);
                                    if(saveFile(jsonFile, result.formatted)) {
                                        formattedFiles.add(jsonFile);
                                        fixedCount += result.count;
                                    }
                                    continue;
                                } else {
                                    // print.warn(`Warning: ${jsonFile} has formatting issues that cannot be auto-fixed.`);
                                    result.errors?.forEach((error) => {
                                        print.warn(`  ${jsonFile}:${error.line}:${error.column ?? 0} - ${error.message}`);
                                    });
                                    print.nl();
                                }

                            } catch {
                                // Silently skip unreadable files
                            }
                        }

                        // Process Markdown files
                        for (const mdFile of mdFiles) {
                            if (!isFileExists(mdFile)) continue;

                            try {
                                const content = readFile(mdFile);
                                if (!cache.shouldFormat(mdFile)) continue;

                                // format
                                const result = formatMD(content, mdFile);
                                if (result.errors?.length === 0) {
                                    cache.markFormatted(mdFile);
                                    if(saveFile(mdFile, result.formatted)) {
                                        formattedFiles.add(mdFile);
                                        fixedCount += result.count;
                                    }
                                    continue;
                                } else {
                                    // print.warn(`Warning: ${mdFile} has formatting issues that cannot be auto-fixed.`);
                                    result.errors?.forEach((error) => {
                                        print.warn(`  ${mdFile}:${error.line}:${error.column ?? 0} - ${error.message}`);
                                    });
                                    print.nl();
                                }

                            } catch {
                                // Silently skip unreadable files
                            }
                        }

                        // Validate naming conventions (warnings only)
                        const namingIssues: FormatIssue[] = [];
                        for (const dir of ['src', 'test', 'bench']) {
                            if (isDirExists(dir)) {
                                namingIssues.push(...checkNaming(dir));
                            }
                        }

                    // ╰──────────────────────────────────────────────────────────╯


                    // ╭── Stop spinner and report results ───────────────────────╮

                        spinner.stop();

                        if (fixedCount === 0 && namingIssues.length === 0) {
                            print.success('All files formatted correctly.');
                            print.nl();
                            cache.save();
                            return;
                        }

                        if (fixedCount > 0) {
                            print.success(`Fixed ${fixedCount} issue${fixedCount > 1 ? 's' : ''} across ${formattedFiles.size} file${formattedFiles.size > 1 ? 's' : ''}`);
                        }

                        if (namingIssues.length > 0) {
                            print.warn(`Found ${namingIssues.length} naming issue${namingIssues.length > 1 ? 's' : ''} (not auto-fixable)`);
                            for (const issue of namingIssues.slice(0, 5)) {
                                print.info(`  ${this.shortenPath(issue.file)}:${issue.line}  ${issue.message}`);
                            }
                            if (namingIssues.length > 5) {
                                print.info(`  ... and ${namingIssues.length - 5} more`);
                            }
                        }

                        // Save cache
                        cache.save();
                        print.nl();

                    // ╰──────────────────────────────────────────────────────────╯

                } catch { return cmdCancelled('fmt'); }
            }

        // └────────────────────────────────────────────────────────────────────┘


        // ┌──────────────────────────────── HELP ──────────────────────────────┐

            private collectTsFiles(dir: string, result: string[]): void {
                try {
                    const entries = readdirSync(dir, { withFileTypes: true });
                    for (const entry of entries) {
                        const fullPath = join(dir, entry.name);
                        if (entry.isDirectory() && !entry.name.startsWith('.')) {
                            this.collectTsFiles(fullPath, result);
                        } else if (entry.isFile() && entry.name.endsWith('.ts')) {
                            result.push(fullPath);
                        }
                    }
                } catch {
                    // Silently ignore scan errors
                }
            }

            private collectJsonFiles(dir: string, result: string[]): void {
                try {
                    const entries = readdirSync(dir, { withFileTypes: true });
                    for (const entry of entries) {
                        const fullPath = join(dir, entry.name);
                        if (entry.isDirectory() && !entry.name.startsWith('.')) {
                            this.collectJsonFiles(fullPath, result);
                        } else if (entry.isFile() && entry.name.endsWith('.json')) {
                            result.push(fullPath);
                        }
                    }
                } catch {
                    // Silently ignore scan errors
                }
            }

            private shortenPath(filepath: string): string {
                const forwardPath = filepath.replace(/\\/g, '/');
                for (const dir of ['src', 'test', 'bench', '.vscode']) {
                    const idx = forwardPath.indexOf(`/${dir}/`);
                    if (idx !== -1) {
                        return forwardPath.substring(idx + 1);
                    }
                }
                return forwardPath;
            }

        // └────────────────────────────────────────────────────────────────────┘

    }

// ╚══════════════════════════════════════════════════════════════════════════════════════╝



// ╔════════════════════════════════════════ HELP ════════════════════════════════════════╗

    // Collect all .md files from a directory recursively.
    function collectMdFiles(dir: string, result: string[]): void {
        try {
            const entries = readdirSync(dir, { withFileTypes: true });
            for (const entry of entries) {
                const fullPath = join(dir, entry.name);
                if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
                    collectMdFiles(fullPath, result);
                } else if (entry.isFile() && entry.name.endsWith('.md')) {
                    result.push(fullPath);
                }
            }
        } catch {
            // Silently ignore scan errors
        }
    }

    // Helper: Check if a name follows snake_case convention
    function isValidSnakeCase(name: string): boolean {
        return /^[a-z0-9_]+(\.[a-z0-9]+)?$/.test(name);
    }

    // Check file and folder naming conventions (snake_case)
    function checkNaming(dir: string): FormatIssue[] {
        const issues: FormatIssue[] = [];

        try {
            const files = glob.sync(`${dir}/**/*.ts`, { dot: false });

            for (const filepath of files) {
                // Extract file name without extension
                const fileName = filepath.split(/[\\/]/).pop() ?? '';
                const nameWithoutExt = fileName.replace(/\.ts$/, '');

                // Check file naming
                if (!isValidSnakeCase(nameWithoutExt)) {
                    issues.push({
                        file            : filepath,
                        line            : 1,
                        code            : 'FILE_NAME_INVALID',
                        message         : `File name "${fileName}" must follow snake_case convention (e.g., my_file.ts)`,
                        severity        : 'warning',
                        fixable         : false,
                    });
                }

                // Check folder names in the path
                const pathParts = filepath.split(/[\\/]/);
                for (let i = pathParts.indexOf(dir) + 1; i < pathParts.length - 1; i++) {
                    const folder = pathParts[i];
                    if (folder && !isValidSnakeCase(folder)) {
                        issues.push({
                            file            : filepath,
                            line            : 1,
                            code            : 'FOLDER_NAME_INVALID',
                            message         : `Folder name "${folder}" must follow snake_case convention (e.g., my_folder/)`,
                            severity        : 'warning',
                            fixable         : false,
                        });
                        break; // Only report once per file
                    }
                }
            }
        } catch {
            // Silently ignore glob errors
        }

        return issues;
    }

// ╚══════════════════════════════════════════════════════════════════════════════════════╝