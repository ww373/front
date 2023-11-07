import * as THREE from "three";

import ThreeClass from "@/utils/class/ThreeClass";

import usePageStore from "@/store/modules/page";

class SceneClass extends ThreeClass {
  constructor() {
    super();

    this.object = "";
    this.group = new THREE.Group();

    this.textureLoader = new THREE.TextureLoader();

    this.dataLayout = "";

    this.material = "";

    this.actions = [];

    this.modelSize = 0;

    this.shadowMaterial = "";

    this.dataRoad = "";

    this.clickArr = [];
    this.clickNum = 0;
    this.model1 = "";
    this.model2 = "";

    this.groupCenter = new THREE.Vector3();
    this.groupSize = new THREE.Vector3();
    this.area = {
      x: 0,
      z: 0,
      x1: 0,
      z1: 0
    };
  }

  /**数据*/
  initData() {
    this.dataRoad = usePageStore().dataLayout.dataRoad;

    this.flagLoadData = true;
  }

  useModel() {

    this.scene.add(this.group);

    let dlArr = this.dataRoad.dl;
    if (dlArr) {
      for (let i = 0; i < dlArr.length; i++) {
        let dl = dlArr[i];
        let bs = dlArr[i].bs;
        let type = dlArr[i].type - 0;

        for (let j = 0; j < this.resourceList.length; j++) {
          let resource = this.resourceList[j];

          if (resource.types == "dl" && resource.id == dl.id) {
            let model = toRaw(resource.entity).clone();
            model.types = "dl";

            // this.group.position.y += 20.5;

            if (i == 0) {
              this.group.add(model);
            } else {
              this.scene.add(model);
            }
          }
        }

        if (bs) {
          for (let j = 0; j < bs.length; j++) {
            let bsdata = bs[j];
            // console.log(bsdata);
            let name = bsdata.name;

            for (let k = 0; k < this.resourceList.length; k++) {
              let resource = this.resourceList[k];

              if (resource.types == "bs" && resource.id == bsdata.d_model_id) {
                let model = toRaw(resource.entity).clone();

                let x = bsdata.x - 0;
                let y = bsdata.y - 0;
                let z = bsdata.z - 0;
                let s = bsdata.s - 0;
                let y_name = bsdata.y_name;
                let y_real = bsdata.y_real - 0;
                let sf = 16 * (bsdata.sf - 0);

                let v = new THREE.Vector3();
                const box = new THREE.Box3().setFromObject(model);
                box.getSize(v);
                model.modelSize = v;

                if (y_name) {
                  let sprite = this.createSprite(`${y_name}`); //
                  // let size = 10;
                  // sprite.scale.set(size, size, size);
                  sprite.position.set(0, v.y + 5, 0);
                  model.add(sprite);
                  // this.scene.add(sprite);
                }

                model.position.set(x, z, -y);
                // if (type == 1) {
                //   model.rotation.y = Math.PI / 180 * 180;
                // }
                // model.rotation.y += Math.PI / 180 * s;

                model.rotation.y += Math.PI / 180 * s;

                model.scale.set(sf, sf, sf);
                model.userData.data = bsdata;
                model.name = name;
                this.scene.add(model);

                model.types = "bs";
                this.clickArr.push(model);


              }
            }
          }

        }

      }

      const box = new THREE.Box3().setFromObject(this.group);
      box.getCenter(this.groupCenter);
      box.getSize(this.groupSize);
      // console.log(this.groupCenter);

      // this.camera.position.set(this.groupCenter.x, 5100, this.groupCenter.z);
      // this.controls.target = this.groupCenter;
      // this.controls.update();

      let p = new THREE.Vector3();
      let dir = this.groupCenter.clone().sub(p.clone());

      let p1 = this.camera.position.clone();
      p1.add(dir.clone());

      this.camera.position.set(p1.x, 600, p1.z);
      this.controls.target = this.groupCenter;
      this.controls.update();

      this.lastPoint = this.camera.position.clone();

      this.area.x = this.groupSize.x + this.groupSize.x * 2;
      this.area.x1 = -this.area.x;
      this.area.z = -this.groupSize.z - this.groupSize.z / 2;
      this.area.z1 = this.groupSize.z / 2;

      this.minPosition = new THREE.Vector3(this.area.x1, 3000, this.area.z);
      this.maxPosition = new THREE.Vector3(this.area.x, 0, this.area.z1);

    }
  }

  initControls() {
    super.initControls();

    // const axesHelper = new THREE.AxesHelper(5000);
    // this.scene.add(axesHelper);

    this.container.addEventListener("pointerdown", this.handlePointerDown.bind(this));
  }

