var videoPlayer = null;

var TBeventObj = null;
var scrollOffset = 220;
var scrollDuration = 500;

var lineOriginColor = '#fc1a1a';
var lineOverColor = 'yellow';
//var lineOverColor = '#fc1a1a';

var likeDisabled = true;
var commentDisabled = true;

var infoXhr = '';
var commentXhr = '';

var listVar = {};

var modalObj =  null;

var bannerHeight = 0; 
listVar.page = 1;
listVar.rows = 16;
listVar.processing = false;
listVar.morePage = true;

//=========================================================================================
// document ready
//=========================================================================================
$(document).ready(function() {
	
	//=======================
	// 댓글 박스 placeholder
	//=======================
	if(TB.userInfo.userAccessToken == '') {
		$("#comment-txt").attr('placeholder', _LANG_NEED_LOGIN_);
	} else {
		$("#comment-txt").attr('placeholder', _LANG_PLEASE_COMMENT_);
	}
	
	
	//======================
	// 시간템플릿 셋팅
	//======================
	jQuery.timeago.settings.strings = {
		prefixAgo: null,
		prefixFromNow: null,
		suffixAgo: _LANG_TIME_suffixAgo,
		suffixFromNow: "후",
		seconds: _LANG_TIME_seconds,
		minute: _LANG_TIME_minute,
		minutes: _LANG_TIME_minutes,
		hour: _LANG_TIME_hour,
		hours: _LANG_TIME_hours,
		day: _LANG_TIME_day,
		days: _LANG_TIME_days,
		month: _LANG_TIME_month,
		months: _LANG_TIME_months,
		year: _LANG_TIME_year,
		years: _LANG_TIME_years,
		wordSeparator: " ",
		numbers: []
	};
	
	
	videojs("videoPlayer").ready(function(){
		videoPlayer = this;
	});
	
	//===========================
	// more button binding
	//===========================
	$(".more-comment").click(function() {
		modalMoreClickEvent();
	});
	
	//===========================
	// tooltip binding
	//===========================
	$('[data-toggle="tooltip"]').tooltip(); 

	//===========================
	// modal off binding
	//===========================
	$('#tb-md-content').on('hidden.bs.modal', function () {
		modalOffEvent();
	});

	//===========================
	// modal prev button binding
	//===========================
	$(".md-prev").click(function(e) {
		modalPrevEvent();
	});

	//===========================
	// modal next button binding
	//===========================
	$(".md-next").click(function(e) {
		modalNextEvent();
	});

	//===========================
	// going top button event
	//===========================
	$(window).scroll(function() {
		if ($(this).scrollTop() > scrollOffset) {
			$('.gotop').fadeIn(scrollDuration);
		} else {
			$('.gotop').fadeOut(scrollDuration);
		}
	});
	$('.gotop').click(function(event) {
		event.preventDefault();
		$('html, body').animate({scrollTop: 0}, scrollDuration);
		return false;
	});
	
	
	//===========================
	// comment mCustomScrollbar
	//===========================
	$(".comment-area").mCustomScrollbar({
		theme:"dark-thin"
	});

	//===========================
	// follow button click
	//===========================
	$(".insta-follow").click(function(e) {
		e.preventDefault();
		TBeventObj = $(this);
		instaFollowEvent();
	});

	//===========================
	// scroll btn ajax call
	//===========================
	$(window).scroll(function() {
		var scrollHeight = $(window).scrollTop()+$(window).height();
		var documentHeight = $(document).height();
		if((scrollHeight+200) >= documentHeight) {
			if(listVar.morePage == true && listVar.processing == false) {
				$(".loader").show();
				feedListCall();
				listVar.processing = true;
			}
		}
	});
	
	//===========================
	// stackable modal
	//===========================
	$(document).on('show.bs.modal', '.modal', function (event) {
        var zIndex = 1040 + (10 * $('.modal:visible').length);
        $(this).css('z-index', zIndex);
        setTimeout(function() {
            $('.modal-backdrop').not('.modal-stack').css('z-index', zIndex - 1).addClass('modal-stack');
        }, 0);
    });
	$(document).on('hidden.bs.modal', '.modal', function () {
	    $('.modal:visible').length && $(document.body).addClass('modal-open');
	});
	
	
	//===========================
	// like button click binding
	//===========================
	$(".feed-like-action").click(function(e) {
		if(likeDisabled == false) {
			if(TB.userInfo.userAccessToken == '') {
				var redirectUrl = document.location.origin+document.location.pathname;
				var loginUrl = TB.siteUrl+"/accounts?redirectUrl="+encodeURI(redirectUrl)+"&pageType="+TB.pageType+"&flatform=pc";
				location.href = loginUrl;
				return;
			} else {
				likeAction($(this));
			}
		} else {
			return;
		}
	});
	
	
	//===========================
	// 미 로그인 상태시 댓글 입력 부분 포커스&검사
	//===========================
	$("#comment-txt").focus(function() {
		if(TB.userInfo.userAccessToken == '') {
			var redirectUrl = document.location.origin+document.location.pathname;
			var loginUrl = TB.siteUrl+"/accounts?redirectUrl="+encodeURI(redirectUrl)+"&pageType="+TB.pageType+"&flatform=pc";
			location.href = loginUrl;
			return;
		}
	});
	
	
	$("#comment-write-form").submit(function() {
		if(commentDisabled == false) {
			commentDisabled = true;
			commentAction();
		}
		return false;
	});
	
	
	$("#hashtag-search-form").submit(function() {
		hashTagSearch();
		return false;
	});

	
	//===========================
	// 리스트 불러오기
	//===========================
	//feedListCall();

	//===========================
	// follow check
	//===========================
	//followCheck();
	
	//===========================
	// share content check
	//===========================
	//shareCheck();
	
	
	Kakao.init('53a9c2b03717e8a4f938222aee5bb15b');
	
	$('#banner-content-iframe').on('load', function(){
		var h = this.contentWindow.document.body.offsetHeight;
		bannerHeight = h;
		$(this).height(h);
		if(h == 0) {
			$(".md-comment").css('height', "240px");
			$(".banner-content").hide();
		} else {
			$(".md-comment").css('height', "240px");
			$(".md-comment").css('height', $(".md-comment").height()-h+"px");
			$(".banner-content").hide();
		}
	});
	
	
	
	$("#tb-md-content").on('shown.bs.modal', function () {
		//data-binding
		var x = $(TBeventObj).data("json");
		//===================== 
		// 배너 영역
		//=====================
		$(".banner-content").css('visibility', 'hidden').show();
		$("#banner-content-iframe").attr('src', TB.siteUrl+"/renew/banner?shop_no="+TB.shopInfo.shopNo+"&content_no="+x.content_no+"&flatfrom=pc");
	});
});

