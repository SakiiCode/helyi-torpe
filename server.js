const Discord = require('discord.js');
const client = new Discord.Client();
const sharp = require('sharp');
const TextToSVG = require('text-to-svg');
const textToSVG = TextToSVG.loadSync('Anonymous_Pro.ttf');
const convert = require('convert-svg-to-png').convert;
const sizeOf = require('buffer-image-size');
const CronJob = require('cron').CronJob;
const request = require('request');
const date = require('date-and-time');
const Axios = require('axios');
const attributes = {fill: 'black'};
const options = {x: 0, y: 0, fontSize: 40, anchor: 'top', attributes: attributes};
const letterWidthPixels = 25;
const letterHeightPx = 60;
const pollChars = ['🇦','🇧','🇨','🇩','🇪','🇫','🇬','🇭','🇮','🇯','🇰'];
var dg = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
const job = new CronJob('0 20 13 * * 1,5,6', function() {
   getJams(processJams);
}, null, true, 'Europe/Budapest');
const adminCommands = ["msg","clear","jams","stop"];
const botSpamCommands = ["help","iam","roles","source","minesweeper"];

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
  client.user.setActivity('#bot-spam | .help', { type: 'WATCHING' });
  job.start();

});

client.on('message', async (msg) =>  {

	if(msg.content.toLowerCase().startsWith('xd...')){
		msg.channel.send({
			files: [{
			  attachment: 'xd.gif',
			  name: 'xd.gif'
			}]
		  })
		.catch(console.error);
		return;
	}
	let command;
	if(!msg.content.startsWith(".") && !msg.content.startsWith("t.")){
		return;
	}else{
		console.log(msg.content);
		if(msg.content.startsWith("t.")){
			command = msg.content.substring(2,msg.content.length).split(" ")[0];
		}else{
			command = msg.content.substring(1,msg.content.length).split(" ")[0];
		}
	}


	let isAdmin=false;

	if(msg.channel instanceof Discord.TextChannel){
		const authorRoles = msg.member.roles.cache.array();
		for(i=0;i<authorRoles.length;i++){
			const role = authorRoles[i].name.toLowerCase();
			if(role.includes("admin") || role.includes("mod")){
				isAdmin=true;
			}
		}
	}

	if(adminCommands.includes(command) && !isAdmin){
		console.log("Insufficient permissions");
		return;
	}

	if(botSpamCommands.includes(command) && msg.channel instanceof Discord.TextChannel && !(msg.channel.name.includes("spam") || msg.channel.name.includes("test"))){
		msg.reply('kérlek a _**#bot-spam**_ szobában használd ezt a parancsot!');
		return;
	}


	switch(command){
		case "meme":
			msg.channel.startTyping();
			const messages = await msg.channel.messages.fetch({ limit: 20 })

			const mesgs = messages.filter(m => (m.attachments.size > 0)).array(); //.filter(m => m.author.id === msg.author.id)
			let url;
			for (let i = 0; i < mesgs.length; i++) {
				if(mesgs[i] == undefined){
					continue;
				}
				url = mesgs[i].attachments.last().url.toString();
				console.log("["+i+"] "+url);
				if(!url.endsWith(".jpg") && !url.endsWith(".png")  && !url.endsWith(".gif")){

					continue;
				}

				break;

			}

			if(url === undefined){
				msg.reply("nem találtam képet");
				console.log("No picture found for .meme");
				msg.channel.stopTyping();
				return;
			}



			const text=msg.content.substring(6);
			const bigw=1000;

			//SZÖVEG MÉRETEI
			const txtpadding=20;//Math.max(100-text.length*5, 20);
			const txtwmax=bigw-2*txtpadding;
			const charsPerLines = Math.floor(txtwmax/letterWidthPixels);

			const linesArr = WordWrap(text, charsPerLines).split(/\r\n|\r|\n/);
			const linesCount = linesArr.length;

			const txth=letterHeightPx*linesCount;

			let svgs = [];
			for(i=0;i<linesCount;i++){
				svgs.push(textToSVG.getSVG(linesArr[i], options));
			}

			//BELSŐ KÉP MÉRETEI
			const imgpadding=20;
			const destw=bigw-2*imgpadding;
			const desth=480;


			//KÉP HELYE FELÜLRŐL
			const imgy=txth+2*txtpadding+imgpadding;

			//NAGY KÉP MÉRETEI
			const bigh=txth+2*txtpadding+desth+2*imgpadding;
			console.log("Big:"+bigw+","+bigh);
			console.log("Textlines("+(txtwmax/letterWidthPixels)+"):"+charsPerLines+"*"+linesCount);
			console.log("Txtpadding:"+txtpadding);
			console.log("Imgpadding:"+imgpadding);
			console.log("DestSize:"+destw+","+desth);

			try{
				const body = Buffer.from((await Axios.get(url, {responseType:'arraybuffer'})).data,'base64');
				const resized = await sharp(body).resize({width:destw, height:desth, fit: 'inside'}).toBuffer();
				console.log("Pos:"+(bigw/2-Math.ceil(destw/2))+","+imgy);
				let canvas =
					await sharp({
						create: {
							width: bigw,
							height: bigh,
							channels: 4,
							background: { r: 255, g: 255, b: 255, alpha: 1 }
						}
					})
					.composite([{
						input:resized,
						top:imgy+((bigh-imgy)/2-desth/2),
						left:(bigw/2-Math.ceil(destw/2))
					}])
					.png()
					.toBuffer();
				for(let currentLine=0;currentLine<svgs.length;currentLine++){
					const svg=svgs[currentLine];
					const s2i = await convert(svg, {
						puppeteer: {
							args: ['--no-sandbox', '--disable-setuid-sandbox']
						}
					});

					const dimensions = sizeOf(s2i);
					console.log("Line size: "+ dimensions.width + ", " + dimensions.height);


					canvas = await sharp(canvas)
						.composite([{input:s2i,
							top:txtpadding+currentLine*letterHeightPx,
							left:txtpadding
						}])
						.png()
						.toBuffer();

				}

				await msg.channel.send(msg.author.toString()+" által",{files:[canvas]});
				msg.channel.stopTyping();


			}catch(error){
				console.error(error);
				msg.channel.stopTyping();
			}




			break;
		case "help":
			msg.channel.send("**A Helyi Törpe parancsai**\n```"+
			"#bot-spam\n"+
			"   .help                          parancsok\n"+
			"   .roles                         role-ok listája\n"+
			"   .iam <szerep>                  role fel/levétele\n"+
			"   .source                        a Helyi Törpe forráskódja\n"+
			"   .minesweeper                   aknakereső\n"+
			"bárhol\n"+
			"   .meme <szöveg>                 legutóbbi képedhez felirat\n"+
			"   .poll <kérdés,válasz1,...>     szavazás\n"+
			"   xd                             xd```"
			);
			break;
		case "iam":
			const roleName = msg.content.split(' ')[1];
			let id,name;
			switch(roleName){
				case "tesztelo":
					id = '539878542586937377';
					name="tesztelő";
					break;
				case "producer":
					id='460488813525991438';
					name = "producer";
					break;
				case "hang":
					id='460185178443087874';
					name = "hangmérnök";
					break;
				case "kod":
					id='460185211230224395';
					name = "programozó";
					break;
				case "grafikus":
					id='460185260848840705';
					name="grafikus";
					break;
				case "palya":
					id='460185260244729877';
					name="pályatervező";
					break;
				case "jammer":
					id='539878964248838181';
					name="jammer";
					break;
				case "youtuber":
					id='539878321551573002';
					name="YouTuber";
					break;
				default:msg.reply("érvénytelen role!");
			}
			if(id !== undefined){
				if(!msg.member.roles.cache.get(id)){
					msg.member.roles.add(id);
					msg.reply('mostantól '+name+' vagy!');
				}else{
					msg.member.roles.remove(id);
					msg.reply('már nem vagy '+name+'!');
				}
			}
			break;
		case "msg":
			msg.channel.send(msg.content.substring(5));
			msg.delete();
			break;
		case "roles":
			msg.reply(
				"válassz szerepet:\n"+
				"**.iam tesztelo** - Tesztelő\n"+
				"**.iam producer** - Kiadó/Ötletgazda/Projekt manager/Marketinges\n"+
				"**.iam hang** - Hangmérnök/Szinkronszínész/Zeneszerző\n"+
				"**.iam kod** - Programozó\n"+
				"**.iam grafikus** - 2D/3D Grafikus\n"+
				"**.iam palya** - Pályatervező\n"+
				"**.iam youtuber** - YouTuber/Streamer"+
				"**.iam jammer** - Értesítést kapsz az itch.io-s game jam-ekről (hamarosan!)\n");
			break;
		case "poll":
			const attr = msg.content.substring(6).split(",");
			let reply = "@here __szavazás: **"+attr[0]+"**__\n";
			const answers = Math.min(attr.length-1,11);
			for(i=0;i<answers;i++){
			  reply += pollChars[i]+":"+attr[i+1]+"\n";
			}

			const message = await msg.channel.send(reply);
			const chs = pollChars.slice(0,answers);
			for(let i=0;i<chs.length;i++){
				const ch=chs[i];
				await message.react(ch);
			}
			break;
		case "source":
			msg.reply("https://github.com/SakiiCode/helyi-torpe/blob/master/server.js");
			break;
		case "minesweeper":
			msg.channel.startTyping();
			const mineCount = 18;
			const mapSize=10;

			let map = [];
			for(let x=0;x<mapSize;x++){
				map[x]=[]
				for(let y=0;y<mapSize;y++){
					map[x][y]=0;
				}
			}

			for(let i=0;i<mineCount;i++){
				do{
					x=Math.floor(Math.random() * mapSize);
					y=Math.floor(Math.random() * mapSize);
				}while(map[x][y]==9);

				map[x][y]=9;

				for(let j=-1;j<=1;j++){
					for(let k=-1;k<=1;k++){
						if(x+j>-1 && x+j<mapSize && y+k>-1 && y+k<mapSize && (map[x+j][y+k] != 9)){
							map[x+j][y+k] +=1;
						}
					}
				}
			}
			let txt="";
			for(let i=0;i<mapSize;i++){

				for(let j=0;j<mapSize;j++){
					if(map[i][j] != 9){
						txt +="||  :"+dg[map[i][j]]+":  ||  ";
					}else{
						txt +="||  :boom:  ||  ";
					}
				}
				txt+="\n";

			}
			msg.channel.send(txt);
			msg.channel.stopTyping();
			break;
		case "stop":
			msg.channel.stopTyping();
			msg.delete();
			break;
		case "clear":
			try{
				await msg.delete();
				const amount = msg.content.split(' ')[1];
				if(amount !== undefined){
					await msg.channel.bulkDelete(amount).catch(console.error);
				}
			}catch(error){
				console.log("Error deleting messages: "+error);
			}
			break;
		case "jams":
			getJams(processJams);
			break;
		//default: msg.reply(" ismeretlen parancs");
	}
});

