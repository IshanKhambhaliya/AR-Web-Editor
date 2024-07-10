
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { TransformControls } from 'three/addons/controls/TransformControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';




let cameraPersp, cameraOrtho, currentCamera;
let scene, renderer, orbit;
let modelNum = 0;
let activemodelNum = -1;
let models = [];

const sizes = {
    w : 426 * 2.5,
    h : 240 * 2.5
}

init();
render();

function init() {
    const canvasContainer = document.querySelector('.canvas-container');

    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( sizes.w, sizes.h );
    canvasContainer.appendChild( renderer.domElement );

    const aspect = sizes.w/sizes.h;

    const frustumSize = 5;

    cameraPersp = new THREE.PerspectiveCamera( 75, aspect, 0.1, 100 );
    currentCamera = cameraPersp;

    currentCamera.position.set( 5, 2.5, 5 );

    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0xa0a0a0 );
	scene.fog = new THREE.Fog( 0xa0a0a0, 10, 50 );

    //Lighting effect
    const hemiLight = new THREE.HemisphereLight( 0xffffff, 0x8d8d8d, 3 );
    hemiLight.position.set( 0, 20, 0 );
	scene.add( hemiLight );

	const dirLight = new THREE.DirectionalLight( 0xffffff, 3 );
	dirLight.position.set( 3, 10, 10 );
	dirLight.castShadow = true;
	dirLight.shadow.camera.top = 2;
	dirLight.shadow.camera.bottom = - 2;
	dirLight.shadow.camera.left = - 2;
	dirLight.shadow.camera.right = 2;
	dirLight.shadow.camera.near = 0.1;
	dirLight.shadow.camera.far = 40;
	scene.add( dirLight );

    // ground & Grid
    const groundMesh = new THREE.Mesh( new THREE.PlaneGeometry( 100, 100 ), new THREE.MeshPhongMaterial( { color: 0xcbcbcb, depthWrite: false } ) );
    groundMesh.rotation.x = - Math.PI / 2;
    groundMesh.receiveShadow = true;
    scene.add( groundMesh );
    const gridHelper = new THREE.GridHelper(100, 100, 0x888888, 0x444444);
    gridHelper.material.opacity = 0.5; 
    gridHelper.material.transparent = true; 
    scene.add(gridHelper);


    //Camera Controls (OrbitControls)
    orbit = new OrbitControls( currentCamera, renderer.domElement );
    orbit.update();
    orbit.addEventListener( 'change', render );


    //AR Marker
    const TextureLoader = new THREE.TextureLoader();
    const markerTexture = TextureLoader.load('mengomarker.png',
        function(markerTexture) {
            const markerImgGeometry = new THREE.PlaneGeometry(5, 5); 
            const markerImgMaterial = new THREE.MeshBasicMaterial({map:markerTexture})
            const markerImgPlane = new THREE.Mesh(markerImgGeometry, markerImgMaterial);
            scene.add(markerImgPlane)
            markerImgPlane.position.set(0,0,0);
            markerImgPlane.rotation.set(-Math.PI/2,0,0);
            render();
        }   
    )

    //3D Model Loding function 
    //Note : By just passing any url in function we can load the model
    function loadModel(url,camera) {
        const loader = new GLTFLoader();
	    loader.load( 'model.glb', 
        function ( gltf ) {
            const model = gltf.scene;
            scene.add( model );
            model.position.set(0,1,0)
            model.rotation.set(-Math.PI/2,0,0);
            const control = new TransformControls(camera, renderer.domElement);
            control.addEventListener('change', render);
            control.addEventListener('dragging-changed', function (event) {
            orbit.enabled = !event.value;
            });
            control.attach(model);
            scene.add(control);
            models.push(model);
            addModelToList();
            render();

            window.addEventListener( 'keydown', function ( event ) {

                switch ( event.key ) {
                    case 'w':
                        control.setMode( 'translate' );
                        break;
        
                    case 'r':
                        control.setMode( 'rotate' );
                        break;
        
                    case 's':
                        control.setMode( 'scale' );
                        break;
                }
        
            } );  
        }   
    );
    }


    
    // const fileInput = document.getElementById('fileInput');
    // const addButton = document.getElementById('addButton');

    // addButton.addEventListener('click', () => {
    //     fileInput.click();
    // });

    // fileInput.addEventListener('change', (event) => {
    //     const file = event.target.files[0];
    //     if (file) {
    //         const url = URL.createObjectURL(file);
    //         loadModel(url);
    //     }
    // });

    //Add Model to scene 
    document.getElementById('addButton').addEventListener('click', () => loadModel('model.glb', currentCamera));
  


    document.addEventListener('DOMContentLoaded', () => {
        let vidLoaded = false;
        // Video As Plane
        const video = document.createElement('video');
        video.src = 'video.mp4';  // Path to your video file
        video.crossOrigin = 'anonymous';
        video.loop = true;
        video.muted = false;
        // video.play();
    
        video.addEventListener('loadeddata', () => {
            // Create video texture
            const videoTexture = new THREE.VideoTexture(video);
            videoTexture.minFilter = THREE.LinearFilter;
            videoTexture.magFilter = THREE.LinearFilter;
            videoTexture.format = THREE.RGBFormat;
    
            // Create plane geometry with video texture
            const geometry = new THREE.PlaneGeometry(4, 2.25);  // Adjust size as needed
            const material = new THREE.MeshBasicMaterial({ map: videoTexture });
            const plane = new THREE.Mesh(geometry, material);
            plane.position.set(0, 1, 0);
            scene.add(plane);
            vidLoaded = true;
        });
    
        function Play() {
            if (vidLoaded) {
                video.play();
                console.log("Video play");
            }
        }
    
        document.getElementById('playButton').addEventListener('click', Play);
    });
    
    
    
}

