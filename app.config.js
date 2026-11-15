export default ({ config }) => ({
  ...config,
  experiments: {
    ...config.experiments,
    ...(process.env.GITHUB_PAGES === 'true' ? { baseUrl: '/pong-duel' } : {}),
  },
});
