import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { EngineService } from './engine.service';

import { PainterService } from './painter/painter.service';

// import { CubeBrush } from './painter/brushes/CubeBrush';
import { MeshBrush } from './painter/brushes/MeshBrush';


@Component({
  selector: 'app-engine',
  templateUrl: './engine.component.html'
})
export class EngineComponent implements OnInit {

  @ViewChild('rendererCanvas', { static: true })
  public rendererCanvas: ElementRef<HTMLCanvasElement>;

  public constructor(private engServ: EngineService, private painterServ: PainterService) { }

  public ngOnInit(): void {
    this.engServ.createScene(this.rendererCanvas).then((scene) => {
      this.painterServ.addScene(scene);
      this.painterServ.addMenu();

      this.engServ.onControllerAdded.add((ctl) => {

        if (ctl.motionController.handedness === 'right') {
          this.painterServ.addRightHand(ctl);
          this.painterServ.setBrush(new MeshBrush());
        }

      });
      this.engServ.animate();
    });
  }
}
