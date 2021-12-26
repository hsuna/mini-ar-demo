Page({
  data: {
    gyroscope: {
      x: 0,
      y: 0,
      z: 0,
    },
    accelerometer: {
      x: 0,
      y: 0,
      z: 0,
    },
    deviceMotion: {
      alpha: 0,
      beta: 0,
      gamma: 0,
    },
    compass: {
      direction: 0,
      accuracy: 0,
    }
  },
  onLoad: function () {
    
    wx.startDeviceMotionListening({
      success: () => {
        wx.onDeviceMotionChange((res) => {
          this.setData({
            deviceMotion: res,
          })
        })
      }
    })

    wx.startAccelerometer({
      success: () => {
        wx.onAccelerometerChange((res) => {
          this.setData({
            accelerometer: res,
          })
        })
      }
    })
    
    wx.startCompass({
      success: () => {
        wx.onCompassChange((res) => {
          this.setData({
            compass: res,
          })
        })
      }
    })
    wx.startGyroscope({
        success: () => {
            wx.onGyroscopeChange((res) => {
              this.setData({
                gyroscope: res
              })
            })
        }
    });
  },
  onUnload() {
    wx.stopCompass({
      success: (res) => {},
    })
    wx.stopDeviceMotionListening({
      success: (res) => {},
    })
    wx.stopGyroscope({
      success: (res) => {},
    })
    wx.stopAccelerometer({
      success: (res) => {},
    })
  },
  tap: function(e) {
    let path = e.target.dataset.id
    wx.navigateTo({
      url: `/pages/${path}/index`
    })
  }
})
