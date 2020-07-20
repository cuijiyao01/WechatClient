// pages/session/newEvent.js
import Util from '../../utils/util';
import WXRequest from '../../utils/wxRequest';

Page({

  /**
   * Page initial data
   */
  data: {
    dateTimeArray: null,
    startDateTime: null,
    // endDateTime: null,
    startDateTimeVal: '',
    // endDateTimeVal: '',
    startYear: 2018,
    endYear: 2118,
    durations: ['30 Minutes', '45 Minutes', '1 Hour', '2 Hours'],
    durationIndex: 0,
    difficulties: ['Beginner', 'Intermediate', 'Advanced'],
    difficultyIndex: 0,
    locations: [{
        id: 1,
        name: "MR PVG03 B2.1 (06) (RT)"
      },
      {
        id: 2,
        name: "MR PVG03 B3.1 (06) (RT)"
      }
    ],
    locationIndex: 0,
    directions: [{
        id: 2,
        name: "Cutting Edge Tech",
        imageSrc: null
      },
      {
        id: 3,
        name: "Frontend",
        imageSrc: null
      }
    ],
    directionIndex: 0,
    groupIndex: 0,
    mode: "create",
    editSessionDetail: null,
    formData: {},
    tea2: 0,
    //Add for meeting rooms
    showInputStatus: false,
    inputLocation: '',
    locationsName: ["MR PVG03 B2.1 (06) (RT)", "MR PVG03 B3.1 (06) (RT)"],
    bindSource: [],
    scrollhight: 100,
    allUserInfo: [],
    // createdBy: '',
    // lastModifiedBy: '', 
    presenterInput: '',
    // presenterId: '',
    userMatched: [],
  },
  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function(options) {
    this._initDateTimePicker();
    this._initPresenter();
    const initDataPromise = this._initData();
    this._initAllUserInfo();
    this._initEditData(options, initDataPromise);
  },

  _initData: function() {
    return WXRequest.get('/session/init/' + Util.getUserId()).then(res => {
      if (res.data.msg === 'ok') {
        console.log('/session/init', res.data);
        let retObj = res.data.retObj;
        this.setData({
          directions: retObj.directions,
          locations: retObj.locations,
          groups: retObj.groups,
          locationsName: retObj.locations.map(val => val.name)
        });
      }
    }).catch(e => {
      console.log(e);
    });
  },

  _initPresenter: function () {
    this.setData({
      presenterInput: Util.getUserNickname(),
      presenterId: Util.getUserId()
    });
  },

  _initAllUserInfo: function () {
    WXRequest.post('/user/all', {
      pageNum: 1, 
      pageSize: 1000 
    }).then(res => {
      if (res.data.msg === 'ok') {
        console.log('/session/init', res.data);
        let retObj = res.data.retObj;
        this.setData({
          allUserInfo: res.data.retObj
        });
      }
    }).catch(e => {
      console.log(e);
    });
    
  },



  _initEditData: function(options, initDataPromise) {
    // if there is no 'id' params in page options, means it's not an edit action
    if (options == null || options.id == null) {
      wx.setNavigationBarTitle({
        title: "Create New Session"
      })
      return;
    }

    // handle edit data init
    this.setData({
      mode: "edit"
    })
    wx.setNavigationBarTitle({
      title: "Edit Session Detail"
    })
    let userId = Util.getUserId();

    wx.showLoading({
      title: 'Loading',
      mask: true
    })
    WXRequest.post('/session/detail', {
      sessionId: options.id,
      userId: userId
    }).then(res => {
      wx.hideLoading();
      if (res.data.msg === 'ok') {
        const retObj = res.data.retObj;
        console.log(retObj.session)

        initDataPromise.then(() => {
          this.setData({
            editSessionDetail: retObj.session,
            formData: retObj.session,
            startDateTime: this._calDateTimeStr2Arr(retObj.session.startDate),
            startDateTimeVal: retObj.session.startDate,
            durationIndex: this._calDuartionIndex(retObj.session.startDate, retObj.session.endDate),
            inputLocation: retObj.session.location.name,
            directionIndex: this.data.directions.map(val => val.name).indexOf(retObj.session.direction.name),
            groupIndex: this.data.groups.map(val => val.name).indexOf(retObj.session.group.name),
            difficultyIndex: retObj.session.difficulty,
            tea2: retObj.session.tea2,
            presenterInput: retObj.session.owner.nickName,
            presenterId: retObj.session.owner.id
          });
        })
      }
    }).catch(e => {
      console.log(e);
    });
  },

  _initDateTimePicker: function() {
    // 获取完整的年月日 时分秒，以及默认显示的数组
    let dateTimeObj = Util.dateTimePicker(this.data.startYear, this.data.endYear);
    let dateTimeArray = dateTimeObj.dateTimeArray;
    let dateTime = dateTimeObj.dateTime;

    let startDateTimeVal = this._calDateTimeVal(dateTime, dateTimeArray)

    this.setData({
      dateTimeArray: dateTimeArray,
      startDateTime: dateTime,
      startDateTimeVal: startDateTimeVal
      // endDateTime: dateTimeObj.dateTime
    });
  },

  changeSartDateTimeVal(e) {
    let dateTime = e.detail.value;
    let startDateTimeVal = this._calDateTimeVal(dateTime);
    this.inputChange('startDateTimeVal', startDateTimeVal);
  },

  _calDateTimeVal: function(dateTime, oriDateTimeArray) {
    let dateTimeArray = this.data.dateTimeArray || oriDateTimeArray;
    let temp = dateTime.map((val, i) => {
      return dateTimeArray[i][val];
    });
    let dateTimeVal = `${temp[0]}-${temp[1]}-${temp[2]} ${temp[3]}:${ temp[4]}`;
    console.log(dateTimeVal);
    return dateTimeVal;
  },

  _calDateTimeStr2Arr: function(dateStr) {
    let dateTimeObj = Util.dateTimePicker(this.data.startYear, this.data.endYear);

    const dateStrArr = dateStr.match(/(\d+)-(\d+)-(\d+) (\d+):(\d+)/);
    dateStrArr.splice(0, 1)

    const arrMap = dateTimeObj.dateTimeArray
    return dateStrArr.map((val, index) => {
      return arrMap[index].indexOf(val)
    })
  },
  _calDuartionIndex: function(startDateStr, endDateStr) {
    const val = this._calDuartionVal(startDateStr, endDateStr);
    return this.data.durations.indexOf(val);
  },

  _calDuartionVal: function(startDateStr, endDateStr) {
    const startDateTimestamp = new Date(startDateStr.replace(" ", "T")).getTime();
    const endDateTimestamp = new Date(endDateStr.replace(" ", "T")).getTime();
    const durationMin = (endDateTimestamp - startDateTimestamp) / 60000;

    if (durationMin < 60) {
      return durationMin > 1 ? `${durationMin} Minutes` : `${durationMin} Minute`
    }

    const durationHour = durationMin / 60
    if (durationHour < 24) {
      return durationHour > 1 ? `${durationHour} Hours` : `${durationHour} Hour`
    }

    // TODO extend in future if need
    return durationHour + " Hours"
  },

  changeStartDateTimeColumn(e) {
    let arr = this.data.startDateTime,
      dateArr = this.data.dateTimeArray;

    arr[e.detail.column] = e.detail.value;
    dateArr[2] = Util.getMonthDay(dateArr[0][arr[0]], dateArr[1][arr[1]]);

    this.setData({
      dateTimeArray: dateArr,
      startDateTime: arr
    });
  },

  bindDurationChange: function(e) {
    this.inputChange('durationIndex', e.detail.value);
  },

  bindDirectionChange: function(e) {
    this.inputChange('directionIndex', e.detail.value);
  },

  bindGroupChange: function(e) {
    this.inputChange('groupIndex', e.detail.value);
  },

  bindDifficultyChange: function(e) {
    this.inputChange('difficultyIndex', e.detail.value);
  },

  inputChange: function(name, value) {
    this.setData({
      [name]: value
    });
  },

  onSubmit: function(event) {
    let value = event.detail.value;
    let eventDetail = this._buildEventDetail(value);

    if (this.data.mode == "edit" && this.data.editSessionDetail != null) {
      eventDetail.id = this.data.editSessionDetail.id
      eventDetail.lastModifiedBy = Util.getUserId();
    } else {
      eventDetail.createdBy = Util.getUserId();
    }

    WXRequest.post('/session/edit', eventDetail).then(res => {
      if (res.data.msg === 'ok') {
        Util.showToast('Success', 'success', 1000);
        setTimeout(function() {
          wx.navigateBack({
            delta: 1
          });
        }, 1000);
      }
    }).catch(e => {
      console.log(e);
    });
  },

  _buildEventDetail: function(value) {
    let startDateTimeVal = this.data.startDateTimeVal;
    let duration = this.data.durations[value.duration];
    let endDateTimeVal = this._calEndDateTimeVal(startDateTimeVal, duration);

    let eventDetail = {
      owner: {
        id: this.data.presenterId
      },
      topic: value.topic,
      description: value.description,
      startDate: startDateTimeVal,
      endDate: endDateTimeVal,
      direction: {
        id: this.data.directions[value.direction].id
      },
      difficulty: value.difficulty,
      location: {
        id: this.data.locations.map(val => val.name).indexOf(value.location) + 1,
        name: value.location
      },
      typeId: this.data.groups[value.group].id,
      tea2: this.data.tea2
    };
    return eventDetail;
  },

  _calEndDateTimeVal: (startDateTime, duration) => {
    let iosTime = startDateTime.replace(/-/g, '/');

    let n = duration.split(' ')[0];
    let time = parseInt(n);
    if (time < 10) {
      time = time * 60;
    }
    let endDateTime = new Date(new Date(iosTime).getTime() + time * 60 * 1000);
    return Util.getDateTime(endDateTime);
  },

  checkboxChange: function(e) {
    var tea2 = this.data.tea2 ^ 1;
    console.log("isTea2: " + tea2);
    this.setData({
      tea2: tea2
    })
  },

  /**
   * Lifecycle function--Called when page is initially rendered
   */
  onReady: function() {

  },

  /**
   * Lifecycle function--Called when page unload
   */
  onUnload: function() {

  },

  // Add for meeting rooms
  bindKeyInput: function(e) {
    var currentInputStatu = e.currentTarget.dataset.statu;
    var prefix = e.detail.value.toUpperCase()
    var newSource = []
    if (prefix != "") {
      this.setData({
        showBtnStatus1: false,
        showBtnStatus2: true
      });
      this.data.locationsName.forEach(function(e) {
        if (e.indexOf(prefix) != -1) {
          newSource.push(e)
        }
      })
    } else {
      currentInputStatu = "close";
      this.setData({
        isScroll: true,
        showBtnStatus1: true,
        showBtnStatus2: false
      });
    }
    if (newSource.length != 0) {
      this.setData({
        bindSource: newSource,
      })
      if (newSource.length < 5) {
        this.setData({
          scrollhight: 45 * newSource.length
        })
      } else {
        this.setData({
          scrollhight: 250
        })
      }
    } else {
      this.setData({
        bindSource: []
      })
      currentInputStatu = "close";
      this.setData({
        isScroll: "{{false}}"
      });
    }
    if (currentInputStatu == "close") {
      this.setData({
        showInputStatus: false,
        isScroll: true
      });
    }
    if (currentInputStatu == "open") {
      this.setData({
        showInputStatus: true,
        isScroll: "{{false}}"
      });
    }
  },

  //Add for meeting rooms
  itemtap: function(e) {
    var currentInputStatu = e.currentTarget.dataset.statu;
    this.setData({
      inputLocation: e.target.id,
      bindSource: []
    })
    if (currentInputStatu == "close") {
      this.setData({
        showInputStatus: false,
        isScroll: true
      });
    }
    if (currentInputStatu == "open") {
      this.setData({
        showInputStatus: true,
        isScroll: "{{false}}"
      });
    }
  },

  //Add for presenter select
  bindUserInput: function (e) {
    var currentInputStatu = e.currentTarget.dataset.statu;
    var prefix = e.detail.value.toUpperCase();
    var newMatched = []
    if (prefix != "") {
      this.data.allUserInfo.forEach(function (e) {
        if (e.nickName.toUpperCase().indexOf(prefix) != -1) {
          newMatched.push(e);
        }
      })
    } else {
      currentInputStatu = "close";
      this.setData({
        isScroll: true,
        showBtnStatus1: true,
        showBtnStatus2: false
      });
    }
    if (newMatched.length != 0) {
      this.setData({
        userMatched: newMatched,
      })
      if (newMatched.length < 5) {
        this.setData({
          scrollhight: 45 * newMatched.length
        })
      } else {
        this.setData({
          scrollhight: 250
        })
      }
    } else {
      this.setData({
        userMatched: []
      })
      currentInputStatu = "close";
      this.setData({
        isScroll: "{{false}}"
      });
    }
    if (currentInputStatu == "close") {
      this.setData({
        showPresenterInputStatus: false,
        isScroll: true
      });
    }
    if (currentInputStatu == "open") {
      this.setData({
        showPresenterInputStatus: true,
        isScroll: "{{false}}"
      });
    }
  },

  //Add for select presenter
  useritemtap: function (e) {
    var currentInputStatu = e.currentTarget.dataset.statu;
    this.setData({
      presenterInput: e.target.dataset.name,
      presenterId: e.target.id,
      userMatched: []
    })
    if (currentInputStatu == "close") {
      this.setData({
        showPresenterInputStatus: false,
        isScroll: true
      });
    }
    if (currentInputStatu == "open") {
      this.setData({
        showPresenterInputStatus: true,
        isScroll: "false"
      });
    }
  }
})