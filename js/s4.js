import {attributeF} from './attributeF.js';
import {set_op} from "./set_op.js";
var new_selection=[];
var clicked=[];







function s4(s3,selection,s){
    console.log(s3,selection,s);

    let map={"More than 1000":0,"100-1000":0,"50-100":0,"Less than 50":0};
    let fignum2data={"More than 1000":[],"100-1000":[],"50-100":[],"Less than 50":[]};
    for(let paper_i in selection){
        let ii=s.indexOf(selection[paper_i]);
        let a_id=figure2data[ii][0].paperid;
        var a;
        for(var iii in NC2P2){
            console.log(iii,NC2P2[iii])
            for(var jj in NC2P2[iii]){
                console.log(NC2P2[iii][jj])
                if(Number(NC2P2[iii][jj]) == a_id )
                    a=iii;
            }
        }
        console.log(a);
        fignum2data[a].push(ii); map[a]++;
        // if(a>20) {fignum2data["More than 20"].push(ii); map["More than 20"]++;}
        // else if(a>10) {fignum2data["10-20"].push(ii); map["10-20"]++;}
        // else if(a>5) {fignum2data["5-10"].push(ii); map["5-10"]++;}
        // else {fignum2data["Less than 5"].push(ii); map["Less than 5"]++;}


        // if(map[numi]==undefined) map[numi]=1;
        // else map[numi]++;
        //
        // fignum2data[numi] == undefined ? fignum2data[numi] = [ii] : fignum2data[numi].push(ii);
    }
    let data=[];
    for(var i in map){
        let tmp= {};
        tmp['name'] = i;
        tmp['num'] = map[i];
        data.push(tmp);
    }
    // data.sort((a,b)=>b.num-a.num);
    $('.keyword-body').children('*').remove();
    var div=d3.select('.keyword-body').selectAll('div').data(data).enter()
        .append('div').attr("class",function(d){if(clicked.indexOf(d.name)!=-1) { $(this).css('background', '#98dafc'); d.click=1; }return "text-box";}).style("width","45%")
        .on('click',function(d){
            if(d.click!=1){
                clicked.push(d.name);
                $(this).css('background', '#98dafc');

                for(var j in fignum2data[d.name]){
                    let k=1;
                    for(var i in new_selection){
                        if(new_selection[i]===fignum2data[d.name][j])k=0;
                    }
                    if(k)new_selection.push(fignum2data[d.name][j]);
                }
                d.click=1;
            }else {
                var index = clicked.indexOf(d.name);
                if (index > -1) {
                    clicked.splice(index, 1);
                }
                d.click=0;
                $(this).css('background', '');
                var ans1=[];
                for(var i in new_selection) {
                    let k=1;
                    for(var j in NC2P2[d.name]){
                        if(new_selection[i]==NC2P2[d.name][j])k=0;
                    }
                    if(k)ans1.push(new_selection[i]);
                }
                new_selection=ans1;
            }
            s3[3] = new_selection.map(function(item){
                return s[item];
            });

            console.log("XXXX",s3);
            var ans = set_op(s3,s);
            if(ans.length==s.length)  attributeF([[],[],[],[]],s,s,-1);
            attributeF(s3,ans,s,2);
        });
    div.append('span').text(d=>d.name).attr('class', 'text-style');
    div.append('span').text(d=>"("+d.num+")").attr('class', 'num-style');
}
export {s4};