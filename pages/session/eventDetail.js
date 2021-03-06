import WXRequest from '../../utils/wxRequest';
import WCache from '../../utils/wcache';
import Util from '../../utils/util';

const app = getApp();

const ENROLL_NUMBER = 1;
Page({
  data: { // 参与页面渲染的数据
    pageQueries: {},
    difficulties: {
      '0': 'Beginner',
      '1': 'Intermediate',
      '2': 'Advanced'
    },
    isOwner: false,
    isGroupOwner: false,
    disabled: false,
    loading: false,
    registerBtnVal: 'Register',
    unRegisterBtnVal: 'UnRegister',
    startBtnVal: 'Start Session',
    startBtnDisabled: false,
    quizBtnVal: 'Quiz-M',
    lotteryBtnVal: 'Lottery',
    quizBtnDisabled: false,
    eventDetail: null,
    status: -1,
    sessionId: 0,
    checkInBtnVal: 'Check-In',
    checkInDisabled: false,
    checkInCode: '',
    isCheckInModalHidden: true,
    isRewardModalHidden: true,
    startQuizBtnVal: 'Quiz',
    startQuizBtnDisabled: false,
    isRegistered: false,
    canEdit: false,
    canDelete: false,
    isLiked: 0,
    totalLikeCount: 0,
    share: app.globalData.share,
    accessToken: '',
    sessionQRCode: null,
    externalSpeaker: false,
    canManage: false
  },

  onLoad: function (e) {
    this.data.pageQueries = e;
    this.doLoadDetail();
  },

  onShow: function(e){
    //this.doLoadDetail();
    var userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      this.setData({
        userInfo: userInfo,
        hasUserInfo: true
      });
    }
    var verifyEmail = wx.getStorageSync('verifyEmail');
    if (!verifyEmail) {
      wx.navigateTo({
        url: '../welcome/welcome',
      });
    }

    this.setData({
      share: app.globalData.share
    });
    const {id} = this.data.pageQueries;
    
    let userId = Util.getUserId();
    this.setData({
      sessionId: id
    });
  
    this._checkGuest(userId);
    this._isCheckedIn();
    wx.showLoading({
      title: 'Loading',
      mask: true
    });

    WXRequest.post('/session/detail', {
      sessionId: id,
      userId: userId
    }).then(res => {
      wx.hideLoading();
      if (res.data.msg === 'no_data') {
        Util.showToast('Sorry, your session is already removed', 'none', 3000);
        setTimeout(function () {
          wx.switchTab({
            url: '../explore/explore',
          });
        }, 3000);
    }
      if (res.data.msg === 'ok') {
        console.log(res.data.retObj.session);
        let retObj = res.data.retObj;
        let eventDetail = retObj.session;
        let likeCount = retObj.session.likeCount;
        let isOwner = this._isOwner(eventDetail.owner.id);
        let isGroupOwner = this._isOwner(eventDetail.group.ownerId);
        let isCreator = eventDetail.createdBy === Util.getUserId();
        let checkInCode = eventDetail.checkInCode;
        let recording = eventDetail.recording;
        let meetingLink = eventDetail.meetingLink;
        let externalSpeaker = eventDetail.owner.externalSpeaker;
        if (checkInCode) {
          this._markStarted(checkInCode);
        }
        this.setData({
          isOwner: isOwner,
          isGroupOwner: isGroupOwner,
          eventDetail: eventDetail,
          status: retObj.session.status,
        //  canEdit: ((isOwner || isCreator || isGroupOwner) && (retObj.session.status == 0)), // when status is not finished, owner, creator, groupowner can edit
          canEdit: ((isOwner || isCreator || isGroupOwner)), // this time we open the edit authority to owner, creator and group owner even if the session is finished
          canDelete: ((isOwner || isCreator || isGroupOwner)), // this time we open the edit authority to owner, creator and group owner even if the session is finished
          canManage: (isOwner || isCreator || (isGroupOwner && externalSpeaker)), // 
          totalLikeCount: likeCount,
          recording: recording,
          meetingLink: meetingLink,
          externalSpeaker: externalSpeaker
        });
        if (userId && retObj.userRegistered) {
          this._markRegistered();
        }
        this._doLoadQR();
        console.log("isGroupOwner", this.data.isGroupOwner);
        console.log("canEdit",this.data.canEdit);
        console.log("canDelete",this.data.canDelete);
        console.log("canManage",isOwner, isCreator, isGroupOwner, externalSpeaker);
        console.log("status", this.data.status);
        console.log("register", this.data.isRegistered);
      }
    }).catch(e => {
      console.log(e);
    });
    this._getLike(userId);
  },

  _getAccessToken: function () {
    return WXRequest.get('/web/access_token').then(res => {
      if (res.data.msg === 'ok') {
        this.setData({
          accessToken: res.data.retObj
        })
      }
    }).catch(e => {
      console.log(e);
    });
  },

  _doLoadQR: function () {
      wx.request({
        url: app.globalData.host + '/web/getwxacode',
        method: 'POST',
        header: {
          'Authorization': app.globalData.jwtToken
        },
        data: { 
          path: '/pages/session/eventDetail?id=' + this.data.sessionId,
          width: 430
        },
        success: res => {
          if(res.data.msg === 'ok'){
            this.setData({
              sessionQRCode: res.data.retObj
            })
          }
        },
        fail: err => {
          console.log(err);
        }
      });
  },

  doLoadDetail: function () {
   
  },

  goRankDetail(e) {
    let userId = e.currentTarget.id;
    wx.navigateTo({
      url: '../rankinglist/rankingdetail?userId=' + userId,
    })
  },

  // goRecording() {
  //   let recording = this.data.recording;
  //   console.log(recording);
  // },

  copyText: function (e) {
    console.log(e.currentTarget)
    wx.setClipboardData({
      data: this.data.recording,
      success: function (res) {
        wx.getClipboardData({
          success: function (res) {
            wx.showToast({
              title: 'Copy Success'
            })
          }
        })
      }
    })
  },

  copyTextMeeting: function (e) {
    console.log(e.currentTarget)
    wx.setClipboardData({
      data: this.data.meetingLink,
      success: function (res) {
        wx.getClipboardData({
          success: function (res) {
            wx.showToast({
              title: 'Copy Success'
            })
          }
        })
      }
    })
  },

  _isOwner(ownerId) {
    let userId = Util.getUserId();
    if (ownerId === userId) {
      return true;
    }
    return false;
  },

  _canStart(enrollments) {
    return enrollments >= ENROLL_NUMBER;
  },

  _checkGuest: function (userId) {
    if (userId === 'abc') {
      // guest cannot register
      this.setData({
        registerBtnVal: 'Login to Register',
        disabled: true
      });
    }
  },

  _markRegistered: function () {
    this.setData({
      isRegistered: true,
      registerBtnVal: 'Registered'
    });
  },

  onManageQuiz: function(){
    wx.navigateTo({
      url: '../uploadQuestion/uploadQuestion?sessionId=' + this.data.sessionId,
    })
  },

  onStartQuiz: function () {
    let userInfo = wx.getStorageSync('userInfo');
    let isCheckedIn = WCache.get(this.data.sessionId + '_checkedIn');
    if (!userInfo) {
      Util.showToast('Please login fisrt', 'none', 2000);
    } else if (!isCheckedIn) {
      Util.showToast('Please check in first', 'none', 2000);
    } else {
      wx.navigateTo({
        url: '../exam/exam?sessionId=' + this.data.sessionId,
      })
    }
  },

  onStartLottery: function () {
    let userInfo = wx.getStorageSync('userInfo');
    let isCheckedIn = WCache.get(this.data.sessionId + '_checkedIn');
    if (!userInfo) {
      Util.showToast('Please login first', 'none', 2000);
    } else if (!isCheckedIn) {
      Util.showToast('Please check in first', 'none', 2000);
    } else {
      wx.navigateTo({
      //  url: '../lottery/lottery?sessionId=' + this.data.sessionId + '&isOwner=' + this.data.isOwner,
        url: '../lottery/lottery?sessionId=' + this.data.sessionId + '&isOwner=' + this.data.canManage,
      })
    }
  },

  onRegister: function(event) {
    console.log('Register: ', event);
    let userId = Util.getUserId();
    if(userId  == 'abc'){
      wx.switchTab({
        url: '../../pages/home/home',
      })
    } else {
      WXRequest.post('/session/register/', {
        userId: userId,
        sessionId: this.data.eventDetail.id
      }).then(res => {
        if (res.data.msg === 'ok') {
          let eventDetail = this.data.eventDetail;
          eventDetail.enrollments += 1;
          this.setData({
            isRegistered: true,
            eventDetail: eventDetail
          })
          Util.showToast('Success', 'success', 1000);
        } else {
          this.showError('Register failed. Please try again');
        }
      }).catch(e => {
        this.showError('Please try again');
        console.log(e);
      });
    }
  },

  unRegister: function (event) {
    console.log('unRegister: ', event);
    let userId = Util.getUserId();
    WXRequest.post('/session/unregister/', {
      userId: userId,
      sessionId: this.data.eventDetail.id
    }).then(res => {
      let eventDetail = this.data.eventDetail;
      eventDetail.enrollments -= 1;
      if (res.data.msg === 'ok') {
        console.log(res.data);
        this.setData({
          isRegistered: false,
          eventDetail: eventDetail
        })
        Util.showToast('Success', 'success', 1000);
      } else {
        this.showError('unRegister failed. Please try again');
      }
    }).catch(e => {
      this.showError('Please try again');
      console.log(e);
    });
  },

  onCheckCode: function(){
    wx.showModal({
      title: 'Check in Code',
      content: this.data.startBtnVal,
      showCancel: false,
      confirmText: 'Confirm',
      success(res) {
        if (res.confirm) {
          console.log('Click Confirm');
        } 
      }
    })
  },

  _isCheckedIn() {
    let isCheckedIn = WCache.get(this.data.sessionId + '_checkedIn');
    if (isCheckedIn) {
      this._markCheckedIn();
    }
  },

  _markCheckedIn() {
    this.setData({
      checkInDisabled: true,
      checkInBtnVal: 'Checked-In'
    });
  },

  onCheckIn() {
    this.setData({
      isCheckInModalHidden: false
    });
  },

  onCheckInCodeInput(event) {
    this.setData({
      checkInCode: event.detail.value
    });
  },

  submitCheckInCode() {
    this.setData({ isCheckInModalHidden: true });
    let userId = Util.getUserId();
    let checkInCode = this.data.checkInCode;
    var that = this;
    WXRequest.post('/checkin/submit', {
      sessionId: this.data.eventDetail.id,
      userId: userId,
      code: checkInCode
    }).then(res => {
      if (res.data.msg === 'ok') {
        Util.showToast('Credits +1', 'success', 2000);
        WCache.put(that.data.sessionId + '_checkedIn', true, 24 * 60 * 60);
        this._markCheckedIn();
      } else {
        Util.showToast('Failed', 'none', 2000);
      }
    }).catch(e => {
      console.log(e);
    });
  },    

  cancelCheckIn() {
    this.setData({ isCheckInModalHidden: true });
  },

  _getLike: function (userId) {
    WXRequest.post('/session/getlike/', {
      userId: userId,
      sessionId: this.data.sessionId
    }).then(res => {
      if (res.data.msg === 'ok') {
        this.setData({
          isLiked: res.data.retObj
        })
      } else {
        this.showError('get like count failed. Please try again');
      }
    }).catch(e => {
      this.showError('Please try again');
      console.log(e);
    });
  },
  onStartSession(event) {
  //  let userId = Util.getUserId();
    let canStart = this._canStart(this.data.eventDetail.enrollments);
    var that = this;
    if (canStart) {
      WXRequest.post('/session/start', {
        sessionId: this.data.eventDetail.id,
      //  userId: userId
        userId: this.data.eventDetail.owner.id
      }).then(res => {
        if (res.data.msg === 'ok') {
          console.log(res.data);
          var credits = res.data.retObj.SharePoints;
          Util.showToast('Credits +' + credits, 'success', 2000);
          let checkInCode = res.data.retObj.CheckInCode;
          this._markStarted(checkInCode);
          WCache.put(that.data.sessionId + '_checkedIn', true, 24 * 60 * 60);
          WCache.put(that.data.sessionId + '_started', true, 24 * 60 * 60);
        }
      }).catch(e => {
        console.log(e);
      });
    } else {
      Util.showToast("Enrollments has not reached to the threshold.", 'none', 3000);
    }
  },

  onEditSession() {
    wx.navigateTo({
      url: '../session/newEvent?id=' + this.data.sessionId
    });
  },

  onDeleteSession() {
    let that = this;
    wx.showModal({
      title: '提示',
      content: '确定要删除吗？',
      success (res) {
        if (res.confirm) {
          // console.log('用户点击确定')
          WXRequest.delete('/session/delete/' + that.data.eventDetail.id).then(res => {
            if (res.data.msg === 'ok') {
              Util.showToast('Delete Success','success',1000);
              setTimeout(function () {
                wx.navigateBack({
                  delta: 1
                });
              }, 1000);
            } else {
              this.showError('delete session failed. Please try again');
            }
          }).catch(e => {
            this.showError('Please try again');
            console.log(e);
          });
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },

  _markStarted(checkInCode) {
    this.setData({
      startBtnVal: `${checkInCode}`,
      startBtnDisabled: true,
      status: 1
    });
  },

  onChangeLikeStatus: function () {
    if (this.data.isOwner){
      Util.showToast('Cannot like your own session', 'none', 2000);
    } else {
      let userId = Util.getUserId();
      let likeStatus = this.data.isLiked === 1 ? 0 : 1;
      let addCount = likeStatus === 1 ? 1 : -1;
      let currenttotalLikeCount = this.data.totalLikeCount + addCount;
      WXRequest.post('/session/like/', {
        userId: userId,
        sessionId: this.data.eventDetail.id,
        like: likeStatus
      }).then(res => {
        if (res.data.msg === 'ok') {
          console.log(res.data);
          this.setData({
            isLiked: likeStatus,
            totalLikeCount: currenttotalLikeCount
          })
        } else {
          if (res.data.status == 0){
            Util.showToast('You havent checked in', 'none', 2000);
          }else{
            this.showError('You havent registered this seesion');
          }
        }
      }).catch(e => {
        this.showError('Please try again');
        console.log(e);
      });
    }
  },

  showError: function(title) {
    Util.showToast(title, 'none');
  },

  onShareAppMessage: function (res) {
    return {
      title: this.data.eventDetail.topic,
      path: '/pages/session/eventDetail?id=' + this.data.sessionId,
      imageUrl: app.globalData.host + this.data.eventDetail.tileImageSrc
    }
  },

  onPullDownRefresh: function () {
    this.doLoadDetail();
    wx.stopPullDownRefresh();
  },

  goToIndex: function() {
    app.globalData.share = false;
    wx.switchTab({
      url: '../../pages/explore/explore',
    })
  }

});
