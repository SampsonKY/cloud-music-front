//用来封装不同的网络请求

import {axiosInstance} from './config'

export const getBannerRequest = ()=>{
    return axiosInstance.get('/banner')
}

export const getRecommendListRequest = ()=>{
    return axiosInstance.get('/personalized')
}

export const getHotSingerListRequest = (count) =>{
    return axiosInstance.get(`/top/artists?offset=${count}`);
}

export const getSingerListRequest = (type, area, alpha, count)=>{
    return axiosInstance.get(`/artist/list?type=${type}&area=${area}&initial=${alpha.toLowerCase()}&offset=${count}`)
}

export const getRankListRequest = ()=>{
    return axiosInstance.get(`/toplist/detail`)
}

export const getAlbumDetailRequest = id =>{
    return axiosInstance.get (`/playlist/detail?id=${id}`);
}
export const getSingerInfoRequest = id => {
    return axiosInstance.get(`/artists?id=${id}`);
};

/*
  *  搜索模块相关
*/
//1. 搜索热词
export const getHotKeyWordsRequest = () => {
    return axiosInstance.get (`/search/hot`);
};
//2. 根据输入内容搜索
export const getSuggestListRequest = query => {
    return axiosInstance.get (`/search/suggest?keywords=${query}`);
};
//3.根据关键词搜索
export const getResultSongsListRequest = query => {
  return axiosInstance.get (`/search?keywords=${query}`);
};
//4.根据歌曲列表某一项id返回完整歌曲
export const getSongDetailRequest = id => {
    return axiosInstance.get(`/song/detail?ids=${id}`);
};

/**
 * 获取歌词
 */
export const getLyricRequest = id => {
    return axiosInstance.get (`/lyric?id=${id}`);
};