function addModelToList(){
    const currentModelNum = modelNum;
    modelNum++;
    
     // Create a new list item
     const listItem = document.createElement('li');
    
     // Create a new button
     const button = document.createElement('button');
     button.textContent = `Model${currentModelNum}`;
     button.id = `Model${currentModelNum}`;

     // Add the button to the list item
     listItem.appendChild(button);
     // Add the list item to the ul element with id 'modelList'
     const modelList = document.getElementById('Buttonlist');
    modelList.appendChild(listItem);
    document.getElementById(`Model${currentModelNum}`).addEventListener('click',function(){
        console.log(models[currentModelNum].position)
        activemodelNum = currentModelNum;
    })
}

  

function onWindowResize() {

    const aspect = window.innerWidth / window.innerHeight;

    cameraPersp.aspect = aspect;
    cameraPersp.updateProjectionMatrix();

    cameraOrtho.left = cameraOrtho.bottom * aspect;
    cameraOrtho.right = cameraOrtho.top * aspect;
    cameraOrtho.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

    render();

}

function render() {
    renderer.render( scene, currentCamera );
}
function updateHTML(){
    const positionTextElement = document.getElementById('positionText');
    const rotationTextElement = document.getElementById('rotationText');
    const scalTextElement = document.getElementById('scalText');

    positionTextElement.textContent = `X : ${models[activemodelNum].position.x.toFixed(2)}, Y : ${models[activemodelNum].position.y.toFixed(2)}, Z : ${models[activemodelNum].position.z.toFixed(2)}`;
    rotationTextElement.textContent = `X : ${models[activemodelNum].rotation.x.toFixed(2)}, Y : ${models[activemodelNum].rotation.y.toFixed(2)}, Z : ${models[activemodelNum].rotation.z.toFixed(2)}`;
    //scalTextElement.textContent = `X : ${models[activemodelNum]}, Y : ${models[activemodelNum].position.x}, Z : ${models[activemodelNum].position.x}`;
}

const tick = () => 
{
    if(activemodelNum >= 0)
        {
            updateHTML();
        }
    //Update Controls
    renderer.render(scene, currentCamera)
    window.requestAnimationFrame(tick)
}
tick()