// popstate 일 때
$(window).on('popstate', function() {
	$("#tb-md-content").modal('hide');
	modalOffEvent();
});




//=========================================================================================
// function
//=========================================================================================

// 해시 태그 검색
function hashTagSearch() {
	var search = $("#inputSch").val();
	search = search.replace("#", "");
	if(search == '') {
		return false;
	} else {
		var url = TB.shopInfo.shopPageUrl+"/explore/"+encodeURI(search);
		location.href = url;
	}
}


// 공유로 넘온 게시물인지 체크
function shareCheck() {
	if(TB.share.share) {
		$.post('/renew/pJson', {instagram_content_address:TB.share.instagram_content_address}, function(r) {
			var d = jQuery.parseJSON(r);
			var obj = $("#tb-feed-picture-clone").clone();
			$(obj).data("json", d.data);
			$(obj).find(".tb-feed-img").attr('src', TB.siteUrl+"/data/instagramImage/"+d.data.content_instagram_userid+"/"+d.data.content_instagram_id+"/standard_resolution.jpg");
			TBeventObj = $(obj);
			//$(TBeventObj).data("json", d.data);
			modalOpenEvent();
		});
	}
}



//===========================
// 코멘트 함수
//===========================
function commentAction() {
	
	var x =$(TBeventObj).data("json");
	var commentText = $("#comment-txt").val();
	if(commentText == '') {
		alert(_LANG_COMMENT_MISSING);
	} else {
		$("#comment-txt").css("background", "#EAEAEA");
		$(".reply-input-button").html('<i class="fa fa-spinner fa-spin fa-1x fa-fw"></i>');
		
		var data = {
						'content_instagram_id':x.content_instagram_id,
						'commentText':commentText
					}
		$.post("/renew/commentAction", data, function(r) {
			var d = jQuery.parseJSON(r);
			if(d.result) {
				$(".comment-old").remove();
			} else {
				$("#alert-modal-text").text(_LANG_NOMORE_COMMEMT);
				$("#alert-modal").modal();
			}
			
			
			setTimeout(function() {
				commentAjax(x);
				$("#comment-txt").val("");
				$("#comment-txt").css("background", "#fff");
				$(".reply-input-button").html(_LANG_COMMENT_WRITE_TITLE);
				commentDisabled = false;
			}, 500);
		});
	}
}


