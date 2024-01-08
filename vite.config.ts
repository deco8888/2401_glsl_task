import { defineConfig } from 'vite';
import * as path from 'path';
import glslify from 'rollup-plugin-glslify';

const ROOT_PATH = path.resolve(__dirname, 'src');

export default defineConfig({
    root: ROOT_PATH,
    // base: '/',
    build: {
        outDir: 'dist',
        cssCodeSplit: true,
        rollupOptions: {
            input: {
                main: path.resolve(ROOT_PATH, 'index.html'),
            },
            output: {
                assetFileNames: ({ name }: { name: any }): string => {
                    const folder = name?.split('.').pop() == 'css' ? 'styles/' : '/';
                    return `assets/${folder}[name].[hash][extname]`;
                },
                chunkFileNames: 'assets/scripts/[name].[hash].js',
                entryFileNames: 'assets/scripts/[name].[hash].js',
            },
        },
    },
    server: {
        host: true,
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    plugins: [glslify()],
});
