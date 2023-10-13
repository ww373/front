import request from '@/utils/request'

export default {
    getModelCreateDl,
    getModelCreate,
};

// 获取数据
function getModelCreateDl() {
    return request({
        url: '/api/model/createDl',
        method: 'get'
    })
}

// 获取数据
function getModelCreate() {
    return request({
        url: '/api/model/create',
        method: 'get'
    })
}