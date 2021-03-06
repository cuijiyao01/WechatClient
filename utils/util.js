const getCurrentDate = function () {
  return getDate(new Date());
};

const showToast = function (msg, icon, time) {
  wx.showToast({
    title: msg,
    icon: icon || 'success',
    duration: time || 1500
  })
};

const getUserId = function () {
  var userInfo = wx.getStorageSync('userInfo');
  var userId = userInfo && userInfo.id || 'abc';
  return userId;
};

const getUserNickname = function () {
  var userInfo = wx.getStorageSync('userInfo');
  var userNickname = userInfo && userInfo.nickName || 'abc';
  return userNickname;
};

const formatNumber = (n) => {
  n = n.toString();
  return n[1] ? n : '0' + n;
};

function getDate(date) {
  var nowMonth = date.getMonth() + 1;
  var strDate = date.getDate();
  var seperator = "-";
  if (nowMonth >= 1 && nowMonth <= 9) {
    nowMonth = "0" + nowMonth;
  }
  if (strDate >= 0 && strDate <= 9) {
    strDate = "0" + strDate;
  }
  var nowDate = date.getFullYear() + seperator + nowMonth + seperator + strDate;
  return nowDate;
};

function getTime(date) {
  let hour = date.getHours();
  let minute = date.getMinutes();

  return [hour, minute].map(formatNumber).join(':')
};

const getDateTime = (datetime) => {
  let date = getDate(datetime);
  let time = getTime(datetime);
  return `${date} ${time}`;
}

function withData(param) {
  return param < 10 ? '0' + param : '' + param;
}
function getLoopArray(start, end, increment = 1) {
  var start = start || 0;
  var end = end || 1;
  var array = [];
  for (var i = start; i <= end; i += increment) {
    array.push(withData(i));
  }
  return array;
}
function getMonthDay(year, month) {
  var flag = year % 400 == 0 || (year % 4 == 0 && year % 100 != 0), array = null;

  switch (month) {
    case '01':
    case '03':
    case '05':
    case '07':
    case '08':
    case '10':
    case '12':
      array = getLoopArray(1, 31)
      break;
    case '04':
    case '06':
    case '09':
    case '11':
      array = getLoopArray(1, 30)
      break;
    case '02':
      array = flag ? getLoopArray(1, 29) : getLoopArray(1, 28)
      break;
    default:
      array = '??????????????????????????????????????????'
  }
  return array;
}
function getNewDateArry() {
  // ?????????????????????
  var newDate = new Date();
  var year = withData(newDate.getFullYear()),
    mont = withData(newDate.getMonth() + 1),
    date = withData(newDate.getDate()),
    hour = withData(newDate.getHours());

  var minu = newDate.getMinutes() ;
  minu = Math.ceil(minu / 5) * 5;
  minu = minu === 60 ? 0 : minu;
  minu = withData(minu);

  return [year, mont, date, hour, minu];
}
function dateTimePicker(startYear, endYear, date) {
  // ???????????????????????????????????????????????????
  var dateTime = [], dateTimeArray = [[], [], [], [], []];
  var start = startYear || 1978;
  var end = endYear || 2100;
  // ????????????????????????
  var defaultDate = date ? [...date.split(' ')[0].split('-'), ...date.split(' ')[1].split(':')] : getNewDateArry();
  // ????????????????????????
  /*????????? ?????????*/
  dateTimeArray[0] = getLoopArray(start, end);
  dateTimeArray[1] = getLoopArray(1, 12);
  dateTimeArray[2] = getMonthDay(defaultDate[0], defaultDate[1]);
  dateTimeArray[3] = getLoopArray(0, 23);
  dateTimeArray[4] = getLoopArray(0, 59, 1);

  dateTimeArray.forEach((current, index) => {
    dateTime.push(current.indexOf(defaultDate[index]));
  });

  return {
    dateTimeArray: dateTimeArray,
    dateTime: dateTime
  }
}

function formatTime(date) {
  let strDate = getDate(date);
  let hour = date.getHours();
  let minute = date.getMinutes();
//  let second = date.getSeconds();

  return strDate + " " +[hour, minute].map(formatNumber).join(':') +":00";
};




export default {
  getCurrentDate, getDateTime, showToast, getUserId, getUserNickname, dateTimePicker, getMonthDay, formatTime
};

