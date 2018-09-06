var colors = {N1: "btn-secondary", N2: "btn-success",N3: "btn-danger",N4: "btn-warning",N5: "btn-info"};
var data;

var cookies = {};
function getRuby(sentence, eles, _id){
  sentence = sentence.trim();

  $.post("https://labs.goo.ne.jp/api/morph",{app_id:"109cd0ef1cae3c680daeb11bf67f0cbcd5118d58794a4e78218c5488f2f52476", request_id:"huuthanhdtd", sentence:sentence},function(res){
    var out1 = "";
    var iskanji = /[\u4e00-\u9faf]/g;
    // var isHiragana = /[\u3040-\u309f]/g;
    // var pattern = new RegExp(data.query+"\\B","gi");
    $.each(res.word_list, function(j,word_list){
      //out1 = "";
      $.each(word_list, function(k,word){
        match = word[0].match(iskanji);
        active = (data.query.match(new RegExp(word[0],"gi")) && word[0] !== ".")?' class="active"':"";
        if(word[0] == "真" && word[2]=="シン" && word_list[k+1][0]=="っ") word[2] = "マ";
        match && (out1 += "<ruby"+active+" title=\""+ word[1] +"\"><rb>" + word[0] + "</rb><rt>"+wanakana.toHiragana(word[2])+"</rt></ruby>");
        !match && (out1+="<em"+active+" title=\""+word[1]+"\">" + word[0]+"</em>");
      });
      $(eles).html(out1);
    });
    (_id!=null) && (cookies[_id]=$("div.modal-body").html());
  },"json");

}


