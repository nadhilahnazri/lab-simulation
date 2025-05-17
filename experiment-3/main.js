import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

let imageCircle;
let apparatus3;
let blackpaper;
let blackpaper_powder;
let brush;
let glove;
let finger;
let powder;
let uvlight;


let step = -1;
const steps = [
    "Step 1:\nRoll finger onto black paper from one side of the fingernail to the other.",
    "Step 2:\nWear gloves. Dust a little bit of fluorescent powder on the fingerprint.",
    "Step 3:\nUse the UV light to observe. You can see the clear fingerprint on the paper.",
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
    const duration = 1000; // Duration of the animation in milliseconds
    const startTime = performance.now();

    // Store original positions
    const lightStart = uvlight.position.clone();
    const imageCircleStart = imageCircle.position.clone();

    // Store original rotations
    const lightRotationStart = uvlight.rotation.clone();

    // Target positions (original positions)
    const targetPosition = new THREE.Vector3(0, 0, 0);
    const imageCircleTarget = new THREE.Vector3(-0.4, 2.5, 4);

    // Target rotations (original rotations)
    const targetRotation = new THREE.Euler(0, 0, 0); // Assuming initial rotations are (0, 0, 0)

    function animate() {
        const elapsedTime = performance.now() - startTime;
        const t = Math.min(elapsedTime / duration, 1); // Normalize [0, 1]

        // Reset positions
        uvlight.position.lerpVectors(lightStart, targetPosition, t);

        // Reset & resize image circle position
        imageCircle.position.lerpVectors(imageCircleStart, imageCircleTarget, t);
        imageCircle.scale.set(1 - 0.8 * t, 1 - 0.8 * t, 1 - 0.8 * t); // Scale down from 1 to 0.2

        // Reset rotations smoothly
        uvlight.rotation.set(
            THREE.MathUtils.lerp(lightRotationStart.x, targetRotation.x, t),
            THREE.MathUtils.lerp(lightRotationStart.y, targetRotation.y, t),
            THREE.MathUtils.lerp(lightRotationStart.z, targetRotation.z, t)
        );

        if (t < 1) {
            requestAnimationFrame(animate);
        } else {
            imageCircle.visible = false;
            glove.visible = true;
            blackpaper.visible = true;
            blackpaper_powder.visible = false;
            if (onComplete) onComplete(); // Animation complete, allow nextStep
        }
    }

    animate();

}


function stepOne(onComplete) {
    const handStart = finger.position.clone();
    const handAbove = new THREE.Vector3(5, 0, 20);
    const handDown = new THREE.Vector3(5, -3, 20);

    const handRotationStart = finger.rotation.clone(); // Original rotation
    const handRotationTarget = new THREE.Euler(THREE.MathUtils.degToRad(-25), 0, 0); // Tilting forward

    const durationShort = 500;
    const durationMed = 1000;

    // show hand
    function positionHand(startTime) {
        function animate() {
            const elapsedTime = performance.now() - startTime;
            const t = Math.min(elapsedTime / durationMed, 1);

            finger.position.lerpVectors(handStart, handAbove, t);

            if (t < 1) {
                requestAnimationFrame(animate);
            } else {
                setTimeout(() => goDown(performance.now()), 500);
            }
        }
        animate();
    }

    // go down
    function goDown(startTime) {
        function animate() {
            const elapsedTime = performance.now() - startTime;
            const t = Math.min(elapsedTime / durationShort, 1);

            finger.position.lerpVectors(handAbove, handDown, t);

            finger.rotation.set(
                THREE.MathUtils.lerp(handRotationStart.x, handRotationTarget.x, t),
                handRotationStart.y,
                handRotationStart.z
            );

            if (t < 1) {
                requestAnimationFrame(animate);
            } else {
                setTimeout(() => rotateFingerSideToSide(), 500);
            }
        }
        animate();
    }

    // side-to-side swipe
    function rotateFingerSideToSide() {
        const initialZ = finger.rotation.z;
        const rotateRightZ = THREE.MathUtils.degToRad(-25);
        const rotateLeftZ = THREE.MathUtils.degToRad(25);
        const resetZ = 0;

        function animateRotation(fromZ, toZ, callback) {
            const startTime = performance.now();
            function animate() {
                const elapsed = performance.now() - startTime;
                const t = Math.min(elapsed / durationShort, 1);
                finger.rotation.z = THREE.MathUtils.lerp(fromZ, toZ, t);
                if (t < 1) {
                    requestAnimationFrame(animate);
                } else {
                    if (callback) callback();
                }
            }
            animate();
        }

        // Rotate right → left → reset → lift
        animateRotation(initialZ, rotateRightZ, () => {
            setTimeout(() => {
                animateRotation(rotateRightZ, rotateLeftZ, () => {
                    setTimeout(() => {
                        animateRotation(rotateLeftZ, resetZ, () => {
                            liftHandBack(performance.now());
                        });
                    }, 300);
                });
            }, 300);
        });
    }

    // lift and return
    function liftHandBack(startTime) {
        const downPos = finger.position.clone();
        function animate() {
            const elapsedTime = performance.now() - startTime;
            const t = Math.min(elapsedTime / durationMed, 1);

            finger.position.lerpVectors(downPos, handAbove, t);
            finger.rotation.x = THREE.MathUtils.lerp(handRotationTarget.x, handRotationStart.x, t); // undo tilt

            if (t < 1) {
                requestAnimationFrame(animate);
            } else {
                returnHand(performance.now());
            }
        }
        animate();
    }

    function returnHand(startTime) {
        const abovePos = finger.position.clone();
        function animate() {
            const elapsedTime = performance.now() - startTime;
            const t = Math.min(elapsedTime / durationMed, 1);

            finger.position.lerpVectors(abovePos, handStart, t);

            if (t < 1) {
                requestAnimationFrame(animate);
            } else {
                if (onComplete) onComplete();
            }
        }
        animate();
    }

    positionHand(performance.now());
}


