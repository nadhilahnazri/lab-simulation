import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
// Post-processing
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { OutlinePass } from 'three/addons/postprocessing/OutlinePass.js';
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";
import { FXAAShader } from "three/addons/shaders/FXAAShader.js";
import { GammaCorrectionShader } from "three/addons/shaders/GammaCorrectionShader.js";
// Text
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';

let leaf;
let slide;
let dropper;
let coverSlip;
let elodeasps;
let microscope;
let apparatus1;

let step = -1;
const steps = [
    "Step 1: Obtain Elodea sp. leaf and place on clean slide.",
    "Step 2: Drop fresh water onto leaf and place cover slip on top.",
    "Step 3: Place slide under microscope and observe.",
    "" // Empty string for the last step
];

// Create scene
const scene = new THREE.Scene();


// Create camera
const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000); // (fov, aspect, near, far):
camera.position.set(0, 5, 10);


// Create renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1;
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.getElementById('three-container').appendChild(renderer.domElement); // Attach to correct div


// // Add post-processing
// const composer = new EffectComposer(renderer);

// const renderPass = new RenderPass(scene, camera);
// composer.addPass(renderPass);

// const outlinePass = new OutlinePass(new THREE.Vector2(window.innerWidth, window.innerHeight), scene, camera);
// outlinePass.edgeStrength = 5;
// outlinePass.edgeGlow = 0.5;
// outlinePass.edgeThickness = 0.1;
// outlinePass.pulsePeriod = 0;
// outlinePass.visibleEdgeColor.set('#ffffff');
// outlinePass.hiddenEdgeColor.set('#190a05');
// composer.addPass(outlinePass);

// const effectFXAA = new ShaderPass(FXAAShader);
// effectFXAA.uniforms['resolution'].value.set(1 / window.innerWidth, 1 / window.innerHeight);
// composer.addPass(effectFXAA);

// const gammaCorrectionPass = new ShaderPass(GammaCorrectionShader);
// composer.addPass(gammaCorrectionPass);
//#endregion


// Add raycaster events
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

const fontLoader = new FontLoader();
let label;
let selectedObject = null;
let apparatusFlag = false;

document.addEventListener('mousemove', onMouseMove, false);
function onMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects([leaf, slide, dropper, coverSlip, elodeasps, microscope].filter(obj => obj !== undefined), true);

    if (intersects.length > 0) {
        const parentName = intersects[0].object.parent.name;
        const apparatusName = intersects[0].object.name;
        const elodeaspsName = intersects[0].object.parent.parent.name;
        if (['MICROSCOPE', 'DROPPER'].includes(parentName)) {
            console.log('Intersected object:', parentName);
            selectedObject = intersects[0].object.parent;
        }
        else if (['LEAF', 'SLIDE', 'COVERSLIP'].includes(apparatusName)) {
            console.log('Intersected object:', apparatusName);
            selectedObject = intersects[0].object;
        }
        else if (['ELODEASP1'].includes(parentName) || ['ELODEASP2'].includes(parentName)) {
            console.log('Intersected object:', elodeaspsName);
            selectedObject = intersects[0].object.parent.parent;
        }
        // outlinePass.selectedObjects = [selectedObject];
        document.body.style.cursor = 'pointer';
        apparatusFlag = true;
    } else {
        // outlinePass.selectedObjects = [];
        document.body.style.cursor = 'default';
        apparatusFlag = false;
    }
}

// Add text label above intersected object
// function addLabel(text) {
//     fontLoader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', function (font) {
//         const textGeometry = new TextGeometry(text, {
//             font: font,
//             size: 0.5,
//             depth: 0.1
//         })

//         const textMesh = new THREE.Mesh(textGeometry, [
//             new THREE.MeshPhongMaterial({ color: 0xffffff }), // front
//             new THREE.MeshPhongMaterial({ color: 0x000000 }) // side
//         ])

//         textMesh.castShadow = true;
//         //textMesh.position.x += -0.5;
//         scene.add(textMesh);
//     });
// }

// Events when mouse is clicked
document.addEventListener('click', onMouseClick, false);
function onMouseClick(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObject(leaf, true);

    if (intersects.length > 0) {
        if (animateStep && step === 0) {
            stepOne();
            animateStep = false;
        } else if (animateStep && step === 1) {
            stepTwo();
            animateStep = false;
        } else if (animateStep && step === 2) {
            stepThree();
            animateStep = false;
        } else {
            resetAll();
            animateStep = false;
        }
    }
}


