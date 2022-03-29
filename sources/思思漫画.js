function mainifest() {
	return JSON.stringify({
		//最低兼容MyACG版本（高版本无法安装在低版本MyACG中）
		minMyACG: 20211219,

		//优先级1~100，数值越大越靠前
		priority:1,
		
		//是否失效，默认关闭
		//true: 无法安装，并且已安装的变灰，用于解决失效源
		invalid: false,
		
		//@NonNull 搜索源名称
		name: "思思漫画",

		//搜索源制作人
		author: "雨夏",

		//联系邮箱
		mail: "2534246654@qq.com",

		//搜索源版本号，低版本搜索源无法覆盖安装高版本搜索源
		version: 1,

		//搜索源更新链接(可使用多个) ","符号进行隔开，注意：不要使用中文的逗号
		updateUrl: "",
		
		//更新时间
		updateTime: "2022年3月29日",
		
		//默认为1，类别（1:网页，2:图库，3:视频，4:书籍，5:音频，6:图片）
		type: 2,
		
		//自定义标签，支持配置多个，多个链接之间，通过英文逗号进行分隔
		tag: "漫画",
		
		//@NonNull 详细界面域名，搜索源标识
		host: "m.sisimanhua.com",
		
		//发现
		finds: {
			"完结": "https://m.sisimanhua.com/list/wanjie/",
			"都市": "https://m.sisimanhua.com/list/dushi/",
			"后宫": "https://m.sisimanhua.com/list/hougong/",
			"穿越": "https://m.sisimanhua.com/list/chuanyue/"
		}
	});
}
const header = '@header->user-agent:Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.198 Safari/537.36';

/**
 * 搜索
 * @params {string} key
 * @returns {[{title, summary, cover, url}]}
 */
function search(key) {
	var url = 'https://m.sisimanhua.com/search/?keywords=' + encodeURI(key) + header;
	const response = httpRequest(url);
	
	const list = jsoupArray(response,'#update_list > div > div').outerHtml();
	var array= [];
	for (var i=0;i<list.length;i++) {
	    var data = list[i];
		array.push({
			//标题
			title : jsoup(data,'div.itemTxt > a').text(),
			
			//概览
			summary : jsoup(data,'a.coll').text(),
			
			//封面
			cover : jsoup(data,'div.itemImg > a > mip-img').attr('src'),
			
			//链接
			url : ToolUtil.urlJoin(url,jsoup(data,'div.itemTxt > a').attr('href'))
			});
	}
	return JSON.stringify(array);
}
/**
 * 详情
 * @params {string} url
 * @returns {[{author, summary, cover, upDate, reverseOrder, catalogs}]}
 */
function detail(url) {
	const response = httpRequest(url+ header);
	return JSON.stringify({
		//作者
		author: jsoup(response,'div.comic-view.clearfix > div.view-sub.autoHeight > div > dl:nth-child(3) > dd').text(),
		
		//概览
		summary: jsoup(response,'div.comic-view.clearfix > p').text(),

		//封面
		//cover: ,

		//更新时间
		upDate: jsoup(response,'div.comic-view.clearfix > div.view-sub.autoHeight > div > dl:nth-child(5) > dd').text(),
		
		//目录是否倒序
		reverseOrder: true,
		
		//目录加载
		catalogs: catalogs(response,url)
	})
}
/**
 * 目录
 * @params {string} response
 * @params {string} url
 * @returns {tag, chapters:{[{group, name, url}]}}
 */
function catalogs(response,url) {
	//目录标签代码
	const tabs = jsoupArray(response,'#list_block > div > div.title1').outerHtml();
	
	//目录代码
	const catalogs = jsoupArray(response,'div.comic-chapters').outerHtml();
	
	//创建目录数组
	var new_catalogs= [];
	
	for (var i=0;i<catalogs.length;i++) {
	    var catalog = catalogs[i];
		
		//创建章节数组
		var newchapters= [];
		
		//章节代码
		var chapters = jsoupArray(catalog,'div.comic-chapters > div  > ul  > li').outerHtml();
		
		for (var ci=0;ci<chapters.length;ci++) {
			var chapter = chapters[ci];
			
			newchapters.push({
				//是否为分组
				group: false,
				//章节名称
				name: jsoup(chapter,'a').text(),
				//章节链接
				url: ToolUtil.urlJoin(url,jsoup(chapter,'a').attr('href').replace('.html','-{p}.html@zero->1@start->1'))
			});
		}
		//添加目录
		new_catalogs.push({
			//目录名称
			tag: jsoup(tabs[i],'h3').text(),
			//章节
			chapters : newchapters
			});
	}
	return new_catalogs
}

/**
 * 解析
 * @params {string} url
 * @returns {[{url}]}
 */
function analysis(url) {
	const response = httpRequest(url + header);
	const url2 = jsoup(response,'mip-link > mip-img:not([style=display: none;])').attr('src');
	return url2;
}

/**
 * 发现
 * @params string html
 * @returns {[{title, introduction, cover, url}]}
 */
function find(url) {
	const response = httpRequest(url+ header);
	//目录标签代码
	const list = jsoupArray(response,'.list-comic').outerHtml();
	var array= [];
	for (var i=0;i<list.length;i++) {
	    var data = list[i];
		array.push({
			//标题
			title : jsoup(data,'a.txtA').text(),
			
			//概览
			summary : jsoup(data,'span.info').text(),
			
			//封面
			cover : jsoup(data,'mip-img').attr('src'),
			
			//链接
			url : ToolUtil.urlJoin(url,jsoup(data,'a.ImgA').attr('href'))
			});
	}
	return JSON.stringify(array);
}
