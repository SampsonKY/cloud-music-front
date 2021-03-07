import React, {useRef, useState, useCallback } from 'react'
import {connect} from "react-redux"
import {PlayListWrapper, ScrollWrapper, ListHeader, ListContent} from './style'
import { CSSTransition } from 'react-transition-group';
import { prefixStyle, getName, findIndex, shuffle } from './../../../api/utils';
import {changeShowPlayList, changeCurrentIndex, changePlayMode, changePlayList, changeSequecePlayList, changeCurrentSong, changePlayingState} from '../store/actionCreators'
import { playMode } from "../../../api/config";
import Scroll from '../../../baseUI/scroll';
import {deleteSong} from '../store/actionCreators'
import Confirm from './../../../baseUI/confirm/index';

function PlayList(props){
    const playListRef = useRef()
    const listWrapperRef = useRef()
    const confirmRef = useRef()

    const [isShow, setIsShow] = useState(false)

    // 从props中导入数据
    const {
        currentIndex,
        currentSong,
        showPlayList,//展示列表
        playList,
        mode,
        sequencePlayList
      } = props;
    const {
        togglePlayListDispatch,//是否展示列表
        changeCurrentIndexDispatch,
        changePlayListDispatch,
        changeModeDispatch,
        deleteSongDispatch,//删除歌曲
    } = props;

    /*
        * 动画钩子里的回调函数
    */
    const transform = prefixStyle("transform") //加上前缀
    
    const onEnterCB = useCallback(()=>{
        //让列表显示
        setIsShow(true)
        //最开始是隐藏在下面
        listWrapperRef.current.style[transform] = `translate3d(0, 100%, 0)`
    }, [transform])

    const onEnteringCB = useCallback(()=>{
        // 让列表展现
        listWrapperRef.current.style["transition"] = "all 0.3s"
        listWrapperRef.current.style[transform] = `translate3d(0, 0, 0)`;
    },[transform])

    const onExitingCB = useCallback(()=>{
        listWrapperRef.current.style["transition"] = "all 0.3s";
        listWrapperRef.current.style[transform] = `translate3d(0, 100%, 0)`;
    }, [transform]);
      
    const onExitedCB = useCallback (() => {
        setIsShow(false);
        listWrapperRef.current.style[transform] = `translate3d(0, 100%, 0)`;
    }, [transform]);

    /**
     * 往浮层添加列表对应的内容和功能
     */

    //1. 从 redux 中拿到数据 : mapStateToProps中

    //2. 让列表组件对接这些数据，渲染整个列表,render
    
    //3. 一些 UI 相关的逻辑封装

    //3.1 标识正在播放的歌曲
    const getCurrentIcon = (item)=> {
        //是不是当前正在播放的歌曲
        const current = currentSong.id === item.id
        const className = current ? 'icon-play' : ''
        const content = current ? '&#xe6e3;': '';
        return (
            <i className={`current iconfont ${className}`} dangerouslySetInnerHTML={{__html:content}}></i>
        )
    }
    
    //3.2 获取播放模式
    const getPlayMode = ()=>{
        let content, text
        if(mode === playMode.sequence){
            content = "&#xe625;"
            text="顺序播放"
        } else if(mode === playMode.loop){
            content = "&#xe653;"
            text = "单曲循环"
        } else {
            content = "&#xe61b;"
            text = "随机播放"
        }
        return (
            <div>
                <i className="iconfont" onClick={(e)=>changeMode(e)} dangerouslySetInnerHTML={{__html: content}}></i>
                <span className="text" onClick={(e)=>changeMode(e)}>{text}</span>
            </div>
        )
    }

    //3.3 切换播放模式
    const changeMode = (e) =>{
        let newMode = (mode+1)%3
        if(newMode === 0){
            //顺序模式
            changePlayListDispatch(sequencePlayList)
            let index = findIndex(currentSong, sequencePlayList)
            changeCurrentIndexDispatch(index)
        } else if(newMode === 1){
            //单曲循环
            changePlayListDispatch(sequencePlayList)
        } else if(newMode === 2){
            //随机播放
            let newList = shuffle(sequencePlayList)
            let index = findIndex(currentSong, newList)
            changePlayListDispatch(newList)
            changeCurrentIndexDispatch(index)
        }
        changeModeDispatch(newMode)
    }

    //4. 业务逻辑

    //4.1 点击切歌实现
    const handleChangeCurrentIndex = (index)=>{
        if(currentIndex === index) return
        changeCurrentIndexDispatch(index)
    }

    //4.2 删除一首歌，删除歌曲需要对歌曲列表进行操作，在reducer中处理
    const handleDeleteSong = (e, song) =>{
        e.stopPropagation()
        deleteSongDispatch(song)
    }

    //4.3 删除整个播放列表
    //4.3.1 通常删除整个文件需要慎重考虑，所以先在baseUI封装一个确认框组件，用来弹出提醒
    //4.3.2 点击删除显示Confirm组件
    const handleShowClear = ()=>{
        confirmRef.current.show()
    }
    //4.3.3 编写Confirm组件回调函数 handleConfirmClear
    const { clearDispatch } = props;
    const { clearPreSong } = props //清空PreSong
    const handleConfirmClear = ()=>{
        clearDispatch() //交给它处理
        //清空后回到歌曲列表点相同的一首曲子播放器没有出现，因为state中的preSong没有重置，直接return了
        clearPreSong()
    }

    //5. 修饰：下滑关闭及反弹效果（下滑小段距离时会有反弹，下滑超过了一定阈值就会关闭浮层。）
    // 5.0 先初始化一些变量
    const [startY, setStartY] = useState(0) //touchStart 后记录 y 值
    const [initialed, setInitialed] = useState(0)//touchStart事件是否已经被触发
    const [distance, setDistance] = useState(0)//用户下滑的距离
    // 5.1 绑定事件
    const handleTouchStart = (e) => {
        if(!canTouch || initialed) return
        listWrapperRef.current.style["transition"] = ""
        setStartY(e.nativeEvent.touches[0].pageY)//记录y值
        setInitialed(true)
    };
    const handleTouchMove = (e) => {
        if(!canTouch || !initialed) return
        let distance = e.nativeEvent.touches[0].pageY-startY
        if(distance<0) return
        setDistance(distance) //记录下滑距离
        listWrapperRef.current.style[transform] = `translate3d(0, ${distance}px, 0)`
    };
    const handleTouchEnd = (e) => {
        setInitialed(false)
        // 在这里设置阀值为150px
        console.log(distance)
        if(distance >= 150){
            // 大于等于 150px 则关闭 PlayList
            togglePlayListDispatch(false)
            setDistance(0)
        } else{
            // 否则反弹回去
            listWrapperRef.current.style["transition"] = "all 0.3s"
            listWrapperRef.current.style[transform] = `translate3d(0,0,0)`
        }
    };
    
    // 5.2 对于 Scroll 组件
    const [canTouch, setCanTouch] = useState(true)
    const listContentRef = useRef()
    const handleScroll = (pos) =>{
        // 只有当内容偏移量为 0 的时候才能下滑关闭 PlayList。否则一边内容在移动，一边列表在移动，出现 bug
        let state = pos.y === 0
        setCanTouch(state)
    }

    return (
        <CSSTransition
            in={showPlayList}
            timeout={300}
            classNames="list-fade"
            onEnter={onEnterCB}
            onEntering={onEnteringCB}
            onExiting={onExitingCB}
            onExited={onExitedCB}
        >
            <PlayListWrapper
                ref={playListRef}
                style={isShow===true ? {display: "block"} : {display: "none"}}
                onClick={()=> togglePlayListDispatch(false)}
            >
                <div 
                    className="list-wrapper" 
                    ref={listWrapperRef}
                    onClick={e=>e.stopPropagation()}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd = {handleTouchEnd}
                >
                    <ListHeader>
                        <h1 className="title">
                            { getPlayMode() }
                            <span className="iconfont clear" onClick={handleShowClear} >&#xe63d;</span>
                        </h1>
                    </ListHeader>
                    <ScrollWrapper>
                        <Scroll
                            ref={listContentRef}
                            onScroll={pos=>handleScroll(pos)}
                            bounceTop={false}
                        >
                            <ListContent>
                                {
                                    playList.map((item, index)=>{
                                        return (
                                            <li className="item" key={item.id} onClick={()=> handleChangeCurrentIndex(index)}>
                                                {getCurrentIcon(item)}
                                                <span className="text">{item.name} - {getName(item.ar)}</span>
                                                <span className="like">
                                                    <i className="iconfont">&#xe601;</i>
                                                </span>
                                                <span className="delete" onClick={(e)=> handleDeleteSong(e, item)}>
                                                    <i className="iconfont">&#xe63d;</i>
                                                </span>
                                            </li>
                                        )
                                    })
                                }
                            </ListContent>
                        </Scroll>
                    </ScrollWrapper>
                    <Confirm
                        ref={confirmRef}
                        text={"是否全部删除？"}
                        cancelBtnText={"取消"}
                        confirmBtnText={"确认"}
                        handleConfirm={handleConfirmClear}
                    />
                </div>
            </PlayListWrapper>
        </CSSTransition>
    )
}

