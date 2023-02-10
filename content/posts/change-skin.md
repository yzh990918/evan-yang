---
title: "前端换肤方案总结"
description: "常可以看到一些网站会有类似暗黑模式/白天模式的主题切换功能，效果也是十分炫酷，在平时的开发场景中也有越来越多这样的需求，这里大致罗列一些常见的主题切换方案并分析其优劣，大家可根据需求综合分析得出一套适用的方案。"
publishedAt: '2023-02-09'
excerpt: 'I used Vite to build a new blazing fast blog ⚡, find out what I learnt and why Vite is the next big thing.'
status: published
tags: 
  - vue
---

::Toc
::

![img](https://cdn.nlark.com/yuque/0/2023/webp/785653/1675754048268-90db1a56-b969-4e8a-89bc-1b78dbeacc36.webp) 

现在我们经常可以看到一些网站会有类似暗黑模式/白天模式的主题切换功能，效果也是十分炫酷，在平时的开发场景中也有越来越多这样的需求，这里大致罗列一些常见的主题切换方案并分析其优劣，大家可根据需求综合分析得出一套适用的方案。

## 方案1：link标签动态引入

其做法就是提前准备好几套CSS主题样式文件，在需要的时候，创建link标签动态加载到head标签中，或者是动态改变link标签的href属性。

![img](https://cdn.nlark.com/yuque/0/2023/webp/785653/1675754048225-87ee1866-4bcc-4fa3-9a54-20e52928d8dd.webp)

表现效果如下： 

![img](https://cdn.nlark.com/yuque/0/2023/webp/785653/1675754048193-f3508653-9381-4282-ba48-95565c5f5a5c.webp)

网络请求如下： 

![img](https://cdn.nlark.com/yuque/0/2023/webp/785653/1675754048228-3eee2af5-7c6f-4a0c-a7eb-7c95c09455f4.webp)

### 优点：

- 实现了按需加载，提高了首屏加载时的性能

### 缺点：

- 动态加载样式文件，如果文件过大网络情况不佳的情况下可能会有加载延迟，导致样式切换不流畅
- 如果主题样式表内定义不当，会有优先级问题
- 各个主题样式是写死的，后续针对某一主题样式表修改或者新增主题也很麻烦

## 方案2：提前引入所有主题样式，做类名切换

这种方案与第一种比较类似，为了解决反复加载样式文件问题提前将样式全部引入，在需要切换主题的时候将指定的根元素类名更换，相当于直接做了样式覆盖，在该类名下的各个样式就统一地更换了。其基本方法如下：

```css
/* day样式主题 */
body.day .box {
  color: #f90;
  background: #fff;
}
/* dark样式主题 */
body.dark .box {
  color: #eee;
  background: #333;
}

.box {
  width: 100px;
  height: 100px;
  border: 1px solid #000;
}
<div class="box">
  <p>hello</p>
</div>
<p>
  选择样式：
  <button onclick="change('day')">day</button>
  <button onclick="change('dark')">dark</button>
</p>
function change(theme) {
  document.body.className = theme;
}
```

表现效果如下：

![img](https://cdn.nlark.com/yuque/0/2023/webp/785653/1675754048199-edba8f2f-d3d0-4c8d-b8be-ddefceba31c7.webp)

### 优点：

- 不用重新加载样式文件，在样式切换时不会有卡顿

### 缺点：

- 首屏加载时会牺牲一些时间加载样式资源
- 如果主题样式表内定义不当，也会有优先级问题
- 各个主题样式是写死的，后续针对某一主题样式表修改或者新增主题也很麻烦

## 方案小结

通过以上两个方案，我们可以看到对于样式的加载问题上的考量就类似于在纠结是做SPA单页应用还是MPA多页应用项目一样。两种其实都误伤大雅，但是最重要的是要保证在后续的持续开发迭代中怎样会更方便。因此我们还可以基于以上存在的问题和方案做进一步的增强。

在做主题切换技术调研时，看到了网友的一条建议：

![img](https://cdn.nlark.com/yuque/0/2023/webp/785653/1675754050239-305323b6-a4fb-456b-ad03-6e51688029c9.webp) 

因此下面的几个方案主要是针对变量来做样式切换

## 方案3：CSS变量+类名切换

灵感参考：[Vue3官网](https://link.juejin.cn/?target=https%3A%2F%2Fstaging-cn.vuejs.org%2F)在Vue3官网有一个暗黑模式切换按钮，点击之后就会平滑地过渡，虽然Vue3中也有一个v-bind特性可以实现动态样式绑定，但经过观察以后Vue官网并没有采取这个方案，针对Vue3的v-bind特性在接下来的方案中会细说。大体思路跟方案2相似，依然是提前将样式文件载入，切换时将指定的根元素类名更换。不过这里相对灵活的是，默认在根作用域下定义好CSS变量，只需要在不同的主题下更改CSS变量对应的取值即可。顺带提一下，在Vue3官网还使用了color-scheme: dark;将系统的滚动条设置为了黑色模式，使样式更加统一。

```css
html.dark {
  color-scheme: dark;
}
```

实现方案如下：

```css
/* 定义根作用域下的变量 */
:root {
  --theme-color: #333;
  --theme-background: #eee;
}
/* 更改dark类名下变量的取值 */
.dark{
  --theme-color: #eee;
  --theme-background: #333;
}
/* 更改pink类名下变量的取值 */
.pink{
  --theme-color: #fff;
  --theme-background: pink;
}

.box {
  transition: all .2s;
  width: 100px;
  height: 100px;
  border: 1px solid #000;
  /* 使用变量 */
  color: var(--theme-color);
  background: var(--theme-background);
}

```

表现效果如下： 

![img](https://cdn.nlark.com/yuque/0/2023/webp/785653/1675754050730-ec55fbe8-0d5c-4fc2-8f16-597286e7da84.webp)

### 优点：

- 不用重新加载样式文件，在样式切换时不会有卡顿
- 在需要切换主题的地方利用var()绑定变量即可，不存在优先级问题
- 新增或修改主题方便灵活，仅需新增或修改CSS变量即可，在var()绑定样式变量的地方就会自动更换

### 缺点：

- IE兼容性（忽略不计）
- 首屏加载时会牺牲一些时间加载样式资源

## 方案4：Vue3新特性（v-bind）

虽然这种方式存在局限性只能在Vue开发中使用，但是为Vue项目开发者做动态样式更改提供了又一个不错的方案。

### 简单用法

```html
<script setup>
  // 这里可以是原始对象值，也可以是ref()或reactive()包裹的值，根据具体需求而定
  const theme = {
    color: 'red'
  }
</script>

<template>
<p>hello</p>
</template>

<style scoped>
  p {
    color: v-bind('theme.color');
  }
</style>
```

Vue3中在style样式通过v-bind()绑定变量的原理其实就是给元素绑定CSS变量，在绑定的数据更新时调用 [CSSStyleDeclaration.setProperty](https://link.juejin.cn/?target=https%3A%2F%2Fdeveloper.mozilla.org%2Fzh-CN%2Fdocs%2FWeb%2FAPI%2FCSSStyleDeclaration%2FsetProperty) 更新CSS变量值。

### 实现思考

前面方案3基于CSS变量绑定样式是在:root上定义变量，然后在各个地方都可以获取到根元素上定义的变量。现在的方案我们需要考虑的问题是，如果是基于JS层面如何在各个组件上优雅地使用统一的样式变量？我们可以利用Vuex或Pinia对全局样式变量做统一管理，如果不想使用类似的插件也可以自行封装一个hook，大致如下：

```ts
// 定义暗黑主题变量
export default {
  fontSize: '16px',
  fontColor: '#eee',
  background: '#333',
};
// 定义白天主题变量
export default {
  fontSize: '20px',
  fontColor: '#f90',
  background: '#eee',
};
import { shallowRef } from 'vue';
// 引入主题
import theme_day from './theme_day';
import theme_dark from './theme_dark';

// 定义在全局的样式变量
const theme = shallowRef({});

export function useTheme() {
  // 尝试从本地读取
  const localTheme = localStorage.getItem('theme');
  theme.value = localTheme ? JSON.parse(localTheme) : theme_day;
  
  const setDayTheme = () => {
    theme.value = theme_day;
  };
  
  const setDarkTheme = () => {
    theme.value = theme_dark;
  };
  
  return {
    theme,
    setDayTheme,
    setDarkTheme,
  };
}
```

使用自己封装的主题hook

```vue
<script setup lang="ts">
import { useTheme } from './useTheme.ts';
import MyButton from './components/MyButton.vue';
  
const { theme } = useTheme();
</script>

<template>
  <div class="box">
    <span>Hello</span>
  </div>
  <my-button />
</template>

<style lang="scss">
.box {
  width: 100px;
  height: 100px;
  background: v-bind('theme.background');
  color: v-bind('theme.fontColor');
  font-size: v-bind('theme.fontSize');
}
</style>
<script setup lang="ts">
import { useTheme } from '../useTheme.ts';
  
const { theme, setDarkTheme, setDayTheme } = useTheme();
  
const change1 = () => {
  setDarkTheme();
};
  
const change2 = () => {
  setDayTheme();
};
</script>

<template>
  <button class="my-btn" @click="change1">dark</button>
  <button class="my-btn" @click="change2">day</button>
</template>

<style scoped lang="scss">
.my-btn {
  color: v-bind('theme.fontColor');
  background: v-bind('theme.background');
}
</style>
```

表现效果如下： 

![img](https://cdn.nlark.com/yuque/0/2023/webp/785653/1675754054897-fa23acba-7789-452f-baf4-fe9e808fc4e3.webp)其实从这里可以看到，跟Vue的响应式原理一样，只要数据发生改变，Vue就会把绑定了变量的地方通通更新。

### 优点：

- 不用重新加载样式文件，在样式切换时不会有卡顿
- 在需要切换主题的地方利用v-bind绑定变量即可，不存在优先级问题
- 新增或修改主题方便灵活，仅需新增或修改JS变量即可，在v-bind()绑定样式变量的地方就会自动更换

### 缺点：

- IE兼容性（忽略不计）
- 首屏加载时会牺牲一些时间加载样式资源
- 这种方式只要是在组件上绑定了动态样式的地方都会有对应的编译成哈希化的CSS变量，而不像方案3统一地就在:root上设置（不确定在达到一定量级以后的性能），也可能正是如此，Vue官方也并未采用此方式做全站的主题切换

## 方案5：SCSS + mixin + 类名切换

主要是运用SCSS的混合+CSS类名切换，其原理主要是将使用到mixin混合的地方编译为固定的CSS以后，再通过类名切换去做样式的覆盖，实现方案如下：**定义SCSS变量**：

```css
/* 字体定义规范 */
$font_samll:12Px;
$font_medium_s:14Px;
$font_medium:16Px;
$font_large:18Px;

/* 背景颜色规范(主要) */
$background-color-theme: #d43c33;//背景主题颜色默认(网易红)
$background-color-theme1: #42b983;//背景主题颜色1(QQ绿)
$background-color-theme2: #333;//背景主题颜色2(夜间模式)

/* 背景颜色规范(次要) */ 
$background-color-sub-theme: #f5f5f5;//背景主题颜色默认(网易红)
$background-color-sub-theme1: #f5f5f5;//背景主题颜色1(QQ绿)
$background-color-sub-theme2: #444;//背景主题颜色2(夜间模式)

/* 字体颜色规范(默认) */
$font-color-theme : #666;//字体主题颜色默认(网易)
$font-color-theme1 : #666;//字体主题颜色1(QQ)
$font-color-theme2 : #ddd;//字体主题颜色2(夜间模式)

/* 字体颜色规范(激活) */
$font-active-color-theme : #d43c33;//字体主题颜色默认(网易红)
$font-active-color-theme1 : #42b983;//字体主题颜色1(QQ绿)
$font-active-color-theme2 : #ffcc33;//字体主题颜色2(夜间模式)

/* 边框颜色 */
$border-color-theme : #d43c33;//边框主题颜色默认(网易)
$border-color-theme1 : #42b983;//边框主题颜色1(QQ)
$border-color-theme2 : #ffcc33;//边框主题颜色2(夜间模式)

/* 字体图标颜色 */
$icon-color-theme : #ffffff;//边框主题颜色默认(网易)
$icon-color-theme1 : #ffffff;//边框主题颜色1(QQ)
$icon-color-theme2 : #ffcc2f;//边框主题颜色2(夜间模式)
$icon-theme : #d43c33;//边框主题颜色默认(网易)
$icon-theme1 : #42b983;//边框主题颜色1(QQ)
$icon-theme2 : #ffcc2f;//边框主题颜色2(夜间模式)

```

**定义混合mixin**：

```css
@import "./variable.scss";

@mixin bg_color(){
  background: $background-color-theme;
  [data-theme=theme1] & {
    background: $background-color-theme1;
  }
  [data-theme=theme2] & {
    background: $background-color-theme2;
  }
}
@mixin bg_sub_color(){
  background: $background-color-sub-theme;
  [data-theme=theme1] & {
    background: $background-color-sub-theme1;
  }
  [data-theme=theme2] & {
    background: $background-color-sub-theme2;
  }
}

@mixin font_color(){
  color: $font-color-theme;
  [data-theme=theme1] & {
    color: $font-color-theme1;
  }
  [data-theme=theme2] & {
    color: $font-color-theme2;
  }
}
@mixin font_active_color(){
  color: $font-active-color-theme;
  [data-theme=theme1] & {
    color: $font-active-color-theme1;
  }
  [data-theme=theme2] & {
    color: $font-active-color-theme2;
  }
}

@mixin icon_color(){
    color: $icon-color-theme;
    [data-theme=theme1] & {
        color: $icon-color-theme1;
    }
    [data-theme=theme2] & {
        color: $icon-color-theme2;
    }
}

@mixin border_color(){
  border-color: $border-color-theme;
  [data-theme=theme1] & {
    border-color: $border-color-theme1;
  }
  [data-theme=theme2] & {
    border-color: $border-color-theme2;
  }
}
<template>
  <div class="header" @click="changeTheme">
    <div class="header-left">
      <slot name="left">左边</slot>
    </div>
    <slot name="center" class="">中间</slot>
    <div class="header-right">
      <slot name="right">右边</slot>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'Header',
    methods: {
      changeTheme () {
        document.documentElement.setAttribute('data-theme', 'theme1')
      }
    }
  }
</script>

<style scoped lang="scss">
@import "../assets/css/variable";
@import "../assets/css/mixin";
.header{
  width: 100%;
  height: 100px;
  font-size: $font_medium;
  @include bg_color();
}
</style>
```

表现效果如下：

![img](https://cdn.nlark.com/yuque/0/2023/webp/785653/1675754054944-24f0582f-5b32-40d2-8c90-81075b444d48.webp)

可以发现，使用mixin混合在SCSS编译后同样也是将所有包含的样式全部加载：

![img](https://cdn.nlark.com/yuque/0/2023/webp/785653/1675754057187-0917c66d-d0e7-436d-83d4-1cd7fb9c6c83.webp)

这种方案最后得到的结果与方案2类似，只是在定义主题时由于是直接操作的SCSS变量，会更加灵活。

### 优点：

- 不用重新加载样式文件，在样式切换时不会有卡顿
- 在需要切换主题的地方利用mixin混合绑定变量即可，不存在优先级问题
- 新增或修改主题方便灵活，仅需新增或修改SCSS变量即可，经过编译后会将所有主题全部编译出来

### 缺点：

- 首屏加载时会牺牲一些时间加载样式资源

## 方案6：CSS变量+动态setProperty

此方案较于前几种会更加灵活，不过视情况而定，这个方案适用于由用户根据颜色面板自行设定各种颜色主题，这种是主题颜色不确定的情况，而前几种方案更适用于定义预设的几种主题。方案参考：[vue-element-plus-admin](https://link.juejin.cn/?target=https%3A%2F%2Fgitee.com%2Fkailong110120130%2Fvue-element-plus-admin) 主要实现思路如下：只需在全局中设置好预设的全局CSS变量样式，无需单独为每一个主题类名下重新设定CSS变量值，因为主题是由用户**动态**决定。

```css
:root {
  --theme-color: #333;
  --theme-background: #eee;
}

```

定义一个工具类方法，用于修改指定的CSS变量值，调用的是 [CSSStyleDeclaration.setProperty](https://link.juejin.cn/?target=https%3A%2F%2Fdeveloper.mozilla.org%2Fzh-CN%2Fdocs%2FWeb%2FAPI%2FCSSStyleDeclaration%2FsetProperty)

```ts
export const setCssVar = (prop: string, val: any, dom = document.documentElement) => {
  dom.style.setProperty(prop, val)
}
```

在样式发生改变时调用此方法即可

```css
setCssVar('--theme-color', color)
```

表现效果如下：

![img](https://cdn.nlark.com/yuque/0/2023/webp/785653/1675754061190-6e558904-d356-4b11-9182-f19aaa18cd99.webp)

### vue-element-plus-admin主题切换源码：

![img](https://cdn.nlark.com/yuque/0/2023/webp/785653/1675754080022-2e8d5215-b933-49c6-a82c-288583c49931.webp)

这里还用了vueuse的useCssVar不过效果和Vue3中使用v-bind绑定动态样式是差不多的，底层都是调用的 [CSSStyleDeclaration.setProperty](https://link.juejin.cn/?target=https%3A%2F%2Fdeveloper.mozilla.org%2Fzh-CN%2Fdocs%2FWeb%2FAPI%2FCSSStyleDeclaration%2FsetProperty) 这个api，这里就不多赘述vueuse中的用法。

![img](https://cdn.nlark.com/yuque/0/2023/webp/785653/1675754084423-a5cc7c16-1567-42f9-b861-37e7ebe524ce.webp)

### 优点：

- 不用重新加载样式文件，在样式切换时不会有卡顿
- 仔细琢磨可以发现其原理跟方案4利用Vue3的新特性v-bind是一致的，只不过此方案只在:root上动态更改CSS变量而Vue3中会将CSS变量绑定到任何依赖该变量的节点上。
- 需要切换主题的地方只用在:root上动态更改CSS变量值即可，不存在优先级问题
- 新增或修改主题方便灵活

### 缺点：

- IE兼容性（忽略不计）
- 首屏加载时会牺牲一些时间加载样式资源（相对于前几种预设好的主题，这种方式的样式定义在首屏加载基本可以忽略不计）

## 方案总结

说明：两种主题方案都支持并不代表一定是最佳方案，视具体情况而定。

![image.png](https://cdn.nlark.com/yuque/0/2023/png/785653/1676028576681-79fe1e79-ff66-477a-866c-73690a998fa6.png?x-oss-process=image%2Fresize%2Cw_1500%2Climit_0)
