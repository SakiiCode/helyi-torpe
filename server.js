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
  if (msg.content.substring(0,5) == '.meme' && msg.content.length>6) {
    
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
							.catch(err3 => { console.error("Text overlay error: " + err3); });

						}, data2).then(function(total) {
							msg.channel.send(msg.author,{files:[total]});
								
								msg.delete().catch(err => {console.error(err.message);});
						});
						
						/*svgs.reduce(async (previousPromise, nextID) => {
							await previousPromise;
							
							
							
						}, Promise.resolve());*/
						
						
						
					})


				})
			});
			

			
			
		}
	
	) 
	.catch(console.error);
  }else if(msg.content.substring(0,5) == '.help'){
	  msg.channel.send(new Discord.RichEmbed({title:"A Helyi Törpe súgója",description:"```.help            súgó\r\n\.meme <szöveg>   legutóbbi képedhez felirat           \r\nxd               xd```"}));
	  
	 
  }else if(msg.content == 'xd' || msg.content == 'Xd' || msg.content == 'xD' || msg.content == 'XD' ||
	  msg.content == 'xdd' || msg.content == 'Xdd' || msg.content == 'xDD' || msg.content == 'XDD' 
	){
	  msg.channel.send({
		  files: [{
			attachment: 'xd.gif',
			name: 'xd.gif'
		  }]
		})
	  .catch(console.error);
  }
  
});

function WordWrap(str, width)
{
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


