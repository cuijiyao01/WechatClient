// pages/redeem/redeem.js
import Util from '../../utils/util';
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    groupID: undefined,
    prizeId: undefined,
    addressList: [],
    addressIndex: null,
    phoneValue: '',
    inumberValue: '',
    nameValue: '',
    wxss_prefix: 'unable'
  },

  checkInput: function () {
    if (this.data.addressIndex !== null &&
      this.data.phoneValue.length >= 11 &&
      this.data.inumberValue.length >= 6) {
      this.setData({
        wxss_prefix: "able"
      })
    }
  },

  bindPickerChange: function (e) {
    this.setData({
      addressIndex: e.detail.value
    });
  },

  bindInumberInput: function (e) {
    this.setData({
      inumberValue: e.detail.value
    })
    if (e.detail.value.length >= 5) {
      this.checkInput();
    }
    if (e.detail.value.length >= 7) {
      wx.hideKeyboard();
    }
  },

  bindNameInput: function (e) {
    this.setData({
      nameValue: e.detail.value
    })
    if (e.detail.value.length >= 1) {
      this.checkInput();
    }
  },

  bindPhoneInput: function (e) {
    this.setData({
      phoneValue: e.detail.value
    })
    if (e.detail.value.length === 11) {
      this.checkInput();
      wx.hideKeyboard();
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
      userName: this.data.nameValue,
      inumber: this.data.inumberValue,
      prizeId: this.data.prizeId
    }
    wx.request({
      url: app.globalData.host + '/redeem/submit',
      data: dataTemp,
      method: 'POST',
      header: {
        'Authorization': app.globalData.jwtToken
      },
      success: function (res) {
        if (res.data.msg == "ok") {
          Util.showToast('兑奖成功', 'none', 2000);
          console.log("submit success")
          setTimeout(() => {
            wx.navigateBack({
              delta: 0,
            })
          }, 2000);
        }
        else {
          Util.showToast('兑奖失败', 'none', 2000);
        }
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
      groupID: options.group,
      prizeId: options.prizeid
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