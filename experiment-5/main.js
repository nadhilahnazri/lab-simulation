import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

let popupNotice;

let apparatus5;
let knife;
let wholeApple;

let slicedApple;
let slice1;
let slice2;
let slice3;
let slice4;

let dunkedApple;
let dunk1;
let dunk2;
let dunk3;

let applePlate;
let plateSalt;
let plateSugar;
let plateVinegar;
let plateNone;
let appleBrowned;

let step = -1;
const steps = [
    "Step 1:\nCut the apple into 5 slices.",
    "Step 2:\nOne slice acts as control. Each other slice is immersed into different prepared solutions for a few minutes.",
    "Step 3:\nTake out the apple slices and observe the colour changes.",
    "Which slice browned the fastest? Slowest? Did any of them turn brown really fast but then stayed the same colour by the end of 2 hours?",
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
const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000); // (fov, aspect, near, far):
camera.position.set(0, 5, 10);


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

    // Fade out the popupNotice
    popupNotice.style.transition = 'opacity 0.5s ease-in-out';
    popupNotice.style.opacity = 0;
    setTimeout(() => {
        if (popupNotice.parentNode) {
            popupNotice.parentNode.removeChild(popupNotice); // Remove from DOM after fade-out
        }
    }, 500); // Match the duration of the fade-out animation

    // Reset positions
    slice1.position.set(0, 0, 0);
    slice2.position.set(0, 0, 0);
    slice3.position.set(0, 0, 0);
    slice4.position.set(0, 0, 0);
    slice1.rotation.set(0, 0, 0);
    slice2.rotation.set(0, 0, 0);
    slice3.rotation.set(0, 0, 0);
    slice4.rotation.set(0, 0, 0);

    // Reset visibility
    wholeApple.visible = true;

    slicedApple.visible = false;
    slicedApple.traverse((child) => {
        child.visible = false;
    });
    dunkedApple.visible = false;
    dunkedApple.traverse((child) => {
        child.visible = false;
    });
    applePlate.visible = false;
    applePlate.traverse((child) => {
        child.visible = false;
        if (child.isMesh) {
            child.material.opacity = 1; // Reset opacity for future use
            child.material.transparent = false; // Disable transparency
        }
    });
    appleBrowned.visible = false;
    appleBrowned.traverse((child) => {
        child.visible = false;
    });

    if (onComplete) onComplete();

}

function stepOne(onComplete) {
    wholeApple.visible = true;
    slicedApple.traverse(child => child.visible = false);

    const knifeStart = knife.position.clone();
    const knifeAbove = new THREE.Vector3(-52, 10, 48);
    const knifeDown = new THREE.Vector3(-52, 10, 60);

    const knifeRotationTarget = new THREE.Euler(0, THREE.MathUtils.degToRad(-90), 0);
    const knifeRotationStart = knife.rotation.clone();

    const durationShort = 500;
    const durationMed = 1000;
    const sliceCount = 4;
    let currentSlice = 0;

    // knife up
    function knifeUp(startTime) {
        function animate() {
            const elapsedTime = performance.now() - startTime;
            const t = Math.min(elapsedTime / durationMed, 1);

            knife.position.lerpVectors(knifeStart, knifeAbove, t);
            knife.rotation.set(
                THREE.MathUtils.lerp(knifeRotationStart.x, knifeRotationTarget.x, t),
                THREE.MathUtils.lerp(knifeRotationStart.y, knifeRotationTarget.y, t),
                THREE.MathUtils.lerp(knifeRotationStart.z, knifeRotationTarget.z, t)
            );

            if (t < 1) {
                requestAnimationFrame(animate);
            } else {
                animateSlice(performance.now());
            }
        }
        animate();
    }

    // start slicing
    function animateSlice(startTime) {
        function sliceDown(callback) {
            const start = performance.now();
            function animate() {
                const elapsed = performance.now() - start;
                const t = Math.min(elapsed / durationShort, 1);
                knife.position.lerpVectors(knifeAbove, knifeDown, t);
                if (t < 1) {
                    requestAnimationFrame(animate);
                } else {
                    setTimeout(() => callback(performance.now()), 200);
                }
            }
            animate();
        }

        function sliceUp(callback) {
            const start = performance.now();
            function animate() {
                const elapsed = performance.now() - start;
                const t = Math.min(elapsed / durationShort, 1);
                knife.position.lerpVectors(knifeDown, knifeAbove, t);
                if (t < 1) {
                    requestAnimationFrame(animate);
                } else {
                    setTimeout(() => callback(), 100);
                }
            }
            animate();
        }

        function performSlice() {
            if (currentSlice < sliceCount) {
                sliceDown(() => {
                    sliceUp(() => {
                        currentSlice++;
                        performSlice();
                    });
                });
            } else {
                // Slicing complete
                wholeApple.visible = false;
                // Show slicedApple
                slicedApple.traverse(child => child.visible = true);

                // Return knife to original position
                setTimeout(() => returnKnife(performance.now()), 100);
            }
        }
        performSlice();
    }

    function returnKnife(startTime) {
        function animate() {
            const elapsed = performance.now() - startTime;
            const t = Math.min(elapsed / durationShort, 1);

            knife.position.lerpVectors(knifeAbove, knifeStart, t);
            knife.rotation.set(
                THREE.MathUtils.lerp(knifeRotationTarget.x, knifeRotationStart.x, t),
                THREE.MathUtils.lerp(knifeRotationTarget.y, knifeRotationStart.y, t),
                THREE.MathUtils.lerp(knifeRotationTarget.z, knifeRotationStart.z, t)
            );

            if (t < 1) {
                requestAnimationFrame(animate);
            } else {
                if (onComplete) onComplete();
            }
        }
        animate();
    }

    // Start the first animation
    knifeUp(performance.now());
}

