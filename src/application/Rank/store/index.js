import { getRankListRequest } from '../../../api/request'
import {produce} from 'immer'
//constants
export const CHANGE_RANK_LIST = 'rank/CHANGE_RANGK_LIST'
export const CHANGE_LOADGIN = 'rank/CHANGE_LOADING'

// actionCreators

const changeRankList = (data)=>({
    type: CHANGE_RANK_LIST,
    data: data
})

const changeLoading = (data)=>({
    type:CHANGE_LOADGIN,
    data
})

export const getRankList = ()=>{
    return dispatch=>{
        getRankListRequest().then(data=>{
            let list = data && data.list
            dispatch(changeRankList(list))
            dispatch(changeLoading(false)) 
        })
    }
}

//reducer
const defaultState = {
    rankList: [],
    loading: true
}

const reducer = (state=defaultState, action)=>produce(state,draft=>{
    switch (action.type) {
        case CHANGE_RANK_LIST:
            draft.rankList = action.data
            break;
        case CHANGE_LOADGIN:
            draft.loading = action.data
        default:
            break;
    }
})

export {reducer}