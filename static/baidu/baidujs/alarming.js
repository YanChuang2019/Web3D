
var ws = new WebSocket("ws://47.104.8.164:8800/ws"); 
var ws2 = new WebSocket("ws://120.27.250.108:8080/api/v1/camera/ws");
var colors = ['red', 'green', 'blue', 'yellow'], index = 0;
var getColor = function () {
(index >= colors.length) && (index = 0);
return colors[index++];
};

ws2.onmessage = function(e){
  var jsonObject = JSON.parse(e.data);
  var deviceState = jsonObject.state;
  var siteId = jsonObject.siteId;
  if(deviceState == "1"){
      new jBox('Notice', {
          attributes: {
            x: 'right',
            y: 'bottom'
          },
          stack: false,
          animation: {
            open: 'tada',
            close: 'zoomIn'
          },
          color: getColor(),
          title: '站点：' + siteId + '异常',
          content: "摄像头检测到异常"
        });
  }
}

ws.onmessage = function(e){
    var jsonObject = JSON.parse(e.data);
    var msgType = jsonObject.type;
    var deviceLocation = jsonObject.location;
    var deviceState = jsonObject.state;
    var siteId = jsonObject.siteId;
    if(deviceState == "1"){
      let pipelineLocation  = parseInt(deviceLocation.substr(8));
      let pipelineType;
      if(pipelineLocation<13){
          pipelineType="水管报警，请联系相关修理人员！"
      }else if(pipelineLocation>=13){
          pipelineType="烟管报警，请联系相关修理人员！"
      }else{
          pipelineType=""
      }
        new jBox('Notice', {
            attributes: {
              x: 'right',
              y: 'bottom'
            },
            stack: false,
            animation: {
              open: 'tada',
              close: 'zoomIn'
            },
            color: getColor(),
            title: '站点：' + siteId + '异常',
            content: "异常设备:"+deviceLocation+"<br>报警类型:" + msgType + "<br>" + pipelineType
          });
    }
}