// Functions
let animateReady = true; // Controls when nextStep can be triggered

function nextStep() {
    if (!animateReady) return; // Prevent multiple clicks while animating

    step++;
    if (step >= steps.length) step = 0; // Restart at the beginning

    const instructions = document.querySelector(".instructions");
    if (!instructions) return; 

    console.log('Tablet clicked');

    instructions.innerText = steps[step];
    resizeTablet();

    // Disable further clicks during animation
    animateReady = false;

    if (step === 0) {
        stepOne(() => { animateReady = true; }); // Enable nextStep after animation
    } else if (step === 1) {
        stepTwo(() => { animateReady = true; });
    } else if (step === 2) {
        stepThree(() => { animateReady = true; });
    } else {
        resetAll(() => { animateReady = true; });
    }
}

const tablet = document.querySelector('.tablet');
if (tablet) {
    tablet.addEventListener('click', () => {
        nextStep();
    });
}

// function resetAll(onComplete) {
//     const targetPosition = new THREE.Vector3(0, 0, 0); // Original position
//     const duration = 1000; // Duration of the animation in milliseconds
//     const leafStart = leaf.position.clone();
//     const coverSlipStart = coverSlip.position.clone();
//     const slideStart = slide.position.clone();
//     const dropperStart = dropper.position.clone();
//     const startTime = performance.now();

//     function animate() {
//         const elapsedTime = performance.now() - startTime;
//         const t = Math.min(elapsedTime / duration, 1); // Normalize time to [0, 1]

//         leaf.position.lerpVectors(leafStart, targetPosition, t);
//         coverSlip.position.lerpVectors(coverSlipStart, targetPosition, t);
//         slide.position.lerpVectors(slideStart, targetPosition, t);
//         dropper.position.lerpVectors(dropperStart, targetPosition, t);

//         if (t < 1) {
//             requestAnimationFrame(animate);
//         } else {
//             if (onComplete) onComplete(); // Animation complete, allow nextStep
//         }
//     }

//     animate();
// }

function resetAll(onComplete) {
    const duration = 1000; // Duration of the animation in milliseconds
    const startTime = performance.now();

    // Store original positions
    const leafStart = leaf.position.clone();
    const coverSlipStart = coverSlip.position.clone();
    const slideStart = slide.position.clone();
    const dropperStart = dropper.position.clone();

    // Store original rotations
    const leafRotationStart = leaf.rotation.clone();
    const coverSlipRotationStart = coverSlip.rotation.clone();
    const slideRotationStart = slide.rotation.clone();
    const dropperRotationStart = dropper.rotation.clone();

    // Target positions (original positions)
    const targetPosition = new THREE.Vector3(0, 0, 0);

    // Target rotations (original rotations)
    const targetRotation = new THREE.Euler(0, 0, 0); // Assuming initial rotations are (0, 0, 0)

    function animate() {
        const elapsedTime = performance.now() - startTime;
        const t = Math.min(elapsedTime / duration, 1); // Normalize [0, 1]

        // Reset positions
        leaf.position.lerpVectors(leafStart, targetPosition, t);
        coverSlip.position.lerpVectors(coverSlipStart, targetPosition, t);
        slide.position.lerpVectors(slideStart, targetPosition, t);
        dropper.position.lerpVectors(dropperStart, targetPosition, t);

        // Reset rotations smoothly
        leaf.rotation.set(
            THREE.MathUtils.lerp(leafRotationStart.x, targetRotation.x, t),
            THREE.MathUtils.lerp(leafRotationStart.y, targetRotation.y, t),
            THREE.MathUtils.lerp(leafRotationStart.z, targetRotation.z, t)
        );

        coverSlip.rotation.set(
            THREE.MathUtils.lerp(coverSlipRotationStart.x, targetRotation.x, t),
            THREE.MathUtils.lerp(coverSlipRotationStart.y, targetRotation.y, t),
            THREE.MathUtils.lerp(coverSlipRotationStart.z, targetRotation.z, t)
        );

        slide.rotation.set(
            THREE.MathUtils.lerp(slideRotationStart.x, targetRotation.x, t),
            THREE.MathUtils.lerp(slideRotationStart.y, targetRotation.y, t),
            THREE.MathUtils.lerp(slideRotationStart.z, targetRotation.z, t)
        );

        dropper.rotation.set(
            THREE.MathUtils.lerp(dropperRotationStart.x, targetRotation.x, t),
            THREE.MathUtils.lerp(dropperRotationStart.y, targetRotation.y, t),
            THREE.MathUtils.lerp(dropperRotationStart.z, targetRotation.z, t)
        );

        if (t < 1) {
            requestAnimationFrame(animate);
        } else {
            if (onComplete) onComplete(); // Animation complete, allow nextStep
        }
    }

    animate();
}


