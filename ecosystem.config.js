module.exports = {
  apps: [
    {
      name: 'menusnap-app',
      script: 'server.js',
      instances: 1,
      exec_mode: 'fork',
      watch: true,
      watch_options: {
        usePolling: true,
        interval: 1000,
        ignored: ['node_modules', '.git']
      },
      env: {
        NODE_ENV: 'production',
        PORT: 3007,
      },
    },
  ],
};