//===========================
// 좋아요 누름 함수
//===========================
function likeAction(obj) {
	likeDisabled = true;
	$btn = $(obj).find("i");
	var x =$(TBeventObj).data("json");
	var curCnt = $("#like-cnt").text();
	curCnt = curCnt.replace(',', '');
	curCnt = Number(curCnt);
	var data = {'content_instagram_id':x.content_instagram_id, 'actionType':null}
	
	if($btn.attr('class').indexOf("fa-like-off") != -1) data.actionType = 'like';
	else data.actionType = 'unlike';
	
	var prevClass = $btn.attr('class');
	
	$btn.attr('class', 'fa fa-spinner fa-spin fa-3x fa-fw fa-custom-size-ing');
	$.post('/renew/likeAction', data, function(r) {
		var d = jQuery.parseJSON(r);
		if(d.result) {
			if(d.type == 'like') {
				$btn.attr('class', "fa fa-heart fa-like-on");
				$("#like-cnt").text((curCnt+1));
			} else {
				$btn.attr('class', "fa fa-heart-o fa-like-off");
				var t = (curCnt-1);
				if(t < 0) $("#like-cnt").text('0'); 
				else $("#like-cnt").text(t);
			}
		} else {
			if(d.type == 'like-over' || d.type == 'unlike-over') {
				$("#alert-modal-text").text(_LANG_NOMORE_LIKE);
				$("#alert-modal").modal();
			} else {
				// system error
			}
			
			$btn.attr('class', prevClass);
		}
		
		likeDisabled = false;
	});
}

//===========================
// 리스트 가져오기
//===========================
function feedListCall() {
	if(listVar.morePage == true && listVar.processing == false) {
		listVar.processing = true;
		$(".loader").show();
		
		var data = {
				'page':listVar.page,
				'flatform':'pc',
				'pageType':TB.pageType,
				'shopInstaUserId':TB.shopInfo.shopInstaUserId,
				'searchWord':TB.searchWord,
				'shopNo':TB.shopInfo.shopNo
		}
		
		$.get("/renew/jsonShopFeedLists", data, function(r) {
			var d = jQuery.parseJSON(r);
			var dataLength = d.data.length;

			for (var i = 0; i < dataLength; i++) {
				var t = d.data[i];
				if(t.content_instagram_video_url != "") {
					var obj = $("#tb-feed-video-clone").clone();
				} else {
					var obj = $("#tb-feed-picture-clone").clone();
				}
				$(obj).attr("id", "");
				// 이미지 셋팅
				$(obj).find(".tb-feed-img").attr('src', TB.siteUrl+"/data/instagramImage/"+t.content_instagram_userid+"/"+t.content_instagram_id+"/standard_resolution.jpg");
				// 링크 셋팅
				var u = getLocation(t.content_instagram_link);
				var instaUrl = (u.pathname.charAt(0) == "/") ? u.pathname : "/" + u.pathname;
				$(obj).find("a").attr('href', TB.siteUrl+"/"+t.content_instagram_username+instaUrl);
				// json 셋팅
				$(obj).data("json", t);
				if(listVar.page == 1 && i < 4) {
					$(obj).appendTo("#tb-feeds-recent").fadeIn(50);
					$(".search_box").fadeIn(50);
				} else {
					$(obj).appendTo("#tb-feeds").fadeIn(300);
					//$(obj).appendTo("#tb-feeds").show();
				}
				
				//=====================
				// 클릭 이벤트 바인딩
				//=====================
				$(obj).bind("click", function(e) {
					e.preventDefault();
					TBeventObj = $(this);
					var linkCheck = $(this).data("json");
					if(linkCheck.content_action_type == 'LINK' && linkCheck.content_action_link != '') {
						var linkActionUrl = TB.SSsite+'/renew/linkActionContentView?link='+encodeURI(linkCheck.content_action_link)+"&content_no="+linkCheck.content_no+"&shop_no="+linkCheck.content_shop_no;
						
						newWindow(linkActionUrl);
						//newWindow(linkCheck.content_action_link);
						return;
					}
					modalOpenEvent();
				});
			}

			
			
			//=====================
			// 클릭 재설정
			//=====================
			if(dataLength < listVar.rows) {
				listVar.morePage = false;
			} else {
				listVar.page++;
			}
			//setTimeout(function() {
				listVar.processing = false;
				if(listVar.page == 1 && dataLength == 0) {
					if(TB.pageType == 'likes') {
						$(".search_box").show();
						$(".empty-content").show();
						$(".loader").hide();
					} else if(TB.pageType == 'views') {
						$(".search_box").show();
						$(".empty-image").attr('src', '/@resources/img/empty_view.png');
						$(".empty-text").text(_LANG_NO_RECENT_FEED_);
						$(".empty-content").show();
						$(".loader").hide();
					} else if(TB.pageType == 'explore'){
						$(".search_box").show();
						$(".empty-image").attr('src', '/@resources/img/empty_tag.png');
						$(".empty-text").html(_LANG_NO_SEARCH_TAG_1+'<b>'+decodeURIComponent(TB.searchWord)+"</b>"+_LANG_NO_SEARCH_TAG_2);
						
						for (var i = 0; i < d.topTagLists.length; i++) {
							var liTag = '';
							if((i+1)%2 == 0) { //파란
								liTag = '<li class="blue"><a href="'+TB.shopInfo.shopPageUrl+'/explore/'+d.topTagLists[i]['tag_text']+'">'+d.topTagLists[i]['tag_text']+'</a></li>';
							} else { // 흰색
								liTag = '<li><a href="'+TB.shopInfo.shopPageUrl+'/explore/'+d.topTagLists[i]['tag_text']+'">'+d.topTagLists[i]['tag_text']+'</a></li>';
							}
							
							$(".popular-tag ul").append(liTag);
						}
						
						$(".popular-tag").show();
						$(".empty-content").show();
						$(".loader").hide();
					} else {
						//$(".loader p").text(_LANG_SHOP_READY);
					}
				} else {
					$(".loader").hide();
				}
			//}, 500);
		});
	}
}



