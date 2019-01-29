const Discord = require('discord.js');
const client = new Discord.Client();

const sharp = require('sharp');

const TextToSVG = require('text-to-svg');
const textToSVG = TextToSVG.loadSync('Anonymous_Pro.ttf');


//const s2i = require('svg2img');
const { convert } = require('convert-svg-to-png');

var wrap = require('word-wrap');

var sizeOf = require('buffer-image-size');

var Promise = require("bluebird");


var port = process.env.PORT || 3000

const attributes = {fill: 'black'};
const options = {x: 0, y: 0, fontSize: 48, anchor: 'top', attributes: attributes};

  var splitChars = [ ' ', '-', '\t' ];
  var letterWidthPixels = 28;
  var letterHeightPx = 65;


client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
  botChannel=null;
  if(msg.guild !== null){
    botChannel = msg.guild.channels.get('442082649700302848');
  }

  if (msg.content.substring(0,5) == '.meme' && msg.content.length>6) {
    msg.channel.startTyping();
	msg.channel.fetchMessages({ limit: 20 })
		.then(messages =>
		{

			mesgs = messages.filter(m => (m.attachments.size > 0)).filter(m => m.author.id === msg.author.id);

			mesg = mesgs.first();

			url = mesg.attachments.first().url;


			text=msg.content.substring(6);






			bigw=700;



			//SZÖVEG MÉRETEI
			txtpadding=20;//Math.max(100-text.length*5, 20);
			txtwmax=bigw-2*txtpadding;
			//txth=100;
			//fontsize=50;
			//console.log(txtpadding);


			charsPerLines = Math.floor(txtwmax/letterWidthPixels);

			//lines = wrap(text, {width: charsPerLines, indent:'', newline: "\n", trim: true});
			lines = WordWrap(text, charsPerLines);
			linesArr = lines.split(/\r\n|\r|\n/);
			linesCount = linesArr.length;

			txth=letterHeightPx*linesCount;

			svgs = [];
			for(i=0;i<linesCount;i++){
				svgs.push(textToSVG.getSVG(linesArr[i], options));
			}

			//BELSŐ KÉP MÉRETEI
			imgpadding=20;
			destw=bigw-2*imgpadding;
			desth=480;


			//KÉP HELYE FELÜLRŐL
			imgy=txth+2*txtpadding+imgpadding;

			//NAGY KÉP MÉRETEI
			bigh=txth+2*txtpadding+desth+2*imgpadding;
			console.log("Big:"+bigw+","+bigh);
			console.log("Textlines("+(txtwmax/letterWidthPixels)+"):"+charsPerLines+"*"+linesCount);
			console.log("Txtpadding:"+txtpadding);
			console.log("Imgpadding:"+imgpadding);
			console.log("DestSize:"+destw+","+desth);


			var request = require('request').defaults({ encoding: null });
			request.get(url, function (err, res, body) {
				if(err){
					console.error("Download error:" + err);
          msg.channel.stopTyping();
				}
				sharp(body)
					.resize({width:destw, height:desth, fit: 'inside'})
					.toBuffer((err, data, info) => {

					console.log("Pic:"+info.width+","+info.height);
					console.log("Pos:"+(bigw/2-info.width/2)+","+imgy);
					sharp({
						create: {
							width: bigw,
							height: bigh,
							channels: 4,
							background: { r: 255, g: 255, b: 255, alpha: 1 }
						}
					})
					.overlayWith(data,{
							top:imgy+((bigh-imgy)/2-info.height/2),
							left:(bigw/2-info.width/2)
						})
					.png()
					.toBuffer((err2, data2, info2) => {
						if(err2){
							console.error("Image overlay error: " + err2);
              msg.channel.stopTyping();
							return;
						}
						currentLine=0;
						Promise.reduce(svgs, async function(total, svg) {
							s2i = await convert(svg, {
								puppeteer: {
									args: ['--no-sandbox', '--disable-setuid-sandbox']
								}
							});

							dimensions = sizeOf(s2i);
							console.log(dimensions.width, dimensions.height);

							return sharp(total)
							.overlayWith(s2i,{
								top:txtpadding+currentLine*letterHeightPx,
								left:txtpadding
							})
							.png()
							.toBuffer()
							.then((data3) => { currentLine++; return data3; })
							.catch(err3 => { console.error("Text overlay error: " + err3); msg.channel.stopTyping();});

						}, data2).then(function(total) {
							msg.channel.send(msg.author,{files:[total]});
              msg.channel.stopTyping();
								msg.delete().catch(err => {console.error(err.message);msg.channel.stopTyping();});
						});

						/*svgs.reduce(async (previousPromise, nextID) => {
							await previousPromise;



						}, Promise.resolve());*/



					})


				})
			});




		}

	)
	.catch(err => {console.error(err);msg.channel.stopTyping();});
  }else if(msg.content.substring(0,5) == '.help'){

    if((botChannel === null) || msg.channel != botChannel){
      msg.reply('kérlek a '+botChannel+' szobában használd ezt a parancsot!');
    }else{
      msg.channel.send(new Discord.RichEmbed({title:"A Helyi Törpe súgója",description:"```"+
      ".help            súgó\r\n"+
      ".meme <szöveg>   legutóbbi képedhez felirat           \r\n"+
      ".iam <szerep>    szerep-címke hozzáadás\r\n"+
      "xd               xd```"
      }));
    }

  }else if(msg.content == 'xd' || msg.content == 'Xd' || msg.content == 'xD' || msg.content == 'XD' ||
	  msg.content == 'xdd' || msg.content == 'Xdd' || msg.content == 'xDD' || msg.content == 'XDD'){
  	  msg.channel.send({
  		  files: [{
  			attachment: 'xd.gif',
  			name: 'xd.gif'
  		  }]
  		})
  	  .catch(console.error);
  }else if(msg.content.substring(0,4) == ".iam"){
    if((botChannel === null) || msg.channel != botChannel){
      msg.reply('kérlek a '+botChannel+' szobában használd ezt a parancsot!');
    }else{
      role = msg.content.split(' ')[1];
      if(role == "tesztelo"){
        msg.member.addRole('539878542586937377');
        msg.reply('mostantól tesztelő!');
      }else if(role == "producer"){
        msg.member.addRole('460488813525991438');
        msg.reply('mostantól producer!');
      }else if(role == "hang"){
        msg.member.addRole('460185178443087874');
        msg.reply('mostantól hangmérnök!');
      }else if(role == "kod"){
        msg.member.addRole('460185211230224395');
        msg.reply('mostantól programozó!');
      }else if(role == "grafikus"){
        msg.member.addRole('460185260848840705');
        msg.reply('mostantól grafikus!');
      }else if(role == "palya"){
        msg.member.addRole('460185260244729877');
        msg.reply('mostantól pályatervező!');
      }else if(role == "jammer"){
        msg.member.addRole('539878964248838181');
        msg.reply('mostantól jammer!');
      }else if(role == "youtuber"){
        msg.member.addRole('539878321551573002');
        msg.reply('mostantól YouTuber!');
      }
    }
  }else if(msg.content.substring(0,4) == ".msg" && msg.author.id=="217267395696263169"){
    msg.channel.send(msg.content.substring(5));
    msg.delete();
  }

  /*else if(msg.content.substring(0,5) == ".test"){
    msg.member.guild.channels.get("442082649700302848").send(
      "Üdvözlünk " + msg.member.user + " a " + msg.member.guild.name + " szerveren, válassz szerepet:\n"+
      "**.iam tesztelo** - Tesztelő\n"+
      "**.iam producer** - Kiadó/Ötletgazda/Projekt manager/Marketinges\n"+
      "**.iam hang** - Hangmérnök/Szinkronszínész/Zeneszerző\n"+
      "**.iam kod** - Programozó\n"+
      "**.iam grafikus** - 2D/3D Grafikus\n"+
      "**.iam palya** - Pályatervező\n"+
      "**.iam jammer** - Értesítést kapsz az itch.io-s game jam-ekről (hamarosan!)\n"+
      "**.iam youtuber** - YouTuber/Streamer");

  }*/

});

