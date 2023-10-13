<template>
  <div id="div_loading" class="div-loading" v-if="!data.isdn">
    <div id="div_loading_panel" class="div-loading-panel">
      正在加载数据请稍等：<span id="loading_text"></span>
      <div class="loading-show">
        <div id="loading_progress" class="loading-progress"></div>
      </div>
    </div>
  </div>

  <div id="center_canvas" class="center-canvas">
    <div id="div_canvas3d" :class="{ 'div-canvas3d': true }"></div>

    <canvas id="canvas_font" class="canvas-font"></canvas>
  </div>
</template>

<script setup>
import "@/styles/three.css";
import usePageStore from "@/store/modules/page";
import SceneClass from "@/utils/class/SceneClass.js";

let data = reactive({
  isdn: false,
});
let threeApp = "";
let intervalLoad = "";

let vm = {};
usePageStore().dataThree = data;
usePageStore().vmThree = vm;

const loading = (func) => {
  let divLoadingPanel = document.getElementById("div_loading_panel");
  let loadingText = document.getElementById("loading_text");
  let loadingProgress = document.getElementById("loading_progress");

  if (usePageStore().threeApp) {
    let percent = 0;

    intervalLoad = setInterval(() => {
      let state = usePageStore().threeApp.loadState;
      if (percent <= 99) {
        percent = usePageStore().threeApp.getPercent();
      }

      switch (state) {
        case 0:
          loadingText.innerText = Math.floor(percent) + "%";
          loadingProgress.style.width = Math.floor(percent) + "%";
          break;
        case 1:
          if (percent >= 99) {
            percent = 99;
            setTimeout(() => {
              usePageStore().threeApp.flagLoadRender = true;
            }, 500);
          }
          loadingText.innerText = Math.floor(percent) + "%";
          loadingProgress.style.width = Math.floor(percent) + "%";
          break;
        case 2:
          percent = 100;
          loadingText.innerText = Math.floor(percent) + "%";
          loadingProgress.style.width = Math.floor(percent) + "%";
          clearInterval(intervalLoad);

          setTimeout(() => {
            func && func();
          }, 100);

          break;
      }
    }, 50);
  }
};

onMounted(() => {
  threeApp = new SceneClass();
  // threeApp.resourceList = [
  //   {
  //     type: "model",
  //     name: "model1",
  //     url: "./models/狐狸.glb",
  //     steam: 100,
  //   },
  // ];
  threeApp.resourceList=usePageStore().dataLayout.resourceList;
  threeApp.load();
  usePageStore().threeApp = threeApp;

  loading(() => {
    console.log("yes load");
    data.isdn = true;
    usePageStore().dataLayout.ispanel = true;
  });
});

defineExpose(vm);
</script>

<style lang="scss" scoped>
</style>