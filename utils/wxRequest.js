const app = getApp()

class Request {
  constructor(parms) {
    this.withBaseURL = parms.withBaseURL
    this.baseURL = parms.baseURL
  }
  get(url, data) {
    return this.request('GET', url, data)
  }
  post(url, data) {
    return this.request('POST', url, data)
  }
  put(url, data) {
    return this.request('PUT', url, data)
  }
  delete(url, data) {
    return this.request('DELETE', url, data)
  }
  request(method, url, data) {
    const vm = this
    let that = this
    console.log('jwtToken: ' + app.globalData.jwtToken);
    return new Promise((resolve, reject) => {
      wx.request({
        url: vm.withBaseURL ? vm.baseURL + url : url,
        data,
        method,
        header: {
          'Authorization': app.globalData.jwtToken
        },
        success(res) {
          resolve(res)
        },
        fail() {
          reject({
            msg: '请求失败',
            url: vm.withBaseURL ? vm.baseURL + url : url,
            method,
            data
          })
        }
      })
    })
  }
}

const request = new Request({
  // baseURL: 'https://skr.sapdigitallunch.com',
  baseURL: app.globalData.host,
  withBaseURL: true
})

export default request
