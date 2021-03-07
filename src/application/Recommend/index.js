import React,{useEffect} from 'react';
import {connect, useSelector, useDispatch} from 'react-redux'
import { forceCheck } from 'react-lazyload'
import { renderRoutes } from 'react-router-config'
import Loading from '../../baseUI/loading/index'
import * as actionTypes from './store/actionCreators';
import {Content} from './style'
import Slider from '../../components/slider'
import RecommendList from '../../components/list'
import Scroll from '../../baseUI/scroll'

function Recommend (props) {
  const dispath = useDispatch()
  const {bannerList, recommendList,enterLoading,songsCount} = useSelector(state=>({
    bannerList: state.recommend.bannerList,
    recommendList: state.recommend.recommendList,
    enterLoading: state.recommend.enterLoading,
    songsCount: state.player.playList.length,
  }))

  useEffect (() => {
    if(!bannerList.length){
      dispath(actionTypes.getBannerList())
    }
    if(!recommendList.length){
      dispath(actionTypes.getRecommendList())
    }
  }, []);

  return (
    <Content play={songsCount}>
      <Scroll className="list" onScroll={forceCheck}>
        <div>
          <Slider bannerList={bannerList}></Slider>
          <RecommendList recommendList={recommendList}></RecommendList>
        </div>
      </Scroll>
      {enterLoading? <Loading></Loading> : null}
      { renderRoutes(props.route.routes) }
    </Content>
  )
}

export default React.memo(Recommend);