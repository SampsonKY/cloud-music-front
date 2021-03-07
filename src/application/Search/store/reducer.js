import {produce} from 'immer'
import * as actionTypes from './constants'

const defaultState = {
    hotList: [], // 热门关键词列表
    suggestList: {},// 列表，包括歌单和歌手
    songsList: [],// 歌曲列表
    enterLoading: false
}

export default (state=defaultState, action)=>produce(state,draft=>{
    switch (action.type) {
        case actionTypes.SET_HOT_KEYWRODS:
            draft.hotList = action.data
            break;
        case actionTypes.SET_SUGGEST_LIST:
            draft.suggestList = action.data
            break
        case actionTypes.SET_RESULT_SONGS_LIST:
            draft.songsList = action.data
            break
        case actionTypes.SET_ENTER_LOADING:
            draft.enterLoading = action.data
            break
        default:
            break;
    }
})