//ngữ pháp: https://mazii.net/api/search
//hán tự: https://mazii.net/api/mazii/<từ>/10
//câu: https://mazii.net/api/smile/<từ khóa>
//từ: https://mazii.net/api/search/<từ>/20/1
function getKanji(word){
  word = word.trim();
  $("#results").html("Loading...");
  $.get("https://mazii.net/api/mazii/"+word+"/10",function(res){
    if (res.status !== 200) { $("#results").html("Không có kết quả");return false; }
    $("#results").html("");
    if ((word.match(/[\u3040-\u309f]|[\u4e00-\u9faf]|[\u30a0-\u30ff]/gi)) && res.results.length > 1 && res.results[0].kanji !== word.substring(0,1)){
      res.results.reverse();
    }
    $.each(res.results, function(k,r){
      var bothanhphan = "";
      $.each(r.compDetail, function(k1,r1){
         bothanhphan += r1.w + r1.h + ", ";
            
      });
      var exs = "<table class=\"table\"><thead><tr><th nowrap>#. Hán tự</th><th nowrap>Hán Việt</th><th>Nghĩa</th></tr></thead><tbody>";
      $.each(r.examples, function(k2,r2){
        (r2.p!== null) && (r2.p.length>16)&&(r2.p="");
         exs += '<tr><td nowrap>'+(k2+1)+'. <ruby><rb>'+r2.w+'</rb><rt>'+r2.p+'</rt></ruby></td><td><small>'+r2.h+'</small></td><td>'+r2.m+'</td></tr>';
            
      });
      exs += "</tbody></table>";
      (r.kun == null) && (r.kun = ""),(r.on == null) && (r.on = ""),(r.level == null) && (r.level = "-");
      $("#results").append('<div class="shadow-sm p-3"><div class="row"><div class="col-md-6"><div class="row"><div class="col-md-6 col-sm-6 col-xs-6"><div id="kanjiViewer'+k+'" class="kanjiViewer"></div></div><div class="col-md-6 col-sm-6 col-xs-6"><p><span class="text-muted">Bộ: </span>'+ r.kanji + ' ('+ r.mean +')</p><p><span class="text-muted">Kun: </span>' + r.kun + '</p><p><span class="text-muted">On: </span>'+r.on+'</p><p><span class="text-muted">Số nét: </span>'+r.stroke_count+'</p><p><span class="text-muted">JLPT: </span>N'+r.level+'</p><p><span class="text-muted">Gồm: </span>'+bothanhphan+'</p></div></div><h4>Nghĩa: </h4><ul><li>'+r.detail.replace(/##/g,"</li><li>")+'</li></ul></div><div class="col-md-6"><h4>Ví dụ:</h4><div>'+exs+'</div></div></div></div>');
      var kansvg = $.extend({}, KanjiViewer);
      kansvg.initialize("kanjiViewer"+k,3,4,100,true,false,r.kanji);
    });

  });
}
function convertJptoHex(e){
  if (null == e || "" == e)
            return "";
        -1 != e.indexOf("「") && (e = (e = e.replace(new RegExp("「","g"), "")).replace(new RegExp("」","g"), "")),
        e = e.trim();
        for (var t = "", n = 0; n < e.length; n++)
            t += ("0000" + e.charCodeAt(n).toString(16)).substr(-4),
            n != e.length - 1 && (t += "_");
        return t
}
function getWord(word){
  $("#results").html("Loading...");
  
  $.get("https://mazii.net/api/search/"+word+"/20/1",function(res){
    if (res.status !== 200) { $("#results").html("Không có kết quả");return false; }
    $("#results").html("");
    var pattern,dis;// = new RegExp(word+"(\s|$|[\u3040-\u309f]|[\u30a0-\u30ff]|[\u4e00-\u9faf])","gi");
    if (word.match(/[\u3040-\u309f]|[\u30a0-\u30ff]|[\u4e00-\u9faf]/gi)){
      pattern = new RegExp(word,"gi");
      dis = "";
    }else{
      pattern = new RegExp(word+"(\\s|$)","gi");
      dis = " d-none";
    }
    $.each(res.data, function(k,r){
      var means = "<ul>";
      $.each(r.means, function(k1,r1){
         means += (r1.kind == null) ? "<li>" + r1.mean+"</li>": "<li>("+r1.kind+") " + r1.mean+"</li>";
            
      });
      means += "</ul>";
      if (r.word.match(pattern) || means.match(pattern)){
        var code = convertJptoHex(r.word).toUpperCase(); //r.word.charCodeAt(0).toString(16);
        
        $("#results").append('<div class="shadow-sm p-3 md5"><h4 class="text-success">'+r.word+'&nbsp;&nbsp;<small class="text-muted">'+r.phonetic+'</small> <span class="volume'+dis+'" data-id="'+code+'">&nbsp;</span></h4><p>'+means+'</p></div>');
      }

    });

  });
}

function getSentence(word){
  $("#results").html("Loading...");
  $.get("https://mazii.net/api/smile/"+word,function(res){
    if (res.status !== 200) { $("#results").html("Không có kết quả");return false; }
    $("#results").html("");
    var pattern;// = new RegExp(word+"\\B","gi");
    if (word.match(/[\u3040-\u309f]|[\u30a0-\u30ff]|[\u4e00-\u9faf]/gi)){
      pattern = new RegExp(word,"gi");
    }else{
      pattern = new RegExp(word+"(\\s|$)","gi");
    }

    var temp;
    $.each(res.results, function(k,r){
      if (((m1=r.content.match(pattern)) && (r.content = r.content.replace(pattern,"<i>" + m1[0] + "</i>")) )|| ((m2=r.mean.match(pattern)) && (r.mean = r.mean.replace(pattern,"<i>" + m2[0] + "</i>"))) ){
        if (!r.content.match(/[\u3040-\u309f]|[\u4e00-\u9faf]|[\u30a0-\u30ff]/gi)){
          temp = r.mean;
          r.mean = r.content;
          r.content = temp;
        }
        $("#results").append('<div class="shadow-sm p-3 md5"><h4 class="text-info sentence" id="h4'+k+'">'+r.content+'</h4><p class="meaning">'+r.mean+'</p></div>');
      }
      
    });

    $("h4.sentence").each(function(i){
      if($(this).text().match(/[\u3040-\u309f]|[\u4e00-\u9faf]|[\u30a0-\u30ff]/gi))
      getRuby($(this).text(),"#"+$(this).attr("id"),null);
    });
  });
  
}

function getGrammar(){
  $("#results").html("Loading...");
  $.ajax({
    type: "POST",
    url: "https://mazii.net/api/search",
    crossDomain: true,
    dataType: 'json',
    data: data,
    success: function (res) {
            cookies = {};
            $("#results").html("");
            if (res.status !== 200) { $("#results").html("Không có kết quả");return false; }

            var html = '<div class="row">';
            $.each(res.results, function(k,r){
              (undefined==r.category)&&(r.category="");
              html += '<div class="col-md-3 col-sm-6"><div class="card mb-3 sm-6 shadow-sm"><div class="card-body"><h5 class="card-title">'+ r.title.replace("=>",'</h5><p class="card-text">') +'</p><div class="d-flex justify-content-between align-items-center"><button type="button" class="btn btn-sm grammar '+ colors[r.level] +'" data-toggle="modal" data-id="'+r._id+'" data-target="#exampleModal" data-grammar="'+r.title+'">'+ r.level +'</button>&nbsp;<small class="text-muted">'+ r.category +'</small></div></div></div></div>';
            });
            html += '</div>';
            $("#results").html(html);
                //page
                $(".pagination").html("");
                if(res.total > 12){
                  var max = Math.ceil(res.total/12);
                  var cur = data.page;
                  var from=Math.max(1,cur-2);
                  var to=Math.min(max,cur+2);
                  if (cur>3){
                      $(".pagination").append('<li class="page-item"><a class="page-link" data-page="1">&laquo;</a></li>');
                      $(".pagination").append('<li class="page-item disabled"><a class="page-link" data-page="0">...</a></li>');
                      
                  }
                  for(i=from;i <= to;i++){
                      var disabled = (i==cur)?" disabled":"";
                      $(".pagination").append('<li class="page-item'+disabled+'"><a class="page-link" href="#" data-page="'+i+'">'+i+'</a></li>');
                  }
                  if(max>cur+2){
                      $(".pagination").append('<li class="page-item disabled"><a class="page-link" data-page="0">...</a></li>');
                      $(".pagination").append('<li class="page-item"><a class="page-link" data-page="'+max+'">&raquo;</a></li>');
                      //break;
                  }
                }
                
              },
          error: function (err) {
            // console.log(err);
          }
        });
}

$('#jlpt').submit(function(event){
  event.preventDefault();
  $(".pagination").html("");
  data = {dict: "javi", type: "grammar", level: "", category: "", query: "", page: 1, limit: 12};
    var query = $("#query").val().toLowerCase(),
    type = "g";
    keywordMatch = query.match(/N[1-5]:|N:|K:|S:|W:/gi); //query.match(/(K:)|[\u4e00-\u9faf]{1,16}/gi);
    if (keywordMatch){
      type = keywordMatch[0].toLowerCase();
      switch(type) {
        case "k:":
            if (!query.trim().match(/(K:).+/gi)) {
              $("#results").html("<div class=\"col-md-12\">Chưa nhập từ hán</div>");
              return;
            }
            
            keywordMatch = query.match(/^(K:)/gi);//query.match(/(K:)|[\u4e00-\u9faf]{1,16}/gi);
            keywordMatch && (data.query = query.replace(/K:/gi,""),getKanji(data.query));
            
            break;
        case "s:":
          if (!query.trim().match(/(S:).+/gi)) {
            $("#results").html("<div class=\"col-md-12\">Chưa nhập từ để tra câu</div>");
          }else{
            data.query = query.replace(/S:/gi,"");
            getSentence(data.query);
          }
            break;
        case "w:":
          if (!query.trim().match(/(W:).+/gi)) {
            $("#results").html("<div class=\"col-md-12\">Chưa nhập từ vựng</div>");
          }else{
            data.query = query.replace(/W:/gi,"");
            getWord(data.query);
          }
            break;
        default:
          data.query = query
          var typePattern = /(N+[1-5])*:|(N:)/gi,
          keywordMatch = typePattern.exec(query);
          keywordMatch && (keywordMatch[1]&&(data.level=keywordMatch[1].toUpperCase()),data.query=query.replace(keywordMatch[0], "").trim());
          getGrammar();
      }
    }else{
      data.query = query
          var typePattern = /(N+[1-5])*:|(N:)/gi,
          keywordMatch = typePattern.exec(query);
          keywordMatch && (keywordMatch[1]&&(data.level=keywordMatch[1].toUpperCase()),data.query=query.replace(keywordMatch[0], "").trim());
          getGrammar();
    }
    if (isHis == false){
      var url = document.location.href;
      (url.indexOf("#")>=0) && (url = url.substring(0,url.indexOf("#")));
      url += "#"+query;
      document.location.href = url;
      (history.pushState) && window.history.pushState({path:url},'',url);
      isHis = false;
    }
    
  });

$('ul.pagination').on("click", "a", function(e){
  e.preventDefault();
  data.page = $(this).data("page");
  getGrammar();
});


$('#results').on("click", "button.grammar", function(e){
    // console.log($(this).data("id"));
    var ex="<p>";
    var us ="";
    var _id = $(this).data("id");
    var url = document.location.href;
      (url.indexOf("#")>=0) && (url = url.substring(0,url.indexOf("#")));
      document.location.href = url + "#";// + _id;
    $("#exampleModalLabel").html('<button class="btn btn-sm '+ colors[$(this).text()] +'">'+ $(this).text() +'</button>&nbsp;&nbsp;' + $(this).data("grammar"));
  if (cookies.hasOwnProperty(_id)){
      //$("#exampleModalLabel").html('<button class="btn btn-sm '+ colors[$(this).text()] +'">'+ $(this).text() +'</button>&nbsp;&nbsp;' + $(this).data("grammar"));
      $("div.modal-body").html(cookies[_id]);
      return;
    }
    $.getJSON("https://mazii.net/api/grammar/"+ _id, function(ret){
      //$("#exampleModalLabel").html('<button class="btn btn-sm '+ colors[ret.grammar.level] +'">'+ ret.grammar.level +'</button>&nbsp;&nbsp;' + ret.grammar.title);
      $.each(ret.grammar.usages, function(k,r){
        ex="";
        $.each(r.examples, function(k1,r1){
          ex += '<p class="example"><span class="text-primary" id="ex'+k+k1+'">' + r1.content.trim().replace(/(&lt;)(.*?)(&gt;)/ig,"") + "</span><br>" + r1.mean.trim() + "</p>";
        });
        (r.synopsis!=="") && (r.synopsis = r.synopsis.replace(/。/g,"。<br>")+"<br>");
        us += '<div class="alert alert-dark" role="alert">' + r.synopsis + r.explain.trim().replace(/( ☞)/g,"<br>☞") + "</div>" + ex;
      });

      $("div.modal-body").html(us);

      //get ruby
      // var sentences = [];
      // var eleIDs = [];
      $("p.example span").each(function(r){
        // sentences.push($(this).text());
        // eleIDs.push("#"+$(this).attr("id"));
        getRuby($(this).text(),$(this),_id);
      });
      // getRuby(sentences.join(""),eleIDs,_id);
      // var obj = {};
      // obj[_id] = $("div.modal-body").html();
      // cookies.push(obj);
      cookies[_id] = $("div.modal-body").html();
      //console.log(ret);
    });
  });

$("div.actions button,div#results ul li button").click(function(r){
  // var pattern = new RegExp(,"g");
  var repl = $(this).data("key");
  var query = $("#query").val();
  var x = query.match(/N[1-5]:|N:|K:|S:|W:/gi);
  if (x){
    $("#query").val(query.replace(x[0], repl));
  }else{
    $("#query").val(repl + query);
  }
  $("#query").focus();
});

var audio = new Audio();
$('#results').on("click", "span.volume", function(e){
  audio.src = "https://data.mazii.net/audios/" + $(this).data("id") + ".mp3";
  audio.autoplay = true;
});

//get param from url
var urlMatch = document.location.href.match(/(#)(.+)/g);
urlMatch && $("#query").val(decodeURIComponent(urlMatch[0].replace("#",""))) && ($('#jlpt').submit());

//hide modal
var isHis = false;
if (window.history && window.history.pushState) {

    $(window).on('popstate', function() {
      $('#exampleModal').modal('hide');
      // isHis = true;
      // var urlMatch = document.location.href.match(/(#)(.+)/g);
      // urlMatch && $("#query").val(decodeURIComponent(urlMatch[0].replace("#",""))) && ($('#jlpt').submit());
    });
  }

// var logosvg = $.extend({}, KanjiViewer);
// logosvg.initialize("logoViewer",3,4,100,true,false,"π");