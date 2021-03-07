import React, { useEffect } from 'react';
import {connect} from 'react-redux'
import Loading from '../../baseUI/loading'
import { filterIndex } from '../../api/utils';
import {getRankList} from './store'
import Scroll from '../../baseUI/scroll'
import {Container, SongList, List, ListItem} from './style'
import {EnterLoading} from '../Singers/style'
import {renderRoutes} from 'react-router-config'
import { withRouter } from 'react-router-dom'

function Rank (props) {
  const {rankList, loading} = props
  const {getRankListDataDispatch} = props

  let globalStartIndex = filterIndex (rankList);
  let officialList = rankList.slice (0, globalStartIndex);
  let globalList = rankList.slice (globalStartIndex);

  useEffect(()=>{
    getRankListDataDispatch()
  },[])

  const enterDetail = (detail)=>{
    props.history.push(`/rank/${detail.id}`)
  }

  //渲染榜单列表函数，传入 global 变量来区分不同的布局方式
  const renderRankList = (list, global)=>{
    return(
      <List globalRank={global}>
        {
          list.map((item,index)=>{
            return(
              <ListItem onClick={()=>enterDetail(item)} key={item.coverImgId+""+index} tracks={item.tracks} >
                <div className="img_wrapper">
                  <img src={item.coverImgUrl} alt=""/>
                  <div className="decorate"></div>
                  <span className="update_frequecy">{item.updateFrequency}</span>
                </div>
                { renderSongList(item.tracks) }
              </ListItem>
            )
          })
        }
      </List>
    )
  }

  const renderSongList = (list)=>{
    return list.length? (
      <SongList>
        {
          list.map((item, index)=>{
            return <li key={index}>{index+1}. {item.first} - {item.second}</li>
          })
        }
      </SongList>
    ):null
  }
  // 榜单数据未加载出来之前都给隐藏
  let displayStyle = loading ? {"display":"none"}:  {"display": ""};

  const {songsCount} = props
  return (
    <Container play={songsCount}>
      <Scroll>
        <div>
          <h1 className="offical" style={displayStyle}>官方榜</h1>
          {renderRankList(officialList)}
          <h1 className="global" style={displayStyle}>其他榜单</h1>
          {renderRankList(globalList, true)}
          {loading ? <EnterLoading><Loading></Loading></EnterLoading>: null}
        </div>
      </Scroll>
      {renderRoutes(props.route.routes)}
    </Container>
  )
}


const mapStateToProps = (state)=>({
  rankList: state.rank.rankList,
  loading: state.rank.loading,
  songsCount: state.player.playList.length,
})

const mapDispatchToProps = (dispatch)=>{
  return {
    getRankListDataDispatch(){
      dispatch(getRankList())
    }
  }
}


export default connect(mapStateToProps,mapDispatchToProps)(withRouter(React.memo(Rank)));