client.on("guildMemberAdd", (member) => {
	console.log(`New User "${member.user.username}" has joined "${member.guild.name}"` );
	if(member.guild.id == "248820876814843904"){
		member.guild.channels.resolve("442082649700302848").send(
		"Üdvözlünk " + member.user.toString() + " a " + member.guild.name + " szerveren, választhatsz egy vagy több szerepet:\n"+
		"**.iam tesztelo** - Tesztelő\n"+
		"**.iam producer** - Kiadó/Ötletgazda/Projekt manager/Marketinges\n"+
		"**.iam hang** - Hangmérnök/Szinkronszínész/Zeneszerző\n"+
		"**.iam kod** - Programozó\n"+
		"**.iam grafikus** - 2D/3D Grafikus\n"+
		"**.iam palya** - Pályatervező\n"+
		"**.iam jammer** - Értesítést kapsz az itch.io-s és gamejolt-os game jam-ekről minden hétfőn, pénteken és szombaton\n"+
		"**.iam youtuber** - YouTuber/Streamer\n"+
		"**Kérlek olvasd el a "+member.guild.channels.resolve("442084233767419916").toString()+" csatornát is!**");
	}
});

function WordWrap(str, width){
	const splitChars = [ ' ', '-', '\t' ];
	const newLine='\n';
	const words = str.split(' ');
		//words= Explode(str, splitChars);

	let curLineLength = 0;
	let strBuilder='';
	//StringBuilder strBuilder = new StringBuilder();
	for(let i = 0; i < words.length; i += 1)
	{
		let word = words[i]+" ";
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
//TODO asyncra átírni
function getJams(callback){
	console.log("Retrieving game jams...");
	//TODO request helyett got()
	request('http://www.indiegamejams.com/calfeed/index.php', { json: true }, (err, res, body) => {
		if (err) { return console.log(err); }
		console.log("Done");
		jams = [];
		for(i=0;i<body.length;i++){
			jam = body[i];

			//console.log(jam.summary);
			//20190301T050000Z
			if(jam.dtstart != undefined){
				startdate = date.addHours(date.parse(jam.dtstart, 'YYYYMMDD hhmmss '),1);
				//console.log(startdate);
				jam2 = {
					name:jam.summary,
					url:jam.description.split('\n')[0],
					start:startdate};
				jams.push(jam2);
				//console.log(jam2);
			}
		}


		jams.sort(function(a,b){
			// Turn your strings into dates, and then subtract them
			// to get a value that is either negative, positive, or zero.
			sum = date.subtract(a.start, b.start).toSeconds();
			//console.log(sum);
			return sum;
		});

		currentjams = jams.filter((jam)=>{
			return date.subtract(jam.start,new Date()).toSeconds() >0;

		});
		//console.log(currentjams);
		callback(currentjams.slice(0,5));
	});
}

function processJams(jams){

  guild = client.guilds.resolve('248820876814843904');
  jammer = guild.roles.resolve('539878964248838181');
  var reply = jammer.toString() + "ek, ezeken tudtok részt venni a következő néhány napon:\n";
  for(i=0;i<jams.length;i++){
	var jam = jams[i];
	reply += jam.name+"  ("+date.format(jam.start, 'MMM. DD. HH:mm')+"-tól)\n";
	reply += "    <"+jam.url+">\n";
  }
  guild.channels.resolve('442082917049565214').send(reply);
  //console.log(jammer.toString());
  console.log("Jam list sent");



}

client.login(process.env.TOKEN);


require('http').createServer().listen(process.env.PORT)
