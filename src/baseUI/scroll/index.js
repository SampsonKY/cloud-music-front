import React,{forwardRef, useState, useEffect, useRef, useImperativeHandle, useMemo} from 'react'
import PropTypes from 'prop-types'
import BScroll from 'better-scroll'
import styled from 'styled-components'

import {debounce} from '../../api/utils'

import Loading from '../loading/index'
import LoadingV2 from '../loading-v2/index'

const ScrollContainer = styled.div`
    width: 100%;
    height: 100%;
    overflow: hidden;
`
const PullUpLoading = styled.div`
  position: absolute;
  left:0; right:0;
  bottom: 5px;
  width: 60px;
  height: 60px;
  margin: auto;
  z-index: 100;
`;

export const PullDownLoading = styled.div`
  position: absolute;
  left:0; right:0;
  top: 0px;
  height: 30px;
  margin: auto;
  z-index: 100;
`;

const Scroll = forwardRef((props, ref)=>{
    //better-scroll 实例对象
    const [bScroll, setBScroll] = useState()
    //current指向 bs 实例需要的 DOM 元素
    const scrollContainerRef = useRef()
    //接受props解构赋值
    const {direction, click, refresh, pullUpLoading,pullDownLoading,bounceTop,bounceBottom} = props
    const {pullUp, pullDown, onScroll} = props
    //创建better-scroll
    useEffect(()=>{
        const scroll = new BScroll(scrollContainerRef.current,{
            scrollX: direction === 'horizental', //为true是开启横向滚动
            scrollY: direction === "vertical",
            probeType: 3,//为3,在屏幕滑动的过程中实时派发 scroll 事件
            click: click,//设置为true时，会派发一个click事件
            bounce: {//回弹动画
                top: bounceTop,
                bottom: bounceBottom
            }
        })
        setBScroll(scroll)
        return ()=>{
            setBScroll(null)
        }
    }, [])

    let pullUpDebounce = useMemo (() => {
        return debounce(pullUp, 300)
    }, [pullUp]);
      // 千万注意，这里不能省略依赖，
      // 不然拿到的始终是第一次 pullUp 函数的引用，相应的闭包作用域变量都是第一次的，产生闭包陷阱。下同。
    let pullDownDebounce = useMemo(()=>{
        return debounce(pullDown, 300)
    }, [pullDown])
    //...
    // 之后直接调用 useMemo 返回的函数
    // 滑动到底部

    //给实例绑定scroll事件
    useEffect(()=>{
        if(!bScroll || !onScroll) return
        bScroll.on('scroll', (position)=>{
            onScroll(position)
        })
        return ()=>{
            bScroll.off('scroll')
        }
    }, [onScroll,bScroll])

    //进行上拉到底的判断，调用上拉刷新的函数
    useEffect(()=>{
        if(!bScroll || !pullUp) return;
        //滚动结束
        bScroll.on('scrollEnd', ()=>{
            //判断是否滑动到了底部
            if(bScroll.y <= bScroll.maxScrollY + 100){
                // pullUp()
                pullUpDebounce()
            }
        })
        return ()=>{
            bScroll.off('scrollEnd')
        }
    }, [pullUp, bScroll, pullUpDebounce])

    //进行下拉判断，调用下拉刷新函数
    useEffect(()=>{
        if(!bScroll || !pullDown) return
        //用户手指离开滚动区域
        bScroll.on('touchEnd', (pos)=>{
            // 判断用户下拉的判断
            if(pos.y > 50){
                // pullDown()
                pullDownDebounce()
            }
        })
        return ()=>{
            bScroll.off('touchEnd')
        }
    }, [pullDown, bScroll, pullDownDebounce])
    //一般与forwardRef一起使用，ref已经在forwardRef中默认传入
    /**
     * // 上层组件代码
        const scrollRef = useRef ();
        ...
        <Scroll ref={scrollRef}></Scroll>  
        想要通过这种调用方法的方式刷新 scroll 组件：
        scrollRef.current.refresh ();
        需要用到useImperativeHandle
     */
    useImperativeHandle(ref, ()=>({
        //给外界暴露refresh方法
        refresh(){
            if(bScroll){
                bScroll.refresh()
                bScroll.scrollTo(0,0)
            }
        },
        //给外界暴露 getBScroll 方法，提供bs
        getBScroll(){
            if(bScroll){
                return bScroll
            }
        }
    }))

    //每次重新渲染都要刷新实例，防止无法滑动
    useEffect(()=>{
        if(refresh && bScroll){
            bScroll.refresh()
        }
    })

    const PullUpdisplayStyle = pullUpLoading ? { display: "" } : { display: "none" };
    const PullDowndisplayStyle = pullDownLoading ? { display: "" } : { display: "none" };
    return (
        <ScrollContainer ref={scrollContainerRef}>
            {props.children}
            {/* 滑到底部加载动画 */}
            <PullUpLoading style={ PullUpdisplayStyle }><Loading></Loading></PullUpLoading>
            {/* 顶部下拉刷新动画 */}
            <PullDownLoading style={ PullDowndisplayStyle }><LoadingV2></LoadingV2></PullDownLoading>
        </ScrollContainer>
    )

})

Scroll.defaultProps = {
    direction: "vertical",
    click: true,
    refresh: true,
    onScroll: null,
    pullUpLoading: false,
    pullDownLoading: false,
    pullUp: null,
    pullDown: null,
    bounceTop: true,
    bounceBottom: true
}

Scroll.propTypes = {
    direction: PropTypes.oneOf(['vertical', 'horizental']),
    refresh: PropTypes.bool,//是否刷新
    onScroll: PropTypes.func,//滑动触发的回调函数
    pullUp: PropTypes.func, //上拉加载逻辑
    pullDown: PropTypes.func,//下拉加载逻辑
    pullUpLoading: PropTypes.bool, //是否显示上拉 loading 动画
    pullDownLoading: PropTypes.bool,//是否显示下拉 loading 动画
    bounceTop: PropTypes.bool,//是否支持向上吸顶
    bounceBottom: PropTypes.bool//是否支持向上吸顶
  };

  export default Scroll