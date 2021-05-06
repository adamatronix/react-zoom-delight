import React, { useState, useEffect, useRef } from 'react';

/**
 * Component to be used in conjection with the ZoomDelight component.
 * Activates the zooming functionlity on an image element.
 * @param {*} props 
 */
const ZoomDelightClickable = props => {
    const { className, src, clickCallback } = props;
    const containerRef = useRef(null);
    var center, scale;
    var margin = 20;
    var viewportHeight = window.innerHeight;

    /**
     * Run once on component mount.
     */
    useEffect(() => {
        let image = new Image();
        image.onload = onImageLoad();
        image.src = src;
    },[]);

    /**
     * Image load sets the center and scale positions based on the viewport 
     * and image dimensions.
     */
    function onImageLoad() {
        let rect = containerRef.current.getBoundingClientRect();

        // find the center coordinates of the image's bounding box.
        center = {
            x: (rect.left + rect.right) / 2,
            y: (rect.top + rect.bottom) / 2,
        }

        // calculate scale by dividing the projected image height by the current image height.
        scale = (viewportHeight - (margin * 2)) / rect.height;
    }

    /**
     * Image click event which fires the passed callback to the parent ZoomDelight component.
     */
    function onClick() {

        // The callback requires two parameters, coords object and scale.
        clickCallback(center, scale);
    }

    return (
        <img 
            className={ className } 
            src={src} 
            onClick={onClick} 
            ref={containerRef}
        />
    );
}

export default ZoomDelightClickable;