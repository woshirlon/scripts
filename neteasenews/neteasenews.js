/*
QuanX :
[MITM]
c.m.163.com

[rewrite_local]
^https:\/\/c\.m\.163\.com\/uc\/api\/sign\/v3\/commit url script-request-body neteasenews.js

[task_local]
1 0 * * * neteasenews.js
*/

const cookieName = '网易新闻'
const cookieKey = 'chavy_cookie_neteasenews'
const bodyKey = 'chavy_body_neteasenews'
const chavy = init()
var cookieVal = JSON.parse(chavy.getdata(cookieKey))
var bodyVal = chavy.getdata(bodyKey)


if (isRequest)
{
  setcookie()
} else
{
  sign()	
}
function setcookie(){
	if ($request.body) {
	  cookieVal = JSON.stringify($request.headers)
	  bodyVal = bodyVal ? bodyVal : $request.body
	} else {
	  chavy.msg(`${cookieName}`, '获取Cookie: 失败', '说明：没有发现请求body！')
	  chavy.log(`[${cookieName}] 获取Cookie: 失败, 说明：没有发现请求body！`)
	  chavy.done();
	  return;
	}
	if (cookieVal) {
	  chavy.setdata(cookieVal, cookieKey)
	  chavy.msg(`${cookieName}`, '获取Cookie: 成功', '')
	  chavy.log(`[${cookieName}] 获取Cookie: 成功, cookie: ${cookieVal}`)
	} else {
	  chavy.msg(`${cookieName}`, '获取Cookie: 失败', '说明: 未知')
	  chavy.log(`[${cookieName}] 获取Cookie: 失败, cookie: ${cookieVal}`)
	}
	if (bodyVal) {
	  chavy.setdata(bodyVal, bodyKey)
	  chavy.msg(`${cookieName}`, '获取Body: 成功', '')
	  chavy.log(`[${cookieName}] 获取Body: 成功, body: ${bodyVal}`)
	} else {
	  if (isQuanX()) {
		chavy.msg(`${cookieName}`, '获取Body: 失败', '说明: QuanX用户请手动抓包 body 参数!')
		chavy.log(`[${cookieName}] 获取Body: 失败, 说明: QuanX用户请手动抓包 body 参数!`)
	  } else {
		chavy.msg(`${cookieName}`, '获取Body: 失败', '说明: 未知')
		chavy.log(`[${cookieName}] 获取Body: 失败, body: ${bodyVal}`)
	  }
	}
	chavy.done()
}

function sign() {
  if (cookieVal) {
	cookieVal.Host = `gw.m.163.com`;
    let url = { url: `https://gw.m.163.com/commons-user-main/api/v1/commons/user/profile/taskcenter`, headers: cookieVal }
    url.body = bodyVal
    chavy.post(url, (error, response, data) => {
      //chavy.log(`${cookieName}, data: ${data}`)
      let result = JSON.parse(data)
      const title = `${cookieName}`
      let subTitle = ``
      let detail = ``
      if (result.code == 0) {
        subTitle = '获取签到任务: 成功';
		detail = `用户名：${result.data.userInfo.nick}\n金币总数：${result.data.userInfo.goldCoin}, 连签天数：${result.data.signInfo.serialDays}`;
		chavy.log(`${subTitle}`);
		chavy.log(`${detail}`);
		if (!result.data.userInfo.signStatus == true)
		{
		  dosign();
		} else
		{
		  subTitle = `获取签到任务结果：成功(已经签到，不再执行签到)`;
	      chavy.msg(title, subTitle, detail);
		}
	  } else {
        subTitle = '获取签到任务结果: 失败'
        detail = `编码: ${result.code}, 说明: ${result.message}`
		chavy.msg(title, subTitle, detail)
      }
    })
  } else {
    const title = `${cookieName}`
    let subTitle = `获取签到任务结果: 失败`
    let detail = `说明: cookie为空`
    chavy.msg(title, subTitle, detail)
  }
  chavy.done()
}

function dosign() {
  cookieVal.Host = `c.m.163.com`;
  if (bodyVal) {
    let url = { url: `https://c.m.163.com/uc/api/sign/v2/commit`, headers: cookieVal }
    url.body = bodyVal
    chavy.post(url, (error, response, data) => {
      chavy.log(`${cookieName}, data: ${data}`)
      let result = JSON.parse(data)
      const title = `${cookieName}`
      let subTitle = ``
      let detail = ``
      if (result.code == 200) {
        subTitle = '签到结果: 成功'
        detail = `连签: +${result.data.serialDays}, 金币: ${result.data.awardGoldCoin}, 说明: ${result.msg}`
      } else if (result.code == 700) {
        subTitle = '签到结果: 成功 (重复签到)'
        detail = `说明: ${result.msg}`
      } else {
        subTitle = '签到结果: 失败'
        detail = `编码: ${result.code}, 说明: ${result.msg}`
      }
      chavy.msg(title, subTitle, detail)
    })
  } else {
    const title = `${cookieName}`
    let subTitle = `签到结果: 失败`
    let detail = `说明: body参数为空`
    chavy.msg(title, subTitle, detail)
  }
}

function init() {
  isSurge = () => {
    return undefined === this.$httpClient ? false : true
  }
  isQuanX = () => {
    return undefined === this.$task ? false : true
  }
  isRequest = typeof $request != "undefined"
  getdata = (key) => {
    if (isSurge()) return $persistentStore.read(key)
    if (isQuanX()) return $prefs.valueForKey(key)
  }
  setdata = (key, val) => {
    if (isSurge()) return $persistentStore.write(key, val)
    if (isQuanX()) return $prefs.setValueForKey(key, val)
  }
  msg = (title, subtitle, body) => {
    if (isSurge()) $notification.post(title, subtitle, body)
    if (isQuanX()) $notify(title, subtitle, body)
  }

  log = (message) => console.log(message)
  get = (url, cb) => {
    if (isSurge()) {
      $httpClient.get(url, cb)
    }
    if (isQuanX()) {
      url.method = 'GET'
      $task.fetch(url).then((resp) => cb(null, {}, resp.body))
    }
  }
  post = (url, cb) => {
    if (isSurge()) {
      $httpClient.post(url, cb)
    }
    if (isQuanX()) {
      url.method = 'POST'
      $task.fetch(url).then((resp) => cb(null, {}, resp.body))
    }
  }
  done = (value = {}) => {
    $done(value)
  }
  return { isSurge, isQuanX, isRequest,msg, log, getdata, setdata, get, post, done }
}
