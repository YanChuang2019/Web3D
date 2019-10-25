$(document).ready(function(){
	console.log('ajax');
	var data=[]
	$.ajax({
		url:"/api/3d815/getvideodata",
		type:'GET',
		async:false,
		success:function(res){
			console.log('ajax success');
			console.log(res.res);
			data=res.res
		},
		error:function(e){
			console.log('ajax error');
			console.log(e);
		}
	})
	for(i=0;i<data.length;i++){
		$detail=$(`<ul class="additional-info"></ul>`)
		for(j=0;j<data[i]['num'];j++){
			$detail.append($(`<li><header>身份:</header><figure>`+data[i]['who'+j]+`</figure></li>`));
		}
		$(".row").append($(`<div class="col-md-3 col-sm-6"><div class="thumbnail"><div class="property-image"><video id="curr-video" width="260" height="196"  controls preload="auto" src="`+'http://120.27.250.108'+data[i]['url']+'.mp4'+`" type="video/mp4"></video></div><div class="caption">
		<div class="info"><div class="tag price">时间：`+data[i]['time']+`</div><h3>人数：`+data[i]['num']+`</h3></div>`+$detail[0].innerHTML+`</div></div></div>`));
	}  
	//var ws = new WebSocket("ws:/120.27.250.108:8080/api/v1/camera/ws");
   //ws.onmessage = function(e){
	//	var jsonObject = JSON.parse(e.data);
	//	addVideo( jsonObject);
	//}
});
function addVideo (data){
	console.log(data)
	$detail=$(`<ul class="additional-info"></ul>`)
	for(j=0;j<data['num'];j++){
		$detail.append($(`<li><header>身份:</header><figure>`+data['who'+j]+`</figure></li>`));
	}
	$(".row").append($(`<div class="col-md-3 col-sm-6"><div class="thumbnail"><div class="property-image"><video id="curr-video" width="260" height="196"  controls preload="auto" src="`+'http://120.27.250.108'+data['url']+'.mp4'+`"></video></div><div class="caption">
	<div class="info"><div class="tag price">时间：`+data['time']+`</div><h3>人数：`+data['num']+`</h3></div>`+$detail[0].innerHTML+`</div></div></div>`));
}