window.temHistory=[];
window.humiHistory=[];
const MAX={'temperature':49,'humidity':50};
const MIN={'temperature':-20,'humidity':10};
document.onreadystatechange = function(){
    var websocket = new WebSocket("ws:/10.108.216.46:8800/ws");
    var temfun=drawGauge('temGauge','温湿度传感器','温度gauge',0,'温度','℃');
    var humifun=drawGauge('humiGauge','温湿度传感器','湿度gauge',0,'湿度','%');
    var temhumifun=drawLine('uid4');
    var temhumierrorfun=drawTemHumiErrorLine('uid4');
    var othererrorfun=drawOtherErrorLine();
    //setInterval(function(){
     //  drawLine('uid4');
     //   drawTemHumiErrorLine('uid4');
      // drawOtherErrorLine();
    //},100000);
    websocket.onmessage = function(e){
        //alert("接收到消息：" + e.data);
        var jsonObject = JSON.parse(e.data);
        var msgType = jsonObject.type;
        if(msgType==='water'||msgType==='smoke'||msgType==='infrared'){
            if(jsonObject.state){
                othererrorfun(msgType,jsonObject.timestamp);
            }
        }
        else if(msgType==='temperature'){
            temfun(parseFloat(jsonObject.temperature).toFixed(2),'温度');
            temhumifun(parseFloat(jsonObject.temperature).toFixed(2),'',jsonObject.timestamp);
            if(parseFloat(jsonObject.temperature).toFixed(2)>MAX['temperature']||parseFloat(jsonObject.temperature).toFixed(2)<MIN['temperature']){
                temhumierrorfun(parseFloat(jsonObject.temperature).toFixed(2),'',jsonObject.timestamp);
            }
        }
        else if(msgType==='humidity'){
            humifun(parseFloat(jsonObject.humidity).toFixed(2),'湿度');
            temhumifun('',parseFloat(jsonObject.humidity).toFixed(2),jsonObject.timestamp);
            if(parseFloat(jsonObject.humidity).toFixed(2)>MAX['humidity']||parseFloat(jsonObject.humidity).toFixed(2)<MIN['humidity']){
                temhumierrorfun('',parseFloat(jsonObject.humidity).toFixed(2),jsonObject.timestamp);
            }
        }
    }
}

function drawGauge(container, titleName, seriesName, seriesData,dataName,dataUnit){
    var myTemGauge = echarts.init(document.getElementById(container));
    var myTemGaugeOption = {
        title: {
            text: titleName, 
            textStyle:{
                color:'white'
            }
        },
        toolbox: { 
            show: true,
            feature: {
                restore: { 
                    show: true
                },
                saveAsImage: {
                    show: true
                }
            }
        },
        tooltip: {
            formatter: "{a} <br/>{b} : {c}%"
        },
        series: [{
            name: seriesName,
			type: 'gauge',
			min:'20',
			max:'100',
            detail: {formatter:'{value} '+dataUnit},
            data: [{value: seriesData, name: dataName}]
        }]
    };
    myTemGauge.setOption(myTemGaugeOption);
    function setValue(value,valueType){
            myTemGaugeOption.series[0].data=[{value:value,name:valueType}]
            myTemGauge.setOption(myTemGaugeOption);
    }
    return setValue;
}

