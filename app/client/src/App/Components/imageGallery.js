 
import React, { Component } from 'react';
import ImageGallery from 'react-image-video-gallery';
import "react-image-video-gallery/styles/css/image-gallery.css";

export default class Gallery extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            show: true,
        }
    }
    componentDidMount(){
        console.log("images: ",this.props.images);
    }
    render() {
        return <ImageGallery 
            items={this.props.images}
            lazyLoad={this.props.lazyLoad}
            showFullscreenButton={this.props.showFullscreenButton}
            showPlayButton={this.props.showPlayButton}
            showNav={this.props.showNav}
            showThumbnails={this.props.showThumbnails}
            />;
    }
}