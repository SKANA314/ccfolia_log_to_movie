// 
// データ加工、盤面の更新
// 
// 
// グローバル変数
// 
let logData=[];//ログデータ　{tab:"",name:"",word:""}
let character=[];//キャラクターデータ　{oldName:"",newName:"",style:"",show:1}
let softwaer=document.querySelector("#softwaer").value;//出力するソフトウェアの形式
let file_name="";//読み込んだファイルの名前
// let hanlers=[]//イベントハンドラリスト
// 
// 関数
// 
// 配列をテキストに加工してテキストエリアに表示する関数
function processingLog(type) {
    let previewText="";//プレビューに表示する用のテキストデータ
    mainloop:for(i=0;i<logData.length;i++){
        let processedWordData=JSON.parse(JSON.stringify(logData[i]));//加工される台詞データ(深いコピーを使用)
        // キャラクターごとの調整
        for(j=0;j<character.length;j++){
            if(logData[i]["name"]==character[j]["oldName"]){
                // 表示・非表示の確認(ここが通れなければ以下の行程はパス)
                if(character[j]["show"]==0){
                    continue mainloop;//メインの頭まで戻る
                }
                else{
                    // 名前の変更はあるか(あれば名前を置き換える)
                    if(character[j]["newName"]!=""){
                        processedWordData["name"]=character[j]["newName"];
                    }
                    else{
                        processedWordData["name"]=character[j]["oldName"];
                    }
                    // スタイルの変更はあるか(あれば加える)
                    if(character[j]["style"]!=""){
                        processedWordData["name"]=`${processedWordData["name"]}(${character[j]["style"]})`;
                    }
                    else{
                        processedWordData["name"]=`${processedWordData["name"]}`;
                    }
                }
            }
        }
        // ソフトウェアごとの調整
        switch(type){
            case "YMM4_txt":
                previewText=previewText+`${processedWordData["name"].replace(/\「/g,"[").replace(/\」/g,"]").replace(/\｢/g,"[").replace(/\｣/g,"]")}「${processedWordData["word"].replace(/\「/g,"\\「").replace(/\」/g,"\\」").replace(/\｢/g,"\\「").replace(/\｣/g,"\\」")}」\n`;
                break;
            case "YMM4_csv":
                previewText=previewText+`${processedWordData["name"].replace(/\"/g,"\'")},"${processedWordData["word"]}"\n`;
                break;
            case "VOICEVOX":
                previewText=previewText+`${processedWordData["name"].replace(/\,/g,"、")},${processedWordData["word"].replace(/\,/g,"、")}\n`;
                break;
            case "COEIROINC":
                previewText=previewText+`${processedWordData["name"].replace(/\,/g,"、")},${processedWordData["word"].replace(/\,/g,"、")}\n`;
                break;
            case "AIVOICE":
                previewText=previewText+`${processedWordData["name"]}＞${processedWordData["word"]}\n`;
                break;
            default:
                previewText=previewText+`${processedWordData["name"].replace(/\「/g,"[").replace(/\」/g,"]").replace(/\｢/g,"[").replace(/\｣/g,"]")}｢${processedWordData["word"].replace(/\「/g,"\\「").replace(/\」/g,"\\」").replace(/\｢/g,"\\「").replace(/\｣/g,"\\」")}｣\n`;
                break;
        }
    }
    // プレビューにテキストを反映
    let preview=document.querySelector("#preview");
    preview.innerHTML=previewText;
};

// キャラクター名をする変更
function newName(characterNo){
    character[characterNo]["newName"]=document.querySelector(`.new_name.No${characterNo}`).value.replace(/\r?\n/g,"");
    processingLog(softwaer);
}
// キャラクターのスタイルが変更されたとき
function newstyle(characterNo){
    character[characterNo]["style"]=document.querySelector(`.style.No${characterNo}`).value.replace(/\r?\n/g,"");
    processingLog(softwaer);
}
// キャラクターの表示、非表示が変更されたとき
function show(characterNo){
    if(character[characterNo]["show"]==0){
        character[characterNo]["show"]=1;
    }else{
        character[characterNo]["show"]=0;
    }
    processingLog(softwaer);
}

