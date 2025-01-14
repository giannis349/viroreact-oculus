//  Copyright © 2017 Viro Media. All rights reserved.
//
//  Permission is hereby granted, free of charge, to any person obtaining
//  a copy of this software and associated documentation files (the
//  "Software"), to deal in the Software without restriction, including
//  without limitation the rights to use, copy, modify, merge, publish,
//  distribute, sublicense, and/or sell copies of the Software, and to
//  permit persons to whom the Software is furnished to do so, subject to
//  the following conditions:
//
//  The above copyright notice and this permission notice shall be included
//  in all copies or substantial portions of the Software.
//
//  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
//  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
//  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
//  IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
//  CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
//  TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
//  SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

package com.viromedia.bridge.component;

import com.facebook.react.bridge.ReactContext;
import com.viro.core.Controller;
import com.viro.core.EventDelegate;
import com.viro.core.ViroContext;
import com.viromedia.bridge.utility.ComponentEventDelegate;

public class VRTController extends VRTComponent {
    // React defaults
    protected final static boolean DEFAULT_ENABLED_CLICK = false;
    protected final static boolean DEFAULT_ENABLED_HOVER = false;
    protected final static boolean DEFAULT_ENABLED_MOVE = false;
    protected final static boolean DEFAULT_ENABLED_THUMBSTICK = false;
    protected final static boolean DEFAULT_ENABLED_TRIGGER = false;
    protected final static boolean DEFAULT_ENABLED_GET_CONTROLLER_STATUS = false;
    protected final static boolean DEFAULT_RETICLE_VISIBILITY = true;
    protected final static boolean DEFAULT_CONTROLLER_VISIBILITY = true;
    private Controller mNativeController = null;
    private boolean mIsReticleVisible = DEFAULT_RETICLE_VISIBILITY;
    private boolean mIsControllerVisible = DEFAULT_CONTROLLER_VISIBILITY;
    private boolean mForcedRender = false;
    private boolean mIsSticky = true;
    private int mLightMask = -1;
    private EventDelegate mEventDelegateJni;
    private ComponentEventDelegate mComponentEventDelegate;

    public VRTController(ReactContext reactContext) {
        super(reactContext);
        mEventDelegateJni = new EventDelegate();
    }
    @Override
    public void onTearDown(){
        if (mEventDelegateJni != null) {
            mEventDelegateJni.dispose();
            mEventDelegateJni = null;
        }
        super.onTearDown();
    }

    @Override
    public void setViroContext(ViroContext context) {
        super.setViroContext(context);
        mNativeController = context.getController();
        updateVisibility();

        // Create and attach callbacks.
        mComponentEventDelegate = new ComponentEventDelegate(this);
        mEventDelegateJni.setEventDelegateCallback(mComponentEventDelegate);
        mNativeController.setEventDelegate(mEventDelegateJni);
    }

    protected void setClickEnabled(boolean enabled) {
        mEventDelegateJni.setEventEnabled(EventDelegate.EventAction.ON_CLICK, enabled);
    }

    protected void setHoverEnabled(boolean enabled) {
        mEventDelegateJni.setEventEnabled(EventDelegate.EventAction.ON_HOVER, enabled);
    }

    protected void setMoveEnabled(boolean enabled) {
        mEventDelegateJni.setEventEnabled(EventDelegate.EventAction.ON_MOVE, enabled);
    }

    protected void setThumbstickEnabled(boolean enabled) {
        mEventDelegateJni.setEventEnabled(EventDelegate.EventAction.ON_THUMBSTICK, enabled);
    }

    protected void setTriggerEnabled(boolean enabled) {
        mEventDelegateJni.setEventEnabled(EventDelegate.EventAction.ON_TRIGGER, enabled);
    }

    protected void setControllerStatusEnabled(boolean canGetControllerStatus) {
        mEventDelegateJni.setEventEnabled(EventDelegate.EventAction.ON_CONTROLLER_STATUS, canGetControllerStatus);
    }

    public void getForwardVectorAsync(Controller.ControllerJniCallback callback) {
        mNativeController.getControllerForwardVectorAsync(callback);
    }

    public void setLightReceivingBitMask(int bitMask) {
        mLightMask = bitMask;
    }

    public void setReticleSticky(boolean enabled) {
        mIsSticky = enabled;
    }

    public void setForceRender(boolean enabled) {
        mForcedRender = enabled;
    }

    @Override
    public void onPropsSet() {
        super.onPropsSet();
        updateVisibility();
    }

    public void setReticleVisibility(boolean reticleVisibility) {
        mIsReticleVisible = reticleVisibility;
    }

    public void setControllerVisibility(boolean controllerVisibility) {
        mIsControllerVisible = controllerVisibility;
    }

    private void updateVisibility(){
        if (mNativeController == null){
            return;
        }
        mNativeController.setControllerVisible(mIsControllerVisible);
        mNativeController.setReticleVisible(mIsReticleVisible);
        mNativeController.setLightReceivingBitMask(mLightMask);
        mNativeController.setReticleStickyDepth(mIsSticky);
        mNativeController.setForcedRender(mForcedRender);
    }
}
