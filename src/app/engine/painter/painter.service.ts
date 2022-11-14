import { Injectable } from "@angular/core";
import {
    Scene,
    WebXRInputSource
} from "@babylonjs/core";

import { ControllerHandler } from "./ControllerHandler";

import { IBrush } from "./brushes/IBrush";

@Injectable({ providedIn: 'root' })
export class PainterService {
  private rightHand: ControllerHandler;
  private leftHand:  ControllerHandler;

  private scene: Scene;
  private isPressed: boolean;

  public brush: IBrush | null;
  public scale = .025;

  public setBrush (brush: IBrush) {
    this.brush?.end();

    this.brush = brush;
    this.brush.init({scene: this.scene, controller: this.rightHand});
    this.brush.setSize(this.scale);
  }

  public addScene (scene: Scene) {
    this.scene = scene;
  }

  public addLeftHand (controller: WebXRInputSource) {
    this.leftHand = new ControllerHandler(controller, this.scene);
    return this.leftHand;
  }

  public addRightHand (controller: WebXRInputSource) {
    this.rightHand = new ControllerHandler(controller, this.scene)

    this.rightHand.onTrigger.add(t => this.trigger(t));
    this.rightHand.onMove.add(c => this.movement(c));

    return this.rightHand;
  }

  private trigger (pressed: boolean) {
    this.isPressed = pressed;

    if (pressed) {
      this.brush?.start();
    } else {
      this.brush?.end();
    }
  }

  private movement(controller: WebXRInputSource) {
    if (!this.isPressed) return;
    this.brush?.paint(controller);
  }

}
