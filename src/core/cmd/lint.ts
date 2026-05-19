// src/core/cmd/lint.ts
//
// Made with ❤️ by Maysara.



// ╔════════════════════════════════════════ PACK ════════════════════════════════════════╗

    import { CommandParams, cmdCancelled }    from '../common';
    import { print, createSpinner, theme }    from '../utils/ui';
    import { execSync }                       from 'child_process';
    import { spawn }                          from 'child_process';

// ╚══════════════════════════════════════════════════════════════════════════════════════╝



// ╔════════════════════════════════════════ TYPE ════════════════════════════════════════╗

    export interface LintCommandParams extends CommandParams {
        dynamicArgs?     : string[];
        options          : {
            fix?         : boolean;
            fixDryRun?   : boolean;
            format?      : 'stylish' | 'json' | 'compact';
            maxWarnings? : number;
            cache?       : boolean;
            quiet?       : boolean;
        };
    }

// ╚══════════════════════════════════════════════════════════════════════════════════════╝



// ╔════════════════════════════════════════ CORE ════════════════════════════════════════╗

    export class LintCommand {

        // ┌──────────────────────────────── INIT ──────────────────────────────┐

            constructor(public params: LintCommandParams) {}

        // └────────────────────────────────────────────────────────────────────┘


        // ┌──────────────────────────────── MAIN ──────────────────────────────┐

            async run() {
                try {

                    // ╭── Phase 0: Check if eslint is installed ─────────────────╮

                        if (!this.isEslintAvailable()) {
                            print.nl();
                            print.error('ESLint is not installed or not found in your system.');
                            print.nl();
                            print.info('To install ESLint globally, run:');
                            print.info('  pkg i eslint -g');
                            print.nl();
                            print.info('Or install it locally in your project:');
                            print.info('  pkg i eslint');
                            print.nl();
                            process.exit(1);
                        }

                        print.nl();

                    // ╰──────────────────────────────────────────────────────────╯


                    // ╭── Phase 1: Build eslint command ─────────────────────────╮

                        const args: string[] = [];

                        // Force colored output
                        args.push('--color');

                        // Add options
                        if (this.params.options?.fix) {
                            args.push('--fix');
                        }

                        if (this.params.options?.fixDryRun) {
                            args.push('--fix-dry-run');
                        }

                        if (this.params.options?.format && this.params.options.format !== 'stylish') {
                            args.push('--format', this.params.options.format);
                        }

                        if (
                            this.params.options?.maxWarnings !== undefined &&
                            this.params.options.maxWarnings >= 0
                        ) {
                            args.push('--max-warnings', String(this.params.options.maxWarnings));
                        }

                        if (this.params.options?.cache) {
                            args.push('--cache');
                        }

                        if (this.params.options?.quiet) {
                            args.push('--quiet');
                        }

                        // Add paths: use provided paths or default to src/ and test/
                        const paths =
                        this.params.dynamicArgs && this.params.dynamicArgs.length > 0
                        ? this.params.dynamicArgs
                        : ['src/', 'test/'];
                        args.push(...paths);

                    // ╰──────────────────────────────────────────────────────────╯


                    // ╭── Phase 2: Spawn linter ─────────────────────────────────╮

                        const lintSpinner = createSpinner(theme.muted('Linting...'));
                        lintSpinner.start();

                        return new Promise<void>((resolve) => {
                            const lintProcess = spawn('eslint', args, {
                                stdio: ['inherit', 'pipe', 'pipe'],
                                shell: true,
                                env: { ...process.env, FORCE_COLOR: '1' },
                            });

                            let lastWasBlank = false;
                            const stopSpinner = () => {
                                if (lintSpinner.isSpinning) {
                                    lintSpinner.stop();
                                }
                            };

                            // Handle stdout
                            lintProcess.stdout?.on('data', (data) => {
                                stopSpinner();
                                const lines = data.toString().split('\n');
                                for (const line of lines) {
                                    const isBlank = line.trim() === '';

                                    // Skip consecutive blank lines
                                    if (isBlank && lastWasBlank) continue;

                                    // Print line if not blank or if it's the first blank line
                                    if (!isBlank) {
                                        console.log(line);
                                    } else if (isBlank && !lastWasBlank) {
                                        console.log('');
                                    }

                                    lastWasBlank = isBlank;
                                }
                            });

                            // Handle stderr
                            lintProcess.stderr?.on('data', (data) => {
                                stopSpinner();
                                console.error(data.toString());
                            });

                            lintProcess.on('close', (code) => {
                                stopSpinner();
                                if (code === 0) {
                                    print.success('All files are clean.');
                                    print.nl();
                                }
                                resolve();
                                process.exit(code || 0);
                            });

                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            lintProcess.on('error', (err: any) => {
                                stopSpinner();
                                print.error(`Failed to run linter: ${err.message}`);
                                print.nl();
                                process.exit(1);
                            });
                        });

                    // ╰──────────────────────────────────────────────────────────╯

                } catch { return cmdCancelled('lint'); }
            }

        // └────────────────────────────────────────────────────────────────────┘


        // ┌─────────────────────────────── HELPERS ────────────────────────────┐

            private isEslintAvailable(): boolean {
                try {
                    const cmd = process.platform === 'win32' ? 'where eslint' : 'which eslint';
                    execSync(cmd, { stdio: 'ignore' });
                    return true;
                } catch {
                    return false;
                }
            }

        // └────────────────────────────────────────────────────────────────────┘

    }

// ╚══════════════════════════════════════════════════════════════════════════════════════╝

