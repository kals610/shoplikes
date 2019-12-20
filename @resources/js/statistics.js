$(document).ready(function() {
	if(TB.shopInfo.shopPageUrl != "") {
		var r = getCookie(TB.shopInfo.shopPageUrl);
		if(r == 'true') {
		} else {
			// 쿠키를 쓴다
			setCookie(TB.shopInfo.shopPageUrl, "true", 10);
			statistics();
		}
	}
	
});


function statistics() {

	if(TB.shopInfo.isShopPage && TB.statistics.shopNo) {
		if(TB.statistics.referrer != "") {
			var splitUrl = TB.statistics.referrer.split('/');
			var referrerMainUrl = splitUrl[0]+"//"+splitUrl[2];
			if(referrerMainUrl.indexOf(TB.domain) != -1) {
				return;
			}
		}
		// 다른 레퍼럴이거나 공백일시
		var d = {
				shopNo:TB.statistics.shopNo,
				referrer:TB.statistics.referrer,
				clientIp:TB.statistics.clientIp,
				pageType:TB.pageType,
				originDomain:TB.originDomain,
				flatform:TB.statistics.flatform
				};
		
		$.ajax({
			url:'/Statistics/shopPageInfolow',
			type:'post',
			data:d,
			success:function(r) {
				
			},
			error:function(request, status, error) {
				
			}
		});
	}
}


function productLinkStatistics(obj) {
	var $o = obj;
	var order = $o.attr('data-order');
	var link = $o.attr('data-link');
	var instagramId = $o.attr('data-content_instagram_id');
	
	if(order != '' && link != '' & instagramId != '') {
		var d = {
					order:order,
					link:link,
					instagramId:instagramId,
					shopInstaUserId:TB.shopInfo.shopInstaUserId,
					flatform:'w'
				}
		$.ajax({
			url:'/Statistics/productLinkClick',
			type:'get',
			data:d,
			success:function(r) {
				var d = jQuery.parseJSON(r);
				console.info(d);
				
			},
			error:function(request, status, error) {

			}
		});
	}
}



function setCookie (key, value, min) {
    var date = new Date();
    // Get unix milliseconds at current time plus number of hours
    //date.setTime(+ date + (hours * 86400)); //60 * 60 * 1000
    date.setTime(date.getTime() + (min * 60 * 1000));
    window.document.cookie = key + "=" + value + "; expires=" + date.toGMTString() + "; path=/";
    return value;
};

function getCookie(c_name) {
	var i,x,y,ARRcookies=document.cookie.split(";");
	for (i=0;i<ARRcookies.length;i++)
	{
	  x=ARRcookies[i].substr(0,ARRcookies[i].indexOf("="));
	  y=ARRcookies[i].substr(ARRcookies[i].indexOf("=")+1);
	  x=x.replace(/^\s+|\s+$/g,"");
	  if (x==c_name)
		{
		return unescape(y);
		}
	  }
};