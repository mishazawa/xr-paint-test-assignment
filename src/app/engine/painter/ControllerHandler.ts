import {
  Observable,
  Scene,
  Vector3,
  WebXRControllerComponent,
  WebXRInputSource
} from "@babylonjs/core";

const BUTTON_TRIGGER_ID = 'xr-standard-trigger';


export class ControllerHandler {
  private controller: WebXRInputSource;

  private lastPosition: Vector3;
  private _threshold: number = .0001;

  public get position () {
    return this.lastPosition;
  }

  public get up () {
    return this.controller.pointer.up.normalize();
  }

  public get movementThreshold() {
    return this._threshold;
  }

  public set movementThreshold(t) {
    if (t <= 0 || t >= 1) {
        throw new Error('Threshold is invalid');
    }
    this._threshold = t;
  }

  public onMove: Observable<WebXRInputSource>;
  public onTrigger: Observable<WebXRControllerComponent>;

  constructor(controller: WebXRInputSource, scene: Scene) {
    this.controller = controller;
    this.onMove = new Observable();
    this.onTrigger = new Observable();

    this.controller.onMotionControllerInitObservable.add((motionController) => {
      // setup initial position
      this.lastPosition = this.controller.pointer.position.clone();

      // setup movement detection
      scene.onBeforeRenderObservable.add(() => this.handleMovement());

      // setup trigger
      let triggerComponent = motionController.getComponent(BUTTON_TRIGGER_ID);
      triggerComponent.onButtonStateChangedObservable.add(t => this.onTrigger.notifyObservers(t));
    });
  }

  handleMovement () {
    const currentPosition = this.controller.pointer.position;

    if (Vector3.DistanceSquared(currentPosition, this.lastPosition) >= this.movementThreshold) {
      this.onMove.notifyObservers(this.controller);
    }

    this.lastPosition = currentPosition.clone();
  }
}
