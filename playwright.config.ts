import { PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
    testDir: './tests/visual',
    use: {
        baseURL: 'http://localhost:3000',
        viewport: { width: 1280, height: 720 },
        screenshot: 'only-on-failure',
    },
    expect: {
        timeout: 5000,
        toHaveScreenshot: { maxDiffPixels: 100 },
    },
    retries: 1,
    workers: 1,
    reporter: [
        ['html'],
        ['list']
    ],
    webServer: {
        command: 'npm run serve',
        url: 'http://localhost:3000',
        timeout: 120000,
        reuseExistingServer: !process.env.CI,
    },
};

export default config; 