function stepTwo(onComplete) {    
    // Add a pop-up notice
    popupNotice = document.createElement('div');
    popupNotice.innerText = "NOTE: Solutions are prepared by mixing 1 tsp of each agent with ½ cup of water";
    popupNotice.style.position = 'absolute';
    popupNotice.style.top = '15%';
    popupNotice.style.left = '50%';
    popupNotice.style.transform = 'translate(-50%, -50%)';
    popupNotice.style.padding = '20px';
    popupNotice.style.background = 'rgba(0, 0, 0, 0.8)';
    popupNotice.style.color = 'white';
    popupNotice.style.fontSize = '16px';
    popupNotice.style.borderRadius = '8px';
    popupNotice.style.zIndex = '1000';
    popupNotice.style.textAlign = 'center';
    popupNotice.style.display = 'block';
    popupNotice.style.opacity = 0;
    setTimeout(() => {
        popupNotice.style.opacity = 1;
    }, 50); // Small delay ensures it's rendered before transition
    

    // Fade in the popupNotice
    popupNotice.style.opacity = 0;
    popupNotice.style.transition = 'opacity 0.5s ease-in-out';
    setTimeout(() => {
        popupNotice.style.opacity = 1;
    }, 0);
    document.body.appendChild(popupNotice);

    // START APPLE DUNKING
    wholeApple.visible = false;
    dunkedApple.visible = true;
    applePlate.visible = true;
    slicedApple.traverse(child => child.visible = true);
    const duration = 1000;

    // REUSABLE FUNCTION
    function dunkSlice(slice, above, dunk, rotTarget, onComplete) {
        function moveAbove(startTime) {
            const elapsedTime = performance.now() - startTime;
            const t = Math.min(elapsedTime / duration, 1);
    
            slice.position.lerpVectors(slice.position.clone(), above, t);
            slice.rotation.set(
                THREE.MathUtils.lerp(slice.rotation.clone().x, rotTarget.x, t),
                THREE.MathUtils.lerp(slice.rotation.clone().y, rotTarget.y, t),
                THREE.MathUtils.lerp(slice.rotation.clone().z, rotTarget.z, t)
            );
    
            if (t < 1) {
                requestAnimationFrame(() => moveAbove(startTime));
            } else {
                setTimeout(() => moveDown(performance.now()), 200);
            }
        }
    
        function moveDown(startTimeDown) {
            function animateDown() {
                const elapsedTime = performance.now() - startTimeDown;
                const t = Math.min(elapsedTime / duration, 1);
    
                slice.position.lerpVectors(above, dunk, t);
    
                if (t < 1) {
                    requestAnimationFrame(animateDown);
                } else if (onComplete) {
                    onComplete();
                }
            }
            animateDown();
        }
    
        moveAbove(performance.now());
    }

    const dunkRotationTarget = new THREE.Euler(THREE.MathUtils.degToRad(90), 0, 0);

    // slices 2:salt, 3:sugar, 1:vinegar, 4:none
    // salt
    dunkSlice(slice2, new THREE.Vector3(23.5, -4, -10), new THREE.Vector3(23.5, -4, 6), dunkRotationTarget, () => {
        // repeat
        slice2.visible = false;
        if (dunk3) {
            dunk3.traverse(child => {
                child.visible = true;
            });
        }
        // sugar
        dunkSlice(slice3, new THREE.Vector3(46, -4, -10), new THREE.Vector3(46, -4, 5.5), dunkRotationTarget, () => {
            slice3.visible = false;
            if (dunk2) {
                dunk2.traverse(child => {
                    child.visible = true;
                });
            }
            // vinegar
            dunkSlice(slice1, new THREE.Vector3(48.3, -3.9, -20), new THREE.Vector3(48.3, -3.9, -6), dunkRotationTarget, () => {
                slice1.visible = false;
                if (dunk1) {
                    dunk1.traverse(child => {
                        child.visible = true;
                    });
                }
                // no liquid
                dunkSlice(slice4, new THREE.Vector3(90, 23, -10), new THREE.Vector3(90, 23, 0), new THREE.Euler(0, 0, THREE.MathUtils.degToRad(40)), () => {
                    slice4.visible = false;
                    if (plateNone) {
                        plateNone.traverse(child => {
                            child.visible = true;
                        });
                    }
                    if (onComplete) onComplete();
                });
            });
        });
    });
}