function stepOne(onComplete) {
    const leafTarget = new THREE.Vector3(1.75, 0.1, -0.6);
    const leafStart = leaf.position.clone();
    const slideTarget = new THREE.Vector3(0, 0, -0.6);
    const slideStart = slide.position.clone();

    const duration = 1000; // Duration of the animation in milliseconds
    const startTime = performance.now();

    function animate() {
        const elapsedTime = performance.now() - startTime;
        const t = Math.min(elapsedTime / duration, 1); // Normalize time to [0, 1]

        leaf.position.lerpVectors(leafStart, leafTarget, t);
        slide.position.lerpVectors(slideStart, slideTarget, t);

        if (t < 1) {
            requestAnimationFrame(animate);
        } else {
            if (onComplete) onComplete(); // Animation complete, allow nextStep
        }
    }

    animate();
}

function stepTwo(onComplete) {
    const coverSlipTarget = new THREE.Vector3(-2.65, 0.15, -0.7);
    const coverSlipStart = coverSlip.position.clone();
    const dropperTarget = new THREE.Vector3(-1.6, 4.5, -19.2); // Move dropper to new position
    const dropperStart = dropper.position.clone();
    const dropperRotationTarget = new THREE.Euler(THREE.MathUtils.degToRad(90), 0, 0); // Rotate 90 degrees
    const dropperRotationStart = dropper.rotation.clone();

    const duration = 1000; // 1 second per animation step

    function animateDropperToTarget(startTime) {
        function animate() {
            const elapsedTime = performance.now() - startTime;
            const t = Math.min(elapsedTime / duration, 1);

            dropper.position.lerpVectors(dropperStart, dropperTarget, t);
            dropper.rotation.set(
                THREE.MathUtils.lerp(dropperRotationStart.x, dropperRotationTarget.x, t),
                dropperRotationStart.y,
                dropperRotationStart.z
            );

            if (t < 1) {
                requestAnimationFrame(animate);
            } else {
                // When done, return dropper to start position
                setTimeout(() => {
                    animateDropperBack(performance.now());
                }, 250);
            }
        }
        animate();
    }

    function animateDropperBack(startTime) {
        function animate() {
            const elapsedTime = performance.now() - startTime;
            const t = Math.min(elapsedTime / duration, 1);

            dropper.position.lerpVectors(dropperTarget, dropperStart, t);
            dropper.rotation.set(
                THREE.MathUtils.lerp(dropperRotationTarget.x, dropperRotationStart.x, t),
                dropperRotationStart.y,
                dropperRotationStart.z
            );

            if (t < 1) {
                requestAnimationFrame(animate);
            } else {
                // When done, start cover slip animation
                animateCoverSlip(performance.now());
            }
        }
        animate();
    }

    function animateCoverSlip(startTime) {
        function animate() {
            const elapsedTime = performance.now() - startTime;
            const t = Math.min(elapsedTime / duration, 1);

            coverSlip.position.lerpVectors(coverSlipStart, coverSlipTarget, t);

            if (t < 1) {
                requestAnimationFrame(animate);
            } else {
                if (onComplete) onComplete(); // Animation complete, allow nextStep
            }
        }
        animate();
    }

    // Start the first animation (dropper moves first)
    animateDropperToTarget(performance.now());
}

