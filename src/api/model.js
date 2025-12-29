import request from '@/utils/request'

export default {
    getModelCreateDl,
    getModelCreate,
    setType,
};

// 获取道路和布设数据（包含所有结构物的坐标信息）
function getModelCreateDl(token) {
    return request({
        url: '/api/model/createDl',
        method: 'get',
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
        }
    }).then(response => {
        // ==================== 数据接收日志 ====================
        console.log('📦 [API] createDl 原始响应数据:', response);

        if (response && response.dl) {
            console.log(`📊 [API] createDl 统计: 共 ${response.dl.length} 条道路数据`);

            response.dl.forEach((dl, index) => {
                const bsCount = dl.bs ? dl.bs.length : 0;
                console.log(`  └─ 道路 ${index + 1}: id=${dl.id}, 结构物数量=${bsCount}`);

                if (dl.bs && dl.bs.length > 0) {
                    console.log(`     结构物列表 (共${bsCount}个):`);
                    dl.bs.forEach((bs, bsIndex) => {
                        console.log(`       ${bsIndex + 1}. ${bs.name || '未命名'} (id=${bs.d_model_id}) - 位置: x=${bs.x}, y=${bs.y}, y_real=${bs.y_real}, 显示标签: ${bs.y_name_show ? '是' : '否'}`);
                    });
                }
            });
        } else {
            console.warn('⚠️ [API] createDl 响应数据格式异常:', response);
        }
        // ====================================================

        return response;
    })
}

// 获取模型元数据（所有可用模型的定义和GLB文件路径）
function getModelCreate(token) {
    return request({
        url: '/api/model/create',
        method: 'get',
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
        }
    }).then(response => {
        // ==================== 数据接收日志 ====================
        console.log('📦 [API] create 原始响应数据:', response);

        if (response && response.model) {
            console.log(`📊 [API] create 统计: 共 ${response.model.length} 个模型定义`);

            // 按类型分组统计
            const typeGroups = {};
            response.model.forEach(model => {
                const typeName = model.type === 1 ? 'dl(道路)' : model.type === 2 ? 'bs(结构物)' : `其他(${model.type})`;
                if (!typeGroups[typeName]) typeGroups[typeName] = [];
                typeGroups[typeName].push(model);
            });

            Object.entries(typeGroups).forEach(([typeName, models]) => {
                console.log(`  └─ ${typeName}: ${models.length} 个`);
                models.forEach(model => {
                    console.log(`     - id=${model.id}, name=${model.name}, path=${model.path ? '✓' : '✗ 缺失'}`);
                });
            });
        } else {
            console.warn('⚠️ [API] create 响应数据格式异常:', response);
        }
        // ====================================================

        return response;
    })
}

// 设置作业参数（通知后端生成对应模板的布设数据）
function setType(token, params) {
    // ==================== 请求参数日志 ====================
    console.log('📤 [API] setType 请求参数:', params);
    console.log(`  └─ 作业类型: ${params.job_type} (${getJobTypeName(params.job_type)})`);
    console.log(`  └─ 方向: ${params.u_d_type} (${params.u_d_type === 1 ? '上行' : '下行'})`);
    console.log(`  └─ 车道: ${params.road_type} (${getRoadTypeName(params.road_type)})`);
    console.log(`  └─ 车速: ${params.speed} Km/h`);
    console.log(`  └─ 起点: ${formatStakeNumber(params.start)}`);
    console.log(`  └─ 终点: ${formatStakeNumber(params.end)}`);
    console.log(`  └─ 作业长度: ${(params.end - params.start)} 米`);
    // ====================================================

    return request({
        url: '/api/model/setType',
        method: 'post',
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
        },
        data: params
    }).then(response => {
        console.log('✅ [API] setType 响应:', response);
        return response;
    })
}

// 辅助函数：格式化桩号
function formatStakeNumber(meterStr) {
    const meters = parseInt(meterStr);
    const km = Math.floor(meters / 1000);
    const m = meters % 1000;
    return `K${km}+${String(m).padStart(3, '0')}`;
}

// 辅助函数：获取作业类型名称
function getJobTypeName(jobType) {
    const names = {
        1: '高速临时作业',
        2: '高速长期作业',
        3: '高速短期作业',
        4: '高速移动作业',
        5: '国道临时作业',
        6: '国道短期作业',
        7: '国道长期作业'
    };
    return names[jobType] || '未知类型';
}

// 辅助函数：获取车道类型名称
function getRoadTypeName(roadType) {
    const names = {
        0: '国道(不区分车道)',
        1: '超车道',
        2: '行车道'
    };
    return names[roadType] || '未知车道';
}