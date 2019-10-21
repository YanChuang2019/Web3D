
var ws = new WebSocket("ws:/47.104.8.164:8800/ws"); 
var colors = ['red', 'green', 'blue', 'yellow'], index = 0;
var getColor = function () {
(index >= colors.length) && (index = 0);
return colors[index++];
};
ws.onmessage = function(e){
    var jsonObject = JSON.parse(e.data);
    var msgType = jsonObject.type;
    var deviceLocation = jsonObject.location;
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
            content: "异常设备:"+deviceLocation+"\n报警类型:" + msgType + '.'
          });
    }
}