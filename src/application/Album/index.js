import React, { useRef, useState, useEffect, useCallback, useContext } from 'react'
import { CSSTransition } from 'react-transition-group'
import { connect } from 'react-redux'
import MusicNote from "../../baseUI/music-note/index";
import { Container, TopDesc, Menu, SongList, SongItem } from './style'
import Header from '../../baseUI/header/index'
import Scroll from '../../baseUI/scroll/index'
import { getName, getCount, isEmptyObject } from '../../api/utils'
import style from '../../assets/global-style'
import { getAlbumList, changeEnterLoading } from './store/actionCreators'
import Loading from '../../baseUI/loading'

import { changePlayList, changeCurrentIndex, changeSequecePlayList } from './../../application/Player/store/actionCreators';
function Album(props) {
    const [isMarquee, setIsMarquee] = useState(false)
    const [title, setTitle] = useState("歌单")
    const [showStatus, setShowStatus] = useState(true)
    const id = props.match.params.id
    const { currentAlbum, enterLoading } = props
    const { getAlbumDataDispatch } = props
    const headerEl = useRef()
    const musicNoteRef = useRef();

    const musicAnimation = (x, y) => {
        musicNoteRef.current.startAnimation({ x, y });
    };

    const handleBack = useCallback(() => {
        setShowStatus(false)
    }, [])

    const HEADER_HEIGHT = 45
    const handleScroll = useCallback((pos) => {
        let minScrollY = -HEADER_HEIGHT;
        let percent = Math.abs(pos.y / minScrollY);
        let headerDom = headerEl.current;
        // 滑过顶部的高度开始变化
        if (pos.y < minScrollY) {
            headerDom.style.backgroundColor = style["theme-color"];
            headerDom.style.opacity = Math.min(1, (percent - 1) / 2);
            setTitle(currentAlbum.name);
            setIsMarquee(true);
        } else {
            headerDom.style.backgroundColor = "";
            headerDom.style.opacity = 1;
            setTitle("歌单");
            setIsMarquee(false);
        }
    }, [currentAlbum])

    useEffect(() => {
        getAlbumDataDispatch(id)
    }, [getAlbumDataDispatch, id])

    const {songsCount} = props
    const songs = currentAlbum.tracks
    const { changePlayListDispatch, changeCurrentIndexDispatch, changeSequecePlayListDispatch } = props;
    const selectItem = (e, index) => {
        changePlayListDispatch(songs);
        changeSequecePlayListDispatch(songs);
        changeCurrentIndexDispatch(index);
        musicAnimation(e.nativeEvent.clientX, e.nativeEvent.clientY);
    }
    return (
        <CSSTransition
            in={showStatus}
            timeout={300}
            classNames="fly"
            appear={true}
            unmountOnExit
            onExit={props.history.goBack}
        >
            <Container play={songsCount}>
                <Header ref={headerEl} isMarquee={isMarquee} title={title} handleClick={handleBack}></Header>
                {
                    (!isEmptyObject(currentAlbum) && !enterLoading) ? (
                        <Scroll bounceTop={false} onScroll={handleScroll}>
                            <div>
                                <TopDesc background={currentAlbum.coverImgUrl}>
                                    <div className="background">
                                        <div className="filter"></div>
                                    </div>
                                    <div className="img_wrapper">
                                        <div className="decorate"></div>
                                        <img src={currentAlbum.coverImgUrl} alt="" />
                                        <div className="play_count">
                                            <i className="iconfont play">&#xe885;</i>
                                            <span className="count">{Math.floor(currentAlbum.subscribedCount / 1000) / 10} 万 </span>
                                        </div>
                                    </div>
                                    <div className="desc_wrapper">
                                        <div className="title">{currentAlbum.name}</div>
                                        <div className="person">
                                            <div className="avatar">
                                                <img src={currentAlbum.creator.avatarUrl} alt="" />
                                            </div>
                                            <div className="name">{currentAlbum.creator.nickname}</div>
                                        </div>
                                    </div>
                                </TopDesc>
                                <Menu>
                                    <div>
                                        <i className="iconfont">&#xe6ad;</i>
                                        评论
                                    </div>
                                        <div>
                                        <i className="iconfont">&#xe86f;</i>
                                        点赞
                                    </div>
                                        <div>
                                        <i className="iconfont">&#xe62d;</i>
                                        收藏
                                    </div>
                                        <div>
                                        <i className="iconfont">&#xe606;</i>
                                        更多
                                    </div>
                                </Menu>
                                <SongList
                                    songs={currentAlbum.tracks}
                                    collectCount={currentAlbum.subscribedCount}
                                    showCollect={true}
                                    // showBackground={true}
                                    musicAnimation={musicAnimation}
                                >
                                    <div className="first_line">
                                        <div className="play_all" onClick={(e) => selectItem(e, 0)}>
                                            <i className="iconfont">&#xe6e3;</i>
                                            <span > 播放全部 <span className="sum">(共 {currentAlbum.tracks.length} 首)</span></span>
                                        </div>
                                        <div className="add_list">
                                            <i className="iconfont">&#xe62d;</i>
                                            <span > 收藏 ({getCount(currentAlbum.subscribedCount)})</span>
                                        </div>
                                    </div>
                                    <SongItem>
                                        {
                                            currentAlbum.tracks.map((item, index) => {
                                                return (
                                                    <li key={index} onClick={(e) => selectItem(e, index)}>
                                                        <span className="index">{index + 1}</span>
                                                        <div className="info">
                                                            <span>{item.name}</span>
                                                            <span>
                                                                {getName(item.ar)} - {item.al.name}
                                                            </span>
                                                        </div>
                                                    </li>
                                                )
                                            })
                                        }
                                    </SongItem>
                                </SongList>
                            </div>
                        </Scroll>
                    ) : null
                }
                {enterLoading ? <Loading></Loading> : null}
                <MusicNote ref={musicNoteRef}></MusicNote>
            </Container>
        </CSSTransition>
    )
}

const mapStateToProps = (state) => ({
    currentAlbum: state.album.currentAlbum,
    enterLoading: state.album.enterLoading,
    songsCount: state.player.playList.length,
})

const mapDispatchToProps = (dispatch) => {
    return {
        getAlbumDataDispatch(id) {
            dispatch(changeEnterLoading(true))
            dispatch(getAlbumList(id))
        },
        changePlayListDispatch(data){
            dispatch(changePlayList(data));
        },
        changeCurrentIndexDispatch(data) {
            dispatch(changeCurrentIndex(data));
        },
        changeSequecePlayListDispatch(data) {
            dispatch(changeSequecePlayList(data))
        }
    }
}


export default connect(mapStateToProps, mapDispatchToProps)(React.memo(Album))