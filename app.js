'use strict';

var TempMail = require('node-temp-mail');
var request = require('request');
const crypto = require('crypto');
const puppeteer = require('puppeteer');


// Invite code do cliente
let inviteCode = "4kosoMoz";
let inviteID = "99893";

// Gerando ID aleatório para email temporário
function makeid(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

// Criando email temporário
var address = new TempMail(makeid(8));

// Filtrando endereço de email
let addressFilter = address.getAddress();
let url = "https://www.littlebeefarm.net/api/sendEmailCode?email="+addressFilter.address+"&agent_id=8&operater_id=7&language_id=en_us";
let openweb = "https://gameapifarm.mrmb.xyz/api/v1/agent/login_web";
//let inviteUID = https://www.littlebeefarm.net/api/getIdByInviteCode?invite_code=4kosoMoz //PEGAR INVITE ID inviteUID.data.invite_uid;
let dataTime = parseInt((new Date).getTime() / 1e3);
let signKey = "8p83fwh50kpcuj25";
let md5Secret
let connectGameBody = {"s":"9386c0319622bd3bc2773153d9b757ee","i":"obgallo4@gmail.com","time":"1672890529","t":"email","agent_id":"8","operater_id":"7","invite_code":"4kosoMoz","language_id":"en_us"};
let regURL, tokenWeb, hash;
let received = false;

// Cria token de login
let teste = JSON.stringify({"operater_id":"7","agent_id":"8","language_id":"en_us","invite":""+inviteCode+"","inviter_id":""+inviteID+""});
let buff = new Buffer(teste);
let base64data = buff.toString('base64');

// Conteudo do email
let subject, message, bodyMail

function stopFunction() {
    clearInterval(delayMail);
}

// Enviando request para gerar o cod de registro
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

// Gerando hash md5
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

    connectGameBody = {"s":""+hash+"","i":""+addressFilter.address+"","time":""+dataTime+"","t":"email","agent_id":"3","operater_id":"7","invite_code":""+inviteCode+"","language_id":"en_us"};

    request.post(
        openweb,
        { json: connectGameBody },
        function (error, response, body) {
            if (!error && response.statusCode == 200) {
                console.log("Conta logada com sucesso! "+body.message);
                //console.log(body);
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

        //console.log("http://192.168.15.24:3000/live/?params="+tokenWeb+"&s="+hash+"&i="+addressFilter.address+"&time="+dataTime+"&t=email");

       // await open("https://gameresfarm.mrmb.xyz/?params="+tokenWeb+"&s="+hash+"&i="+addressFilter.address+"&time="+dataTime+"&t="+email);

       (async () => {
        const browser = await puppeteer.launch({headless: false});
        const page = await browser.newPage();
        await page.goto("http://192.168.15.24:3000/live/?params="+tokenWeb+"&s="+hash+"&i="+addressFilter.address+"&time="+dataTime+"&t=email");
        await sleep(15000);
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

        connectGame();

    }else{
        console.error(data);
    }
}

// Checando caixa de entrada
let getInbox = function(){
    address.fetchEmails(function(err,body){
        if(body){
            bodyMail = body;
            console.log("Esperando email chegar na caixa: "+ addressFilter.address);
            //console.log(bodyMail.messages[0]);
            if(bodyMail.messages[0] != undefined){
                message = bodyMail.messages[0].message;
                subject = bodyMail.messages[0].subject;

                if(subject == 'Bind Email'){
                    let str = message;
                    let value = str.match(/code: (\d+)/i)[1];

                    console.log("Email encontrado, código: "+value);

                    regURL = "https://www.littlebeefarm.net/api/register?code="+value+"&agent_id=8&mobile=&operater_id=7&time=&invite_code="+inviteCode+"&i="+addressFilter.address+"&s=&t=email&language_id=en_us&url=https%3A%2F%2Fwww.littlebeefarm.net%2F%23%2Fhome%3Foperater_id%3D7%26invite%3"+inviteCode+"%26agent_id%3D8%26language_id%3Den_us";

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



