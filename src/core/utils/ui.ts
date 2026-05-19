// src/core/utils/ui.ts
//
// Made with ❤️ by Maysara.



// ╔════════════════════════════════════════ PACK ════════════════════════════════════════╗

    import chalk    from 'chalk';
    import boxen    from 'boxen';
    import ora      from 'ora';

// ╚══════════════════════════════════════════════════════════════════════════════════════╝



// ╔═══════════════════════════════════════ THEME ════════════════════════════════════════╗

    export const theme = {
        primary         : chalk.hex('#7C6AF7'),
        accent          : chalk.hex('#F7C06A'),
        success         : chalk.hex('#5EFFA3'),
        error           : chalk.hex('#FF6B6B'),
        warning         : chalk.hex('#FFD93D'),
        info            : chalk.hex('#6ACFF7'),
        muted           : chalk.hex('#6B7280'),
        dim             : chalk.hex('#374151'),
        white           : chalk.hex('#F9FAFB'),
    } as const;

// ╚══════════════════════════════════════════════════════════════════════════════════════╝



// ╔══════════════════════════════════════ SYMBOLS ═══════════════════════════════════════╗

    // For console.log lines only - NOT inside boxen (unicode width is unstable)
    export const sym = {
        check           : theme.success('✔'),
        cross           : theme.error('✖'),
        warn            : theme.warning('⚠'),
        info            : theme.info('ℹ'),
        arrow           : theme.muted('›'),
        dot             : theme.muted('·'),
        wrench          : theme.accent('⚙'),
        sparkle         : theme.primary('✦'),
        bullet          : theme.muted('▸'),
    } as const;

    // bg-colored, ASCII-only, stable width - safe inside boxen
    export const badge = {
        ok              : chalk.bgHex('#5EFFA3').hex('#0a0a0a').bold(' ok '),
        err             : chalk.bgHex('#FF6B6B').hex('#0a0a0a').bold(' err '),
        warn            : chalk.bgHex('#FFD93D').hex('#0a0a0a').bold(' warn '),
        info            : chalk.bgHex('#6ACFF7').hex('#0a0a0a').bold(' info '),
        fixed           : chalk.bgHex('#5EFFA3').hex('#0a0a0a').bold(' fixed '),
        failed          : chalk.bgHex('#FF6B6B').hex('#0a0a0a').bold(' failed '),
    } as const;

// ╚══════════════════════════════════════════════════════════════════════════════════════╝



// ╔═══════════════════════════════════════ PRINT ════════════════════════════════════════╗

    // Column widths for the issue table
    const COL_SEV = 7;
    const COL_MSG = 36;

    const padEnd = (s: string, n: number) => s.padEnd(n);
    // const trunc  = (s: string, n: number) => (s.length > n ? s.slice(0, n - 1) + '.' : s);

    export const print = {

        // ┌─────────────────────────────── LAYOUT ─────────────────────────────┐

            banner(version = '0.0.1') {
                const dot   = theme.primary('*');
                const name  = theme.white.bold(' pkg ');
                const ver   = theme.dim(`v${version}`);
                const pipe  = theme.dim('  |  ');
                const sub   = theme.muted('build . manage . publish');
                console.log('\n  ' + dot + name + ver + pipe + sub + '\n');
            },

            section(title: string) {
                console.log(`  ${theme.primary.bold(title)}`);
                console.log(`  ${theme.dim('-'.repeat(44))}`);
            },

            nl(n = 1) {
                for (let i = 0; i < n; i++) console.log('');
            },

        // └────────────────────────────────────────────────────────────────────┘


        // ┌──────────────────────────────── LINES ─────────────────────────────┐

            info(msg: string) {
                console.log(`  ${sym.info} ${theme.muted(msg)}`);
            },

            success(msg: string) {
                console.log(`  ${sym.check}  ${theme.success(msg)}`);
            },

            error(msg: string) {
                console.log(`  ${sym.cross}  ${theme.error(msg)}`);
            },

            warn(msg: string) {
                console.log(`  ${sym.warn}  ${theme.warning(msg)}`);
            },

            fixResult(msg: string, status: 'fixed' | 'failed') {
                const icon = status === 'fixed' ? sym.check : sym.cross;
                const text = status === 'fixed' ? theme.success(msg) : theme.error(msg);
                console.log(`     ${icon}  ${text}`);
            },

        // └────────────────────────────────────────────────────────────────────┘


        // ┌──────────────────────────────── TABLE ─────────────────────────────┐

            issueTable(
                issues: {
                    message     : string;
                    severity    : 'error' | 'warning' | 'info';
                    code?       : string;
                    fixable?    : boolean;
                }[]
            ) {
                const divider = theme.dim('-'.repeat(COL_SEV + COL_MSG + 20));

                // Header
                console.log(
                    '  ' +
                    theme.dim(padEnd('sev', COL_SEV)) +
                    theme.dim(padEnd('code', 25)) +
                    theme.dim('message')
                );
                console.log('  ' + divider);

                // Rows
                issues.forEach((issue) => {
                    const sev =
                    issue.severity === 'error'
                    ? theme.error.bold(padEnd('err', COL_SEV))
                    : issue.severity === 'warning'
                    ? theme.warning.bold(padEnd('warn', COL_SEV))
                    : theme.info.bold(padEnd('info', COL_SEV));

                    const code = theme.dim(padEnd(issue.code ?? '', 25));
                    const msg  = theme.white(issue.message);

                    console.log(`  ${sev}${code}${msg}`);
                });

                // Footer / summary
                const errs    = issues.filter((i) => i.severity === 'error').length;
                const warns   = issues.filter((i) => i.severity === 'warning').length;
                const fixable = issues.filter((i) => i.fixable).length;

                console.log('  ' + divider);
                console.log();

                const parts: string[] = [];
                if (errs)    parts.push(theme.error.bold(`${errs} error${errs > 1 ? 's' : ''}`));
                if (warns)   parts.push(theme.warning.bold(`${warns} warning${warns > 1 ? 's' : ''}`));
                if (fixable) parts.push(theme.muted(`${fixable} fixable`));

                console.log('  ' + parts.join(theme.dim('  .  ')));
            },

        // └────────────────────────────────────────────────────────────────────┘


        // ┌──────────────────────────────── BOXES ─────────────────────────────┐

            summaryBox(lines: string[], type: 'success' | 'error' | 'info') {
                const borderColor = {
                    success : '#5EFFA3',
                    error   : '#FF6B6B',
                    info    : '#6ACFF7',
                }[type];

                console.log(
                    '\n' +
                    boxen(lines.join('\n'), {
                        padding     : { top: 0, bottom: 0, left: 1, right: 1 },
                        margin      : { top: 0, bottom: 0, left: 1, right: 0 },
                        borderStyle : 'round',
                        borderColor,
                    })
                );
            },

        // └────────────────────────────────────────────────────────────────────┘

    } as const;

// ╚══════════════════════════════════════════════════════════════════════════════════════╝



// ╔══════════════════════════════════════ SPINNER ═══════════════════════════════════════╗

    export function createSpinner(text: string) {
        return ora({
            text,
            spinner     : 'dots2',
            color       : 'magenta',
            prefixText  : '  ',
        });
    }

// ╚══════════════════════════════════════════════════════════════════════════════════════╝
