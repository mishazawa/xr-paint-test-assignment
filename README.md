### Manual

1. clone repository
2. install dependencies `yarn` 
3. run `yarn start`

### Deploy

1. build `yarn build:prod`
2. push to firebase `yarn deploy`

### Demo

[Online demo https://xr-paint.web.app/](https://xr-paint.web.app/)

#### Youtube Video

[![youtube demo](https://img.youtube.com/vi/w2WTh8eV8QE/hqdefault.jpg)](https://youtu.be/w2WTh8eV8QE)


### Controls 

There is no ability to bind buttons in emulator.

 - `+` button - increase brush size (max = 1 meter)
 - `-` button - decrease brush size (min = .01 meter)
 - `R` button - assing random color to brush

<img width="124" alt="image" src="https://user-images.githubusercontent.com/7611372/201619757-79d8619b-fba7-4f3f-82c0-04dfc042e29c.png">

### Repository structure

`app/engine/engine.service.ts` - Babylon scene setup. Initialize camera, environment, XR.

`app/engine/engine.component.ts` - Main component. Initialize controllers, setup brushes, menu.

`app/engine/painter/ControllerHandler.ts` - Controller wrapper. Handle motion events and trigger button.

`app/engine/painter/painter.service.ts` - Brush servise. Hold current brush and controller state.

`app/engine/painter/brushes/IBrush.ts` - Brush interface. Set of methods that brush should implement.

`app/engine/painter/brushes/MeshBrush.ts` - Brush to draw meshes. Collect points when controller moves and generate ribbon. Use `Mesh` API and `StandardMaterial`.

`app/engine/painter/brushes/CubeBrush.ts` - Example `IBrush`. Just spawn cube and move it.

### Used emulator

[MozillaReality/WebXR-emulator-extension](https://github.com/MozillaReality/WebXR-emulator-extension)
