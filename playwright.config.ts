import {defineConfig} from '@playwright/test';
const port = process.env.PLAYWRIGHT_PORT || '8080';
const baseURL = 'http://127.0.0.1:' + port;
export default defineConfig({testDir:'./tests/browser',timeout:45_000,fullyParallel:false,webServer:{command:'node .output/server/index.mjs',url:baseURL,env:{HOST:'127.0.0.1',PORT:port},reuseExistingServer:!process.env.CI},use:{baseURL,channel:process.env.CI?undefined:'chrome',headless:true,viewport:{width:1440,height:1000},screenshot:'only-on-failure',trace:'retain-on-failure'},reporter:'list'});
