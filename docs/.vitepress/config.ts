import { defineConfig } from 'vitepress';

export default defineConfig({
  title: 'TypeScript Library Template',
  description: 'Write TypeScript Library without extra ',
  base: '/typescript-library-template/',
  themeConfig: {
    // Type is `DefaultTheme.Config`
    logo: '/logo.png',
    nav: [
      {
        text: 'GitHub',
        link: 'https://github.com/wangkaiwd/typescript-library-template',
      },
    ],
    sidebar: false
  },
});