function stepThree(onComplete) {
    const duration = 1000; // Animation duration in milliseconds
    const startTime = performance.now();

    // Leaf movement & rotation
    const leafTarget = new THREE.Vector3(11.5, 1.3, -1.31);
    const leafStart = leaf.position.clone();
    const leafRotationStart = leaf.rotation.clone(); 
    const leafRotationTarget = new THREE.Euler(leafRotationStart.x, leafRotationStart.y, leafRotationStart.z + THREE.MathUtils.degToRad(35));

    // Slide movement & rotation
    const slideStart = slide.position.clone();
    const slideTarget = new THREE.Vector3(10.4, 0.4, -1.31);
    const slideRotationStart = slide.rotation.clone();
    const slideRotationTarget = new THREE.Euler(slideRotationStart.x, slideRotationStart.y, slideRotationStart.z + THREE.MathUtils.degToRad(37));

    // CoverSlip movement & rotation
    const coverSlipTarget = new THREE.Vector3(8.3, -1.15, -1.41);
    const coverSlipStart = coverSlip.position.clone();
    const coverSlipRotationStart = coverSlip.rotation.clone();
    const coverSlipRotationTarget = new THREE.Euler(coverSlipRotationStart.x, coverSlipRotationStart.y, coverSlipRotationStart.z + THREE.MathUtils.degToRad(37));

    function animate() {
        const elapsedTime = performance.now() - startTime;
        const t = Math.min(elapsedTime / duration, 1); // Normalize [0, 1]

        // Move & Rotate Leaf
        leaf.position.lerpVectors(leafStart, leafTarget, t);
        leaf.rotation.set(
            THREE.MathUtils.lerp(leafRotationStart.x, leafRotationTarget.x, t),
            THREE.MathUtils.lerp(leafRotationStart.y, leafRotationTarget.y, t),
            THREE.MathUtils.lerp(leafRotationStart.z, leafRotationTarget.z, t)
        );

        // Move & Rotate Slide
        slide.position.lerpVectors(slideStart, slideTarget, t);
        slide.rotation.set(
            THREE.MathUtils.lerp(slideRotationStart.x, slideRotationTarget.x, t),
            THREE.MathUtils.lerp(slideRotationStart.y, slideRotationTarget.y, t),
            THREE.MathUtils.lerp(slideRotationStart.z, slideRotationTarget.z, t)
        );

        // Move & Rotate CoverSlip
        coverSlip.position.lerpVectors(coverSlipStart, coverSlipTarget, t);
        coverSlip.rotation.set(
            THREE.MathUtils.lerp(coverSlipRotationStart.x, coverSlipRotationTarget.x, t),
            THREE.MathUtils.lerp(coverSlipRotationStart.y, coverSlipRotationTarget.y, t),
            THREE.MathUtils.lerp(coverSlipRotationStart.z, coverSlipRotationTarget.z, t)
        );

        if (t < 1) {
            requestAnimationFrame(animate);
        } else {
            if (onComplete) onComplete(); // Callback after animation completes
        }
    }

    animate();
}


const controls = new OrbitControls(camera, renderer.domElement);

// controls.enableDamping = true; // smooth camera movement
// controls.enablePan = false;
// controls.minDistance = 7; // min zoom
// controls.maxDistance = 10; // max zoom
// controls.minPolarAngle = 1.0;
// controls.maxPolarAngle = 1.2;
// controls.minAzimuthAngle = -0.5;
// controls.maxAzimuthAngle = 0.5;
// controls.autoRotate = false;
// controls.update();


// Add lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambientLight);

// ********** left stool **********
const light1 = new THREE.DirectionalLight(0xffe6cc, 0.3);
light1.position.set(-10.01, 15.596, -14.712);
light1.castShadow = true;
light1.shadow.mapSize.set = (1024, 1024);
scene.add(light1);

// ********** right stool **********
const light2 = new THREE.DirectionalLight(0xffe6cc, 0.3);
light2.position.set(13.879, 15.596, -14.818);
light2.castShadow = true;
light2.shadow.mapSize.set = (1024, 1024);
scene.add(light2);

// ********** floor **********
const light3 = new THREE.DirectionalLight(0xcc99ff, 1);
light3.position.set(-10.078, 15.596, 9.475);
light3.castShadow = true;
light3.shadow.mapSize.set = (1024, 1024);
scene.add(light3);

// ********** left wall **********
const light4 = new THREE.DirectionalLight(0xaaccff, 1);
light4.position.set(12.656, 15.596, 9.611);
light4.castShadow = true;
light4.shadow.mapSize.set = (1024, 1024);
scene.add(light4);

// ********** right wall **********
const light5 = new THREE.DirectionalLight(0xffffff, 0.5);
light5.position.set(-17.477, 8.398, 3.335);
light5.castShadow = true;
light5.shadow.mapSize.set = (1024, 1024);
scene.add(light5);

// ********** top down **********
const light6 = new THREE.DirectionalLight(0xffe6cc, 0.1);
light6.position.set(0.029, 8.562, -16.034);
light6.castShadow = true;
light6.shadow.mapSize.set = (1024, 1024);
scene.add(light6);