//===========================
//modal open function
//===========================
function modalOpenEvent() {
	$(".tb-products-list").mCustomScrollbar({
		setHeight: '418px',
		theme:"minimal"
	});
	// url change
	window.history.pushState(null, null, $(TBeventObj).find('a').attr('href'));
	
	if(TB.share.share) {
		$(".md-prev").hide();
		$(".md-next").hide();
		TB.share.share = null;
	} else {
		// prev setting
		if($(TBeventObj).prev(".tb-feed").data("json") == undefined) {
			if($(TBeventObj).parent().attr("id") == 'tb-feeds') $(".md-prev").show();
			else $(".md-prev").hide();
		} else {
			$(".md-prev").show();
		}
		
		// next setting
		if($(TBeventObj).next(".tb-feed").data("json") == undefined) {
			
			if($(TBeventObj).parent().attr("id") == 'tb-feeds-recent') {
				if($("#tb-feeds .tb-feed:first-child").data("json") == undefined) $(".md-next").hide();
				else $(".md-next").show();
			} else if(listVar.page == 1) {
				$(".md-next").hide();
			} else {
				feedListCall();
			}
		} else {
			$(".md-next").show();
		}
	}
	
	
	//data-binding
	var x = $(TBeventObj).data("json");
	
	//======================
	// 초기화
	//======================
	$("#comment-txt").val('');
	likeDisabled = true;
	commentDisabled = true;
	// 모달 사이즈 조정
	$(".md-padding").animate({
		height:"520"
	}, 350);
	$(".morecontent-pop").show();
	// 기존 상품 제거
	$(".dynamic-old").remove();
	// info ajax 제거
	abortAjax(infoXhr);
	abortAjax(commentXhr);
	$(".other-logo").hide();
	
	if(videoPlayer != null) videoPlayer.pause();
	
	//======================
	// 비디오 인지 이미지인지 판독
	//======================
	if(x.content_instagram_video_url != "") {
		videoChange(x);
		$("#picture-goods").hide();
		$("#video-goods").show();
	} else {
		$("#goods-image").attr('src', $(TBeventObj).find(".tb-feed-img").attr('src'));
		$("#video-goods").hide();
		$("#picture-goods").show();
	}
	
	$(".banner-content").css('visibility', 'hidden').show();
	
	
	//======================
	// 이미지에 좌표 찍기
	//======================
	var goodsInfoCnt = x.content_info.length
	for (var i = 0; i < goodsInfoCnt; i++) {
		// 이미지 넣기
		var order = x.content_info[i].info_order;
		var itemClone = $("#margin-item").clone();
		$(itemClone).attr("id", "");
		$(itemClone).addClass('dynamic-old');
		$(itemClone).find(".tagged-item-new").text(i+1);
		//$(itemClone).find("a").attr('href', x.content_info[i]['info_link_url']);
		$(itemClone).find("img").attr('src', x.content_info[i]['info_image']);
		$(itemClone).find("span").text(x.content_info[i]['info_desc']);
		if((i+1)%2 == 0) $(itemClone).removeClass("margin-item");
		// stats
		$(itemClone).attr("data-order", order);
		$(itemClone).attr("data-link", x.content_info[i].info_link_url);
		$(itemClone).attr("data-content_instagram_id", x.content_instagram_id);
		
		if(x.content_info[i]['info_image_expose'] == 'TRUE') {
			var x1 = x.content_info[i].info_xpos;var y1 = x.content_info[i].info_ypos;var x2 = x.content_info[i].info_x2pos;var y2 = x.content_info[i].info_y2pos;
			var tagClone = $("#tagged-item-point").clone();
			var lineClone = $("#svg-line").clone();
			if(x2 == '' || y2 == '') { x2 = x1; y2 = y1; }
			x1 = x1 * 418 / 640; y1 = y1 * 418 / 640; x2 = x2 * 418 / 640; y2 = y2 * 418 / 640;
			
			$(lineClone).attr('class', "svg-line dynamic-old");
			$(lineClone).find("line").attr('x1', x1);
			$(lineClone).find("line").attr('y1', y1);
			$(lineClone).find("line").attr('x2', x2);
			$(lineClone).find("line").attr('y2', y2);
			$(lineClone).attr("data-order", order);
			
			$(tagClone).addClass('dynamic-old');
			$(tagClone).text(order);
			$(tagClone).css('left', (x2-12)+"px");
			$(tagClone).css('top', (y2-12)+"px");
			// stats
			$(tagClone).attr("data-order", order);
			$(tagClone).attr("data-link", x.content_info[i].info_link_url);
			$(tagClone).attr("data-content_instagram_id", x.content_instagram_id);
			
			$(lineClone).show().appendTo("#picture-goods");
			$(tagClone).show().appendTo("#picture-goods");
		}
		$(itemClone).show().appendTo(".six-item");
	}
	
	//=======================
	// 이미지 클릭 이벤트 바인딩
	//=======================
	$(document).off('click','.six-item li');
	$(".six-item li").bind("click", function(e) {
		productLinkMove($(this));
	});
	
	//=======================
	// 이미지 마우스 올라갔을 때
	//=======================
	$(document).off('mouseover','.six-item li');
	$(".six-item li").bind('mouseover', function() {
		productMouseOver($(this));
	});
	
	//=======================
	// 이미지 마우스 벋어났을 때
	//=======================
	$(document).off('mouseout','.six-item li');
	$(".six-item li").bind('mouseout', function() {
		productMouseOut($(this));
	});
	
	//=======================
	// 태그 포인트 이벤트 바인딩
	//=======================
	$(document).off('click','.tagged-item-point');
	$(".tagged-item-point").bind("click", function(e) {
		productLinkMove($(this));
	});
	
	
	//=======================
	// 좋아요 여부, 코멘트 개수, 라이크 개수, 확인등
	//=======================
	$("#like-cnt").text("load..");
	$("#reply-cnt").text("load..");
	contentInfoAjax(x);
	
	if(modalObj == null) {
		modalObj = $("#tb-md-content").modal();
	} else {
		$("#banner-content-iframe").attr('src', TB.siteUrl+"/renew/banner?shop_no="+TB.shopInfo.shopNo+"&content_no="+x.content_no+"&flatfrom=pc");
	}
	// modal show
	
	
}


