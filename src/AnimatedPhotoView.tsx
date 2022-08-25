import * as React from "react"
import { useEffect, useRef, useState } from 'react'
import AspectRatio from "./AspectRatio"

interface AnimationTarget {
    x: number,
    y: number,
    width: number,
    height: number,
}

export class HTMLElementAnimationTarget implements AnimationTarget {
    target: HTMLElement

    constructor(target: HTMLElement) {
        this.target = target
    }

    get elementBounds() {
        return this.target.getBoundingClientRect()
    }

    get x() {
        return this.elementBounds.x
    }

    get y() {
        return this.elementBounds.y
    }

    get width() {
        return this.target.offsetWidth
    }

    get height() {
        return this.target.offsetHeight
    }
}

class CustomAnimationTarget implements AnimationTarget {
    x: number
    y: number
    width: number
    height: number
    constructor(x: number, y: number, width: number, height: number) {
        this.x = x
        this.y = y
        this.width = width
        this.height = height

    }
}

type OpenView = (source: ImageSourceResolver, animationTarget?: AnimationTarget) => void
type closeView = (animateTo?: AnimationTarget) => void

interface PhotoViewControls {
    openView: OpenView
    closeView: closeView
}


type ImageSource = string | HTMLImageElement
class ImageSourceResolver {
    source: ImageSource
    constructor(source: ImageSource) {
        this.source = source
    }

    get isString() {
        return typeof this.source === 'string'
    }

    get isElement() {
        return !this.isString
    }

    get image() {
        return this.source as HTMLImageElement
    }

    get url(): string {
        if (this.isString) return this.source as string
        if (this.isElement) return (this.source as HTMLImageElement).src
    }
}

export class AnimatedPhotoViewController {
    _openView: OpenView
    _closeView: closeView
    setControls(photoViewControls: PhotoViewControls) {
        // Controls:
        // {
        //     openView(source, animateFrom?)
        // }
        this._openView = photoViewControls.openView;
        this._closeView = photoViewControls.closeView;
    }

    openViewFromElement(source: ImageSource, animationTargetElement?: HTMLElement) {
        this.openView(source, animationTargetElement ? new HTMLElementAnimationTarget(animationTargetElement) : undefined);
    }

    openView(source: ImageSource, animationTarget?: AnimationTarget) {
        const _source = new ImageSourceResolver(source)
        if (animationTarget === undefined && _source.isElement) animationTarget = _source.image
        if (!animationTarget) animationTarget = new CustomAnimationTarget(window.innerWidth / 2, window.innerHeight / 2, 10, 10)
        this._openView(_source, animationTarget);
    }
}


function useWindowSize() {
    const [bodyWidth, setBodyWidth] = useState(global?.innerWidth || 1000)
    const [bodyHeight, setBodyHeight] = useState(global?.innerHeight || 1000)

    useEffect(() => {
        const f = () => {
            setBodyWidth(global?.innerWidth)
            setBodyHeight(global?.innerHeight)
        }
        window.addEventListener('resize', f)
        return () => window.removeEventListener('resize', f)
    }, [])
    return [bodyWidth, bodyHeight]
}

function useUpdate() {
    // updating will be true for one render cycle
    const [updating, setUpdating] = useState(false)
    // set updating to true and trigger an async immediate re-render
    const update = (cb: Function) => {
        setUpdating(true)
        setTimeout(() => {
            setUpdating(false)
            // it also can recive a callback to execute when updating
            cb && cb()
        }, 0)
    }
    return [updating, update] as [boolean, Function]
}

interface PhotoViewContextValue {
    controller: AnimatedPhotoViewController
    source: ImageSourceResolver
    animationTarget: AnimationTarget
}

const PhotoViewContext = React.createContext<PhotoViewContextValue>(null)