// 
// イベント
// 
//ファイルが読み込まれたとき
document.querySelector("#input").addEventListener("change",function(){
    // ファイル情報の取得
    let file=document.querySelector("#input").files[0];
    // ファイルリーダー
    let reader=new FileReader();
    // ファイルの内容を読み込む
    if(file){
        reader.readAsText(file);
    }
    // ファイルが読み込まれたとき、その内容を表示する
    reader.addEventListener("load",function(){
        // グローバル変数の初期化
        logData=[];
        character=[];
        file_name="";
        // ファイル名の取得
        file_name=file["name"].split(".")[0];
        // ファイル内容のHTML有効化
        logDataHTML=reader.result;

        // 読み込まれたデータを配列に変換する
        //データにquerySelectorを対応させる
        let parser = new DOMParser();
        let doc = parser.parseFromString(logDataHTML, 'text/html');        
        let elem = doc.querySelectorAll('span');
        let pause={tab:"",name:"",word:""};//1チャット分の情報を入れる連想配列
        for(i=0;i<elem.length;i++){
            switch(i%3){
                case 0:
                    pause={tab:"",name:"",word:""};
                    pause["tab"]=elem[i].innerText.replace(/\r?\n/g,"").replace(/\s+/g,"");
                    break;
                case 1:
                    pause["name"]=elem[i].innerText.replace(/\r?\n/g,"").replace(/\s+/g,"");
                    break;
                case 2:
                    pause["word"]=elem[i].innerText.replace(/\r?\n/g,"").replace(/\s+/g,"");
                    logData.push(pause);
                    break;
            }
        }
        // キャラクター名を取得
        for(i=0;i<logData.length;i++){
            character.push(logData[i]["name"]);
            character=Array.from(new Set(character));
            character=character.sort();
        }
        // キャラクターごとの情報を取得
        let characterData={oldName:"",newName:"",style:"",show:1};
        for(i=0;i<character.length;i++){
            characterData={oldName:character[i],newName:"",style:"",show:1};
            character[i]=characterData;
        }

        //キャラクター名に応じてキャラクター名操作画面を表示
        let characterConsole=
        `<h3>キャラクター名</h3>
        <table >
        <tr>
            <th>変更前</th>
            <th>変更後</th>
            <th>スタイル</th>
            <th>表示</th>
        </tr>`;
        for(i=0;i<character.length;i++){
            characterConsole=
            characterConsole+
            `<tr class="character ${i}">
                <td class="old_neme">${character[i]["oldName"]}</td>
                <!--
                <td><input type="text" name="new_name" class="new_name No${i}" onchange="newName(${i})"></td>
                <td><input type="text" name="style" class="style No${i}" onchange="newstyle(${i})"></td>
                -->
                <td><textarea name="new_name" class="new_name No${i}" onchange="newName(${i})" ></textarea></td>
                <td><textarea  name="style" class="style No${i}" onchange="newstyle(${i})" ></textarea></td>
                <td class="show"><input type="checkbox" name="show" checked onchange="show(${i})"></td>
            </tr>`
        }
        characterConsole=characterConsole+"</table>"
        let characterTable=document.querySelector("#character");
        characterTable.innerHTML=characterConsole;
        processingLog(softwaer);
    });

});

// 対応ソフトが変更されたとき
document.querySelector("#softwaer").addEventListener("change",function(){
    //出力するソフトウェアの形式を再取得
    softwaer=document.querySelector("#softwaer").value;
    // ファイルが既にセットされていればテキストにも設定を反映
    if (character!=[]) {
        processingLog(softwaer);
    }
});

// 出力ボタンが押されたときプレビュー内のデータを出力する
document.querySelector("#submit").addEventListener("click",function(){
    // データを出力する関数
    function makeData(outputText){
        let blob="";
        // 出力形式に合わせてファイルを作成
        if(softwaer=="YMM4_csv"){
            let bom = new Uint8Array([0xef, 0xbb, 0xbf]);
            blob = new Blob([bom,outputText], { type: "text/csv" });
        }
        else{
            blob = new Blob([outputText], {type: 'text/plain'});
        }
        let url = URL.createObjectURL(blob);
        let a = document.createElement("a");
        document.body.appendChild(a);
        if(softwaer.includes("YMM4")){
            a.download = `${file_name}（YMM4用)`;
        }
        else{
            a.download = `${file_name}（${softwaer}用)`;
        }
        a.href = url;
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
    }

    // テキストエリアのデータを取得
    let outputText=document.querySelector("#preview").value;
    // 確認処理
    // テキストエリアが空なら処理を行わない。
    if(outputText!=""){
        // COEIROINKならダイアログを表示
        if(softwaer=="COEIROINC"){
            if(window.confirm("スタイルを設定しましたか?\nCOEIROINKではスタイル設定が必須になります。")){
                makeData(outputText);
            }
        }
        else{
            makeData(outputText);
        }

    }
});
