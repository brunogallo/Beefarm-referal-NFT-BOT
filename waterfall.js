'use strict';

var TempMail = require('node-temp-mail');
var request = require('request');
const crypto = require('crypto');
const puppeteer = require('puppeteer');

let inviteCode = "";
let inviteID = "";

function makeid(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

var address = new TempMail(makeid(8));

let addressFilter = address.getAddress();
let url = "https://www.farm888.com/api/sendEmailCode?email="+addressFilter.address+"&agent_id=14&operater_id=3&language_id=en_us";
let openweb = "https://www.farm888.com/api/login_web";
let dataTime = parseInt((new Date).getTime() / 1e3);
let signKey = "8p83fwh50kpcuj25";
let md5Secret
let connectGameBody = {"s":"9386c0319622bd3bc2773153d9b757ee","i":"obgallo4@gmail.com","time":"1672890529","t":"email","agent_id":"14","operater_id":"7","invite_code":"4kosoMoz","language_id":"en_us"};
let regURL, tokenWeb, hash;
let received = false;
let newResp = "";
let teste = JSON.stringify({"operater_id":"3","agent_id":"14","language_id":"en_us","invite":""+inviteCode+"","inviter_id":""+inviteID+""});
let buff = new Buffer(teste);
let base64data = buff.toString('base64');
let subject, message, bodyMail

function stopFunction() {
    clearInterval(delayMail);
}

const getData = async () => {
    const res = await fetch(url)
    const data = await res.json()

    if(data.code == 200){
        console.log("Código gerado com: "+data.msg);

        getInbox();
    }else{
        console.error(data);
    }
}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

let connectGame = function(){
    getLogin();

    sleep(2000);

    md5Secret = (String(addressFilter.address) + String(dataTime) + String(signKey));
    hash = crypto.createHash('md5').update(md5Secret).digest('hex');

    connectGameBody = {"s":""+hash+"","i":""+addressFilter.address+"","time":""+dataTime+"","t":"email","agent_id":"14 ","operater_id":"7","invite_code":""+inviteCode+"","language_id":"en_us"};
    
    request.post(
        openweb,
        { json: connectGameBody },
        function (error, response, body) {
            if (!error && response.statusCode == 200) {
                console.log("Conta logada com sucesso! "+body.message);
            }
        }
    );
}

const getLogin = async () => {
    const res = await fetch(regURL)
    const data = await res.json()

    if(data.code == 200){
        console.log("Segundo Login Feito com Sucesso!");
        tokenWeb = encodeURIComponent(base64data);

       (async () => {
        const browser = await puppeteer.launch({headless: false});
        const page = await browser.newPage();
        await page.goto("https://gameresfarm.mrmb.xyz/web/LY1/?params="+tokenWeb+""+newResp);
        await sleep(35000);
        await browser.close();
      })();

    }else{
        console.error(data);
    }
}

const getRegister = async () => {
    const res = await fetch(regURL)
    const data = await res.json()

    if(data.code == 200){
        console.log("Registro de conta concluído com sucesso!");
        newResp = data.data.sss;
        connectGame();
    }else{
        console.error(data);
    }
}

let getInbox = function(){
    address.fetchEmails(function(err,body){
        if(body){
            bodyMail = body;
            console.log("Esperando email chegar na caixa: "+ addressFilter.address);
            if(bodyMail.messages[0] != undefined){
                message = bodyMail.messages[0].message;
                subject = bodyMail.messages[0].subject;

                if(subject == 'Bind Email'){
                    let str = message;
                    let value = str.match(/code: (\d+)/i)[1];

                    console.log("Email encontrado, código: "+value);

                    regURL = "https://www.farm888.com/api/register?code="+value+"&agent_id=14&mobile=&operater_id=3&time=&invite_code="+inviteCode+"&i="+addressFilter.address+"&s=&t=email&language_id=en_us&url=https%3A%2F%2Fwww.farm888.com%2F%23%2F";

                    getRegister();

                    received = 1;
                }
            }else{
                getInbox(); 
            }
        }else{
            console.error("ops!");
        }
    });
}

getData();