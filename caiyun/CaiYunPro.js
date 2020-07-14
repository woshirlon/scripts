/*
彩云天气PRO  SVIP
QX
[rewrite_local]
https:\/\/biz\.caiyunapp\.com\/v2\/user\?app_name=weather url script-response-body CaiYunPro.js
[mitm]
hostname = biz.caiyunapp.com
*/


var obj =JSON.parse($response.body);
obj.result.is_vip = true;
obj.result.vip_type = "s";
obj.result.wt.vip.enabled = true;
obj.result.wt.vip.svip_expired_at = 3742762088
obj.result.svip_expired_at = 3742762088
$done({body: JSON.stringify(obj)});

