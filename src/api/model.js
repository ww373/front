import request from '@/utils/request'

export default {
    getModelCreateDl,
    getModelCreate,
};

// 获取数据
function getModelCreateDl(token) {
    return request({
        baseURL: "http://39.104.48.174:8088",
        url: '/api/model/createDl',
        method: 'get',
        Headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
        }
    })
}

// 获取数据
function getModelCreate(token) {
    return request({
        baseURL: "http://39.104.48.174:8088",
        url: '/api/model/create',
        method: 'get',
        Headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
        }
    })
}