function stepThree(onComplete) {
    // Fade out the popupNotice
    popupNotice.style.transition = 'opacity 0.5s ease-in-out';
    popupNotice.style.opacity = 0;
    setTimeout(() => {
        if (popupNotice.parentNode) {
            popupNotice.parentNode.removeChild(popupNotice); // Remove from DOM after fade-out
        }
    }, 500); // Match the duration of the fade-out animation

    // apple visibility
    dunkedApple.visible = false;
    dunkedApple.traverse(child => { child.visible = false; });
    slice1.visible = true;
    slice2.visible = true;
    slice3.visible = true;

    const duration = 1000;
    const newRotTarget = new THREE.Euler(0, 0, THREE.MathUtils.degToRad(40));

    // REUSABLE FUNCTION
    function takeOut(slice, out, place, rotTarget, onComplete) {
        function moveAbove(startTime) {
            const elapsedTime = performance.now() - startTime;
            const t = Math.min(elapsedTime / duration, 1);
    
            slice.position.lerpVectors(slice.position.clone(), out, t);
            slice.rotation.set(
                THREE.MathUtils.lerp(slice.rotation.clone().x, rotTarget.x, t),
                THREE.MathUtils.lerp(slice.rotation.clone().y, rotTarget.y, t),
                THREE.MathUtils.lerp(slice.rotation.clone().z, rotTarget.z, t)
            );
    
            if (t < 1) {
                requestAnimationFrame(() => moveAbove(startTime));
            } else {
                setTimeout(() => moveDown(performance.now()), 200);
            }
        }
    
        function moveDown(startTimeDown) {
            function animateDown() {
                const elapsedTime = performance.now() - startTimeDown;
                const t = Math.min(elapsedTime / duration, 1);
    
                slice.position.lerpVectors(out, place, t);
    
                if (t < 1) {
                    requestAnimationFrame(animateDown);
                } else if (onComplete) {
                    onComplete();
                }
            }
            animateDown();
        }
    
        moveAbove(performance.now());
    }

    // slices 2:salt, 3:sugar, 1:vinegar
    takeOut(slice2, new THREE.Vector3(4.5, 41, -15), new THREE.Vector3(80, 50, 0), newRotTarget, () => {
        slice2.visible = false;
        if (plateSalt) {
            plateSalt.traverse(child => {
                child.visible = true;
            });
        }
        takeOut(slice3, new THREE.Vector3(25, 44, -15), new THREE.Vector3(66.5, 52, 0), newRotTarget, () => {
            slice3.visible = false;
            if (plateSugar) {
                plateSugar.traverse(child => {
                    child.visible = true;
                });
            }
            takeOut(slice1, new THREE.Vector3(38, 28, -15), new THREE.Vector3(65, 19, 0), newRotTarget, () => {
                slice1.visible = false;
                if (plateVinegar) {
                    plateVinegar.traverse(child => {
                        child.visible = true;
                    });
                }
                if(onComplete) onComplete();
            });
        });
    });

}