//===========================
// 코멘트 불러오기
//===========================
function commentAjax(x) {
	var data = {
			'content_instagram_id': x.content_instagram_id, 
			'userAccessToken':TB.userInfo.userAccessToken, 
			};
	
	commentXhr = $.post('/renew/jsonComment', data, function(e) {
		var d = jQuery.parseJSON(e);
		if(d.result) {
			d = d.data;
			d = d.reverse();
			var commentLength = d.length;
			for (var i = 0; i < commentLength; i++) {
				var cd = d[i];
				captionMaker(cd, 'comment');
			}
		} else {
			
		}
	});
}


//===========================
// 인스타그램 콘텐츠 체크
//===========================
function contentInfoAjax(x) {
	var data = {
				'content_instagram_id': x.content_instagram_id, 
				'userAccessToken':TB.userInfo.userAccessToken, 
				'content_no':x.content_no,
				'content_like':x.content_like,
				'content_reply':x.content_reply,
				'shopNo':x.content_shop_no
				};
	
	infoXhr = $.post('/renew/jsonInstagramContent', data, function(e) {
		var d = jQuery.parseJSON(e);
		if(d.result) {
			d = d.data;
			// 카운터 업데이트
			$("#like-cnt").text(number_format(d.likeCnt));
			$("#reply-cnt").text(number_format(d.replyCnt));
			
			// 좋아요
			if(d.liked) {
				$(".feed-like-action i").attr('class', "fa fa-heart fa-like-on");
			} else {
				$(".feed-like-action i").attr('class', "fa fa-heart-o fa-like-off");
			}
			
			// 캡션
			if(d.caption != null) {
				captionMaker(d.caption);
			}
			
			// 로고 확인
			if(d.logo != '') $("#content-logo-image").attr('src', d.logo);
			else $("#content-logo-image").attr('src', '/@resources/img/pop-otherlogo.png');
			
			//=======================
			// 콘텐츠를 불러온다음에 코멘트를 호출한다.
			//=======================
			commentAjax(x);
		} else {
			$("#alert-modal-text").text(_LANG_DELETED_FEED_);
			$("#alert-modal").modal();
		}
		likeDisabled = false;
		commentDisabled = false;
	});
}

