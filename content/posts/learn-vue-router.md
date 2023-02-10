---
title: "vue-router 源码分析"
description: "VueRouter 源码解析和应用"
publishedAt: '2020-12-01'
status: published
tags: 
  - vue
---

:Toc

::tip
首先阅读源码之前最好是将 `Vue` 和 `vue-router` 的源码下载下来，然后第一遍阅读建议先跟着[官方文档](https://router.vuejs.org/zh/)先走一遍基础用法。然后第二遍开始阅读源码，首先理清楚各层级目录的作用和抽出一些核心的文件出来，过一遍代码的同时写个小的 `demo` 边看边打断点调试，看不懂没关系，可以边看边参考一些总结的比较好的文章，最后将整个注册到 `init`到生成 `matcher` 等等过程根据自己的理解整理出来，然后画一画相关的知识脑图加深印象。
::

## 前置知识: flow 语法

`JS` 在编译过程中可能看不出一些隐蔽的错误，但在运行过程中会报各种各样的 `bug`。[Flow](https://flow.org/en/docs/getting-started/) 的作用就是编译期间进行静态类型检查，尽早发现错误，抛出异常。

`Vue` 、`Vue-router` 等大型项目往往需要这种工具去做静态类型检查以保证代码的可维护性和可靠性。


**使用 Flow**

首先在 `index.js` 文件中输入以下代码

```js
// @flow
function foo(x: ?number): string {
  if (x) {
    return x;
  }
  return "default string";
}

foo("hello")

```
然后安装 `flow`,并初始化 `.flowconfig`

```bash
npm install flow-bin -g

cd test

flow init

flow
```
这个时候不出意外就会抛出异常提示，这就是简单的 `flow` 使用方法。

**定义不同类型的类型声明**

字符串:

```js
// @flow
function concat(a: string, b: string) {
  return a + b;
}

concat("A", "B"); // Works!
concat(1, 2); // Error!
```

boolean:

```js
// @flow
function acceptsBoolean(value: boolean) {
  // ...
}

acceptsBoolean(true);  // Works!
acceptsBoolean(false); // Works!
acceptsBoolean("foo"); // Error!
```

number + 设置默认值 :

```js
// @flow
function concat(a: number = 1, b: number) {
  return a + b;
}

concat("A", "B"); // Error!
concat(1, 2); // Works!
```

null 或者 undefined(void处理):

```js
// @flow
function acceptsNull(value: null) {
  /* ... */
}

function acceptsUndefined(value: void) {
  /* ... */
}
```

动态类型:

```js
// @flow
function acceptsMaybeString(value: ?string) {
  // value可能为值类型的某一个
}

// @flow
function acceptNumberOrString(value: string | number){

}
```

数组:

```js
 // @flow
 function acceptArray(value: Array<number>) {

 }
```

对象:

```js
 // @flow
 function acceptObject(value: obj){

 }
```

另外还支持自定义类型等等，具体用法还需要参考 [flow官网](https://flow.org/en/docs/types/primitives/)

## 注册

我们平时在使用 `Vue-Router` 的时候通常需要在 `main.js` 中初始化 `Vue` 实例时将 `vue-router` 实例对象当做参数传入

```js
import Router from 'vue-router'
Vue.use(Router)

const routes = [
  {
    path: "/",
    component: goods
  },
  {
    path: "/comment",
    name: "comment",
    component: comment
  },
  {
    path: "/seller",
    name: "seller",
    component: seller
  }
];

const router = new Router({
  mode: "history",
  linkActiveClass: "active",
  //   指定点击后的样式名
  base: process.env.BASE_URL,
  routes
});

new Vue({
    router,
    store,
    render: h => h(App)
}).$mount("#app");
```
## Vue.use

那么 `Vue.use(Router)` 又在做什么事情呢

问题定位到 `Vue` 源码中的 `src/core/global-api/use.js`

```js
export function initUse (Vue: GlobalAPI) {
  Vue.use = function (plugin: Function | Object) {
    // 拿到installPlugins 
    const installedPlugins = (this._installedPlugins || (this._installedPlugins = []))
    // 保证不会重复注册
    if (installedPlugins.indexOf(plugin) > -1) {
      return this
    }

    // 获取第一个参数plugins意外的参数
    const args = toArray(arguments, 1)
    // 将Vue实例添加到参数
    args.unshift(this)
    // 执行plugin的install方法 每个insatll方法的第一个参数都会变成Vue，不需要额外引入
    if (typeof plugin.install === 'function') {
      plugin.install.apply(plugin, args)
    } else if (typeof plugin === 'function') {
      plugin.apply(null, args)
    }
    // 最后将installPlugins保存 
    installedPlugins.push(plugin)
    return this
  }
}
```
可以看到 `Vue` 的 `use` 方法会接受一个 `plugin` 参数，然后使用 `installPlugins`数组 保存已经注册过的 `plugin` 。 首先保证 `plugin` 不被重复注册，然后将 `Vue` 从函数参数中取出，将整个 `Vue` 作为 `plugin`的 `install` 方法的第一个参数，这样做的好处就是不需要麻烦的另外引入 `Vue` ,便于操作, 接着就去判断 `plugin` 上是否存在 `install` 方法。存在则将赋值后的参数传入执行 ，最后将所有的存在 `install` 方法的 `plugin` 交给 `installPlugins` 维护。 

## install

了解清楚 `Vue.use` 的结构之后，可以得出 `Vue` 注册插件其实就是在执行插件的 `install` 方法，参数的第一项就是`Vue`,所以我们将代码定位到 `vue-router` 源码中的 `src/install.js`

```js
// 保存Vue的局部变量
export let _Vue

export function install (Vue) {
  // 如果已安装
  if (install.installed && _Vue === Vue) return
  install.installed = true
 // 局部变量保留传入的Vue
  _Vue = Vue

  const isDef = v => v !== undefined

  const registerInstance = (vm, callVal) => {
    let i = vm.$options._parentVnode
    if (isDef(i) && isDef(i = i.data) && isDef(i = i.registerRouteInstance)) {
      i(vm, callVal)
    }
  }

  // 全局混入钩子函数 每个组件都会有这些钩子函数，执行就会走这里的逻辑
  Vue.mixin({
    beforeCreate () {
      if (isDef(this.$options.router)) {
        // new Vue时传入的根组件router router对象传入时就可以拿到this.$options.router
        // 跟router
        this._routerRoot = this
        this._router = this.$options.router
        this._router.init(this)
        // 变成响应式
        Vue.util.defineReactive(this, '_route', this._router.history.current)
      } else {
        // 非根组件访问根组件通过$parent
        this._routerRoot = (this.$parent && this.$parent._routerRoot) || this
      }
      registerInstance(this, this)
    },
    destroyed () {
      registerInstance(this)
    }
  })

  // 通过get方法 原型加入$router 和 $route
  Object.defineProperty(Vue.prototype, '$router', {
    get () { return this._routerRoot._router }
  })

  Object.defineProperty(Vue.prototype, '$route', {
    get () { return this._routerRoot._route }
  })
// 全局注册
  Vue.component('RouterView', View)
  Vue.component('RouterLink', Link)
// 获取合并策略
  const strats = Vue.config.optionMergeStrategies
  // use the same hook merging strategy for route hooks
  strats.beforeRouteEnter = strats.beforeRouteLeave = strats.beforeRouteUpdate = strats.created
}
```

可以看到这段代码核心部分就是在执行 `install` 方法时使用 `mixin` 的方式将每个组件都混入 `beforeCreate`, `destroyed` 这两个生命周期钩子。在 `beforeCreate` 函数中会去判断当前传入的 `router` 实例是否是跟组件，如果是，则将 `_routerRoot` 赋值为当前组件实例、`_router` 赋值为传入的`VueRouter` 实例对象，接着执行 `init` 方法初始化 `router`,然后将 `this_route` 响应式化。非根组件的话 `_routerRoot`  就指向 `$parent` 父实例。

然后执行 `registerInstance(this,this)` 方法，该方法后文会分析。原型加入 `$router` 和 `$route` ，最后注册 `ROuterView` 和 `RouterLink`，这就是整个 `install`的过程。

## 总结

 `Vue.use(plugin)` 实际上在执行 plugin上的 `install` 方法，`insatll` 方法有个重要的步骤就是使用 `mixin` 在组件中混入 `beforeCreate` , `destory` 这俩个生命周期钩子，然后在 `beforeCreate` 这个钩子进行初始化。

## vueRouter

接着就是这个最重要的 `class`: `vueRouter` 。这一部分代码比较多，所以不一一列举，挑重点分析，[vueRouter源码地址](https://github.com/vuejs/vue-router/blob/v3.1.2/src/index.js)

## 构造函数

```js
  constructor (options: RouterOptions = {}) {
    this.app = null
    this.apps = []
    this.options = options
    this.beforeHooks = []
    this.resolveHooks = []
    this.afterHooks = []
    this.matcher = createMatcher(options.routes || [], this)

    // 一般分两种模式 hash和history路由 第三种是抽象模式
    let mode = options.mode || 'hash'
    // 判断当前传入的配置是否能使用history模式
    this.fallback = mode === 'history' && !supportsPushState && options.fallback !== false
    // 降级处理
    if (this.fallback) {
      mode = 'hash'
    }
    if (!inBrowser) {
      mode = 'abstract'
    }
    this.mode = mode

    // 根据模式实例化不同的history history对象会对路由进行管理 继承于history class
    switch (mode) {
      case 'history':
        this.history = new HTML5History(this, options.base)
        break
      case 'hash':
        this.history = new HashHistory(this, options.base, this.fallback)
        break
      case 'abstract':
        this.history = new AbstractHistory(this, options.base)
        break
      default:
        if (process.env.NODE_ENV !== 'production') {
          assert(false, `invalid mode: ${mode}`)
        }
    }
  }
```

首先在初始化 `vueRouter` 整个对象时定义了许多变量，`app` 代表 `Vue` 实例，`options` 代表传入的配置参数，然后就是路由拦截有用的 `hooks`和重要的 `matcher`(后文会写到)。构造函数其实在做两件事情: 1. 确定当前路由使用的 `mode`，2. 实例化对应的 `history`对象。 

## init

接着完成实例化 `vueRouter` 之后，如果这个实例传入后，也就是刚开始说的将 `vueRouter` 实例在初始化 `Vue` 时传入，他会在执行 `beforeCreate` 时执行 `init` 方法`

```js
init (app: any) {
  process.env.NODE_ENV !== 'production' && assert(
    install.installed,
    `not installed. Make sure to call \`Vue.use(VueRouter)\` ` +
    `before creating root instance.`
  )
  this.apps.push(app)
  // 确保后面的逻辑只走一次
  if (this.app) {
    return
  }

  this.app = app
  const history = this.history
  if (history instanceof HTML5History) {
    history.transitionTo(history.getCurrentLocation())
  } else if (history instanceof HashHistory) {
    const setupHashListener = () => {
      history.setupListeners()
    }
    history.transitionTo(
      history.getCurrentLocation(),
      setupHashListener,
      setupHashListener
    )
  }
  history.listen(route => {
    this.apps.forEach((app) => {
      app._route = route
    })
  })
}

```
`init` 方法传入 `Vue` 实例，保存到 `this.apps` 当中。`Vue实例` 会取出当前的 `this.history`，如果是哈希路由，先走 `setupHashListener` 函数，然后调一个关键的函数 `transitionTo` ,这个函数其实调用了 `this.matcher.match` 去匹配。

## 总结

初始化路由需要传入 `vueRouter` 实例对象，然后在组件初始化阶段执行 `beforeCreate` 钩子，调用 `init` 方法，接着拿到 `this.history` 去调用 `transitionTo` 进行路由过渡。
 

## matcher

之前在 `vueRouter` 的构造函数中初始化了 `macther` ,本节将详细分析下面这句代码到底在做什么事情,以及 `match` 方法在做什么

```js
 this.matcher = createMatcher(options.routes || [], this)
```
首先将代码定位到 `create-matcher.js`

```js
export function createMatcher (
  routes: Array<RouteConfig>,
  router: VueRouter
): Matcher {
  // 创建映射表
  const { pathList, pathMap, nameMap } = createRouteMap(routes)

  function addRoutes(routes){...}

  function match (
    raw: RawLocation,
    currentRoute?: Route,
    redirectedFrom?: Location
  ): Route {...}

  function redirect (
    record: RouteRecord,
    location: Location
  ): Route {...}

  function alias (
    record: RouteRecord,
    location: Location,
    matchAs: string
  ): Route {...}

  function _createRoute (
    record: ?RouteRecord,
    location: Location,
    redirectedFrom?: Location
  ): Route {...}

  function matchRoute (
    regex: RouteRegExp,
    path: string,
    params: Object
  ): boolean {...}
}
```

`createMatcher` 接受俩参数,分别是 `routes` ,这个就是我们平时在 `router.js` 定义的路由表配置，然后还有一个参数是 `router` 他是 `new vueRouter` 返回的实例。

## create-route-map

下面这句代码是在创建一张 `path-record`,`name-record` 的映射表，我们将代码定位到 `create-route-map.js`

```js
export function createRouteMap (
  routes: Array<RouteConfig>,
  oldPathList?: Array<string>,
  oldPathMap?: Dictionary<RouteRecord>,
  oldNameMap?: Dictionary<RouteRecord>
): {
  pathList: Array<string>,
  pathMap: Dictionary<RouteRecord>,
  nameMap: Dictionary<RouteRecord>
} {
  // debugger
  // 记录所有的 path
  const pathList: Array<string> = oldPathList || []
  // 记录 path-RouteRecord 的 Map
  const pathMap: Dictionary<RouteRecord> = oldPathMap || Object.create(null)
   // 记录 path-RouteRecord 的 Map
  const nameMap: Dictionary<RouteRecord> = oldNameMap || Object.create(null)
  // 遍历所有的 route 生成对应映射表
  routes.forEach(route => {
    addRouteRecord(pathList, pathMap, nameMap, route)
  })
  // 调整优先级
  for (let i = 0, l = pathList.length; i < l; i++) {
    if (pathList[i] === '*') {
      pathList.push(pathList.splice(i, 1)[0])
      l--
      i--
    }
  }

  return {
    pathList,
    pathMap,
    nameMap
  }
}
```
`createRouteMap` 需要传入路由配置，支持传入旧路径数组和旧的 `Map`这一步是为后面递归和 `addRoutes` 做好准备。 首先用三个变量记录 `path` ,`pathMap`,`nameMap` ，接着我们来看 `addRouteRecord` 这个核心方法

这一块代码太多了，列举几个重要的步骤

```js
const pathToRegexpOptions: PathToRegexpOptions =
    route.pathToRegexpOptions || {}
    
const normalizedPath = normalizePath(path, parent, pathToRegexpOptions.strict)

const record: RouteRecord = {
  path: normalizedPath,
  regex: compileRouteRegex(normalizedPath, pathToRegexpOptions),
  // route对应的组件
  components: route.components || { default: route.component },
  // 组件实例
  instances: {},
  name,
  parent,
  matchAs,
  redirect: route.redirect,
  beforeEnter: route.beforeEnter,
  meta: route.meta || {},
  props: route.props == null
    ? {}
    : route.components
      ? route.props
      : { default: route.props }
}
```
使用 `recod` 记录路由配置有利于后续路径切换时计算出新路径，这里的 `path` 其实是通过 `path` 和 `parent` 拼接处的路径。然后 `regex` 使用一个库将 `path` 解析为正则表达式。

如果 `route` 有子节点就递归调用 `addRouteRecord`
```js
 // 如果有children 递归调用addRouteRecord
    route.children.forEach(child => {
      const childMatchAs = matchAs
        ? cleanPath(`${matchAs}/${child.path}`)
        : undefined
      addRouteRecord(pathList, pathMap, nameMap, child, record, childMatchAs)
    })
```

最后映射一张表,并将 `record·path` 保存进 `pathList`, `nameMap` 逻辑相似就不列举了

```js
  if (!pathMap[record.path]) {
    pathList.push(record.path)
    pathMap[record.path] = record
  }
```

废了这么大劲将 `pathList` 和 `pathMap` 和 `nameMap` 抽出来是为啥呢，首先 `pathList` 是记录路由配置所有的 `path`，然后 `pathMap` 和 `nameMap` 方便我们传入 `path` 或者 `name` 快速定位到一个 `record` ,然后辅助后续路径切换计算路由滴。

## addRoutes

这是在 `vue2.2.0` 之后新添加的 `api` ,或许很多情况路由并不是写死的，需要动态添加路由。有了前面的 `createRouteMap` 的基础上我们只需要传入 `routes` 、`pathList`、 `pathMap` 和 `nameMap` 即可，他就能在原基础上修改

```js
function addRoutes (routes) {
  createRouteMap(routes, pathList, pathMap, nameMap)
}
```
并且看到在 `createMathcer` 最后返回了这个方法，所以我们就可以使用这个方法

```js
return {
    match,
    addRoutes
  }
```

## match

```js
function match (
  raw: RawLocation,
  currentRoute?: Route,
  redirectedFrom?: Location
): Route {
  ...
}
```

接下来就是 `match` 方法，它接收 3 个参数，其中 `raw` 是 `RawLocation` 类型，它可以是一个 `url` 字符串，也可以是一个 `Location` 对象；`currentRoute` 是 `Route` 类型，它表示当前的路径；`redirectedFrom` 和重定向相关。

`match` 方法返回的是一个路径，它的作用是根据传入的 `raw` 和当前的路径 `currentRoute` 计算出一个新的路径并返回。至于他是如何计算出这条路径的可以详细看一下如何计算出 `location` 的 `normalizeLocation` 方法和 `match` 方法后面的逻辑。

## 总结

- `createMatcher`: 根据路由的配置描述建立映射表，包括路径、名称到路由 `record` 的映射关系, 最重要的就是 `create-route-map` 这个方法，这里也是动态路由匹配和嵌套路由的原理。

- `addRoutes`: 动态添加路由配置

- `match`: 根据传入的 `raw` 和当前的路径 `currentRoute` 计算出一个新的路径并返回。

## 路由模式

`vue-router` 支持三种路由模式(mode)：`hash`、`history`、`abstract`，其中 `abstract` 是在非浏览器环境下使用的路由模式

这一部分在前面初始化 `vueRouter` 对象时提到过,首先会拿配置项的模式 ，然后根据当前传入的配置判断当前浏览器是否支持这种模式，默认`ie9` 以下会降级为 `hash`。 然后根据不同的模式去初始化不同的 `history` 实例。

```js
// 一般分两种模式 hash和history路由 第三种是抽象模式
    let mode = options.mode || 'hash'
    // 判断当前传入的配置是否能使用history模式
    this.fallback = mode === 'history' && !supportsPushState && options.fallback !== false
    // 降级处理
    if (this.fallback) {
      mode = 'hash'
    }
    if (!inBrowser) {
      mode = 'abstract'
    }
    this.mode = mode

    // 根据模式实例化不同的history history对象会对路由进行管理 继承于history class
    switch (mode) {
      case 'history':
        this.history = new HTML5History(this, options.base)
        break
      case 'hash':
        this.history = new HashHistory(this, options.base, this.fallback)
        break
      case 'abstract':
        this.history = new AbstractHistory(this, options.base)
        break
      default:
        if (process.env.NODE_ENV !== 'production') {
          assert(false, `invalid mode: ${mode}`)
        }
    }
```

## 总结

`vue-router` 支持三种路由模式，`hash`、`history` 和 `abstract` 。默认为 `hash` ,如果当前浏览器不支持 `history` 则会做降级处理，然后完成 `history`的初始化。

## router-view & router-link

`vue-router` 在 `install` 时全局注册了两个组件一个是 `router-view` 一个是 `router-link` ，这俩个组件都是典型的函数式组件。

## router-view

首先在 `router` 组件执行 `beforeCreate` 这个钩子时，把 `this._route` 转为了响应式的一个对象

```js
 Vue.util.defineReactive(this, '_route', this._router.history.current)
```

所以说每次路由切换都会触发 `router-view` 重新 `render` 从而渲染出新的视图。

核心的 `render` 函数作用请看代码注释

```js
  render (_, { props, children, parent, data }) {
    // 标志
    data.routerView = true
    // 获取跟 dom
    const h = parent.$createElement
    const name = props.name
    // 注册时定义的原型 $route 可以理解成当前路径
    const route = parent.$route
    // 缓存相关
    const cache = parent._routerViewCache || (parent._routerViewCache = {})
    
    // 通过 depth 由router-view组件向上遍历直到跟组件，遇到其他的router-view组件则路由深度+1
    let depth = 0
    let inactive = false
    while (parent && parent._routerRoot !== parent) {
      // parent.$vnode.data.routerView 为 true 则代表向上寻找的组件也存在嵌套的 router-view 
      if (parent.$vnode && parent.$vnode.data.routerView) {
        depth++
      }
      if (parent._inactive) {
        inactive = true
      }
      parent = parent.$parent
    }
    data.routerViewDepth = depth

    if (inactive) {
      return h(cache[name], data, children)
    }

   // 通过 matched 记录寻找出对应的 RouteRecord 
    const matched = route.matched[depth]
    if (!matched) {
      cache[name] = null
      return h()
    }
 // 通过 RouteRecord 找到 component
    const component = cache[name] = matched.components[name]
   
   // 往父组件注册registerRouteInstance方法
    data.registerRouteInstance = (vm, val) => {     
      const current = matched.instances[name]
      if (
        (val && current !== vm) ||
        (!val && current === vm)
      ) {
        matched.instances[name] = val
      }
    }
  // 渲染组件
    return h(component, data, children)
  }
```

触发更新也就是 `setter` 的调用，位于 `src/index.js`

```js
history.listen(route => {
  this.apps.forEach((app) => {
    // 触发 setter
    app._route = route
  })
})
```
## router-link

分析几个重要的部分

- 设置 `active` 路由样式

`router-link` 之所以可以添加 `router-link-active` 和 `router-link-exact-active` 这两个 `class` 去修改样式，是因为在执行 `render` 函数时，会根据当前的路由状态，给渲染出来的 `active` 元素添加 `class`

```js
render (h: Function) {
  ...
  const globalActiveClass = router.options.linkActiveClass
  const globalExactActiveClass = router.options.linkExactActiveClass
  // Support global empty active class
  const activeClassFallback = globalActiveClass == null
    ? 'router-link-active'
    : globalActiveClass
  const exactActiveClassFallback = globalExactActiveClass == null
    ? 'router-link-exact-active'
    : globalExactActiveClass
    ...
}
```

- `router-link` 默认渲染为 `a` 标签，如果不是会去向上查找出第一个 `a` 标签

```js
 if (this.tag === 'a') {
      data.on = on
      data.attrs = { href }
    } else {
      // find the first <a> child and apply listener and href
      const a = findAnchor(this.$slots.default)
      if (a) {
        // in case the <a> is a static node
        a.isStatic = false
        const aData = (a.data = extend({}, a.data))
        aData.on = on
        const aAttrs = (a.data.attrs = extend({}, a.data.attrs))
        aAttrs.href = href
      } else {
        // 不存在则渲染本身元素
        data.on = on
      }
    }
```

- 切换路由，触发相应事件

```js
const handler = e => {
  if (guardEvent(e)) {
    if (this.replace) {
      // replace路由
      router.replace(location)
    } else {
      // push 路由
      router.push(location)
    }
  }
}
```

## 权限控制动态路由原理分析

我相信，开发过后台项目的同学经常会碰到以下的场景: 一个系统分为不同的角色，然后不同的角色对应不同的操作菜单和操作权限。例如: 教师可以查询教师自己的个人信息查询然后还可以查询操作学生的信息和学生的成绩系统、学生用户只允许查询个人成绩和信息，不允许更改。在 `vue2.2.0` 之前还没有加入 `addRoutes` 这个 API 是十分困难的的。

目前主流的路由权限控制的方式是:

1. 前端在登录之后获取到 `JWT 令牌` 前端在全局路由拦截,并在 `route.js` 定义一套前端的路由表

2. 后端根据登录信息返回给前端对应的身份信息，并且涉及到身份信息操作的接口都需要做身份校验处理。 当然这里也可以在数据库中提前定义好一张 `roles-router` 表,然后在查询用户信息时将对应的路由树状表返给前端

3. 前端根据当前的角色将对应的权限的路由表拼接到常规路由表后面


### 登录生成动态路由全过程

了解如何控制动态路由之后，下面是我画的一张全过程流程图
![](//p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/cf68a840ca31484c985517c869e2873c~tplv-k3u1fbpfcp-zoom-1.image)

前端在 `beforeEach` 中判断:

- 缓存中存在 `JWT令牌`
  - 访问 `/login` : 重定向到首页`('/')`
  - 访问 `/login` 以外的路由:  首次访问，获取用户角色信息，然后生成动态路由，然后访问以 `replace` 模式访问 `/xxx` 路由。这种模式用户在登录之后不会在 `history` 存放记录，回退直接显示空白页面

- 不存在 `JWT令牌`
  - 路由在白名单中: 正常访问 `/xxx` 路由
  - 不在白名单中: 重定向到 `/login` 页面

### 结合框架源码分析

下面结合 `vue-element-admin` 的源码分析该框架中如何处理路由逻辑的。

### 路由访问逻辑分析

首先可以定位到和入口文件 `main.js` 同级的 `permission.js` , 全局路由守卫处理就在此

```js
const whiteList = ['/login', '/register'] // 路由白名单，不会重定向

// 全局路由守卫
router.beforeEach(async(to, from, next) => {
  NProgress.start() //路由加载进度条
  // 设置meta标题
  document.title = getPageTitle(to.meta.title)
  // 判断token是否存在
  const hasToken = getToken()
  if (hasToken) {
    if (to.path === '/login') {
      // 有token 跳转首页
      next({ path: '/' })
      NProgress.done()
    } else {
      const hasRoles = store.getters.roles && store.getters.roles.length > 0
      if (hasRoles) {
        next()
      } else {
        try {
          // 获取动态路由，添加到路由表中
          const { roles } = await store.dispatch('user/getInfo')
          const accessRoutes = await store.dispatch('permission/generateRoutes', roles)
          router.addRoutes(accessRoutes)
          //  使用 replace 访问路由，不会在 history 中留下记录，登录到dashbord时回退空白页面
          next({ ...to, replace: true })
        } catch (error) {
          next('/login')
          NProgress.done()
        }
      }
    }
  } else {
    // 无token
    // 白名单不用重定向 直接访问
    if (whiteList.indexOf(to.path) !== -1) {
      next()
    } else {
      // 携带参数为重定向到前往的路径
      next(`/login?redirect=${to.path}`)
      NProgress.done()
    }
  }
})

```

这里的代码我都添加了注释方便大家好去理解，总结为一句话就是访问路由 `/xxx` ，首先需要校验 `token`是否存在，如果有就判断是否访问的是登录路由，不是则需要判断该用户是否是第一访问首页，然后生成动态路由，如果没有 `token` 就去检查路由是否在白名单(任何情况都能访问的路由)，在的话就访问，否则重定向回登录页面。

### 结合Vuex生成动态路由

下面就是分析这一步 `const accessRoutes = await store.dispatch('permission/generateRoutes', roles)` 是怎么把路由生成出来的。

首选 `vue-element-admin` 中路由是分为两种的:
- constantRoutes: 不需要权限判断的路由

- asyncRoutes: 需要动态判断权限的路由

![](//p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/152acc3571074c03af839fbf00b5ac45~tplv-k3u1fbpfcp-zoom-1.image)

生成动态路由的源码位于 `src/store/modules/permission.js` 中的 `generateRoutes` 方法，源码如下：

```js
 generateRoutes({ commit }, roles) {
    return new Promise(resolve => {
      //   debugger
      let accessedRoutes
      if (roles.includes('admin')) {
        accessedRoutes = asyncRoutes || []
      } else {
      // 不是admin 去遍历生成对应的权限路由表
        accessedRoutes = filterAsyncRoutes(asyncRoutes, roles)
      }
      commit('SET_ROUTES', accessedRoutes)
      resolve(accessedRoutes)
    })
  }
```

从 `route.js` 读取 `asyncRoutes` 和 `constantRoutes` 之后首先判断当前角色是否是 `admin` ，是的话默认超级管理员能够访问所有的路由，当然这里也可以自定义，否则去过滤出路由权限路由表，然后保存到`Vuex`中。 最后将过滤之后的 `asyncRoutes` 和 `constantRoutes` 进行合并。

过滤权限路由的源码如下:

```js
export function filterAsyncRoutes(routes, roles) {
  const res = []
  routes.forEach(route => {
    // 浅拷贝
    const tmp = { ...route }
    if (hasPermission(roles, tmp)) {
      if (tmp.children) {
        tmp.children = filterAsyncRoutes(tmp.children, roles)
      }
      res.push(tmp)
    }
  })
  return res
}
```
首先定义一个空数组，对传入 `asyncRoutes` 进行遍历，判断每个路由是否具有权限，未命中的权限路由直接舍弃
判断权限方法如下:

```js
function hasPermission(roles, route) {
  if (route.meta && route.meta.roles) {
    // roles有对应路由元定义的role 就返回true
    return roles.some(role => route.meta.roles.includes(role))
  } else {
    return true
  }
}
```
接着需要判断二级路由、三级路由等等的情况，再做一层迭代处理，最后将过滤出来的路由推进数组返回。然后追加到 `constantRoutes`后面

```js
 SET_ROUTES: (state, routes) => {
    state.addRoutes = routes
    state.routes = constantRoutes.concat(routes)
  }
```


**动态路由生成全过程**

![](//p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/532453ffff994b01a5f3d9c70737be1f~tplv-k3u1fbpfcp-zoom-1.image)


## 总结

- `vue-router`源码
  - 注册: 执行 `install` 方法，注入生命周期钩子初始化

  - vueRouter: 当组件执行 `beforeCreate` 传入 `router` 实例时,执行 `init` 函数，然后执行 `history.transitionTo` 路由过渡

  - matcher : 根据传入的 `routes` 配置创建对应的 `pathMap` 和 `nameMap`,可以根据传入的位置和路径计算出新的位置并匹配对应的 `record`

  - router-view: 调用父组件上存储的 `$route.match` 控制路由对应的组件的渲染情况，并且支持嵌套。

  - router-link: 通过 `to` 来决定点击事件跳转的目标路由组件，并且支持渲染成不同的 `tag`,还可以修改激活路由的样式。

- 权限控制动态路由:

  - 路由逻辑: 全局路由拦截，从缓存中获取令牌，存在的话如果首次进入路由需要获取用户信息，生成动态路由，这里需要处理 `/login` 特殊情况，不存在则判断白名单然后走对应的逻辑

  - 动态生成路由: 传入需要 `router.js` 定义的两种路由。判断当前身份是否是管理员，是则直接拼接，否则需要过滤出具备权限的路由，最后拼接到常规路由后面，通过 `addRoutes` 追加。

**个人感悟**:

 或许阅读源码的作用不能像一些文档一样直接立马对日常开发有所帮助，但是它的影响是长远的，在读源码的过程中都可以学到类似闭包、设计模式、时间循环、回调等等 JS 进阶技能，并稳固并提升了你的 JS 基础。当然这篇文章缺陷的，有几个地方都没有分析到，比如导航守卫实现原理和路由懒加载实现原理，这一部分，我还在摸索当中。
 
 如果一味的死记硬背一些所谓的面经，或者直接死记硬背相关的框架行为或者 API ，你很难在遇到比较复杂的问题下面去快速定位问题，解怎么去解决问题，而且我发现很多人在使用一个新框架之后遇到点问题都会立马去提对应的 `Issues` ,但是许多问题都是因为我们并未按照设计者开发初设定的方向才导致错误的，更多都是些粗心大意造成的问题。


> 参考文章
>
> [带你全面分析vue-router源码 (万字长文)](https://juejin.im/post/6844904064367460366)
>
> [vuejs 源码解析](https://github.com/answershuto/learnVue)