export default function AnimatedPhotoView({ controller, children }: { controller: AnimatedPhotoViewController, children: any }) {
    // Is image visible? Is true even when opening and closing
    const [visible, setVisible] = useState(false)
    // Is animating the opening
    const [opening, setOpening] = useState(false)
    // Is animating the closing
    const [closing, setClosing] = useState(false)
    // Origin from image opening or destination when closing
    const [animationTarget, setAnimationTarget] = useState<AnimationTarget>(null)
    // Is either closing or opening
    const animating = closing || opening
    // Animation duration
    const duration = 2000
    // Updated body width and height
    const [bodyWidth, bodyHeight] = useWindowSize()
    // Source
    const [source, setSource] = useState<ImageSourceResolver>(null)
    // Current loaded image
    const image = useRef(null)

    // It will be called when starting to open/close the view
    const [updating, update] = useUpdate()

    // Set constrols to controller, this enables the controller to open/close the view
    useEffect(() => {
        controller.setControls({ openView, closeView })
    }, [controller])

    function openView(source: ImageSourceResolver, animationTarget: AnimationTarget) {
        if (animating) return
        setVisible(true)
        setSource(source)
        setOpening(true)
        setAnimationTarget(animationTarget)
        update()
        setTimeout(() => setOpening(false), duration)
    }

    function closeView() {
        if (animating) return
        update()
        setClosing(true)
        setTimeout(() => {
            setClosing(false)
            setVisible(false)
        }, duration)
    }

    let _width = bodyWidth
    let _height = bodyHeight

    let _left = 0
    let _top = 0

    if (updating || closing) {
        _width = animationTarget?.width || 0
        _height = animationTarget?.height || 0
        _left = animationTarget?.x || 0
        _top = animationTarget?.y || 0
    }


    const _duration = duration


    // Style of only black background
    const bgStyle: React.CSSProperties = {
        // Use entire screen
        position: 'fixed',
        width: '100%',
        height: '100%',
        top: 0,
        left: 0,
        // If updating and openening: 0, if opening and visible (not updating): 1, if closing: 0
        opacity: (!(visible && !updating) || closing) ? 0 : 1,
        backgroundColor: '#000',
        transition: `opacity ${duration}ms ease-in-out`,
        display: visible ? 'block' : 'none', // Hide if not visible
    }

    // Calculate image source aspect ratio or default to 1:1
    const imageAspectRatio = image.current ? (image.current.naturalHeight || 1) / (image.current.naturalWidth || 1) : 1
    // Calculate in real time screen aspect ratio or use default 1000x1000 -> 1:1
    const screenAspectRatio = bodyHeight / bodyWidth


    // Style of main container (not background, not image)
    const style: React.CSSProperties = {
        width: animating ? _width : '100%', // Use 100% just in case there is some problem with real time window size
        height: animating ? _height : '100%', // Use 100% just in case there is some problem with real time window size
        left: _left,
        top: _top,
        position: 'fixed',
        display: visible ? 'flex' : 'none', // Hide if not visible
        transition: animating ? `all ${_duration}ms` : null,
        overflow: 'hidden',
    }

    let horizontalMargins = true
    let verticalMargins = false

    // If screen is larger than image use vertial center
    if (imageAspectRatio < screenAspectRatio) {
        style.alignItems = 'center'
        horizontalMargins = false
        verticalMargins = true
    }

    // Calculate left margin of image to centered
    let left = (bodyWidth - (screenAspectRatio / imageAspectRatio) * bodyWidth) / 2
    if (left < 0) left = 0

    // Set image container padding to ensure image is centered and the animation moves correctly 
    // It works without this but the animation is better this way
    style.paddingLeft = left + 'px'
    style.paddingRight = left + 'px'

    // If updating (the animation just started to open) or closing it should have no padding
    if (updating || closing) {
        style.paddingLeft = 0
        style.paddingRight = 0
    }

    const imageStyle: React.CSSProperties = {}
    if (verticalMargins) imageStyle.width = '100%'
    if (horizontalMargins) imageStyle.height = '100%'

    const uiStyle: React.CSSProperties = {
        ...bgStyle,
        backgroundColor: 'transparent',
    }

    return <div>
        <div style={bgStyle as any}></div>
        <div style={style}>
            <img
                src="https://cdn.pixabay.com/photo/2022/05/09/11/20/flower-7184366_960_720.jpg"
                ref={image}
                onClick={closeView}
                style={imageStyle}
            />
        </div>
        <div style={uiStyle}>
            <PhotoViewContext.Provider value={{ controller, source, animationTarget }}>
                {children}
            </PhotoViewContext.Provider>
        </div>
    </div>
}
