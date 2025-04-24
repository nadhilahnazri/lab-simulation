import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

let apparatus4;
let cottonBud;
let petriDishes;

let tapWater;
let handphone;
let lightSwitch;
let bathroomSink;
let control;

let resultsAgar;
let AtapWater;
let Ahandphone;
let AlightSwitch;
let AbathroomSink;
let Acontrol;
let AlabTable;

let labTable;
let coverLabTable;

let labelLabTable;
let labelControl;
let labelBathroomSink;
let labelSwitch;
let labelHandphone;
let labelTapWater;

let originalBudRotation;

let step = -1;
const steps = [
    "Step 1:\nLabel the Petri dishes with sample sources.",
    "Step 2:\nUse sterile cotton swabs to collect samples from the designated areas.",
    "Step 3:\nGently swipe the swab onto the surface of the agar in the respective Petri dish.",
    "Step 4:\nPlace the Petri dishes in dark place.",
    "Step 5:\nAfter 24-48 hours, observe bacterial growth.",
    "END OF EXPERIMENT" // Empty string for the last step
];

// Intro and conclusion overlays
const introOverlay = document.getElementById('intro-overlay');
const introMessage = document.getElementById('intro-message');
const progressBar = document.getElementById('progress-bar');
const loadingManager = new THREE.LoadingManager();

loadingManager.onProgress = (url, itemsLoaded, itemsTotal) => {
    const progress = (itemsLoaded / itemsTotal) * 100;
    progressBar.style.width = `${progress}%`;
}

loadingManager.onLoad = () => {
    introMessage.innerText = "Click anywhere to start";
    progressBar.style.width = '100%';

    introOverlay.addEventListener('click', () => {
        introOverlay.classList.add('fade-out');
        setTimeout(() => {
            introOverlay.style.display = 'none';
        }, 700); // Match the duration of the fade-out animation
    });
};

// Create scene
const scene = new THREE.Scene();


// Create camera
const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000); // (fov, aspect, near, far):
camera.position.set(0.5, 6, 7);

// Create renderer
let renderer;
if (!isSoftwareRenderer()) {
    renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(window.devicePixelRatio);
}
else {
    renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance'  });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
}
// Common config
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1;
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.getElementById('three-container').appendChild(renderer.domElement); // Attach to correct div


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
        stepOne(() => { animateReady = true; });
    } else if (step === 1) {
        stepTwo(() => { animateReady = true; });
    } else if (step === 2) {
        stepThree(() => { animateReady = true; });
    } else if (step === 3) {
        stepFour(() => { animateReady = true; });
    } else if (step === 4) {
        stepFive(() => { animateReady = true; });
    } else {
        resetAll(() => {
            animateReady = true;
        });
    }
}

const tablet = document.querySelector('.tablet');
if (tablet) {
    tablet.addEventListener('click', () => {
        nextStep();
    });
}

function showConclusionOverlay(onClick) {
    const overlay = document.getElementById('conclusion-overlay');

    // Show the overlay with a fade-in effect
    overlay.style.display = 'flex';
    overlay.style.opacity = 0;
    overlay.style.pointerEvents = 'auto';
    overlay.animate([{ opacity: 0 }, { opacity: 1 }], {
        duration: 500,
        fill: 'forwards'
    });

    // Click to trigger the next step
    overlay.addEventListener('click', function handleClick() {
        overlay.animate([{ opacity: 1 }, { opacity: 0 }], {
            duration: 500,
            fill: 'forwards'
        }).onfinish = () => {
            overlay.style.display = 'none';
            overlay.removeEventListener('click', handleClick); // Clean up the click handler
            if (onClick) onClick(); // Trigger the callback (nextStep)
        };
    });
}


