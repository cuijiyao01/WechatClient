import WXRequest from '../../utils/wxRequest';
import WCache from '../../utils/wcache';
import Util from '../../utils/util';

const app = getApp();

Page({
  data: { // 参与页面渲染的数据
    aEnrollmentList: [],
    canDownloadEnrollmentList: false,
    sessionId: 0,
    userId: 0
  },

  onLoad: function (options) {
    this.setData({
      sessionId: options.sessionId
    });
    console.log(options)
    this.doLoadEnrollmentList();
  },

  onShow: function(e){
    this.showDownloadEnrollmentButton(); 
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
    });
  },
  onDownloadEnrollmentList:function(){
    let userId = Util.getUserId();
    WXRequest.post('/session/getEnrollmentsByEmail',{
        userId: userId,
        sessionId: this.data.sessionId
      }).then(res=>{
      console.log(this.data.sessionId);
      console.log(userId);
      if (res.data.msg === 'ok') {
        Util.showToast('Request sending enrollments list to your email address success', 'success', 1000);
      }else{
        this.showError('Request failed. Please try again');
      }
    })
  },
  showDownloadEnrollmentButton(){
    // if user is creator or owner or group owner of the session,
    // DownloadEnrollment button will be displayed
    let userId = Util.getUserId();
    WXRequest.post('/session/detail', {
      sessionId: this.data.sessionId,
      userId: userId
    }).then(res => {
      wx.hideLoading();
      if (res.data.msg === 'ok') {
        let retObj = res.data.retObj;
        let eventDetail = retObj.session;
        let isOwner = this._isOwner(eventDetail.owner.id);
        let isGroupOwner = this._isOwner(eventDetail.group.ownerId);
        let isCreator = eventDetail.createdBy === Util.getUserId();
        this.setData({
          isOwner: isOwner,
          isGroupOwner: isGroupOwner,
          canDownloadEnrollmentList: ((isOwner || isCreator || isGroupOwner)),
        });
        console.log("canDownloadEnrollmentList",isOwner, isCreator, isGroupOwner);
      }
    }).catch(e => {
      console.log(e);
    });
  },
  showError: function(title) {
    Util.showToast(title, 'none');
  },
  _isOwner(ownerId) {
    let userId = Util.getUserId();
    if (ownerId === userId) {
      return true;
    }
    return false;
  }
})