// ********** front facing **********
const light7 = new THREE.DirectionalLight(0xffd699, 2);
light7.position.set(0.029, 8.562, 26.913);
light7.castShadow = true;
light7.shadow.mapSize.set = (1024, 1024);
scene.add(light7);

// Create models
// ********** Lab **********
const gltfLoader = new GLTFLoader();
gltfLoader.load('public/3D_Lab.gltf', function(gltf){
    const model = gltf.scene;
    scene.add(model);
    model.scale.set(40, 40, 40); // Scale up model
    console.log('Lab loaded');
}, undefined, function(error){
    console.error('Error loading model: ', error);
});

function addLabel(text) {
    fontLoader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', function (font) {
        const textGeometry = new TextGeometry(text, {
            font: font,
            size: 0.2,
            depth: 0.1
        })

        const textMesh = new THREE.Mesh(textGeometry, [
            new THREE.MeshPhongMaterial({ color: 0xffffff }), // front
            new THREE.MeshPhongMaterial({ color: 0x000000 }) // side
        ])

        textMesh.castShadow = true;
        textMesh.position.set(-1.65, 2.8, 3.5);
        scene.add(textMesh);
    });
}



// ********** Experiment 1 **********
gltfLoader.load('public/3D_Expt1_Nolight.gltf', function(gltf){
    apparatus1 = gltf.scene;
    scene.add(apparatus1);
    apparatus1.scale.set(40, 40, 40); // Scale up model
    leaf = scene.getObjectByName('LEAF');
    slide = scene.getObjectByName('SLIDE');
    dropper = scene.getObjectByName('DROPPER');
    coverSlip = scene.getObjectByName('COVERSLIP');
    elodeasps = scene.getObjectByName('ELODEASPS');
    elodeasps = scene.getObjectByName('ELODEASPS');
    if (elodeasps) {
        // Add label above Elodea sp.
        addLabel('Elodea sp.');
    }
    if (scene.getObjectByName('MICROSCOPE')) {
        scene.getObjectByName('MICROSCOPE').visible = false; // Hide the object
    }
    
    console.log('Expt1 loaded');
}, undefined, function(error){
    console.error('Error loading Expt1: ', error);
});

// ********** Compound Microscope **********
gltfLoader.load('public/3D_Expt1_CMicroscope_Nolight.gltf', function(gltf){
    const cMicroscope = gltf.scene;
    scene.add(cMicroscope);
    cMicroscope.scale.set(0.3, 0.3, 0.3); // Scale down model
    cMicroscope.position.set(0.33, 0.6, 1);
    microscope = scene.getObjectByName('COMPOUNDMICROSCOPE');
}, undefined, function(error){
    console.error('Error loading model: ', error);
});

// ********** Petri Dish **********
gltfLoader.load('public/3D_Expt1_PetriDish_Nolight.gltf', function(gltf){
    const petriDish = gltf.scene;
    scene.add(petriDish);
    petriDish.scale.set(0.4, 0.4, 0.4); // Scale down model
    petriDish.position.set(0.54, -0.01, 0.04);
}, undefined, function(error){
    console.error('Error loading model: ', error);
});

// Resize handler
function resizeTablet() {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const tabletContainer = document.querySelector('.tablet-container');
    const tabletOutline = document.querySelector('.tablet-outline');
    const tablet = document.querySelector('.tablet');
    const instructions = document.querySelector('.instructions');

    // Set tablet size based on screen dimensions
    const width = Math.min(Math.max(screenWidth * 0.3, 180), 400); // 40% of screen width, min 180px, max 400px
    const height = Math.max(screenHeight * 0.3, 120); // 25% of screen height, min 120px

    tabletContainer.style.width = `${width}px`;
    tabletContainer.style.height = `${height}px`;
    tabletOutline.style.width = `${width}px`;
    tabletOutline.style.height = `${height}px`;
    tablet.style.width = `${width * 0.9}px`;
    tablet.style.height = `${height * 0.9}px`;

    // Adjust font size dynamically
    const textLength = instructions.innerText.length;
    let fontSize = Math.max(height * 0.12, 14); // Default font size based on height
    if (textLength > 50) fontSize *= 0.85; // Reduce if text is long
    if (textLength > 80) fontSize *= 0.7;
    if (textLength > 120) fontSize *= 0.6;

    instructions.style.fontSize = `${fontSize}px`;
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    resizeTablet(); // Call resizeTablet to adjust tablet size
});
window.addEventListener('load', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    resizeTablet();
});

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

animate();