import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
// Text
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';

let popupNotice;
let apparatus2;
let procedure;
let afterResult;
let yeast;
let yeastTube;
let brownSugar;
let sugarTube;
let warmWater;
let waterTube;
let waterBubble;
let boilingTube;
let spatula;
let rubberStopper;
let rubberTube;
let balloon;
let filledBalloon;
let balloonTube;
let foam;
var scoops;


let step = -1;
const steps = [
    "Step 1:\nAdd 2 teaspoons of brown sugar into the boiling tube.",
    "Step 2:\nAdd 2 teaspoons of yeast into the same boiling tube.",
    "Step 3:\nPour warm water and plug the boiling tube with rubber stopper. Shake well.",
    "Step 4:\nStretch your balloon over top of the boiling tube. Leave it for 20-30 minutes.",
    "Step 5:\nObserve the reaction and how the air released will fill up the balloon.",
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
    brownSugar.visible = true;
    brownSugar.material.transparent = true;
    yeast.visible = true;
    balloon.visible = true;
    procedure.visible = false;
    procedure.traverse((child) => {
        child.visible = false;
    });
    afterResult.visible = false;
    afterResult.traverse((child) => {
        child.visible = false;
    });

    if (onComplete) onComplete();

}

function stepOne(onComplete) {
    // Add a pop-up notice
    popupNotice = document.createElement('div');
    popupNotice.innerText = "    NOTE: If using other containers, ratio of yeast to brown sugar is in 1:1";
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
    popupNotice.style.display = 'none';
    popupNotice.style.display = 'block';

    // Fade in the popupNotice
    popupNotice.style.opacity = 0;
    popupNotice.style.transition = 'opacity 0.5s ease-in-out';
    setTimeout(() => {
        popupNotice.style.opacity = 1;
    }, 0);
    document.body.appendChild(popupNotice);

    
    procedure.visible = true; // Show procedure
    
    const spatulaStart = spatula.position.clone();

    const spatulaAbove = new THREE.Vector3(11.6, 13, -2);
    const spatulaScoop = new THREE.Vector3(11.6, 5, -2);
    const spatulaTube = new THREE.Vector3(53, 32, -1);

    const spatulaRotationTarget = new THREE.Euler(THREE.MathUtils.degToRad(50), 0, 0); // Rotate 90 degrees
    const spatulaRotationStart = spatula.rotation.clone();

    const durationShort = 500;
    const durationMed = 1000;
    const startTime = performance.now();
    scoops = 0;

    // MOVE ABOVE DISH
    function animateSpatulaToTarget(startTime) {
        function animate() {
            const elapsedTime = performance.now() - startTime;
            const t = Math.min(elapsedTime / durationShort, 1);

            spatula.position.lerpVectors(spatulaStart, spatulaAbove, t);
            spatula.rotation.set(
                THREE.MathUtils.lerp(spatulaRotationStart.x, spatulaRotationTarget.x, t),
                spatulaRotationStart.y,
                spatulaRotationStart.z
            );

            if (t < 1) {
                requestAnimationFrame(animate);
            } else {
                // When done, return spatula to start position
                setTimeout(() => {
                    animateScoop(performance.now());
                }, 500);
            }
        }
        animate();
    }

    // SCOOP BROWN SUGAR
    function animateScoop(startTime) {
        function animate() {
            const elapsedTime = performance.now() - startTime;
            const t = Math.min(elapsedTime / durationShort, 1);

            spatula.position.lerpVectors(spatulaAbove, spatulaScoop, t);

            if (t < 1) {
                requestAnimationFrame(animate);
            } else {
                // When done, move to tube
                setTimeout(() => {
                    if (scoops < 1) {
                        brownSugar.scale.set(1, 0.7, 1);
                    }
                    else {
                        brownSugar.visible = false; // Hide brown sugar after scooping
                    }
                    animateTube(performance.now());
                }, 200);
            }
        }
        animate();
    }

    // MOVE TO TUBE
    function animateTube(startTime) {
        function animate() {
            const elapsedTime = performance.now() - startTime;
            const t = Math.min(elapsedTime / durationMed, 1);

            spatula.position.lerpVectors(spatulaScoop, spatulaTube, t);

            if (t < 1) {
                requestAnimationFrame(animate);
            } else {
                scoops += 1; // Increment scoops
                if (scoops < 2) {
                    sugarTube.visible = true;
                    sugarTube.scale.set(1, 0.5, 1); // Scale up brown sugar in tube
                    // If not done scooping, return to scoop position
                    setTimeout(() => {
                        animateSecondScoop(performance.now());
                    }, 200);
                } else {
                    // When done, return spatula to start position
                    sugarTube.scale.set(1, 1, 1); // Scale up brown sugar in tube
                    setTimeout(() => {
                        animateSpatulaBack(performance.now());
                    }, 200);
                }
            }
        }
        animate();
    }

    // SCOOP AGAIN
    function animateSecondScoop(startTime) {
        function animate() {
            const elapsedTime = performance.now() - startTime;
            const t = Math.min(elapsedTime / durationMed, 1);
            spatula.position.lerpVectors(spatulaTube, spatulaAbove, t);


            if (t < 1) {
                requestAnimationFrame(animate);
            } else {
                animateScoop(performance.now());
            }
        }
        animate();
    }

    function animateSpatulaBack(startTime) {
        function animate() {
            const elapsedTime = performance.now() - startTime;
            const t = Math.min(elapsedTime / durationMed, 1);

            spatula.rotation.set(
                THREE.MathUtils.lerp(spatulaRotationTarget.x, spatulaRotationStart.x, t),
                spatulaRotationStart.y,
                spatulaRotationStart.z
            );
            spatula.position.lerpVectors(spatulaTube, spatulaStart, t);


            if (t < 1) {
                requestAnimationFrame(animate);
            } else {
                if (onComplete) onComplete();
            }
        }
        animate();
    }
    // Start the first animation (spatula moves first)
    animateSpatulaToTarget(performance.now());
}

