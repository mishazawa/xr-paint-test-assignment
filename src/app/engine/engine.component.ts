import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { EngineService } from './engine.service';

import { PainterService } from './painter/painter.service';

// import { CubeBrush } from './painter/brushes/CubeBrush';
import { MeshBrush } from './painter/brushes/MeshBrush';
import { Button3D, GUI3DManager, StackPanel3D, TextBlock } from '@babylonjs/gui';
import { Color3, Vector3 } from '@babylonjs/core';


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

@Component({
  selector: 'app-engine',
  templateUrl: './engine.component.html'
})
export class EngineComponent implements OnInit {

  @ViewChild('rendererCanvas', { static: true })
  public rendererCanvas: ElementRef<HTMLCanvasElement>;

  private gui: GUI3DManager;
  private panelBrush: StackPanel3D;

  public constructor(private engServ: EngineService, private painterServ: PainterService) { }

  public ngOnInit(): void {
    this.engServ.createScene(this.rendererCanvas).then((scene) => {
      this.gui = new GUI3DManager(scene);

      this.painterServ.addScene(scene);

      this.engServ.onControllerAdded.add((ctl) => {

        if (ctl.motionController.handedness === 'right') {
          const hand = this.painterServ.addRightHand(ctl);

          this.painterServ.setBrush(new MeshBrush());

          this.addMenu();
          this.panelBrush.linkToTransformNode(hand.pointer);
        }

      });
      this.engServ.animate();
    });
  }

  public addMenu () {
    this.panelBrush = new StackPanel3D();

    this.gui.addControl(this.panelBrush);

    this.panelBrush.isVertical = true;
    this.panelBrush.position.x = -.05;
    this.panelBrush.position.y = -.2;
    this.panelBrush.scaling = Vector3.One().scaleInPlace(.1);

    const btnBrushSizeInc = createButton("+");
    const btnBrushSizeDec = createButton("-");
    const btnRandColor    = createButton("R");

    this.panelBrush.addControl(btnRandColor);
    this.panelBrush.addControl(btnBrushSizeDec);
    this.panelBrush.addControl(btnBrushSizeInc);

    btnBrushSizeInc.onPointerClickObservable.add(() => {
      this.painterServ.scale += 0.1;
      this.setSize()
    });

    btnBrushSizeDec.onPointerClickObservable.add(() => {
      this.painterServ.scale -= 0.1;
      this.setSize()
    });

    btnRandColor.onPointerClickObservable.add(() => this.setColor())
  }

  private setSize() {
    this.painterServ.brush?.setSize(this.painterServ.scale);
  }

  private setColor() {
    this.painterServ.brush?.setColor(randomColor());

  }

}