//===========================
// 캡션 만들기
//===========================
function captionMaker(d, type) {
	var $c = $("#comment-template").clone();
	$c.removeAttr("id");
	if(type == 'comment') $c.addClass("dynamic-old comment-old");
	else $c.addClass("dynamic-old");
	
	$c.find(".re-img img").attr("src", d.from.profile_picture);
	$c.find(".re-txt b").text(d.from.username);
	$c.find(".re-txt a").attr('href', 'https://www.instagram.com/'+d.from.username);
	
	$c.find(".more-retxt-hash").html(injectionTag(injectBr(d.text)));
	
	var snsTime = $.timeago(new Date(d.created_time*1000));
	$c.find(".re-date").text(snsTime);
	if(type == 'comment') {
		$c.appendTo(".comment-area #mCSB_1 #mCSB_1_container").fadeIn(30);
	} else {
		$c.appendTo(".comment-area #mCSB_1 #mCSB_1_container").fadeIn(30);
	}
}


//===========================
// 상품에 마우스 올라갔을때 함수
//===========================
function productMouseOver(obj) {
	var $o = $(".svg-line.dynamic-old[data-order='"+$(obj).data("order")+"']").find("line");
	$o.stop().css({'stroke': lineOverColor, transition: "0.5s"});
	//$(".tagged-item-point.dynamic-old[data-order='"+$(obj).data("order")+"']").css("background-color", lineOverColor);
	$(".tagged-item-point.dynamic-old[data-order='"+$(obj).data("order")+"']").stop().animate({
		"backgroundColor":lineOverColor
	}, 500);
	
}

//===========================
// 마우스 내려갔을 때
//===========================
function productMouseOut(obj) {
	var $o = $(".svg-line.dynamic-old").find("line");
	$o.stop().css({'stroke': lineOriginColor, transition: "0.5s"});
	
	$(".tagged-item-point.dynamic-old").stop().animate({
		"backgroundColor":"rgba(255,255,255,0.7)"
	},500);
}

//===========================
// link move stats
//===========================
function productLinkMove(obj) {
	productLinkStatistics(obj);
	newWindow($(obj).data("link"));
}



//===========================
//modal prev button function
//===========================
function modalPrevEvent() {
	if($(TBeventObj).prev(".tb-feed").data("json") == undefined) {
		TBeventObj = $("#tb-feeds-recent .tb-feed:last-child");
	} else {
		TBeventObj = $(TBeventObj).prev(".tb-feed");
	}
	modalOpenEvent();
	
}

//===========================
//modal next button function
//===========================
function modalNextEvent() {
	
	if($(TBeventObj).next(".tb-feed").data("json") == undefined) {
		if($(TBeventObj).parent().attr("id") == 'tb-feeds-recent') {
			// 최근 글에서 넘어오는 거라면
			if($("#tb-feeds .tb-feed:first-child").data("json") == undefined) {
				
				$("#alert-modal-text").text(_LANG_NO_NEXT_FEED);
				$("#alert-modal").modal();
				return;
			} else {
				TBeventObj = $("#tb-feeds .tb-feed:first-child"); 
			}
		} else {
			
			$("#alert-modal-text").text(_LANG_NO_NEXT_FEED);
			$("#alert-modal").modal();
			return;
		}
		
		
	} else {
		TBeventObj = $(TBeventObj).next(".tb-feed"); 
	}
	
	modalOpenEvent();
}



//===========================
// follow check ajax function
//===========================
function followCheck() {
	if(TB.shopInfo.shopInstaUserId != '' && TB.userInfo.userInstagramUserId != '') {
		if(TB.shopInfo.shopInstaUserId == TB.userInfo.userInstagramUserId) {
			$(".follow").hide();
			return;
		}
	}
	if(TB.shopInfo.isShopPage && TB.userInfo.userAccessToken) {
		$(".insta-follow").prop("disabled", true);
		$.post("/renew/jsonFollowCheck", {shopInstaUserId:TB.shopInfo.shopInstaUserId, userAccessToken:TB.userInfo.userAccessToken}, function(r) {
			var d = jQuery.parseJSON(r);
			if(d.data == 'follow-off') {
				$(".insta-follow").removeClass("follow-off").addClass(d.data).text("+ Follow");
			} else {
				$(".insta-follow").removeClass("follow-off").addClass(d.data).text("Following");
			}
			
			if(d.data == 'follow-off') {
				$(".insta-follow").prop("disabled", false);
			}
		});
	}
}


