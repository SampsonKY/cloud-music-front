## 歌手分类列表

说明 : 调用此接口,可获取歌手分类列表

**可选参数 :**

`limit` : 返回数量 , 默认为 30

`offset` : 偏移数量，用于分页 , 如 : 如 :( 页数 -1)*30, 其中 30 为 limit 的值 , 默认为 0 

`initial`: 按首字母索引查找参数,如 /artist/list?type=1&area=96&initial=b 返回内容将以 name 字段开头为 b 或者拼音开头为 b 为顺序排列, 热门传-1,#传0

`type` 取值:
```
-1:全部
1:男歌手
2:女歌手
3:乐队
```

`area` 取值:
```
-1:全部
7华语
96欧美
8:日本
16韩国
0:其他
```
**接口地址** : `/artist/list`

**调用例子** : `/artist/list?type=1&area=96&initial=b /artist/list?type=2&area=2&initial=b`

## 歌手全部歌曲
说明 : 调用此接口,可获取歌手全部歌曲 必选参数 :

`id` : 歌手 id

**可选参数** :

`order` : `hot` ,`time` 按照热门或者时间排序

`limit`: 取出歌单数量 , 默认为 50

`offset`: 偏移数量 , 用于分页 , 如 :( 评论页数 -1)*50, 其中 50 为 limit 的值

**接口地址** : `/artist/songs`

**调用例子** : `/artist/songs?id=6452`

## 获取歌单详情
说明 : 歌单能看到歌单名字, 但看不到具体歌单内容 , 调用此接口 , 传入歌单 id, 可 以获取对应歌单内的所有的音乐(未登录状态只能获取不完整的歌单,登录后是完整的)，但是返回的trackIds是完整的，tracks 则是不完整的，可拿全部 trackIds 请求一次 `song/detail` 接口获取所有歌曲的详情 (https://github.com/Binaryify/NeteaseCloudMusicApi/issues/452)

**必选参数** : `id` : 歌单 id

**可选参数** : `s` : 歌单最近的 s 个收藏者,默认为8

**接口地址** : `/playlist/detail`

**调用例子** : `/playlist/detail?id=24381616`

## 所有榜单
说明 : 调用此接口,可获取所有榜单 
**接口地址** : `/toplist`

**调用例子** : `/toplist`

## 歌手榜
说明 : 调用此接口 , 可获取排行榜中的歌手榜

**可选参数** :
```
type : 地区
1: 华语
2: 欧美
3: 韩国
4: 日本
```
**接口地址** : `/toplist/artist`

**调用例子** : `/toplist/artist`