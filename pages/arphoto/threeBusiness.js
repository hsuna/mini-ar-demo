import * as THREE from "../../libs/three.js";
import getGLTFLoader from '../../jsm/loaders/GLTFLoader';
import { screenshot } from "./screenshot";

const GLTFLoader = getGLTFLoader(THREE);

var renderer, scene, camera, canvas, platform, disposing = false, frameId, controls;

function initThree(canvasId, callback) {
    const query = wx.createSelectorQuery();
    query
        .select("#" + canvasId)
        .node()
        .exec((res) => {
            canvas = new THREE.global.registerCanvas(res[0].node)

            const gltfLoader = new GLTFLoader();
            initScene();
            if (typeof callback === "function") {
                callback(THREE, gltfLoader);
            }
        });
}

function initScene() {
    scene = new THREE.Scene();
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));

    let dLight = new THREE.DirectionalLight(0xffffff,1);
    dLight.position.set(10,30,0);
    dLight.lookAt(new THREE.Vector3(0,0,0));
    scene.add(dLight);

    // init Perspective Camera
    camera = new THREE.PerspectiveCamera(45, canvas.width / canvas.height, 1, 1000);
    // according to camera position
    camera.position.set(3, 6, -10);
    camera.lookAt(0, 0, 0);

    // controls = new OrbitControls(camera, canvas);
    // controls.enableDamping = true

    // init render
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, logarithmicDepthBuffer: true });
    
    renderer.outputEncoding = THREE.sRGBEncoding
    renderer.setSize(canvas.width, canvas.height)
    renderer.setPixelRatio(THREE.global.devicePixelRatio);
    disposing = false;
    const render = () => {
      if (!disposing) frameId = canvas.requestAnimationFrame(render);
      // controls.update();
      renderer.render(scene, camera);
  }
  render()
}

function addToScene(obj) {
    scene.add(obj);
}

function getCamera() {
    return camera;
}

function clipWebgl(helperCanvas,photo){
    return new Promise((resolve,reject) => {
        const [data, w, h] = screenshot(renderer, scene, camera, THREE.WebGLRenderTarget);
        // resolve(data.buffer);
        const ctx = helperCanvas.getContext('2d');
        const imgData = helperCanvas.createImageData(data, w, h);
        helperCanvas.height = imgData.height;
        helperCanvas.width = imgData.width;
        ctx.putImageData(imgData, 0, 0);
        wx.canvasToTempFilePath({
            canvas: helperCanvas,
            success(res) {
                resolve({path: res.tempFilePath, width: imgData.width, height: imgData.height})
            },
            fail(err){
                reject(err);
            }
        })
    })
}

function onTX(e) {
  // platform.dispatchTouchEvent(e)
}

function disposeAll(){// 闪退需要及时做内存清理
  disposing = true;
  canvas.cancelAnimationFrame(frameId);
  // THREE.PLATFORM.dispose();
  return; 
}

export {
    initThree,
    addToScene,
    getCamera,
    clipWebgl,
    onTX,
    disposeAll
};