// 映射 Redux 全局的 state 到组件的 props 上
const mapStateToProps = (state) => ({
    showPlayList: state.player.showPlayList,
    // 从redux中获取数据，显示在浮层中
    currentIndex: state.player.currentIndex,
    currentSong: state.player.currentSong,
    playList: state.player.playList,
    sequencePlayList: state.player.sequencePlayList,
    mode: state.player.mode
});

// 映射 dispatch 到 props 上
const mapDispatchToProps = (dispatch) => {
    return {
      togglePlayListDispatch(data) {
        dispatch(changeShowPlayList(data));
      },
      //修改当前歌曲在列表中的 index， 即切歌
      changeCurrentIndexDispatch(data){
          dispatch(changeCurrentIndex(data))
      },
      //修改当前的播放模式
      changeModeDispatch(data){
          dispatch(changePlayMode(data))
      },
      //修改当前的歌曲列表
      changePlayListDispatch(data){
          dispatch(changePlayList(data))
      },
      //删除歌曲
      deleteSongDispatch(data){
          dispatch(deleteSong(data))
      },
      //删除整个列表
      clearDispatch(){
          //1. 清除两个列表
          dispatch(changePlayList([]))
          dispatch(changeSequecePlayList([]))
          //2. 初始 currentIndex
          dispatch(changeCurrentIndex(-1))
          //3. 关闭 PlayList 的显示
          dispatch(changeShowPlayList(false))
          //4. 将当前歌曲置空
          dispatch(changeCurrentSong({}))
          //5. 重置播放状态
          dispatch(changePlayingState(false))
      }
    }
};
  
  // 将 ui 组件包装成容器组件
  export default connect(mapStateToProps, mapDispatchToProps)(React.memo(PlayList));