---
title: "Vite迁移方案总结"
description: "学习如何从 webpack 迁移至 vite"
publishedAt: '2021-07-25'
status: published
tags: 
  - webpack
  - vite
---

:Toc

## Vite 概要介绍

- 📚： [官方文档](https://vitejs.dev/)，[中文文档](https://cn.vitejs.dev/)
- 🔨： [常用设置文档]()
- 🧰： [API 文档]()
- ⛄：插件和其生态 - [awesome-vite](https://github.com/vitejs/awesome-vite##plugins)

### 什么是 Vite

  在浏览器支持 ES 模块之前，JavaScript 并没有提供的原生机制让开发者以模块化的方式进行开发。

> 这句话的意思其实就是浏览器以前不直接支持我们习惯写的 ES Moudle 语法，现在支持了，vite 充分利用了这一点。

  之前针对这一问题，出现了各类的打包工具： [webpack](https://webpack.js.org/)、[Rollup](https://rollupjs.org/) 和 [Parcel](https://parceljs.org/) 等，这些工具说白了就是在干一件事 - 使用工具抓取、处理并将我们的源码模块串联成可以在浏览器中运行的文件。

  但是逐渐当我们的项目逐渐变得庞大起来，JS 文件变得很多很多，一个完整应用拥有的模块拥有几千个模块，这些构建工具的弊端就会展现出来。使用 JavaScript 开发的工具通常需要很长时间（甚至是几分钟！）才能启动开发服务器，即使使用 HMR，文件修改后的效果也需要几秒钟才能在浏览器中反映出来。如此循环往复，迟钝的反馈会极大地影响开发者的开发效率和幸福感。

  这些问题就成了 Vite 诞生的导火索。

  个人理解 Vite 的定义：

>   Vite，一个基于浏览器原生 `ES imports` 的开发服务器。利用浏览器去解析 imports，在服务器端按需编译返回，完全跳过了打包这个概念，服务器随起随用。同时不仅有 Vue 文件支持，还搞定了热更新，而且热更新的速度不会随着模块增多而变慢。针对生产环境则可以把同一份代码用 rollup 打包。

使用 `Vite`  之后

```html
<div id="app"></div>
<script type="module">
  import { createApp } from "vue";
  import Main from "./Main.vue";

  createApp(Main).mount("##app");
</script>
```

![preview](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/40d8c18b3052404182d62ae24803a663~tplv-k3u1fbpfcp-zoom-1.image)

### Vite 和 webpack 对比

webpack 和 Vite **构建模式**截然不同，在浏览器没有支持模块化的时候，期望将所有源代码编译进一个 `js` 文件中，然后提供给浏览器使用。

所以在开发中运行启动命令的时候，webpack 总是需要从入口文件索引到整个项目的文件，下一步可能会采用代码拆分编译成一个或者多个单独的 JS 文件，这一步需要一次生成所有路由下的编译后文件，伴随着服务启动的时间随着项目复杂度指数增加。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/833fec894776472ab23db760ce891c3c~tplv-k3u1fbpfcp-zoom-1.image)

那么 Vite 是如何解决问题的呢？Vite 会在本地帮你启动一个服务器，当浏览器读取到整个 `html` 文件之后，会执行到 `import` 的时候才去向服务端发送对应模块的请求，Vite 内部进行模板解析，代码编译等解析成浏览器可以执行的 `JS` 文件返回到浏览器端，这里就是真正的按需加载，并且不会因为模块增多而变慢。

![img](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/09a8b06e9d8842498e60764e3ee7dcdc~tplv-k3u1fbpfcp-zoom-1.image)

### Vite 带来的收益是什么

1. **开发环境启服务器速度飞快**

   > 构建工具为 `Webpack` 
   >
   > 服务器启动速度，启动时间随着模块数增多而变慢

   ![image-20210723152046683](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/7590ea884fd94087a310fa9aa3f87b24~tplv-k3u1fbpfcp-zoom-1.image)

   
   
   ![image-20210719184638199](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/5c8420a5817b4d098d2c7d8c5ed9a6b8~tplv-k3u1fbpfcp-zoom-1.image)
   
   
   
   > 构建工具为 `Vite` 
   >
   > 服务器启动速度，相较于前者快了将近十几倍，而且测试项目的模块数目并不多，只有几个模块。如果是一个较大的工程项目，包含几百个几千个模块，`Vite` 启动服务器的速度将会是 `webpack`的几千倍
   
   ![image-20210719184216175](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/a957a192a71748ea9a15acadab1d62a6~tplv-k3u1fbpfcp-zoom-1.image)

2. **几乎实时的模块热更新**

   `webpack` 热更新也是需要重新编译一遍所有模块，然后启动服务器的，换句话来说 `webpack` 的热更新速度和初次编译启动时间相差不了多少，这样会给开发者带来一些负面的体验感，比如你在改动一个组件样式之后，可能需要等待很长一段时间页面才会重新渲染。

  `Vite` 出现了，`Vite`的热更新同样也运用到了 `esbuild` 的能力，可以准确的更新页面而无需重新加载页面或者删除应用程序状态。

**以上两点可以演示admin工程项目，和迁移admin工程项目对比速度**

![img](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/7c3bc07073f144359acbd53e7b09018e~tplv-k3u1fbpfcp-zoom-1.image)

> 实现原理: static server + compile + HMR
>
> 1. 当前目录作为静态文件服务器根目录
> 2. 拦截部分文件请求(处理 import node_modules模块，处理 .Vue等文件的编译)
> 3. websocket 实现 HMR

3. **所需文件按需编译，避免编译用不到的文件**
4. **开箱即用，便面各种 `Loader` 和 `Plugin` 的配置**
   - Typescript - 内置支持
   - less/sass/postcss - 内置支持

## Vite 基础应用

### 官方脚手架安装、模板安装

```shell
## npm
npm init @vitejs/app

## yarn
yarn create @vitejs/app
```

你还可以通过附加的命令行选项直接指定项目名称和你想要使用的模板。例如，要构建一个 Vite + Vue 项目，运行:

```shell
## npm 6.x
npm init @vitejs/app my-vue-app --template vue

## npm 7+, 需要额外的双横线：
npm init @vitejs/app my-vue-app -- --template vue

## yarn
yarn create @vitejs/app my-vue-app --template vue
```

目前支持模板：

- `vanilla`
- `vanilla-ts`
- `vue`
- `vue-ts`
- `react`
- `react-ts`
- `preact`
- `preact-ts`
- `lit-element`
- `lit-element-ts`
- `svelte`
- `svelte-ts`

Vue2+ts+vite 模板（暂时存在个人 github 上，且 tsc-decorator 分支还有bug）

```shell
git clone https://github.com/251205668/vite-vue2-start
cd vite-vue2-start
yarn 
yarn dev
```



### Vite 中使用 Typescript

  Vite 天然支持 `.ts` 文件，Vite 使用 `esbuild` 转译 TS 的速度将会是 `tsc` 的 20~30 倍，同时 HMR 更新速度将会小于 50 ms。

> 编写项目时需要将 `tsconfig.json` 的 `compilerOptions` 设置 `isolateModules: true`, 这样 TS 才会警告你哪些功能无法与独立编译模式一同工作。



**esbuild简介**

![image-20210720160239282](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/4f97aa9980dc4edba478ce50a50b0851~tplv-k3u1fbpfcp-zoom-1.image)

为什么 esbuild 这么快，来自[官网解释](https://esbuild.github.io/faq/##why-is-esbuild-fast)，具体总结为以下几点：

1. 使用 Go 编写，并且编译成了机器码

     现在的构建工具一般都是用 JavaScript 进行编写的，对于这种解释型语言（动态语言）来说，在命令行下的性能非常糟糕。因为每次运行编译的时候 V8 引擎都是第一次遇见代码，无法进行任何优化措施。而 esbuild 使用 Go 这种编译型语言（静态语言）编写而成，已经编译成了机器可以直接执行的机器码。当 esbuild 在编译你的 javaScript 代码的时候，可能 Node 还在忙着解析你的构建工具的代码。

​       除此之外，Go 语言是为并发而设计的语言，而 JavaScript 明显不是（老单线程了）。

 - Go 在线程之间共享使用内存空间，而 JS 想要在线程间传递数据还需要把数据序列化之后再传送。
 - Go 和 JS 的并发都有相应的垃圾回收机制，Go 会在所有线程之间共享堆，对于 JS 而言，每一个线程都有一个独立的堆。
   
    根据 esbuild 的作者的测试，这似乎将 JavaScript 的工作线程的并行处理能力减少了一半，可能是因为你的一半 CPU 核心忙于为另一半收集垃圾

2. 大量使用并行算法

   除了 Go 语言天生对于并发的优势，使得其处理并发任务性能远远优于 JavaScript，
   Esbuild 的内部算法也是经过精心设计的，尽可能的压榨所有的 CPU 核心。

3. esbuild 的所有内容都是从零编写的

   自己编写一切而不是使用第三方库有很多性能上的好处。可以从一开始就考虑到性能，可以确保所有的东西都使用一致的数据结构以避免昂贵的转换，当然，缺点就是这工作量非常大。

4. 更有效利用内存

   - esbuild 通过减少 AST 遍历次数（三次），来减小内存访问速度对于打包速度的影响
   - Go 语言还有一个好处就是可以把数据更加紧凑的储存在内存中，从而使得高速 CPU 缓存可以存下更多的内容

### Vite 中使用 CSS

1. 原生css 支持，这一点毋庸置疑

2. [postcss](https://github.com/postcss/postcss/blob/main/docs/README-cn.md) 支持

   - 变量定义

     ```css
     /* postcss 命名空间式定义变量 */
     :root {
       --main-font-color: blue;
     }
     
     .root {
       /* 使用postcss 插件console，但是需要配置 */  
       @console.error error;
       color: var(--main-font-color);
     }
     ```

     `postcss.config.js`

     ```javascript
     module.exports = {
       plugins: [require("@postcss-plugins/console")],
     };
     ```

   - @import

     ```css
     @import url("./test.css");
     
     /* postcss 命名空间式定义变量 */
     :root {
       --main-font-color: blue;
     }
     
     .root {
       @console.error error;
       color: var(--main-font-color);
     }
     
     ```

   - 等等新功能特性

3. css预处理器支持

   Vite 也同时提供了对 `.scss`, `.sass`, `.less`, `.styl` 和 `.stylus` 文件的内置支持。没有必要为它们安装特定的 Vite 插件，但必须安装相应的预处理器依赖：

   - scss

     ```shell
     yarn add scss
     ```

   - less

     ```shell
     yarn add less
     ```

   - stylus

     ```shell
     yarn add stylus
     ```

4. [css-modules](https://github.com/css-modules/css-modules) 支持

   通常一个大型项目的页面样式名都希望是按模块来划分的，并且保证唯一性，Vite 内置了 `css-modules` 的功能

​       使用方式:  创建对应 `*.module.css` 然后引入即可，下图为测试的案例

![image-20210720173108971](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/e1da5116066e4a0ea1be10f534db926b~tplv-k3u1fbpfcp-zoom-1.image)



### Vite 集成 JSX 和 TSX

`.jsx` 和 `.tsx` 文件同样开箱即用。JSX 的转译同样是通过 [esbuild](https://esbuild.github.io/)，Vue 3 用户配置 `@vitejs/plugin-vue-jsx` 即可

```typescript
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vuejsx from "@vitejs/plugin-vue-jsx";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), vuejsx({})],
});

```

> Vue2 版本需要单独引入 `vite-plugin-vue2` 来配合 vite 工具，并且暂时不支持 `tsx + decorator` 写法，详情可以见
>
> ```typescript
> import { defineConfig } from "vite";
> import { createVuePlugin } from "vite-plugin-vue2";
> import ViteComponents from "vite-plugin-components";
> import { resolve } from "path";
> 
> const config = defineConfig({
>   resolve: {
>     alias: {
>       "@": `${resolve(__dirname, "src")}`,
>     },
>   },
>   base: "/vue-template/",
>   build: {
>     minify: true,
>   },
>   plugins: [createVuePlugin({}), ViteComponents({ transformer: "vue2" })],
>   server: {
>     port: 8080,
>   },
> });
> export default config;
> ```
>
> Vue2.x版本 SFC + TS 写法基本一致
>
> ```vue
> <template>
>   <div class="home">
>     <img alt="Vue logo" src="../assets/logo.png" />
>     <HelloWorld msg="Welcome to Your Vue.js + TypeScript App" />
>   </div>
> </template>
> 
> <script lang="ts">
> import { Component, Vue } from "vue-property-decorator";
> 
> @Component
> export default class Home extends Vue {
>   ...
> }
> </script>
> ```
>
> 



### Vite.config.ts 常用配置

#### 配置别名

```typescript
export default defineConfig({
  resolve: {
    alias: {
      // 路径映射开头必须要加/
      "@": "/src",
      "@styles": "/src/styles",
    },
  },
});
```

**配置语法提示**

```json
{
  "compilerOptions": {
    "baseUrl": "./",
    "paths": {
      "@/*": ["src/*"],
      "@styles/*": ["src/styles/*"]
    }
  },
  "include": ["src/**/*.ts", "src/**/*.d.ts", "src/**/*.tsx", "src/**/*.vue"]
}
```



使用效果

![image-20210720162535915](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/5372ce161b4f41b2ad3855486c0f1469~tplv-k3u1fbpfcp-zoom-1.image)

#### 代理服务器

```typescript
export default {
  proxy: {
    '/api': {
      target: 'http://doman1.com',
      changeOrigin: true,
      rewrite: path => path.replace(/^\/api/, '')
    }
  }
}

```

具体使用

```typescript
fetch('/api/users').then(...)
```

#### 数据mock

#### 当前模式和环境变量

Vite 上定义好的环境变量

- **`import.meta.env.MODE`**: {string} 应用运行的[模式](https://cn.vitejs.dev/guide/env-and-mode.html##modes)。
- **`import.meta.env.BASE_URL`**: {string} 部署应用时的基本 URL。他由[`base` 配置项](https://cn.vitejs.dev/config/##base)决定。
- **`import.meta.env.PROD`**: {boolean} 应用是否运行在生产环境。
- **`import.meta.env.DEV`**: {boolean} 应用是否运行在开发环境 (永远与 `import.meta.env.PROD`相反)



**自定义环境变量**

- 开发环境(git 管理)

  ```env
  // .env.development
  VITE_SOME_KEY=this is a development token
  ```

- 生产环境(git 管理)

  ```env
  // .env.production
  VITE_SOME_KEY=this is a production token
  ```

- 本地开发环境

  ```env
  // .env.development.local
  VITE_SOME_KEY=this is a development token but not managed by git
  ```

- 本地生产环境

  ```env
  // .env.production.local
  VITE_SOME_KEY=this is a production token but not managed by git
  ```



**案例**

```typescript
 return () => {
      const mode = import.meta.env.MODE; // 模式
      const baseUrl = import.meta.env.BASE_URL; //基本URL
      const prod = import.meta.env.PROD; // 是否是生产环境
      const dev = import.meta.env.DEV; // 是否是开发环境
      const token = import.meta.env.VITE_SOME_KEY; // 自定义环境变量
      return (
        <div class="root">
          <p>当前模式：{mode}</p>
          <p>当前baseURL：{baseUrl}</p>
          <p>当前是否是生产环境：{prod}</p>
          <p>当前是否是开发环境：{dev}</p>
          <p>当前环境下token：{token}</p>
        </div>
      );
    };
```



### 其他选项

详情可以见 [官方文档配置](https://cn.vitejs.dev/config/##shared-options)

此处列出一个自己玩过的模板

```js

/**
 * https://vitejs.dev/config/
 * @type {import('vite').UserConfig}
 */
export default {
    //项目根目录 
    root: process.cwd(),
    //项目部署的基础路径
    base: "/",
    //环境配置
    mode: 'development',
    //全局变量替换 Record<string, string>
    define: {
        "": "",
        "user": "users",
    },
    //插件
    plugins: [

    ],
    //静态资源服务的文件夹
    publicDir: "public",

    resolve: {
        //别名
        alias: {
            "@": path.resolve(__dirname, "/src"),
            "comps": path.resolve(__dirname, "/src/components")
        },
        dedupe: [],
        //情景导出package.json配置中的exports 字段
        conditions: [],
        //解析package.json中的字段
        mainFields: ['module', 'jsnext:main', 'jsnext'],
        //导入时想要省略的扩展名列表
        extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json']
    },
    css: {
        //配置 CSS modules 的行为。选项将被传递给 postcss-modules。
        modules: {

        },
        // PostCSS 配置（格式同 postcss.config.js）
        // postcss-load-config 的插件配置
        postcss: {

        },
        //指定传递给 CSS 预处理器的选项
        preprocessorOptions: {
            scss: {
                additionalData: `$injectedColor: orange;`
            }
        }
    },
    json: {
        //是否支持从 .json 文件中进行按名导入
        namedExports: true,
        //若设置为 true，导入的 JSON 会被转换为 export default JSON.parse("...") 会比转译成对象字面量性能更好，
        //尤其是当 JSON 文件较大的时候。
        //开启此项，则会禁用按名导入
        stringify: false
    },
    //继承自 esbuild 转换选项。最常见的用例是自定义 JSX
    esbuild: {
        jsxFactory: 'h',
        jsxFragment: 'Fragment',
        jsxInject: `import React from 'react'`
    },
    //静态资源处理  字符串|正则表达式
    assetsInclude: '',
    //调整控制台输出的级别 'info' | 'warn' | 'error' | 'silent'
    logLevel: 'info',
    //设为 false 可以避免 Vite 清屏而错过在终端中打印某些关键信息
    clearScreen: true,
    //服务
    server: {
        //服务器主机名
        host: "",
        //端口号
        port: "",
        //设为 true 时若端口已被占用则会直接退出，
        //而不是尝试下一个可用端口
        strictPort: true,
        //https.createServer()配置项
        https: "",
        //服务器启动时自动在浏览器中打开应用程序。
        //当此值为字符串时，会被用作 URL 的路径名
        open: '/docs/index.html',
        //自定义代理规则
        proxy: {
            // 字符串简写写法
            '/foo': 'http://localhost:4567/foo',
            // 选项写法
            '/api': {
                target: 'http://jsonplaceholder.typicode.com',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api/, '')
            },
            // 正则表达式写法
            '^/fallback/.*': {
                target: 'http://jsonplaceholder.typicode.com',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/fallback/, '')
            }
        },
        //开发服务器配置 CORS   
        //boolean | CorsOptions
        cors: {

        },
        //设置为 true 强制使依赖预构建
        force: true,
        //禁用或配置 HMR 连接
        hmr: {

        },
        //传递给 chokidar 的文件系统监视器选项
        watch: {

        }
    },
    //构建
    build: {
        //浏览器兼容性  "esnext"|"modules"
        target: "modules",
        //输出路径
        outDir: "dist",
        //生成静态资源的存放路径
        assetsDir: "assets",
        //小于此阈值的导入或引用资源将内联为 base64 编码，以避免额外的 http 请求。设置为 0 可以完全禁用此项
        assetsInlineLimit: 4096,
        //启用/禁用 CSS 代码拆分
        cssCodeSplit: true,
        //构建后是否生成 source map 文件
        sourcemap: false,
        //自定义底层的 Rollup 打包配置
        rollupOptions: {

        },
        //@rollup/plugin-commonjs 插件的选项
        commonjsOptions: {

        },
        //构建的库
        lib: {

        },
        //当设置为 true，构建后将会生成 manifest.json 文件
        manifest: false,
        //设置为 false 可以禁用最小化混淆，
        //或是用来指定使用哪种混淆器
        //boolean | 'terser' | 'esbuild'
        minify: "terser",
        //传递给 Terser 的更多 minify 选项。
        terserOptions: {

        },
        //设置为 false 来禁用将构建后的文件写入磁盘
        write: true,
        //默认情况下，若 outDir 在 root 目录下，则 Vite 会在构建时清空该目录。
        emptyOutDir: true,
        //启用/禁用 brotli 压缩大小报告
        brotliSize: true,
        //chunk 大小警告的限制
        chunkSizeWarningLimit: 500
    },
    //依赖优化选项
    optimizeDeps: {
        //检测需要预构建的依赖项
        entries: [

        ],
        //预构建中强制排除的依赖项
        exclude: [

        ],
        //默认情况下，不在 node_modules 中的，链接的包不会被预构建。使用此选项可强制预构建链接的包。
        include: [

        ]
    },
    //SSR 选项
    ssr: {
        //列出的是要为 SSR 强制外部化的依赖
        external: [

        ],
        //列出的是防止被 SSR 外部化依赖项。
        noExternal: [

        ]
    }
}

```

### webpack 进军 vite

#### 如何迁移

1. 首先需要入门 `Vite` 特性

2. `Vue2` 版本迁移需要安装 `vite-plugin-vue2` 插件，然后使用其暴露的 API  `createvuePlugin` 让 Vite 能够正常编译运行。`Vue3` 版本就不列举~

3. 删除一切 `vue-cli` 插件和 `babel` 插件，这里删除之后一定要注意检查哪一部分是否依赖于某个插件，如果插件依赖关系很强，针对这种场景 `Vite` 同样提供 `rollup/babel` 插件配置 `babel`。

   > Vue2.x 版本使用 babel 会有一个坑，因为依赖于 `vite-plugin-vue2`，但是里面默认将读取 `.babelrc` 配置关闭，这里需要手动改回来。
   >
   > ![image-20210721164134928](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/43eab40494a44694ba3fc755b11e7aee~tplv-k3u1fbpfcp-zoom-1.image)

4. `dependencies` 不用动，因为这些不会影响正常编译

5. 查看[文档配置](https://cn.vitejs.dev/config/##config-file)，逐步将 `vue.config.js` 迁移至 `vite.config.ts`

6. 环境变量迁移参考上述文档，准备 `src/index.html`，只需要改动启动入口 `type = module`

7. 修改 `script`，修改为和 `Vite` 相关脚本

8. 个性化构建：因为 vite 内置构建工具为 `rollup`，所以如果需要对大型项目构建进行优化，可能会需要学习 `rollup`，当然 `vite` 也提供了和 `webpack` 构建配置相似的 [API](https://cn.vitejs.dev/config/##build-options)

9. 如需配置 `SSR`，这一部分[文档](https://cn.vitejs.dev/config/##ssr-options)也有解释，但是目前 `Vite` 对 `SSR` 的支持还在探索

10. 使用 `composition-api` ? 可以安装插件 `@vue/composition-api`，然后再入口文件 `Vue.use(VueCompositionAPI` 即可 

#### 迁移踩过的坑

1. vue2 + vite2 + tsx 压根不支持 decorator 写法

   ![image-20210721110601580](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/ebd849bf1eda4cfaa0f069c4184a9dfd~tplv-k3u1fbpfcp-zoom-1.image)

解决方案：

  经过排查，原因已经确定，`vite-plugin-vue2` 的作者在设计初衷就希望编译走 `esbuild` 而不是走 `babel` ，所以他将入口文件读取`.babelrc` 默认关闭了，所以导致我怎么修改安装 `babel` 插件都无法生效。

> 1. 安装两个插件用于解析装饰器写法，并创建 `.babelrc`加入以下配置
>
>    ```shell
>    yarn add @babel/plugin-proposal-decorators
>    ```
>
>    ```shell
>    yarn add @babel/plugin-proposal-class-properties
>    ```
>
>    ```
>    {
>      "assumptions": {
>        "setPublicClassFields": true
>      },
>      "plugins": [
>        ["@babel/plugin-proposal-decorators", { "legacy": true }],
>        ["@babel/plugin-proposal-class-properties"]
>      ]
>    }
>       
>    ```
>
>    
>
> 2. 开启 `vite-plugin-vue2` 读取 `.babelrc` 选项
>
>    ![image-20210721170737255](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/62468cf5139a487b91f82bc87141e6a8~tplv-k3u1fbpfcp-zoom-1.image)

2. Vite2 迁移需要将所有的 `CommonJS` 替换成 `ESM` 写法，否则运行会报 `Uncaught ReferenceError: require is not defined`

3. Vite 应用的 `title` 默认是写死的，如需要替换成实际的 `title` 值需要安装 `vite-plugin-html` 插件，然后通过 `ejs` 模板注入变量。

   ```typescript
   // vite.config.ts
   import { defineConfig } from 'vite';
   import { createVuePlugin } from 'vite-plugin-vue2';
   + import { injectHtml } from 'vite-plugin-html';
   
   export default defineConfig({
     plugins: [
       createVuePlugin(),
   +   injectHtml({
   +     injectData: {
   +       title: '用户管理系统',
   +     },
       }),
     ],
     server: {
       proxy,
     },
   });
   ```

   然后修改 `index.html`

   ```html
   <!DOCTYPE html>
   <html lang="en">
   
   <head>
     <meta charset="utf-8">
     <meta http-equiv="X-UA-Compatible" content="IE=edge">
     <meta name="viewport" content="width=device-width,initial-scale=1.0">
   - <title><%= htmlWebpackPlugin.options.title %></title>
   + <title><%= title %></title>
   </head>
   
   <body>
     <noscript>
   -   We're sorry but <%= htmlWebpackPlugin.options.title %> doesn't work properly without JavaScript enabled.
   +   We're sorry but <%= title %> doesn't work properly without JavaScript enabled.
     </noscript>
     <div id="app"></div>
     <script type="module" src="/src/main.ts"></script>
   </body>
   
   </html>
   
   ```

   

## Vite 常用插件

Vite 插件依赖于 `Rollup` 编写，未来将需要学习 `Rollup` 插件编写

### [@vitejs/plugin-vue](https://github.com/vitejs/vite/tree/main/packages/plugin-vue)

提供 Vue3 单文件组件支持

### [@vitejs/plugin-vue-jsx](https://github.com/vitejs/vite/tree/main/packages/plugin-vue-jsx)

提供 Vue3 JSX 支持

### [@vitejs/plugin-legacy](https://github.com/vitejs/vite/tree/main/packages/plugin-legacy)

为打包后的文件提供传统浏览器兼容性支持

### [@vitejs/vite-plugin-vue2](https://github.com/underfin/vite-plugin-vue2)

提供 Vue2 单文件组件支持，内置 JSX

### [@vite-plugin-components](https://github.com/antfu/vite-plugin-components)

提供 Vue 组件自动导入功能，无需导入单文件组件

## 配合 Vue3.x 搭建工程化项目

### 搭建基础工程

```shell
yarn create @vitejs/app
##npm
npm init @vitejs/app
```

选择模板 vue-ts

![image-20210722104103443](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/3606756e1e9246ff978688bc059a2320~tplv-k3u1fbpfcp-zoom-1.image)

### 简单修改 vite 配置

简单配置以下路径代理、端口和打包路径

修改 `vite.config.ts`

```typescript
export default defineConfig({
  plugins: [vue()],
  base: "./",
  resolve: {
    alias: {
      "@": "/src",
    },
  },
   server: {
    port: 8080,
    cors: true,
  },
});
```

路径代理之后附带修改一下 `tsconfig.json`，增加语法提示

```json
 { "compilerOptions": {
   ...
    "baseUrl": "./",
    "paths": {
      "@/*": ["src/*"]
    }
  }
 }
```

如需配置接口代理，添加对应的 `proxy` 代理即可

### 整理目录结构

```
├── .husky/                        // commit 前置hooks
├── .vscode/                       // setting.json
├── public/
└── src/
    ├── assets/                    // 静态资源及通用css目录
    ├── common/                    // 通用组件目录
    ├── constant/                  // 常量或枚举目录
    ├── components/                // 业务组件目录
    ├── router/                    // 路由配置目录
    ├── store/                     // 状态管理目录
    ├── utils/                     // 工具函数目录
    ├── views/                     // 页面组件目录
    ├── App.vue
    ├── main.ts
    ├── shims-vue.d.ts
    ├── vite-env.d.ts
├── tests/                         // 单元测试目录
├── index.html
├── tsconfig.json                  // TypeScript 配置文件
├── .editorconfig                  // 编码风格 配置文件
├── .eslintrc.js                   // Eslint 配置文件
├── .eslintignore                  // Eslint 配置忽略文件
├── .prettierrc.json                  // TypeScript 配置文件
├── tsconfig.json                  // TypeScript 配置文件
├── vite.config.ts                 // Vite 配置文件
├── yarn.lock                
└── package.json

```

### 整合部分工具

**vue-router**

安装支持 Vue3 的路由工具 vue-router@4

```bash
yarn add vue-router@4
```

创建 `src/router/index.ts` 文件

在 `src` 下创建 `router` 目录，然后在 `router` 目录里新建 `index.ts` 文件：

```typescript
import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router";
import Home from "@/views/Home.vue";
import Pinia from "@/views/pinia.vue";
import VueRouter from "@/views/vue-router.vue";
import Axios from "@/views/Axios.vue";
const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "Home",
    component: Home,
  },
  {
    path: "/pinia",
    name: "Pinia",
    component: Pinia,
  },
  {
    path: "/vue-router",
    name: "VueRouter",
    component: VueRouter,
  },
  {
    path: "/axios",
    name: "axios",
    component: Axios,
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
```

根据本项目路由配置的实际情况，你需要在 `src` 下创建 `views` 目录，用来存储页面组件。

在 `main.ts` 文件中挂载路由配置

```ts
import { createApp } from 'vue'
import App from './App.vue'
import router from './router/index'

createApp(App).use(router).mount('##app')
```



**Pinia**

因为 `Vuex4.x` 目前还在一些写法上的问题，所以本项目使用了高适配 `Vue3` 版本的 [pinia](https://pinia.esm.dev/) 作为状态管理工具。

安装

```shell
yarn add pinia@^2.0.0-beta.2
```

使用技巧：

首先在 `store` 目录下创建 `index.ts` 导出 `pinia` 实例

```typescript
import type { App } from "vue";
import { createPinia } from "pinia";
const store = createPinia();

export function setupStore(app: App<Element>) {
  app.use(store);
}

export { store };

```

接着创建 `moudle` 目录，然后创建 `app.ts`

```typescript
import { defineStore } from "pinia";
import { store } from "..";
// state interface
interface AppState {
  count: number;
}

export const useAppStore = defineStore({
  id: "pinia-app",
  state: (): AppState => ({
    count: 1,
  }),
  getters: {
    getCount(): number {
      return this.count;
    },
  },
  // async is supported
  actions: {
    DOUBLE_COUNT() {
      this.count *= 2;
    },
  },
});

export function useAppStoreHook() {
  return useAppStore(store);
}

```

在 SFC 中使用也很简单，案例：

```vue
<template>
  <p>
    Click the button to test actions !
    <button type="button" @click="doubleCount">count is: {{ count }}</button>
  </p>
</template>

<script lang="ts">
import { defineComponent, reactive, computed, toRefs } from "vue";
import { useAppStoreHook } from "@/store/module/app";
export default defineComponent({
  name: "Vuex",
  setup: () => {
    const piniaApp = useAppStoreHook();

    const state = reactive({
      count: computed(() => piniaApp.count),
    });

    const doubleCount = () => {
      piniaApp.DOUBLE_COUNT();
    };

    return {
      ...toRefs(state),
      doubleCount,
    };
  },
});
</script>
```

> 更多使用技巧，查看 [pinia文档](https://pinia.esm.dev/) 即可



**axios**

安装 `axios` 插件，根据需求封装请求拦截器即可

### 代码规范

#### 集成 editorConfig

EditorConfig 有助于为跨各种编辑器和 IDE 处理同一项目的多个开发人员维护一致的编码风格。EditorConfig 项目由用于定义编码样式**的文件格式**和一组**文本编辑器插件组成**，这些**插件**使编辑器能够读取文件格式并遵循定义的样式。EditorConfig 文件很容易阅读，并且可以很好地与版本控制系统配合使用。

相关配置查看[文档](https://editorconfig.org/)即可，VSCode需要下载相关插件搭配使用

```
## Editor configuration, see http://editorconfig.org

## 表示是最顶层的 EditorConfig 配置文件
root = true

[*] ## 表示所有文件适用
charset = utf-8 ## 设置文件字符集为 utf-8
indent_style = space ## 缩进风格（tab | space）
indent_size = 2 ## 缩进大小
end_of_line = lf ## 控制换行类型(lf | cr | crlf)
trim_trailing_whitespace = true ## 去除行首的任意空白字符
insert_final_newline = true ## 始终在文件末尾插入一个新行
```

#### 集成 Prettier 配置

1. 命令行式 `format` ，需要项目中集成 `prettier` 加持

```shell
yarn add prettier
```

然后在项目根目录创建 `.pretterrc` 或者 `.pretterrc.json` ,增加以下配置，了解更多配置见[文档](https://prettier.io/docs/en/options.html)

```json
{
  "useTabs": false,
  "tabWidth": 2,
  "printWidth": 120,
  "singleQuote": true,
  "bracketSpacing": true,
  "semi": true
}

```

然后运行命令一键格式化，这一步可以被集成到打包或者编译前置动作

```shell
yarn prettier --write .  
```

2. 利用编辑器插件 `format`
     Vscode 提供 `prettier` 插件同样具有强大的能力，开发者不需要在项目中安装 `prettier` 就可以通过配置来实现 `format`

   - 首先是插件市场安装 `prettier` 

   - 然后可以在本地 `setting.json`，或者项目目录下创建 `.vscode`目录，然后创建 `setting.json`，加入以下配置

   ```json
   {
       // prettier配置
     "editor.detectIndentation": false,
     "editor.formatOnSave": true, // 开启自动保存
     "editor.codeActionsOnSave": {
       "source.fixAll.eslint": true
     },
     "editor.defaultFormatter": "esbenp.prettier-vscode",
     "[javascript]": {
       "editor.defaultFormatter": "esbenp.prettier-vscode"
     },
     "[html]": {
       "editor.defaultFormatter": "esbenp.prettier-vscode"
     },
     "[vue]": {
       "editor.defaultFormatter": "esbenp.prettier-vscode"
     },
     "[json]": {
       "editor.defaultFormatter": "esbenp.prettier-vscode"
     },
      "[jsx]": {
       "editor.defaultFormatter": "esbenp.prettier-vscode"
     },
      "[tsx]": {
       "editor.defaultFormatter": "esbenp.prettier-vscode"
     },
     "[css]": {
       "editor.defaultFormatter": "michelemelluso.code-beautifier"
     },
     "[scss]": {
       "editor.defaultFormatter": "esbenp.prettier-vscode"
     },
     "[less]": {
       "editor.defaultFormatter": "esbenp.prettier-vscode"
     },
     "[typescript]": {
       "editor.defaultFormatter": "esbenp.prettier-vscode"
     }
   }
   ```

   > 工作区目录优先级比全局要高，推荐在工作区引入该配置

#### 集成 Eslint

`eslint` 规则配置要比 `tslint` 要多的多，所以首选 `eslint`



第一步，安装 `eslint`

```shell
yarn add eslint
```

相关插件列表

```json
{
    "@typescript-eslint/eslint-plugin": "^4.28.4",
    "@typescript-eslint/parser": "^4.28.4",
    "@vue/eslint-config-prettier": "^6.0.0",
    "@vue/eslint-config-typescript": "^7.0.0",
    "vue-eslint-parser": "^7.6.0",
    "eslint": "^7.31.0",
    "prettier": "^2.3.2",
    "eslint-config-prettier": "^8.3.0",
    "eslint-plugin-import": "^2.23.4",
    "eslint-plugin-node": "^11.1.0",
    "eslint-plugin-prettier": "^3.4.0",
    "eslint-plugin-vue": "^7.14.0",
}
```

第二步，初始化规则，这里我选择了 `eslint:recommended`

```shell
yarn eslint --init
```

根据团队需求配置 `eslint` 规则

> 解决 `eslint` 和 `prettier` 规则冲突问题
>
> 1. 安装 `eslint-plugin-prettier` 和 `eslint-config-prettier`
>
> 2. `.eskintrc.js`添加顺序规则
>
>    ```js
>    module.exports = {
>      ...
>      extends: [
>        'plugin:vue/essential',
>        'eslint:recommended',
>        'plugin:prettier/recommended' // 添加 prettier 插件
>      ],
>      ...
>    }
>    ```
>
>    最终优先级：`Prettier 配置规则` > `ESLint 配置规则`

`fix` 代码

```shell
eslint --fix
```

第三步，配置 `vscode` 自动 fix：安装 `Eslint` 插件，然后开启 `autofix`

```json
 "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
 }
```

第四步，添加 `script`

```json
  "scripts": {
    "dev": "eslint --ext .js,.jsx,.vue,.ts,.tsx src && vite",
    "build": "vue-tsc --noEmit && vite build",
    "serve": "vite preview",
    "lint": "eslint --ext .js,.jsx,.vue,.ts,.tsx src"
  },
```



贴一下我自己的`.eslintrc.js`

```js
module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: ['plugin:vue/vue3-essential', 'eslint:recommended', '@vue/typescript/recommended'],
  parserOptions: {
    ecmaVersion: 2020,
  },
  rules: {
    // disable the rule for all files
    '@typescript-eslint/explicit-module-boundary-types': 'off',
  },
  overrides: [
    {
      // enable the rule specifically for TypeScript files
      files: ['*.js', '*.ts'],
      rules: {
        '@typescript-eslint/explicit-module-boundary-types': 'warn',
      },
    },
  ],
};

```

#### 提交修复

  我们希望在代码提交之前做一次 `lint` 检查和修复，我们需要用到 Git Hook，在本地执行 `git commit` 的时候，就对所提交的代码进行 ESLint 检测和修复（即执行 `eslint --fix`），如果这些代码没通过 ESLint 规则校验，则禁止提交。

  这里需要使用到两个工具:

- [husky](https://github.com/typicode/husky) —— Git Hook 工具，可以设置在 git 各个阶段（`pre-commit`、`commit-msg`、`pre-push` 等）触发我们的命令。
- [lint-staged](https://github.com/okonet/lint-staged) —— 在 git 暂存的文件上运行 linters。



第一步，安装插件并初始化一个 husky 配置，这一步会在根目录下生成 `.husky `目录

```shell
npx husky-init && yarn
```

第二步，修改 `pre-commit`规则，但缺点是这一步会扫描所有文件

```bash
##!/bin/sh
. "$(dirname "$0")/_/husky.sh"

eslint --fix ./src --ext .vue,.js,.ts
```

![image-20210723150047244](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/e8519380eda14665b37258d8ad969c2a~tplv-k3u1fbpfcp-zoom-1.image)

第三步，安装并配置`lint-staged`

```shell
yarn add lint-staged
```

然后在 `package.json`里增加 lint-staged 配置项

```json
  "lint-staged": {
    "*.{vue,js,ts,tsx,jsx}": "eslint --fix"
  }
```

验证效果，我写了一段错误代码在 `demo.ts`，然后去提交代码，husky 和 lint-staged 就起了关键作用，如果是 `warning` 级别可以正确修复，如果是 `error` 就会在控制台打印出错误日志

![image-20210723151610043](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/e43a63987ee54443b9d7f0db93c4d51a~tplv-k3u1fbpfcp-zoom-1.image)



### 单元测试

单元测试是项目开发中一个非常重要的环节，完整的测试能为代码和业务提供质量保证，减少 Bug 的出现

#### 安装并配置核心依赖

- **[vue-test-utils](https://github.com/vuejs/vue-test-utils-next)** Vue 团队开发和维护的测试库

- **[jest](https://github.com/facebook/jest)** 官方推荐测试库

- **[vue-jest](https://github.com/vuejs/vue-jest)** 负责 jest  扫描 `.vue` 和转换

- **[ts-jest](https://github.com/kulshekhar/ts-jest)** 负责 jest 扫描 `.ts` 和转换

```shell
yarn add @vue/test-utils@next jest vue-jest@next ts-jest -D    
```



添加 `jest.config.js`

```js
module.exports = {
  moduleFileExtensions: ['vue', 'js', 'ts'],
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.vue$': 'vue-jest', // vue 文件用 vue-jest 转换
    '^.+\\.ts$': 'ts-jest', // ts 文件用 ts-jest 转换
  },
  // 匹配 __tests__ 目录下的 .js/.ts 文件 或其他目录下的 xx.test.js/ts xx.spec.js/ts
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.(ts)$',
};

```

#### 集成@types/jest 和 eslint-plugin-jest

这两个工具主要是为了解决编辑器 `jest` 代码提示错误和 eslint 对 jest 的支持

```shell
yarn add @types/jest eslint-plugin-jest -D
```

修改 `tsconfig.json`

```json
{
  "compilerOptions": {
    ...
    "types": ["vite/client", "jest"]
  },
}
```

在 `.eslintrc.js` 添加 jest lint 插件 配置

```js
{
  ...
    extends: [
    'plugin:vue/vue3-essential',
    'eslint:recommended',
    '@vue/typescript/recommended',
    'plugin:jest/recommended',
  ],
}
```



#### 编写单元测试

创建 `tests` 目录，然后创建 `xx.spec.ts` 文件编写单元测试，然后测试

```typescript
// Axios.spec.ts
import { mount } from '@vue/test-utils';
import Axios from '../src/views/Axios.vue';

describe('Axios.vue', () => {
  it('renders', () => {
    const wrapper = mount(Axios);
    expect(wrapper.html()).toContain('Vite2.x + Vue3.x + TypeScript Starter');
  });
});

```

>  建议打包时执行前置单元测试，如果希望在 `push` 代码之前执行单元测试，只需要在 `.husky` 目录下创建 `pre-push`脚本 ，然后添加对应测试命令即可。


## 小结

至此，一个综合性 Vue3.x 项目就搭建完成，总结下该工程的能力

- 编程语言：[TypeScript](https://www.typescriptlang.org/zh/)
- 构建工具：[Vite 2.x](https://cn.vitejs./dev/)
- 前端框架：[Vue 3.x](https://v3.cn.vuejs.org/)
- 路由工具：[Vue Router 4.x](https://next.router.vuejs.org/zh/index.html)
- 状态管理：[Pinia](https://pinia.esm.dev/)
- CSS 预编译：[Stylus](https://stylus-lang.com/) / [Sass](https://sass.bootcss.com/documentation) / [Less](http://lesscss.cn/)
- HTTP 工具：[Axios](https://axios-http.com/)
- Git Hook 工具：[husky](https://typicode.github.io/husky/##/) + [lint-staged](https://github.com/okonet/lint-staged)
- 代码规范：[EditorConfig](http://editorconfig.org/) + [Prettier](https://prettier.io/) + [ESLint](https://eslint.org/) 
- 单元测试：[vue-test-utils](https://next.vue-test-utils.vuejs.org/) + [jest](https://jestjs.io/) + [vue-jest](https://github.com/vuejs/vue-jest) + [ts-jest](https://kulshekhar.github.io/ts-jest/)

> 在线预览该工程：[vite-vue3-sfc-template](https://251205668.github.io/vite-vue3-sfc-template/##/)
>
> 为此我还准备了这些常用模板
>
> - Vue2.x + vite 模板
>   - TSX + decorator能力：[vite-vue2-tsx-start](https://github.com/251205668/vite-vue2-start/tree/tsx-decorator)
>   - SFC + decorator能力：[vite-vue2-start](https://github.com/251205668/vite-vue2-start)
> - Vue3.x + vite 模板
>   - TSX + composition-api能力：[vite-vue3-start](https://github.com/251205668/vite-vue3-start)
>   - SFC + composition-api能力：[vite-vue3-sfc-template](https://github.com/251205668/vite-vue3-sfc-template)