function stepTwo(onComplete) {
    // Fade out the popupNotice
    popupNotice.style.transition = 'opacity 0.5s ease-in-out';
    popupNotice.style.opacity = 0;
    setTimeout(() => {
        if (popupNotice.parentNode) {
            popupNotice.parentNode.removeChild(popupNotice); // Remove from DOM after fade-out
        }
    }, 500); // Match the duration of the fade-out animation
    
    const spatulaStart = spatula.position.clone();

    const spatulaAbove = new THREE.Vector3(23, 13, -2);
    const spatulaScoop = new THREE.Vector3(23, 5, -2);
    const spatulaTube = new THREE.Vector3(53, 32, -1);

    const spatulaRotationTarget = new THREE.Euler(THREE.MathUtils.degToRad(50), 0, 0); // Rotate 90 degrees
    const spatulaRotationStart = spatula.rotation.clone();

    const durationShort = 500;
    const durationMed = 1000;
    const startTime = performance.now();
    scoops = 0;

    // MOVE ABOVE DISH
    function animateSpatulaToTarget(startTime) {
        function animate() {
            const elapsedTime = performance.now() - startTime;
            const t = Math.min(elapsedTime / durationShort, 1);

            spatula.position.lerpVectors(spatulaStart, spatulaAbove, t);
            spatula.rotation.set(
                THREE.MathUtils.lerp(spatulaRotationStart.x, spatulaRotationTarget.x, t),
                spatulaRotationStart.y,
                spatulaRotationStart.z
            );

            if (t < 1) {
                requestAnimationFrame(animate);
            } else {
                // When done, return spatula to start position
                setTimeout(() => {
                    animateScoop(performance.now());
                }, 500);
            }
        }
        animate();
    }

    // SCOOP YEAST
    function animateScoop(startTime) {
        function animate() {
            const elapsedTime = performance.now() - startTime;
            const t = Math.min(elapsedTime / durationShort, 1);

            spatula.position.lerpVectors(spatulaAbove, spatulaScoop, t);

            if (t < 1) {
                requestAnimationFrame(animate);
            } else {
                // When done, move to tube
                setTimeout(() => {
                    if (scoops < 1) {
                        yeast.scale.set(1, 0.7, 1);
                    }
                    else {
                        yeast.visible = false; // Hide brown sugar after scooping
                    }
                    animateTube(performance.now());
                }, 200);
            }
        }
        animate();
    }

    // MOVE TO TUBE
    function animateTube(startTime) {
        function animate() {
            const elapsedTime = performance.now() - startTime;
            const t = Math.min(elapsedTime / durationMed, 1);

            spatula.position.lerpVectors(spatulaScoop, spatulaTube, t);

            if (t < 1) {
                requestAnimationFrame(animate);
            } else {
                scoops += 1; // Increment scoops
                if (scoops < 2) {
                    yeastTube.visible = true;
                    yeastTube.scale.set(1, 0.8, 1); // Scale up yeast in tube
                    // If not done scooping, return to scoop position
                    setTimeout(() => {
                        animateSecondScoop(performance.now());
                    }, 200);
                } else {
                    // When done, return spatula to start position
                    yeastTube.scale.set(1, 1, 1);
                    setTimeout(() => {
                        animateSpatulaBack(performance.now());
                    }, 200);
                }
            }
        }
        animate();
    }

    // SCOOP AGAIN
    function animateSecondScoop(startTime) {
        function animate() {
            const elapsedTime = performance.now() - startTime;
            const t = Math.min(elapsedTime / durationMed, 1);
            spatula.position.lerpVectors(spatulaTube, spatulaAbove, t);


            if (t < 1) {
                requestAnimationFrame(animate);
            } else {
                animateScoop(performance.now());
            }
        }
        animate();
    }

    function animateSpatulaBack(startTime) {
        function animate() {
            const elapsedTime = performance.now() - startTime;
            const t = Math.min(elapsedTime / durationMed, 1);

            spatula.rotation.set(
                THREE.MathUtils.lerp(spatulaRotationTarget.x, spatulaRotationStart.x, t),
                spatulaRotationStart.y,
                spatulaRotationStart.z
            );
            spatula.position.lerpVectors(spatulaTube, spatulaStart, t);


            if (t < 1) {
                requestAnimationFrame(animate);
            } else {
                if (onComplete) onComplete();
            }
        }
        animate();
    }
    // Start the first animation (spatula moves first)
    animateSpatulaToTarget(performance.now());
}

