import { Injectable } from "@angular/core";
import { MeshBuilder, Scene, Vector3, WebXRInputSource } from "@babylonjs/core";
import { ControllerHandler } from "./ControllerHandler";


@Injectable({ providedIn: 'root' })
export class PainterService {
  private rightHand: ControllerHandler;
  private scene: Scene;
  private canPaint: boolean;

  public pts: Vector3[] = [];

  public addScene (scene: Scene) {
    this.scene = scene;
  }

  public addRightHand (controller: WebXRInputSource) {
    this.rightHand = new ControllerHandler(controller, this.scene)
    this.rightHand.onTrigger.add(t => this.triggerPaint(t));
    this.rightHand.onMove.add(c => this.paint(c));
  }

  public addLeftHand (controller: WebXRInputSource) {

  }

  private triggerPaint ({pressed}) {
    this.canPaint = pressed;
    if (pressed) {
      this.pts = [];
    } else {
      // tmp draw mesh
      MeshBuilder.CreateLines('li', { points: this.pts, updatable: true }, this.scene);
    }
  }

  private paint(controller: WebXRInputSource) {
    if (!this.canPaint) return;
    this.pts.push(controller.pointer.position.clone());
  }

}
