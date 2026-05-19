// test/index.test.ts
//
// Made with ❤️ by Maysara.



// ╔════════════════════════════════════════ PACK ════════════════════════════════════════╗

    import { App }                       from '../src/core/app';
    import { describe, test, expect }    from 'bun:test';

// ╚══════════════════════════════════════════════════════════════════════════════════════╝



// ╔════════════════════════════════════════ TEST ════════════════════════════════════════╗

    describe('@langpkg/pkg', () => {

        test('should run the app without throwing errors', () => {
            const app = new App({
                name        : 'pkg',
                version     : '0.0.1',
                desc        : 'Build, manage, publish, and test packages with zero configuration.',
            });

            expect(() => app.run()).not.toThrow();
        });

    });

// ╚══════════════════════════════════════════════════════════════════════════════════════╝
