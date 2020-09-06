//app.js
import Util from 'utils/util';
App({
  globalData: {
     host: 'http://localhost:8090',
    // host: 'https://carapi.techtuesday.club',
     wshost: 'ws://localhost:8090',
     //wshost: 'wss://carapi.techtuesday.club',
     openId:'',
     jwtToken: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJvcGVuSWQiOiIxMjM0NSJ9.jRKQjv2JJNx2LixkHC3cYs7E1JJnbtNB9RYOxxqzLUQ',
     template_id:'WFa-LEeLhk9H-ICIDuaH1VaLIOhpWoT_9eYdJpvMcB4',
     systemInfo: {},
     share: false
  },
  data: {
  },
  onLaunch: function (options) {
    console.log('app::onLaunch')
    let openid = wx.getStorageSync('openid');
    this.globalData.systemInfo = wx.getSystemInfoSync();
    //if (!openid) {
      var that = this
      // 登录
      wx.login({
        success: res => {
          // 发送 res.code 到后台换取 openId, sessionKey, unionId
          if (res.code) {
            wx.request({
              url: that.globalData.host + '/user/login/' + res.code,
              method: 'GET',
              success: res => {
                console.log(res.data);
                if (res.data.retObj) {
                  that.globalData.openId = res.data.retObj.openid
                  that.globalData.jwtToken = res.data.retObj.jwtToken
                  wx.setStorageSync('openid', res.data.retObj.openid); 
                  wx.setStorageSync('jwtToken', res.data.retObj.jwtToken); 
                  if(this.openIdCallback){
                    this.openIdCallback(res.data.retObj.openid)
                  }   
                }          
              }
            })
          }
        }
      })
    // } else {
    //   this.globalData.openId = openid
    // }
  },
  onShow: function (options) {
    // 判断是否由分享进入小程序
    if (options.scene == 1007 || options.scene == 1008) {
      this.globalData.share = true
    } else {
      this.globalData.share = false
    };
  }
})