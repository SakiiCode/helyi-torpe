const Discord = require('discord.js');
const client = new Discord.Client();

const sharp = require('sharp');

const TextToSVG = require('text-to-svg');
const textToSVG = TextToSVG.loadSync();

//const s2i = require('svg2img');
const { convert } = require('convert-svg-to-png');

var port = process.env.PORT || 3000

const attributes = {fill: 'black'};
const options = {x: 0, y: 0, fontSize: 72, anchor: 'top', attributes: attributes};
 


client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
  if (msg.content.substring(0,5) == '.meme' && msg.content.length>5) {
    
	msg.channel.fetchMessages({ limit: 10 })
		.then(messages =>
		{
			//filtered = messages.filter(m => m.author.id === msg.author.id);
			//url = filtered.first().attachments.first().url;
			url = msg.attachments.first().url;
			console.log(url);
			
			
			text=msg.content.substring(6);
					  
					  
					  
					  

			
			bigw=700;
			
			
			svg = textToSVG.getSVG(text, options);

			//SZÖVEG MÉRETEI
			txtpadding=Math.max(100-text.length*5, 20);
			//txtw=bigw-2*txtpadding;
			txth=100;
			//fontsize=50;
			//console.log(txtpadding);

				
			//BELSŐ KÉP MÉRETEI
			imgpadding=20;
			destw=bigw-2*imgpadding;
			desth=480;
			//destratio = destw/desth;
			console.log("Dest:"+destw+","+desth);
			
			imgy=txth+2*txtpadding+imgpadding; //KÉP HELYE FELÜLRŐL
			console.log("Pos:"+imgpadding+","+imgy);
			//NAGY KÉP MÉRETEI
			
			bigh=txth+2*txtpadding+desth+2*imgpadding;
			console.log("Big:"+bigw+","+bigh);

			//imagecopyresized($im, $source, $bigw/2-$neww/2, $imgy, 0, 0, $neww, $newh, $originalw, $originalh);
					  
			
			
			var request = require('request').defaults({ encoding: null });
			request.get(url, function (err, res, body) {
				sharp(body)
					.resize({width:destw, height:desth, fit: 'inside'})
					.toBuffer((err, data, info) => {
					

					sharp({
						create: {
							width: bigw,
							height: bigh,
							channels: 4,
							background: { r: 255, g: 255, b: 255, alpha: 1 }
						}
					})
					.overlayWith(data,{
							top:imgy,
							left:(bigw/2-info.width/2)
						})
					.png()
					.toBuffer(async(err2, data2, info2) => {

						s2i = await convert(svg, {
							puppeteer: {
								args: ['--no-sandbox', '--disable-setuid-sandbox']
							}
						});

						sharp(data2)
						.overlayWith(s2i,{
							top:txtpadding,
							left:txtpadding
						})
						.png()
						.toBuffer((err3, data3, info3) => {
							msg.reply(msg.author,{files:[data3]});//{embed:new Discord.RichEmbed({image:data3})});
							msg.delete();
						})
						
						
						
					})


				})
			});
			
			
			
			
			
			/*sharp('img.jpg')
			  .resize(300, 200)
			  .toFile('output.jpg', function(err) {
				msg.reply(err);
				// output.jpg is a 300 pixels wide and 200 pixels high image
				// containing a scaled and cropped version of input.jpg
			  });*/
			
			
		}
	
	) // console.log(`${messages.filter(m => m.author.id === msg.author.id).size} messages`)
	.catch(console.error);
  }
});

client.login(process.env.TOKEN);


require('http').createServer().listen(process.env.PORT)