function stepTwo(onComplete) {
    const gloveStart = glove.position.clone();
    const gloveAbove = new THREE.Vector3(0, 10, 0);
    const gloveWear = new THREE.Vector3(0, 10, 250);
    glove.visible = true;

    const durationShort = 500;
    const durationMed = 1000;
    const durationLong = 1500;
    const startTime = performance.now();

    // wear glove
    function animateGlove(startTime) {
        function animate() {
            const elapsedTime = performance.now() - startTime;
            const t = Math.min(elapsedTime / durationShort, 1);

            glove.position.lerpVectors(gloveStart, gloveAbove, t);

            if (t < 1) {
                requestAnimationFrame(animate);
            } else {
                setTimeout(() => wearGlove(performance.now()), 500);
            }
        }
        animate();
    }

    // glove to hand
    function wearGlove(startTime) {
        function animate() {
            const elapsedTime = performance.now() - startTime;
            const t = Math.min(elapsedTime / durationLong, 1);

            glove.position.lerpVectors(gloveAbove, gloveWear, t);

            if (t < 1) {
                requestAnimationFrame(animate);
            } else {
                // When done, return glove to start position
                setTimeout(() => {
                    glove.position.copy(gloveStart);
                    glove.visible = false;
                    liftPowderBag(performance.now());
                }, 500);
            }
        }
        animate();
    }

    // POWDER
    const powderStart = powder.position.clone();
    const powderAbove = new THREE.Vector3(0, 15, 0);

    const powderRotationStart = powder.rotation.clone(); // Original rotation
    const powderRotationTarget = new THREE.Euler(THREE.MathUtils.degToRad(70), THREE.MathUtils.degToRad(-30), 0); // Tilting

    // lift powder bag
    function liftPowderBag(startTime) {
        function animate() {
            const elapsedTime = performance.now() - startTime;
            const t = Math.min(elapsedTime / durationMed, 1);

            powder.position.lerpVectors(powderStart, powderAbove, t);

            powder.rotation.set(
                THREE.MathUtils.lerp(powderRotationStart.x, powderRotationTarget.x, t),
                THREE.MathUtils.lerp(powderRotationStart.y, powderRotationTarget.y, t),
                THREE.MathUtils.lerp(powderRotationStart.z, powderRotationTarget.z, t),

            );
            
            if (t < 1) {
                requestAnimationFrame(animate);
            } else {
                setTimeout(() => fadeInPowder(performance.now()), 500);
            }
        }
        animate();
    }

    // fade in and return powder
    function fadeInPowder(startTime) {
        blackpaper_powder.visible = true;
        blackpaper_powder.material.transparent = true;
        blackpaper_powder.material.opacity = 0;

        function animate() {
            const elapsedTime = performance.now() - startTime;
            const t = Math.min(elapsedTime / durationMed, 1);
            blackpaper_powder.material.opacity = t;

            powder.position.lerpVectors(powderAbove, powderStart, t);
            powder.rotation.set(
                THREE.MathUtils.lerp(powderRotationTarget.x, powderRotationStart.x, t),
                THREE.MathUtils.lerp(powderRotationTarget.y, powderRotationStart.y, t),
                THREE.MathUtils.lerp(powderRotationTarget.z, powderRotationStart.z, t),
            );
            if (t < 1) {
                requestAnimationFrame(animate);
            } else {
                blackpaper.visible = false;
                setTimeout(() => animateBrush(performance.now()), 500);
            }
        }
        animate();
    }

    // BRUSH
    const brushStart = brush.position.clone();
    const brushAbove = new THREE.Vector3(-30, 2, 10);
    const brushRotationStart = brush.rotation.clone(); // Original rotation
    const brushRotationTarget = new THREE.Euler(THREE.MathUtils.degToRad(-70), THREE.MathUtils.degToRad(-30), 0); // Tilting

    const swipeLeft = new THREE.Vector3(-28, 2, 10);
    const swipeRight = new THREE.Vector3(-38, 2, 10);

    function animateBrush(startTime) {
        // Move brush to paper
        function moveDown() {
            const start = performance.now();
            function animate() {
                const t = Math.min((performance.now() - start) / durationMed, 1);

                brush.position.lerpVectors(brushStart, brushAbove, t);
                brush.rotation.set(
                    THREE.MathUtils.lerp(brushRotationStart.x, brushRotationTarget.x, t),
                    THREE.MathUtils.lerp(brushRotationStart.y, brushRotationTarget.y, t),
                    THREE.MathUtils.lerp(brushRotationStart.z, brushRotationTarget.z, t),
                );

                if (t < 1) requestAnimationFrame(animate);
                else startDusting();
            }
            animate();
        }

        function startDusting() {
            let count = 0;
            function swipe(from, to, callback) {
                const start = performance.now();
                function animate() {
                    const t = Math.min((performance.now() - start) / durationShort, 1);
                    brush.position.lerpVectors(from, to, t);
                    if (t < 1) requestAnimationFrame(animate);
                    else callback();
                }
                animate();
            }

            function repeat() {
                if (count < 3) {
                    swipe(swipeLeft, swipeRight, () => {
                        swipe(swipeRight, swipeLeft, () => {
                            count++;
                            repeat();
                        });
                    });
                } else {
                    setTimeout(() => returnBrush(performance.now()), 500);
                }
            }
            
            // Animate brush return
            function returnBrush(startTime) {
                const fromPos = brush.position.clone();
                const fromRot = brush.rotation.clone();
            
                function animate() {
                    const elapsed = performance.now() - startTime;
                    const t = Math.min(elapsed / durationShort, 1);
            
                    // Position
                    brush.position.lerpVectors(fromPos, brushStart, t);
            
                    // Rotation
                    brush.rotation.set(
                        THREE.MathUtils.lerp(fromRot.x, brushRotationStart.x, t),
                        THREE.MathUtils.lerp(fromRot.y, brushRotationStart.y, t),
                        THREE.MathUtils.lerp(fromRot.z, brushRotationStart.z, t)
                    );
            
                    if (t < 1) {
                        requestAnimationFrame(animate);
                    } else {
                        if (onComplete) onComplete();
                    }
                }
                animate();
            }
            repeat();
        }
        moveDown();
    }

    // Start full sequence
    animateGlove(performance.now());

}

