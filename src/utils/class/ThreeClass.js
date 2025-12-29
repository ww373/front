import * as THREE from "three";

import {
  OrbitControls
} from "three/examples/jsm/controls/OrbitControls.js";
// import {
//   OrbitControls
// } from "./OrbitControls";
import {
  RGBELoader
} from "three/examples/jsm/loaders/RGBELoader.js";

import ResourceClass from "@/utils/class/ResourceClass";

import groundResourse from "@/assets/images/grasslight-big.jpg";
import png from "@/assets/images/room.png";

class ThreeClass {
  constructor() {
    let pageObj = {
      isHalfRenderer: false,
    };
    this.pageObj = Object.assign(pageObj, {
      isHalfRenderer: false,
    });

    //获取界面大小
    this.W = 0;
    this.H = 0;

    this.resizeFunc = "";

    //动画计时
    this.delta = "";
    this.clock = new THREE.Clock();

    //初始化
    this.loadTime = 100; //加载时间计时
    this.renderOrder = 100;

    //基础
    this.container = "";
    this.scene = "";
    this.camera = ""; //场景摄像机
    this.controls = ""; //控制
    this.renderer = "";

    //是否
    this.flagLoadData = false; //加载数据
    this.flagLoadResource = false;
    this.flagLoadRender = false;
    this.flagLoad = false; //是否加载完成
    this.interval_load = "";

    //启用
    this.frameId = "";
    this.timeoutResize = "";
    this.timeoutRender = "";
    this.timeRender = 3000;

    this.loadState = 0;

    this.onWindowResize = this.onWindowResize.bind(this);

    this.isCall = true;
    this.call = 0;
    this.oldCall = 0;

    this.resourceList = [];

    this.lastPoint = new THREE.Vector3();
    this.minPosition = new THREE.Vector3();
    this.maxPosition = new THREE.Vector3();

    this.isOut = false;
    this.target = new THREE.Vector3();
  }

  load() {
    this.init();
  }

  init() {
    this.initData();
    this.interval_loaddata = setInterval(() => {
      if (this.flagLoadData) {
        clearInterval(this.interval_loaddata);

        this.loadState = 1;
        this.initResource();
      }
    }, this.loadTime);

    this.interval_load = setInterval(() => {
      if (this.flagLoadResource && this.flagLoadRender) {
        clearInterval(this.interval_load);

        this.initCanvas();
        this.initScene();
        this.initCamera();
        this.initLight();
        this.initFace();

        this.initControls();
        this.initRenderer();
        this.initShader();

        this.initEnvMap();

        this.useModel();

        this.flagLoad = true;

        //窗口变化
        window.addEventListener("resize", this.onWindowResize, false);

        this.start();
        this.animate();
      }
    }, this.loadTime);
  }

  initData() {}

  initFace() {}

  initResource() {
    this.resourceClass = new ResourceClass();
    this.resourceClass.resourceList = this.resourceList;
    this.resourceClass.init(() => {
      this.flagLoadResource = true;
    });
  }

  getPercent() {
    let num = 0;
    if (this.resourceClass) {
      num = this.resourceClass.getPercent();
    }
    return num;
  }

  useModel() {}

  initShader() {}

  start() {}

  //画布
  initCanvas() {
    this.container = document.getElementById("div_canvas3d");
    this.getWidthHeight();
    // console.log(this.W, this.H);
  }

  //场景
  initScene() {
    this.scene = new THREE.Scene();
    // this.scene.fog = new THREE.Fog(0x000000, 10, 300)

    this.scene.fog = new THREE.Fog(0x90A9B2, 500, 100000);
  }

  //相机
  initCamera() {
    this.camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.01,
      100000000
    );
    // this.camera.position.set(100, 100, 200);
    // this.camera.position.set(2000, 2000, 4000);
    // this.camera.position.set(1647, 1095, -9019);

    // this.camera.position.set(45, 570, -8000);
    // this.camera.position.set(500, 506, 2500);
    // this.camera.position.set(0.04, 5100, 10000);

    // this.camera.position.set(3749, 3000, 17);


