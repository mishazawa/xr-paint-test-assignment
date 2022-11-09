import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { EngineService } from './engine.service';
import { PainterService } from './painter/painter.service';
import { ControllerHandler } from './painter/ControllerHandler';

@Component({
  selector: 'app-engine',
  templateUrl: './engine.component.html'
})
export class EngineComponent implements OnInit {

  private rightController: ControllerHandler;

  @ViewChild('rendererCanvas', { static: true })
  public rendererCanvas: ElementRef<HTMLCanvasElement>;

  public constructor(private engServ: EngineService, private painterService: PainterService) { }

  public ngOnInit(): void {
    this.engServ.createScene(this.rendererCanvas).then((scene) => {
      this.painterService.addScene(scene);

      this.engServ.onControllerAdded.add((ctl) => {

        if (ctl.motionController.handedness === 'right') {
          this.painterService.addRightHand(ctl);
        }

        if (ctl.motionController.handedness === 'left') {
          this.painterService.addLeftHand(ctl);
        }

      });
      this.engServ.animate();
    });
  }
}
