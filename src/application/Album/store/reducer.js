import * as actionTypes from './constants';
import {produce} from 'immer'
const defaultState = {
  currentAlbum: {},
  enterLoading: false,
}

const reducer = (state=defaultState, action)=>produce(state, draft=>{
    switch(action.type){
        case actionTypes.CHANGE_CURRENT_ALBUM:
            draft.currentAlbum = action.data
            break
        case actionTypes.CHANGE_ENTER_LOADING:
            draft.enterLoading = action.data
    }
})

export default reducer