//===========================
// modal close function
//===========================
function modalOffEvent() {
	//--------------------
	// css reset
	//--------------------
	window.history.pushState("", "", TB.originDomain);
	$(".md-padding").css('height', '520px');
	$(".md-padding").css('padding', '10px 20px 19px 20px');
	$(".md-prev").css('margin-top', '-54px');
	$(".md-next").css('margin-top', '-54px');
	if(videoPlayer != null) videoPlayer.pause();
	modalObj = null;
}

//===========================
// modal more button click event function
//===========================
function modalMoreClickEvent() {
	$(".morecontent-pop").hide();
	$(".md-padding").animate({
		height:"800"
	}, 350);

	//$(".tb-products-list").mCustomScrollbar("destroy");
	//$(".modal-body .md-right").css('height', '570px');
	$(".modal-body .md-right").css('height', '418px');
	$(".other-logo").show();
	if(bannerHeight != 0) $(".banner-content").show().css('visibility', 'visible');
}



function instaFollowEvent() {
	
	if(TB.shopInfo.shopInstaUserId == '') {
		alert('잘못된 접근입니다.');
	}
	
	// 로그인 검사 
	if(TB.userInfo.userAccessToken == '') {
		var redirectUrl = document.location.origin+document.location.pathname;
		var loginUrl = TB.siteUrl+"/accounts?redirectUrl="+encodeURI(redirectUrl)+"&pageType="+TB.pageType+"&flatform=pc";
		location.href = loginUrl;
		return false;
	}
	$(".insta-follow").prop("disabled", true);
	$(".insta-follow").html('<i class="fa fa-spinner fa-spin fa-1x fa-fw margin-bottom"></i>');
	
	$.post("/renew/followingAction", {shopInstaUserId:TB.shopInfo.shopInstaUserId}, function(e) {
		var d = jQuery.parseJSON(e);
		setTimeout(function() {
			// 팔로우일 때
			$(TBeventObj).removeClass("follow-off");
			$(TBeventObj).addClass("follow-on");
			$(TBeventObj).html('Following');
			//$(".insta-follow").prop("disabled", false);
		}, 300);
	});
	/*
	setTimeout(function() {
		// 언 팔로우일 때 
		$(TBeventObj).removeClass("follow-on");
		$(TBeventObj).addClass("follow-off");
		$(TBeventObj).html('+ Follow');
			
	}, 1000);
	*/
}


function share(type) {
	var shareUrl = window.location.href;
	switch (type) {
		case 'link':
			$("#share-link-url").val(shareUrl);
			$("#link-copy-modal").modal();
			break;
		case 'twitter':
			sendSns('twitter', shareUrl, _LANG_SHARE_TITLE);
			break;
		
		
		case 'pinterst':
			
			break;
		
		
		case 'kakaostory':
			shareStory(shareUrl, _LANG_SHARE_TITLE);
			break;
		
		
		case 'facebook':
			sendSns('facebook', shareUrl, _LANG_SHARE_TITLE);
			break;
	}
}





//링크
function sendSns(sns, url, txt)
{
	if(sns == 'facebook') {
		window.open('http://www.facebook.com/sharer/sharer.php?u='+url);
	} else if(sns == 'twitter') {
		window.open('http://twitter.com/intent/tweet?text='+encodeURI(txt)+'&url='+url);
	}
}



//카카오 스토리 공유
function shareStory(url, text) {
	Kakao.Story.share({
		url: url,
		text: text
	});
}





function videoChange(x) {
	videoPlayer.poster($(TBeventObj).find(".tb-feed-img").attr('src'));
	videoPlayer.src({"type":"video/mp4", "src":x.content_instagram_video_url});
}

function getLocation(href) {
    var location = document.createElement("a");
    location.href = href;
    // IE doesn't populate all link properties when setting .href with a relative URL,
    // however .href will return an absolute URL which then can be used on itself
    // to populate these additional fields.
    if (location.host == "") {
      location.href = location.href;
    }
    return location;
};


function newWindow(url) {
	var NW = window.open("about:blank");
	NW.location.href=url;
}

function abortAjax(xhr) {
	if(xhr && xhr.readyState != 4){
		xhr.abort();
	}
}

