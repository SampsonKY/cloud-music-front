import React, {createContext, useReducer} from 'react'
import { produce } from 'immer'

//context
export const CategoryDataContext = createContext({})

//相当于之前的constants
export const CHANGE_CATEGORY = 'singer/CHANGE_CATEGORY'
export const CHANGE_ALPHA = 'singer/CHANGE_ALPHA'

//reducer函数
const reducer = (state, action)=>produce(state, draft=>{
    switch (action.type) {
        case CHANGE_CATEGORY:
            draft.category = action.data
            break
        case CHANGE_ALPHA:
            draft.alpha = action.data
            break;
        default:
            break;
    }
})

//Provider 组件
export const Data = props =>{
    //useReducer 的第二个参数传入初始值
    const [data, dispatch] = useReducer(reducer,{
        category: '',
        alpha: ''
    })
    return(
        <CategoryDataContext.Provider value={{data, dispatch}}>
            {props.children}
        </CategoryDataContext.Provider>
    )
}