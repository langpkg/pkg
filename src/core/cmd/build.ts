// src/core/cmd/build.ts
//
// Made with ❤️ by Maysara.



// ╔════════════════════════════════════════ PACK ════════════════════════════════════════╗

    import { cmdCancelled, CommandParams, isDirExists }    from '../common';
    import { print, createSpinner, theme }                 from '../utils/ui';
    import { existsSync, rmSync, statSync }                from 'fs';
    import { spawn }                                       from 'child_process';

// ╚══════════════════════════════════════════════════════════════════════════════════════╝



// ╔════════════════════════════════════════ TYPE ════════════════════════════════════════╗

    export interface BuildCommandParams extends CommandParams {
        options    : {
            watch? : boolean;
            clean? : boolean;
        };
    }

// ╚══════════════════════════════════════════════════════════════════════════════════════╝



// ╔════════════════════════════════════════ CORE ════════════════════════════════════════╗

    export class BuildCommand {

        // ┌──────────────────────────────── INIT ──────────────────────────────┐

            constructor(public params: BuildCommandParams) { }

        // └────────────────────────────────────────────────────────────────────┘


        // ┌──────────────────────────────── MAIN ──────────────────────────────┐

            async run() {
                try {

                    print.nl();

                    // ╭── Phase 1: Clean if requested ───────────────────────────╮

                        if (this.params.options?.clean) {
                            const cleanSpinner = createSpinner(theme.muted('Cleaning dist/...'));
                            cleanSpinner.start();

                            if (isDirExists('dist')) {
                                rmSync('dist', { recursive: true });
                            }

                            cleanSpinner.stop();
                            print.success('Cleaned dist/');
                            print.nl();
                        }

                    // ╰──────────────────────────────────────────────────────────╯


                    // ╭── Phase 2: Run tsup ─────────────────────────────────────╮

                        const buildSpinner = createSpinner(theme.muted('Building...'));
                        buildSpinner.start();

                        return new Promise<void>((resolve) => {
                            const buildProcess = spawn('bun', ['tsup', ...(this.params.options?.watch ? ['--watch'] : [])], {
                                stdio: ['inherit', 'pipe', 'pipe'],
                                shell: true,
                                env: { ...process.env, FORCE_COLOR: '1' },
                            });

                            // eslint-disable-next-line @typescript-eslint/no-unused-vars
                            let buildOutput = '';
                            let buildErrors = '';
                            const buildStartTime = Date.now();

                            // Capture stdout and filter CLI messages
                            buildProcess.stdout?.on('data', (data) => {
                                const lines = data.toString().split('\n');
                                for (const line of lines) {
                                    if (line.trim() && !line.startsWith('CLI ') && !line.includes('⚡️')) {
                                        buildOutput += line + '\n';
                                    }
                                }
                            });

                            // Capture stderr for errors
                            buildProcess.stderr?.on('data', (data) => {
                                buildErrors += data.toString();
                            });

                            buildProcess.on('close', (code) => {
                                buildSpinner.stop();

                                // ── Handle errors ───────────────────────────────────────────

                                if (code !== 0) {
                                    if (buildErrors.trim()) {
                                        print.error('Build errors:');
                                        print.nl();
                                        // Indent error output with 4 spaces
                                        const indentedErrors = buildErrors
                                        .split('\n')
                                        .map(line => (line.trim() ? '    ' + line : ''))
                                        .join('\n');
                                        console.log(indentedErrors);
                                    }
                                    print.error(`Build failed with exit code ${code}`);
                                    print.nl();
                                    process.exit(code);
                                }

                                // ── Validate outputs ────────────────────────────────────────

                                const requiredFiles = ['dist/index.js', 'dist/index.d.ts'];
                                const missingFiles: string[] = [];

                                for (const file of requiredFiles) {
                                    if (!existsSync(file)) {
                                        missingFiles.push(file);
                                    }
                                }

                                if (missingFiles.length > 0) {
                                    print.error(`Build validation failed - missing files:`);
                                    for (const file of missingFiles) {
                                        print.error(`  - ${file}`);
                                    }
                                    print.nl();
                                    process.exit(1);
                                }

                                // ── Calculate build summary ─────────────────────────────────

                                const buildEndTime = Date.now();
                                const buildTime = buildEndTime - buildStartTime;
                                const buildTimeStr = buildTime < 1000 ? `${buildTime}ms` : `${(buildTime / 1000).toFixed(2)}s`;

                                // Count built files
                                const builtFiles: string[] = [];
                                const possibleFiles = [
                                    'dist/index.js',
                                    'dist/index.cjs',
                                    'dist/index.d.ts',
                                    'dist/index.d.cts',
                                ];
                                for (const file of possibleFiles) {
                                    if (existsSync(file)) {
                                        builtFiles.push(file);
                                    }
                                }

                                // Get main file size (index.js or index.cjs, whichever exists)
                                let mainFileSize = 0;
                                let mainFileName = '';
                                if (existsSync('dist/index.js')) {
                                    const stat   = statSync('dist/index.js');
                                    mainFileSize = stat.size;
                                    mainFileName = 'index.js';
                                } else if (existsSync('dist/index.cjs')) {
                                    const stat = statSync('dist/index.cjs');
                                    mainFileSize = stat.size;
                                    mainFileName = 'index.cjs';
                                }

                                const mainFileSizeKb = (mainFileSize / 1024).toFixed(2);
                                const fileCountStr = builtFiles.length === 1 ? '1 file' : `${builtFiles.length} files`;

                                print.success(`Build successful! [${fileCountStr}] [${mainFileName}: ${mainFileSizeKb} KB] [${buildTimeStr}]`);

                                print.nl();
                                resolve();
                                process.exit(0);
                            });

                            buildProcess.on('error', (err) => {
                                buildSpinner.stop();
                                print.error(`Build failed: ${err.message}`);
                                print.nl();
                                process.exit(1);
                            });
                        });

                    // ╰──────────────────────────────────────────────────────────╯

                } catch { return cmdCancelled('build'); }
            }

        // └────────────────────────────────────────────────────────────────────┘

    }

// ╚══════════════════════════════════════════════════════════════════════════════════════╝
