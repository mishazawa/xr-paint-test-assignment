import { WindowRefService } from './../services/window-ref.service';

import {
  ElementRef,
  Injectable,
  NgZone
} from '@angular/core';

import {
  Engine,
  FreeCamera,
  HemisphericLight,
  Light,
  Observable,
  Scene,
  Vector3,
  WebXRDefaultExperience,
  WebXRInputSource,
} from '@babylonjs/core';


const CAMERA_POSITION = new Vector3(0, 0, 0);

@Injectable({ providedIn: 'root' })
export class EngineService {
  private canvas: HTMLCanvasElement;
  private engine: Engine;
  private camera: FreeCamera;
  private xr: WebXRDefaultExperience;
  private scene: Scene;
  private light: Light;

  private _onControllerAdded: Observable<WebXRInputSource>;

  public get onControllerAdded () {
    return this._onControllerAdded;
  }

  public constructor(
    private ngZone: NgZone,
    private windowRef: WindowRefService
  ) {}

  public async createScene(canvas: ElementRef<HTMLCanvasElement>): Promise<Scene> {
    this._onControllerAdded = new Observable();
    // The first step is to get the reference of the canvas element from our HTML document
    this.canvas = canvas.nativeElement;

    // Then, load the Babylon 3D engine:
    this.engine = new Engine(this.canvas,  true);

    // create a basic BJS Scene object
    this.scene = new Scene(this.engine);

    this.camera = new FreeCamera('camera1', CAMERA_POSITION, this.scene);
    this.camera.setTarget(Vector3.Zero());
    this.camera.attachControl(this.canvas, false);

    this.light = new HemisphericLight("light1", new Vector3(0, 1, 0), this.scene);
    this.light.intensity = 0.7;

    const env = this.scene.createDefaultEnvironment();

    // here we add XR support
    this.xr = await this.scene.createDefaultXRExperienceAsync({
      floorMeshes: [env.ground],
    });

    this.xr.input.onControllerAddedObservable.add((controller) => {
      controller.onMotionControllerInitObservable.add(() => {
        if (!controller.motionController) return;
        this._onControllerAdded.notifyObservers(controller);
      })
    });

    return this.scene;
    // let xrHelper = await WebXRExperienceHelper.CreateAsync(this.scene);
    // await xrHelper.enterXRAsync("immersive-vr", "local-floor"); // emu controllers not work
  }

  public animate(): void {
    // We have to run this outside angular zones,
    // because it could trigger heavy changeDetection cycles.
    this.ngZone.runOutsideAngular(() => {
      const rendererLoopCallback = () => {
        this.scene.render();
      };

      if (this.windowRef.document.readyState !== 'loading') {
        this.engine.runRenderLoop(rendererLoopCallback);
      } else {
        this.windowRef.window.addEventListener('DOMContentLoaded', () => {
          this.engine.runRenderLoop(rendererLoopCallback);
        });
      }

      this.windowRef.window.addEventListener('resize', () => {
        this.engine.resize();
      });
    });
  }
}
