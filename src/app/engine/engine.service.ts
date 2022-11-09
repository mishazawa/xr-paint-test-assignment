import { WindowRefService } from './../services/window-ref.service';
import {ElementRef, Injectable, NgZone} from '@angular/core';
import {
  Engine,
  FreeCamera,
  Scene,
  Mesh,
  Color3,
  Color4,
  Vector3,
  HemisphericLight,
  StandardMaterial,
  DynamicTexture,
  WebXRDefaultExperience,
  WebXRExperienceHelper,
  AbstractMesh,
} from '@babylonjs/core';

const HANDNESS_LEFT = 'left';
const HANDNESS_RIGHT = 'right';

const BUTTON_TRIGGER_ID = 'xr-standard-trigger';

const CAMERA_POSITION = new Vector3(0, 0, 0);

let line = {
  positions: [],
}

@Injectable({ providedIn: 'root' })
export class EngineService {
  private canvas: HTMLCanvasElement;
  private engine: Engine;
  private camera: FreeCamera;
  private scene: Scene;
  private xr: WebXRDefaultExperience;

  private triggerState: boolean = false;

  public constructor(
    private ngZone: NgZone,
    private windowRef: WindowRefService
  ) {}

  public async createScene(canvas: ElementRef<HTMLCanvasElement>): Promise<void> {
    // The first step is to get the reference of the canvas element from our HTML document
    this.canvas = canvas.nativeElement;

    // Then, load the Babylon 3D engine:
    this.engine = new Engine(this.canvas,  true);

    // create a basic BJS Scene object
    this.scene = new Scene(this.engine);
    this.scene.clearColor = new Color4(.5, .5, .5, 1);

    this.camera = new FreeCamera('camera1', CAMERA_POSITION, this.scene);
    this.camera.setTarget(Vector3.Zero());
    this.camera.attachControl(this.canvas, false);

    this.showWorldAxis(8); // to be removed

    var light = new HemisphericLight("light1", new Vector3(0, 1, 0), this.scene);
    light.intensity = 0.7;

    const env = this.scene.createDefaultEnvironment();

    // here we add XR support
    this.xr = await this.scene.createDefaultXRExperienceAsync({
      floorMeshes: [env.ground],
    });

    // let xrHelper = await WebXRExperienceHelper.CreateAsync(this.scene);
    // await xrHelper.enterXRAsync("immersive-vr", "local-floor"); // emu controllers not work
  }

  public attachPlayerControls() {
    this.xr.input.onControllerAddedObservable.add((controller) => {
      controller.onMotionControllerInitObservable.add((motionController) => {

        // todo fix motion controller/controller mess
        this.assignControllerHandlers(motionController.handness, controller.pointer);

        this.assignControllerTriggerHandlers(motionController);
      });
    });
  }

  private assignControllerHandlers(handness, pointer) {
    if (handness === HANDNESS_RIGHT) {
      this.scene.onBeforeRenderObservable.add(() => this.handleRightController(pointer))
    }
  }

  private assignControllerTriggerHandlers(motionController) {
    if (motionController.handness === HANDNESS_RIGHT) {
      let triggerComponent = motionController.getComponent(BUTTON_TRIGGER_ID);
      triggerComponent.onButtonStateChangedObservable.add(({pressed}) => this.triggerState = pressed);
    }
  }

  private handleRightController(pointer) {
    if (this.triggerState) {
      // check distance threshold to not draw too much points
      this.draw(pointer.position);
    }
  }


  private draw (p: Vector3) {
    line.positions.push(p);
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

  /**
   * creates the world axes
   *
   * Source: https://doc.babylonjs.com/snippets/world_axes
   *
   * @param size number
   */
  public showWorldAxis(size: number): void {

    const makeTextPlane = (text: string, color: string, textSize: number) => {
      const dynamicTexture = new DynamicTexture('DynamicTexture', 50, this.scene, true);
      dynamicTexture.hasAlpha = true;
      dynamicTexture.drawText(text, 5, 40, 'bold 36px Arial', color , 'transparent', true);
      const plane = Mesh.CreatePlane('TextPlane', textSize, this.scene, true);
      const material = new StandardMaterial('TextPlaneMaterial', this.scene);
      material.backFaceCulling = false;
      material.specularColor = new Color3(0, 0, 0);
      material.diffuseTexture = dynamicTexture;
      plane.material = material;

      return plane;
    };

    const axisX = Mesh.CreateLines(
      'axisX',
      [
        Vector3.Zero(),
        new Vector3(size, 0, 0), new Vector3(size * 0.95, 0.05 * size, 0),
        new Vector3(size, 0, 0), new Vector3(size * 0.95, -0.05 * size, 0)
      ],
      this.scene,
      true
    );

    axisX.color = new Color3(1, 0, 0);
    const xChar = makeTextPlane('X', 'red', size / 10);
    xChar.position = new Vector3(0.9 * size, -0.05 * size, 0);

    const axisY = Mesh.CreateLines(
      'axisY',
      [
        Vector3.Zero(), new Vector3(0, size, 0), new Vector3( -0.05 * size, size * 0.95, 0),
        new Vector3(0, size, 0), new Vector3( 0.05 * size, size * 0.95, 0)
      ],
      this.scene,
      true
    );

    axisY.color = new Color3(0, 1, 0);
    const yChar = makeTextPlane('Y', 'green', size / 10);
    yChar.position = new Vector3(0, 0.9 * size, -0.05 * size);

    const axisZ = Mesh.CreateLines(
      'axisZ',
      [
        Vector3.Zero(), new Vector3(0, 0, size), new Vector3( 0 , -0.05 * size, size * 0.95),
        new Vector3(0, 0, size), new Vector3( 0, 0.05 * size, size * 0.95)
      ],
      this.scene,
      true
    );

    axisZ.color = new Color3(0, 0, 1);
    const zChar = makeTextPlane('Z', 'blue', size / 10);
    zChar.position = new Vector3(0, 0.05 * size, 0.9 * size);
  }
}
