import * as THREE from "three";
import {
  GLTFLoader
} from "three/examples/jsm/loaders/GLTFLoader.js";
import {
  DRACOLoader
} from "three/examples/jsm/loaders/DRACOLoader.js";
import {
  RGBELoader
} from "three/examples/jsm/loaders/RGBELoader.js";

class ResourceClass {
  constructor() {
    // this.loadingManager = new THREE.LoadingManager();

    this.interval_resource = "";
    this.loadIndex = 0;
    this.loadNum = 1;
    this.resourceList = [];

    this.percent = 0;
    this.steamTotal = 0;
    this.steamNum = 0;
    this.resourceInfo = [];

    this.flagCheck = false;
  }

  init(func) {
    this.loadNum = this.resourceList.length;

    for (let i = 0; i < this.resourceList.length; i++) {
      let name = this.resourceList[i].name;
      let url = this.resourceList[i].url;
      let type = this.resourceList[i].type;
      let steam = this.resourceList[i].steam;

      this.loadResource(i, type, url);

      let obj = {};
      obj.url = url;
      obj.loaded = 0;
      obj.total = steam;
      this.resourceInfo.push(obj);
    }

    this.computeTotal();

    this.interval_resource = setInterval(() => {
      if (this.loadIndex == this.loadNum) {
        clearInterval(this.interval_resource);
        this.interval_resource = "";

        func && func();
      }
    }, 100);
  }

  loadResource(i, type, url) {
    switch (type) {
      case "model":
        this.loadModel(i, url);
        break;
    }
  }

  loadModel(i, url) {
    let loader = new GLTFLoader(); //.setPath('/') plane123.glb 冰dundun
    let dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath("./libs/draco/");
    dracoLoader.setDecoderConfig({
      type: "js",
    });
    loader.setDRACOLoader(dracoLoader);

    loader.load(
      url,
      (gltf) => {
        let animations = gltf.animations;
        let object = gltf.scene;
        object.animations = animations;
        // object.position.set(0, 5, 0);
        let size = 1;
        object.scale.set(size, size, size);
        this.resourceList[i].entity = object;

        this.loadIndex++;

        this.percent = Math.floor((this.loadIndex / this.loadNum) * 100);
      },
      (xhr) => {
        // this.computeLoaded(url, xhr.loaded);
      },
      (error) => {
        // console.error('error', error)
      }
    );
  }

  getSourceByName(name) {
    let source = "";
    for (let i = 0; i < this.resourceList.length; i++) {
      if (this.resourceList[i].name == name) {
        source = this.resourceList[i].entity;
      }
    }
    return source;
  }

  computeTotal() {
    let num = 0;
    for (let i = 0; i < this.resourceInfo.length; i++) {
      num += this.resourceInfo[i].total;
    }

    this.steamTotal = num;
  }

  computeLoaded(url, loaded) {
    let num = 0;
    for (let i = 0; i < this.resourceInfo.length; i++) {
      if (this.resourceInfo[i].url == url) {
        this.resourceInfo[i].loaded = loaded;
      }

      num += this.resourceInfo[i].loaded;
    }

    this.steamNum = num;
    this.percent = Math.floor((this.steamNum / this.steamTotal) * 100);
  }

  getPercent() {
    // console.log(this.percent);
    return this.percent;
  }
}

export default ResourceClass;