function resetAll(onComplete) {
    // Show the new conclusion overlay with the custom message
    showConclusionOverlay(() => {
        const instructions = document.querySelector(".instructions");
        if (!instructions) return; 
    
        instructions.innerText = "Click Here to Start Experiment";
        }
    );
    cottonBud.visible = true;
    resultsAgar.visible = false;
    AtapWater.visible = true;
    Ahandphone.visible = true;
    AlightSwitch.visible = true;
    AbathroomSink.visible = true;
    Acontrol.visible = true;
    AlabTable.visible = true;

    if (onComplete) onComplete();

}

function stepOne(onComplete) {
    const labels = [
        labelLabTable,
        labelControl,
        labelBathroomSink,
        labelSwitch,
        labelHandphone,
        labelTapWater
    ];
    
    function scaleLabel(label, startTime, onComplete) {
        const duration = 1500;
        const originalScale = label.scale.clone();
        const targetScale = originalScale.clone().multiplyScalar(1.5); // Scale up by 1.5x

        function animate() {
            const elapsedTime = performance.now() - startTime;
            const t = Math.min(elapsedTime / duration, 1);

            if (t <= 0.25) {
                // Scale up for the first quarter
                label.scale.lerpVectors(originalScale, targetScale, t * 4);
            } else if (t <= 0.75) {
                // Hold the scaled-up size for the middle half
                label.scale.copy(targetScale);
            } else {
                // Scale back down for the last quarter
                label.scale.lerpVectors(targetScale, originalScale, (t - 0.75) * 4);
            }

            if (t < 1) {
                requestAnimationFrame(animate);
            } else if (onComplete) {
                onComplete();
            }
        }
        animate();
    }

    function animateLabelsSequentially(index = 0) {
        if (index >= labels.length) {
            if (onComplete) onComplete();
            return;
        }

        scaleLabel(labels[index], performance.now(), () => {
            animateLabelsSequentially(index + 1);
        });
    }

    animateLabelsSequentially();
}

function stepTwo(onComplete) {    
    const budTarget = new THREE.Vector3(0, 10, -17);

    const budRotationTarget = new THREE.Euler(THREE.MathUtils.degToRad(50), 0, 0); // Rotate 180 degrees
    const budRotationStart = cottonBud.rotation.clone();

    const duration = 500;
    const startTime = performance.now();

    // show cotton bud
    function animateCottonBud(startTime) {
        const budStart = cottonBud.position.clone();
        function animate() {
            const elapsedTime = performance.now() - startTime;
            const t = Math.min(elapsedTime / duration, 1);

            cottonBud.position.lerpVectors(budStart, budTarget, t);
            cottonBud.rotation.set(
                THREE.MathUtils.lerp(budRotationStart.x, budRotationTarget.x, t),
                budRotationStart.y,
                budRotationStart.z
            );

            if (t < 1) {
                requestAnimationFrame(animate);
            } else {
                setTimeout(() => {
                    animateSwab();
                }, 500);
                if (onComplete) onComplete();
            }
        }
        animate();
    }

    // swab table
    function animateSwab(onComplete) {
        const downPosition = new THREE.Vector3(0, 2, -17);  // Close to surface
        const swipeStart = new THREE.Vector3(-1, 2, -17);
        const swipeEnd = new THREE.Vector3(1, 2, -17);
        const upPosition = new THREE.Vector3(0, 10, -17); // Lift back up
    
        const duration = 500;
    
        function animatePosition(from, to, callback) {
            const startTime = performance.now();
            function animate() {
                const elapsed = performance.now() - startTime;
                const t = Math.min(elapsed / duration, 1);
                cottonBud.position.lerpVectors(from, to, t);
                if (t < 1) {
                    requestAnimationFrame(animate);
                } else {
                    if (callback) callback();
                }
            }
            animate();
        }
    
        // Sequence: down → swipe → back → up
        animatePosition(cottonBud.position.clone(), downPosition, () => {
            animatePosition(downPosition, swipeStart, () => {
                animatePosition(swipeStart, swipeEnd, () => {
                    animatePosition(swipeEnd, swipeStart, () => {
                        animatePosition(swipeStart, upPosition, () => {
                            if (onComplete) onComplete();
                        });
                    });
                });
            });
        });
    }

    animateCottonBud(performance.now());
}