// function stepThree(onComplete) {
//     const duration = 500;
//     const durationLong = 1000;
//     const startTime = performance.now();
//     procedure.visible = true;

//     // Water beaker movement & rotation
//     const waterTarget = new THREE.Vector3(5, 35, 0);
//     //const waterTarget = new THREE.Vector3(0, 1, 0);
//     const waterStart = warmWater.position.clone();
//     const waterRotationTarget = new THREE.Euler(0, 0, -THREE.MathUtils.degToRad(37));
//     const waterRotationStart = warmWater.rotation.clone();

//     // Water in boiling tube
//     waterTube.visible = true;
//     const waterTubeStart = new THREE.Vector3(1, 0, 1);
//     const waterTubeTarget = new THREE.Vector3(1, 1, 1);

//     // 1. Pour warm water
//     function pourWater(startTime) {
//         function animate() {
//             const elapsedTime = performance.now() - startTime;
//             const t = Math.min(elapsedTime / duration, 1); // Normalize [0, 1]

//             // Pour
//             warmWater.position.lerpVectors(waterStart, waterTarget, t);
//             warmWater.rotation.set(
//                 warmWater.rotation.x,
//                 warmWater.rotation.y,
//                 THREE.MathUtils.lerp(waterRotationStart.z, waterRotationTarget.z, t)
//             );

