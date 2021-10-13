//jquery写法
$(function(){
    //这里写代码可以控制所有html节点
    var stage = document.getElementById("stage"),
        bg1 = stage.getElementsByClassName('bg1')[0],
        bg2 = stage.getElementsByClassName('bg2')[0],
        bgxx1 = -200,//定位最下方
        bgxx2 = -968,//第二张图片定位200+768（top往上取负）
        k = 0,//记数
        
        //赋值获取飞机节点
        plane = document.getElementsByClassName('plane')[0],
        //用数组定义方向(上,右,下,左,空格键),0表示未按下,1表示按下
        pdirection = [0,0,0,0,0],
        //定义功能切换
        funcSwitch = 1,//1表示打开键盘,关闭鼠标  2表示关闭键盘,打开鼠标
        //玩家得分
        planeScore = 0,
        //游戏键盘状态,开始为false
        gameKey = false,
        //游戏碰撞状态,开始为false(碰撞检测失效)
        gameKiss = false,
        
        //赋值子弹的宽,高,速度
        bulletW = 63,
        bulletH = 63,
        bulletS = 30;
        //初始化游戏界面
        initGame();
   
        // console.log(top)
        setInterval(function(){
            bgxx1++
            bgxx2++
            k++
            if(k == 768){
                // console.log(k)
                bgxx1 = -968//第一张图片完全过完,移到第二张图片定位位置
            }else if(k == 768*2){
                // console.log(k)
                bgxx2 = -968//第二张图片完全过完,移到第一次第二张图片定位位置
                k = 0;//重置记数
            }
       
            $(bg1).css({"top":bgxx1})
            $(bg2).css({"top":bgxx2})
        },1000/60)

    //键盘事件控制飞机移动 onkeydown(按下连续生成,连续执行)
    document.onkeydown = function(e){
        if(gameKey == false)return//游戏状态为false不执行下面代码(关闭键盘)
        if(e.key.toLocaleLowerCase() == "w"){
            // console.log(parseFloat($(plane).css("top"))+5)
            pdirection[0] = 1
           
        }else if(e.key.toLocaleLowerCase() == "s"){
            pdirection[2] = 1
            // console.log("anxia")
        }else if(e.key.toLocaleLowerCase() == "a"){
            pdirection[3] = 1
        }else if(e.key.toLocaleLowerCase() == "d"){
            pdirection[1] = 1
            
        }else if(e.ctrlKey){
            // e.preventDefault()
            mp3bg.pause()//音乐开始
            // $(this).html("音乐")
       }else if(e.shiftKey){
            // e.preventDefault()
            mp3bg.play()//音乐开始
            // $(this).html("关闭音乐")
       }
    }
    //单独控制空格键(子弹打出) onkeypress(按下一次生成一次)
    document.onkeypress = function(e){
        if(gameKey == false)return//游戏状态为false不执行下面代码(关闭键盘)
        if(e.key == " "){
            fire()//发射子弹事件
        }
      
    }
    //抬起事件(抬起键帽事件停止)
    document.onkeyup = function(e){
        if(e.key.toLocaleLowerCase() == "w"){
            // console.log(parseFloat($(plane).css("top"))+5)
            pdirection[0] = 0
           
        }else if(e.key.toLocaleLowerCase() == "s"){
            pdirection[2] = 0
            // console.log("anxia")
        }else if(e.key.toLocaleLowerCase() == "a"){
            pdirection[3] = 0
        }else if(e.key.toLocaleLowerCase() == "d"){
            pdirection[1] = 0
            
        }else if(e.key == " "){
            pdirection[4] = 0
        }
    }
   
    
    //鼠标移动事件
    stage.onmousemove = function(e){
        if(funcSwitch == 1)return;//关闭鼠标功能,打开键盘(返回,不执行下面代码)
        var planeX = e.clientX - parseFloat($(stage).css("margin-left")),
            planeY = e.clientY;
            // console.log(planeX,planeY)
        $(plane).css({'left':planeX - $(plane).width()/2,'top':planeY - $(plane).height()/2})
    }
    //绑定功能切换事件
    $('.func').click(function(e){
        if($('.func').html() == "功能切换"){
            if(funcSwitch == 1){
                funcSwitch = 2;//关闭键盘,打开鼠标,自动发射子弹
                clearInterval(timerKey);
                fireKey = setInterval(fire,300)
            }else{
                funcSwitch = 1;//打开键盘,关闭鼠标,按空格键发射子弹
                timerKey = monitorKey();
                clearInterval(fireKey)
            }
        }
    })
    
    //绑定游戏开始事件
    $("#btnStartGame").click(function(){
        // console.log($(".inp").val())
        if($(".inp").val().length > 7 || $(".inp").val().match(",")){
              $(".limit").show()
        }else{
              //点击游戏开使按键清除所有敌机(重置游戏)
              $('.enemy').remove();
              // window.localStorage(本地存储,关闭浏览器数据也会在,除非清空历史记录,最大存储5M)
              // sessionStorage(用在表单提交服务上,关闭浏览器数据会被清空)
              // cookie(支持新旧浏览器多,储存数据小,获取数据通过正则,截取字符串方法)
              //存储玩家姓名  setItem (设置键,键值)
              localStorage.setItem("player"+(localStorage.length+1),$(".inp").val()+',0');
              //每次游戏开始清除之前的得分
              planeScore = 0;
              //游戏开始执行
              startGame()
        }
       
    })
    //绑定再来一次按键
    $(".btnreGame").click(function(){
        // 游戏中点击功能切换死亡后方向键无效,清除掉之前的时间控件再次赋予生效
        clearInterval(keyTime);//清除开始游戏死亡后的时间控件监控键盘事件
        timerKey = monitorKey();//再次执行时间控件监控键盘事件,飞机行动
        // gameKey = true;//打开键盘方向及开火键,游戏开始startGame()会打开键盘方向及开火键
        //隐藏积分排行榜
        $(".gameSort").hide()
        //点击游戏开使按键清除所有敌机(重置游戏)
        $('.enemy').remove();
        //显示功能切换
        $(".func").show();
        //游戏开始执行
        startGame()
    })
    //绑定回到首页按钮
    $('.btnHeadGame').click(function(){
        gameKiss = false;
        $(".gameSort").hide()
        $(".gameDesc").show()
        
        // console.log(11213)
        // $('plane').hide()
    })
    /*
    //敌机事件
    1.先让敌机动起来,每个敌机速度不一样,判断类名
    */
   var enemys = document.getElementsByClassName('enemy');
//    console.log(enemys)
      setInterval(function(){
        for(var i = 0;i<enemys.length;i++){
            if(enemys[i].className == "enemy enemy1"){
                $(enemys[i]).css({'top':parseFloat($(enemys[i]).css("top"))+4})
            }else if(enemys[i].className == "enemy enemy2"){
                $(enemys[i]).css({'top':parseFloat($(enemys[i]).css("top"))+5})
            }else if(enemys[i].className == "enemy enemy3"){
                $(enemys[i]).css({'top':parseFloat($(enemys[i]).css("top"))+6})
            }else if(enemys[i].className == "enemy enemy4"){
                $(enemys[i]).css({'top':parseFloat($(enemys[i]).css("top"))+7})
            }
            
        }
      },20)
      /*
        用setTimeout(一次调用之后就清除),这样在1s请求动画帧持续生成敌机造成无限循环;
        用setTimeout原因在于定时器时间间隔不准,这里用setInterval(无限循环)时间间隔不准造成页面紊乱;
        而setTimeout调用一次清除一次,时间精确高
        开始第一架飞机1s出来,后面(1000/60)一架
      */
      enemyPlay()
      function enemyPlay(){
        setTimeout(function(){
            // 随机数来控制生成的敌机/生成敌机位置也不一样
            var num = parseInt(Math.random()*4+1),
                enemysW = [105,105,105,105];
                ranSite = parseFloat(Math.random()*$(stage).width()) - enemysW[num - 1];
                ranSite = ranSite > 0 ? ranSite:0;
                $("<div class=\"enemy enemy"+num+"\"></div>").css({"left":ranSite}).appendTo("#stage");
                requestAnimationFrame(enemyPlay)
        },1000)
       
      }
     
        
     
      //生成敌机过完舞台消除掉dom节点
      setInterval(function(){
        for(var i = 0;i<enemys.length;i++){
            var enemy_top = parseFloat($(enemys[i]).css("top")),
                stage_top = parseFloat($(stage).height());
                if(enemy_top > stage_top){
                    $(enemys[i]).remove()
                    // console.log("移除")
                }
        }
      })
      //控制子弹生成的时间控件
      setInterval(function(){
        //判断子弹的个数,为0时直接返回,不执行下边代码
        if($('.bullet').length == 0)return;
        var bullets = $('.bullet');
        for(var i = 0;i<bullets.length;i++){//循环遍历每个生成的子弹
            var bt_top = parseFloat($(bullets[i]).css('top'));//每个子弹对应的top值
            $(bullets[i]).css({"top":bt_top - 10});//每个子弹对象top值运动值的变化
            if(parseFloat($(bullets[i]).css('top')) < -bulletH){  //判断子弹超出舞台消除子弹节点
                $(bullets[i]).remove()//子弹超出舞台移除节点
                // console.log("溢出")
            }
        }
       
      },bulletS)
    
    //   setInterval(function(){
      
    //     for(var i = 0;i<bullets.length;i++){
           
    //     }  
    //   },bulletS)
      //
    //定义一个变量,用于接受时间控件每300毫秒发射子弹的动画(开始键盘事件不自动发射子弹)
    var fireKey;
    var timerKey = monitorKey();//接受时间控件监控键盘按下情况
    //模拟空格键自动发射子弹(模拟按键事件)
    // setInterval(function(){
    //     var e = jQuery.Event("keypress");
    //         e.key = ' ';
    //         $(document).trigger(e)
    // },200)
    
    //子弹与敌机碰撞检测,玩家飞机与敌机碰撞检测
    var timerKiss = detectionKiss();
    
    //封装子弹与敌机碰撞检测,玩家飞机与敌机碰撞检测
    function detectionKiss(){
        return setInterval(function(){
            var bullet = $('.bullet');
                for(var i = 0;i<bullet.length;i++){
                    for(var j = 0;j<enemys.length;j++){
                        if(kissAB(bullet[i],enemys[j])){
                            $("#mp3de")[0].currentTime = 0;//初始时间为0
                            $("#mp3de")[0].play();//音乐开始
                            $(bullet[i]).remove();
                            $(enemys[j]).remove();
                            planeScore++;
                            break;
                        }
                    }
                }
            //玩家飞机与敌机碰撞检测
            for(var i = 0;i<enemys.length;i++){
                if(kissAB(plane,enemys[i])){
                    // alert("游戏结束")
                    if(gameKiss){//游戏状态碰撞为false时游戏结束(碰撞检测失效)
                        gameOver();
                        break;
                    }
                   
                }
            }
        },10)
    }
    //封装碰撞模型
    function kissAB(A,B){
        var isKiss = false;//定义未碰撞,开关关闭
        var a = $(A).height()/2 + parseFloat($(A).css("top")) - $(B).height()/2 - parseFloat($(B).css("top")),
        b = $(A).width()/2 + parseFloat($(A).css("left")) - $(B).width()/2 - parseFloat($(B).css("left")),
        c = $(A).width()/2 + $(B).width()/2 - 30;
        if(a*a+b*b < c*c){//判断是否碰撞
        isKiss = true;//碰撞,开关打开
        }
        return isKiss;
    }
    
    //封装时间控件监控键盘按下情况
    function monitorKey(){
        return keyTime = setInterval(function(){//返回时间控件监控键盘事件
            if(pdirection[0] == 1){
                // console.log(parseFloat($(plane).css("top"))+5)
                if(parseFloat($(plane).css('top')) >= 6){
                    $(plane).css({"top":parseFloat($(plane).css("top"))-6})
                }else{
                    $(plane).css({"top":0})
                }
            
            }else if(pdirection[2] == 1){
                // console.log($(plane).css('bottom'))
                if(parseFloat($(plane).css('top')) <= $(stage).height() - $(plane).height() - 6){
                    $(plane).css({"top":parseFloat($(plane).css("top"))+6})
                    // console.log(parseFloat($(plane).css("top"))+6)
                }else{
                    $(plane).css({"top":$(stage).height() - $(plane).height()})
                    // $(plane).css({"top":parseFloat($(plane).css("top"))+0})
                    
                }
            
            }else if(pdirection[3] == 1){
                if(parseFloat($(plane).css("left")) >= 6){
                    $(plane).css({"left":parseFloat($(plane).css("left"))-6})
                }else{
                    $(plane).css({"left":0}) 
                }

            }else if(pdirection[1] == 1){
                if(parseFloat($(plane).css("right")) >= 6){
                    $(plane).css({"left":parseFloat($(plane).css("left"))+6})
                }else{
                    $(plane).css({"left":$(stage).width() - $(plane).width()})
                }
                
            }
        },10)
        
    }
    
    //封装发射子弹事件
    function fire(){
        $("#mp3sh")[0].currentTime = 0;//初始时间为0
        $("#mp3sh")[0].play()
        pdirection[4] = 1//空格键按下
        var b_left = parseFloat($(plane).css("left")) + $(plane).width()/2 - bulletW/2,
            b_top = parseFloat($(plane).css('top')) - bulletH;
        $('<div class="bullet"></div>').css({"left":b_left,"top":b_top}).appendTo(stage);
    }

    //背景音乐
   
    // $("#btnmusic").click(function(){

    //     // if($(this).html() == "开启音乐"){
    //     //     mp3bg.play()//音乐开始
    //     //     $(this).html("关闭音乐")
    //     // }else{
    //     //     mp3bg.pause()//音乐暂停
    //     //     $(this).html("开启音乐")
    //     // }
    
    // })
    //模拟按键点击,游戏开始背景音乐响起
    // var timeck = setInterval(function(){
    //     $('#btnmusic').click()
    //     clearInterval(timeck)
    // },100) 
    
    //初始化游戏界面
    function initGame(){
        //隐藏玩家飞机与功能按钮
        $(plane).hide()
        $(".func").hide()
    }
    //封装开始游戏
    function startGame(){
        //游戏开始碰撞状态打开
        gameKiss = true;
        //打开键盘方向及开火键
        gameKey = true;
        //载入背景音乐
        $("#mp3bg")[0].currentTime = 0;
        $("#mp3bg")[0].play();
        //显示玩家飞机
        $(plane).show()
        //显示功能按钮
        $(".func").show()
        //隐藏游戏开始界面
        $(".gameDesc").hide()
        //检测子弹与敌机碰撞检测,玩家飞机与敌机碰撞检测
        timerKiss = detectionKiss()
        //生成玩家飞机
        var timeTmp = setInterval(function(){
            //开始玩家飞机位置定位
            if(parseFloat($(plane).css("top")) < $(stage).height() - $(plane).height()*2){//判断当玩家飞机top值小于(舞台高度-2个玩家飞机高度)
                clearInterval(timeTmp)//清除时间控件
            }else{//当玩家飞机top值大于(舞台高度-2个玩家飞机高度),玩家飞机top值递减,直至满足条件,走入true
                plane.style.cssText = "top:"+(parseFloat($(plane).css("top"))-6)+"px;left:"+($(stage).width()/2-$(plane).width()/2+ "px");
            }
        },10)
   
    }   
   
    //封装结束游戏
    function gameOver(){
        //游戏结束关闭功能切换自动开火的时间控件
        clearInterval(fireKey)
        //游戏结束关闭鼠标,打开键盘
        funcSwitch = 1;
        //游戏状态为false不执行下面代码(关闭键盘)
        gameKey = false;
        //记录玩家分数  getItem 获取值(设置)
        var curplayer = localStorage.getItem("player"+localStorage.length) || [];
        //截取从下标0到字符串(值)中","位置的值
        var curplayerName = curplayer.substring(0,curplayer.indexOf(","));
        //设置值(玩家,得分)
        localStorage.setItem("player"+localStorage.length,curplayerName+","+planeScore);
        // console.log(localStorage.getItem("player"+localStorage.length))
        //存储玩家信息
        var players = [];
           
        for(var i = 1;i<=localStorage.length;i++){
            var strinfo = localStorage.getItem("player"+i);
            //原来是字符串"玩家,得分" ==>分割后["玩家",得分]
            // console.log(strinfo)
            players.push(strinfo.split(","));
        }
       
        
        // alert(strinfo)
        players = players.sort(function(a,b){
            return a[1] - b[1]
        })
        var resulthtml = '',//定义一个函数用来塞入数据
            k = 0;
        for(var i = players.length - 1;i>=0;i--){
            if(k<10){
                resulthtml += " <tr> \
                                <td>"+(players.length-i)+"</td> \
                                <td>"+players[i][0]+"</td> \
                                <td>"+players[i][1]+"</td> \
                                </tr>"
                k++;
            }else break;
           
        }
        $(".gameSort_tbody").html(resulthtml)//将数据塞入
        //显示积分排行榜
        $(".gameSort").show();
        //清除子弹与敌机碰撞检测,玩家飞机与敌机碰撞检测
        clearInterval(timerKiss);
        //清除所有敌机
        $('.enemy').remove();
        // plane.hidden = true;//h5方法
        $(plane).hide();//隐藏玩家飞机
        //隐藏功能切换
        $('.func').hide();
        //结束玩家飞机定位
        plane.style.cssText = "top:"+$(stage).height()+"px;left:"+($(stage).width()/2-$(plane).width()/2+"px");
        // if(confirm('是否重新开始?')){
        //     startGame()//确认游戏重新开始
        // }else{
        //     $(plane).hide();//取消玩家飞机隐藏
        // }
        // startGame()//确认游戏重新开始
        //重置键盘方向
        pdirection = [0,0,0,0,0];
    }
  
})