function stepThree(onComplete) {
    // animate agar swab
    function animateDish() {
        const duration = 500;

        const dishStart = labTable.position.clone();
        const dishTarget = new THREE.Vector3(0, 5, 2);

        const coverTarget = new THREE.Vector3(0, -1, 12);
        const labelTarget = new THREE.Vector3(0, -1, 12);

        // show petri dish
        function moveDish(callback) {
            const startTime = performance.now();
            function animate() {
                const elapsedTime = performance.now() - startTime;
                const t = Math.min(elapsedTime / duration, 1);
                labTable.position.lerpVectors(dishStart, dishTarget, t);
                if (t < 1) requestAnimationFrame(animate);
                else callback();
            }
            animate();
        }

        // take off cover and label
        function openDish(callback) {
            const startTime = performance.now();
            const coverStart = coverLabTable.position.clone();
            const labelStart = labelLabTable.position.clone();
            function animate() {
                const elapsedTime = performance.now() - startTime;
                const t = Math.min(elapsedTime / duration, 1);
                coverLabTable.position.lerpVectors(coverStart, coverTarget, t);
                labelLabTable.position.lerpVectors(labelStart, labelTarget, t);
                if (t < 1) requestAnimationFrame(animate);
                else callback();
            }
            animate();
        }

        function swabToAgar(callback) {
            const swabStart = cottonBud.position.clone();
            const swabTarget = new THREE.Vector3(20, 8, 1);
            const duration = 500;
            const startTime = performance.now();
            function animate() {
                const elapsedTime = performance.now() - startTime;
                const t = Math.min(elapsedTime / duration, 1);
                cottonBud.position.lerpVectors(swabStart, swabTarget, t);
                if (t < 1) requestAnimationFrame(animate);
                else callback();
            }
            animate();
        }

        moveDish(() => {
            openDish(() => {
                swabToAgar(() => {
                    animateSwabAgar(() => {
                        returnCottonBud();
                    });
                });
            });
        });

    }

    // swab agar
    function animateSwabAgar(onComplete) {
        const points = [
            new THREE.Vector3(20, 8, 1),
            new THREE.Vector3(25, 8, 1.5),
            new THREE.Vector3(20, 8, 2.5),
            new THREE.Vector3(25, 8, 3),
            new THREE.Vector3(20, 8, 4),
            new THREE.Vector3(25, 8, 5.5),
            new THREE.Vector3(20, 8, 6.5)
        ];
    
        const duration = 300;
    
        function moveToNext(index) {
            if (index >= points.length - 1) {
                if (onComplete) onComplete();
                return;
            }
    
            const from = points[index].clone();
            const to = points[index + 1].clone();
            const startTime = performance.now();
    
            function animate() {
                const elapsed = performance.now() - startTime;
                const t = Math.min(elapsed / duration, 1);
    
                cottonBud.position.lerpVectors(from, to, t);
    
                if (t < 1) {
                    requestAnimationFrame(animate);
                } else {
                    moveToNext(index + 1);
                }
            }
    
            animate();
        }
    
        cottonBud.position.copy(points[0]); // Set starting point
        moveToNext(0);
    }

    // return everything
    function returnCottonBud() {
        const budStart = new THREE.Vector3(0, 0, 0);
        const budTarget = cottonBud.position.clone();
        const budOut = new THREE.Vector3(budTarget.x - 100, budTarget.y, budTarget.z - 10);
        const startTime = performance.now();
        const duration = 1000;

        const labelTarget = new THREE.Vector3(0, 0, 0);
        const labelStart = labelLabTable.position.clone();
        const coverTarget = new THREE.Vector3(0, 0, 0);
        const coverStart = coverLabTable.position.clone();
        const dishStart = labTable.position.clone();
        const dishTarget = new THREE.Vector3(0, 0, 0);

        const budRotationTarget = originalBudRotation;
        const budRotationStart = cottonBud.rotation.clone();

        function animate() {
            const elapsedTime = performance.now() - startTime;
            const t = Math.min(elapsedTime / duration, 1); // Normalize [0, 1]

            setTimeout(() => {
                cottonBud.visible = false;
            }, 500);
            cottonBud.position.lerpVectors(budTarget, budOut, t);
            labelLabTable.position.lerpVectors(labelStart, labelTarget, t);
            coverLabTable.position.lerpVectors(coverStart, coverTarget, t);

            if (t < 1) {
                requestAnimationFrame(animate);
            } else {
                cottonBud.position.lerpVectors(budTarget, budStart, t);
                cottonBud.rotation.set(
                    budRotationTarget.x,
                    budRotationTarget.y,
                    budRotationTarget.z
                );
                setTimeout(() => {
                    labTable.position.lerpVectors(dishStart, dishTarget, t);
                }, 500);
                if (onComplete) onComplete();
            }
        }
        animate();
    }
    animateDish();
}

