import React, {useState, useEffect, useCallback} from 'react'
import {connect} from 'react-redux'
import { CSSTransition } from 'react-transition-group'
import { Container, ShortcutWrapper, HotKey, List, ListItem, SongItem } from './style'
import SearchBox from './../../baseUI/search-box/index';
import Scroll from '../../baseUI/scroll';
import LazyLoad, {forceCheck} from 'react-lazyload'
import Loading from './../../baseUI/loading/index';
import { getHotKeyWords, changeEnterLoading, getSuggestList } from './store/actionCreators';
import {getSongDetail} from '../Player/store/actionCreators'
import { getName } from '../../api/utils';

function Search(props){
    //控制动画
    const [show, setShow] = useState(false)
    const [query, setQuery] = useState (''); //搜索词

    const searchBack = useCallback(()=>{
        setShow(false)
    }, [])

    //处理逻辑
    const {
        hotList, //热门搜索列表
        enterLoading, 
        suggestList, 
        songsCount, 
        songsList
    } = props;
      
    const {
        getHotKeyWordsDispatch,
        changeEnterLoadingDispatch,
        getSuggestListDispatch,
        getSongDetailDispatch
    } = props;

    //0. 当组件初次渲染时，发送 ajax 请求，获取到热门列表
    useEffect(()=>{
        setShow(true)
        // 用了 redux 缓存，不再赘述
        if (!hotList.length)
            getHotKeyWordsDispatch();
    },[])

    //1. 当搜索框为空，展示热门搜索列表
    const renderHotKey = ()=>{
        let list = hotList
        return (
            <ul>
                {
                    list.map(item=>{
                        return (
                            <li className="item" key={item.first} onClick={()=>{setQuery(item.first)}}>
                                <span>{item.first}</span>
                            </li>
                        )
                    })
                }
            </ul>
        )
    }

    //2. 当搜索框有内容时，发送 Ajax 请求，显示搜索结果
    const handleQuery = (q)=>{
        setQuery(q)
        if(!q) return 
        changeEnterLoadingDispatch(true)
        getSuggestListDispatch(q)
    }

    //2.1 渲染歌手
    const renderSingers = ()=>{
        let singers = suggestList.artists
        if(!singers || !singers.length) return
        return(
            <List>
                <h1 className="title"> 相关歌手 </h1>
                {
                    singers.map((item, index)=>{
                        return (
                            <ListItem key={item.id+""+index} onClick={()=> props.history.push(`/singers/${item.id}`)}>
                                <div className="img_wrapper">
                                    <LazyLoad placeholder={<img width="100%" height="100%" src={require('./singer.png')} alt="singer"/>}>
                                        <img src={item.picUrl} width="100%" height="100%" alt="music"/>
                                    </LazyLoad>
                                </div>
                                <span className="name"> 歌手: {item.name}</span>
                            </ListItem>
                        )
                    })
                }
            </List>
        )
    }
    //2.2 渲染歌单
    const renderAlbum = ()=>{
        let albums = suggestList.albums
        console.log(albums)
        if(!albums || !albums.length) return
        return (
            <List>
                <h1 className="title"> 相关歌单 </h1>
                {
                    albums.map(((item, index)=>{
                        return (
                            <ListItem key={item.id + "" +index} onClick={()=>props.history.push(`/album/${item.id}`)}>
                                <div className="img_wrapper">
                                    <img src={require('./music.png')} width="100%" height="100%" alt="music"/>
                                </div>
                                <span className="name">歌单：{item.name}</span>
                            </ListItem>
                        )
                    }))
                }
            </List>
        )
    }
    //2.3 渲染单曲列表
    const renderSongs = ()=>{
        return (
            <SongItem style={{paddingLeft: "20px"}}>
                {
                    songsList.map((item)=>{
                        return (
                            <li key={item.id} onClick={(e) => selectItem(e, item.id)}>
                                <div className="info">
                                    <span>{item.name}</span>
                                    <span>
                                        { getName(item.artists) } - {item.album.name}
                                    </span>
                                </div>  
                            </li>
                        )
                    })
                }
            </SongItem>
        )
    }

    //3. 点击结果，进入到各自的详情页
    //对于歌手页和歌单页只要传id跳转就行
    //对于歌曲列表项，点击则播放。首先需要将选中的单曲加入到播放列表中。
    const selectItem = (e, id)=>{
        getSongDetailDispatch(id)
    }

    return(
        <CSSTransition
            in={show}
            timeout={300}
            appear={true}
            classNames="fly"
            unmountOnExit
            onExited={() => props.history.goBack()}
        >
            <Container play={songsCount}>
                <div className="search_box_wrapper">
                    <SearchBox back={searchBack} newQuery={query} handleQuery={handleQuery}></SearchBox>
                </div>

                {/* 热门搜索列表 */}
                <ShortcutWrapper show={!query}>
                    <Scroll>
                        <div>
                            <HotKey>
                                <h1 className="title"> 热门搜索 </h1>
                                {renderHotKey()}
                            </HotKey>
                        </div>
                    </Scroll>
                </ShortcutWrapper>

                {/* 搜索结果 */}
                <ShortcutWrapper show={query}>
                    <Scroll onScorll={forceCheck}>
                        <div>
                            {renderSingers()}
                            {renderAlbum()}
                            {renderSongs()}
                        </div>
                    </Scroll>
                </ShortcutWrapper>

                { enterLoading? <Loading></Loading> : null }
            </Container>
        </CSSTransition>
    )
}

const mapStateToProps = state =>({
    hotList: state.search.hotList,
    enterLoading: state.search.enterLoading,
    suggestList: state.search.suggestList,
    songsCount: state.player.playList.size,
    songsList: state.search.songsList
})

const mapDispatchToProps = dispatch =>{
    return {
        getHotKeyWordsDispatch() {
            dispatch(getHotKeyWords())
        },
        changeEnterLoadingDispatch(data) {
            dispatch(changeEnterLoading(data))
        },
        getSuggestListDispatch(data) {
            dispatch(getSuggestList(data))
        },
        getSongDetailDispatch(id) {
            dispatch(getSongDetail(id));
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(React.memo(Search));