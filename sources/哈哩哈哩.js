function manifest() {
	return JSON.stringify({
		//MyACG 最新版本
		MyACG: 'https://lanzou.com/b07xqlbxc ',
		
		//@NonNull 搜索源ID标识，设置后不建议更改
		//可前往https://tool.lu/timestamp/ 生成时间戳（精确到秒）
		id: 1660756417,
		
		//最低兼容MyACG版本（高版本无法安装在低版本MyACG中）
		minMyACG: 20220101,

		//优先级1~100，数值越大越靠前
		//参考：搜索结果多+10，响应/加载速度快+10，品质优秀+10，更新速度快+10，有封面+10，无需手动授权+10
		priority: 70,
		
		//是否失效，默认关闭
		//true: 无法安装，并且已安装的变灰，用于解决失效源
		invalid: false,
		
		//@NonNull 搜索源名称
		name: "哈哩哈哩",

		//搜索源制作人
		author: "雨夏",

		//电子邮箱
		email: "2534246654@qq.com",

		//搜索源版本号，低版本搜索源无法覆盖安装高版本搜索源
		version: 1,

		//搜索源自动同步更新链接
		syncList: {
			"Gitee":  "https://gitee.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/哈哩哈哩.js",
			"极狐":   "https://jihulab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/哈哩哈哩.js",
			"Gitlab": "https://gitlab.com/ylk2534246654/MyACGSourceRepository/-/raw/master/sources/哈哩哈哩.js",
			"Github": "https://github.com/ylk2534246654/MyACGSourceRepository/raw/master/sources/哈哩哈哩.js",
			"Gitcode":"https://gitcode.net/Cynric_Yx/MyACGSourceRepository/-/raw/master/sources/哈哩哈哩.js",
		},
		
		//更新时间
		updateTime: "2022年8月17日",
		
		//默认为1，类别（1:网页，2:图库，3:视频，4:书籍，5:音频，6:图片）
		type: 3,
		
		//内容处理方式： 0：链接处理并浏览器访问{url}，1：链接处理{url}，2：浏览器拦截请求{url}，3：浏览器拦截框架{html}
		contentType: 2,
		
		//自定义标签
		tag: ["动漫"],
		
		//@NonNull 详细界面的基本网址
		baseUrl: "https://halihali7.com",
	});
}
const header = '';

/**
 * 搜索
 * @params {string} key
 * @returns {[{title, summary, cover, url}]}
 */
function search(key) {
	var url = 'https://s5.quelingfei.com:4438/ssszz.php?top=10&q='+ encodeURI(key) + header;
	const response = httpRequest(url);
	
	var array= [];
	const $ = JSON.parse(response)
	$.forEach((child) => {
		array.push({
			//标题
			title: child.title,
	
			//概览
			summary: child.time,
	
			//封面
			cover: ToolUtil.urlJoin(url,child.thumb),
	
			//网址
			url: ToolUtil.urlJoin(url,child.url)
		})
	  })
	return JSON.stringify(array);
}
/**
 * 详情
 * @params {string} url
 * @returns {[{author, summary, cover, upDate, reverseOrder, catalog}]}
 */
 function detail(url) {
	const response = httpRequest(url+ header);
	return JSON.stringify({
		//标题
		title : jsoup(response,'dt.name').text(),
		
		//作者
		//author: jsoup(response,'div:nth-child(1) > div.video-info-actor > a').text(),
		
		//概览
		summary: jsoup(response,'.des2').text(),

		//封面
		cover : jsoup(response,'.pic > img').attr('data-src'),
		
		//目录是否倒序
		reverseOrder: true,
		
		//目录链接/非外链无需使用
		catalog: catalog(response,url)
	})
}
/**
 * 目录
 * @params {string} response
 * @params {string} url
 * @returns {tag, chapter:{[{group, name, url}]}}
 */
function catalog(response,url) {
	//目录标签代码
	const tabs = jsoupArray(response,'ul > li[id]').outerHtml();
	
	//目录代码
	const catalogs = jsoupArray(response,'.urlli > div > ul[id]').outerHtml();
	
	//创建目录数组
	var new_catalogs= [];
	
	for (var i=0;i<catalogs.length;i++) {
	    var catalog = catalogs[i];
		
		//创建章节数组
		var newchapters= [];
		
		//章节代码
		var chapters = jsoupArray(catalog,'ul > li').outerHtml();
		
		for (var ci=0;ci<chapters.length;ci++) {
			var chapter = chapters[ci];
			
			newchapters.push({
				//章节名称
				name: jsoup(chapter,'a').text(),
				//章节链接
				url: ToolUtil.urlJoin(url,jsoup(chapter,'a').attr('href'))
			});
		}
		//添加目录
		new_catalogs.push({
			//目录名称
			tag: jsoup(tabs[i],'li').text(),
			//章节
			chapter : newchapters
			});
	}
	return new_catalogs
}

 /**
 * 内容(InterceptRequest)
 * @params {string} url
 * @returns {string} content
*/
function content(url) {
	//浏览器请求结果处理
	var re = /js\?ver/i;
	//广-告-代-码
	//https://halihali7.com/js/new-kk-27k.js?ver=556
	//https://halihali7.com/js/wap2-jm-daka.js?ver=121
	if(!re.test(url)){
		return url;
	}
	return null;
} 