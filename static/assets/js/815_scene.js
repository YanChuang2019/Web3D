

var websocket = new WebSocket("ws://127.0.0.1:9999/ws");// websocket.onopen = function(){
var websocket2 = new WebSocket("ws://120.27.250.108:8080/api/v1/camera/ws");
    //     alert("websocket连接成功");
    // }
    
    if (!Detector.webgl) Detector.addGetWebGLMessage();
       var addmodel = new AddModel();//用来添加模型
         
        var camera, scene, renderer,
            bulbLight, bulbMat, ambientLight,
            object, loader, stats,firstScene,orbitctr, allPipeModels = [];
        THREE.DRACOLoader.setDecoderPath('../draco_decoder.js');
        THREE.DRACOLoader.setDecoderConfig( { type: 'js' } );
        THREE.DRACOLoader.getDecoderModule();
        var dracoLoader = new THREE.DRACOLoader();//模型加载器
    
        var ballMat, cubeMat, floorMat;
        var newcontrols;
        var objects = [];
        var transformcontrol;
        var boxmesh2;
        var temp, isdb;
        var vertex = new THREE.Vector3();
        var color = new THREE.Color();
        var floorMaterial;
        var pointerLock;
        var deviceMap = new Map();
        //var raycaster;
    
        //==========pointerLock============变量
        var controlsEnabled = false;
    
        var moveForward = false;
        var moveBackward = false;
        var moveLeft = false;
        var moveRight = false;
        var canJump = false;
    
        var prevTime = performance.now();
        var velocity = new THREE.Vector3();
        var direction = new THREE.Vector3();
        var vertex = new THREE.Vector3();
        var color = new THREE.Color();
        //========================================end
        
        
        var bulbLuminousPowers = {
            "110000 lm (1000W)": 110000,
            "3500 lm (300W)": 3500,
            "1700 lm (100W)": 1700,
            "800 lm (60W)": 800,
            "400 lm (40W)": 400,
            "180 lm (25W)": 180,
            "20 lm (4W)": 20,
            "Off": 0
        };
        // ref for solar irradiances: https://en.wikipedia.org/wiki/Lux
        var hemiLuminousIrradiances = {
            "0.0001 lx (Moonless Night)": 0.0001,
            "0.002 lx (Night Airglow)": 0.002,
            "0.5 lx (Full Moon)": 0.5,
            "3.4 lx (City Twilight)": 3.4,
            "50 lx (Living Room)": 50,
            "100 lx (Very Overcast)": 100,
            "350 lx (Office Room)": 350,
            "400 lx (Sunrise/Sunset)": 400,
            "1000 lx (Overcast)": 1000,
            "18000 lx (Daylight)": 18000,
            "50000 lx (Direct Sun)": 50000,
        };
        var fogColor = {
            '红色': 0xff0000,
            '黄色': 0xffff00,
            '绿色': 0x00ff00
        }
        var params = {
            near: 1,
            far: 20,
            fogColor: Object.keys(fogColor)[0],
            "雾浓度": 0.02,
            shadows: false,
            exposure: 0.8,
            opacity:0.7,
            bulbPower: Object.keys(bulbLuminousPowers)[2],
            hemiIrradiance: Object.keys(hemiLuminousIrradiances)[3]
        };
    
        //获取search中的参数
        function getQueryString(name) { 
            var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i"); 
            var r = window.location.search.substr(1).match(reg); 
            if (r != null) return unescape(r[2]); return null; 
            } 
        
        function screenCoord(position){  //输入物体世界坐标，返回屏幕top，left
    
            let vec2 = position.project(camera);
            let halfWidth = window.innerWidth / 2;
            let halfHeight = window.innerHeight / 2;
            
            var result = {
                top: -vec2.y * halfHeight + halfHeight,
                left: vec2.x * halfWidth + halfWidth,
            }
            return result;
            }  
    
    
        var _sceneLoca = null;    //场景位置信息
        var _sceneUrl ;     //场景模型url
        var siteId = null;        //站点ID 
        var siteName = null;      //站点名称
        var tenantId = null;      //租户ID
        var showAllLabel = false;
        var allLabelDiv = [];
        
    
    
        var initScene = function(){//场景的初始化
    
            siteId = getQueryString("siteId");   //从url中读取siteId
            tenantId = getQueryString("id") || getQueryString("tenantId") || $.cookie("tenant_id");
    
            if(siteId === null || siteId === "" || siteId === undefined){
                siteId = 1;      //默认是demo中的815场景
            }
            if(tenantId === null || tenantId === "" || tenantId === undefined){
                tenantId = 2;      //默认tenantId = 2
            }
            if( siteId !== null ) {
             //获取站点场景模型的初始位置信息
                $.ajax({
                    url: '/api/sites/' + siteId,
                    type: 'GET',
                    async:false,
                    success:function(res){//对获取到的当前站点下的所有模型进行处理
                        _sceneLoca =  res.sites[0].sceneModelLoca;//场景地点
                        _sceneUrl = res.sites[0].sceneUrl;//场景的文件路径
                        siteName = res.sites[0].name;//站点的名字
                        addmodel.addAllModel(siteId);    //加载场景ID133的所有设备模型
                    },
                    error: function(e){
                        $.alert('场景模型初始位置信息获取失败！请刷新重试'+ e.message);
                    }
                });
    
                $("#title").html("站点名称:  "+siteName);
            } 
            
        }
        
    
        if(_sceneUrl === "" || _sceneUrl === null || _sceneUrl === undefined){
            //$.alert("您未上传任何场景模型，请返回地图界面进行上传。");
        }
    
        if(_sceneLoca === null || _sceneLoca === "" || _sceneLoca === undefined){
            _sceneLoca ={
                position:{},
                rotation:{},
                scale:{},
            };
        }else{
            _sceneLoca = JSON.parse(_sceneLoca);
        }
        
        var sceneCtrl = {//设置场景控制的仪表盘
            
            "平移-x": Number(_sceneLoca.position.x) || 5 ,
            "平移-y": Number(_sceneLoca.position.y) || 2,
            "平移-z": Number(_sceneLoca.position.z) || 0.01,
            "旋转-x": Number(_sceneLoca.rotation.x) || 0.01,
            "旋转-y": Number(_sceneLoca.rotation.y) || 0.01,
            "旋转-z": Number(_sceneLoca.rotation.z) || 0.01,
            "缩放": Number(_sceneLoca.scale.x) || 0.5,
        };
        var newcontrols = {//设置其他控制的仪表盘
    
            "清除物体": function() {
                objects.forEach(function(e) {
                    scene.remove(e);
                });
                objects = [];
            },
            "上传设备模型": function() {
                window.open("/demoupload", "_blank", "toolbar=no, location=no, directories=no, status=no, menubar=yes, scrollbars=no, resizable=no, copyhistory=yes, width=400, height=360")
            },  //upload/upload.html,原来.open()中的内容
    
            "显示/关闭所有标签": function() {
                if(showAllLabel === false){
                    showAllLabel = true;
                }else{
                    showAllLabel =false;
                }
    
                //clone label div
                if(allLabelDiv.length === 0){
                    objects.forEach(function(e) {
                                
                        let position = e.position.clone();
                        let result = screenCoord(position);
                        let top = result.top + 5 + "px";
                        let left = result.left + 5 + "px";
                        var tempdiv = $("#tip").clone().css({
                            left: left,
                            top: top,
                            display:"none"
                        });
                        let cont ;
                        if(e.deviceName === 'connector2'){
                            cont = "管道类型:水管";
                            tempdiv.html("<p>" + cont + "</p>");
                            e.tipdiv = tempdiv;
                            allLabelDiv.push(tempdiv);
                        }else if(e.deviceName === 'connector6'){
                            cont = "管道类型:烟管"
                            tempdiv.html("<p>" + cont + "</p>");
                            e.tipdiv = tempdiv;
                            allLabelDiv.push(tempdiv);
                        }else{
                            cont = "设备名称:"+e.deviceName+"<br>设备ID:"+e.deviceId+"<br>标签:"+e.label;
                            tempdiv.html("<p>" + cont + "</p>");
                            e.tipdiv = tempdiv;
                            //allLabelDiv.push(tempdiv);
                        }
                        $("body").append(tempdiv);
                    });
                }
                 //end
            
                allLabelDiv.forEach(function(e){
                    if(showAllLabel){
                        e.css({
                            display:'block'
                        });
                    }else{
                        e.css({
                            display:'none'
                        });
                    }
                });
                
            },
            "☆返回首页": function() {
                var search = window.location.search;
                window.location.href= '/'+search;
            },
    
            "✔保存场景设置": function() {//用于保存当前场景
                $.confirm({
                    title:"Confirm!",
                    content:'确认修改场景位置信息吗？',
                    confirmButtonClass: 'btn-info',
                    cancelButtonClass: 'btn-danger',
                    closeIcon: true,
                    animation:'rotateY',
                    closeAnimation: 'rotateY',
                    confirm: function(){
                        var sceneLocation = {//保存当前场景的位置信息
                            position:{
                                x:sceneCtrl['平移-x'].toFixed(6),
                                y:sceneCtrl['平移-y'].toFixed(6),
                                z:sceneCtrl['平移-z'].toFixed(6),
                            },
                            scale:{
                                x:sceneCtrl['缩放'].toFixed(6),
                                // y:sceneCtrl['缩放'].toFixed(6),
                                // z:sceneCtrl['缩放'].toFixed(6),
                            },
                            rotation:{
                                x:sceneCtrl['旋转-x'].toFixed(6),
                                y:sceneCtrl['旋转-y'].toFixed(6),
                                z:sceneCtrl['旋转-z'].toFixed(6),
                            },
                            opacity:params.opacity.toFixed(6)
                        };
            
                        //var siteId = 133;
            
                        $.ajax({//调用接口，用来保存当前的场景的位置信息
                            url:'/api/sites/sceneModelLoca/'+ siteId,
                            type:'PUT',
                            data:{
                                "location":JSON.stringify(sceneLocation)//场景位置信息
                            },
                            async:false,
                            success: function(res){
                                if(res[0] === 1){
                                    $.alert("成功更新场景模型位置信息！");
                                } else{
                                    $.alert("场景模型位置信息更新失败！请重试");
                                }
                            },
                            error: function(e){
                                $.alert("更新位置失败！可能是数据库问题~"+e.message);
                            }
                        });
                    }
    
                });
                
    
            }
        };
        
        var transfctrl = {//设置移动控件
            "轨道控件": function(){
                var controls = new THREE.OrbitControls(camera, renderer.domElement);
                controls.maxPolarAngle = Math.PI * 9 / 20;
                // controls.target.set(0, 2, 0);
                controls.update();
            },
            "轨迹球控件": function(){   //未搞定
                var trballctr = new THREE.TrackballControls( camera );
                    trballctr.rotateSpeed = 1.0;
                    trballctr.zoomSpeed = 1.2;
                    trballctr.panSpeed = 0.8;
    
                    trballctr.noZoom = false;
                    trballctr.noPan = false;
    
                    trballctr.staticMoving = true;
                    trballctr.dynamicDampingFactor = 0.3;
    
                    trballctr.keys = [ 65, 83, 68 ];
    
                    trballctr.addEventListener( 'change', render );
    
            },
            "行走漫游": function(){   //搞定
                    //==================18.7.4test======================
                    var blocker = document.getElementById( 'blocker' );
                    var instructions = document.getElementById( 'instructions' );
    
                    var havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;
                    if ( havePointerLock ) {
    
                        var element = document.body;
        
                        var pointerlockchange = function ( event ) {
        
                            if ( document.pointerLockElement === element || document.mozPointerLockElement === element || document.webkitPointerLockElement === element ) {
        
                                controlsEnabled = true;
                                pointerLock.enabled = true;
        
                                blocker.style.display = 'none';
        
                            } else {
        
                                pointerLock.enabled = false;
        
                                blocker.style.display = 'inline-block';
        
                                instructions.style.display = '';
        
                            }
        
                        };
        
                        var pointerlockerror = function ( event ) {
        
                            instructions.style.display = '';
        
                        };
        
                        // Hook pointer lock state change events
                        document.addEventListener( 'pointerlockchange', pointerlockchange, false );
                        document.addEventListener( 'mozpointerlockchange', pointerlockchange, false );
                        document.addEventListener( 'webkitpointerlockchange', pointerlockchange, false );
        
                        document.addEventListener( 'pointerlockerror', pointerlockerror, false );
                        document.addEventListener( 'mozpointerlockerror', pointerlockerror, false );
                        document.addEventListener( 'webkitpointerlockerror', pointerlockerror, false );
        
                        instructions.addEventListener( 'click', function ( event ) {
        
                            instructions.style.display = 'none';
        
                            // Ask the browser to lock the pointer
                            element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;
                            element.requestPointerLock();
        
                        }, false );
        
                    } else {
        
                        instructions.innerHTML = 'Your browser doesn\'t seem to support Pointer Lock API';
        
                    }
                    //==================endtest=========================
    
                    pointerLock = new THREE.PointerLockControls( camera );
                    scene.add( pointerLock.getObject() );
                    var onKeyDown = function ( event ) {
    
                        switch ( event.keyCode ) {
    
                            case 38: // up
                            case 87: // w
                                moveForward = true;
                                break;
    
                            case 37: // left
                            case 65: // a
                                moveLeft = true; break;
    
                            case 40: // down
                            case 83: // s
                                moveBackward = true;
                                break;
    
                            case 39: // right
                            case 68: // d
                                moveRight = true;
                                break;
    
                            case 32: // space
                                if ( canJump === true ) velocity.y += 350;
                                canJump = false;
                                break;
    
                        }
    
                    };
    
                    var onKeyUp = function ( event ) {
    
                        switch( event.keyCode ) {
    
                            case 38: // up
                            case 87: // w
                                moveForward = false;
                                break;
    
                            case 37: // left
                            case 65: // a
                                moveLeft = false;
                                break;
    
                            case 40: // down
                            case 83: // s
                                moveBackward = false;
                                break;
    
                            case 39: // right
                            case 68: // d
                                moveRight = false;
                                break;
    
                        }
    
                    };
    
                    document.addEventListener( 'keydown', onKeyDown, false );
                    document.addEventListener( 'keyup', onKeyUp, false );
                    //raycaster = new THREE.Raycaster( new THREE.Vector3(), new THREE.Vector3( 0, - 1, 0 ), 0, 10 );
    
            },
        };
        function setPosAndShade(obj) {
            /*obj.position.set(
             Math.random() * 20 - 45,
             40,
             Math.random() * 20 - 5
             );*/
            obj.position.set(0, 0, 0);
            obj.rotation.set(Math.random() * 2 * Math.PI, Math.random() * 2 * Math.PI, Math.random() * 2 * Math.PI);
            obj.castShadow = true;
        }
        var raycaster = new THREE.Raycaster();
        var craycaster = new THREE.Raycaster();    //用于坐标的拾取
        var mouse = new THREE.Vector2();
        var clock = new THREE.Clock();
        // S
        async function initial(){
            await init();
            await initScene();
            await render();
            await animate();
        }
        initial();
        //tips and show tips
        var ToolTip = {//用来显示数据的tips
            init: function() {//tips的初始化
                var tempDiv = document.getElementById("tip");
                
                tempDiv.style.display = "none";
                tempDiv.style.position = "absolute";
                tempDiv.style.color = "#fff";
                tempDiv.style.borderRadius = 2 + "px";
                tempDiv.style.padding = 2 + "px";
                tempDiv.style.backgroundColor = "rgba(0,0,0,0.4)";          
            },
            showtip: function(mouse, cont) {//tips的显示
                jqq("tip").innerHTML = "<p>" + cont + "</p>";
                jqq("tip").style.left = mouse.clientX + 5 + "px";
                jqq("tip").style.top = mouse.clientY - 10 + "px";
                jqq("tip").style.zIndex = "10";
                jqq("tip").style.display = "block";
            },
            hidetip: function() {//tips的隐藏
                jqq("tip").style.display = "none";
            }
        }
        var jqq = function(str) {
            return document.getElementById(str);
        }
        ToolTip.init();//数据显示tips的初始化
        //
        function init() {//场景渲染的初始化
            var container = document.getElementById('container');//获取DOM挂载点
            // stats = new Stats();
            // container.appendChild(stats.dom);
            camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
            camera.position.x = 0;
            camera.position.z = 15;
            camera.position.y = 8;
            scene = new THREE.Scene();
            scene.fog = new THREE.FogExp2(0xffffff, 0);
            //scene.background = new THREE.Color( 0xffffff );
            //半光
            hemiLight = new THREE.HemisphereLight(0x363636, 0x363636, 0.5);
            scene.add(hemiLight);
    
            var ambientLight = new THREE.AmbientLight(0xffffff);
            scene.add(ambientLight);
            //坐标辅助
            var axes = new THREE.AxesHelper(100);
            scene.add(axes);
            
            //地板
            floorMat = new THREE.MeshStandardMaterial({
                roughness: 0.8,
                color: 0xffffff,
                metalness: 0.2,
                bumpScale: 0.0005,
            });
            var floorGeometry = new THREE.PlaneBufferGeometry(500, 500);
            var floorMesh = new THREE.Mesh(floorGeometry, floorMat);
            floorMesh.receiveShadow = true;
            floorMesh.rotation.x = -Math.PI / 2.0;
            scene.add(floorMesh);//为场景添加地板
    
    
             //点光源设置
            var bulbGeometry = new THREE.SphereGeometry(0.02, 16, 8);
            var bulbLight = new THREE.PointLight(0xffee88, 999, 100, 2);
            var bulbMat = new THREE.MeshStandardMaterial({
                emissive: 0xffffee,
                emissiveIntensity: 100,
                color: 0xffffff
            });
            bulbLight.add(new THREE.Mesh(bulbGeometry, bulbMat));
            bulbLight.position.set(0, 4, 0);
            bulbLight.castShadow = true;
            scene.add(bulbLight);//为场景添加点光源1
            /* 第二个点光源 */
            var bulbGeometry2 = new THREE.SphereGeometry(0.02, 16, 8);
            var bulbLight2 = new THREE.PointLight(0xffee88, 999, 100, 2);
            var bulbMat2 = new THREE.MeshStandardMaterial({
                emissive: 0xffffee,
                emissiveIntensity: 100,
                color: 0xffffff
            });
            bulbLight2.add(new THREE.Mesh(bulbGeometry2, bulbMat2));
            bulbLight2.position.set(-15, 4, 0);
            bulbLight2.castShadow = true;
            scene.add(bulbLight2);//为场景添加点光源2
            /* 第三个点光源 */
            var bulbGeometry3 = new THREE.SphereGeometry(0.02, 16, 8);
            var bulbLight3 = new THREE.PointLight(0xffee88, 999, 100, 2);
            var bulbMat3 = new THREE.MeshStandardMaterial({
                emissive: 0xffffee,
                emissiveIntensity: 100,
                color: 0xffffff
            });
            bulbLight3.add(new THREE.Mesh(bulbGeometry3, bulbMat3));
            bulbLight3.position.set(10, 4, 0);
            bulbLight3.castShadow = true;
            scene.add(bulbLight3);//为场景添加点光源3
    
            //渲染器设置
            renderer = new THREE.WebGLRenderer({ antialias: true });
            renderer.physicallyCorrectLights = true;
            renderer.gammaInput = true;
            renderer.gammaOutput = true;
            renderer.shadowMap.enabled = true;
            renderer.toneMapping = THREE.ReinhardToneMapping;
            renderer.setPixelRatio(window.devicePixelRatio);
            renderer.setSize(window.innerWidth, window.innerHeight);
            container.appendChild(renderer.domElement);
    
            renderer.setClearColor(0x363636);  /*设置环境的背景色 */
    
            //轨道控件
            transfctrl["轨道控件"]();     //两种控制方式同时使用
    
            //漫游
            transfctrl["行走漫游"]();
            
            //轨迹球控件
            //transfctl["轨迹球控件"]();
            // orbitctr = new THREE.OrbitControls(camera, renderer.domElement);
            // orbitctr.maxPolarAngle = 2*Math.PI;
            // // controls.target.set(0, 2, 0);
            // orbitctr.minDistance = 0;
            // orbitctr.maxDistance = 1000;
            
    
            //改变模型形状
            transformcontrol = new THREE.TransformControls(camera, renderer.domElement);
            //transformcontrol.addEventListener('change', render);
            scene.add(transformcontrol);//为场景添加移动控制控件
    
            //加载实验室模型
            var onProgress = function(xhr) {//加载过程的一个回调函数
                if (xhr.lengthComputable) {
                    var percentComplete = xhr.loaded / xhr.total * 100;
                    var process_loading = 'Loading Models:'+Math.round(percentComplete, 2) + '%';//从前端获取加载过程的DOM节点
                    document.getElementById('Loading').innerHTML = process_loading;
                    console.log(process_loading);
                    if(percentComplete == 100){
                        document.getElementById('Loading').style.display = 'none';
                    }
                }
            };
            var onError = function(xhr) {
                //$.alert("找不到该站点模型文件\n  错误信息:"+xhr.target.statusText);        
            };
    
            //原路径：static/gis_815/models/mydrc/lab_524drc.drc
            
                dracoLoader.load( _sceneUrl, function ( geometry ) {//根据之前去数据库查询的场景url，进行场景的加载
                    
                geometry.computeVertexNormals();
    
                var material = new THREE.MeshStandardMaterial( { vertexColors: THREE.VertexColors } );//为mesh设置材质
                
                var mesh = new THREE.Mesh( geometry, material );//创建一个3DMesh
                mesh.name = "scene";
                mesh.castShadow = true;//有阴影
                mesh.receiveShadow = true;//可以接收到阴影
                //mesh.material.side = THREE.DoubleSide;
    
                mesh.scale.x = 0.5;
                mesh.scale.y = 0.5;     /*  改变几何的比例*/ 
                mesh.scale.z = 0.5;
                mesh.position.x = -100;
                mesh.position.y = -20;     /*  改变几何的位置*/ 
                mesh.position.z = 100;
                mesh.material.transparent = true;//将mesh的材质的透明度设置为真
                mesh.material.opacity = params.opacity;//设置材质的透明度
                firstScene = mesh;
                mesh.geometry.colorsNeedUpdate = true;
                var material = new THREE.MeshPhongMaterial({
                    color: 0xFF0000,
                    specular: 0x111111,
                    shininess: 200
                });
                // Release the cached decoder module.
                THREE.DRACOLoader.releaseDecoderModule();
                },onProgress, onError);
    
            //
            window.addEventListener('resize', onWindowResize, false);//设置调整大小的监听事件
            renderer.domElement.addEventListener('mousemove', onDocumentMouseMove, false);
            renderer.domElement.addEventListener('mousedown', onDocumentMouseDown, false);
            renderer.domElement.addEventListener('dblclick', onDocumentDbclick, false);
            
    
            var gui = new dat.GUI();//添加控件的UI
            gui.add(params, 'exposure', 0, 1);
            gui.add(params, 'opacity', 0, 1);
            effectController = {
                shininess: 40.0
            }
    
            // h = gui.addFolder("雾颜色");
            // h.add(params, "fogColor", Object.keys(fogColor));
            // gui.add(params, '雾浓度', 0, 0.1);
    
            //场景模型控制
            var scectr = gui.addFolder("场景模型变换");
            scectr.add(sceneCtrl,"平移-x",-50, 50);
            scectr.add(sceneCtrl,"平移-y",-30,30 );
            scectr.add(sceneCtrl,"平移-z",-50, 50);
            scectr.add(sceneCtrl,"旋转-x",0, 2*Math.PI);
            scectr.add(sceneCtrl,"旋转-y",0, 2*Math.PI);
            scectr.add(sceneCtrl,"旋转-z",0, 2*Math.PI);
            scectr.add(sceneCtrl,"缩放",0,2);
    
            //控制方式
            var transctrl = gui.addFolder("场景控制方式");
            transctrl.add(transfctrl,"轨道控件");
            //transctrl.add(transfctrl,'轨迹球控件');  未完成
            transctrl.add(transfctrl,'行走漫游');
            
    
            gui.add(newcontrols, '清除物体');
            // gui.add(newcontrols, '上传设备模型');
            gui.add(newcontrols,'显示/关闭所有标签');
            gui.add(newcontrols,'☆返回首页');
            gui.add(newcontrols,'✔保存场景设置');
            gui.open();
        }/////////////////////////////////////////////
        var baseColor = 0xFF0000;
        var foundColor = 0x12C0E3;
        var intersectColor = 0x00D66B;
        var intersected;
        var downIntersected;
    
            
            
        var colors = ['red', 'green', 'blue', 'yellow'], index = 0;
        var getColor = function () {
        (index >= colors.length) && (index = 0);
        return colors[index++];
        };
        
        websocket2.onmessage = function(e){//websocket用来根据传来的数据修改模型的特征
            //alert("接收到消息：" + e.data);
            var jsonObject = JSON.parse(e.data);
            var msgType = jsonObject.type;
            var deviceLocation = jsonObject.location;
            var deviceState = jsonObject.state;
            var obj = {type:msgType,location:deviceLocation,state:deviceState};
            var mark = 0;
            objects.forEach(function(e){
                if(e.deviceName == deviceLocation){
                    mark = 1;
                }
            })
            if(mark == 1){
                if(msgType == "camera"){
                    deviceMap.set(obj.location,obj);
                    if(deviceState == "1" ){
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
            }
        }

        websocket.onmessage = function(e){//websocket用来根据传来的数据修改模型的特征
            //alert("接收到消息：" + e.data);
            var jsonObject = JSON.parse(e.data);
            var msgType = jsonObject.type;
            var deviceLocation = jsonObject.location;
            var deviceState = jsonObject.state;
            var obj = {type:msgType,location:deviceLocation,state:deviceState};
            var mark = 0;
            objects.forEach(function(e){
                if(e.deviceName == deviceLocation){
                    mark = 1;
                }
            })
            if(mark == 1){
                if(msgType == "switch"){
                    var cont;
                    mesh = scene.getObjectByName(deviceLocation);
                    if(deviceState == "1"){
                        cont = "开关:"+deviceLocation+"打开";
                        materialTest = new THREE.MeshPhongMaterial({ 
                            // ambient: 0x050505, 
                            color: 0x00ff00, 
                            specular: 0x111111, 
                            shininess: 200
                        });
                    }else{
                        cont = "开关:"+deviceLocation+"关闭";
                        materialTest = new THREE.MeshPhongMaterial({ 
                            // ambient: 0x050505, 
                            color: 0xFF0000, 
                            specular: 0x111111, 
                            shininess: 200 
                        });
                    }
                    mesh.material = materialTest;
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
                        title: '站点：' + siteId,
                        content: cont
                      });
                }else{
                    deviceMap.set(obj.location,obj);
                    let pipelineLocation  = parseInt(deviceLocation.substr(8));
                    let pipelineType;
                    if(pipelineLocation<13){
                        pipelineType="水管报警，请联系相关修理人员！"
                    }else if(pipelineLocation>=13){
                        pipelineType="烟管报警，请联系相关修理人员！"
                    }else{
                        pipelineType=""
                    }
                    if(deviceState == "1" ){
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
            }
        }
    
        function onDocumentDbclick(event){
            event.preventDefault(); 
            var vector = new THREE.Vector3();//三维坐标对象 
            vector.set( ( event.clientX / window.innerWidth ) * 2 - 1, - ( event.clientY / window.innerHeight ) * 2 + 1, 0.5 ); 
            vector.unproject( camera ); 
            var raycaster = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize()); 
            var intersects = raycaster.intersectObjects(scene.children); 
            if (intersects.length > 0) 
            { var selected = intersects[0];//取第一个物体 
                var str = "x坐标:"+selected.point.x.toFixed(6) 
                    + "<br>"+"y坐标:"+selected.point.y.toFixed(6)+"<br>"+"z坐标:"+selected.point.z.toFixed(6);
                document.getElementById('coords').innerHTML = str; 
                document.getElementById('coords').style.display = '';
                console.log(intersects.length); 
                //在mainCtrl.js中绑定前端input
                if($("#addModel").css("display")=="none") {
                    
                }else{
                    jQuery('#xValue').val(selected.point.x.toFixed(6));
                    jQuery('#yValue').val(selected.point.y.toFixed(6));
                    jQuery('#zValue').val(selected.point.z.toFixed(6));
                    jQuery('#xValue-s').val(selected.point.x.toFixed(6));
                    jQuery('#yValue-s').val(selected.point.y.toFixed(6));
                    jQuery('#zValue-s').val(selected.point.z.toFixed(6));
                }
            }
    
        }
    
        function onDocumentMouseDown(event) {
            event.preventDefault();    
            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
            raycaster.setFromCamera(mouse, camera);
            //var octreeObjects;
            var numObjects;
            //var numFaces = 0;
            var intersections;
            intersections = raycaster.intersectObjects(objects);
            numObjects = objects.length;
            //numFaces = totalFaces;
            
            //console.log("dijichangdu :"+intersections.length)
            if (intersections.length > 0) {
                    var deviceName =  intersections[0].object.deviceName;
                    var deviceId = intersections[0].object.deviceId;
                    var label = intersections[0].object.label;
                    downIntersected = intersections[0].object;
        
                    if (event.button === 2){
                        window.addEventListener('keydown', changeMode);
                        event.preventDefault();
                        transformcontrol.attach(downIntersected);
    
                    }else{
                        if(deviceName == "camera1"){
                            var search = window.location.search;
                            //window.location.href= '/camera'+search;
                            window.open('/camera'+search);
                        }else{
                            //==================点击设备显示控制面板=========
                            //外部js代码调用angular内部$scope的变量和函数
        
                            var appElement = $('[ng-controller=deviceCtrPanel]');
                            var $scope = angular.element(appElement).scope();
        
                            $.ajax({//调用接口获取设备的详细信息
                                url:'/api/3d815/getDeviceInfo/'+ deviceId,
                                type:'GET',
                                async:false,
                                success: function(res){
                                    $scope.deviceInfo = res;
                                },
                                error: function(e){
                                    console.log(e.message);
                                }
                            });
        
                            $('#deviceDetail').modal('show');     //控制面板触发仅此一行代码
                            $scope.showDetail();
                        }
                         
                    }                                                                                             
                    }                                                
        }
    
        function onDocumentMouseMove(event) {//鼠标移动事件的监听
            event.preventDefault();
            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
            raycaster.setFromCamera(mouse, camera);
            //var octreeObjects;
            var numObjects;
            var intersections;
            intersections = raycaster.intersectObjects(objects);
            numObjects = objects.length;
            
            if (intersections.length > 0) {
                if (intersected != intersections[0].object) {
                    if (intersected) intersected.material.color.setHex(baseColor);
                    
                    intersected = intersections[0].object;
                    //intersected.material.color.setHex(intersectColor);//将模型的颜色修改
    
                    var deviceName =  intersected.deviceName;
                    var deviceId = intersected.deviceId;
                    var label = intersected.label;
                    var isAlarm = intersected.isAlarm;
                    var alarmType = intersected.alarmType;
                    if(isAlarm){
                        if(deviceName == "camera1"){
                            ToolTip.showtip(event,"摄像头异常");
                        }else{
                            ToolTip.showtip(event,"设备名称:"+deviceName+"<br>报警类型:" + alarmType);
                        }
                    }else{
                            ToolTip.showtip(event, "设备名称:"+deviceName+"<br>设备ID:"+deviceId+"<br>标签:"+label);
                    }
    
                }
    
                document.body.style.cursor = 'pointer';
            } else if (intersected) {
                //intersected.material.color.setHex(baseColor);//将模型的颜色修改回来
                intersected = null;
                document.body.style.cursor = 'auto';
                //transformcontrol.detach();
                //window.removeEventListener("keydown", changeMode)
                // if(!showAllLabel)
                    ToolTip.hidetip();
                // $('#showDeviceInfo').css({'display':'none'});
            }
        }
        function alt() {
            window.open("./camera/camera.html", "_blank", "toolbar=no, location=no, directories=no, status=no, menubar=yes, scrollbars=no, resizable=no, copyhistory=yes, width=920, height=500")
        }
        function changeMode() {//各种模式的切换
            switch (event.keyCode) {
                case 81: // Q
                    transformcontrol.setMode("translate");
                    break;
                case 87: // W
                    transformcontrol.setMode("rotate");
                    break;
                case 69: // E
                    transformcontrol.setMode("scale");
                    break;
                case 27: //esc
                    transformcontrol.detach();
                    window.removeEventListener("keydown", changeMode);
                    break;
                case 187:
                case 107: // +, =, num+
                    transformcontrol.setSize( transformcontrol.size + 0.1 );
                    break;
                case 189:
                case 109: // -, _, num-
                    transformcontrol.setSize( Math.max( transformcontrol.size - 0.1, 0.1 ) );
                    break;
            }
        }
        function onWindowResize() {   //屏幕自适应
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        }
        //
        function animate() {   //递归渲染
            requestAnimationFrame(animate);
            render();
        }
        var previousShadowMap = false;
        function render() {   //渲染
            for(let[key,value] of deviceMap){
                var mesh;
                var materialTest;
                var alarmType;
                mesh = scene.getObjectByName(value.location);
                if(value.state == '1' ){
                    materialTest = new THREE.MeshPhongMaterial({ 
                        // ambient: 0x050505, 
                        color: 0xffffff*Math.random(), 
                        specular: 0x555555, 
                        shininess: 30 
                    });
                    
                    mesh.isAlarm = true;
                    if(value.type == "smoke"){
                        alarmType = "烟雾";
                    }else if(value.type == "infrared"){
                        alarmType = "红外";
                    }else if(value.type == "humidity"){
                        alarmType = "温湿";
                    }else if(value.type == "water"){
                        alarmType = "水浸";
                    }else if(value.type == "doorMagnet"){
                        alarmType = "门磁";
                    }
                    mesh.alarmType = alarmType;
                }else{
                    if(value.location.substr(0,4) == "wall" || value.location.substr(0,4) == "door"){
                        materialTest = new THREE.MeshPhongMaterial({
                            color: 0xA52A2A,
                            specular: 0x111111,
                            shininess: 200
                        });
                    }else if(value.location == "camera1"){
                        materialTest = new THREE.MeshPhongMaterial({
                            color: 0x00FF00,
                            specular: 0x111111,
                            shininess: 200
                        });
                    }else{
                        materialTest = new THREE.MeshPhongMaterial({
                            color: 0xFF0000,
                            specular: 0x111111,
                            shininess: 200
                        });
                    }
                    mesh.isAlarm = false;
                    mesh.alarmType = "";
                }
                mesh.material = materialTest;
            }
            renderer.toneMappingExposure = Math.pow(params.exposure, 5.0); // to allow for very bright scenes.
            renderer.shadowMap.enabled = params.shadows;
            if (firstScene !== undefined){        //控制调节场景模型透明度,旋转,缩放
                firstScene.material.opacity = params.opacity;
                firstScene.position.x = sceneCtrl["平移-x"];
                firstScene.position.y = sceneCtrl["平移-y"];
                firstScene.position.z = sceneCtrl["平移-z"];
                firstScene.rotation.x = sceneCtrl["旋转-x"];
                firstScene.rotation.y = sceneCtrl["旋转-y"];
                firstScene.rotation.z = sceneCtrl["旋转-z"];
                var _scale = sceneCtrl["缩放"];
                firstScene.scale.x = _scale;
                firstScene.scale.y = _scale;
                firstScene.scale.z = _scale;
            }
    
                //新地板材质
                // if (params.shadows !== previousShadowMap) {
    
                //     floorMaterial.needsUpdate = true;
                //     //previousShadowMap = params.shadows;
                // }
            var foo = function(){
                        
                        var onObject = false;
    
                        var time = performance.now();
                        var delta = ( time - prevTime ) / 3000;     //可以控制移动速度
    
                        velocity.x -= velocity.x * 10.0 * delta;
                        velocity.z -= velocity.z * 10.0 * delta;
    
                        velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass
    
                        direction.z = Number( moveForward ) - Number( moveBackward );
                        direction.x = Number( moveLeft ) - Number( moveRight );
                        direction.normalize(); // this ensures consistent movements in all directions
    
                        if ( moveForward || moveBackward ) velocity.z -= direction.z * 400.0 * delta;
                        if ( moveLeft || moveRight ) velocity.x -= direction.x * 400.0 * delta;
    
                        if ( onObject === true ) {
    
                            velocity.y = Math.max( 0, velocity.y );
                            canJump = true;
    
                        }
    
                        pointerLock.getObject().translateX( velocity.x * delta );
                        pointerLock.getObject().translateY( velocity.y * delta );
                        pointerLock.getObject().translateZ( velocity.z * delta );
    
                        if ( pointerLock.getObject().position.y < 100 ) {
    
                            velocity.y = 0;
                            pointerLock.getObject().position.y = -2;   //相机Y轴位置
    
                            canJump = true;
    
                        }
    
                        prevTime = time;
            }
            foo();   //漫游动画函数
           
            var time = Date.now() * 0.0005;
            var delta = clock.getDelta();
            /*更新所有标签位置 */
            if(allLabelDiv.length !== 0){
                objects.forEach(function(e) {
                        
                    let position = e.position.clone();
                    let result = screenCoord(position);
                    let top = result.top + 5 + "px";
                    let left = result.left + 5 + "px";
                    e.tipdiv.css({
                        left: left,
                        top: top,
                    });
                    
                });
            }
            /**end */
    
            renderer.render(scene, camera);//进行场景和相机的渲染
            // stats.update();
        }
        
        var fog = {//配置场景中的雾的效果
            scenefog: null,
            twinkleWarning: function(scene) {
                scene.fog = new THREE.FogExp2(0xffff00, 0.02);
                this.scenefog = setInterval(function() {
                    var density = scene.fog.density
                    if (density !== 0) {
                        scene.fog.density = 0;
                    } else scene.fog.density = 0.02;
                }, 800);
            },
            clear: function(scene) {
                clearInterval(this.scenefog);
                scene.fog.density = 0;
            }
        }
        function createXMLHTTPRequest() {   //用于在后台与服务器交换数据
            //1.创建XMLHttpRequest对象
            //这是XMLHttpReuquest对象无部使用中最复杂的一步
            //需要针对IE和其他类型的浏览器建立这个对象的不同方式写不同的代码
            var xmlHttpRequest;
            if (window.XMLHttpRequest) {
                //针对FireFox，Mozillar，Opera，Safari，IE7，IE8
                xmlHttpRequest = new XMLHttpRequest();
                //针对某些特定版本的mozillar浏览器的BUG进行修正
                if (xmlHttpRequest.overrideMimeType) {
                    xmlHttpRequest.overrideMimeType("text/xml");
                }
            } else if (window.ActiveXObject) {
                //针对IE6，IE5.5，IE5
                //两个可以用于创建XMLHTTPRequest对象的控件名称，保存在一个js的数组中
                //排在前面的版本较新
                var activexName = ["MSXML2.XMLHTTP", "Microsoft.XMLHTTP"];
                for (var i = 0; i < activexName.length; i++) {
                    try {
                        //取出一个控件名进行创建，如果创建成功就终止循环
                        //如果创建失败，回抛出异常，然后可以继续循环，继续尝试创建
                        xmlHttpRequest = new ActiveXObject(activexName[i]);
                        if (xmlHttpRequest) {
                            break;
                        }
                    } catch (e) {}
                }
            }
            return xmlHttpRequest;
        }
        function getAjax(url, fn) {
            var xhr = createXMLHTTPRequest();
            if (xhr) {
                xhr.open("GET", url, true);
                xhr.onreadystatechange = function() {
                    if (xhr.readyState == 4) {
                        if (xhr.status == 200) {
                            fn(xhr.responseText);
                        } else {
                            //alert("error");
                        }
                    }
                }
                xhr.send(null);
            }
        }
