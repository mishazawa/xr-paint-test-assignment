import { Injectable } from "@angular/core";
import {
  Mesh,
  MeshBuilder,
  Scene,
  StandardMaterial,
  Vector3,
  VertexBuffer,
  VertexData,
  WebXRInputSource
} from "@babylonjs/core";
import { ControllerHandler } from "./ControllerHandler";


@Injectable({ providedIn: 'root' })
export class PainterService {
  private rightHand: ControllerHandler;
  private scene: Scene;
  private canPaint: boolean;

  public lines: Vector3[][] = [];
  public currentPoints: Vector3[] = [];

  public scale = .05;

  public currentMesh;
  public mat;

  public addScene (scene: Scene) {
    this.scene = scene;
    this.mat = new StandardMaterial("texture1", this.scene);
    this.mat.backFaceCulling = false;
    // this.mat.wireframe = true;
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
      this.currentPoints = [];

    } else {
      this.lines.unshift(this.currentPoints);
      const points = this.lines[0];

      const mesh = new Mesh(null, this.scene);
      const vd   = new VertexData();

      mesh.material = this.mat;

      const vertices = [];
      const indices  = [];

      let currentIndex = 0;
      for (let i = 0; i < points.length; i++) {
          const pos   = points[i];
          const pnext = points[i+1];

          // TODO: stores only last rotation of controller
          // not correct
          const tan = this.rightHand.up.scale(this.scale);
          const pos_ = pos.add(tan);

          // add current and topmost vertices
          vertices.push(pos.x, pos.y, pos.z);
          vertices.push(pos_.x, pos_.y, pos_.z);

          // indices
          var icurrent = currentIndex;
          var itop     = currentIndex + 1;
          var inext    = currentIndex + 2;

          // if not last point
          if (pnext) {
              indices.push(icurrent, inext,    itop); // 0, 2, 1
              indices.push(inext,    inext+1,  itop); // 2, 3, 1
          }

          // increment index (because added two vertices)
          currentIndex += 2;
      }

        // console.log(vertices, indices)

        vd.positions = vertices;
        vd.indices   = indices;

        vd.applyToMesh(mesh);
    }
  }

  private paint(controller: WebXRInputSource) {
    if (!this.canPaint) return;
    const pos = controller.pointer.position.clone();
    this.currentPoints.push(pos);
  }
}
