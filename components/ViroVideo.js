/**
 * Copyright (c) 2015-present, Viro Media, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */
import {
  requireNativeComponent,
  View,
  StyleSheet,
  findNodeHandle,
  Platform,
} from 'react-native';
import resolveAssetSource from "react-native/Libraries/Image/resolveAssetSource";
import React, { Component } from 'react';
var NativeModules = require('react-native').NativeModules;
var createReactClass = require('create-react-class');
import PropTypes from 'prop-types';
import { checkMisnamedProps } from './Utilities/ViroProps';

var ViroVideo = createReactClass({
  propTypes: {
    ...View.propTypes,
    position: PropTypes.arrayOf(PropTypes.number),
    rotation: PropTypes.arrayOf(PropTypes.number),
    scale: PropTypes.arrayOf(PropTypes.number),
    scalePivot: PropTypes.arrayOf(PropTypes.number),
    rotationPivot: PropTypes.arrayOf(PropTypes.number),
    opacity: PropTypes.number,
    renderingOrder: PropTypes.number,
    visible: PropTypes.bool,
    materials: PropTypes.oneOfType([
      PropTypes.arrayOf(PropTypes.string),
      PropTypes.string
    ]),
    animation: PropTypes.shape({
      interruptible: PropTypes.bool,
      name: PropTypes.string,
      delay: PropTypes.number,
      loop: PropTypes.bool,
      onStart: PropTypes.func,
      onFinish: PropTypes.func,
      run: PropTypes.bool,
    }),
    transformBehaviors: PropTypes.oneOfType([
      PropTypes.arrayOf(PropTypes.string),
      PropTypes.string
    ]),
    highAccuracyEvents : PropTypes.bool,
    lightReceivingBitMask : PropTypes.number,
    shadowCastingBitMask : PropTypes.number,
    onTransformUpdate: PropTypes.func,
    stereoMode:PropTypes.oneOf(['LeftRight', 'RightLeft', 'TopBottom', 'BottomTop', 'None']),
    width: PropTypes.number,
    height: PropTypes.number,
    paused: PropTypes.bool,
    loop: PropTypes.bool,
    muted: PropTypes.bool,
    volume: PropTypes.number,
    source: PropTypes.oneOfType([
        PropTypes.shape({
            uri: PropTypes.string,
        }),
        // Opaque type returned by require('./test_video.mp4')
        PropTypes.number
    ]).isRequired,

    ignoreEventHandling: PropTypes.bool,
    onHover: PropTypes.func,
    onAnyHover: PropTypes.func,
    onClick: PropTypes.func,
    onAnyClick: PropTypes.func,
    onAnyClicked: PropTypes.func,
    /**
     * Callback invoked when the underlying video component begins buffering. Called at
     * least once at the beginning of playback/video creation.
     */
    onBufferStart: PropTypes.func,

    /**
     * Callback invoked when the underlying video component has finished buffering.
     */
    onBufferEnd: PropTypes.func,

    /**
     * Callback that is called when the video is finished playing. This
     * function isn't called at the end of a video if looping is enabled.
     */
    onFinish: PropTypes.func,

    /**
      * Callback that is called when the current playback position has changed.
      * This is called in the form:
      *     onUpdateTime(currentPlaybackTimeInSeconds, totalPlayBackDurationInSeconds);
      */
    onUpdateTime: PropTypes.func,

    /**
     * Callback triggered when the video fails to load. Invoked with
     * {nativeEvent: {error}}
     */
    onError: PropTypes.func,
    physicsBody: PropTypes.shape({
      type: PropTypes.oneOf(['Dynamic','Kinematic','Static']).isRequired,
      mass: PropTypes.number,
      restitution: PropTypes.number,
      shape: PropTypes.shape({
        type: PropTypes.oneOf(["Box", "Sphere", "Compound"]).isRequired,
        params: PropTypes.arrayOf(PropTypes.number)
      }),
      friction: PropTypes.number,
      useGravity: PropTypes.bool,
      enabled: PropTypes.bool,
      velocity: PropTypes.arrayOf(PropTypes.number),
      force: PropTypes.oneOfType([
        PropTypes.arrayOf(PropTypes.shape({
          value: PropTypes.arrayOf(PropTypes.number),
          position: PropTypes.arrayOf(PropTypes.number)
        })),
        PropTypes.shape({
          value: PropTypes.arrayOf(PropTypes.number),
          position: PropTypes.arrayOf(PropTypes.number)
        }),
      ]),
      torque: PropTypes.arrayOf(PropTypes.number)
    }),

    viroTag: PropTypes.string,
    onCollision: PropTypes.func,
  },

  _onBufferStart: function(event: Event) {
    this.props.onBufferStart && this.props.onBufferStart(event);
  },

  _onBufferEnd: function(event: Event) {
    this.props.onBufferEnd && this.props.onBufferEnd(event);
  },

  _onFinish: function() {
    this.props.onFinish && this.props.onFinish();
  },

  _onError: function(event: Event) {
    this.props.onError && this.props.onError(event);
  },

  _onUpdateTime: function(event: Event) {
    this.props.onUpdateTime && this.props.onUpdateTime(event.nativeEvent.currentTime, event.nativeEvent.totalTime);
  },

  _onHover: function(event: Event) {
    this.props.onHover && this.props.onHover(event.nativeEvent);
  },

  _onAnyHover: function(event: Event) {
    this.props.onAnyHover && this.props.onAnyHover(event.nativeEvent.isHovering, event.nativeEvent.position, event.nativeEvent.source);
  },

  _onClick: function(event: Event) {
    this.props.onClick && this.props.onClick(event.nativeEvent);
  },

  _onAnyClick: function(event: Event) {
    this.props.onAnyClick && this.props.onAnyClick(event.nativeEvent.clickState, event.nativeEvent.position, event.nativeEvent.source);
    let CLICKED = 3; // Value representation of Clicked ClickState within EventDelegateJni.
    if (event.nativeEvent.clickState == CLICKED){
          this._onAnyClicked(event)
    }
  },

  _onAnyClicked: function(event: Event) {
    this.props.onAnyClicked && this.props.onAnyClicked(event.nativeEvent.position, event.nativeEvent.source);
  },

  _onAnimationStart: function(event: Event) {
    this.props.animation && this.props.animation.onStart && this.props.animation.onStart();
  },

  _onAnimationFinish: function(event: Event) {
    this.props.animation && this.props.animation.onFinish && this.props.animation.onFinish();
  },

  async getTransformAsync() {
    return await NativeModules.VRTNodeModule.getNodeTransform(findNodeHandle(this));
  },

  async getBoundingBoxAsync() {
    return await NativeModules.VRTNodeModule.getBoundingBox(findNodeHandle(this));
  },

  setNativeProps: function(nativeProps) {
    this._component.setNativeProps(nativeProps);
  },

  applyImpulse: function(force, position) {
    NativeModules.VRTNodeModule.applyImpulse(findNodeHandle(this), force, position);
  },

  applyTorqueImpulse: function(torque) {
    NativeModules.VRTNodeModule.applyTorqueImpulse(findNodeHandle(this), torque);
  },

  setVelocity: function(velocity) {
    NativeModules.VRTNodeModule.setVelocity(findNodeHandle(this), velocity);
  },

  _onCollision: function(event: Event){
    if (this.props.onCollision){
      this.props.onCollision(event.nativeEvent.viroTag, event.nativeEvent.collidedPoint,
                                                           event.nativeEvent.collidedNormal);
    }
  },

  // Called from native on the event a positional change has occured
  // for the underlying control within the renderer.
  _onNativeTransformUpdate: function(event: Event){
    var position =  event.nativeEvent.position;
    if (this.props.onTransformUpdate){
      this.props.onTransformUpdate(position);
    }
  },

  render: function() {
    checkMisnamedProps("ViroVideo", this.props);

    var source = resolveAssetSource(this.props.source);
    // Since materials and transformBehaviors can be either a string or an array, convert the string to a 1-element array.
    let materials = typeof this.props.materials === 'string' ? new Array(this.props.materials) : this.props.materials;
    let transformBehaviors = typeof this.props.transformBehaviors === 'string' ?
        new Array(this.props.transformBehaviors) : this.props.transformBehaviors;

    let transformDelegate = this.props.onTransformUpdate != undefined ? this._onNativeTransformUpdate : undefined;

    let nativeProps = Object.assign({}, this.props);
    nativeProps.enabledClick = this.props.onClick != undefined ||
                               this.props.onAnyClick != undefined ||
                               this.props.onAnyClicked != undefined;
    nativeProps.enabledHover = this.props.onHover != undefined ||
                               this.props.onAnyHover != undefined;
    nativeProps.onClickViro= this._onClick;
    nativeProps.onAnyClickViro= this._onAnyClick;
    nativeProps.onHoverViro= this._onHover;
    nativeProps.onAnyHoverViro= this._onAnyHover;
    nativeProps.onNativeTransformDelegateViro = transformDelegate;
    nativeProps.hasTransformDelegate = this.props.onTransformUpdate != undefined;
    nativeProps.style = [this.props.style];
    nativeProps.source = source;
    nativeProps.materials = materials;
    nativeProps.transformBehaviors = transformBehaviors;
    nativeProps.onBufferStartViro = this._onBufferStart;
    nativeProps.onBufferEndViro = this._onBufferEnd;
    nativeProps.onFinishViro = this._onFinish;
    nativeProps.onErrorViro = this._onError;
    nativeProps.onUpdateTimeViro = this._onUpdateTime;
    nativeProps.onAnimationStartViro = this._onAnimationStart;
    nativeProps.onAnimationFinishViro = this._onAnimationFinish;
    nativeProps.canCollide = this.props.onCollision != undefined;
    nativeProps.onCollisionViro = this._onCollision;
    nativeProps.ref = component => {this._component = component; };
    return (
      <VRTVideoSurface {...nativeProps} />
    );
  },

  seekToTime(timeInSeconds) {
    switch (Platform.OS) {
      case 'ios':
        NativeModules.VRTVideoSurfaceManager.seekToTime(findNodeHandle(this), timeInSeconds);
        break;
      case 'android':
        NativeModules.UIManager.dispatchViewManagerCommand(
            findNodeHandle(this),
            NativeModules.UIManager.VRTVideoSurface.Commands.seekToTime,
            [ timeInSeconds ]);
        break;
    }
  },
});

var VRTVideoSurface = requireNativeComponent(
    'VRTVideoSurface', ViroVideo, {
      nativeOnly: {
          enabledClick:true,
          enabledHover:true,
          onClickViro:true,
          onAnyClickViro:true,
          onHoverViro:true,
          onAnyHoverViro:true,
          onBufferStartViro: true,
          onBufferEndViro: true,
          onUpdateTimeViro: true,
          onFinishViro: true,
          onErrorViro:true,
          canCollide:true,
          onCollisionViro:true,
          onNativeTransformDelegateViro:true,
          hasTransformDelegate:true,
          onAnimationStartViro:true,
          onAnimationFinishViro:true
      }
    }
);

module.exports = ViroVideo;
