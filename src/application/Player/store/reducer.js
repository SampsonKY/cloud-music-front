import * as actionTypes from './constants'
import {playMode} from '../../../api/config'
import {produce} from 'immer'
import { findIndex } from '../../../api/utils'

const defaultState = {
    fullScreen: false, //播放器是否为全屏模式
    playing: false, //当前歌曲是否播放
    sequencePlayList: [], //顺序列表,(因为之后会有随机模式，列表会乱序，因从拿这个保存顺序列表)
    playList: [],//播放列表
    mode: playMode.sequence, //播放模式
    currentIndex: -1, //当前歌曲在播放列表的索引
    showPlayList: false, //是否展示播放列表
    currentSong: {},
    speed: 1
}

//删除歌曲
const handleDeleteSong = (state, song) => {
  const playList = state.playList
  const sequenceList = state.sequencePlayList
  let currentIndex = state.currentIndex

  // 找对应歌曲在播放列表中的索引
  const fpIndex = findIndex(song, playList);
  // 在播放列表中将其删除
  playList.splice(fpIndex, 1);

  // 如果删除的歌曲排在当前播放歌曲前面，那么 currentIndex--，让当前的歌正常播放
  if (fpIndex < currentIndex) currentIndex--;

  // 在 sequenceList 中直接删除歌曲即可
  const fsIndex = findIndex(song, sequenceList);
  sequenceList.splice(fsIndex, 1);

  state.playList = playList
  state.sequencePlayList = sequenceList
  state.currentIndex = currentIndex
}

//插入歌曲
const handleInsertSong = (state, song) => {
  const playList = state.playList
  const sequenceList = state.sequencePlayList
  let currentIndex = state.currentIndex

  // 看看有没有同款
  let fpIndex = findIndex(song, playList)
  // 如果是当前歌曲直接不处理
  if(fpIndex === currentIndex && currentIndex !== -1) return state
  currentIndex++
  // 把歌放进去，放到当前播放曲目的下一个位置
  playList.splice(currentIndex, 0, song)
  // 如果列表中已经存在要添加的歌，暂且称之为 oldSong
  if(fpIndex > -1){
    // 如果 oldSong 的索引在目前播放歌曲的索引之前，则删除之，同时当前index减一
    if(currentIndex > fpIndex){
      playList.splice(fpIndex, 1)
      currentIndex--
    }else{
      // 否则直接删除
      playList.splice(fpIndex+1,1)
    }
  }

  // 同理，处理 sequenceList
  let sequenceIndex  = findIndex(playList[currentIndex], sequenceList) + 1
  let fsIndex = findIndex(song, sequenceList)
  // 插入歌曲
  sequenceList.splice(sequenceIndex, 0, song);
  if (fsIndex > -1) {
    // 跟上面类似的逻辑。如果在前面就删掉，index--; 如果在后面就直接删除
    if (sequenceIndex > fsIndex) {
      sequenceList.splice(fsIndex, 1);
      sequenceIndex--;
    } else {
      sequenceList.splice(fsIndex + 1, 1);
    }
  }
  state.playList = playList
  state.sequencePlayList = sequenceList
  state.currentIndex = currentIndex
}

export default (state=defaultState, action) => produce(state, draft=>{
    switch(action.type){
        case actionTypes.SET_CURRENT_SONG:
            draft.currentSong = action.data
            break
        case actionTypes.SET_FULL_SCREEN:
            draft.fullScreen = action.data
            break
        case actionTypes.SET_PLAYING_STATE:
            draft.playing = action.data
            break
        case actionTypes.SET_SEQUECE_PLAYLIST:
            draft.sequencePlayList = action.data
            break
        case actionTypes.SET_PLAYLIST:
            draft.playList = action.data
            break
        case actionTypes.SET_PLAY_MODE:
            draft.mode = action.data
            break
        case actionTypes.SET_CURRENT_INDEX:
            draft.currentIndex = action.data
            break
        case actionTypes.SET_SHOW_PLAYLIST:
            draft.showPlayList = action.data
            break
        case actionTypes.INSERT_SONG:
            handleInsertSong(draft, action.data);
            break
        case actionTypes.DELETE_SONG:
            handleDeleteSong(draft, action.data)
            break
        case actionTypes.CHANGE_SPEED:
            draft.speed = action.data
      }
})