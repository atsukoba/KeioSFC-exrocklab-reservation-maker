/*
Written by Atsuya Kobayahsi 2018-10-16
http://rock.sfc.keio.ac.jp
*/


function myFunction(e){
  //initialize
  var cal = CalendarApp.getCalendarById('exrocklab@gmail.com');
  var itemResponses = e.response.getItemResponses();
  var bandName;
  var playerName;
  var reserverName;
  var practiceDate;
  var periodTime = {
        "1限" : ["9:24:00" , "10:56:00"],
        "2限" : ["11:09:00", "12:41:00"],
        "3限" : ["12:59:00", "14:31:00"],
        "4限" : ["14:44:00", "16:16:00"],
        "5限" : ["16:29:00", "18:01:00"],
        "6限" : ["18:09:00", "19:41:00"],
        "7限" : ["19:44:00", "21:16:00"],
        "0限" : ["7:59:00" , "9:16:00"]
      };
  var isReserved = false;
  var description = "";

  //check response from Google Form (部室予約フォーム)
  for (var i = 0; i < itemResponses.length; i++) {

    var itemResponse = itemResponses[i];
    var question = itemResponse.getItem().getTitle();
    var answer = itemResponse.getResponse();

    if (question == "バンド・個人名") { // Answer 1
      playerName = answer;
    }
    else if (question == "練習内容") { // Answer 2
      if (answer == "バンド練習") {
        bandName = playerName + " " + "バンド練";
      }
      else {
        bandName = playerName + " " + "個人練";
      }
    }
    else if (question == "練習日") { // Answer 3
      practiceDate = answer.replace(/-/g,'/');
    }
    else if (question == "時限") { // Answer 4
      var period = answer;
      var startTime;
      var endTime;
      timelist = periodTime[period];
      startTime = practiceDate + " " + timelist[0];
      endTime = practiceDate + " " + timelist[1];
      var events = cal.getEvents(new Date(startTime), new Date(endTime));
      // カレンダーを時刻で取得し, 無だった(イベントごと削除されていた)ら新しく作成する。
      // 取得する幅の時刻は1分多いので，開始/終了時刻を1分ずつ引く
      if (events == []) {
        cal.createEvent(period + "：" + bandName,
                        new Date(new Date(startTime).getTime() + 60000),
                        new Date(new Date(endTime).getTime() - 60000));
      }
      // 全/半 時限名，全/半スペース，全/半コロンなどを削除し予約状態を判定
      else if (events[0].getTitle().replace(period,'').replace(/ /g,'')
                        .replace(/ /g,'').replace(/:/g,'').replace(/：/g,'')
                        .replace(period.replace(/[A-Za-z0-9]/g,
                          function(s) {
                            return String.fromCharCode(s.charCodeAt(0) + 65248);
                          }
                        ), '') == '') {
        events[0].setTitle(period + "：" + bandName);
      }
      else {
        isReserved = true;
      }
    }
    else if (question == "予約者氏名") { // Answer 5
      if (isReserved == false) {
        reserverName = answer;
        description = "予約者：" + reserverName;
        var events = cal.getEvents(new Date(startTime), new Date(endTime));
        events[0].setDescription(description);
      }
    }
    else if (question == "説明・概要") { // Answer 6
      if (isReserved == false) {
        memo = answer;
        description += "\nメモ：" + memo;
        var events = cal.getEvents(new Date(startTime), new Date(endTime));
        events[0].setDescription(description);
      }
    }
    else if (question == 'カレンダーカラー') { // Answer 7
      if (isReserved == false) {
        idx = answer.split(".")[0];
        var events = cal.getEvents(new Date(startTime), new Date(endTime));
        events[0].setColor(idx);
        description += "\nバンドカラー：" + idx;
        events[0].setDescription(description);
      }
    }
  }
}