function stepFour(onComplete) {
    const duration = 2000; // Duration of the animation in milliseconds
    const startTime = performance.now();
    
    const petriDishesStart = petriDishes.position.clone();
    const up = new THREE.Vector3(-10, 5, 0);
    const petriDishesTarget = new THREE.Vector3(-10, 5, 60);

    function animate() {
        const elapsedTime = performance.now() - startTime;
        const t = Math.min(elapsedTime / duration, 1);

        if (t <= 0.50) {
            const t1 = t * 2;
            petriDishes.position.lerpVectors(petriDishesStart, up, t1);
        } else {
            const t2 = (t - 0.5) * 2;
            petriDishes.position.lerpVectors(up, petriDishesTarget, t2);
        }


        if (t < 1) {
            requestAnimationFrame(animate);
        } else {
            petriDishes.visible = false;
            petriDishes.position.lerpVectors(petriDishesTarget, petriDishesStart, t);
            if (onComplete) onComplete(); 
        }
    }
    animate();
}

function stepFive(onComplete) {
    const duration = 2000; // Duration of the animation in milliseconds
    const startTime = performance.now();
    
    const resultsAgarTarget = resultsAgar.position.clone();
    const resultsAgarStart = new THREE.Vector3(0, 6, 65);
    const petriDishesTarget = petriDishes.position.clone();
    const petriDishesStart = new THREE.Vector3(-10, 5, 60);

    function animate() {
        const elapsedTime = performance.now() - startTime;
        const t = Math.min(elapsedTime / duration, 1);
        
        AtapWater.visible = false;
        Ahandphone.visible = false;
        AlightSwitch.visible = false;
        AbathroomSink.visible = false;
        Acontrol.visible = false;
        AlabTable.visible = false;
        resultsAgar.visible = true;
        resultsAgar.position.lerpVectors(resultsAgarStart, resultsAgarTarget, t);
        petriDishes.visible = true;
        petriDishes.position.lerpVectors(petriDishesStart, petriDishesTarget, t);

        if (t < 1) {
            requestAnimationFrame(animate);
        } else if (onComplete) onComplete(); 
    }
    animate();
}


// Add controls
const controls = new OrbitControls(camera, renderer.domElement);

controls.target.set(0.5, 2.5, 4);
controls.enableDamping = true; // smooth camera movement
controls.enablePan = true;
// remove and uncomment
controls.enableRotate = true;
if (!isSoftwareRenderer()) {
    controls.minDistance = 2; // min zoom
    controls.maxDistance = 4; // max zoom
    controls.minPolarAngle = 0.3;
    controls.maxPolarAngle = 1.1;
    controls.minAzimuthAngle = -0.5;
    controls.maxAzimuthAngle = 0.5;
}
else {
    controls.enableRotate = false;
    controls.enableZoom = true;
    controls.minDistance = 7; // min zoom
    controls.maxDistance = 10; // max zoom
}

