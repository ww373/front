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

    // 🎯 禁用默认平移功能（我们将手动实现）
    this.controls.enablePan = false;

    // 鼠标按键映射
    this.controls.mouseButtons = {
      LEFT: THREE.MOUSE.ROTATE,   // 左键：旋转
      MIDDLE: THREE.MOUSE.DOLLY,  // 中键：缩放
      RIGHT: null,                // 右键：禁用（手动处理）
    }

    // 触摸屏操作映射
    this.controls.touches = {
      ONE: THREE.TOUCH.ROTATE,           // 单指：旋转
      TWO: THREE.TOUCH.DOLLY_PAN,        // 双指：缩放+平移
    }

    // ⚡ 启用阻尼（平滑交互）
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;

    // 🎯 自定义平移行为：右键上下拖动改为前后移动
    this._setupCustomPan();
  }

  /**
   * 🎯 自定义平移行为
   * - 右键上下拖动：沿相机视线方向前后移动（方便从道路头部移动到尾部）
   * - 右键左右拖动：水平左右平移（保持原有行为）
   */
  _setupCustomPan() {
    const _this = this;
    let isPanning = false;
    let previousMousePosition = { x: 0, y: 0 };

    // 监听鼠标按下事件
    this.container.addEventListener('mousedown', (event) => {
      if (event.button === 2) { // 右键
        isPanning = true;
        previousMousePosition = {
          x: event.clientX,
          y: event.clientY
        };
        event.preventDefault(); // 阻止右键菜单
      }
    });

    // 监听鼠标移动事件
    this.container.addEventListener('mousemove', (event) => {
      if (isPanning) {
        const deltaX = event.clientX - previousMousePosition.x;
        const deltaY = event.clientY - previousMousePosition.y;

        // 执行自定义平移
        _this._customPan(deltaX, deltaY);

        previousMousePosition = {
          x: event.clientX,
          y: event.clientY
        };
      }
    });

    // 监听鼠标释放事件
    this.container.addEventListener('mouseup', (event) => {
      if (event.button === 2 && isPanning) {
        isPanning = false;
      }
    });

    // 监听鼠标离开画布事件
    this.container.addEventListener('mouseleave', () => {
      if (isPanning) {
        isPanning = false;
      }
    });

    // 禁用右键菜单
    this.container.addEventListener('contextmenu', (event) => {
      event.preventDefault();
    });
  }

  /**
   * 执行自定义平移
   * @param {number} deltaX - 鼠标 X 轴移动距离
   * @param {number} deltaY - 鼠标 Y 轴移动距离
   */
  _customPan(deltaX, deltaY) {
    const camera = this.camera;
    const controls = this.controls;

    // 计算相机到目标点的距离
    const offset = new THREE.Vector3();
    offset.copy(camera.position).sub(controls.target);
    let targetDistance = offset.length();

    // 根据FOV和距离计算平移速度
    const fovScale = Math.tan((camera.fov / 2) * Math.PI / 180.0) * targetDistance;
    const panSpeed = 1.5; // 平移速度系数

    // 🎯 左右拖动：水平左右平移
    const panLeft = new THREE.Vector3();
    panLeft.setFromMatrixColumn(camera.matrix, 0); // 相机的右方向向量
    panLeft.multiplyScalar(-deltaX * fovScale / this.H * panSpeed);

    // 🎯 上下拖动：沿相机视线方向前后移动
    const panForward = new THREE.Vector3();
    panForward.copy(camera.position).sub(controls.target).normalize();
    panForward.multiplyScalar(deltaY * fovScale / this.H * panSpeed);

    // 应用平移
    const panOffset = new THREE.Vector3();
    panOffset.add(panLeft);
    panOffset.add(panForward);

    camera.position.add(panOffset);
    controls.target.add(panOffset);

    // 触发 controls 更新
    controls.update();
  }

  //渲染器
  initRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: false, // ⚡ 关闭抗锯齿（提升30-50%性能）
      logarithmicDepthBuffer: true, // ✅ 必须启用（大场景需要对数深度缓冲，否则会闪烁）
      powerPreference: "high-performance", // ⚡ 使用高性能GPU
    });

    this.renderer.setSize(this.W, this.H);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5)); // ⚡ 限制像素比（避免4K屏过载）
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
      let z = 8000; // ⚡ 降低纹理平铺密度（4000 → 8000，减少50%纹理采样）
      texture.repeat.set(1000000 / z, 1000000 / z);
      texture.anisotropy = 1; // ⚡ 降低各向异性过滤（4 → 1，提升性能）

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

    // ⚡ 更新控制器（支持阻尼效果）
    if (this.controls && this.controls.enableDamping) {
      this.controls.update();
    }

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