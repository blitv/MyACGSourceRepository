function manifest() {
	return JSON.stringify({
		//@NonNull 搜索源 ID 标识，设置后不建议更改
		//可前往https://tool.lu/timestamp/ 生成时间戳（精确到秒）
		id: 1660668834,
		
		//最低兼容MyACG版本（高版本无法安装在低版本MyACG中）
		minMyACG: 20230810,

		//优先级 1~100，数值越大越靠前
		priority: 70,
		
		//是否启用失效#默认关闭
		//true: 无法安装，并且已安装的变灰，用于解决失效源
		isEnabledInvalid: false,
		
		//@NonNull 搜索源名称
		name: "MX动漫",

		//搜索源制作人
		author: "雨夏",

		//电子邮箱
		email: "2534246654@qq.com",

		//搜索源版本号，低版本搜索源无法覆盖安装高版本搜索源
		version: 4,

		//搜索源自动同步更新链接
		syncList: {
			"Gitee":  "https://gitee.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/MX动漫.js",
			"极狐":   "https://jihulab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/MX动漫.js",
			"Gitlab": "https://gitlab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/MX动漫.js",
			"Github": "https://github.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/MX动漫.js",
			"Gitcode":"https://gitcode.net/Cynric_Yx/MyACGSourceRepository/-/raw/master/sources/MX动漫.js",
		},
		
		//更新时间
		updateTime: "2023年8月10日",
		
		//默认为1，类别（1:网页，2:图库，3:视频，4:书籍，5:音频，6:图片）
		type: 3,
		
		//内容处理方式： -1: 搜索相似，0：对网址处理并调用外部APP访问，1：对网址处理，2：对内部浏览器拦截
		contentProcessType: 2,
		
		//自定义标签
		group: ["动漫"],
		
		//@NonNull 详细界面的基本网址
		baseUrl: baseUrl,

		//发现
		findList: {
			category: {
				"region": {
					"日本动漫": "riman",
					"国产动漫": "guoman",
					"动漫电影": "dmdianying",
					"欧美动漫": "oman",
				},
				"label": ["全部","搞笑","运动","励志","武侠","特摄","热血","战斗","竞技","校园","青春","爱情","冒险","后宫","百合","治愈","萝莉","魔法","悬疑","推理","奇幻","神魔","恐怖","血腥","机战","战争","犯罪","社会","职场","剧情","伪娘","耽美","歌舞","肉番","美少女","吸血鬼","泡面番","欢乐向"],
				"year": ["全部","2023","2022","2021","2020","2019","2018","2017","2016","2015","2014","2013","2012","2011","2010","2009","2008","2007","2006","2005","2004","2003","2002","更早",
				],
				"sort": {
					"时间排序": "time",
					"人气排序": "hits",
					"评分排序": "score",
				},
			},
			"动漫": ["region","label","year","sort"]
		},
		
	})
}

const baseUrl = "http://www.mxdm.tv";
/**
 * 备用：
 * http://www.mxdm.tv
 * http://www.mxdm.cc
 * http://www.mxdmx.com
 * http://www.mxdm8.com
 * http://www.mxdm9.com
 */

/**
 * 搜索
 * @param {string} key
 * @return {[{name, summary, coverUrl, url}]}
 */
function search(key) {
	var url = JavaUtils.urlJoin(baseUrl, '/search/-------------.html?wd=' + encodeURI(key));
	var result= [];
	const response = JavaUtils.httpRequest(url);
	if(response.code() == 200){
		var document = response.body().cssDocument();
		var elements = document.select(".module-list > div > div");
		for (var i = 0;i < elements.size();i++) {
			var element = elements.get(i);
			result.push({
				//名称
				name: element.selectFirst('div.video-info-header > h3').text(),
				
				//概览
				summary: element.selectFirst('div.video-info-header > a').text(),
				
				//封面网址
				coverUrl: element.selectFirst('div.module-item-pic > img').absUrl('data-src'),
				
				//网址
				url: element.selectFirst('div.video-info-header > h3 > a').absUrl('href')
			});
		}
	}
	return JSON.stringify(result);
}

/**
 * 发现
 * @param {string} url
 * @return {[{name, summary, coverUrl, url}]}
 */