  handlePointerDown(e) {
    let mouse = {
      x: 0,
      y: 0
    };
    // mouse.x = (e.clientX / this.W) * 2 - 1;
    // mouse.y = -(e.clientY / this.H) * 2 + 1;

    let mainCanvas = document.getElementsByTagName("canvas")[0];

    // 将屏幕坐标转为标准设备坐标(支持画布非全屏的情况) 
    mouse.x = ((e.clientX - mainCanvas.getBoundingClientRect().left) / mainCanvas.offsetWidth) * 2 - 1;
    mouse.y = -((e.clientY - mainCanvas.getBoundingClientRect().top) / mainCanvas.offsetHeight) * 2 + 1;

    let raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, this.camera);
    let intersects = raycaster.intersectObjects(this.clickArr, true);

    if (intersects.length > 0) {
      let object = intersects[0].object;
      object = this.checkParent(object);

      if (this.model1.name == object.name) {
        return;
      }

      if (!this.model1 && this.clickNum == 0) {
        this.model1 = object;
      }
      if (!this.model2 && this.clickNum == 1) {
        this.model2 = object;

        // let x1 = this.model1.userData.data.x - 0;
        // let y1 = this.model1.userData.data.y - 0;
        // let x2 = this.model2.userData.data.x - 0;
        // let y2 = this.model2.userData.data.y - 0;
        // let p1 = new THREE.Vector2(x1, y1);
        // let p2 = new THREE.Vector2(x2, y2);
        let y1 = this.model1.userData.data.y_real - 0;
        let y2 = this.model2.userData.data.y_real - 0;
        let dis = Math.abs(y1 - y2); //p1.distanceTo(p2);

        let name1 = this.model1.name;
        let name2 = this.model2.name;

        let txt = `${name1}与${name2}的距离为${parseInt(dis)}米`;
        usePageStore().vmLayout.sendMessage(txt);

        this.model1 = "";
        this.model2 = "";
      }

      this.clickNum++;

      if (this.clickNum >= 2) {
        this.clickNum = 0;
      }
    }
  }

  checkParent(object) {
    if (object && object.type == "Scene") return;
    if (object.type == "Group") return object;

    let obj = this.checkParent(object.parent);
    return obj;
  }

  //标注
  createSprite(text) {
    let canvas = document.createElement("canvas");
    canvas.width = 236;
    canvas.height = 85;

    let len = text.length + 2;
    let fontsize = 45;
    let lentotal = len * fontsize;
    let left = 236 / 2 - lentotal / 4;
    let top = 85 / 2;

    let context = canvas.getContext("2d");
    context.beginPath();
    // let img = document.getElementById("img_label");
    // context.drawImage(img, 0, 0, 236, 85);
    context.fillStyle = 'rgba(10, 10, 10, 0.8)';
    context.fillRect(0, 0, 236, 85);
    context.font = `${fontsize}px Microsoft YaHei`;
    context.textBaseline = "middle";
    context.fillStyle = "#fff";
    context.fillText(text, left, top);
    context.fill();
    context.stroke();

    let url = canvas.toDataURL("image/png");
    let texture = new THREE.TextureLoader().load(url);

    let material = new THREE.SpriteMaterial({
      map: texture,
      side: 2,
      // transparent: true,
      // opacity: 0.8,
      depthTest: false,
      depthWrite: false,
    });
    material.needsUpdate = true;

    let particle = new THREE.Sprite(material);
    particle.scale.set(10, 3.6, 10);
    return particle;
  }

  start() {
    // let _this = this;

    // const geometry = new THREE.BoxGeometry(500, 500, 500);
    // const material = new THREE.MeshBasicMaterial({
    //   color: 0x171717,
    //   side: 1,
    //   toneMapped: false,
    // });
    // const box = new THREE.Mesh(geometry, material);
    // // box.receiveShadow = true;
    // // box.rotation.x += Math.PI * .5;
    // // plane.position.y = -this.height / 2;
    // // box.position.y += 250;
    // this.scene.add(box);

    // const geometry1 = new THREE.PlaneGeometry(100, 100);
    // this.shadowMaterial = new THREE.MeshBasicMaterial({
    //   // color:"#ffffff",
    //   side: THREE.FrontSide,
    //   map: this.resourceClass.getSourceByName("shadow0"),
    //   blending: THREE.MultiplyBlending,
    //   toneMapped: false,
    //   transparent: true,
    // });
    // const plane = new THREE.Mesh(geometry1, this.shadowMaterial);
    // // plane.receiveShadow = true;
    // plane.rotation.x -= Math.PI * 0.5;
    // // plane.position.y = -this.height / 2;
    // plane.position.y = -5;
    // this.scene.add(plane);
  }

  render() {
    super.render();
  }

  /**销毁*/
  destroyObject(object) {
    if (!object) return;
    object.traverse((item) => {
      if (item.isMesh) {
        item.geometry.dispose();
        item.material.dispose();
      }
    });

    object.parent.remove(object);
  }

  /**处理*/
  cloneCopy(a, c) {
    a.animations ? (c.animations = a.animations) : "";
    return c;
  }
}

export default SceneClass;