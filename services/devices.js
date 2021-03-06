const axios = require('axios');
const request = require('superagent');

var instance = axios.create({
    baseURL: 'http://47.105.120.203:30080/api/v1/deviceaccess',
    // timeout: 60000,
  });

global.requestId = 100000;

function getDeviceId(id){
    var deviceId;
    switch (id){
        case 'uid1':
            deviceId = "1ecde350-6252-11e8-b8df-59c2cc02320f";  //switch1
            break;
        case 'uid2':
            deviceId = "1edd2590-6252-11e8-b8df-59c2cc02320f";  //switch2  不可用
            break;
        case 'uid3':
            deviceId = "22acf240-6252-11e8-b8df-59c2cc02320f";  //c1
            break;
        case 'uid4':
            deviceId = "1bfca680-9c75-11e9-9dcf-b55ae51a103e"//"21b94370-6252-11e8-b8df-59c2cc02320f";  //wenshi
            break;
        case 'uid5':
            deviceId = "22649ea0-6252-11e8-b8df-59c2cc02320f";   //c2  不可用
            break;
        case 'uid6':
            deviceId = "7b99a6f0-90d2-11e9-b21a-2fa071b4c282";   //烟感
            break;
        case 'uid7':
            deviceId = "e74e6830-0ac2-11ea-8ed8-9b8a84d51816";   //新的水浸
            break;
        case 'uid8':
            deviceId = "f6289960-3b02-11e9-8fc2-67fbc94ac784";   //红外
            break;
        default:
            deviceId = null;
    }
    return deviceId;
}

module.exports = {
  
    searchByText:async (tid,sText,limit,access_token)=>{
        var data =await instance.get('/tenant/devices/'+tid+'?limit='+limit+'&textSearch='+sText,{
            headers: {
                'Authorization': 'Bearer ' + access_token,
            }
        });

        return data.data;
        console.log(data.data);
    },

    getDeviceData: async (id,access_token)=>{
        var deviceId = getDeviceId(id);
        var data = await instance.get('/data/alllatestdata/'+deviceId,{
            headers: {
                'Authorization': 'Bearer ' + access_token,
            }
        });
        var yaoce = data.data

        return yaoce;
    },

    fetchLineData: async (id,dataType,access_token)=>{
        var timestamp = Date.parse(new Date());
        var startTs=(timestamp / 1000 - 24 * 60 * 60 ) * 1000;
        var endTs=timestamp;
        var deviceId = getDeviceId(id);
        try{
            var data = await instance.get('/data/alldata/'+deviceId+'?key='+dataType+'&startTs='+startTs+'&endTs='+endTs+'&limit=1000'+'&interval=86400'+'&aggregation=AVG',{
                headers: {
                    'Authorization': 'Bearer ' + access_token,
                   'Content-Type': 'application/json',
                },
            });
            var yaoce = data.data;
            return yaoce;
        }
        catch(e){
            throw e;
        }
    },

    fetchVideoData: async (date)=>{
        try{
            console.log('axios start')
            var data = await axios.get('http://120.27.250.108:8080/api/v1/camera/getHistory?time='+date,{
                headers: {
                   'Content-Type': 'application/json',
                },
            });
            console.log(date)
            var yaoce = data.data;
            return yaoce;
        }
        catch(e){
            throw e;
        }
    },

    devicesPaging: async (tid,limit,idOffset,textOffset,access_token) => {
        try{
            if ((idOffset) || (textOffset)){
            var data = await instance.get('/tenant/devices/'+tid+'?limit='+limit+'&idOffset='+idOffset+'&textOffset='+textOffset,{
                headers: {
                    'Authorization': 'Bearer ' + access_token,
                }
            });
            var res = data.data;

            }else if (!(idOffset) && !(textOffset)){
                var data = await instance.get('/tenant/devices/'+tid+'?limit='+limit,{
                    headers: {
                        'Authorization': 'Bearer ' + access_token,
                    }
                });
                var res = data.data;
            }
            return res;
        }catch(e){
            throw e;
        }
    },

    getDeviceInfo: async (id,access_token) => {     //获取设备属性信息
        try{
            var data = await instance.get('/device/'+id,{
                headers: {
                    'Authorization': 'Bearer ' + access_token,
                }
            });
            var info = data.data;

            return info;
        }catch(e){
            throw e;
        }
    },

    siteDevicesPaging: async (tid,siteId,limit,idOffset,textOffset,access_token) => {
        try{
            if ((idOffset) && (textOffset)){
            var data = await instance.get('/sitedevices/'+tid+'/'+siteId+'?limit='+limit+'&idOffset='+idOffset+'&textOffset='+textOffset,{
                headers: {
                    'Authorization': 'Bearer ' + access_token,
                }
            });
            var res = data.data;

            }else if (!(idOffset) && !(textOffset)){
                var data = await instance.get('/sitedevices/'+tid+'/'+siteId+'?limit='+limit,{
                    headers: {
                        'Authorization': 'Bearer ' + access_token,
                    }
                });
                var res = data.data;
            }
            return res;
        }catch(e){
            throw e;
        }
    },

    siteDevicesSearch: async (tid,siteId,limit,textSearch,access_token) => {   //待定,底层接口有问题
        try{
            var data = await instance.get('/sitedevices/'+tid+'/'+siteId+'?limit='+limit+'&textSearch='+textSearch,{
                headers: {
                    'Authorization': 'Bearer ' + access_token,
                }
            });
            var res = data.data;
     
            return res;
        }catch(e){
            throw e;
        }
    },


    assignDevicetoSite: async(id,siteId,access_token) =>{
        try{
            var res = await request.put('http://47.105.120.203:30080/api/v1/deviceaccess/device')
                .set('Content-Type', 'application/json')
                .set('Authorization','Bearer '+access_token)
                .send({"id":id})
                .send({"siteId":siteId})
                .timeout({
                    response: 5000,
                    deadline: 10000,
                });

            if (res.text){
                return res.text;
            }else{
                throw new Error('server error!');
            }
        }catch(e){
            throw e;
        }

    }
}