/**
 * Copyright (c) 2015-present, Viro, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule Viro3DObject
 * @flow
 */
'use strict';

import { requireNativeComponent, View, StyleSheet, findNodeHandle } from 'react-native';
import React, { Component } from 'react';
var NativeModules = require('react-native').NativeModules;
var createReactClass = require('create-react-class');
import PropTypes from 'prop-types';

import { checkMisnamedProps } from './Utilities/ViroProps';
import resolveAssetSource from "react-native/Libraries/Image/resolveAssetSource";

/**
 * Used to render a Viro3DObject
 */
var Viro3DObject = createReactClass({
  propTypes: {
    ...View.propTypes,
    position: PropTypes.arrayOf(PropTypes.number),
    scale: PropTypes.arrayOf(PropTypes.number),
    rotation: PropTypes.arrayOf(PropTypes.number),
    scalePivot: PropTypes.arrayOf(PropTypes.number),
    rotationPivot: PropTypes.arrayOf(PropTypes.number),
    materials: PropTypes.oneOfType([
      PropTypes.arrayOf(PropTypes.string),
      PropTypes.string
    ]),
    transformBehaviors: PropTypes.oneOfType([
      PropTypes.arrayOf(PropTypes.string),
      PropTypes.string
    ]),
    type: PropTypes.oneOf(['OBJ', 'VRX', 'GLTF', 'GLB']).isRequired,
    opacity: PropTypes.number,
    ignoreEventHandling: PropTypes.bool,
    lightReceivingBitMask : PropTypes.number,
    shadowCastingBitMask : PropTypes.number,
    onTransformUpdate: PropTypes.func,
    /*
     * The model file, which is required
     */
    source: PropTypes.oneOfType([
      PropTypes.shape({
        uri: PropTypes.string,
      }),
      // Opaque type returned by require('./spaceship.obj')
      PropTypes.number,
    ]).isRequired,
    resources: PropTypes.arrayOf(
      PropTypes.oneOfType([
        PropTypes.shape({
          uri: PropTypes.string,
        }),
        PropTypes.number,
      ])
    ),
    animation: PropTypes.shape({
      name: PropTypes.string,
      delay: PropTypes.number,
      duration: PropTypes.number,
      loop: PropTypes.bool,
      onStart: PropTypes.func,
      onFinish: PropTypes.func,
      run: PropTypes.bool,
      interruptible: PropTypes.bool,
    }),
    renderingOrder: PropTypes.number,
    visible: PropTypes.bool,
    onHover: PropTypes.func,
    onAnyHover: PropTypes.func,
    onClick: PropTypes.func,
    onAnyClick: PropTypes.func,
    onAnyClicked: PropTypes.func,
    /**
     * Enables high accuracy event collision checks for this object.
     * This can be useful for complex 3D objects where the default
     * checking method of bounding boxes do not provide adequate
     * collision detection coverage.
     *
     * NOTE: Enabling high accuracy event collision checks has a high
     * performance cost and should be used sparingly / only when
     * necessary.
     *
     * Flag is set to false by default.
     */
    highAccuracyEvents:PropTypes.bool,

    /* DEPRECATION WARNING - highAccuracyGaze has been deprecated, please use highAccuracyEvents instead */
    highAccuracyGaze:PropTypes.bool,

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
    morphTargets:PropTypes.arrayOf(PropTypes.shape({
                 target: PropTypes.string,
                 weight: PropTypes.number
    })),
    viroTag: PropTypes.string,
    onCollision: PropTypes.func,
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

  _onLoadStart: function(event: Event) {
    this.props.onLoadStart && this.props.onLoadStart(event);
  },

  _onLoadEnd: function(event: Event) {
      this.props.onLoadEnd && this.props.onLoadEnd(event);
  },

  _onError: function(event: Event) {
    this.props.onError && this.props.onError(event);
  },

  _onAnimationStart: function(event: Event) {
    this.props.animation && this.props.animation.onStart && this.props.animation.onStart();
  },

  _onAnimationFinish: function(event: Event) {
    this.props.animation && this.props.animation.onFinish && this.props.animation.onFinish();
  },

  setNativeProps: function(nativeProps) {
   this._viro3dobj.setNativeProps(nativeProps);
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
      this.props.onCollision(event.nativeEvent.viroTag,
        event.nativeEvent.collidedPoint, event.nativeEvent.collidedNormal);
    }
  },

  // Called from native on the event a positional change has occured
  // for the underlying control within the renderer.
  _onNativeTransformUpdate: function(event: Event){
    var position =  event.nativeEvent.position;
    if (this.props.onTransformUpdate) {
      this.props.onTransformUpdate(position);
    }
  },

  async getTransformAsync() {
    return await NativeModules.VRTNodeModule.getNodeTransform(findNodeHandle(this));
  },

  async getBoundingBoxAsync() {
    return await NativeModules.VRTNodeModule.getBoundingBox(findNodeHandle(this));
  },
  async getMorphTargets() {
      return await NativeModules.VRTNodeModule.getMorphTargets(findNodeHandle(this));
  },
  render: function() {

    checkMisnamedProps("Viro3DObject", this.props);

    var modelsrc = resolveAssetSource(this.props.source);
    var resources = null;
    if (this.props.resources != undefined) {
      resources = this.props.resources.map(function(resource) {
        return resolveAssetSource(resource)
      });
    }
    // Since materials and transformBehaviors can be either a string or an array, convert the string to a 1-element array.
    let materials = typeof this.props.materials === 'string' ? new Array(this.props.materials) : this.props.materials;
    let transformBehaviors = typeof this.props.transformBehaviors === 'string' ?
      new Array(this.props.transformBehaviors) : this.props.transformBehaviors;

    // Always autogenerate a compound shape for 3DObjects if no shape is defined.
    let newPhysicsBody = undefined;
    if (this.props.physicsBody){
      let newPhysicsShape = undefined;
      if (this.props.physicsBody.shape == undefined){
        newPhysicsShape = {type:'compound'}
      } else {
        newPhysicsShape = this.props.physicsBody.shape;
      }

      newPhysicsBody = {
        type: this.props.physicsBody.type,
        mass: this.props.physicsBody.mass,
        restitution: this.props.physicsBody.restitution,
        friction: this.props.physicsBody.friction,
        useGravity: this.props.physicsBody.useGravity,
        enabled: this.props.physicsBody.enabled,
        velocity: this.props.physicsBody.velocity,
        force: this.props.physicsBody.force,
        torque: this.props.physicsBody.torque,
        shape: newPhysicsShape
      };
    }

    let highAccuracyEvents = this.props.highAccuracyEvents;
    if (this.props.highAccuracyEvents == undefined && this.props.highAccuracyGaze != undefined) {
      console.warn("**DEPRECATION WARNING** highAccuracyGaze has been deprecated/renamed to highAccuracyEvents");
      highAccuracyEvents = this.props.highAccuracyGaze;
    }

    let transformDelegate = this.props.onTransformUpdate != undefined ? this._onNativeTransformUpdate : undefined;

    return (
      <VRT3DObject
        {...this.props}
        enabledClick={this.props.onClick != undefined ||
                      this.props.onAnyClick != undefined ||
                      this.props.onAnyClicked != undefined}
        enabledHover={this.props.onHover != undefined ||
                      this.props.onAnyHover != undefined}
        onClickViro={this._onClick}
        onAnyClickViro={this._onAnyClick}
        onHoverViro={this._onHover}
        onAnyHoverViro={this._onAnyHover}
        ref={ component => { this._viro3dobj = component; }}
        highAccuracyEvents={highAccuracyEvents}
        onNativeTransformDelegateViro={transformDelegate}
        hasTransformDelegate={this.props.onTransformUpdate != undefined}
        physicsBody={newPhysicsBody}
        source={modelsrc}
        resources={resources}
        materials={materials}
        transformBehaviors={transformBehaviors}
        onLoadStartViro={this._onLoadStart}
        onLoadEndViro={this._onLoadEnd}
        onErrorViro={this._onError}
        onAnimationStartViro={this._onAnimationStart}
        onAnimationFinishViro={this._onAnimationFinish}
        canCollide={this.props.onCollision != undefined}
        onCollisionViro={this._onCollision}
      />
    );
  }
});

var VRT3DObject = requireNativeComponent(
  'VRT3DObject', Viro3DObject, {
    nativeOnly: {
      enabledClick:true,
      enabledHover:true,
      onClickViro:true,
      onAnyClickViro:true,
      onHoverViro:true,
      onAnyHoverViro:true,
      onLoadStartViro:true,
      onLoadEndViro:true,
      onErrorViro:true,
      canCollide:true,
      onCollisionViro:true,
      onNativeTransformDelegateViro:true,
      hasTransformDelegate:true,
      onAnimationStartViro:true,
      onAnimationFinishViro:true,
    }
  }
);

module.exports = Viro3DObject;
