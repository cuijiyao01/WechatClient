import WXRequest from '../../utils/wxRequest';
import WCache from '../../utils/wcache';
import Util from '../../utils/util';

const app = getApp();

Page({
  data: { // 参与页面渲染的数据
    aEnrollmentList: [],
    sessionId: 0
  },

  onLoad: function (options) {
    this.setData({
      sessionId: options.sessionId
    });
    this.doLoadEnrollmentList();
  },

  doLoadEnrollmentList: function () {
    wx.showLoading({
      title: 'Loading',
      mask: true
    });
    
    WXRequest.get('/session/memberList/' + this.data.sessionId).then(res => {
      wx.hideLoading();
      console.log(this.data.sessionId);
      if (res.data.msg === 'ok') {
        this.setData({
          aEnrollmentList: res.data.retObj
        });
      }
    })
  }
})