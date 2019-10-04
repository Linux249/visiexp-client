# bachelor-vue

# Update code on compvis 10
```
npm run deploy
```

# Other commands
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


# WASM with AssemblyScript
    TODO ADDED:
        1. cummincate between js and AS
        2. pass buffer to AS
        3. Add Node Class to save pointer and size => get acces to pixel data for each img
        4. add Store for saving nodes and operation on multi nodes
        5. pixel array for return data and change via AS
        6. Add draw to state and nodes
        7. add test canvas for showing result
        8. add variable memory based on canvasPixelSize and change cavnas size to 100, 100
        9. add real pictures while streaming, first 10, handcrafted x,y,
            init memory 10 * 10 * 10 * 4 = 4000
        10. init full downloaded memory
        11. add all nodes with smallest img size to state
        11. add scale, transfer to node.draw(s, t) with functions to change them
        13. resize full canvas to 500, 500
        14. node.draw() checks if node should be drawed
        15. add new load wasm with webpack, imports add logging
        16. add panning (MouseMove), scale/translate change (zoom)
        17. add 10 files of images to Node and resize with zooming
        18. fix draw placing wrong pixel and missing content after high zooming

    Missing: 
    Memory: 
        - add dynamic alloc memory (1) (actuall is overwriting) 
    Scissior:
        - add drawRectangle(x, y, w, h) + integrate with drawScissior (2)
    Marks/Groups
        - add node.mark flag, mark them on click and draw marked rectangle (1)  
        - add node.groupId (default 0), .setGroupId(newId, r, g, b, a)
        - add draw border around group with color if groupId !== 0 (1)
        - add getGroupCount(groupId) (test this with 10k imgs and 10 groups)
        - add changeGroupColor(groupid, r, g, b, a) 
        - add node move, groups move, marked moves
        - add second array for getting pixel under mouse

    TODO Enhancment
        - new Way in a worker

# Changes

#### 4.01.
##### Bugs:
- fix mark inactive group elements with click (6628980e)
- scissor don't mark's inactive group members (c42ae47f)
- fix wasm mode (cac01fe7)
  
##### Enhancements:
- resize all images border from 2 to 3 pixel (57bad4b0)
- improve help texts (84cf0a32)
- rename screenshots button (fdc69d8b)
- bedder icon and position for move images button (b43bf9b3)
- groups: (6ed0c77b)
    - empty input after creating new group
    - similarity mode button icon now stays the same if active
    - remove "view all" and "new group" buttons in sim mode
    
##### Features:
- add toggle recalculate clustering button in settings (9392fdf6)
- user can decide the degree of changes in embedding trough updating 

#### Old:
improve heatmap (0f0295ac)
+ bedder init scaling
+ bedder radius for 500 pics!
+ smoother border
