import * as THREE from 'three';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';

export class NewObject{
    constructor(currentCamera, renderer) {
        const mesh = new THREE.Mesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshBasicMaterial({color : 0xff0000}))
        mesh.position.set(0,0,0);
        const control = new TransformControls(currentCamera, renderer.domElement);
        control.addEventListener('change', renderer);
        control.addEventListener('dragging-changed', function (event) {orbit.enabled = !event.value;});
        control.attach(mesh);
    }

    
}