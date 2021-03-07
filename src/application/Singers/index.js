import React, { useEffect, useContext } from 'react';
import {connect} from 'react-redux'
import Horizen from '../../baseUI/horizen-item'
import { categoryTypes, alphaTypes } from '../../api/config'
import {NavContainer, ListContainer, ListItem, List} from './style'
import Scroll from '../../baseUI/scroll';
import { getHotSingerList, getSingerList, changePullUpLoading,changeEnterLoading,changePullDownLoading,changePageCount, refreshMoreSingerList,refreshMoreHotSingerList } from './store/actionCreators';
import  LazyLoad,{forceCheck } from 'react-lazyload';
import { renderRoutes } from 'react-router-config'
import Loading from '../../baseUI/loading'
import { CategoryDataContext } from './data';
import { CHANGE_ALPHA, CHANGE_CATEGORY } from './store/constants';
import {withRouter} from 'react-router-dom'

function Singer (props) {
  // let [category, setCategory] = useState('')
  // let [alpha, setAlpha] = useState('')
  const {data, dispatch} = useContext(CategoryDataContext)
  //拿到category 和 alpha的值
  const {category, alpha} = data

  const { singerList, enterLoading, pullDownLoading, pullUpLoading, pageCount } = props
  const {getHotSingerDispatch, updateDispatch, pullUpRefreshDispatch, pullDownRefreshDispatch} = props

  const {songsCount} = props
  let handleUpateAlpha = (val)=>{
    // setAlpha(val)
    dispatch({type: CHANGE_ALPHA, data: val})
    updateDispatch(category, val)
  }
  let handleUpateCategory = (val)=>{
    // setCategory(val)
    dispatch({type: CHANGE_CATEGORY, data: val})
    updateDispatch(val, alpha)
  }

  let handlePullUp = ()=>{
    pullUpRefreshDispatch(category, alpha, category==='', pageCount)
  }

  let handlePullDown = ()=>{
    pullDownRefreshDispatch(category, alpha)
  }

  useEffect(()=>{
    if(!singerList.length){
      getHotSingerDispatch()
    }
  },[])

  const enterDetail = (id)=>{
    props.history.push(`/singers/${id}`)
  }

  const renderSingerList = ()=>{
    return (
      <List>
        {
          singerList.map((item, index)=>{
            return (
              <ListItem onClick={()=>enterDetail(item.id)} key={item.accountId+""+index}>
                <div className="img_wrapper">
                  <LazyLoad placeholder={<img width="100%" height="100%" src={require('./singer.png')} alt="music"/>}>
                    <img src={`${item.picUrl}?param=300x300`} width="100%" height="100%" alt="music"/>
                  </LazyLoad>
                </div>
                <span className="name">{item.name}</span>
              </ListItem>
            )
          })
        }
      </List>
    )
  }

  return (
    <>
      <NavContainer>
        <Horizen 
          list={categoryTypes} 
          title={"分类（默认热门）："}
          handleClick={handleUpateCategory}
          oldVal={category}
        ></Horizen>
        <Horizen 
          list={alphaTypes} 
          title={"首字母:"}
          handleClick={handleUpateAlpha}
          oldVal={alpha}
        ></Horizen>
      </NavContainer>
      <ListContainer play={songsCount}>
        <Scroll
          pullUp={handlePullUp}
          pullDown={handlePullDown}
          pullUpLoading={pullUpLoading}
          pullDownLoading = {pullDownLoading}
          onScroll={forceCheck}
        >
          {renderSingerList()}
        </Scroll>
        <Loading show={enterLoading}></Loading>
      </ListContainer>
      { renderRoutes(props.route.routes)}
    </>
  )
}

const mapStateToProps = (state) => ({
  singerList: state.singers.singerList,
  enterLoading: state.singers.enterLoading,
  pullUpLoading: state.singers.pullUpLoading,
  pullDownLoading: state.singers.pullDownLoading,
  pageCount: state.singers.pageCount,
  songsCount: state.player.playList.length,
});
const mapDispatchToProps = (dispatch) => {
  return {
    getHotSingerDispatch() {
      dispatch(getHotSingerList());
    },
    updateDispatch(category, alpha) {
      dispatch(changePageCount(0));
      dispatch(changeEnterLoading(true));
      dispatch(getSingerList(category%10, Math.floor(category/10), alpha));
    },
    // 滑到最底部刷新部分的处理
    pullUpRefreshDispatch(category, alpha, hot, count) {
      dispatch(changePullUpLoading(true));
      dispatch(changePageCount(count+50));
      if(hot){
        dispatch(refreshMoreHotSingerList());
      } else {
        dispatch(refreshMoreSingerList(category%10, Math.floor(category/10), alpha));
      }
    },
    //顶部下拉刷新
    pullDownRefreshDispatch(category, alpha) {
      dispatch(changePullDownLoading(true));
      dispatch(changePageCount(0));
      if(category === '' && alpha === ''){
        dispatch(getHotSingerList());
      } else {
        dispatch(getSingerList(category%10, Math.floor(category/10), alpha));
      }
    }
  }
};   

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(React.memo(Singer)));