function drawLine(id) {
    var myTemHumiLine = echarts.init(document.getElementById('temHumiLine'));
    var xData=[];
    var seriesDataA=[];
    var seriesDataB=[];
    $.ajax({
        url:"/api/3d815/gettemdata/"+id,
        type:"GET",
        async:false,
        success:function(data){
            temHistory=data.res;
            var res=fetchLinePointData(data.res,'temperature');
            xData=res['x'];
            seriesDataA=res['y'];
            $.ajax({
                url:"/api/3d815/gethumidata/"+id,
                type:'GET',
                async:false,
                success:function(data){
                    humiHistory=data.res;
                    seriesDataB=fetchLinePointData(data.res,'humidity')['y'];
                },
                error:function(e){
                    console.log(e);
                }
            })
        },
        error:function(e){
            console.log(e);
        }
    });
    var myTemHumiLineOption = {
        toolbox: { 
            show: true,
            feature: {
                restore: { 
                    show: true
                },
                saveAsImage: {
                    show: true
                }
            }
        },
        color : ['#87CEFA','#DB7093'],
        //标题样式
        title : {
            text : '温湿度传感器',
            textStyle : {
                color : 'white',
            },
            left : 'center'
        },
        //菜单
        legend: { 
            // 内容 
            data:['温度','湿度'], 
            // 样式 
            textStyle:{ 
                fontSize:10, 
                color:'white'
              }, 
            // 上距离，类似css中的margin 
            top:'10%'
        }, 
        tooltip : {
            trigger : 'axis',
            position : 'top',
            axisPointer : {
                type : 'cross',
                label : {
                    backgroundColor : '#6a7985'
                }
            }
        },
        //图形位置
        grid : {
            left : '4%',
            right : '6%',
            bottom : '4%',
            top : 80,
            containLabel : true
        },
        //x轴
        xAxis : [ {
            type : 'category',
            //坐标轴两边留白策略，即x轴坐标点开始与结束点位置都不在最边缘
            boundaryGap : true,
            axisLine : {
                show : true,
                //x轴线样式
                lineStyle : {
                    color : 'white',
                    width : 2,
                    type : 'solid'
                },
            },
            //x轴字体设置
            axisLabel : {
                show : false,
                fontSize : 12,
                color : 'white',
                rotate:30,
                interval:0
            },
            data : xData
        } ],
        //y轴
        yAxis : [ {
            type : 'value',
            name:'温度:℃ 湿度:%',
            axisLine : {
                show : true,
                lineStyle : {
                    color : 'white',
                    width : 2,
                    type : 'solid'
                },
            },
            //y轴字体设置
            axisLabel : {
                show : true,
                color : 'white',
                fontSize : 12
            },
            //与x轴平行的线样式
            splitLine : {
                show : true,
                lineStyle : {
                    color : 'white',
                    width : 0.2,
                    type : 'solid',
                }
            }
        } ],
        series : [ {
            name :'温度',
            type : 'line',
            color:['red'],
            //折线平滑
            smooth : true,
            symbol : 'circle',
            symbolSize : 6,
            //折线连接点样式
            itemStyle : {
                color : 'red'
            },
            data : seriesDataA
        } ,
        {
            name : '湿度',
            type : 'line',
            color:['red'],
            //折线平滑
            smooth : true,
            symbol : 'circle',
            symbolSize : 6,
            //折线连接点样式
            itemStyle : {
                color : '#00E5DE'
            },
            data : seriesDataB
        }]
    };
    myTemHumiLine.setOption(myTemHumiLineOption);
    function setValue(temValue,humiValue,timestamp){
        console.log("myOption.xAxis[0].data");
        console.log(myTemHumiLineOption['xAxis'][0]['data']);
        console.log(formatData(timestamp));
        if(xData.length>=100){
            xData.shift();
        }
        xData.push(formatData(timestamp));
        myTemHumiLineOption.xAxis[0].data=xData;
        if(temValue===''){
            if(seriesDataB.length>=100){
                seriesDataB.shift();
            }
            seriesDataB.push(parseFloat(humiValue).toFixed(2));
            myTemHumiLineOption.series[1].data=seriesDataB;
        }
        else if(humiValue===''){
            if(seriesDataA.length>=100){
                seriesDataA.shift();
            }
            seriesDataA.push(parseFloat(temValue).toFixed(2));
            myTemHumiLineOption.series[0].data=seriesDataA;
        }
        myTemHumiLine.setOption(myTemHumiLineOption);
    }
    return setValue;
}

