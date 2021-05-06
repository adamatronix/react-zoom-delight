import React, { Component } from "react";
import TweenMax from "gsap/TweenMax";
import { Power1 } from "gsap/EasePack";
import "./styles/zoom-delight.scss";

class ZoomDelight extends Component {

    constructor(props) {
        super(props);
        this.state = {}

        this.viewportWidth = window.innerWidth;
        this.viewportHeight = window.innerHeight;
        this.centerViewport = { x: this.viewportWidth / 2, y: this.viewportHeight / 2 };
        this.containerRef = null;
        this.moveableRef = null;
        this.origWidth = null;
        this.origHeight = null;
        this.tween = null;
        this.blur = 0;

        this.animateData = {
            scale: 1,
            x: 0,
            y: 0
        };

        this.enabled = false;

        this.scale = 5;

        this.boxStyle = {
            "background": "black",
            "width": "200px",
            "height": "200px",
            "position": "relative",
            "display": "inline-block"
        };

        this.onMouseDown = this.onMouseDown.bind(this);
        this.onScroll = this.onScroll.bind(this);
        this.onUpdateCallback = this.onUpdateCallback.bind(this);
    }

    componentDidMount() {
        this.origWidth = this.containerRef.clientWidth;
        this.origHeight = this.containerRef.clientHeight;

        this.containerRef.addEventListener("mousedown", this.onMouseDown);
        window.addEventListener("scroll", this.onScroll);
        this.moveableRef.style.transformOrigin = this.centerViewport.x  + "px " + this.centerViewport.y  + "px";
    }

    onUpdateCallback() {
        var progress = this.tween.progress();
        var blur = 0;
        if(progress < 0.5) {
            blur = progress * 5;
        } else {
            blur = (1 - progress) * 5;
        }
        
        //this.moveableRef.style.filter = "blur(" + blur + "px)";
        this.moveableRef.style.transform = "scale(" + this.animateData.scale + ") translate(" + this.animateData.x  + ", " + this.animateData.y  + ")";
    }

    onScroll() {
        if(this.enabled) {
            this.zoomOut();
        }
    }

    zoomOut() {
        this.tween = TweenMax.to(this.animateData, .4, {scale: 1, x: "0px", y: "0px", ease: Power1.easeInOut, onUpdate: this.onUpdateCallback });
        this.enabled = false;
    }

    onMouseDown(e) {
    
        if(!this.enabled) {
            var x = e.clientX;
            var y = e.clientY + Math.abs(this.containerRef.getBoundingClientRect().top);
            this.centerYOrigin = this.centerViewport.y + document.documentElement.scrollTop;
            var diff = (this.centerViewport.y - this.centerYOrigin) * (this.scale - 1) / this.scale;
            var transformValues = { x: (this.centerViewport.x - x) / this.scale, y: (this.centerYOrigin - y) / this.scale};

            this.centerYOrigin = this.centerViewport.y + document.documentElement.scrollTop;

            this.moveableRef.style.transformOrigin = x  + "px " + y  + "px";
            //this.moveableRef.style.transform = "scale(" + this.scale + ") translate(" + transformValues.x  + "px, " + transformValues.y  + "px)";

            this.tween = TweenMax.to(this.animateData, .6, {scale: this.scale, x: transformValues.x  + "px", y: transformValues.y  + "px", 
            ease: Power1.easeInOut, 
            onUpdate: this.onUpdateCallback });
            this.enabled = true;
        } else {
            this.zoomOut();
        }
        
    }

    convertPixelPointToPercent(point) {

    }

    render() {
        const { children } = this.props;

        let styles = {
            "display": "none",
            "background": "blue",
            "position": "fixed",
            "width": "20px",
            "height": "20px",
            "top": "50%",
            "left": "50%",
            "border-radius": "50%",
            "margin-top": "-10px",
            "margin-left": "-10px",
            "z-index": "999"
        };

        return (
            <>
            <div style={styles}>
            </div>
            <div className="zoom-delight__container" ref={div => this.containerRef = div}>
                <div className="zoom-delight__moveable" ref={div => this.moveableRef = div}>
                    { children }
                </div>
            </div>
            </>
        );
    }
   
}

export default ZoomDelight;