controls.autoRotate = false;
controls.update();

// Add lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambientLight);

if (!isSoftwareRenderer()) {
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
}

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
//#endregion

// Create models
// ********** Lab **********
const gltfLoader = new GLTFLoader(loadingManager);
gltfLoader.load('./public/3D_Lab.gltf', function(gltf){
    const model = gltf.scene;
    scene.add(model);
    model.scale.set(40, 40, 40); // Scale up model
    console.log('Lab loaded');
}, undefined, function(error){
    console.error('Error loading model: ', error);
});

// ********** Experiment 4 **********
gltfLoader.load('./public/3D_Expt4.gltf', function(gltf){
    apparatus4 = gltf.scene;
    scene.add(apparatus4);
    apparatus4.scale.set(0.05, 0.05, 0.05); // Scale up model
    apparatus4.position.set(0.95, 2.5, 4);

    // Apparatus names
    cottonBud = apparatus4.getObjectByName('COTTONBUD5');
    originalBudRotation = cottonBud.rotation.clone();
    petriDishes = apparatus4.getObjectByName('PETRIDISHES');

    tapWater = apparatus4.getObjectByName('TAPWATER');
    labelTapWater = apparatus4.getObjectByName('LABEL_TAPWATER');
    AtapWater = apparatus4.getObjectByName('AGAR_TAPWATER');

    handphone = apparatus4.getObjectByName('HANDPHONE');
    labelHandphone = apparatus4.getObjectByName('LABEL_HANDPHONE');
    Ahandphone = apparatus4.getObjectByName('AGAR_HANDPHONE');

    lightSwitch = apparatus4.getObjectByName('SWITCH');
    labelSwitch = apparatus4.getObjectByName('LABEL_SWITCH');
    AlightSwitch = apparatus4.getObjectByName('AGAR_SWITCH');

    bathroomSink = apparatus4.getObjectByName('BATHROOMSINK');
    labelBathroomSink = apparatus4.getObjectByName('LABEL_BATHROOMSINK');
    AbathroomSink = apparatus4.getObjectByName('AGAR_BATHROOMSINK');

    control = apparatus4.getObjectByName('CONTROL');
    labelControl = apparatus4.getObjectByName('LABEL_CONTROL');
    Acontrol = apparatus4.getObjectByName('AGAR_CONTROL');

    labTable = apparatus4.getObjectByName('LABTABLE');
    coverLabTable = apparatus4.getObjectByName('COVER_LABTABLE');
    labelLabTable = apparatus4.getObjectByName('LABEL_LABTABLE');
    AlabTable = apparatus4.getObjectByName('AGAR_LABTABLE');

    resultsAgar = apparatus4.getObjectByName('RESULTS_AGAR');
    resultsAgar.visible = false;

    
    console.log('Expt4 loaded');
}, undefined, function(error){
    console.error('Error loading Expt4: ', error);
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
    const width = Math.min(Math.max(screenWidth * 0.4, 180), 400); // 40% of screen width, min 180px, max 400px
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


// Check device capabilities
function isSoftwareRenderer() {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

    if (!gl) return true; // WebGL not supported at all

    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    if (!debugInfo) return false; // Can't detect, assume hardware

    const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
    return renderer.toLowerCase().includes('swiftshader') || renderer.toLowerCase().includes('software');
}

if (isSoftwareRenderer()) {
    const notice = document.createElement('div');
    notice.innerText = "⚠️ You're in low-performance mode. Enable hardware acceleration for best experience.";
    notice.style.position = 'absolute';
    notice.style.top = '10px';
    notice.style.left = '10px';
    notice.style.padding = '10px';
    notice.style.background = 'rgba(0,0,0,0.7)';
    notice.style.color = 'white';
    notice.style.fontSize = '14px';
    notice.style.zIndex = '999';
    document.body.appendChild(notice);
}