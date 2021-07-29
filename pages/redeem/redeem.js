// pages/redeem/redeem.js
import Util from '../../utils/util';
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    groupID: undefined,
    addressList: [],
    addressIndex: null,
    phoneValue: '',
    wxss_prefix: 'unable'
  },

  bindPickerChange: function (e) {
    this.setData({
      addressIndex: e.detail.value
    })
  },

  bindHideKeyboard: function (e) {
    if (e.detail.value.length === 11 && this.data.addressIndex !== null) {
      this.setData({
        phoneValue: e.detail.value,
        wxss_prefix: "able"
      })
      // 收起键盘
      wx.hideKeyboard()
    }
    else {
      this.setData({
        phoneValue: e.detail.value
      })
    }
  },

  _getAddressList: function () {
    let that = this;
    wx.request({
      url: app.globalData.host + '/redeem/addresses',
      method: 'GET',
      header: {
        'Authorization': app.globalData.jwtToken
      },
      success: function (res) {
        that.setData({
          addressList: res.data
        });
      },
      fail: function (e) {
        Util.showToast('数据获取失败', 'none', 2000);
      }
    });
  },

  onClickSubmit: function () {
    let dataTemp = {
      address: { "id": this.data.addressList[this.data.addressIndex].id },
      userId: app.globalData.openId,
      phone: this.data.phoneValue,
      groupId: this.data.groupID,
      userName: "zhiyuan"
      //inumber
      //prizeId
    }
    console.log(dataTemp)
    let that = this;
    wx.request({
      url: app.globalData.host + '/redeem/submit',
      data: dataTemp,
      method: 'POST',
      header: {
        'Authorization': app.globalData.jwtToken
      },
      success: function (res) {
        console.log("submit success")
        // that.setData({
        //   addressList: res.data
        // });
      },
      fail: function (e) {
        Util.showToast('兑奖失败', 'none', 2000);
      }
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      groupID: options.group
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this._getAddressList();

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

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
    this._getAddressList();
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