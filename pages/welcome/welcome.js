// pages/welcome/welcome.js
import WXRequest from '../../utils/wxRequest';
import Util from '../../utils/util';

const app = getApp();
Page({

  /**
   * Page initial data
   */
  data: {
    hasUserInfo: false,
    emailVerified: false,
    email: ""
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function (options) {
    // console.log('home::onLoad::openId:' + app.globalData.openId);
    // if (!app.globalData.openId) {
    //   app.openIdCallback = openId => {
    //     console.log('home::openIdCallback:' + openId)
    //     if (openId) {
    //       WXRequest.get('/user/' + openId).then(res => {
    //         if (res.data.msg === 'ok') {
    //           console.log('/user/', res.data);
    //           this.setData({
    //             userInfo: res.data.retObj,
    //             email: res.data.retObj.email
    //           });
    //           WXRequest.get('/user/email/status', {
    //             userId: res.data.retObj.id,
    //             email: res.data.retObj.email
    //           }).then(res => {
    //             if (res.data.msg === 'ok') {
    //               console.log('/email/status', res.data);
    //               this.setData({
    //                 emailVerified: res.data.status
    //               });
    //               if (res.data.status){
    //                 wx.switchTab({
    //                   url: '../explore/explore',
    //                 })
    //               }
    //             }
    //           }).catch(e => {
    //             console.log(e);
    //           });
    //         }
    //       }).catch(e => {
    //         console.log(e);
    //       });
    //     }
    //   }
    // }


  },

  /**
   * Lifecycle function--Called when page is initially rendered
   */
  onReady: function () {

  },

  /**
   * Lifecycle function--Called when page show
   */
  onShow: function () {

  },

  /**
   * Lifecycle function--Called when page hide
   */
  onHide: function () {

  },

  /**
   * Lifecycle function--Called when page unload
   */
  onUnload: function () {

  },

  /**
   * Page event handler function--Called when user drop down
   */
  onPullDownRefresh: function () {

  },

  /**
   * Called when page reach bottom
   */
  onReachBottom: function () {

  },

  /**
   * Called when user click on the top right corner to share
   */
  onShareAppMessage: function () {

  },

  getUserInfo: function (e) {
    console.log(e)
    if (e.detail.userInfo) {
      this.addUser(e.detail.userInfo);
      if (!app.globalData.verifyEmail) {
        wx.navigateTo({
          url: './verifyEmail',
        });
      } else {
        wx.switchTab({
          url: '../explore/explore',
        })
      }

    } else {
      console.log(e.detail.errMsg)
    }
  },

  addUser: function (user) {
    var that = this;
    var openid = wx.getStorageSync('openid');
    console.log('openid: ' + openid)
    if (openid) {
      user.id = openid;
      wx.request({
        url: app.globalData.host + '/user/save',
        method: 'POST',
        header: {
          'Authorization': app.globalData.jwtToken
        },
        data: user,
        success: function (res) {
          console.log(res.data);
          user.status = 0;
          that.setData({
            userInfo: user,
            hasUserInfo: true
          })
          wx.setStorageSync('userInfo', user);
        },
        fail: function (e) {
          Util.showToast('登录失败', 'none', 1500);
        }
      })
    }
  }
})