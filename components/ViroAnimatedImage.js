/**
 * Copyright (c) 2018-present, Viro Media, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */
 'use strict';

import { requireNativeComponent, View, Platform, ViewPropTypes, findNodeHandle } from 'react-native';
import resolveAssetSource from "react-native/Libraries/Image/resolveAssetSource";
import React from 'react';
import { checkMisnamedProps } from './Utilities/ViroProps';

var NativeModules = require('react-native').NativeModules;
var createReactClass = require('create-react-class');
import PropTypes from 'prop-types';
var StyleSheet = require('react-native/Libraries/StyleSheet/StyleSheet');

var ViroPropTypes = require('./Styles/ViroPropTypes');
var StyleSheetPropType = require('react-native/Libraries/DeprecatedPropTypes/DeprecatedStyleSheetPropType');
var stylePropType = StyleSheetPropType(ViroPropTypes);

var ViroAnimatedImage = createReactClass({
  propTypes: {
    ...View.propTypes,
    source: PropTypes.oneOfType([
        PropTypes.shape({
            uri: PropTypes.string,
        }),
        // Opaque type returned by require('./test.gif')
        PropTypes.number
    ]).isRequired,


        // Required to be local source static image by using require(''./image.jpg').
        // or by specifying local uri.
        // If not set, the image will be transparent until the source is downloaded
        placeholderSource:PropTypes.oneOfType([
          // TODO: Tooling to support documenting these directly and having them display in the docs.
          PropTypes.shape({
            uri: PropTypes.string,
          }),
          PropTypes.number,
        ]),

    position: PropTypes.arrayOf(PropTypes.number),
    rotation: PropTypes.arrayOf(PropTypes.number),
    scale: PropTypes.arrayOf(PropTypes.number),
    scalePivot: PropTypes.arrayOf(PropTypes.number),
    rotationPivot: PropTypes.arrayOf(PropTypes.number),
    opacity: PropTypes.number,

    width: PropTypes.number,
    height: PropTypes.number,
    resizeMode: PropTypes.oneOf(['ScaleToFill','ScaleToFit','StretchToFill']),
    imageClipMode: PropTypes.oneOf(['None', 'ClipToBounds']),
    stereoMode:PropTypes.oneOf(['LeftRight', 'RightLeft', 'TopBottom', 'BottomTop', 'None']),

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
    visible: PropTypes.bool,
    style: stylePropType,

    paused: PropTypes.bool,
    loop: PropTypes.bool,

    ignoreEventHandling: PropTypes.bool,
    onHover: PropTypes.func,
    onAnyHover: PropTypes.func,
    onClick: PropTypes.func,
    onAnyClick: PropTypes.func,
    onAnyClicked: PropTypes.func,
    /**
     * Callback triggered when we are processing the assets to be
     * displayed in this ViroImage (either downloading / reading from file).
     */
    onLoadStart: PropTypes.func,

    /**
     * Callback triggered when we have finished processing assets to be
     * displayed. Wether or not assets were processed successfully and
     * thus displayed will be indicated by the parameter "success".
     * For example:
     *
     *   _onLoadEnd(event:Event){
     *      // Indication of asset loading success
     *      event.nativeEvent.success
     *   }
     *
     */
    onLoadEnd: PropTypes.func,

    /**
     * Callback triggered when the image fails to load. Invoked with
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
    renderingOrder: PropTypes.number,
    viroTag: PropTypes.string,
    onCollision: PropTypes.func,
  },
  _onLoadStart: function(event: Event) {
    this.props.onLoadStart && this.props.onLoadStart(event);
  },

  _onLoadEnd: function(event: Event) {
    this.props.onLoadEnd && this.props.onLoadEnd(event);
  },

  _onError: function(event: Event) {
    this.props.onError && this.props.onError(event);
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
    checkMisnamedProps("ViroAnimatedImage", this.props);
    var defaultPlaceholder = require('./Resources/viro_blank.png');
    var imgsrc = resolveAssetSource(this.props.source);
    var placeholderSrc;

    if (this.props.placeholderSource) {
      placeholderSrc = resolveAssetSource(this.props.placeholderSource);
    } else {
      switch (Platform.OS) {
        case 'ios':
         /*
          On iOS in dev mode, it takes time to download the default placeholder,
          so we use the renderer to set transparency instead.
          */
          break;
        case 'android':
          placeholderSrc = resolveAssetSource(defaultPlaceholder);
          break;
      }
    }

    // Since materials and transformBehaviors can be either a string or an array, convert the string to a 1-element array.
    let materials = typeof this.props.materials === 'string' ? new Array(this.props.materials) : this.props.materials;
    let transformBehaviors = typeof this.props.transformBehaviors === 'string' ?
        new Array(this.props.transformBehaviors) : this.props.transformBehaviors;

    let transformDelegate = this.props.onTransformUpdate != undefined ? this._onNativeTransformUpdate : undefined;

    // Create native props object.
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
    nativeProps.materials = materials;
    nativeProps.source = imgsrc;
    nativeProps.placeholderSource = placeholderSrc;
    nativeProps.transformBehaviors = transformBehaviors;
    nativeProps.onLoadStartViro = this._onLoadStart;
    nativeProps.onLoadEndViro = this._onLoadEnd;
    nativeProps.onErrorViro = this._onError;
    nativeProps.style = [this.props.style];
    nativeProps.onAnimationStartViro = this._onAnimationStart;
    nativeProps.onAnimationFinishViro = this._onAnimationFinish;
    nativeProps.canCollide = this.props.onCollision != undefined;
    nativeProps.onCollisionViro = this._onCollision;
    nativeProps.ref = component => {this._component = component; };
    return (
      <VRTAnimatedImage {...nativeProps}/>
    );
  }
});

var VRTAnimatedImage = requireNativeComponent(
    'VRTAnimatedImage', ViroAnimatedImage, {
      nativeOnly: {
        enabledClick:true,
        enabledHover:true,
        onClickViro:true,
        onAnyClickViro:true,
        onHoverViro:true,
        onAnyHoverViro:true,
        onLoadStartViro: true,
        onLoadEndViro: true,
        onErrorViro: true,
        canCollide:true,
        onCollisionViro:true,
        onNativeTransformDelegateViro:true,
        hasTransformDelegate:true,
        onAnimationStartViro:true,
        onAnimationFinishViro:true
      }
    }
);

module.exports = ViroAnimatedImage;