function stepThree(onComplete) {
    const duration = 500;
    const durationLong = 1000;
    const startTime = performance.now();
    procedure.visible = true;

    // Water beaker movement & rotation
    const waterTarget = new THREE.Vector3(5, 35, 0);
    //const waterTarget = new THREE.Vector3(0, 1, 0);
    const waterStart = warmWater.position.clone();
    const waterRotationTarget = new THREE.Euler(0, 0, -THREE.MathUtils.degToRad(37));
    const waterRotationStart = warmWater.rotation.clone();

    // Water in boiling tube
    waterTube.visible = true;
    const waterTubeStart = new THREE.Vector3(1, 0, 1);
    const waterTubeTarget = new THREE.Vector3(1, 1, 1);

    // 1. Pour warm water
    function pourWater(startTime) {
        function animate() {
            const elapsedTime = performance.now() - startTime;
            const t = Math.min(elapsedTime / duration, 1); // Normalize [0, 1]

            // Pour
            warmWater.position.lerpVectors(waterStart, waterTarget, t);
            warmWater.rotation.set(
                warmWater.rotation.x,
                warmWater.rotation.y,
                THREE.MathUtils.lerp(waterRotationStart.z, waterRotationTarget.z, t)
            );

            // Scale up water in tube
            waterTube.scale.lerpVectors(waterTubeStart, waterTubeTarget, t);

            if (t < 1) {
                requestAnimationFrame(animate);
            } else {
                setTimeout(() => {
                    returnWater(performance.now());
                }, 500); // Wait before returning
            }
        }
        animate();
    }

    // 2. return water
    function returnWater(startTime) {
        function animate() {
            const elapsedTime = performance.now() - startTime;
            const t = Math.min(elapsedTime / duration, 1); // Normalize [0, 1]
    
            // Return
            warmWater.position.lerpVectors(waterTarget, waterStart, t);
            warmWater.rotation.set(
                    THREE.MathUtils.lerp(waterRotationTarget.x, waterRotationStart.x, t),
                    THREE.MathUtils.lerp(waterRotationTarget.y, waterRotationStart.y, t),
                    THREE.MathUtils.lerp(waterRotationTarget.z, waterRotationStart.z, t)
            );

            // Add a pop-up notice
            popupNotice.innerText = "    NOTE: If using bottles, you may use the bottle cap";
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
            popupNotice.style.display = 'none';
            popupNotice.style.display = 'block';

            // Fade in the popupNotice
            popupNotice.style.opacity = 0;
            popupNotice.style.transition = 'opacity 0.5s ease-in-out';
            setTimeout(() => {
                popupNotice.style.opacity = 1;
            }, 0);

            
    
            if (t < 1) {
                requestAnimationFrame(animate);
            } else {
                plugStopper(performance.now());
            }
        }
        animate();
    }

    const plugTarget = new THREE.Vector3(5.6, 23, -11.7);
    const plugStart = rubberStopper.position.clone();

    // 3. Plug stopper
    function plugStopper(startTime){
        function animate() {
            document.body.appendChild(popupNotice);
            const elapsedTime = performance.now() - startTime;
            const t = Math.min(elapsedTime / duration, 1); // Normalize [0, 1]

            rubberStopper.position.lerpVectors(plugStart, plugTarget, t);

            if (t < 1) {
                requestAnimationFrame(animate);
            } else {
                rubberTube.visible = true;
                rubberStopper.visible = false;
                shakeTube(performance.now());
            }
        }
        animate();
    }

    // 4. Shake tube
    function shakeTube(startTime) {
        function animate() {
            const elapsedTime = performance.now() - startTime;
            const t = Math.min(elapsedTime / durationLong, 1); // Normalize [0, 1]

            // Shake the tube
            boilingTube.rotation.x = Math.sin(t * Math.PI * 10) * 0.2;
            boilingTube.rotation.y = Math.sin(t * Math.PI * 10) * 0.2;
            procedure.rotation.x = Math.sin(t * Math.PI * 10) * 0.2;
            procedure.rotation.y = Math.sin(t * Math.PI * 10) * 0.2;
            waterBubble.rotation.x = Math.sin(t * Math.PI * 10) * 0.2;
            waterBubble.rotation.y = Math.sin(t * Math.PI * 10) * 0.2;

            // Show shaken result
            afterResult.visible = true;
            waterBubble.visible = true;

            if (t < 1) {
                requestAnimationFrame(animate);
            } else {
                waterTube.visible = false;
                yeastTube.visible = false;
                sugarTube.visible = false;
                if (onComplete) onComplete();
            }

        }
        animate();
    }

    // Start
    pourWater(performance.now());
}

