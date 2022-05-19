//index.js
//获取应用实例
import Util from '../../utils/util';
import WXRequest from '../../utils/wxRequest';
const app = getApp();
let sliderWidth = 96;

Page({
  data: {
    myRanking: {},
    userRankingList: [],
    activeIndex: 0,
    sliderOffset: 0,
    sliderLeft: 0,
    tabArr: ["User", "My Prize"],
    prizeId: 0,
    prizeList: [],
    prizeListOpen: [],
    addressList: [],
    sessionRankingList: [],
    sessions: [],
    groupArr: [],
    selectedGroupId: 1,
    selectedGroupName: 'All',
    canJoin: false,
    canQuit: false,
    startDate: "",
    endDate: "",
  },
  onLoad: function () {
    console.log('userRankingList::onLoad');
    let that = this;
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          sliderLeft: (res.windowWidth / that.data.tabArr.length - sliderWidth) / 2,
          sliderOffset: res.windowWidth / that.data.tabArr.length * that.data.activeIndex
        });
      }
    });
    this.getGroupList();
    this._loadUserRanking();
  },

  onShow: function () {
    var verifyEmail = wx.getStorageSync('verifyEmail');
    if (!verifyEmail) {
      wx.navigateTo({
        url: '../welcome/welcome',
      });
    }
    this._refreshRanking();
  },

  getGroupList: function () {
    let that = this
    let currentDate = {
      isDuringDate: function (beginDateStr, endDateStr) {
        beginDateStr = beginDateStr.replace(/-/g, '/')
        endDateStr = endDateStr.replace(/-/g, '/')
        let curDate = new Date(),
          beginDate = new Date(beginDateStr),
          endDate = new Date(endDateStr);

        console.log(beginDateStr, endDateStr)
        // console.log(curDate, beginDate, endDate)
        if (curDate >= beginDate && curDate <= endDate) {
          return true;
        }
        return false;
      }
    }
    let userId = Util.getUserId();
    WXRequest.get('/group/list/' + userId).then(res => {
      if (res.data.length > 0) {
        if (this.data.startDate) {
          if (currentDate.isDuringDate(this.data.startDate, this.data.endDate)) {
            res.data.map((item) => { if (item.id == 34) { item.canJoin = false; item.canQuit = false } })
            this.setData({
              groupArr: res.data
            });
          } else {
            this.setData({
              groupArr: res.data
            });
          }
        } else {
          this.refreshDate();
          setTimeout(function () { that.getGroupList() }, 1000)
        }
      }
    }).catch(e => {
      console.log(e);
    });
  },

  onPullDownRefresh: function () {
    this._refreshRanking();
    wx.stopPullDownRefresh();

  },

  onGroupChange: function (e) {
    let selectedGroupIndex = e.detail.value;
    console.log("selectedGroupIndex: " + selectedGroupIndex);
    this.setData({
      selectedGroupId: this.data.groupArr[selectedGroupIndex].id,
      selectedGroupName: this.data.groupArr[selectedGroupIndex].name,
      canJoin: this.data.groupArr[selectedGroupIndex].canJoin,
      canQuit: this.data.groupArr[selectedGroupIndex].canQuit
    });
    this._refreshRanking();
  },

  tabClick: function (e) {
    let currentIndex = e.currentTarget.id;
    let name = this.data.tabArr[currentIndex];
    this.setData({
      sliderOffset: e.currentTarget.offsetLeft,
      activeIndex: currentIndex
    });
    if (currentIndex == 0) {
      this._setLoading(name, true);
      this._loadUserRanking();
    } else if (currentIndex == 1) {
      this._setLoading(name, true);
      this._getPrizeList()
    }
  },

  onClickGetMyPrize: function (e) {
    wx.navigateTo({
      // url: '../redeem/redeem?group=' + this.data.selectedGroupId + '&prizeid=' + this.data.prizeId,
      url: '../redeem/redeem?group=34&prizeid=' + this.data.prizeId,
    })
  },

  // User
  _loadUserRanking: function () {
    let myId = Util.getUserId();
    let that = this;
    wx.request({
      url: app.globalData.host + '/ranking/list/' + this.data.selectedGroupId + '/' + myId,
      method: 'GET',
      header: {
        'Authorization': app.globalData.jwtToken
      },
      success: function (res) {
        // console.log(res.data);
        that._findMyRanking(res.data);
        let tempRankList = res.data
        // console.log(tempRankList);
        that.setData({
          userRankingList: tempRankList
        });
      },
      fail: function (e) {
        Util.showToast('数据获取失败', 'none', 2000);
      }
    });
  },

  _findMyRanking: function (userRankingList) {
    let myId = Util.getUserId();
    let myRanking = userRankingList.filter(item => item.userId === myId)[0];
    if (myRanking == undefined) {
      myRanking = null;
    }
    this.setData({
      myRanking: myRanking
    });
  },

  _getPrizeList: function name(params) {
    let that = this;
    let myId = Util.getUserId();

    wx.request({
      // url: app.globalData.host + '/redeem/release/' + this.data.selectedGroupId + '/' + myId,
      url: app.globalData.host + '/redeem/release/34/' + myId,
      method: 'GET',
      header: {
        'Authorization': app.globalData.jwtToken
      },
      success: function (res) {
        // console.log(res.data);
        let prizeListOpen = [res.data.retObj]
        if (prizeListOpen && prizeListOpen[0] && prizeListOpen[0].id !== null) {
          prizeListOpen.map(item => {
            item.redeem = item.startDate.substr(0, 10) + ' ' + item.startDate.substr(11, 5) + ' to ' + item.endDate.substr(0, 10) + ' ' + item.endDate.substr(11, 5);
          })
          that.setData({
            prizeListOpen: prizeListOpen,
            prizeId: prizeListOpen[0].id
          });
        } else {
          that.setData({
            prizeListOpen: [],
            prizeId: 0
          });
        }
      },
      fail: function (e) {
        Util.showToast('Failed to get data', 'none', 2000);
      }
    })
    wx.request({
      url: app.globalData.host + '/redeem/prizes/' + myId,
      method: 'GET',
      header: {
        'Authorization': app.globalData.jwtToken
      },
      success: function (res) {
        // console.log(res.data);
        let prizeList = res.data
        if (prizeList.length >= 1) {
          prizeList.map(item => { item.redeem = item.startDate.substr(0, 10) + ' ' + item.startDate.substr(11, 5) + ' to ' + item.endDate.substr(0, 10) + ' ' + item.endDate.substr(11, 5); })
          that.setData({
            prizeList: prizeList,
          });
        } else {
          that.setData({
            prizeList: []
          });
        }
      },
      fail: function (e) {
        Util.showToast('Failed to get data', 'none', 2000);
      }
    })

  },

  _setLoading: function (name, showLoading) {
    this.setData({
      [name + ' Ranking Is Loading']: showLoading
    });
  },
  refreshDate: function () {
    let that = this;
    wx.request({
      url: app.globalData.host + '/redeem/date/',
      method: 'GET',
      header: {
        'Authorization': app.globalData.jwtToken
      },
      success: function (res) {
        console.log(res.data);
        if (res.data.startDate && res.data.endDate) {
          that.setData({
            startDate: res.data.startDate,
            endDate: res.data.endDate,
          });
        } else {
          that.setData({
            startDate: "",
            endDate: "",
          });
        }
      },
      fail: function (e) {
      }
    })
  },
  _refreshRanking: function () {
    this.refreshDate()
    this._getPrizeList()
    console.log('userRankingList::onPullDownRefresh');
    this.getGroupList();
    const activeIndex = this.data.activeIndex;
    let name = this.data.tabArr[activeIndex];
    if (activeIndex == 0) {
      this._setLoading(name, true);
      this._loadUserRanking();
    } else if (activeIndex == 1) {
      this._setLoading(name, true);
    }
  },

  onJoinClick: function (e) {
    console.log('id:' + e.currentTarget.id);
    let groupId = Number(e.currentTarget.id);
    let groupName = e.currentTarget.dataset.name;
    console.log('groupName:' + groupName);
    var that = this;
    wx.showModal({
      content: 'Are your sure to join ' + groupName + ' ?',
      cancelText: 'Cancel',
      confirmText: 'Confirm',
      success: function (res) {
        if (res.confirm) {
          that.joinGroup(groupId);
        }
      }
    })
  },

  joinGroup: function (groupId) {
    var that = this;
    let userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      WXRequest.post('/group/join/', {
        userId: userInfo.id,
        groupId: groupId
      }).then(res => {
        if (res.data.msg === 'ok') {
          console.log(res.data);
          that.setData({
            canJoin: false,
            canQuit: true
          })
          Util.showToast('Welcome', 'success', 1000);
          that._loadUserRanking();
        } else {
          Util.showToast('Join failed. Please try again', 'none');
        }
      }).catch(e => {
        Util.showToast('Please try again', 'none');
        console.log(e);
      });
    } else {
      Util.showToast('Please login first', 'none');
    }
  },

  onQuitClick: function (e) {
    console.log('id:' + e.currentTarget.id);
    let groupId = Number(e.currentTarget.id);
    let groupName = e.currentTarget.dataset.name;
    console.log('groupName:' + groupName);
    var that = this;
    wx.showModal({
      content: 'Are your sure to leave ' + groupName + ' ?',
      cancelText: 'Cancel',
      confirmText: 'Confirm',
      success: function (res) {
        if (res.confirm) {
          that.leaveGroup(groupId);
        }
      }
    })
  },

  leaveGroup: function (groupId) {
    var that = this;
    let userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      WXRequest.post('/group/leave/', {
        userId: userInfo.id,
        groupId: groupId
      }).then(res => {
        if (res.data.msg === 'ok') {
          console.log(res.data);
          that.setData({
            canJoin: true,
            canQuit: false
          })
          Util.showToast('Bye', 'success', 1000);
          that._loadUserRanking();
        } else {
          Util.showToast('Leave failed. Please try again', 'none');
        }
      }).catch(e => {
        Util.showToast('Please try again', 'none');
        console.log(e);
      });
    } else {
      Util.showToast('Please login first', 'none');
    }
  }

})
