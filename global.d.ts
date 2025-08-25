// global.d.ts
declare namespace NodeJS {
  interface Process {
    browser: boolean;
    env: {
      NODE_ENV: 'development' | 'production' | 'test';
    };
    hrtime?: (time?: [number, number]) => [number, number];
  }
}

declare var process: NodeJS.Process;