function drawTemHumiErrorLine(id){
    var temHumiError = echarts.init(document.getElementById('temHumiErrorLine'));
    var res=fetchErrorPointData(temHistory,'temperature');
    var xDataA=['2019-10-15  10:51:18'].concat(res['x']);
    var seriesDataA=[99].concat(res['y']);
    res=fetchErrorPointData(humiHistory,'humidity');
    var xDataB=res['x'];
    var seriesDataB=[90].concat(res['y']);
    temHumiErrorOption = {
        toolbox: { 
            show: true,
            feature: {
                restore: { 
                    show: true
                },
                saveAsImage: {
                    show: true
                }
            }
        },
        color : ['#87CEFA','#DB7093'],
        //标题样式
        title : {
            text : '温湿度异常分布',
            textStyle : {
                color : 'white',
            },
            left : 'center'
        },
        //菜单
        legend: { 
            // 内容 
            data:['温度','湿度'], 
            // 样式 
            textStyle:{ 
                fontSize:10, 
                color:'white'
              }, 
            // 上距离，类似css中的margin 
            top:'10%'
        }, 
        tooltip : {
            trigger : 'axis',
            position : 'top',
            axisPointer : {
                type : 'cross',
                label : {
                    backgroundColor : '#6a7985'
                }
            }
        },
        //图形位置
        grid : {
            left : '4%',
            right : '6%',
            bottom : '4%',
            top : 80,
            containLabel : true
        },
        //x轴
        xAxis : [ {
            type : 'category',
            //坐标轴两边留白策略，即x轴坐标点开始与结束点位置都不在最边缘
            boundaryGap : true,
            axisLine : {
                show : true,
                //x轴线样式
                lineStyle : {
                    color : 'white',
                    width : 2,
                    type : 'solid'
                },
            },
            //x轴字体设置
            axisLabel : {
                show : false,
                fontSize : 12,
                color : 'white',
                rotate:30,
                interval:0
            },
            data : xDataA
        } ],
        //y轴
        yAxis : [ {
            type : 'value',
            name:'温度:℃ 湿度:%',
            axisLine : {
                show : true,
                lineStyle : {
                    color : 'white',
                    width : 2,
                    type : 'solid'
                },
            },
            //y轴字体设置
            axisLabel : {
                show : true,
                color : 'white',
                fontSize : 12
            },
            //与x轴平行的线样式
            splitLine : {
                show : true,
                lineStyle : {
                    color : 'white',
                    width : 0.2,
                    type : 'solid',
                }
            }
        } ],
        series : [ {
            name :'温度',
            type : 'scatter',
            color:['red'],
            //折线平滑
            smooth : true,
            symbol : 'circle',
            symbolSize : 6,
            //折线连接点样式
            itemStyle : {
                color : 'red'
            },
            data : seriesDataA
        } ,
        {
            name : '湿度',
            type : 'scatter',
            color:['red'],
            //折线平滑
            smooth : true,
            symbol : 'circle',
            symbolSize : 6,
            //折线连接点样式
            itemStyle : {
                color : '#00E5DE'
            },
            data : seriesDataB
        }],
    };
    temHumiError.setOption(temHumiErrorOption);
    function setValue(temValue,humiValue,timestamp){
        if(xDataA.length>=100){
            xDataA.shift();
        }
        xDataA.push(formatData(timestamp));
        temHumiErrorOption.xAxis[0].data=xDataA;
        if(temValue===''){
            if(seriesDataB.length>=100){
                seriesDataB.shift();
            }
            seriesDataB.push(parseFloat(humiValue).toFixed(2));
            console.log('myOption.series[1]');
            console.log(temHumiErrorOption.series);
            temHumiErrorOption.series[1].data=seriesDataB;
        }
        else if(humiValue===''){
            if(seriesDataA.length>=100){
                seriesDataA.shift();
            }
            seriesDataA.push(parseFloat(temValue).toFixed(2));
            temHumiErrorOption.series[0].data=seriesDataA;
        }
        temHumiError.setOption(temHumiErrorOption);
    }
    return setValue;
}

