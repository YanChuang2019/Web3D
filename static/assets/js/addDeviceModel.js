
class AddModel{
    constructor(){
    }

    addaModel (url,position,scale,rotation,name,deviceId,label){//从指定地址获取模型文件，以设定好的位置、形状等设置模型
        var loader = new THREE.STLLoader();
        //loader.load("static/gis_815/models/somedevices/" + url, function(geometry) {
        //alert("当前设备的URL：" + url);
        loader.load( url, function(geometry) {//STL模型加载
            var material;
            if(name == "camera1"){
                material = new THREE.MeshPhongMaterial({
                    color: 0x00FF00,
                    specular: 0x111111,
                    shininess: 200
                });
            }else if(name.substr(0,4) == "wall"){
                material = new THREE.MeshPhongMaterial({
                    color: 0xA52A2A,
                    specular: 0x111111,
                    shininess: 200
                });
            }else{
                material = new THREE.MeshPhongMaterial({
                    color: 0xFF0000,
                    specular: 0x111111,
                    shininess: 200
                });
            }
            
            var mesh = new THREE.Mesh(geometry, material);
            

            let result = screenCoord(mesh.position);
            let top = result.top + 5 + "px";
            let left = result.left + 5 + "px";
            var tempdiv = $("#tip").clone().css({
                left: left,
                top: top,
                display:"none"
            });
            let cont ;
            if(mesh.deviceName === 'connector2'){
                cont = "管道类型:水管";
                tempdiv.html("<p>" + cont + "</p>");
                tempdiv.css({
                    display:''
                });
                mesh.tipdiv = tempdiv;
                allLabelDiv.push(tempdiv);
            }else if(mesh.deviceName === 'connector6'){
                cont = "管道类型:烟管"
                tempdiv.html("<p>" + cont + "</p>");
                tempdiv.css({
                    display:''
                });
                mesh.tipdiv = tempdiv;
                allLabelDiv.push(tempdiv);
            }else{
                cont = "设备名称:"+mesh.deviceName+"<br>设备ID:"+mesh.deviceId+"<br>标签:"+mesh.label;
                tempdiv.html("<p>" + cont + "</p>");
                mesh.tipdiv = tempdiv;
                //allLabelDiv.push(tempdiv);
            }
            $("body").append(tempdiv);
            mesh.castShadow = true;
            mesh.receiveShadow = true;

            mesh.name = name;
            mesh.deviceName = name;
            mesh.deviceId = deviceId;    //真实设备Id
            mesh.label = label;
            mesh.isAlarm = false;
            mesh.alarmType = "";
            mesh.position.set(position.x,position.y,position.z);
            mesh.rotation.set(rotation.x,rotation.y,rotation.z);
            mesh.scale.set(scale.x,scale.y,scale.z);
            scene.add(mesh);//在场景中添加模型
            objects.push(mesh);//在对象组中添加模型
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

