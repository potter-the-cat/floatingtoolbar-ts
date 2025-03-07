import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
    preset: 'ts-jest',
    testEnvironment: 'jsdom',
    roots: ['<rootDir>/src'],
    testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
    testPathIgnorePatterns: ['/node_modules/', '/tests/visual/'],
    transform: {
        '^.+\\.tsx?$': ['ts-jest', {
            tsconfig: {
                allowJs: true
            }
        }]
    },
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    moduleNameMapper: {
        '^(.+)\\.js$': '$1'
    },
    setupFilesAfterEnv: ['<rootDir>/src/tests/setup.ts']
};

export default config; 