function drawOtherErrorLine(){
    var otherError = echarts.init(document.getElementById('otherErrorLine'));
    var xDataA=[];
    var xDataB=[];
    var xDataC=[];
    $.ajax({
        url:"/api/3d815/getalarmdata/"+'uid6',//烟感
        type:"GET",
        async:false,
        success:function(data){
            alarmHistory=data.res;
            $.ajax({
                url:"/api/3d815/getsurpervisiondata/"+'uid6',
                type:'GET',
                async:false,
                success:function(data){
                    surpervisionHistory=data.res;
                    xDataA=fetchOtherErrorPointData(alarmHistory,surpervisionHistory,'烟感');
                },
                error:function(e){
                    console.log(e);
                }
            })
        },
        error:function(e){
            console.log(e);
        }
    });
    $.ajax({
        url:"/api/3d815/getalarmdata/"+'uid7',//水浸
        type:"GET",
        async:false,
        success:function(data){
            alarmHistory=data.res;
            $.ajax({
                url:"/api/3d815/getsurpervisiondata/"+'uid7',
                type:'GET',
                async:false,
                success:function(data){
                    surpervisionHistory=data.res;
                    xDataB=fetchOtherErrorPointData(alarmHistory,surpervisionHistory,'水浸');
                },
                error:function(e){
                    console.log(e);
                }
            })
        },
        error:function(e){
            console.log(e);
        }
    });
    $.ajax({
        url:"/api/3d815/getalarmdata/"+'uid8',//红外
        type:"GET",
        async:false,
        success:function(data){
            alarmHistory=data.res;
            $.ajax({
                url:"/api/3d815/getsurpervisiondata/"+'uid8',
                type:'GET',
                async:false,
                success:function(data){
                    surpervisionHistory=data.res;
                    xDataC=fetchOtherErrorPointData(alarmHistory,surpervisionHistory,'红外');
                },
                error:function(e){
                    console.log(e);
                }
            })
        },
        error:function(e){
            console.log(e);
        }
    });
    var xData=[];
    var seriesDataA=[];
    xData=xData.concat(xDataA).concat(xDataB).concat(xDataC);//concat(['2019-10-14  10:39:12A','2019-10-14  10:38:38B','2019-10-14  10:47:17C']);
    xData=xData.sort();
    for ( var i = 0; i <xData.length; i++){
        if(xData[i][xData[i].length-1]==='A'){
            seriesDataA.push('烟感异常');
        }
        else if(xData[i][xData[i].length-1]==='B'){
            seriesDataA.push('水浸异常');
        }
        else{
            seriesDataA.push('红外异常');
        }
        xData[i]=(xData[i].substr(0,xData[i].length-1));
    }
    otherErrorOption = {
        toolbox: { 
            show: true,
            feature: {
                restore: { 
                    show: true
                },
                saveAsImage: {
                    show: true
                }
            }
        },
        color : ['#87CEFA','#DB7093','#0000FF'],
        //标题样式
        title : {
            text : '其它设备异常分布',
            textStyle : {
                color : 'white',
            },
            left : 'center'
        },
        //菜单
        legend: { 
            // 内容 
            data:['烟感异常','水浸异常','红外异常'], 
            // 样式 
            textStyle:{ 
                fontSize:10, 
                color:'white'
              }, 
            // 上距离，类似css中的margin 
            top:'10%'
        }, 
        tooltip : {
            trigger : 'axis',
            position : 'top',
            axisPointer : {
                type : 'cross',
                label : {
                    backgroundColor : '#6a7985'
                }
            }
        },
        //图形位置
        grid : {
            left : '4%',
            right : '6%',
            bottom : '4%',
            top : 80,
            containLabel : true
        },
        //x轴
        xAxis : [ {
            type : 'category',
            //坐标轴两边留白策略，即x轴坐标点开始与结束点位置都不在最边缘
            boundaryGap : true,
            axisLine : {
                show : true,
                //x轴线样式
                lineStyle : {
                    color : 'white',
                    width : 2,
                    type : 'solid'
                },
            },
            //x轴字体设置
            axisLabel : {
                show : false,
                fontSize : 12,
                color : 'white',
                rotate:30,
                interval:0
            },
            data : xData
        } ],
        //y轴
        yAxis : [ {
            type : 'category',
            axisLine : {
                show : true,
                lineStyle : {
                    color : 'white',
                    width : 2,
                    type : 'solid'
                },
            },
            //y轴字体设置
            axisLabel : {
                show : true,
                color : 'white',
                fontSize : 12
            },
        } ],
        series : [{
            name :'',
            type : 'scatter',
            color:['red'],
            //折线平滑
            smooth : true,
            symbol : 'circle',
            symbolSize : 6,
            //折线连接点样式
            itemStyle : {
                color : 'red'
            },
            data : seriesDataA
        } ]
    };
    otherError.setOption(otherErrorOption);
    function setValue(valueType,timestamp){
        if(xData.length>=100){
            xData.shift();
        }
        xData.push(formatData(timestamp));
        otherErrorOption.xAxis[0].data=xData;
        if(seriesDataA.length>=100){
            seriesDataA.shift();
        }
        if(valueType==='water'){
            seriesDataA.push('水浸异常');
        }
        else if(valueType==='smoke'){
            seriesDataA.push('烟感异常');
        }
        else if(valueType==='infrared'){
            seriesDataA.push('红外异常');
        }
        otherErrorOption.series[0].data=seriesDataA;
        otherError.setOption(otherErrorOption);
    }
    return setValue;
}