    this.camera.position.set(616, 600, 4725);
  }

  //灯光
  initLight() {
    this.aLight = new THREE.AmbientLight(0xffffff, 0.8); //, 0.3
    this.scene.add(this.aLight.clone());

    this.dLight = new THREE.DirectionalLight(0xffffff, 0.8 * Math.PI);
    // this.dLight.position.set(0.5, 0, 0.866);
    // this.dLight.position.set(100, 200, 100);
    // this.dLight.castShadow = true;
    this.dLight.position.set(100000, 100000, 100000);
    this.scene.add(this.dLight.clone());

    // this.dLight = new THREE.DirectionalLight(0xffffff, 0.8 * Math.PI);
    // // this.dLight.position.set(0.5, 0, 0.866);
    // // this.dLight.position.set(100, 200, 100);
    // // this.dLight.castShadow = true;
    // this.dLight.position.set(-100000, 100000, -100000);
    // this.scene.add(this.dLight.clone());
  }

  //控制器
  initControls() {
    this.controls = new OrbitControls(this.camera, this.container, this.scene);

    // 距离限制
    this.controls.minDistance = 1500;
    this.controls.maxDistance = 7000;

    // 角度限制
    this.controls.maxPolarAngle = Math.PI * 0.499;

    // 启用平移功能
    this.controls.enablePan = true;

    // 鼠标按键映射
    this.controls.mouseButtons = {
      LEFT: THREE.MOUSE.ROTATE,   // 左键：旋转
      MIDDLE: THREE.MOUSE.DOLLY,  // 中键：缩放
      RIGHT: THREE.MOUSE.PAN,     // 右键：平移
    }

    // 触摸屏操作映射
    this.controls.touches = {
      ONE: THREE.TOUCH.ROTATE,           // 单指：旋转
      TWO: THREE.TOUCH.DOLLY_PAN,        // 双指：缩放+平移
    }
  }

  //渲染器
  initRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      logarithmicDepthBuffer: true,
    });

    this.renderer.setSize(this.W, this.H);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.container.appendChild(this.renderer.domElement);
    // this.renderer.shadowMap.enabled = true;
    // this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    // this.renderer.precision = 'highp';
  }

  initEnvMap() {
    let _this = this;

    this.loadState = 2;
    this.isCall = false;

    const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    pmremGenerator.compileEquirectangularShader();
    new RGBELoader().load(png, (texture) => {
      const envMap = pmremGenerator.fromEquirectangular(texture).texture;
      pmremGenerator.dispose();

      _this.scene.environment = envMap;
      _this.renderer.toneMapping = THREE.LinearToneMapping;
      _this.renderer.toneMappingExposure = Math.pow(2, -1);

      _this.scene.background = envMap;
    });

    new THREE.TextureLoader().load(groundResourse, texture => {
      texture.colorSpace = THREE.SRGBColorSpace;

      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      let z = 4000;
      texture.repeat.set(1000000 / z, 1000000 / z);
      texture.anisotropy = 4;

      let meshMaterial = new THREE.MeshBasicMaterial({
        map: texture,
        side: 1,
      });
      let backGround = new THREE.Mesh(new THREE.PlaneGeometry(1000000, 1000000), meshMaterial);
      backGround.position.y -= 10;
      backGround.rotation.x += Math.PI * .5;
      backGround.name = '背景';
      backGround.renderOrder = 0;
      this.scene.add(backGround);
    });

  }

  //动画
  animate() {
    this.render();
    this.frameId = requestAnimationFrame(this.animate.bind(this));

    // console.log(this.camera.position)
  }

  //渲染
  render() {
    this.delta = this.clock.getDelta();
    if (this.mixer) this.mixer.update(this.delta);

    this.renderer.render(this.scene, this.camera);

  }

  ///////////////其他///////////////
  onWindowResize() {
    if (this.timeoutResize) clearTimeout(this.timeoutResize);
    this.timeoutResize = setTimeout(() => {
      this.getWidthHeight();

      if (this.camera) {
        this.camera.aspect = this.W / this.H;
        this.camera.updateProjectionMatrix();
      }

      this.renderer ? this.renderer.setSize(this.W, this.H) : "";

      this.resizeFunc && this.resizeFunc();
    }, 200);
  }

  getWidthHeight() {
    // this.W = window.innerWidth;
    // this.H = window.innerHeight;
    this.W = this.container.offsetWidth;
    this.H = this.container.offsetHeight;
  }

  addOrder() {
    //渲染层级
    this.renderOrder += 10;
    return this.renderOrder;
  }
}

export default ThreeClass;