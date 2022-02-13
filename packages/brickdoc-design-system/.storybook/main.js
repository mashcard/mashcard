module.exports = {
  stories: ['../src/**/*.stories.mdx', '../src/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    'storybook-addon-designs',
    '@storybook/addon-a11y',
    '@pxblue/storybook-rtl-addon/register'
  ],
  framework: '@storybook/react',
  core: {
    builder: 'storybook-builder-vite'
  }
}