import React, { Component } from "react";
import TweenMax from "gsap/TweenMax";
import { Power1 } from "gsap/EasePack";
import "./styles/zoom-delight.scss";

/**
 * Zoom Delight wrapper enabling ZoomDelightClickable components with layout 
 * scaling capabilities.
 */
class ZoomDelight extends Component {

    constructor(props) {
        super(props);
        this.state = {}

        // Declate instance variables

        /**
         * @type {number}
         */
        this.viewportWidth = window.innerWidth;

        /**
         * @type {number}
         */
        this.viewportHeight = window.innerHeight;

        /**
         * @type {number}
         */
        this.centerViewport = { x: this.viewportWidth / 2, y: this.viewportHeight / 2 };

        /**
         * @type {object}
         */
        this.containerRef = null;

        /**
         * @type {object}
         */
        this.moveableRef = null;

        /**
         * @type {number}
         */
        this.origWidth = null;

        /**
         * @type {number}
         */
        this.origHeight = null;
        
        /**
         * @type {object}
         */
        this.tween = null;

        /**
         * @type {array}
         */
        this.childrenEl = [];

        /**
         * @type {object}
         */
        this.animateData = {
            scale: 1,
            x: 0,
            y: 0
        };

        /**
         * @type {object}
         */
        this.animateOriginData = {
            x: 0,
            y: 0
        }

        /**
         * @type {boolean}
         */
        this.enabled = false;

        /**
         * @type {number}
         */
        this.scale = 5;

        /**
         * @type {object}
         */
        this.boxStyle = {
            "background": "black",
            "width": "200px",
            "height": "200px",
            "position": "relative",
            "display": "inline-block"
        };

        // Pass instance context to methods
        this.onMouseDown = this.onMouseDown.bind(this);
        this.onScroll = this.onScroll.bind(this);
        this.onUpdateCallback = this.onUpdateCallback.bind(this);
        this.onOriginUpdateCallback = this.onOriginUpdateCallback.bind(this);
        this.onZoomDelightClickableClicked = this.onZoomDelightClickableClicked.bind(this);
    }

    componentDidMount() {
        // Store the dimensions of the parent with all its children elements.
        this.origWidth = this.containerRef.clientWidth;
        this.origHeight = this.containerRef.clientHeight;

        // Instantiate the scroll event.
        window.addEventListener("scroll", this.onScroll);

        // Set initial transform origin point to the center point of the current viewport position.
        this.moveableRef.style.transformOrigin = this.centerViewport.x  + "px " + this.centerViewport.y  + "px";
    }

    /**
     * Fires as tween values change, updating the css transform values.
     */
    onUpdateCallback() {
        this.moveableRef.style.transform = "scale(" + this.animateData.scale + ") translate(" + this.animateData.x  + ", " + this.animateData.y  + ")";
    }

    /**
     * Updates the transform origin values of main element
     */
    onOriginUpdateCallback() {
        this.moveableRef.style.transformOrigin = this.animateOriginData.x  + " " + this.animateOriginData.y;
    }

    /**
     * Scroll event which determines whether or not to initiate zoomOut
     */
    onScroll() {
        if(this.enabled) {
            this.zoomOut();
        }
    }

    /**
     * Initiates the zoom out animation, which brings it back to the original scale and position.
     */
    zoomOut() {
        this.tween = TweenMax.to(this.animateData, .4, {scale: 1, x: "0px", y: "0px", ease: Power1.easeInOut, onUpdate: this.onUpdateCallback });
        this.enabled = false;
    }

    /**
     * Fires when there is a click.
     * 
     * @param {object} e Mouse click event object 
     */
    onMouseDown(e) {
        if(!this.enabled) {
            this.zoomInToPoint({
                x: e.clientX,
                y: e.clientY + Math.abs(this.containerRef.getBoundingClientRect().top)
            });
        } else {
            this.zoomOut();
        }
    }
    
    /**
     * Determines the coordinates and scale values to zoom in to a point 
     * while ensuring the target fits within the user's viewport.
     * 
     * @param {Object} p Data object with x and y coordinates
     */
    zoomInToPoint(p) {
        var x = p.x;
        var y = p.y;

        // Get the y value of the main content container which is currently at the middle of the viewport.
        this.centerYOrigin = this.centerViewport.y + document.documentElement.scrollTop;

        // Get the new x and y positions based on the target coords and the center of the viewport, and divide by the value in which it scales
        var transformValues = { x: (this.centerViewport.x - x) / this.scale, y: (this.centerYOrigin - y) / this.scale};

        if(this.enabled) {
            TweenMax.to(this.animateOriginData, .6, {x: x  + "px", y: y  + "px", 
            ease: Power1.easeInOut, 
            onUpdate: this.onOriginUpdateCallback });
        } else {

            this.animateOriginData.x = x;
            this.animateOriginData.y = y;
            this.moveableRef.style.transformOrigin = x  + "px " + y  + "px";
        }

        // Animate to the new target position and scale
        this.tween = TweenMax.to(this.animateData, .6, {scale: this.scale, x: transformValues.x  + "px", y: transformValues.y  + "px", 
        ease: Power1.easeInOut, 
        onUpdate: this.onUpdateCallback });
        this.enabled = true;

    }

    /**
     * Callback that is passed to a zoomDelightClickable component, and when triggered, 
     * fires the zoomInToPoint method.
     * 
     * @param {object} pos 
     * @param {float} scale 
     */
    onZoomDelightClickableClicked(pos,scale) {
        this.scale = scale;
        this.zoomInToPoint(pos);
    }

    /**
     * Recursive function which iterates through the hierarchy of children react components,
     * and adds custom props to ZoomDelightClickable components.
     * 
     * @param {object} children 
     */
    filterChildren(children) {
        let el = React.Children.map(children, (child) => {
            var props;
            
            // Children with children must run the method on those objects.
            if(child.props && child.props.children) {
                let newChildren = this.filterChildren(child.props.children);
                props = { ...child.props, children: newChildren};
            } else {
                props = { ...child.props };
            }

            // Checks to see if it is our needle, if so apply a prop with our callback.
            if(child.type && child.type.name && child.type.name === "ZoomDelightClickable") {
                props = { ...props, clickCallback: this.onZoomDelightClickableClicked};
            }

            // Ensure the child has a type set, if not it is some unknown React object
            if(child.type) {
                // return a copy of the new React component.
                return React.cloneElement(child, props);
            }
            
       });

       return el;
    }

    render() {
        const { children } = this.props;
        var childrenEl = this.filterChildren(children);
 
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
                    {childrenEl ? childrenEl : ""}
                </div>
            </div>
            </>
        );
    }
   
}

export default ZoomDelight;