import { defineConfig } from 'vitepress';

export default defineConfig({
  title: 'TypeScript Library Template',
  description: 'Write TypeScript Library without extra ',
  base: '/typescript-library-template/',
  head: [
    ['link', {
      rel: 'icon',
      type: 'image/x-icon',
      href: 'https://raw.githubusercontent.com/wangkaiwd/drawing-bed/master/81249231_padded_logo.png'
    }],
  ],
  themeConfig: {
    // Type is `DefaultTheme.Config`
    logo: 'https://raw.githubusercontent.com/wangkaiwd/drawing-bed/master/81249231_padded_logo.png',
    nav: [
      {
        text: 'GitHub',
        link: 'https://github.com/wangkaiwd/typescript-library-template',
      },
    ],
    sidebar: [
      {
        text: '快速上手',
        link: '/'
      },
      {
        text: '打包和发布',
        link: '/tutorial'
      }
    ]
  },
});
