//app.js
import Util from 'utils/util';

App({
  globalData: {
    // host: 'http://localhost:8090',
    // host: 'https://carapi.techtuesday.club',
        host: 'https://skr.sapdigitallunch.com',
    // wshost: 'ws://localhost:8090',
    // wshost: 'wss://carapi.techtuesday.club',
        wshost: 'wss://skr.sapdigitallunch.com',
    openId: '',
    jwtToken: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJvcGVuSWQiOiIxMjM0NSJ9.jRKQjv2JJNx2LixkHC3cYs7E1JJnbtNB9RYOxxqzLUQ',
    template_id: 'WFa-LEeLhk9H-ICIDuaH1VaLIOhpWoT_9eYdJpvMcB4',
    systemInfo: {},
    share: false,
    verifyEmail: false
  },
  data: {},
  onLaunch: function (options) {
    console.log('app::onLaunch')
    // let openid = wx.getStorageSync('openid');
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
                that.globalData.verifyEmail = res.data.retObj.verified;
                wx.setStorageSync('openid', res.data.retObj.openid);
                wx.setStorageSync('jwtToken', res.data.retObj.jwtToken);
                wx.setStorageSync('verifyEmail', res.data.retObj.verified);
                if (this.openIdCallback) {
                  this.openIdCallback(res.data.retObj.openid)
                }
                var pages = getCurrentPages(); //获取加载的页面
                var currentPage = pages[pages.length - 1]; //获取当前页面的对象
                var url = currentPage.route; //当前页面url
                console.log(url);
                // 第一次打开小程序，发现没有验证过邮箱；如果不是welcome界面，就跳到welcome界面
                if ((!res.data.retObj.verified) && (url !== "pages/welcome/welcome") && (url !== "pages/welcome/verifyEmail")) {
                  wx.navigateTo({
                    url: '../welcome/welcome',
                  });
                }
              }
            }
          })
        }
      }
    });
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