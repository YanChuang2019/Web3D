
class AddModel{
    constructor(){
    }

    addaModel (url,position,scale,rotation,name,deviceId,label){//从指定地址获取模型文件，以设定好的位置、形状等设置模型
        var loader = new THREE.STLLoader();
        //loader.load("static/gis_815/models/somedevices/" + url, function(geometry) {
        //alert("当前设备的URL：" + url);
        loader.load( url, function(geometry) {//STL模型加载
            var material = new THREE.MeshPhongMaterial({
                color: 0xFF0000,
                specular: 0x111111,
                shininess: 200
            });
            var mesh = new THREE.Mesh(geometry, material);
            // alert(scale.x+","+scale.y+","+scale.z)
            // alert(position.x+","+position.y+","+position.z);
            // alert(rotation.x+","+rotation.y+","+rotation.z);
            mesh.position.set(position.x,position.y,position.z);
            mesh.rotation.set(rotation.x,rotation.y,rotation.z);
            mesh.scale.set(scale.x,scale.y,scale.z);

            mesh.castShadow = true;
            mesh.receiveShadow = true;

            mesh.name = name;
            mesh.deviceName = name;
            mesh.deviceId = deviceId;    //真实设备Id
            mesh.label = label;
            mesh.isAlarm = false;
            mesh.alarmType = "";
            // var mesh1 = scene.getChildByName("scene");
            // mesh1.material = new THREE.MeshPhongMaterial( { ambient: 0x050505, color: 0x0033ff, specular: 0x555555, shininess: 30 } );
            scene.add(mesh);//在场景中添加模型
            objects.push(mesh);//在对象组中添加模型
            //console.log(objects)
        });
    }

    addAllModel (siteId){//添加当前站点下的所有的模型
        var allModel = [];//记录当前站点下的所有模型
        $.ajax({
            url:'/api/dModel/getSitedModel/'+siteId,
            type:'GET',
            async:false,
            success: function(res){
                allModel = res.dModels;
            },
            error: function(e){
                $.alert("场景模型添加失败！可能是数据库问题"+e.message);
            }
        });

        objects = [];

        allModel.forEach(element => {//加载每一个模型
            var name = element.name;
            var label = element.label;
            var deviceId = element.deviceId;
            var location = JSON.parse(element.location);
            var position = location.position;
            var scale = location.scale;
            var rotation = location.rotation;
            
            this.addaModel(element.deviceModelUrl,position,scale,rotation,name,deviceId,label);
            
        });
    }

}

