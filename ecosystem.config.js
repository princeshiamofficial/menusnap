module.exports = {
  apps: [
    {
      name: 'menusnap-app',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3007',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
      },
    },
    {
      name: 'menusnap-collab',
      script: 'collab-server.mjs',
      instances: 1,
      env: {
        NODE_ENV: 'production',
        COLLAB_PORT: 1234,
      },
    },
  ],
};
