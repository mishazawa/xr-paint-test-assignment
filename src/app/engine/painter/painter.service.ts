import { Injectable } from "@angular/core";
import {
    Material,
    Mesh,
    Scene,
    StandardMaterial,
    Vector3,
    VertexBuffer,
    WebXRInputSource
} from "@babylonjs/core";
import { ControllerHandler } from "./ControllerHandler";

const SIMULTANEOUS_ADDED_VERTICES = 2;
const VERTEX_BUFFER_STRIDE = 3;


@Injectable({ providedIn: 'root' })
export class PainterService {
  private rightHand: ControllerHandler;
  private scene: Scene;
  private canPaint: boolean;

  public scale = .025;

  private mat: Material;

  private mesh: Mesh;
  private indices: Uint32Array;
  private positions: Float32Array;
  private currentIndex: number = 0;
  private currentIndexBufferSize: number = 2;

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
      this.initNewLine()
    }
  }

  private initNewLine() {
    this.updateBuffers()

    this.mesh = new Mesh(null);
    this.mesh.material = this.mat;

    this.mesh.setIndices(this.indices, null, true);
    this.mesh.setVerticesData(VertexBuffer.PositionKind, this.positions, true, VERTEX_BUFFER_STRIDE);

    this.currentIndex = 0;
  }

  private paint(controller: WebXRInputSource) {
    if (!this.canPaint) return;

    const pos = controller.pointer.position.clone();
    this.addPoint(pos);
  }

  private addPoint(pos: Vector3) {
    if (this.isBufferFilled()) {
      this.resize();
      this.updateBuffers();
    }

    const tan = this.rightHand.up.normalize().scale(this.scale);
    const pos_ = pos.add(tan);

    const lastIndex = this.currentIndex;

    this.pushVertex(pos);
    this.pushVertex(pos_);

    this.pushTriangle(lastIndex,   lastIndex,   lastIndex+2, lastIndex+1); // ∆ 0 2 1
    this.pushTriangle(lastIndex+1, lastIndex+2, lastIndex+3, lastIndex+1); // ∆ 2 3 1

    this.mesh.updateIndices(this.indices, 0);
    this.mesh.setVerticesData(VertexBuffer.PositionKind, this.positions, true, VERTEX_BUFFER_STRIDE);

  }

  private initBuffers () {
    return [
      new Float32Array(this.currentIndexBufferSize * VERTEX_BUFFER_STRIDE),
      new Uint32Array(this.currentIndexBufferSize * VERTEX_BUFFER_STRIDE * SIMULTANEOUS_ADDED_VERTICES)
    ]
  }

  private updateBuffers () {
    const [posBuff, idxBuff] = this.initBuffers();

    posBuff.set(this.positions || []);
    idxBuff.set(this.indices || []);

    this.indices   = idxBuff as Uint32Array;
    this.positions = posBuff as Float32Array;
  }

  private pushVertex (pos: Vector3) {
    const i = this.currentIndex * VERTEX_BUFFER_STRIDE;

    this.positions[i]   = pos.x;
    this.positions[i+1] = pos.y;
    this.positions[i+2] = pos.z;

    this.currentIndex++;
  }

  private pushTriangle(index, v1, v2, v3) {
    const i = index * VERTEX_BUFFER_STRIDE;
    this.indices[i]   = v1;
    this.indices[i+1] = v2;
    this.indices[i+2] = v3;
  }

  public isBufferFilled(): boolean {
    return this.currentIndexBufferSize <= this.currentIndex + SIMULTANEOUS_ADDED_VERTICES;
  }

  public resize (mult = 2) {
    this.currentIndexBufferSize *= mult;
  }
}
