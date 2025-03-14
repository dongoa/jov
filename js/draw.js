import {groupArray} from './groupArray.js';
import {r} from './r.js';
import {positioneachG} from './positioneachG.js';
import {pathString} from './pathString.js';
// var colormap=['#F39C29', '#7FBD66', '#BEA4DB'];
var colormap=[
    '#a6cee3',
    '#1f78b4',
    '#b2df8a',
    '#33a02c',
    '#fb9a99',
    '#e31a1c',
    '#fdbf6f',
    '#ff7f00',
    '#cab2d6',
    '#6a3d9a'];
var its=0;
function turnPaperId(c1,c2){
    let arr=[];
    for(var i in c1){
        for(var j in c2){
            if(c1[i]==c2[j]) arr.push(j);
        }
    }
    return arr;
}
export function draw(ans,s,gType,numGroups=5){
    console.log(gType);

    var Idans = turnPaperId(ans,s);
    var [g2paper,groupNumber]=groupArray(gType,Idans,s,numGroups);
    var p_each_year=new Array(10).fill(0);
    var cirleArray=[];
    var maxL=0,maxY;
    {
        for(var i=0;i<10;i++){
            for(var gi in g2paper){
                let n=0;
                var tmp = g2paper[gi].arrYear[i];
                var tl=tmp.length;
                if(tl>maxL){ maxL=tl;maxY=i; }
                p_each_year[i]+=tl;
                for(var k in tmp){
                    let item={};
                    item.pid=tmp[k];
                    item.group=gi;
                    item.year=i;
                    item.groupid=n++;
                    item.gfigLength=tl;
                    cirleArray.push(item);
                }
            }
        }
    }

    console.log("G2PAPER",g2paper);

    var svg = d3.select(".svg");
    const width=$('.svg').width();
    var height=$('.svg').height();
    $('.svg').children('*').remove();
    var YearWidth=width/10;
    var textyearheight=30;
    height-=textyearheight;
    var yearText=svg.append("g").attr("class","year-text");
    for(var i=0;i<10;i++){
        yearText.append("text").attr("x",width/10*i+YearWidth/2-25).attr("y",25).text(function(){ return i+2010; }).attr("class","yearText").style("font-size",function(){
            if(width<700) return width/35 + "px";
            return "25px";
        });
    }
    svg=svg.append("g").attr("class","content");
    var yearbar=svg.append("g").attr("class","year-bar");
    for(var i=1;i<10;i++){
        yearbar.append("line").attr("x1",width/10*i).attr("x2",width/10*i).attr("y1",0).attr("y2",height);
    }
    var gPath=svg.append("g").attr("class","group-path");
    var gRing=svg.append("g").attr("class","rings");
    var gNameText=svg.append("g").attr("class","group-name");
    var year2p=p_each_year;
    var [_,maxp_year]=d3.extent(year2p);
    const y = d3.scaleLinear()
        .range([height, 0])
        .domain([maxp_year,0]);
    var cR=0,cols=0;
    for(var i=0;i<10;i++){
        for(var gi in g2paper){
            var tmp = g2paper[gi].arrYear[i];
            var tl=tmp.length;
            if(tl!=0)
            var [cRi,colsi]=r(YearWidth,y(tl),tl);
            if(colsi>cols){
                cols=colsi;
                cR=cRi;
            }else if(colsi==cols&&cRi<cR){
                cR=cRi;
            }
        }
    }
    var $tips = $('#J_tips');

    if (!$tips.length) {

        $tips = $('<div id="J_tips" class="tips"></div>');

        $('body').append($tips);

    }
    var posotion_each_group=positioneachG(g2paper,YearWidth,height,y,p_each_year);
    var pathstring=pathString(posotion_each_group,groupNumber,YearWidth);
    console.log(posotion_each_group,pathstring);
    gPath.selectAll("path").data(pathstring).enter().append("path").attr("d",function(d){ return d; }).attr("fill",function(d,i){ return colormap[i];})//.style("stroke-opacity","0.2").style("opacity","0.8")
        // .on("mousemove",function(d,i){
        //     // console.log("BBox",tip3.getScreenBBox2());
        //     $(this).on("click",function(e){
        //         var pageX = e.pageX,
        //
        //             pageY = e.pageY;
        //         console.log(pageX,pageY);
        //         $tips.text(g2paper[i].name).css({
        //
        //             top: pageY,
        //
        //             left: pageX
        //
        //         });
        //     })
        //
        //     // tip3.show(g2paper[i],i);
        //     $("group-path>path").css("opacity",0.2);
        //     $(this).css("opacity",1);
        //
        //     // console.log(.arr.length);
        // })
        // .on("mouseout",function(){
        //     // tip3.hide();
        //     $(this).css("opacity",0.2);
        //     // $(this).css("opacity",1);
        // })
    var padingWidth=(YearWidth-cols*2*cR)/2;
    var startmoveNumber=1;
    if(cols<3)startmoveNumber=0;
    for(let i in cirleArray){
        let d=cirleArray[i];
        let tmp=g2paper[d.group].arrYear[d.year].length+startmoveNumber;
        let padingHeight=((posotion_each_group[d.year][Number(d.group)+1]-posotion_each_group[d.year][d.group])-Math.ceil(tmp/cols)*2*cR)/2;
        let y=posotion_each_group[d.year][d.group]+padingHeight;
        let x=YearWidth*(d.year)+padingWidth;
        let rowi=Math.floor((d.groupid+startmoveNumber)/cols);
        let coli=(d.groupid+startmoveNumber)%cols;
        d.x=coli*cR*2+cR+x;
        d.y=rowi*cR*2+cR+y;
        let z=(d.gLength+startmoveNumber)%cols;
        if(d.groupid >=(d.gLength-z)){
            let z2=cR*2*(cols-z)/2;
            d.x+=z2;
        }
        if(d.groupid<cols-startmoveNumber){
            let moveTopPadding=cR*startmoveNumber;
            d.x-=moveTopPadding;
        }
    }
    {
        let cR2=cR-4;
        var arc = d3.arc()
            .outerRadius(cR2)
        var pie = d3.pie()
            .sort(null)
            .value(function (d) {
                return d.size;
            });
        var geachRing = gRing.selectAll("g").data(cirleArray).enter().append("g")
            .attr("transform", function (d) {
                return "translate(" + d.x + "," + d.y + ")";
            });
        var g = geachRing.selectAll(".arc")
            .data(function(d){
                // console.log(d);
                let data=figure2data[d.pid];
                let tmp=pie(data);
                // console.log(tmp);
                for(let j in tmp){
                    tmp[j].x=d.x;
                    tmp[j].y=d.y;
                }

                return tmp;
            })
            .enter().append("g")
            .attr("class", function(){
                return "arc";
            });
        const scaleR = d3.scaleLinear()
            .range([0,1])
            .domain([0,8]);
        g.append("path")
            .attr("d", function(d){
                // console.log(d);
                // console.log(scaleR(d.data.fratio));
                // let pages=(parseInt(s[d.data.paperid]["Last page"])-parseInt(s[d.data.paperid]["First page"]))+1;
                // arc.innerRadius(0.9*cR2*(1-((d.data.textp)/(2200*2800*pages))));
                let xxxx=10;//cR2*(1-scaleR(d.data.fratio))*0.9;
                arc.innerRadius(  (xxxx)<0?0:xxxx  );
                d.innerRadius=( (xxxx)<0?0:xxxx);
                d.outerRadius=cR2;
                let k=arc(d);
                // console.log(arc.centroid());

                return k;
            })
            .style("fill", function (d,i) {
                return "rgba(" + colorload_data[d.data.figureid] + ")";
            })
            .on('mouseover', function (k) {
                console.log(k);
                // console.log(width,height,k.x,k.y);

                TTTT(k);

                $('.img').ready(function(){
                    let ww = $('.img').css('width');
                    console.log(ww);
                });

              let imgW =  (260/k.data.fratio);


              let W1=$('.title'). height();
              let W2=$('.author'). height();
              let W3=$('.conference'). height();
              let W4=$('.keyword'). height();
              let W5=$('.fig'). height();

                let MMM=W1+W2+W3+W4+W5+40;
                console.log(W1,W2,W3,W4,W5,imgW,MMM);
                let HH=0,IH=( (imgW+10)>220?220:(imgW+10));


                if(IH> MMM) HH=IH;
                else HH=MMM;

                $('.out').css('height',HH );

            })
            .on('mouseout', function (k) {
                // if(k.click!=true)
                    tip2.hide(k,i);
            })
            .on("click",function(k){
                var pageX,
                    pageY;
                console.log(k);
                var r = (+k.innerRadius + +k.outerRadius) / 2,
                    a = (+k.startAngle + +k.endAngle) / 2 - 1.57;
                var kk= [Math.cos(a) * r, Math.sin(a) * r];
                svg.append("circle").attr("cx",k.x+kk[0]).attr("cy",k.y+kk[1]).attr("r",2).style("fill","orange").attr("class","startcircle");
                let lx=[k.x+kk[0],k.y+kk[1]];
                console.log(pageX,pageY,kk);
                ++its;
                var tip3 = d3.tip()
                    .attr('class', 'd3-tip')

                    .direction('s')
                    .html(function (d,_i) {
                        var _url = d.data.src.replace(' ','%20');

                        console.log(d,_url);

                        let sauthor = s[d.data.paperid]["Author Names"].split(';').join('; ');
                        let skey = s[d.data.paperid]["Author Keywords"].split(',').join(', ');
                        let titleclass = s[d.data.paperid]["Paper Title"];

                        var  string = "<div class='xout ui-widget-content x"+its+"'>" +
                            // "<div class='top'>" +
                            // "  " +"<div class='title t'>"+s[d.data.paperid]["Paper Title"]+"</div></div>" +
                            "<div class='left'><img class='img' src=" +_url +" ></div>"+
                            "<div class='right'><div class='contain-t'>"+
                            "" +"<div class='t Xtitle xtitle"+its+"'><strong>TITLE: </strong>"+s[d.data.paperid]["Paper Title"]+"</div><div class='xbox ui-state-default ui-corner-all' title='.ui-icon-closethick'><span class='ui-icon ui-icon-closethick'></span></div>"+
                            "" +"<div class='Xauthor xauthor"+its+" t AAA'  ><strong>AUTHORS: </strong>"+sauthor+"</div>"+
                            // style='font-size:"+(s[d.data.paperid]["Author Names"].length>100?5:6) +"px'

                            // "" +"<div class='year t'><strong>PUBLISHED YEAR: </strong>"+s[d.data.paperid]["Year"]+"</div>"+
                            "" +"<div class='Xconference xconference"+its+" t'><strong>VENUE: </strong>"+s[d.data.paperid]["Conference"]+"</div>"+
                            "" +"<div class='Xkeyword xkeyword"+its+" t'><strong>KEYWORDS: </strong>"+skey+"</div>"+
                            "" +"<div class='Xfig xfig"+its+" t'><strong>FIG: </strong>"+(d.index+1)+"/"+(d.data.fignums)+"</div>"+
                            // "" +"<div class='link t'><strong>Link: </strong>"+s[d.data.paperid]["Link"]+"</div>"+
                            // "</div></div>" +
                            // "<div class='figs'>"+"Fig."+(d.index+1)+" of "+(d.data.fignums)+"</div>" +
                            "</div>";

                        if(s[d.data.paperid]["Author Names"].length>100) {  console.log(111); $('.AAA').css('font-size','10'); }
                        if(s[d.data.paperid]["Paper Title"].length>90) $('.title .t').css('font-size','10px');
                        return string;
                    });
                svg.call(tip3);

                if(k.x <225 && k.y<130) {tip3.direction('se').offset([50, 50]);

                var lsvg=svg.append("g").attr("class","seline line"+its).call(d3.drag().on("drag", dragged));
                    lsvg.append('line').attr("x1",lx[0]).attr("y1",lx[1]).attr("x2",lx[0]+225).attr("y2",lx[1]+20).style("stroke","orange").style("stroke-width",2).style("stroke-dasharray","10,10").call(d3.drag().on("drag", dragged));
                    lsvg.append("circle").attr("cx",lx[0]+225).attr("cy",lx[1]+18).attr("r",4).style("fill","orange");
                    function dragged(d) {
                        console.log(d3.event.x,d3.event.y);
                        d3.select(this).select("line").attr("x2",  d3.event.x).attr("y2",  d3.event.y);

                        // console.log(d3.select(this).select("line"));
                        d3.select(this).select("circle").attr("cx",  d3.event.x).attr("cy",  d3.event.y);
                        // d3.select(this).attr("x2",  d3.event.x).attr("y2",  d3.event.y);
                    }
                }
                else if(k.x <225 && k.y>260 && height-k.y >130){
                    tip3.direction('e').offset([0, 50]);
                    var lsvg=svg.append("g").attr("class","selinen").call(d3.drag().on("drag", dragged));
                    lsvg.append('line').attr("x1",lx[0]).attr("y1",lx[1]).attr("x2",lx[0]).attr("y2",lx[1]+20).style("stroke","orange").style("stroke-width",2).style("stroke-dasharray","10,10").call(d3.drag().on("drag", dragged));
                    lsvg.append("circle").attr("cx",lx[0]).attr("cy",lx[1]+18).attr("r",4).style("fill","orange");
                    function dragged(d) {
                        console.log(d3.event.x,d3.event.y);
                        d3.select(this).select("line").attr("x2",  d3.event.x).attr("y2",  d3.event.y);

                        // console.log(d3.select(this).select("line"));
                        d3.select(this).select("circle").attr("cx",  d3.event.x).attr("cy",  d3.event.y);
                        // d3.select(this).attr("x2",  d3.event.x).attr("y2",  d3.event.y);
                    }
                }
                else if(k.x <225 && height-k.y <130){
                    tip3.direction('ne').offset([0, 50]);
                    var lsvg=svg.append("g").attr("class","selinen").call(d3.drag().on("drag", dragged));
                    lsvg.append('line').attr("x1",lx[0]).attr("y1",lx[1]).attr("x2",lx[0]).attr("y2",lx[1]+20).style("stroke","orange").style("stroke-width",2).style("stroke-dasharray","10,10").call(d3.drag().on("drag", dragged));
                    lsvg.append("circle").attr("cx",lx[0]).attr("cy",lx[1]+18).attr("r",4).style("fill","orange");
                    function dragged(d) {
                        console.log(d3.event.x,d3.event.y);
                        d3.select(this).select("line").attr("x2",  d3.event.x).attr("y2",  d3.event.y);

                        // console.log(d3.select(this).select("line"));
                        d3.select(this).select("circle").attr("cx",  d3.event.x).attr("cy",  d3.event.y);
                        // d3.select(this).attr("x2",  d3.event.x).attr("y2",  d3.event.y);
                    }
                }
                else if(width-k.x<450 &&  k.y<130){
                    tip3.direction('sw').offset([0, 50]);
                    var lsvg=svg.append("g").attr("class","selinen").call(d3.drag().on("drag", dragged));
                    lsvg.append('line').attr("x1",lx[0]).attr("y1",lx[1]).attr("x2",lx[0]).attr("y2",lx[1]+20).style("stroke","orange").style("stroke-width",2).style("stroke-dasharray","10,10").call(d3.drag().on("drag", dragged));
                    lsvg.append("circle").attr("cx",lx[0]).attr("cy",lx[1]+18).attr("r",4).style("fill","orange");
                    function dragged(d) {
                        console.log(d3.event.x,d3.event.y);
                        d3.select(this).select("line").attr("x2",  d3.event.x).attr("y2",  d3.event.y);

                        // console.log(d3.select(this).select("line"));
                        d3.select(this).select("circle").attr("cx",  d3.event.x).attr("cy",  d3.event.y);
                        // d3.select(this).attr("x2",  d3.event.x).attr("y2",  d3.event.y);
                    }
                }
                else if(width-k.x<450&&  k.y>260 && height-k.y >260){
                    tip3.direction('w').offset([0, 50]);
                    var lsvg=svg.append("g").attr("class","selinen").call(d3.drag().on("drag", dragged));
                    lsvg.append('line').attr("x1",lx[0]).attr("y1",lx[1]).attr("x2",lx[0]).attr("y2",lx[1]+20).style("stroke","orange").style("stroke-width",2).style("stroke-dasharray","10,10").call(d3.drag().on("drag", dragged));
                    lsvg.append("circle").attr("cx",lx[0]).attr("cy",lx[1]+18).attr("r",4).style("fill","orange");
                    function dragged(d) {
                        console.log(d3.event.x,d3.event.y);
                        d3.select(this).select("line").attr("x2",  d3.event.x).attr("y2",  d3.event.y);

                        // console.log(d3.select(this).select("line"));
                        d3.select(this).select("circle").attr("cx",  d3.event.x).attr("cy",  d3.event.y);
                        // d3.select(this).attr("x2",  d3.event.x).attr("y2",  d3.event.y);
                    }
                }
                else if(width-k.x<450&& height-k.y <260) {
                    tip3.direction('nw').offset([0, 50]);
                    var lsvg=svg.append("g").attr("class","selinen").call(d3.drag().on("drag", dragged));
                    lsvg.append('line').attr("x1",lx[0]).attr("y1",lx[1]).attr("x2",lx[0]).attr("y2",lx[1]+20).style("stroke","orange").style("stroke-width",2).style("stroke-dasharray","10,10").call(d3.drag().on("drag", dragged));
                    lsvg.append("circle").attr("cx",lx[0]).attr("cy",lx[1]+18).attr("r",4).style("fill","orange");
                    function dragged(d) {
                        console.log(d3.event.x,d3.event.y);
                        d3.select(this).select("line").attr("x2",  d3.event.x).attr("y2",  d3.event.y);

                        // console.log(d3.select(this).select("line"));
                        d3.select(this).select("circle").attr("cx",  d3.event.x).attr("cy",  d3.event.y);
                        // d3.select(this).attr("x2",  d3.event.x).attr("y2",  d3.event.y);
                    }
                }
                else if(k.x >225 && width-k.x>350 && k.y<130) {
                    tip3.direction('s').offset([50, 0]);
                    var lsvg=svg.append("g").attr("class","selines line"+its).call(d3.drag().on("drag", dragged));
                    lsvg.append('line').attr("x1",lx[0]).attr("y1",lx[1]).attr("x2",lx[0]).attr("y2",lx[1]+58).style("stroke","orange").style("stroke-width",2).style("stroke-dasharray","10,10").call(d3.drag().on("drag", dragged));
                    lsvg.append("circle").attr("cx",lx[0]).attr("cy",lx[1]+58).attr("r",4).style("fill","orange");
                    function dragged(d) {
                        console.log(d3.event.x,d3.event.y);
                        d3.select(this).select("line").attr("x2",  d3.event.x).attr("y2",  d3.event.y);

                        // console.log(d3.select(this).select("line"));
                        d3.select(this).select("circle").attr("cx",  d3.event.x).attr("cy",  d3.event.y);
                        // d3.select(this).attr("x2",  d3.event.x).attr("y2",  d3.event.y);
                    }
                }
                else if(k.x >225 && width-k.x>350 && k.y>260 && height-k.y >260){
                    tip3.direction('s').offset([50, 0]);
                    var lsvg=svg.append("g").attr("class","selines line"+its).call(d3.drag().on("drag", dragged));
                    lsvg.append('line').attr("x1",lx[0]).attr("y1",lx[1]).attr("x2",lx[0]).attr("y2",lx[1]+68).style("stroke","orange").style("stroke-width",2).style("stroke-dasharray","10,10").call(d3.drag().on("drag", dragged));
                    lsvg.append("circle").attr("cx",lx[0]).attr("cy",lx[1]+68).attr("r",4).style("fill","orange");
                    function dragged(d) {
                        console.log(d3.event.x,d3.event.y);
                        d3.select(this).select("line").attr("x2",  d3.event.x).attr("y2",  d3.event.y);

                        // console.log(d3.select(this).select("line"));
                        d3.select(this).select("circle").attr("cx",  d3.event.x).attr("cy",  d3.event.y);
                        // d3.select(this).attr("x2",  d3.event.x).attr("y2",  d3.event.y);
                    }
                }
                else if(k.x >225 && width-k.x>250 && height-k.y <260) {
                    tip3.direction('n').offset([0, 50]);
                    var lsvg=svg.append("g").attr("class","selinen").call(d3.drag().on("drag", dragged));
                    lsvg.append('line').attr("x1",lx[0]).attr("y1",lx[1]).attr("x2",lx[0]).attr("y2",lx[1]+20).style("stroke","orange").style("stroke-width",2).style("stroke-dasharray","10,10").call(d3.drag().on("drag", dragged));
                    lsvg.append("circle").attr("cx",lx[0]).attr("cy",lx[1]+18).attr("r",4).style("fill","orange");
                    function dragged(d) {
                        console.log(d3.event.x,d3.event.y);
                        d3.select(this).select("line").attr("x2",  d3.event.x).attr("y2",  d3.event.y);

                        // console.log(d3.select(this).select("line"));
                        d3.select(this).select("circle").attr("cx",  d3.event.x).attr("cy",  d3.event.y);
                        // d3.select(this).attr("x2",  d3.event.x).attr("y2",  d3.event.y);
                    }

                }
                tip3.show(k);

                $('.img').ready(function(){
                    let ww = $('.img').css('width');
                    console.log(ww);
                });

                let imgW =  (260/k.data.fratio);


                let W1=$('.xtitle'+its). height();
                let W2=$('.xauthor'+its). height();
                let W3=$('.xconference'+its). height();
                let W4=$('.xkeyword'+its). height();
                let W5=$('.xfig'+its). height();

                let MMM=W1+W2+W3+W4+W5+40;
                console.log(W1,W2,W3,W4,W5,imgW,MMM);
                let HH=0,IH=( (imgW+10)>220?220:(imgW+10));


                if(IH> MMM) HH=IH;
                else HH=MMM;

                $('.x'+its).css('height',HH);

               var drag= $(".x"+its).draggable({
                    create: function (event, ui) {   //当创建draggable时触发
                        //alert("this is create");
                    },
                    start: function (event, ui) {   //当鼠标开始拖拽时，触发此事件。
                        //alert("this is start");

                    },
                    drag: function (event, ui) {   //当鼠标拖拽移动时，触发此事件。
                        //alert("this is drag");
                        console.log(event,ui);
                    },
                    stop: function (event, ui) {   //当移动结束鼠标松开时，触发此事件。
                        //alert("this is stop");


                    }
                });
               var up=0;
               drag.mouseup(function (event) {
                   up=1;
               });
                drag.mousedown(function (event) {
                    up=0;
                })
                drag.mousemove(function(event){
                    console.log(event);
                    let wid = $('.item1').width();
                    console.log(wid);
                    if(!up){
                        d3.select('.line'+its).select("line").attr("x2", event.clientX-wid).attr("y2",  event.clientY);

                        // console.log(d3.select(this).select("line"));
                        d3.select('.line'+its).select("circle").attr("cx",  event.clientX-wid).attr("cy",   event.clientY);
                    }


                })
                $(".x"+its).trigger("drag");
                $(".xbox").on("click",function(){
                    $('.x'+its).remove();
                    $('.line'+its).remove();
                    $('.startcircle').css("opacity",0);
                })

                // if(k.click) k.click=false;
                // k.click=!k.click;
            });
    }
    function TTTT(k) {
        if(k.x <225 && k.y<130) tip2.direction('se');
        else if(k.x <225 && k.y>260 && height-k.y >130) tip2.direction('e');
        else if(k.x <225 && height-k.y <130)tip2.direction('ne');
        else if(width-k.x<450 &&  k.y<130) tip2.direction('sw');
        else if(width-k.x<450&&  k.y>260 && height-k.y >260) tip2.direction('w');
        else if(width-k.x<450&& height-k.y <260) tip2.direction('nw');
        else if(k.x >225 && width-k.x>350 && k.y<130) tip2.direction('s');
        else if(k.x >225 && width-k.x>350 && k.y>260 && height-k.y >260) tip2.direction('s').offset([50, 0]);
        else if(k.x >225 && width-k.x>250 && height-k.y <260) tip2.direction('n');
        tip2.show(k);
    }
    d3.selectAll(".d3-tip").call(d3.drag().on("drag", dragged));
    function dragged(d) {
        console.log(d3.event.x,d3.event.y);
        d3.select(this).attr("cx", d.x = d3.event.x).attr("cy", d.y = d3.event.y);
    }
    var tip2 = d3.tip()
        .attr('class', 'd3-tip')
        // .offset([10, 100])
        .direction('s')
        .html(function (d,_i) {
            var _url = d.data.src.replace(/\s+/g,'%20');
            console.log(d,_url);

            let sauthor = s[d.data.paperid]["Authors"].split(';').join('; ');
            let skey = s[d.data.paperid]["Author Keywords"].split(',').join(', ');






            var  string = "<div class='out'>" +
                // "<div class='top'>" +
                // "  " +"<div class='title t'>"+s[d.data.paperid]["Paper Title"]+"</div></div>" +
                "<div class='left'><img class='img' src=" +_url +" ></div>" +
                "<div class='right'><div class='contain-t'>"+
                "" +"<div class='title t'><strong>TITLE: </strong>"+s[d.data.paperid]["Document Title"]+"</div>"+
                "" +"<div class='author t AAA'  ><strong>AUTHORS: </strong>"+sauthor+"</div>"+
            // style='font-size:"+(s[d.data.paperid]["Author Names"].length>100?5:6) +"px'

                // "" +"<div class='year t'><strong>PUBLISHED YEAR: </strong>"+s[d.data.paperid]["Year"]+"</div>"+
                "" +"<div class='conference t'><strong>VENUE: </strong>"+s[d.data.paperid]["Venues"]+"</div>"+
                // "" +"<div class='keyword t'><strong>KEYWORDS: </strong>"+skey+"</div>"+
                "" +"<div class='fig t'><strong>FIG: </strong>"+(d.index+1)+"/"+(d.data.fignums)+"</div>"+
                // "" +"<div class='link t'><strong>Link: </strong>"+s[d.data.paperid]["Link"]+"</div>"+
                // "</div></div>" +
                // "<div class='figs'>"+"Fig."+(d.index+1)+" of "+(d.data.fignums)+"</div>" +
                "</div>";

            if(s[d.data.paperid]["Authors"].length>100) {  console.log(111); $('.AAA').css('font-size','10'); }
            if(s[d.data.paperid]["Document Title"].length>90) $('.title .t').css('font-size','10px');
            return string;
        });
    svg.call(tip2);

    var tip3 = d3.tip()
        .attr('class', 'nameTip')

        .direction('n')
        .html(function(d,_i) {

            var  string = "<div class='gdView'>"+d.name+"</div>";
            return d.name;
        });
    svg.call(tip3);
    let px=0;
    let pp=0;
    let ll=g2paper.length;
    for(var i in g2paper){
        gNameText.append("text").attr("x",function(){
            // if(i==0) return 0;
            // let l = g2paper[i-1].name.length;
            // px+=l*10+10;
            //
            // console.log(px,l);

            return 0;
        }).attr("y",function(d){
            // if(ll>8&&i<=8) return height-10-15;
            // else if(ll>8&&i>8) return height-10;
            // else
                return height-10;


        }).attr("fill",function(){ return colormap[(i%15)]; })
            .text(function () {
                return g2paper[i].name;
            }).attr("class","gsort")
            .attr("transform",function(d){
                let wid= (this).getBBox().width;
                console.log(wid);
                px+=(wid);
                // if(i==9) px=wid;
                // if(i>=9)return `translate(${px-wid+(i-9)*20},${0})`;
                return `translate(${px-wid+i*20},${0})`;
            })
    }

}