client.on("guildMemberAdd", (member) => {
  console.log(`New User "${member.user.username}" has joined "${member.guild.name}"` );
  member.guild.channels.get("442082649700302848").send(
    "Üdvözlünk " + member.user + " a " + member.guild.name + " szerveren, választhatsz szerepet:\n"+
    "**.iam tesztelo** - Tesztelő\n"+
    "**.iam producer** - Kiadó/Ötletgazda/Projekt manager/Marketinges\n"+
    "**.iam hang** - Hangmérnök/Szinkronszínész/Zeneszerző\n"+
    "**.iam kod** - Programozó\n"+
    "**.iam grafikus** - 2D/3D Grafikus\n"+
    "**.iam palya** - Pályatervező\n"+
    "**.iam jammer** - Értesítést kapsz az itch.io-s game jam-ekről (hamarosan!)\n"+
    "**.iam youtuber** - YouTuber/Streamer");
});

function WordWrap(str, width){
    splitChars = [ ' ', '-', '\t' ];
newLine='\n';
    words = str.split(' ');
		//words= Explode(str, splitChars);

    curLineLength = 0;
    strBuilder='';
    //StringBuilder strBuilder = new StringBuilder();
    for(i = 0; i < words.length; i += 1)
    {
    	debugger;
        word = words[i]+" ";
        // If adding the new word to the current line would be too long,
        // then put it on a new line (and split it up if it's too long).
        if (curLineLength + word.length > width)
        {
            // Only move down to a new line if we have text on the current line.
            // Avoids situation where wrapped whitespace causes emptylines in text.
            if (curLineLength > 0)
            {

                //strBuilder.Append(Environment.NewLine);
                strBuilder += newLine;
                curLineLength = 0;
            }

            // If the current word is too long to fit on a line even on it's own then
            // split the word up.
            while (word.length > width)
            {

                //strBuilder.Append(word.Substring(0, width - 1) + "-");
                strBuilder += word.substr(0,width-1) + "-";
                //word = word.Substring(width - 1);

                word = word.substr(width - 1);

                //strBuilder.Append(Environment.NewLine);
                strBuilder += newLine;
            }

            // Remove leading whitespace from the word so the new line starts flush to the left.
            word = word.trimStart();
        }
        strBuilder += word;
        curLineLength += word.length;
    }

    return strBuilder;
}

client.login(process.env.TOKEN);


require('http').createServer().listen(process.env.PORT)
