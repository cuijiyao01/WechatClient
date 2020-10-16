// pages/welcome/verifyEmail.js
import WXRequest from '../../utils/wxRequest';
import Util from '../../utils/util';

Page({

  /**
   * Page initial data
   */
  data: {
    email: "",
    emailVerified: false,
    verifyCode: "",
    agreement: false,
    sentCode: false,
    sentCodeButton: "Send Code",
    bSuccess: false
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function (options) {

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

  sendCode: function () {
    var email = this.data.email;
    // Check Email Logic
    var reg = /^([a-zA-Z]|[0-9])(\w|\-)/;
    if (reg.test(email)) {
      console.log("邮箱格式正确");
      this.setData({
        email: email,
        sentCode: true
      });

      // Send Code
      var countdown = 60;
      var that = this;
      var openid = wx.getStorageSync('openid');
      WXRequest.post('/user/email/binding', {
        userId: openid,
        email: email + "@sap.com"
      }).then(res => {
        if (res.data.msg === 'ok') {
          console.log('/user/email/binding', res.data);

          function setTime(val) {
            var buttonLabel = "Sent ( " + countdown + " )";
            if (countdown > 0) {
              countdown--;
            }
            else{
              buttonLabel = "Sent"
            }
            setTimeout(function () {
              setTime(val);
            }, 1000);
            that.setData({
              sentCodeButton: buttonLabel
            });
          }
          setTime(countdown);
        }
      }).catch(e => {
        console.log(e);
      });

    } else {
      wx.showToast({
        title: 'Email Incorrect',
        icon: 'none'
      })
      console.log("邮箱格式不正确");
    }
  },

  logIn: function () {
    var openid = wx.getStorageSync('openid');
    // append check for email logic later
    var email = this.data.email;
    var that = this;
    WXRequest.post('/user/email/verify', {
      userId: openid,
      email: email + "@sap.com",
      code: this.data.verifyCode
    }).then(res => {
      if (res.data.msg === 'ok') {
        console.log('/user/email/verify', res.data);
        wx.switchTab({
          url: '../explore/explore',
        });
        that.setData({
          bSuccess: true
        });
      }
    }).catch(e => {
      console.log(e);
    });
    if(!this.data.bSuccess){
      wx.showModal({
        title: 'Error' ,
        content: 'Incorrect Code.',
        success: function(res) {
          if (res.confirm) {
          console.log('用户点击确定')
          } else if (res.cancel) {
          console.log('用户点击取消')
          }
        }
      });
    }
   
  },

  onVerifyCodeChange: function (e) {
    this.setData({
      verifyCode: e.detail.value
    });
  },

  onEmailChange: function (e) {
    this.setData({
      email: e.detail.value
    });
  },

  checkboxChange: function (e) {
    this.setData({
      agreement: e.detail.value.length
    });
  }
})