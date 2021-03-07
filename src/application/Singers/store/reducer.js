import {produce} from 'immer'
import * as actionTypes from './constants'

const defaultState = {
    singerList: [],
    enterLoading: true,  //控制经常Loading
    pullUpLoading: false,  //控制上拉加载动画
    pullDownLoading: false, //控制下拉加载动画
    pageCount: 0     //当前页数，将实现分页功能
}

const reducer = (state=defaultState, action)=>produce(state, draft=>{
    switch(action.type){
        case actionTypes.CHANGE_SINGER_LIST:
            draft.singerList = action.data
            break
        case actionTypes.CHANGE_PAGE_COUNT:
            draft.pageCount = action.data
            break
        case actionTypes.CHANGE_ENTER_LOADING:
            draft.enterLoading = action.data
            break
        case actionTypes.CHANGE_PULLUP_LOADING:
            draft.pullUpLoading = action.data
            break
        case actionTypes.CHANGE_PULLDOWN_LOADING:
            draft.pullDownLoading = action.data
            break
        default: 
            break
    }
})

export default reducer