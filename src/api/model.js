import request from '@/utils/request'

export default {
    getModelCreateDl,
    getModelCreate,
};

// 获取数据
function getModelCreateDl(token) {
    return request({
        url: '/api/model/createDl',
        method: 'get',
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
        }
    })
}

// 获取数据
function getModelCreate(token) {
    return request({
        url: '/api/model/create',
        method: 'get',
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
        }
    })
}