//             // Scale up water in tube
//             waterTube.scale.lerpVectors(waterTubeStart, waterTubeTarget, t);

//             if (t < 1) {
//                 requestAnimationFrame(animate);
//             } else {
//                 setTimeout(() => {
//                     returnWater(performance.now());
//                 }, 500); // Wait before returning
//             }
//         }
//         animate();
//     }

//     // 2. return water
//     function returnWater(startTime) {
//         function animate() {
//             const elapsedTime = performance.now() - startTime;
//             const t = Math.min(elapsedTime / duration, 1); // Normalize [0, 1]
    
//             // Return
//             warmWater.position.lerpVectors(waterTarget, waterStart, t);
//             warmWater.rotation.set(
//                     THREE.MathUtils.lerp(waterRotationTarget.x, waterRotationStart.x, t),
//                     THREE.MathUtils.lerp(waterRotationTarget.y, waterRotationStart.y, t),
//                     THREE.MathUtils.lerp(waterRotationTarget.z, waterRotationStart.z, t)
//             );

//             // Add a pop-up notice
//             popupNotice.innerText = "    NOTE: If using bottles, you may use the bottle cap";
//             popupNotice.style.position = 'absolute';
//             popupNotice.style.top = '15%';
//             popupNotice.style.left = '50%';
//             popupNotice.style.transform = 'translate(-50%, -50%)';
//             popupNotice.style.padding = '20px';
//             popupNotice.style.background = 'rgba(0, 0, 0, 0.8)';
//             popupNotice.style.color = 'white';
//             popupNotice.style.fontSize = '16px';
//             popupNotice.style.borderRadius = '8px';
//             popupNotice.style.zIndex = '1000';
//             popupNotice.style.textAlign = 'center';
//             popupNotice.style.display = 'none';
//             popupNotice.style.display = 'block';

//             // Fade in the popupNotice
//             popupNotice.style.opacity = 0;
//             popupNotice.style.transition = 'opacity 0.5s ease-in-out';
//             setTimeout(() => {
//                 popupNotice.style.opacity = 1;
//             }, 0);

            
    
//             if (t < 1) {
//                 requestAnimationFrame(animate);
//             } else {
//                 plugStopper(performance.now());
//             }
//         }
//         animate();
//     }

//     const plugTarget = new THREE.Vector3(5.6, 23, -11.7);
//     const plugStart = rubberStopper.position.clone();

//     // 3. Plug stopper
//     function plugStopper(startTime){
//         function animate() {
//             document.body.appendChild(popupNotice);
//             const elapsedTime = performance.now() - startTime;
//             const t = Math.min(elapsedTime / duration, 1); // Normalize [0, 1]

//             rubberStopper.position.lerpVectors(plugStart, plugTarget, t);

//             if (t < 1) {
//                 requestAnimationFrame(animate);
//             } else {
//                 rubberTube.visible = true;
//                 rubberStopper.visible = false;
//                 shakeTube(performance.now());
//             }
//         }
//         animate();
//     }

//     // 4. Shake tube
//     function shakeTube(startTime) {
//         function animate() {
//             const elapsedTime = performance.now() - startTime;
//             const t = Math.min(elapsedTime / durationLong, 1); // Normalize [0, 1]

//             // Shake the tube
//             boilingTube.rotation.x = Math.sin(t * Math.PI * 10) * 0.2;
//             boilingTube.rotation.y = Math.sin(t * Math.PI * 10) * 0.2;
//             procedure.rotation.x = Math.sin(t * Math.PI * 10) * 0.2;
//             procedure.rotation.y = Math.sin(t * Math.PI * 10) * 0.2;
//             waterBubble.rotation.x = Math.sin(t * Math.PI * 10) * 0.2;
//             waterBubble.rotation.y = Math.sin(t * Math.PI * 10) * 0.2;

//             // Show shaken result
//             afterResult.visible = true;
//             waterBubble.visible = true;