function fetchLinePointData(resData,dataType){
    var timeArray=[];
    var valueArray=[];
    for ( var i = 0; i <resData.length; i++){
        if(resData[i]['key']===dataType&&i%10==0){
            timeArray.push(resData[i]['ts']);
            valueArray.push(resData[i]['value'].toFixed(2));
        }
    }
    for ( var i = 0; i <timeArray.length; i++){
        timeArray[i]=formatData(timeArray[i]);
    }
    return {'x':timeArray,'y':valueArray}
}

function fetchErrorPointData(resData,dataType){
    var timeArray=[];
    var valueArray=[];
    for ( var i = 0; i <resData.length; i++){
        if(resData[i]['key']===dataType&&(resData[i]['value']>MAX[dataType]||resData[i]['value']<MIN[dataType])){
            timeArray.push(resData[i]['ts']);
            valueArray.push(resData[i]['value'].toFixed(2));
        }
    }
    for ( var i = 0; i <timeArray.length; i++){
        timeArray[i]=formatData(timeArray[i]);
    }
    return {'x':timeArray,'y':valueArray}
}

function fetchOtherErrorPointData(alarmHistory,surpervisionHistory,dataType){
    var timeArray=[];
    for ( var i = 0; i <alarmHistory.length; i++){
        if(alarmHistory[i]['key']==='alarm'&&surpervisionHistory[i]['key']==='surpervision'&&(alarmHistory[i]['value']==1&&surpervisionHistory[i]['value']==0)){
            timeArray.push(resData[i]['ts']);
        }
    }
    for ( var i = 0; i <timeArray.length; i++){
        if(dataType=='烟感'){
            timeArray[i]=formatData(timeArray[i])+'A';   
        }
        else if(dataType=='水浸'){
            timeArray[i]=formatData(timeArray[i])+'B';
        }
        else{
            timeArray[i]=formatData(timeArray[i])+'C';
        }
    }
    return timeArray;
}

function formatData(seconds){
    var date = new Date(seconds);
        var y = date.getFullYear();
        var m = date.getMonth() + 1;
        m = m < 10 ? ('0' + m) : m;
        var d = date.getDate();
        d = d < 10 ? ('0' + d) : d;
        var h = date.getHours();
        h = h < 10 ? ('0' + h) : h;
        var minute = date.getMinutes();
        var second = date.getSeconds();
        minute = minute < 10 ? ('0' + minute) : minute;
        second = second < 10 ? ('0' + second) : second;
        return y+'-'+m+'-'+d+' '+' '+h+':'+minute+':'+second;
}
