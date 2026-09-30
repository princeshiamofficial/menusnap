module.exports = {
  apps: [
    {
      name: 'menusnap-app',
      script: 'server.js',
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      kill_timeout: 5000,
      wait_ready: false,
      exp_backoff_restart_delay: 1000,
      env: {
        NODE_ENV: 'production',
        PORT: 3007,
      },
    },
  ],
};
