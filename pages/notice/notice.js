// pages/notice/notice.js
import Util from '../../utils/util';
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    notice: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  },

  init: function(){
    let that = this;
    wx.request({
      url: app.globalData.host + '/announcement/list',
      method: 'GET',
      header: {
        'Authorization': app.globalData.jwtToken
      },
      success: function (res) {
        if (res.data.msg === 'ok') {
          let notice = res.data.retObj[0];
          if (notice) {
            notice.lastModifiedDate = notice.lastModifiedDate.split(' ')[0];
            that.setData({
              notice: notice
            });
          }
        }
      },
      fail: function (error) {
        console.log(error);
      }
    })
  },

  editAnnouncement: function (evt) {
    let noticeId = evt.currentTarget.dataset.noticeid;
    let userInfo = wx.getStorageSync('userInfo');
    //  if (userInfo.status === 2) {
      wx.navigateTo({
        url: 'editNotice?noticeId=' + noticeId + '&noticeCont=' + this.data.notice.content,
      })
    //  }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
     this.init();
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})