function stepFour(onComplete) {
    popupNotice.style.transition = 'opacity 0.5s ease-in-out';
    popupNotice.style.opacity = 0;
    setTimeout(() => {
        if (popupNotice.parentNode) {
            popupNotice.parentNode.removeChild(popupNotice); // Remove from DOM after fade-out
        }
    }, 500); // Match the duration of the fade-out animation

    const duration = 1000; // Duration of the animation in milliseconds
    const startTime = performance.now();
    
    const targetPosition = new THREE.Vector3(0, 0, 0);
    const rubberStopperStart = rubberStopper.position.clone();

    const balloonStart = balloon.position.clone();
    const balloonTarget = new THREE.Vector3(-10, 25, -5);

    function animate() {
        const elapsedTime = performance.now() - startTime;
        const t = Math.min(elapsedTime / duration, 1); // Normalize time to [0, 1]

        // take off rubber
        rubberStopper.visible = true;
        rubberTube.visible = false;
        rubberStopper.position.lerpVectors(rubberStopperStart, targetPosition, t);
        balloon.position.lerpVectors(balloonStart, balloonTarget, t);        


        if (t < 1) {
            requestAnimationFrame(animate);
        } else {
            procedure.visible = true;
            balloonTube.visible = true;
            balloon.visible = false;
            if (onComplete) onComplete(); // Animation complete, allow nextStep
        }
    }
    animate();
}