//             if (t < 1) {
//                 requestAnimationFrame(animate);
//             } else {
//                 waterTube.visible = false;
//                 yeastTube.visible = false;
//                 sugarTube.visible = false;
//                 if (onComplete) onComplete();
//             }

//         }
//         animate();
//     }

//     // Start
//     pourWater(performance.now());
// }

function stepThree(onComplete) {
    const lightStart = uvlight.position.clone();
    const lightAbove = new THREE.Vector3(-45, 50, 50);
    const lightRotationStart = uvlight.rotation.clone(); // Original rotation
    const lightRotationTarget = new THREE.Euler(THREE.MathUtils.degToRad(-50), THREE.MathUtils.degToRad(30), 0); // Tilting

    const duration = 1000;

    function shineLight(startTime) {
        function animate() {
            const elapsedTime = performance.now() - startTime;
            const t = Math.min(elapsedTime / duration, 1);

            uvlight.position.lerpVectors(lightStart, lightAbove, t);
            uvlight.rotation.set(
                THREE.MathUtils.lerp(lightRotationStart.x, lightRotationTarget.x, t),
                THREE.MathUtils.lerp(lightRotationStart.y, lightRotationTarget.y, t),
                THREE.MathUtils.lerp(lightRotationStart.z, lightRotationTarget.z, t),
            );

            if (t < 1) {
                requestAnimationFrame(animate);
            } else {
                setTimeout(() => showFingerPrint(performance.now()), 500);
            }
        }
        animate();
    }        

    const imageCircleTarget = new THREE.Vector3(-0.5, 3.3, 5);
    const imageCircleStart = imageCircle.position.clone();

    function showFingerPrint(startTime) {
        function animate() {
            const elapsedTime = performance.now() - startTime;
            const t = Math.min(elapsedTime / duration, 1);

            imageCircle.visible = true;

            imageCircle.scale.set(0.2 + 0.8 * t, 0.2 + 0.8 * t, 0.2 + 0.8 * t); // Scale up to 1
            imageCircle.position.lerpVectors(imageCircleStart, imageCircleTarget, t);

            if (t < 1) {
                requestAnimationFrame(animate);
            } else {
                if (onComplete) onComplete();
            }
        }
        animate();
    }

    shineLight(performance.now());
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

// ********** Experiment 3 **********
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('https://unpkg.com/three@0.163.0/examples/jsm/libs/draco/');
gltfLoader.setDRACOLoader(dracoLoader);
gltfLoader.load('./public/3D_Expt3_WithoutLight.gltf', function(gltf){
    apparatus3 = gltf.scene;
    scene.add(apparatus3);
    apparatus3.scale.set(0.027, 0.027, 0.027); // Scale up model
    apparatus3.position.set(-0.4, 2.465, 4);

    // Apparatus names
    blackpaper = scene.getObjectByName('BLACKPAPER');
    blackpaper_powder = scene.getObjectByName('BLACKPAPER_POWDER');
    brush = scene.getObjectByName('BRUSH');
    glove = scene.getObjectByName('GLOVES');
    finger = scene.getObjectByName('POINTINGFINGER1');
    powder = scene.getObjectByName('POWDER');
    uvlight = scene.getObjectByName('UVLIGHT');

    // Set initial visibility and positions
    blackpaper_powder.visible = false;
    finger.position.set(50, 0, 250);
    
    console.log('Expt3 loaded');
}, undefined, function(error){
    console.error('Error loading Expt3: ', error);
});

// ********** Results Circle Image **********
const resultTextureLoader = new THREE.TextureLoader();

resultTextureLoader.load('./public/fingerprint.png', function (texture) {
    const geometry = new THREE.CircleGeometry(0.5, 64); // radius = 1, 64 segments for smoothness
    const material = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        side: THREE.DoubleSide // so it's visible from both sides
    });

    imageCircle = new THREE.Mesh(geometry, material);
    imageCircle.name = 'ImageCircle';

    // Initial position (you can change this later)
    imageCircle.scale.set(0.2, 0.2, 0.2); // Scale down the image
    imageCircle.position.set(-0.4, 2.5, 4);

    // Make it face the camera
    imageCircle.lookAt(camera.position);

    // Add to scene
    scene.add(imageCircle);
    imageCircle.visible = false; // Initially hidden
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
    if (textLength > 79) fontSize *= 0.7;
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