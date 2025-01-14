/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *//**
  * Sample React Native App
  * https://github.com/facebook/react-native
  */
 'use strict';

 import React, { Component } from 'react';
 import {
   AppRegistry,
   StyleSheet,
   Text,
   View
 } from 'react-native';

 import {
   ViroScene,
   ViroBox,
   ViroMaterials,
   ViroNode,
   ViroOrbitCamera,
   ViroCamera,
   ViroAmbientLight,
   ViroOmniLight,
   ViroSpotLight,
   ViroDirectionalLight,
   ViroButton,
   ViroImage,
   ViroVideo,
   Viro360Image,
   Viro360Video,
   ViroFlexView,
   ViroUtils,
   ViroText,
   ViroAnimations,
   ViroQuad,
   ViroSkyBox,
   ViroSphere,
   Viro3DObject,
 } from 'react-viro';

var createReactClass = require('create-react-class');

var button_local = require("../res/card_main.png");
var buttonAnyHover_local = require("../res/card_petite_ansu.png");
var buttonAnyClicked_local = require("../res/card_main.png");

var button_uri = {uri:"https://s3-us-west-2.amazonaws.com/viro/Explorer/360_horseshoe.jpg"};
var buttonAnyHover_uri = {uri:"http://storage.googleapis.com/ix_choosemuse/uploads/2016/02/Muse%20Android.jpeg"};
var buttonAnyClicked_uri = {uri:"https://s3-us-west-2.amazonaws.com/viro/Explorer/360_horseshoe.jpg"};

var ReleaseMenu = require("./ReleaseMenu.js");

var ViroButtonTest = createReactClass({
   getInitialState() {
     return {
        widthAndHeight:1,
        format:"RGBA8",
        showUrlImage:false
     };
   },

   render: function() {
     var buttonSource = this.state.showUrlImage ? button_uri : button_local;
     var buttonAnyHover = this.state.showUrlImage ? buttonAnyHover_uri : buttonAnyHover_local;
     var buttonAnyClicked = this.state.showUrlImage ? buttonAnyClicked_uri : buttonAnyClicked_local;
      return (
            <ViroScene>
            <ReleaseMenu sceneNavigator={this.props.sceneNavigator}/>


                 <ViroButton
                    width={this.state.widthAndHeight} height={this.state.widthAndHeight}
                    position={[0,0.5,-4]}
                    scale={[0.5, 0.5, 0.5]}
                    source={buttonSource}
                    hoverSource={buttonAnyHover}
                    clickSource={buttonAnyClicked}
                    onAnyClicked={this._onAnyHover}
                    onAnyHover={this._onAnyHover}/>

                    {this._getTestControls()}
            </ViroScene>

           );
   },



   _getTestControls(){
    return(
        <ViroNode position={[0,-0.5,-2]}>
         <ViroText style={styles.baseTextTwo} position={[-1,0, 0]}
         width={1} height={2} text={"Toggle ImageSource isUrlIamge: " + this.state.showUrlImage}
                onAnyClicked={this._toggleImageSource}/>

         <ViroText style={styles.baseTextTwo} position={[0,0, 0]} width={1} height={2}
                text={"Toggle ImageSize: " + this.state.widthAndHeight}
                onAnyClicked={this._toggleSize}/>

         <ViroText style={styles.baseTextTwo} position={[1,0, 0]} width={1} height={2}
                text={"Toggle Format " + this.state.format}
                onAnyClicked={this._toggleFormat}/>

        <ViroImage source={require('./res/poi_dot.png')} position={[0, -3, -2]} transformBehaviors={["billboard"]} onAnyClicked={this._showNext} />

         </ViroNode>
        );
   },

   _showNext() {
      this.props.sceneNavigator.replace({scene:require('./ViroQuadFlexViewTest')});
   },

   _onAnyHover(source, isHovering){
      console.log("onAnyHover");
   },

   _toggleImageSource() {
        var newShowUrlImageFlag = !this.state.showUrlImage;
        this.setState({
                  showUrlImage:newShowUrlImageFlag,
        });
   },
   _toggleSize() {
        var size = this.state.widthAndHeight;
        size = size + 0.5;
        if (size > 4){
            size = 0.5;
        }

        this.setState({
            widthAndHeight:size
        });
   },

 });

var styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  elementText: {
    fontFamily: 'HelveticaNeue-Medium',
    fontSize: 30,
    color: '#ffffff',
    textAlign: 'center',
  },
  baseTextTwo: {
      fontFamily: 'Arial',
      fontSize: 10,
      color: '#ffffff',
      flex: 1,
      textAlignVertical: 'center',
      textAlign: 'center',
  },
});

 module.exports = ViroButtonTest;
