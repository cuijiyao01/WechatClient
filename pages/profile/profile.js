import Util from '../../utils/util';
import WCache from '../../utils/wcache';
import WXRequest from '../../utils/wxRequest';


const app = getApp(); 
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo:{},
    isLoading:false,
    isModified: false,
    t_length: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    let that = this;
    let userId = Util.getUserId();
    if (userId) {

      WXRequest.get('/user/' + userId).then(res => {
        if (res.data.msg === 'ok') {
          console.log('/user/', res.data);
          this.setData({
            userInfo: res.data.retObj,
            t_length: res.data.retObj.signature? res.data.retObj.signature.length: 0
          });
        }
      }).catch(e => {
        console.log(e);
      });
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    console.log('user infois ' + this.data.userInfo.toString());
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
    
  },

  onSubmit: function (e) {
    let value = e.detail.value;
    let userDetail = this._buildUserDetail(value);
    if (this.checkEmail(userDetail.email)){
      WXRequest.post('/user/edit', userDetail).then(res => {
        if (res.data.msg === 'ok') {
          Util.showToast('Success', 'success', 1000);
          setTimeout(function () {
            wx.navigateBack({
              delta: 1
            });
          }, 1000);
        }
      }).catch(e => {
        console.log(e);
      });
    }
  },

  checkEmail: function(email) {
    if (email) {
      let str = /\S+@\S+\.\S+/;
      if (!str.test(email)) {
        Util.showToast('Email is not correct', 'none', 2000)
        return false;
      }
    }
    return true;
  },

  _buildUserDetail: function (value) {

    let userDetail = {
      id:this.data.userInfo.id,
      // gender: value.gender,
      nickName: value.nickName,
      department: value.department,
      blog: value.blog,
      signature:value.signature? value.signature: "",
      github:value.github,
      seat:value.seat,
      email:value.email,
      title: value.title,
      t_length: value.signature?value.signature.length: 0
    };
    return userDetail;
  },

  bindText: function (e) {
    var t_text = e.detail.value.length;
    this.setData({
      t_length: t_text
    }) 
    if (!this.data.isModified) {
      this.setData({
        isModified: true
      })
    }
  },

  onProfileDataChange: function(e) {
    if (!this.data.isModified) {
      this.setData({
        isModified: true
      })
    }
  }
})