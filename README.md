# bachelor-vue

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Run your tests
```
npm run test
```

### Lints and fixes files
```
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).


# Other stuff

### Ressources used
- Icons mostly from here: https://feathericons.com/
- Notifications: https://github.com/euvl/vue-notification 

# Webassembly / AssemblyScript


### Links
_AssemblyScript Book (docs):_ 
https://docs.assemblyscript.org/
 - loader is explaining the js object returning from init Instance: https://github.com/AssemblyScript/assemblyscript/tree/master/lib/loader
 - runtime: https://github.com/AssemblyScript/assemblyscript/tree/master/std/assembly/rt

- good starting for js/ts devs - An AssemblyScript Primer: https://dev.to/jtenner/an-assemblyscript-primer-for-typescript-developers-lf1

_Using the WebAssembly JavaScript API - good overview of Memory, Table, Globals, etc.:_ https://developer.mozilla.org/en-US/docs/WebAssembly/Using_the_JavaScript_API
_Understanding the JS API:_ https://webassembly.org/getting-started/js-api/
_Calling JS functions in wasm:_ https://github.com/AssemblyScript/assemblyscript/issues/158
 
_Sharing data via buffer_ 
- Array passing back and forth between JS and AS: https://github.com/AssemblyScript/assemblyscript/issues/263 
- Most performant way to pass data JS/WASM context: https://github.com/WebAssembly/design/issues/1231
- Attempting to access detached ArrayBuffer in WASM after memory growth: https://github.com/emscripten-core/emscripten/issues/6747

_Example of draw 2 images to a assembly buffer and check the sum off bytes to be equal:_
https://webassembly.studio/?f=miiw8yu4h3

_Differences between TypeScript and AssemblyScript:_ https://dev.to/jtenner/assemblyscript-is-not-a-subset-of-typescript-4ka3 

_load wasm with WebPack:_
- Cannot import wasm in web workers: https://github.com/webpack/webpack/issues/7647
- Use with webpack?: https://github.com/herumi/mcl-wasm/issues/7
- WebPacks integrated loader: https://github.com/webpack/webpack/tree/master/examples/wasm-simple
- inside Vue: https://medium.com/@brockreece/vue-webassembly-1a09e38d0389

Guides:
- Setting up WA with Game of Life in C: https://blog.openbloc.fr/webassembly-first-steps/
- Using WebGL in a wasm Modul: https://www.freecodecamp.org/news/how-to-use-webgl-shaders-in-webassembly-1e6c5effc813/
- zoomable image viewer using OpenGL, C++ and WebAssembly: https://github.com/svoisen/wasm-imageviewer
- german introduction in the wasm topic with general thoughts: https://tech.thalia.de/frontend-spielereien-mit-webassembly/
