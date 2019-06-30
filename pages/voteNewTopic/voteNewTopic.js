import Util from '../../utils/util';
import wxCharts from '../../utils/wxcharts.js';
import WXRequest from '../../utils/wxRequest';

const app = getApp();

Page({

  data: {
    userInfo: {},
    topics: {},
    hasUserInfo: false,
    isCreateTopicModalHidden: true,
    newTopic: ''
  },

  onLoad: function () {
    var userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      this.setData({
        userInfo: userInfo,
        hasUserInfo: true
      })
    }
    this.loadTopics();
  },

  loadTopics: function () {
    return WXRequest.post('/topic/list',{
      "pageNum": 1,
      "pageSize": 10,
      "userId": Util.getUserId()
    }).then(res => {
      if (res.data.msg === 'ok') {
        this.setData({
          topics: res.data.retObj
        });
      }
    }).catch(e => {
      console.log(e);
    });
  },

  goToSearchPage: function (evt) {
    wx.navigateTo({
      url: 'search'
    })
  },

  voteForTopic: function (evt) {
    let that = this;
    let topicId = evt.target.dataset.topicid;
    WXRequest.post('/topic/vote', {
      userId: Util.getUserId(),
      topicId: topicId
    }).then(res => {
      if (res.data.msg === 'ok'){
        that.loadTopics();
      }
    }).catch(e => {
       console.log(e);
    });
  },

  revertVoteForTopic: function (evt) {
    let that = this;
    let topicId = evt.target.dataset.topicid;
    WXRequest.post('/topic/cancel', {
      userId: Util.getUserId(),
      topicId: topicId
    }).then(res => {
      if (res.data.msg === 'ok') {
        that.loadTopics();
      }
    }).catch(e => {
      console.log(e);
    });
  },

  onCreateTopic: function(){
     this.setData({
       isCreateTopicModalHidden: false
     })
  },

  cancelSubmit: function(){
    this.setData({
      isCreateTopicModalHidden: true
    })
  },

  onNewTopicInput(event) {
    this.setData({
      newTopic: event.detail.value
    });
  },

  submitNewTopic: function(){
    let that = this;
    let topicName = this.data.newTopic;
    console.log('topicName: ' + topicName);
    WXRequest.post('/topic/add', {
      topicName: topicName
    }).then(res => {
      if(res.data.msg === 'ok') {
        Util.showToast('Success', 'success', 2000);
        this.setData({
          isCreateTopicModalHidden: true
        })
        that.loadTopics();
      }else{
        Util.showToast(res.data.msg, 'none', 2000);
      }
    }).catch(e => {
      console.log(e);
    });
  },

  onPullDownRefresh: function () {
    this.loadTopics();
    wx.stopPullDownRefresh();
  }
})
