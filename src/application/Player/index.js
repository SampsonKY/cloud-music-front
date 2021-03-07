import React, { useRef, useState, useEffect } from "react";
import { connect } from "react-redux";
import {
  changePlayingState,
  changeShowPlayList,
  changeCurrentIndex,
  changeCurrentSong,
  changePlayList,
  changePlayMode,
  changeFullScreen
} from "./store/actionCreators";
import MiniPlayer from './miniPlayer';
import NormalPlayer from './normalPlayer';
import PlayList from './play-list'
import { getSongUrl, isEmptyObject, shuffle, findIndex } from "../../api/utils";
import { playMode } from '../../api/config';
import Toast from "./../../baseUI/toast/index";
import { getLyricRequest } from '../../api/request'
import Lyric from './../../api/lyric-parser';
import { changeSpeed } from './store/actionCreators';


function Player(props) {
  //倍速
  const { speed } = props;
  const { changeSpeedDispatch } = props;

  //目前播放时间
  const [currentTime, setCurrentTime] = useState(0);
  //歌曲总时长
  const [duration, setDuration] = useState(0);
  //歌曲播放进度
  let percent = isNaN(currentTime / duration) ? 0 : currentTime / duration;
  //记录当前的歌曲，以便于下次重新渲染时比对是否是同一首歌
  const [preSong, setPreSong] = useState({});
  const [modeText, setModeText] = useState("");
  const [songReady, setSongReady] = useState(true);

  const [currentPlayingLyric, setPlayingLyric] = useState("");//即时歌词
  const currentLyric = useRef() //歌词
  const currentLineNum = useRef(0) //记录歌词当前行数

  const audioRef = useRef();
  const toastRef = useRef();

  const {
    playing,
    currentSong,
    currentIndex,
    playList,
    mode,//播放模式
    sequencePlayList,//顺序列表
    fullScreen
  } = props;
  
  const {
    togglePlayingDispatch,
    changeCurrentIndexDispatch,
    changeCurrentDispatch,
    changePlayListDispatch,//改变playList
    changeModeDispatch,//改变mode
    toggleFullScreenDispatch,
    togglePlayListDispatch,//弹出播放列表
  } = props;
  
  
  useEffect(() => {
    if (
      !playList.length ||
      currentIndex === -1 ||
      !playList[currentIndex] ||
      playList[currentIndex].id === preSong.id ||
      !songReady
    )
      return;
    let current = playList[currentIndex];
    setPreSong(current);
    setSongReady(false);
    changeCurrentDispatch(current);//赋值currentSong
    audioRef.current.src = getSongUrl(current.id);
    audioRef.current.playbackRate = speed;
    setTimeout(() => {
      audioRef.current.play().then(() => {
        setSongReady(true);
      });
    });
    togglePlayingDispatch(true);//播放状态
    getLyric(current.id)
    setCurrentTime(0);//从头开始播放
    setDuration((current.dt / 1000) | 0);//时长
  }, [playList, currentIndex]);

  useEffect(() => {
    playing ? audioRef.current.play() : audioRef.current.pause();
  }, [playing]);

  //播放速度
  const clickSpeed = (newSpeed) => {
    changeSpeedDispatch (newSpeed);
    //playbackRate 为歌词播放的速度，可修改
    audioRef.current.playbackRate = newSpeed;
    // 别忘了同步歌词
    currentLyric.current.changeSpeed(newSpeed);
    currentLyric.current.seek(currentTime*1000);
  }

  const clickPlaying = (e, state) => {
    e.stopPropagation();
    togglePlayingDispatch(state);
    if (currentLyric.current) {
      currentLyric.current.togglePlay(currentTime*1000);
    }
  };

  const updateTime = e => {
    setCurrentTime(e.target.currentTime);
  };

  const onProgressChange = curPercent => {
    const newTime = curPercent * duration;
    setCurrentTime(newTime);
    audioRef.current.currentTime = newTime;
    if (!playing) {
      togglePlayingDispatch(true);
    }
    if (currentLyric.current) {
      currentLyric.current.seek(newTime * 1000);
    }
  };
  //一首歌循环
  const handleLoop = () => {
    audioRef.current.currentTime = 0;
    changePlayingState(true);
    audioRef.current.play();
  };

  const handlePrev = () => {
    //播放列表只有一首歌时单曲循环
    if (playList.length === 1) {
      handleLoop();
      return;
    }
    let index = currentIndex - 1;
    if (index < 0) index = playList.length - 1;
    if (!playing) togglePlayingDispatch(true);
    changeCurrentIndexDispatch(index);
  };

  const changeMode = () => {
    let newMode = (mode + 1) % 3;
    if (newMode === 0) {
      //顺序模式
      changePlayListDispatch(sequencePlayList);
      let index = findIndex(currentSong, sequencePlayList);
      changeCurrentIndexDispatch(index);
      setModeText("顺序循环");
    } else if (newMode === 1) {
      //单曲循环
      changePlayListDispatch(sequencePlayList);
      setModeText("单曲循环");
    } else if (newMode === 2) {
      //随机播放
      let newList = shuffle(sequencePlayList);
      let index = findIndex(currentSong, newList);
      changePlayListDispatch(newList);
      changeCurrentIndexDispatch(index);
      setModeText("随机播放");
    }
    changeModeDispatch(newMode);
    toastRef.current.show();
  };

  const handleNext = () => {
    //播放列表只有一首歌时单曲循环
    if (playList.length === 1) {
      handleLoop();
      return;
    }
    let index = currentIndex + 1;
    if (index === playList.length) index = 0;
    if (!playing) togglePlayingDispatch(true);
    changeCurrentIndexDispatch(index);
  };

  const handleEnd = () => {
    if (mode === playMode.loop) {
      handleLoop();
    } else {
      handleNext();
    }
  };

  const handleError = ()=>{
    setSongReady(true)
    alert("播放出错")
  }

  /**
   * 歌词部分
   */

  const handleLyric = ({lineNum, txt}) =>{
    if(!currentLyric.current) return
    currentLineNum.current = lineNum
    setPlayingLyric(txt)
  }

  const getLyric = id =>{
    let lyric = ""
    if(currentLyric.current){
      currentLyric.current.stop()
    }
    // 避免 songReady 恒为 false 的情况
    getLyricRequest(id).then(data=>{
      // console.log(data)
      lyric = data.lrc && data.lrc.lyric
      if(!lyric){
        currentLyric.current = null
        return
      }
      currentLyric.current = new Lyric(lyric, handleLyric)
      currentLyric.current.play()
      currentLineNum.current = 0
      currentLyric.current.seek(0)
    }).catch(()=>{
      currentLyric.current = ""
      songReady.current = true
      audioRef.current.play()
    })
  }
  
  return (
    <div>
      { isEmptyObject(currentSong) ? null : (
        <MiniPlayer
          song={currentSong}
          fullScreen={fullScreen}
          playing={playing}
          toggleFullScreen={toggleFullScreenDispatch}
          clickPlaying={clickPlaying}
          percent={percent}
          togglePlayList={togglePlayListDispatch}//弹出播放列表
        /> 
        )
      }
      { isEmptyObject(currentSong) ? null : (
        <NormalPlayer
          song={currentSong}
          fullScreen={fullScreen}
          playing={playing}
          mode={mode}
          changeMode={changeMode}
          duration={duration}
          currentTime={currentTime}
          percent={percent}
          toggleFullScreen={toggleFullScreenDispatch}
          clickPlaying={clickPlaying}
          onProgressChange={onProgressChange}
          handlePrev={handlePrev}
          handleNext={handleNext}
          togglePlayList={togglePlayListDispatch}
          currentLyric={currentLyric.current}
          currentPlayingLyric={currentPlayingLyric}
          currentLineNum={currentLineNum.current}
          clickSpeed={clickSpeed}
          speed={speed}
        />
        )
      }
      <audio
        ref={audioRef}
        onTimeUpdate={updateTime}
        onEnded={handleEnd}
        onError={handleError}
      ></audio>
      <PlayList clearPreSong={setPreSong.bind(null, {})}></PlayList>
      <Toast text={modeText} ref={toastRef}></Toast>  
    </div>
  )
}


const mapStateToProps = state => ({
  fullScreen: state.player.fullScreen,
  playing: state.player.playing,
  currentSong: state.player.currentSong,
  showPlayList: state.player.showPlayList,
  mode: state.player.mode,
  currentIndex: state.player.currentIndex,
  playList: state.player.playList,
  sequencePlayList: state.player.sequencePlayList,
  speed: state.player.speed
})

const mapDispatchToProps = dispatch => {
  return {
    togglePlayingDispatch(data) {
      dispatch(changePlayingState(data));
    },
    toggleFullScreenDispatch(data) {
      dispatch(changeFullScreen(data));
    },
    togglePlayListDispatch(data) {//用于弹出播放列表
      dispatch(changeShowPlayList(data));
    },
    changeCurrentIndexDispatch(index) {
      dispatch(changeCurrentIndex(index));
    },
    changeCurrentDispatch(data) {
      dispatch(changeCurrentSong(data));
    },
    changeModeDispatch(data) {
      dispatch(changePlayMode(data));
    },
    changePlayListDispatch(data) {
      dispatch(changePlayList(data));
    },
    changeSpeedDispatch(data){
      dispatch(changeSpeed(data))
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(React.memo(Player))