<template>
  <ShowThree ref="show_three" v-if="data.flagLoadData" />
  <div class="dn">
    <img
      id="img_label"
      src="@/assets/images/label.png"
      style="width: 236px; height: 85px"
    />
  </div>
</template>

<script setup>
import "@/styles/element-ty.css";
import "@/styles/layout.css";
import { ElMessage, ElMessageBox } from "element-plus";
import wx from "weixin-webview-jssdk";
import usePageStore from "@/store/modules/page";
import ShowThree from "@/components/Show/ShowThree";
import modelApi from "@/api/model.js";
import { toRaw } from "vue";
const route = useRoute(); // 第一步
let data = reactive({
  title: "张掖公路养护道路施工3D示意图",
  flagLoadData: false,
  timeoutResize: "",
  ispanel: false,
  dataRoad: [],
  dataIdent: [],
  resourceList: [],
});

const sendMessage = (msg) => {
  ElMessage({
    type: "info",
    message: msg,
  });
};

//初始数据
const getData = () => {
  // data.dataRoad = dataRoad;
  // data.dataIdent = dataIdent;

  // console.log(dataRoad)

  // handleData();
  // data.flagLoadData = true;

  let loadIndex = 0;
  let loadNum = 2;
  let interval_loaddata = "";

  //获取数据
  modelApi.getModelCreate(route.query.token).then((res) => {
    data.dataIdent = res;
    loadIndex++;
    //获取数据
    modelApi.getModelCreateDl(route.query.token).then((res) => {
      data.dataRoad = res;
      loadIndex++;
    }).catch(error => {
      if(error?.response?.status === 401) {
        wx.miniProgram.navigateTo({
	  			url: '/pages/login/login',
	  		})
      }
    })
  }).catch(error => {
    if(error?.response?.status === 401) {
      wx.miniProgram.navigateTo({
				url: '/pages/login/login',
			})
    }
  })

  interval_loaddata = setInterval(() => {
    if (loadIndex == loadNum) {
      clearInterval(interval_loaddata);
      interval_loaddata = "";

      data.flagLoadData = true;
      handleData();
    }
  }, 100);
};

const handleData = () => {
  // console.log(data.dataRoad);
  // console.log(data.dataIdent);

  //数据过滤
  let resourceList = [];
  let dlArr = toRaw(data.dataRoad.dl);
  let bsArr = toRaw(data.dataIdent.model);
  let bsModelArr = [];

  for (let i = 0; i < dlArr.length; i++) {
    let id = toRaw(dlArr[i]).id;
    let bs = toRaw(dlArr[i]).bs;
    let path = dlArr[i].path;

    if (path) {
      let obj = {
        id: id,
        type: "model",
        types: "dl",
        name: "dl",
        url: path,
        steam: 100,
        data: bs,
      };
      resourceList.push(obj);
    }

    if (bs) {
      for (let j = 0; j < bs.length; j++) {
        if (!bsModelArr.includes(bs[j].d_model_id)) {
          bsModelArr.push(bs[j].d_model_id);
        }
      }
    }
  }

  for (let i = 0; i < bsModelArr.length; i++) {
    let id = bsModelArr[i];

    for (let j = 0; j < bsArr.length; j++) {
      if (id == bsArr[j].id) {
        let obj = {
          id,
          type: "model",
          types: "bs",
          name: "bs",
          url: bsArr[j].path,
          steam: 100,
          data: bsArr[j],
        };
        resourceList.push(obj);
      }
    }
  }

  data.resourceList = resourceList;
};

let vm = {
  sendMessage,
};
usePageStore().dataLayout = data;
usePageStore().vmLayout = vm;

onBeforeMount(() => {});

onMounted(() => {
  getData();

  document.getElementsByTagName("title")[0].innerHTML = data.title;

  window.onresize = () => {
    pageResize();
  };
});

onUnmounted(() => {
  window.onresize = null;
});

//页面重置尺寸
const pageResize = (index) => {
  if (data.timeoutResize) clearTimeout(data.timeoutResize);
  data.imeoutResize = setTimeout(() => {}, 200);
};

defineExpose(vm);
</script>
