import Util from '../../utils/util';
import wxCharts from '../../utils/wxcharts.js';

const app = getApp();
let hotTopics = [
  {
    rank: 1,
    name: 'HANA',
    points: 19967,
    voted: false
  },
  {
    rank: 2,
    name: 'SAPUI5',
    points: 18689,
    voted: false
  },
  {
    rank: 3,
    name: 'Javascript',
    points: 16375,
    voted: false
  },
  {
    rank: 4,
    name: 'Cloud',
    points: 12752,
    voted: false
  },
  {
    rank: 5,
    name: 'Java8',
    points: 8798,
    voted: false
  },
  {
    rank: 6,
    name: 'UI Design',
    points: 6550,
    voted: false
  },
  {
    rank: 7,
    name: 'Metadata Framwork',
    points: 6510,
    voted: false
  },
  {
    rank: 8,
    name: 'Role-Based Permission',
    points: 6310,
    voted: false
  },
  {
    rank: 9,
    name: 'Redis',
    points: 4311,
    voted: false
  }
]

Page({

  data: {
    userInfo: {},
    hotTopics: hotTopics,
    hasUserInfo: false,
    isCreateTopicModalHidden: true
  },

  onLoad: function () {
    var userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      this.setData({
        userInfo: userInfo,
        hasUserInfo: true
      })
    }
  },
  voteForTopic: function (evt) {
    let index = evt.target.dataset.topicindex;
    this.data.hotTopics[index].points += 1;
    this.data.hotTopics[index].voted = true;
    this.setData({
      hotTopics: this.data.hotTopics
    });
  },
  revertVoteForTopic: function (evt) {
    let index = evt.target.dataset.topicindex;
    this.data.hotTopics[index].points -= 1;
    this.data.hotTopics[index].voted = false;
    this.setData({
      hotTopics: this.data.hotTopics
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

  submitNewTopic: function(){
    this.setData({
      isCreateTopicModalHidden: true
    })
  }
})
