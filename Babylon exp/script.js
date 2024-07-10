// Get the canvas element
var canvas = document.getElementById("renderCanvas");

// Generate the BABYLON 3D engine
var engine = new BABYLON.Engine(canvas, true);

var camera, initialCameraPosition, initialCameraRotation;

var createScene = function () {
    // This creates a basic Babylon Scene object (non-mesh)
    var scene = new BABYLON.Scene(engine);


    // Set the background color to offwhite
    scene.clearColor = new BABYLON.Color3.FromHexString("#f5f5f5");

    // This creates and positions a free camera (non-mesh)
    camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 5, -10), scene);

    // Store the initial camera position and rotation
    initialCameraPosition = camera.position.clone();
    initialCameraRotation = camera.rotation.clone();

    // This targets the camera to scene origin
    camera.setTarget(BABYLON.Vector3.Zero());

    // This attaches the camera to the canvas
    camera.attachControl(canvas, true);

    // This creates a light, aiming 0,1,0 - to the sky (non-mesh)
    var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);

    // Default intensity is 1. Let's dim the light a small amount
    light.intensity = 1;

    // Our built-in 'sphere' shape.
    var sphere = BABYLON.MeshBuilder.CreateSphere("sphere", {diameter: 2, segments: 32}, scene);
    sphere.isPickable = true;

    // Move the sphere upward 1/2 its height
    sphere.position.y = 1;

    // Create the X axis (red)
    var xAxis = BABYLON.MeshBuilder.CreateLines("xAxis", {
        points: [
            new BABYLON.Vector3.Zero(),
            new BABYLON.Vector3(100, 0, 0)
        ],
        colors: [new BABYLON.Color4(1, 0, 0, 1), new BABYLON.Color4(1, 0, 0, 1)]
    }, scene);
    xAxis.isPickable = false;

    // Create the Y axis (green)
    var yAxis = BABYLON.MeshBuilder.CreateLines("yAxis", {
        points: [
            new BABYLON.Vector3.Zero(),
            new BABYLON.Vector3(0, 100, 0)
        ],
        colors: [new BABYLON.Color4(0, 1, 0, 1), new BABYLON.Color4(0, 1, 0, 1)]
    }, scene);
    yAxis.isPickable = false;

    // Create the Z axis (blue)
    var zAxis = BABYLON.MeshBuilder.CreateLines("zAxis", {
        points: [
            new BABYLON.Vector3.Zero(),
            new BABYLON.Vector3(0, 0, 100)
        ],
        colors: [new BABYLON.Color4(0, 0, 1, 1), new BABYLON.Color4(0, 0, 1, 1)]
    }, scene);
    zAxis.isPickable = false;

    // Create a ground material with the image texture
    var groundMaterial = new BABYLON.StandardMaterial("groundMaterial", scene);
    groundMaterial.diffuseTexture = new BABYLON.Texture("marker.png", scene);

    // Create the ground with the material
    var ground = BABYLON.MeshBuilder.CreateGround("ground", {width: 6, height: 6}, scene);
    ground.material = groundMaterial;
    ground.isPickable = false;


    // Add event listener for keydown and keyup events
    var keys = {};
    window.addEventListener("keydown", function (event) {
        keys[event.key] = true;
        if (event.key === "x" || event.key === "X") {
            activeAxis = 'X';
        } else if (event.key === "y" || event.key === "Y") {
            activeAxis = 'Y';
        } else if (event.key === "z" || event.key === "Z") {
            activeAxis = 'Z';
        }
    });

    window.addEventListener("keyup", function (event) {
        keys[event.key] = false;
        if (event.key === "x" || event.key === "X" || event.key === "y" || event.key === "Y" || event.key === "z" || event.key === "Z") {
            activeAxis = null;
        }
    });

    // Update camera position based on keys pressed
    scene.onBeforeRenderObservable.add(() => {
        if (keys["w"] || keys["W"]) {
            camera.position.addInPlace(camera.getDirection(BABYLON.Axis.Z).scale(0.1));
        }
        if (keys["s"] || keys["S"]) {
            camera.position.addInPlace(camera.getDirection(BABYLON.Axis.Z).scale(-0.1));
        }
        if (keys["a"] || keys["A"]) {
            camera.position.addInPlace(camera.getDirection(BABYLON.Axis.X).scale(-0.1));
        }
        if (keys["d"] || keys["D"]) {
            camera.position.addInPlace(camera.getDirection(BABYLON.Axis.X).scale(0.1));
        }
    });

    function createWireFrameBox(mesh,scene) { 
        var boundingInfo = mesh.getBoundingInfo();
        var min = boundingInfo.minimum;
        var max = boundingInfo.maximum;

        var boxSize = max.subtract(min);
        var box = BABYLON.MeshBuilder.CreateBox("wireframeBox", {
            width: boxSize.x,
            height: boxSize.y,
            depth: boxSize.z,
            updatable: true
        }, scene);

        box.position = boundingInfo.boundingBox.centerWorld;

        var wireframeMaterial = new BABYLON.StandardMaterial("wireframeMaterial", scene);
        wireframeMaterial.wireframe = true;
        wireframeMaterial.alpha = 0.5; // Set transparency
        box.material = wireframeMaterial;
        box.isPickable = false; // Make the wireframe box non-pickable

        return box;
    }


    //Object Picking 
    var pickedMesh = null;
    var isDragging = false;
    var startDragPosition = new BABYLON.Vector3();

    scene.onPointerDown = function (evt, pickResult) {
        if (pickResult.hit) {
            pickedMesh = pickResult.pickedMesh;
            isDragging = true;
            startDragPosition.copyFrom(pickResult.pickedPoint);
            overlay.style.display = "block";
        }
    };

    scene.onPointerUp = function () {
        isDragging = false;
        pickedMesh = null;
        overlay.style.display = "none";
    };


    scene.onPointerMove = function (evt) {
        if (isDragging && pickedMesh) {
            var pickInfo = scene.pick(scene.pointerX, scene.pointerY);
            if (pickInfo.hit) {
                var current = pickInfo.pickedPoint;
                var diff = current.subtract(startDragPosition);
                
                if (activeAxis === 'X') {
                    diff.y = 0;
                    diff.z = 0;
                } else if (activeAxis === 'Y') {
                    diff.x = 0;
                    diff.z = 0;
                } else if (activeAxis === 'Z') {
                    diff.x = 0;
                    diff.y = 0;
                }
                // Move the picked mesh by the difference
                pickedMesh.position.addInPlace(diff);
                startDragPosition.copyFrom(current);
            }
        }
    }


    return scene;
};

// Call the createScene function
var scene = createScene();

// Register a render loop to repeatedly render the scene
engine.runRenderLoop(function () {
    scene.render();
});

// Watch for browser/canvas resize events
window.addEventListener("resize", function () {
    engine.resize();
});

// Handle 2D and 3D button clicks
document.getElementById("2dButton").addEventListener("click", function () {
    camera.position.set(0, 10, 0);
    camera.setTarget(BABYLON.Vector3.Zero());
    document.getElementById("2dButton").disabled = true;
    document.getElementById("3dButton").disabled = false;
});

document.getElementById("3dButton").addEventListener("click", function () {
    camera.position.copyFrom(initialCameraPosition);
    camera.rotation.copyFrom(initialCameraRotation);
    camera.setTarget(BABYLON.Vector3.Zero());
    document.getElementById("2dButton").disabled = false;
    document.getElementById("3dButton").disabled = true;
});

document.getElementById("addButton").addEventListener("click", function () {

    // var box = BABYLON.MeshBuilder.CreateBox("box", {width: 1, height: 1, depth: 1}, scene);
    // box.position.set(BABYLON.Vector3.Zero());
    console.log("Added")
});