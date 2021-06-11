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
    // 第n次打开小程序，发现验证过邮箱，就跳到verifyEmail界面
    var verifyEmail = wx.getStorageSync('verifyEmail');
    console.log('verifyEmail: ' + verifyEmail);
    if (verifyEmail) {
      wx.switchTab({
        url: '../explore/explore',
      });
    }
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

  getUserProfile: function (e) {
    wx.getUserProfile({
      desc: '用于完善会员资料', 
      success: (res) => {
        this.addUser(res.userInfo);
        if (!app.globalData.verifyEmail) {
          wx.navigateTo({
            url: './verifyEmail',
          });
        } else {
        if (app.globalData.share && (app.globalData.sessionDatail != null)){
          wx.navigateTo({
            url: '../session/eventDetail?id=' + app.globalData.sessionDatail,
          });
        }else{
          wx.switchTab({
            url: '../explore/explore',
          })
          }
        }
      },
      error: (err) => {
        console.log(err.errMsg)
      }
    })
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