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

    <!-- 重置视角按钮 -->
    <div class="camera-controls" v-if="data.isdn">
      <button class="reset-camera-btn" @click="handleResetCamera" title="重置视角">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
          <path d="M21 3v5h-5"></path>
          <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path>
          <path d="M3 21v-5h5"></path>
        </svg>
        <span>重置视角</span>
      </button>
    </div>

    <!-- 操作提示 -->
    <div class="interaction-hints" v-if="data.isdn && data.showHints">
      <div class="hint-item">💡 双击模型可聚焦查看细节</div>
      <div class="hint-item">🖱️ 右键上下拖动可前后移动视角（方便从头部移动到尾部）</div>
      <div class="hint-item">🖱️ 右键左右拖动可水平平移视角</div>
      <button class="close-hints-btn" @click="data.showHints = false">×</button>
    </div>
  </div>
</template>

<script setup>
import "@/styles/three.css";
import usePageStore from "@/store/modules/page";
import SceneClass from "@/utils/class/SceneClass.js";

let data = reactive({
  isdn: false,
  showHints: true, // 显示操作提示
});
let threeApp = "";
let intervalLoad = "";

// 重置相机视角
const handleResetCamera = () => {
  if (usePageStore().threeApp && usePageStore().threeApp.resetCamera) {
    usePageStore().threeApp.resetCamera();
  }
};

let vm = {
  handleResetCamera
};
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
    data.isdn = true;
    usePageStore().dataLayout.ispanel = true;
  });
});

defineExpose(vm);
</script>

<style lang="scss" scoped>
/* 相机控制按钮 */
.camera-controls {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 1000;
}

.reset-camera-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: #333;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  transition: all 0.2s ease;

  svg {
    flex-shrink: 0;
  }

  &:hover {
    background: rgba(255, 255, 255, 1);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  }
}

/* 操作提示 */
.interaction-hints {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  background: rgba(0, 0, 0, 0.85);
  color: white;
  padding: 12px 20px;
  border-radius: 8px;
  display: flex;
  gap: 20px;
  align-items: center;
  font-size: 13px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

.hint-item {
  white-space: nowrap;
}

.close-hints-btn {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  font-size: 20px;
  cursor: pointer;
  padding: 0 0 0 10px;
  line-height: 1;
  transition: color 0.2s ease;

  &:hover {
    color: white;
  }
}

/* 移动端适配 */
@media (max-width: 768px) {
  .camera-controls {
    top: 10px;
    right: 10px;
  }

  .reset-camera-btn {
    padding: 8px 12px;
    font-size: 13px;

    span {
      display: none; // 移动端只显示图标
    }
  }

  .interaction-hints {
    bottom: 10px;
    flex-direction: column;
    gap: 8px;
    font-size: 12px;
    padding: 10px 16px;
  }
}
</style>