function stepFour (onComplete) {
    // Add a pop-up notice
    popupNotice = document.createElement('div');
    popupNotice.innerText = "RESULTS: \n1. No liquid (exposed to air) - turns brown the fastest \n2. Salt - browning was delayed compared to control. Light discolouration appeared after a longer period \n3. Sugar - browning was also delayed but not as effectively as salt. The sugar-coated apple retained some freshness but showed slight browning after some time \n4. Vinegar - minimal to no browning. The apple stayed fresh for a much longer period";
    popupNotice.style.position = 'absolute';
    popupNotice.style.top = '15%';
    popupNotice.style.left = '50%';
    popupNotice.style.transform = 'translate(-50%, -50%)';
    popupNotice.style.padding = '20px';
    popupNotice.style.background = 'rgba(255, 255, 255, 0.8)';
    popupNotice.style.color = 'black';
    popupNotice.style.fontSize = 'clamp(8px, 2vw, 24px)';
    popupNotice.style.borderRadius = '8px';
    popupNotice.style.zIndex = '1000';
    popupNotice.style.textAlign = 'justify';
    popupNotice.style.display = 'block';
    popupNotice.style.opacity = 0;
    setTimeout(() => {
        popupNotice.style.opacity = 1;
    }, 50); // Small delay ensures it's rendered before transition
    

    // Fade in the popupNotice
    popupNotice.style.opacity = 0;
    popupNotice.style.transition = 'opacity 0.5s ease-in-out';
    setTimeout(() => {
        popupNotice.style.opacity = 1;
    }, 0);
    document.body.appendChild(popupNotice);
    
    const fadeDuration = 1000; // in ms
    const startTime = performance.now();
    
    // Ensure both apples are visible and transparent is enabled
    applePlate.visible = true;
    applePlate.traverse(child => {
        child.visible = true;
        if (child.isMesh) {
            child.material.transparent = true; // Enable transparency
            child.material.opacity = 1; // Start fully visible
        }
    });
    appleBrowned.visible = true;
    appleBrowned.traverse(child => {
        child.visible = true;
    });
    
    function fadeApples() {
        const elapsedTime = performance.now() - startTime;
        const t = Math.min(elapsedTime / fadeDuration, 1);

        applePlate.traverse(child => {
            if (child.isMesh) {
                child.material.opacity = 1 - t;
            }
        });
        
        if (t < 1) {
            requestAnimationFrame(fadeApples);
        } else {
            // Hide the old apple completely after fade
            applePlate.visible = false;
            applePlate.traverse(child => {
                if (child.isMesh) {
                    child.material.opacity = 1; // reset for future use
                }
            });
            if (onComplete) onComplete();
        }
    }
    fadeApples();    
}

// Add controls
const controls = new OrbitControls(camera, renderer.domElement);

controls.enableDamping = true; // smooth camera movement
controls.enablePan = true;
if (!isSoftwareRenderer()) {
    controls.minDistance = 7; // min zoom
    controls.maxDistance = 10; // max zoom
    controls.minPolarAngle = 1.0;
    controls.maxPolarAngle = 1.2;
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

// ********** Experiment 5 **********
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('https://unpkg.com/three@0.163.0/examples/jsm/libs/draco/');
gltfLoader.setDRACOLoader(dracoLoader);
gltfLoader.load('./public/3D_Expt5_WithoutLight.gltf', function(gltf){
    apparatus5 = gltf.scene;
    scene.add(apparatus5);
    apparatus5.scale.set(3, 3, 3); // Scale up model
    apparatus5.position.set(0.1, 2.47, 4);

    // Apparatus names
    knife = scene.getObjectByName('KNIFE');
    wholeApple = scene.getObjectByName('APPLEWHOLE');
    slicedApple = scene.getObjectByName('APPLESLICES');
    slice1 = scene.getObjectByName('SLICEDAPPLE1');
    slice2 = scene.getObjectByName('SLICEDAPPLE2');
    slice3 = scene.getObjectByName('SLICEDAPPLE3');
    slice4 = scene.getObjectByName('SLICEDAPPLE4');

    dunkedApple = scene.getObjectByName('APPLESLICES_INSOLUTION');
    dunk1 = scene.getObjectByName('SLICEDAPPLE_INSOLUTION1');
    dunk2 = scene.getObjectByName('SLICEDAPPLE_INSOLUTION2');
    dunk3 = scene.getObjectByName('SLICEDAPPLE_INSOLUTION3');

    applePlate = scene.getObjectByName('APPLESLICES_ONPLATE');
    plateSalt = scene.getObjectByName('APPLESLICES_ONPLATE_SALT');
    plateSugar = scene.getObjectByName('APPLESLICES_ONPLATE_SUGAR');
    plateVinegar = scene.getObjectByName('APPLESLICES_ONPLATE_VINEGAR');
    plateNone = scene.getObjectByName('APPLESLICES_ONPLATE_NOLIQUID');

    appleBrowned = scene.getObjectByName('APPLESLICES_ONPLATE_BROWNED');

    if (slicedApple) {
        slicedApple.traverse((child) => {
            child.visible = false;
        });
    }
    if (dunkedApple) {
        dunkedApple.traverse((child) => {
            child.visible = false;
        });
    }
    if (applePlate) {
        applePlate.traverse((child) => {
            child.visible = false;
        });
    }
    if (appleBrowned) {
        appleBrowned.traverse((child) => {
            child.visible = false;
        });
    }
    
    console.log('Expt5 loaded');
}, undefined, function(error){
    console.error('Error loading Expt5: ', error);
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
    if (textLength > 140) fontSize *= 0.6;

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