// br 태그 
function injectBr(caption) {
	return caption.replace(/\r\n|\n|\r/g, '<br/>'); 
}
// 태그 링크
function injectionTag(caption) {
	return caption.replace(/#([A-Za-z0-9가-힣一-龠ぁ-ゔァ-ヴー々〆〤]+)/g, '<a href="'+TB.shopInfo.shopPageUrl+'/explore/$1">#$1</a>');
}


//============================
// 팝업용 함수
//============================
function eventModalCloseForOneDay() {
	var cookieName = TB.shopInfo.shopNo+"popup";
	setCookieOneDay(cookieName, cookieName, 1);
	$("#banner-popup").hide();
}
function checkPoupCookie(cookieName){
	var cookie = document.cookie;
	if(cookie.length > 0) {
		startIndex = cookie.indexOf(cookieName);
	// 존재한다면
		if(startIndex != -1) {
			return true;
		} else {
			// 쿠키 내에 해당 쿠키가 존재하지 않을 경우
			return false;
		}
	} else {
	// 쿠키 자체가 없을 경우
		return false;
	}
}
function setCookieOneDay(name, value, expiredays){
	var todayDate = new Date();
	todayDate.setDate(todayDate.getDate() + expiredays);
	document.cookie = name + "=" + escape( value ) + "; path=/; expires=" + todayDate.toGMTString() + ";"
}

	

//공유더보기 눌렀을때
function openMainShare() {
	$("#main-share").modal();
	$("#main-share").slideDown('slow');
	$(".share_open").show();
}
// 공유더보기 꺼졋을때
$(document).on('hidden.bs.modal', '#main-share', function () {
	$("#main-share").slideUp('slow');
	$("#main-share").modal('hide');
});

// 카카오스토리 공유
function MshareKakaoStory() {
	shareStory(TB.shopInfo.shopPageUrl, _LANG_SHARE_TITLE);
}
// 트위터 공유
function MshareTwitter() {
	sendSns('twitter', TB.shopInfo.shopPageUrl, _LANG_SHARE_TITLE);
}
// 페이스북 공유
function MshareFacebook() {
	sendSns('facebook', TB.shopInfo.shopPageUrl, _LANG_SHARE_TITLE);
}
// 메일 공유
function MshareMail() {
	location.href='mailto:?subject='+_LANG_SHARE_TITLE+"&body="+TB.shopInfo.shopPageUrl;
}
// 링크 공유
function MshareUrl() {
	$("#share-link-url").val(TB.shopInfo.shopPageUrl);
	$("#link-copy-modal").modal();
}



// 샵 더보기 눌렀을때
$("#logo p").click(function() {
	$("#dropdown-more-shop").toggleClass("more-btn-roate-open-ani");
	$("#main-moreShop").modal();
	$(".logo_title").css('z-index', '1050');
	$(".tb-more-shop").css('left', $(this).offset().left);
});

// 샵더보기 꺼졋을때
$(document).on('hidden.bs.modal', '#main-moreShop', function () {
	$("#dropdown-more-shop").toggleClass("more-btn-roate-open-ani");
	$(".logo_title").css('z-index', '0');
});

// 샵 더보기 좌표 조정
$(window).resize(function() {
	$(".tb-more-shop").css('left', $("#logo p").offset().left);
	$(".search_box").css('left', $("#moreSch").offset().left-1230);
	$(".search_box").css('top', $("#moreSch").offset().top-$(document).scrollTop()-22.5);
});

//검색창 눌렀을때
$("#moreSch").click(function() {
	//$('#more-search-modal').on('shown.bs.dropdown', function (e) {
  	//	$(".search_box").css('top', $("#moreSch").offset().top-$(document).scrollTop()-22.5);
	//	$(".search_box").css('left', $("#moreSch").offset().left-1230);
		// $(".search_box").();  		
  		//$(".search_box").dropdown('toggle')
  		// $(".search_box").stop(true, false).animate({'width':'0px','right':'100px'},2000);
  		// $(".search_box").stop(true, false).animate({'width':'1180px','left':'230px'},1000);
  		// $(".search_box").toggle( "slide", {direction: "left" }, 2000 );
  		
	//});
	$('#more-search-modal')
		.prop('class', 'modal fade') // revert to default
        .addClass( $(this).data('direction') );
	$('#more-search-modal').modal('show');
	$(".search_box").css('left', $("#moreSch").offset().left-1230);
	$(".search_box").css('top', $("#moreSch").offset().top-$(document).scrollTop()-22.5);
	$(".moreSch").hide();
	$(".moreSch_close").css('z-index','1050');
});
$(document).on('hidden.bs.modal', '#more-search-modal', function () {
	$(".moreSch_close").css('z-index','0');
	$(".moreSch").show();
	$("#more-search-modal").modal('hide');
});
$(".moreSch_close").click(function() {
	$(".moreSch_close").css('z-index','0');
	$(".moreSch").show();
	$("#more-search-modal").modal('hide');
});