function stepFive(onComplete) {
    const duration = 1000;
    const startTime = performance.now();
    
    const balloonTarget = new THREE.Vector3(0, 0, 0);
    const balloonStart = balloon.position.clone();
    const foamStart = new THREE.Vector3(1, 0, 1);
    const foamTarget = new THREE.Vector3(1, 1, 1);

    filledBalloon.visible = true;
    afterResult.visible = true;
    foam.visible = true;

    // balloon
    const initialScale = 0.5;
    const finalScale = 1;
    filledBalloon.scale.set(initialScale, initialScale, initialScale);

    function animate() {
        const elapsedTime = performance.now() - startTime;
        const t = Math.min(elapsedTime / duration, 1);

        // secretly return balloon while invisible
        balloon.position.lerpVectors(balloonStart, balloonTarget, t);

        // balloon
        const scaleValue = THREE.MathUtils.lerp(initialScale, finalScale, t);
        filledBalloon.scale.set(scaleValue, scaleValue, scaleValue);
        // Adjust position to keep it visually centered while scaling
        const offsetX = (finalScale - scaleValue) * 36;
        const offsetY = (finalScale - scaleValue) * 25;
        filledBalloon.position.set(offsetX, offsetY, 0);

        balloonTube.visible = false;

        // foam
        foam.scale.lerpVectors(foamStart, foamTarget, t);

        if (t < 1) {
            requestAnimationFrame(animate);
        } else {
            if (onComplete) onComplete();
        }
    }
    animate();
}

const fontLoader = new FontLoader();
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

// Add controls
const controls = new OrbitControls(camera, renderer.domElement);

controls.enableDamping = true; // smooth camera movement
controls.enablePan = true;
// remove and uncomment
controls.enableRotate = true;
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

// ********** Experiment 2 **********
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('https://unpkg.com/three@0.163.0/examples/jsm/libs/draco/');
gltfLoader.setDRACOLoader(dracoLoader);
gltfLoader.load('./public/3D_Expt2.gltf', function(gltf){
    apparatus2 = gltf.scene;
    scene.add(apparatus2);
    apparatus2.scale.set(0.05, 0.05, 0.05); // Scale up model
    apparatus2.position.set(-0.8, 2.5, 4);

    // Apparatus names
    yeast = scene.getObjectByName('YEAST');
    brownSugar = scene.getObjectByName('BROWNSUGAR1');
    boilingTube = scene.getObjectByName('BOILINGTUBE');
    spatula = scene.getObjectByName('SPATULA');
    rubberStopper = scene.getObjectByName('RUBBERSTOPPER');
    rubberTube = scene.getObjectByName('RUBBERSTOPPER_TUBE');
    sugarTube = scene.getObjectByName('BROWNSUGARTUBE');
    yeastTube = scene.getObjectByName('YEAST_TUBE');
    warmWater = scene.getObjectByName('WARMWATER');
    waterTube = scene.getObjectByName('WATER_TUBE');
    waterBubble = scene.getObjectByName('WATER_BUBBLE1');
    balloon = scene.getObjectByName('FLATBALLOON');
    filledBalloon = scene.getObjectByName('FILLEDBALLOON');
    foam = scene.getObjectByName('FOAM');
    balloonTube = scene.getObjectByName('UNINFLATEDBALLOON');
    

    procedure = scene.getObjectByName('PROCEDURE');
    afterResult = scene.getObjectByName('AFTERRESULT');

    if (procedure) {
        procedure.traverse((child) => {
            child.visible = false;
        });
    }
    if (afterResult) {
        afterResult.traverse((child) => {
            child.visible = false;
        });
    }

    // if (elodeasps) {
    //     // Add label above Elodea sp.
    //     addLabel('Elodea sp.');
    // }
    // if (scene.getObjectByName('MICROSCOPE')) {
    //     scene.getObjectByName('MICROSCOPE').visible = false; // Hide the object
    // }

    
    console.log('Expt2 loaded');
}, undefined, function(error){
    console.error('Error loading Expt2: ', error);
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