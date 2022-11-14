import { Injectable } from "@angular/core";
import {
    Color3,
    Scene,
    Vector3,
    WebXRInputSource
} from "@babylonjs/core";

import { Button3D, GUI3DManager, StackPanel3D, TextBlock } from '@babylonjs/gui';

import { ControllerHandler } from "./ControllerHandler";

import { IBrush } from "./brushes/IBrush";

const createButton = (text) => {
    const btn = new Button3D(text);
    const txtContent = new TextBlock();
    txtContent.text = text;
    txtContent.color = "white";
    txtContent.fontSize = 150;
    btn.content = txtContent;
    return btn;
}

const randomColor = () => {
  return new Color3(
    0.5 + Math.random(),
    0.5 + Math.random(),
    0.5 + Math.random());
}

@Injectable({ providedIn: 'root' })
export class PainterService {
  private rightHand: ControllerHandler;
  private scene: Scene;
  private isPressed: boolean;

  private brush: IBrush;
  private scale = .025;

  private gui: GUI3DManager;
  private panelBrush: StackPanel3D;

  public setBrush (brush: IBrush) {
    if (this.brush) {
      this.brush.end();
    }

    this.brush = brush;
    this.brush.init({scene: this.scene, controller: this.rightHand});
    this.brush.setSize(this.scale);

  }

  public addScene (scene: Scene) {
    this.scene = scene;
  }

  public addMenu () {
    this.gui = new GUI3DManager(this.scene);
    this.panelBrush = new StackPanel3D();

    this.gui.addControl(this.panelBrush);

    this.panelBrush.isVertical = true;
    this.panelBrush.position.x = -.1;
    this.panelBrush.scaling = Vector3.One().scaleInPlace(.1);

    const btnBrushSizeInc = createButton("+");
    const btnBrushSizeDec = createButton("-");
    const btnRandColor    = createButton("R");

    this.panelBrush.addControl(btnRandColor);
    this.panelBrush.addControl(btnBrushSizeDec);
    this.panelBrush.addControl(btnBrushSizeInc);


    btnBrushSizeInc.onPointerClickObservable.add(() => {
      this.scale += 0.1;
      this.brush.setSize(this.scale);
    });

    btnBrushSizeDec.onPointerClickObservable.add(() => {
      this.scale -= 0.1;
      this.brush.setSize(this.scale);
    });

    btnRandColor.onPointerClickObservable.add(() => {
      this.brush.setColor(randomColor());
    })
  }

  public addRightHand (controller: WebXRInputSource) {
    this.rightHand = new ControllerHandler(controller, this.scene)

    this.rightHand.onTrigger.add(t => this.trigger(t));
    this.rightHand.onMove.add(c => this.movement(c));

    this.panelBrush.linkToTransformNode(this.rightHand.pointer);
  }

  private trigger (pressed: boolean) {
    this.isPressed = pressed;

    if (pressed) {
      this.brush.start();
    } else {
      this.brush.end();
    }
  }

  private movement(controller: WebXRInputSource) {
    if (!this.isPressed) return;
    this.brush.paint(controller);
  }

}
