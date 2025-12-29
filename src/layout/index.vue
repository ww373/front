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

  // 开发环境：先调用 setType 设置测试参数
  if (import.meta.env.DEV && !route.query.skipSetType) {
    const testParams = {
      job_type: 5,       // 国道临时作业
      u_d_type: 1,       // 上行
      road_type: 0,      // 国道不区分车道
      speed: 80,         // 80Km/h
      start: "2200000",    // 15090米 = K15+090 (纯数字格式)
      end: "2200600"       // 16150米 = K16+150 (纯数字格式)
    };

    // 存储请求参数供调试使用
    window.__DEBUG_REQUEST_PARAMS__ = testParams;

    modelApi.setType(route.query.token, testParams).then(() => {
      console.log('✅ 测试参数设置成功:', testParams);
      fetchModelData();
    }).catch(error => {
      console.error('❌ setType API 调用失败:', error);
      console.error('错误详情:', error.response?.data);
      const errorMsg = error.response?.data?.message || '参数设置失败';
      ElMessage.error(`参数设置失败: ${errorMsg}`);
    });
  } else {
    // 生产环境或从小程序跳转：直接获取数据
    fetchModelData();
  }

  function fetchModelData() {
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
  }
};

const handleData = () => {
  // ==================== 数据处理开始 ====================
  console.log('\n🔄 [数据处理] 开始合并 API 数据...');
  console.log('  原始数据源:');
  console.log('    - data.dataRoad (createDl):', data.dataRoad);
  console.log('    - data.dataIdent (create):', data.dataIdent);

  //数据过滤
  let resourceList = [];
  let dlArr = toRaw(data.dataRoad.dl);
  let bsArr = toRaw(data.dataIdent.model);
  let bsModelArr = [];

  // 统计变量
  let totalBsFromDl = 0;
  let missingPathCount = 0;

  // ==================== 处理道路模型 ====================
  console.log('\n📍 [步骤1] 处理道路模型 (dl)...');
  for (let i = 0; i < dlArr.length; i++) {
    let id = toRaw(dlArr[i]).id;
    let bs = toRaw(dlArr[i]).bs;
    let path = dlArr[i].path;

    if (path) {
      // 将 /storage/ 路径改为 /api/storage/ 以通过CORS代理
      let url = path.replace(/^(https?:\/\/[^/]+)\/storage\//, '$1/api/storage/');

      let obj = {
        id: id,
        type: "model",
        types: "dl",
        name: "dl",
        url: url,
        steam: 100,
        data: bs,
      };
      resourceList.push(obj);
      console.log(`  ✓ 道路 ${i + 1}: id=${id}, url=${url}`);
    } else {
      console.warn(`  ✗ 道路 ${i + 1}: id=${id} 缺少 path 字段，跳过`);
      missingPathCount++;
    }

    if (bs) {
      totalBsFromDl += bs.length;
      for (let j = 0; j < bs.length; j++) {
        if (!bsModelArr.includes(bs[j].d_model_id)) {
          bsModelArr.push(bs[j].d_model_id);
        }
      }
    }
  }
  console.log(`  └─ 总计: ${dlArr.length} 条道路, ${dlArr.length - missingPathCount} 条有效, 关联 ${totalBsFromDl} 个结构物实例`);

  // ==================== 提取唯一的结构物模型ID ====================
  console.log(`\n📍 [步骤2] 提取唯一结构物模型ID...`);
  console.log(`  └─ 去重后的模型ID列表 (${bsModelArr.length} 个):`, bsModelArr);

  // ==================== 匹配结构物模型定义 ====================
  console.log(`\n📍 [步骤3] 匹配结构物模型定义 (bs)...`);
  let matchedCount = 0;
  let unmatchedIds = [];

  for (let i = 0; i < bsModelArr.length; i++) {
    let id = bsModelArr[i];
    let found = false;

    for (let j = 0; j < bsArr.length; j++) {
      if (id == bsArr[j].id) {
        found = true;
        // 将 /storage/ 路径改为 /api/storage/ 以通过CORS代理
        let url = bsArr[j].path.replace(/^(https?:\/\/[^/]+)\/storage\//, '$1/api/storage/');

        let obj = {
          id,
          type: "model",
          types: "bs",
          name: "bs",
          url: url,
          steam: 100,
          data: bsArr[j],
        };
        resourceList.push(obj);
        console.log(`  ✓ 模型 ${matchedCount + 1}: id=${id}, name=${bsArr[j].name}, url=${url}`);
        matchedCount++;
        break;
      }
    }

    if (!found) {
      unmatchedIds.push(id);
      console.warn(`  ✗ 模型 id=${id} 在 create 数据中找不到匹配的定义！`);
    }
  }

  console.log(`  └─ 匹配结果: ${matchedCount}/${bsModelArr.length} 个成功`);
  if (unmatchedIds.length > 0) {
    console.error(`  ⚠️ 警告: ${unmatchedIds.length} 个模型ID无法匹配:`, unmatchedIds);
    console.error(`  → 这些模型将无法加载，请检查后端 create API 返回的数据是否完整`);
  }

  // ==================== 最终统计 ====================
  data.resourceList = resourceList;

  console.log(`\n✅ [数据处理完成] 资源列表已生成:`);
  console.log(`  └─ 道路模型 (dl): ${resourceList.filter(r => r.types === 'dl').length} 个`);
  console.log(`  └─ 结构物模型 (bs): ${resourceList.filter(r => r.types === 'bs').length} 个`);
  console.log(`  └─ 总计: ${resourceList.length} 个模型需要加载`);
  console.log('  完整资源列表:', resourceList);

  // 存储到全局变量供调试使用
  window.__DEBUG_RESOURCE_LIST__ = resourceList;
  window.__DEBUG_DL_DATA__ = dlArr;
  window.__DEBUG_BS_DEFINITIONS__ = bsArr;

  console.log('\n💡 调试提示: 可在控制台输入以下命令查看数据:');
  console.log('  - window.__DEBUG_RESOURCE_LIST__ (资源列表)');
  console.log('  - window.__DEBUG_DL_DATA__ (道路+布设数据)');
  console.log('  - window.__DEBUG_BS_DEFINITIONS__ (模型定义)');
  console.log('  - window.exportDebugReport() (导出完整调试报告)');
  // ====================================================
};

let vm = {
  sendMessage,
};
usePageStore().dataLayout = data;
usePageStore().vmLayout = vm;

// ==================== 全局调试工具函数 ====================
/**
 * 导出完整的调试报告（JSON格式），方便发送给后端排查问题
 */
window.exportDebugReport = function() {
  const report = {
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,

    // 请求参数
    requestParams: {
      job_type: window.__DEBUG_REQUEST_PARAMS__?.job_type,
      u_d_type: window.__DEBUG_REQUEST_PARAMS__?.u_d_type,
      road_type: window.__DEBUG_REQUEST_PARAMS__?.road_type,
      speed: window.__DEBUG_REQUEST_PARAMS__?.speed,
      start: window.__DEBUG_REQUEST_PARAMS__?.start,
      end: window.__DEBUG_REQUEST_PARAMS__?.end
    },

    // API 响应数据统计
    apiData: {
      createDl: {
        roadCount: window.__DEBUG_DL_DATA__?.length || 0,
        totalStructures: window.__DEBUG_DL_DATA__?.reduce((sum, dl) => sum + (dl.bs?.length || 0), 0) || 0,
        roads: window.__DEBUG_DL_DATA__?.map(dl => ({
          id: dl.id,
          name: dl.name,
          type: dl.type,
          hasPath: !!dl.path,
          structureCount: dl.bs?.length || 0
        }))
      },
      create: {
        modelCount: window.__DEBUG_BS_DEFINITIONS__?.length || 0,
        byType: {},
        models: window.__DEBUG_BS_DEFINITIONS__?.map(m => ({
          id: m.id,
          name: m.name,
          type: m.type,
          hasPath: !!m.path,
          path: m.path
        }))
      }
    },

    // 资源加载情况
    resourceLoading: {
      totalResources: window.__DEBUG_RESOURCE_LIST__?.length || 0,
      dlResources: window.__DEBUG_RESOURCE_LIST__?.filter(r => r.types === 'dl').length || 0,
      bsResources: window.__DEBUG_RESOURCE_LIST__?.filter(r => r.types === 'bs').length || 0,
      resources: window.__DEBUG_RESOURCE_LIST__?.map(r => ({
        id: r.id,
        types: r.types,
        name: r.name,
        url: r.url,
        loaded: !!r.entity
      }))
    },

    // 3D渲染统计
    renderingStats: window.__DEBUG_SCENE_STATS__ || {},

    // 详细的结构物数据（完整坐标信息）
    structureDetails: [],

    // 问题诊断
    issues: []
  };

  // 收集所有结构物的详细信息
  if (window.__DEBUG_DL_DATA__) {
    window.__DEBUG_DL_DATA__.forEach(dl => {
      if (dl.bs) {
        dl.bs.forEach(bs => {
          report.structureDetails.push({
            roadId: dl.id,
            modelId: bs.d_model_id,
            name: bs.name,
            position: { x: bs.x, y: bs.y, z: bs.z },
            y_real: bs.y_real,
            y_name: bs.y_name,
            y_name_show: bs.y_name_show,
            rotation: bs.s,
            scale: bs.sf,
            enabled: bs.eff
          });
        });
      }
    });
  }

  // 统计模型类型
  if (window.__DEBUG_BS_DEFINITIONS__) {
    window.__DEBUG_BS_DEFINITIONS__.forEach(m => {
      const typeName = m.type === 1 ? 'dl' : m.type === 2 ? 'bs' : 'other';
      if (!report.apiData.create.byType[typeName]) {
        report.apiData.create.byType[typeName] = 0;
      }
      report.apiData.create.byType[typeName]++;
    });
  }

  // 诊断问题
  const stats = window.__DEBUG_SCENE_STATS__;
  if (stats) {
    if (stats.skippedBsCount > 0) {
      report.issues.push({
        type: 'MISSING_MODELS',
        severity: 'ERROR',
        message: `有 ${stats.skippedBsCount} 个结构物因为找不到对应的GLB文件而未能渲染`,
        missingModelIds: stats.missingModelIds,
        suggestion: '检查后端 create API 是否返回了所有需要的模型定义，或者检查GLB文件是否存在'
      });
    }

    if (stats.totalExpected !== stats.renderedBsCount) {
      report.issues.push({
        type: 'RENDER_MISMATCH',
        severity: 'WARNING',
        message: `预期渲染 ${stats.totalExpected} 个结构物，实际只渲染了 ${stats.renderedBsCount} 个`,
        expected: stats.totalExpected,
        actual: stats.renderedBsCount,
        difference: stats.totalExpected - stats.renderedBsCount
      });
    }
  }

  // 检查是否有模型定义缺少path
  if (window.__DEBUG_BS_DEFINITIONS__) {
    const missingPaths = window.__DEBUG_BS_DEFINITIONS__.filter(m => !m.path);
    if (missingPaths.length > 0) {
      report.issues.push({
        type: 'MISSING_PATHS',
        severity: 'ERROR',
        message: `有 ${missingPaths.length} 个模型定义缺少 path 字段`,
        modelIds: missingPaths.map(m => m.id),
        suggestion: '检查数据库 d_model 表中这些模型的 path 字段是否为空'
      });
    }
  }

  // 导出为JSON文件
  const json = JSON.stringify(report, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `debug-report-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
  a.click();
  URL.revokeObjectURL(url);

  console.log('\n📋 调试报告已导出！');
  console.log('报告内容预览:', report);
  console.log('\n📊 问题总结:');
  if (report.issues.length === 0) {
    console.log('  ✅ 未发现问题，所有模型均已正常渲染');
  } else {
    report.issues.forEach((issue, index) => {
      console.log(`  ${index + 1}. [${issue.severity}] ${issue.message}`);
      if (issue.suggestion) {
        console.log(`     💡 建议: ${issue.suggestion}`);
      }
    });
  }

  return report;
};

console.log('\n🛠️ 全局调试工具已就绪！在控制台输入 window.exportDebugReport() 导出完整报告');
// ====================================================

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
