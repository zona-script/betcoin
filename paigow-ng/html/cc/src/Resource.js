'use strict';

var g_resources = {};
var g_audioEngine = cc.AudioEngine.getInstance();
var res = {
	backGround_png : 'res/img/Main_bg_portrait.png',
        baseResource_png : 'res/img/Pai_gow_Poker_new.png',
	baseResource_plist : 'res/img/PaigowPoker_new.plist',

        cardSelect_mp3:'res/sound/effect_buttonClick.mp3',
        gameWin_mp3:'res/sound/tada.mp3'
};
g_resources = [

{
	src : res.backGround_png
},
{
	src : res.baseResource_plist
},
{
	src : res.baseResource_png
},
// Sounds 
{
	src : res.cardSelect_mp3
}

/*font
{
	fontName : "Belwel",
	src : [{
		src : res.belwel_18_fnt,
		type : "truetype"
	}]
}*/];