function find(region, label, year, sort) {
	if(label == "全部")label = "";
	if(year == "全部")year = "";

	var url = JavaUtils.urlJoin(baseUrl, `https://www.mxdm9.com/show/${region}--${sort}-${label}--------${year}.html`);
	var result = [];
	const response = JavaUtils.httpRequest(url);
	if(response.code() == 200){
		const document = response.body().cssDocument();
		const elements = document.select(".module-list > div > div");
		for (var i = 0;i < elements.size();i++) {
			var element = elements.get(i);
			result.push({
				//名称
				name: element.selectFirst('.module-item-titlebox').text(),
				
				//概览
				summary: element.selectFirst('.module-item-text').text(),
				
				//封面网址
				coverUrl: element.selectFirst('.module-item-pic > img').absUrl('data-src'),
				
				//网址
				url: element.selectFirst('.module-item-titlebox > a').absUrl('href')
			});
		}
	}
	return JSON.stringify(result);
}

/**
 * 详情
 * @return {[{name, author, update, summary, coverUrl, isEnabledChapterReverseOrder, tocs:{[{name, chapter:{[{name, url}]}}]}}]}
 */
function detail(url) {
	const response = JavaUtils.httpRequest(url);
	if(response.code() == 200){
		var document = response.body().cssDocument();
		return JSON.stringify({
			//名称
			name: document.selectFirst('div:nth-child(1) > div.video-info-actor > a').text(),
			
			//作者
			//author: document.selectFirst('').text(),
			
			//更新时间
			//update: document.selectFirst('').text(),
			
			//概览
			summary: document.selectFirst('.video-info-content > p:nth-child(2)').text(),
	
			//封面网址
			coverUrl: document.selectFirst('div.video-cover > div > div > img').absUrl('data-src'),
			
			//是否启用将章节置为倒序
			isEnabledChapterReverseOrder: false,
			
			//目录加载
			tocs: tocs(document)
		});
	}
	return null;
}

/**
 * 目录
 * @return {[{name, chapters:{[{name, url}]}}]}
 */
function tocs(document) {
	const tagElements = document.select('div.tab-item');
	
	//目录元素选择器
	const tocElements= document.select('div.module-player-list');
	
	//创建目录数组
	var newTocs = [];
	
	for (var i = 0;i < tocElements.size();i++) {
		//创建章节数组
		var newChapters = [];
		
		//章节元素选择器
		var chapterElements = tocElements.get(i).select('div.scroll-content > a');
		
		for (var i2 = 0;i2 < chapterElements.size();i2++) {
			var chapterElement = chapterElements.get(i2);
			
			newChapters.push({
				//章节名称
				name: chapterElement.selectFirst('a').text(),
				//章节网址
				url: chapterElement.selectFirst('a').absUrl('href')
			});
		}
		newTocs.push({
			//目录名称
			name: tagElements.get(i).selectFirst('span').text(),
			//章节
			chapters: newChapters
		});
	}
	return newTocs
}

/**
 * 内容（部分搜索源通用过滤规则）
 * @version 2023/3/17
 * 布米米、嘻嘻动漫、12wo动漫、路漫漫、风车动漫P、樱花动漫P、COCO漫画、Nike、MX动漫
 * @return {string} content
 */
function content(url) {
	var re = new RegExp(
		//https://
		'[a-z]+://[\\w.]+/(' +

		//https://knr.xxxxx.cn/j/140000		#[a-z]{1}\/\d{6}
		'([a-z]{1}/\\d)|' +

		//https://xx.xxx.xx/xxx/xxx/0000	#[a-z]{3}\/[a-z]{3}\/\d
		'([a-z]{3}/[a-z]{3}/\\d)|' +
		
		//https://tg.xxx.com/sc/0000?n=xxxx #[a-z]{2}\/\d{4}\?
		'([a-z]{2}/\\d{4}\\?)|' +
		
		//https://xx.xxx.xyz/vh1/158051 	#[\w]{3}\/\d{6}$
		'([\\w]{3}/\\d{6}$)|' +
		
		//https://xx.xx.com/0000/00/23030926631.txt 	#[\d]{4}\/\d{2}\/\d{11}\.txt
		'([\\d]{4}/\\d{2}/\\d{11}\\.txt)|' +

		//https://xxxxx.xxxxxx.com/v2/stats/12215/157527 	#[\w]{2}\/\w{5}\/\d{5}\/\d{6}
		'([\\w]{2}/\\w{5}/\\d{5}/\\d{6})|' +

		//https://xxx.xxxxxx.com/sh/to/853	#sh\/[\w]{2}\/\d{3}
		'(sh/[\\w]{2}/\\d{3})|' +

		//https://xxx.rmb.xxxxxxxx.com/xxx/e3c5da206d50f116fc3a8f47502de66d.gif #[\w]{3}\/[\w]{32}\.
		'([\\w]{3}/[\\w]{32}\\.)' +

		')',
		'i'
	);
	if(!re.test(url)){
		return url;
	}
	return null;
}