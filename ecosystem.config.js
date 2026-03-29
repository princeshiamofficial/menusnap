module.exports = {
  apps: [
    {
      name: 'menusnap-app',
      script: 'server.js',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3007,
      },
    },
    {
      name: 'whatsapp-bridge',
      script: 'whatsapp-bridge.mjs',
      interpreter: 'node',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 9005,
      },
    },
  ],
};
